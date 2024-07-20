#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::prelude::*;
use rusqlite::{params, Connection, NO_PARAMS};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use csv::WriterBuilder;
use tauri::{AppHandle, Manager};

// Data Models
#[derive(Debug, Deserialize, Serialize)]
struct Category {
    id_categoria: i32,
    nombre_categoria: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct Product {
    id_producto: i32,
    nombre_producto: String,
    id_categoria: i32,
    precio_producto: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct BoletaConDetalles {
    id_boleta: i64,
    fecha: String,
    metodo_pago: String,
    total: i32,
    propina: i32,
    tipo_pedido: String,
    numero_mesa: i32,
    detalles: Vec<DetalleBoleta>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct DetalleBoleta {
    id_detalle_boleta: i32,
    id_producto: i32,
    nombre_producto: String,
    cantidad: i32,
    precio_unitario: i32,
}

#[derive(Debug, Serialize, Deserialize)]
struct ClientFiadoData {
    client_id: i32,
    client_name: String,
    debt_id: Option<i32>,
    total_debt: i32,
    amount_paid: i32,
    remaining_debt: i32,
    products: Vec<ProductFiadoData>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProductFiadoData {
    product_id: i32,
    product_name: String,
    product_price: i32,
    quantity: i32,
    transaction_date: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SalesSummary {
    total_ventas: i32,
    total_ventas_efectivo: i32,
    total_ventas_tarjeta: i32,
}

#[derive(Debug, Serialize, Deserialize)]
struct CierreCajaData {
    total_ventas: i32,
    total_efectivo: i32,
    total_tarjeta: i32,
    efectivo_inicial: i32,
    efectivo_final: i32,
    ingresos_efectivo: i32,
    saldo_real: i32,
    diferencia: i32,
    fecha_inicio: String,
    fecha_cierre: String,
    hora_cierre: String,
}

pub struct AppState {
    pub db: std::sync::Mutex<Option<Connection>>,
}

fn initialize_database(app_handle: &AppHandle) -> Result<Connection, rusqlite::Error> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("The app data directory should exist.");
    fs::create_dir_all(&app_dir).expect("The app data directory should be created.");
    let sqlite_path = app_dir.join("register.sqlite");

    println!("Database path: {:?}", sqlite_path);
    let db = Connection::open(sqlite_path)?;
    println!("Database initialized");
    Ok(db)
}

pub fn create_database_schema(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS Categoria (
            id_categoria INTEGER PRIMARY KEY,
            nombre_categoria TEXT
        );

        CREATE TABLE IF NOT EXISTS Productos (
            id_producto INTEGER PRIMARY KEY,
            nombre_producto TEXT,
            precio_producto INTEGER,
            id_categoria INTEGER,
            activo BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
        );

        CREATE TABLE IF NOT EXISTS Clientes_Fiados (
            id_cliente INTEGER PRIMARY KEY,
            nombre_cliente TEXT
        );

        CREATE TABLE IF NOT EXISTS Transacciones_Fiado (
            id_transaccion_fiado INTEGER PRIMARY KEY,
            id_cliente INTEGER,
            fecha_venta INTEGER,
            cantidad INTEGER,
            monto_pendiente INTEGER,
            FOREIGN KEY (id_cliente) REFERENCES Clientes_Fiados(id_cliente)
        );

        CREATE TABLE IF NOT EXISTS Boletas (
            id_boleta INTEGER PRIMARY KEY,
            fecha INTEGER,
            metodo_pago TEXT,
            total INTEGER,
            propina INTEGER,
            tipo_pedido TEXT,
            numero_mesa INTEGER
        );

        CREATE TABLE IF NOT EXISTS Detalle_Boleta (
            id_detalle_boleta INTEGER PRIMARY KEY,
            id_boleta INTEGER,
            id_producto INTEGER,
            cantidad INTEGER,
            precio_unitario INTEGER,
            FOREIGN KEY (id_boleta) REFERENCES Boletas(id_boleta),
            FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
        );

        CREATE TABLE IF NOT EXISTS Mesas (
            id_mesa INTEGER PRIMARY KEY,
            nombre_mesa TEXT
        );

        CREATE TABLE IF NOT EXISTS Transacciones_de_mesa (
            id_transaccion_mesa INTEGER PRIMARY KEY,
            id_mesa INTEGER,
            id_producto INTEGER,
            cantidad INTEGER,
            FOREIGN KEY (id_mesa) REFERENCES Mesas(id_mesa),
            FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
        );
        ",
    )?;

    Ok(())
}


#[tauri::command]
fn add_category(app_handle: AppHandle, nombre: &str) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().unwrap();

    if let Some(conn) = &mut *conn {
        conn.execute(
            "INSERT INTO Categoria (nombre_categoria) VALUES (?)",
            params![nombre],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn update_category(
    app_handle: AppHandle,
    id_categoria: i32,
    nuevo_nombre: String,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        conn.execute(
            "UPDATE Categoria SET nombre_categoria = ? WHERE id_categoria = ?",
            params![nuevo_nombre, id_categoria],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}


#[tauri::command]
fn add_product(
    app_handle: AppHandle,
    nombre: &str,
    id_categoria: i32,
    precio: i32,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().unwrap();

    if let Some(conn) = &mut *conn {
        conn.execute(
            "INSERT INTO Productos (nombre_producto, id_categoria, precio_producto) VALUES (?, ?, ?)",
            params![nombre, id_categoria, precio],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn update_product(
    app_handle: AppHandle,
    id_producto: i32,
    nuevo_nombre: String,
    nueva_categoria: i32,
    nuevo_precio: i32,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        // Verificar si la categoría existe (corregido)
        let categoria_existe: Result<i32, rusqlite::Error> = conn.query_row::<_, _, _>( // Corregido argumentos de tipo
            "SELECT COUNT(*) FROM Categoria WHERE id_categoria = ?",
            [&nueva_categoria], // Convertido en slice
            |row| row.get(0),
        ); 

        // Manejar el resultado de la consulta (corregido)
        if let Ok(count) = categoria_existe {
            if count == 0 {
                return Err("La categoría especificada no existe".to_string());
            }
        } else {
            return Err(categoria_existe.unwrap_err().to_string());
        }

        // Actualizar el producto
        conn.execute(
            "UPDATE Productos SET nombre_producto = ?, id_categoria = ?, precio_producto = ? WHERE id_producto = ?",
            params![nuevo_nombre, nueva_categoria, nuevo_precio, id_producto],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn add_table(app_handle: AppHandle, nombre_mesa: &str) -> Result<i32, String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        conn.execute(
            "INSERT INTO Mesas (nombre_mesa) VALUES (?)",
            params![nombre_mesa],
        )
        .map_err(|e| e.to_string())?;

        let id_cliente = conn.last_insert_rowid() as i32;
        Ok(id_cliente)
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn add_table_transaction(app_handle: AppHandle, table_id: i32, cart: Vec<Product>) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        // Verificar si la mesa existe
        let mesa_existe: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM Mesas WHERE id_mesa = ?)",
            params![table_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

        if !mesa_existe {
            return Err("La mesa especificada no existe".to_string());
        }

        // Insertar los detalles de la transacción directamente (sin transacción principal)
        for product in cart {
            conn.execute(
                "INSERT INTO Transacciones_de_mesa (id_mesa, id_producto, cantidad) VALUES (?, ?, ?)",
                params![table_id, product.id_producto, 1],
            )
            .map_err(|e| e.to_string())?;
        }

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn pay_table_transaction(app_handle: AppHandle, table_id: i32, payment_method: &str, tip: i32) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        // Obtener los detalles de la transacción de mesa
        let mut stmt = conn
            .prepare("SELECT id_producto, cantidad FROM Transacciones_de_mesa WHERE id_mesa = ?")
            .map_err(|e| e.to_string())?;

        let detalles: Vec<(i32, i32)> = stmt
            .query_map([table_id], |row| {
                Ok((row.get(0)?, row.get(1)?))
            })
            .map_err(|e| e.to_string())?
            .map(|res| res.unwrap())
            .collect();

        // Calcular el total de la transacción
        let mut total = 0;
        for (id_producto, cantidad) in &detalles {
            let precio: i32 = conn.query_row(
                "SELECT precio_producto FROM Productos WHERE id_producto = ?",
                params![id_producto],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;
            total += precio * cantidad;
        }

        // Insertar la boleta (tipo "mesa" y número de mesa correspondiente)
        conn.execute(
            "INSERT INTO Boletas (fecha, metodo_pago, total, propina, tipo_pedido, numero_mesa) VALUES (?, ?, ?, ?, 'mesa', ?)",
            params![get_timestamp(), payment_method, total, tip, table_id],
        )
        .map_err(|e| e.to_string())?;

        let boleta_id = conn.last_insert_rowid();

        // Insertar los detalles de la boleta
        for (id_producto, cantidad) in detalles {
            let precio: i32 = conn.query_row(
                "SELECT precio_producto FROM Productos WHERE id_producto = ?",
                params![id_producto],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;
            conn.execute(
                "INSERT INTO Detalle_Boleta (id_boleta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
                params![boleta_id, id_producto, cantidad, precio],
            )
            .map_err(|e| e.to_string())?;
        }

        // Eliminar las transacciones de la mesa
        conn.execute(
            "DELETE FROM Transacciones_de_mesa WHERE id_mesa = ?",
            params![table_id],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}


#[tauri::command]
fn add_client(app_handle: AppHandle, nombre_cliente: &str) -> Result<i32, String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        conn.execute(
            "INSERT INTO Clientes_Fiados (nombre_cliente) VALUES (?)",
            params![nombre_cliente],
        )
        .map_err(|e| e.to_string())?;

        let id_cliente = conn.last_insert_rowid() as i32;
        Ok(id_cliente)
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn update_client(app_handle: AppHandle, client_id: i32, nuevo_nombre: String) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        conn.execute(
            "UPDATE Clientes_Fiados SET nombre_cliente = ? WHERE id_cliente = ?",
            params![nuevo_nombre, client_id],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn add_credit_transaction(
    app_handle: AppHandle,
    cart: Vec<Product>,
    client_id: i64,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        // Calcular el total de la compra
        let total: i32 = calculate_total(&cart);

        // Verificar si el cliente ya tiene una deuda activa
        let mut debt_id: Option<i32> = None;
        let mut monto_total: i32 = 0;
        let result: Result<(i32, i32), rusqlite::Error> = conn.query_row(
            "SELECT id_deuda, monto_total FROM Deudas_Fiado WHERE id_cliente = ?",
            params![client_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        );

        if let Ok((id, total)) = result {
            debt_id = Some(id);
            monto_total = total;
        }

        // Si el cliente no tiene una deuda activa, crear una nueva
        if debt_id.is_none() {
            conn.execute(
                "INSERT INTO Deudas_Fiado (id_cliente, fecha_inicio, monto_total) VALUES (?, ?, ?)",
                params![client_id, get_timestamp(), total],
            )
            .map_err(|e| e.to_string())?;

            debt_id = Some(conn.last_insert_rowid() as i32);
        } else {
            // Si ya tiene una deuda activa, actualizar el monto total
            monto_total += total;
            conn.execute(
                "UPDATE Deudas_Fiado SET monto_total = ? WHERE id_deuda = ?",
                params![monto_total, debt_id.unwrap()],
            )
            .map_err(|e| e.to_string())?;
        }

        // Registrar cada producto en Transacciones_Fiado
        for product in &cart {
            conn.execute(
                "INSERT INTO Transacciones_Fiado (id_deuda, id_producto, cantidad, fecha_venta, precio_unitario) VALUES (?, ?, ?, ?, ?)",
                params![debt_id.unwrap(), product.id_producto, 1, get_timestamp(), product.precio_producto],
            )
            .map_err(|e| e.to_string())?;
        }

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn pay_partial_debt(app_handle: AppHandle, debt_id: i64, amount: i64, payment_method: &str, tip: i64) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        // Obtener la deuda fiada
        let (total_debt, current_paid): (i64, i64) = conn.query_row(
            "SELECT total_venta, monto_pendiente FROM Transacciones_Fiado WHERE id_transaccion_fiado = ?",
            params![debt_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| e.to_string())?;

        let new_paid = current_paid - amount;

        if new_paid <= 0 {
            // Obtener los detalles de la transacción fiada
            let mut stmt = conn
                .prepare("SELECT id_producto, cantidad, precio_unitario FROM Detalle_Transaccion_Fiado WHERE id_transaccion_fiado = ?")
                .map_err(|e| e.to_string())?;

            let detalles: Vec<(i64, i64, i64)> = stmt
                .query_map([debt_id], |row| {
                    Ok((row.get(0)?, row.get(1)?, row.get(2)?))
                })
                .map_err(|e| e.to_string())?
                .map(|res| res.unwrap())
                .collect();

            // Insertar la boleta, 'llevar' es el tipo de pedido por defecto, 0 es el número de mesa por defecto.
            conn.execute(
                "INSERT INTO Boletas (fecha, metodo_pago, total, propina, tipo_pedido, numero_mesa) VALUES (?, ?, ?, ?, 'llevar', 0)",
                params![get_timestamp(), payment_method, total_debt, tip],
            )
            .map_err(|e| e.to_string())?;

            let boleta_id = conn.last_insert_rowid();

            // Insertar los detalles de la boleta
            for (id_producto, cantidad, precio_unitario) in detalles {
                conn.execute(
                    "INSERT INTO Detalle_Boleta (id_boleta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
                    params![boleta_id, id_producto, cantidad, precio_unitario],
                )
                .map_err(|e| e.to_string())?;
            }

            // Eliminar la transacción fiada y sus detalles
            conn.execute(
                "DELETE FROM Detalle_Transaccion_Fiado WHERE id_transaccion_fiado = ?",
                params![debt_id],
            )
            .map_err(|e| e.to_string())?;

            conn.execute(
                "DELETE FROM Transacciones_Fiado WHERE id_transaccion_fiado = ?",
                params![debt_id],
            )
            .map_err(|e| e.to_string())?;

        } else {
            // Actualizar el monto pendiente si no se ha pagado la deuda completa
            conn.execute(
                "UPDATE Transacciones_Fiado SET monto_pendiente = ? WHERE id_transaccion_fiado = ?",
                params![new_paid, debt_id],
            )
            .map_err(|e| e.to_string())?;
        }

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}


#[tauri::command]
fn add_check(
    app_handle: AppHandle,
    cart: Vec<Product>,
    payment_method: &str,
    tip: i64,
    table_id: i64,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        // Calcular el total de la compra
        let total = calculate_total(&cart);

        // Determinar el tipo de pedido (0 para llevar, cualquier otro valor para mesa)
        let tipo_pedido = if table_id == 0 { "llevar" } else { "mesa" };

        // Insertar la boleta
        conn.execute(
            "INSERT INTO Boletas (fecha, metodo_pago, total, propina, tipo_pedido, numero_mesa) VALUES (?, ?, ?, ?, ?, ?)",
            params![get_timestamp(), payment_method, total, tip, tipo_pedido, table_id],
        )
        .map_err(|e| e.to_string())?;

        let boleta_id = conn.last_insert_rowid();

        let mut product_quantities = HashMap::new();
        for product in &cart {
            *product_quantities.entry(product.id_producto).or_insert(0) += 1;
        }

        // Clonar el HashMap antes de usarlo en el primer bucle
        let product_quantities_clone = product_quantities.clone();

        for (product_id, quantity) in product_quantities {
            let product = cart.iter().find(|p| p.id_producto == product_id).unwrap();
            conn.execute(
                "INSERT INTO Detalle_Boleta (id_boleta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
                params![boleta_id, product_id, quantity, product.precio_producto],
            )
            .map_err(|e| e.to_string())?;
        }

        // Si es una transacción en mesa (table_id != 0), registrar en Transacciones_de_mesa
        if table_id != 0 {
            for (product_id, quantity) in product_quantities_clone { // Usar el clon aquí
                conn.execute(
                    "INSERT INTO Transacciones_de_mesa (id_mesa, id_producto, cantidad) VALUES (?, ?, ?)",
                    params![table_id, product_id, quantity],
                )
                .map_err(|e| e.to_string())?;
            }
        }

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn get_products(app_handle: AppHandle) -> Result<Vec<Product>, String> {
    let state = app_handle.state::<AppState>();
    let conn = state.db.lock().unwrap();

    if let Some(conn) = &*conn {
        let mut stmt = conn
            .prepare(
                "SELECT id_producto, nombre_producto, id_categoria, precio_producto FROM Productos",
            )
            .map_err(|e| e.to_string())?;

        let products_iter = stmt
            .query_map(NO_PARAMS, |row| {
                Ok(Product {
                    id_producto: row.get(0)?,
                    nombre_producto: row.get(1)?,
                    id_categoria: row.get(2)?,
                    precio_producto: row.get(3)?,
                })
            })
            .map_err(|e| e.to_string())?;

        // Recolecta los resultados en un Vec<Product>
        let products: Vec<Product> = products_iter.map(|row| row.unwrap()).collect(); // Maneja el error aquí
        Ok(products)
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn get_categories(app_handle: AppHandle) -> Result<Vec<Category>, String> {
    let state = app_handle.state::<AppState>();
    let conn = state.db.lock().unwrap();

    if let Some(conn) = &*conn {
        let mut stmt = conn
            .prepare("SELECT id_categoria, nombre_categoria FROM Categoria")
            .map_err(|e| e.to_string())?;

        let categories = stmt
            .query_map(NO_PARAMS, |row| {
                Ok(Category {
                    id_categoria: row.get(0)?,
                    nombre_categoria: row.get(1)?,
                })
            })
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<Category>, _>>()
            .map_err(|e| e.to_string())?;

        Ok(categories)
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn get_checks(
    app_handle: AppHandle,
    page: i32,
    page_size: i32,
) -> Result<Vec<BoletaConDetalles>, String> {
    let state = app_handle.state::<AppState>();
    let conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        let offset = (page - 1) * page_size;
        let query = "
            SELECT 
                B.id_boleta, 
                B.fecha, 
                B.metodo_pago, 
                B.total,
                B.propina, 
                B.tipo_pedido, 
                B.numero_mesa, 
                DB.id_detalle_boleta,
                DB.id_producto,
                P.nombre_producto,
                DB.cantidad,
                DB.precio_unitario
            FROM (
                SELECT *
                FROM Boletas
                ORDER BY id_boleta DESC
                LIMIT ? OFFSET ?
            ) AS B
            LEFT JOIN Detalle_Boleta AS DB ON B.id_boleta = DB.id_boleta
            LEFT JOIN Productos AS P ON DB.id_producto = P.id_producto;
        ";

        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let mut boletas_map: std::collections::HashMap<i64, BoletaConDetalles> = std::collections::HashMap::new();

        let boletas_iter = stmt
            .query_map([page_size, offset], |row| {
                let id_boleta: i64 = row.get(0)?;
                let boleta = boletas_map
                    .entry(id_boleta)
                    .or_insert_with(|| BoletaConDetalles {
                        id_boleta,
                        fecha: row.get(1).expect("fecha"),
                        metodo_pago: row.get(2).expect("metodo_pago"),
                        total: row.get(3).expect("total"),
                        propina: row.get(4).expect("propina"),
                        tipo_pedido: row.get(5).expect("tipo_pedido"),
                        numero_mesa: row.get(6).expect("numero_mesa"),
                        detalles: Vec::new(),
                    });

                if let Some(id_detalle_boleta) = row.get::<_, Option<i32>>(7)? { // Corregido el índice a 7
                    boleta.detalles.push(DetalleBoleta {
                        id_detalle_boleta,
                        id_producto: row.get(8)?, // Corregido el índice a 8
                        nombre_producto: row.get(9)?, // Corregido el índice a 9
                        cantidad: row.get(10)?, // Corregido el índice a 10
                        precio_unitario: row.get(11)?, // Corregido el índice a 11
                    });
                }

                Ok(())
            })
            .map_err(|e| e.to_string())?;

        // Recolectar los resultados en un vector de BoletaConDetalles
        for result in boletas_iter {
            result.map_err(|e| e.to_string())?;
        }

        let boletas: Vec<BoletaConDetalles> = boletas_map.into_iter().map(|(_, boleta)| boleta).collect();

        Ok(boletas)
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}


#[tauri::command]
fn get_total_checks_count(app_handle: AppHandle) -> Result<i32, String> {
    let state = app_handle.state::<AppState>();
    let conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        let mut stmt = conn
            .prepare("SELECT COUNT(*) FROM Boletas")
            .map_err(|e| e.to_string())?;
        let count: i32 = stmt
            .query_row(NO_PARAMS, |row| row.get(0))
            .map_err(|e| e.to_string())?;
        Ok(count)
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn get_fiado_data(
    app_handle: AppHandle,
    page: i32,
    page_size: i32,
) -> Result<Vec<ClientFiadoData>, String> {
    let state = app_handle.state::<AppState>();
    let conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        let offset = (page - 1) * page_size;
        let query = "
            SELECT
                cf.id_cliente,
                cf.nombre_cliente,
                df.id_deuda,
                df.monto_total,
                df.monto_pagado,
                tf.id_producto,
                p.nombre_producto,
                tf.precio_unitario,
                tf.cantidad,
                tf.fecha_venta
            FROM (
                SELECT *
                FROM Clientes_Fiados
                LIMIT ? OFFSET ?
            ) AS cf
            LEFT JOIN Deudas_Fiado df ON cf.id_cliente = df.id_cliente
            LEFT JOIN Transacciones_Fiado tf ON df.id_deuda = tf.id_deuda
            LEFT JOIN Productos p ON tf.id_producto = p.id_producto
            ORDER BY cf.id_cliente ASC, tf.fecha_venta DESC; 
        ";

        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let mut fiado_data_map: HashMap<i32, ClientFiadoData> = HashMap::new();

        let rows = stmt
            .query_map([page_size, offset], |row| {
                let client_id: i32 = row.get(0)?;
                let client_name: String = row.get(1)?;
                let debt_id: Option<i32> = row.get(2)?;
                let total_debt: i32 = row.get(3).unwrap_or(0);
                let amount_paid: i32 = row.get(4).unwrap_or(0);
                let product_id: Option<i32> = row.get(5)?;
                let product_name: Option<String> = row.get(6)?;
                let product_price: Option<i32> = row.get(7)?;
                let quantity: Option<i32> = row.get(8)?;
                let transaction_date: Option<String> = row.get(9)?;

                let remaining_debt = total_debt - amount_paid;

                fiado_data_map
                    .entry(client_id)
                    .or_insert_with(|| ClientFiadoData {
                        client_id,
                        client_name: client_name.clone(),
                        debt_id,
                        total_debt,
                        amount_paid,
                        remaining_debt,
                        products: vec![],
                    })
                    .products
                    .push(ProductFiadoData {
                        product_id: product_id.unwrap_or(0),
                        product_name: product_name.unwrap_or_default(),
                        product_price: product_price.unwrap_or(0),
                        quantity: quantity.unwrap_or(0),
                        transaction_date: transaction_date.unwrap_or_default(),
                    });

                Ok(())
            })
            .map_err(|e| e.to_string())?;

        // Consumir el iterador para ejecutar la consulta
        for _ in rows {}

        // Convertir el HashMap en un Vec
        let fiado_data: Vec<ClientFiadoData> = fiado_data_map.into_values().collect();

        Ok(fiado_data)
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn get_clientes_fiados_count(app_handle: AppHandle) -> Result<i32, String> {
    let state = app_handle.state::<AppState>();
    let conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        let mut stmt = conn
            .prepare("SELECT COUNT(*) FROM Clientes_Fiados")
            .map_err(|e| e.to_string())?;
        let count: i32 = stmt
            .query_row(NO_PARAMS, |row| row.get(0))
            .map_err(|e| e.to_string())?;
        Ok(count)
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn get_sales_summary(app_handle: AppHandle) -> Result<SalesSummary, String> {
    let state = app_handle.state::<AppState>();
    let conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        // Obtener la fecha actual en el formato deseado
        let fecha_actual = get_timestamp();
        let fecha_actual = fecha_actual.split_whitespace().next().unwrap(); // Extraer solo la fecha

        // Preparar consultas SQL con la fecha actual como parámetro
        let mut total_ventas_stmt = conn
            .prepare("SELECT SUM(total) FROM Boletas WHERE SUBSTR(fecha, 7, 2) || SUBSTR(fecha, 4, 2) || SUBSTR(fecha, 1, 2) = ?")
            .map_err(|e| e.to_string())?;
        let mut total_ventas_efectivo_stmt = conn
            .prepare("SELECT SUM(total) FROM Boletas WHERE SUBSTR(fecha, 7, 2) || SUBSTR(fecha, 4, 2) || SUBSTR(fecha, 1, 2) = ? AND metodo_pago = 'efectivo'")
            .map_err(|e| e.to_string())?;
        let mut total_ventas_tarjeta_stmt = conn
            .prepare("SELECT SUM(total) FROM Boletas WHERE SUBSTR(fecha, 7, 2) || SUBSTR(fecha, 4, 2) || SUBSTR(fecha, 1, 2) = ? AND metodo_pago = 'tarjeta'")
            .map_err(|e| e.to_string())?;

        // Extraer la fecha en formato 'yymmdd' desde fecha_actual
        let fecha_formateada = format!("{}{}{}", &fecha_actual[6..8], &fecha_actual[3..5], &fecha_actual[0..2]);

        let total_ventas: i32 = total_ventas_stmt.query_row([fecha_formateada.clone()], |row| row.get(0)).unwrap_or(0);
        let total_ventas_efectivo: i32 = total_ventas_efectivo_stmt.query_row([fecha_formateada.clone()], |row| row.get(0)).unwrap_or(0);
        let total_ventas_tarjeta: i32 = total_ventas_tarjeta_stmt.query_row([fecha_formateada], |row| row.get(0)).unwrap_or(0);

        Ok(SalesSummary {
            total_ventas,
            total_ventas_efectivo,
            total_ventas_tarjeta,
        })
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}


#[tauri::command]
fn delete_category(app_handle: AppHandle, category_id: i32) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        // Eliminar productos asociados a la categoría
        conn.execute(
            "DELETE FROM Productos WHERE id_categoria = ?",
            params![category_id],
        )
        .map_err(|e| e.to_string())?;

        // Eliminar la categoría
        conn.execute(
            "DELETE FROM Categoria WHERE id_categoria = ?",
            params![category_id],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn delete_product(app_handle: AppHandle, product_id: i32) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        conn.execute(
            "DELETE FROM Productos WHERE id_producto = ?",
            params![product_id],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn generate_final_report(
    app_handle: AppHandle,
    csv_path: &str,
    cierre_caja_data: CierreCajaData,
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        let fecha_actual = get_timestamp();
        let fecha_actual = fecha_actual.split_whitespace().next().unwrap();

        // Consulta SQL para obtener boletas y detalles de la fecha actual
        let query = "
            SELECT 
                B.id_boleta, 
                B.fecha, 
                B.metodo_pago, 
                B.total,
                B.propina, 
                B.tipo_pedido, 
                B.numero_mesa,
                DB.id_detalle_boleta,
                DB.id_producto,
                P.nombre_producto,
                DB.cantidad,
                DB.precio_unitario
            FROM Boletas AS B
            LEFT JOIN Detalle_Boleta AS DB ON B.id_boleta = DB.id_boleta
            LEFT JOIN Productos AS P ON DB.id_producto = P.id_producto
            WHERE B.fecha = ?;
        ";

        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        // Mapeo de resultados a BoletaConDetalles
        let mut boletas_map: HashMap<i64, BoletaConDetalles> = HashMap::new();
        let boletas_iter = stmt.query_map([fecha_actual], |row| {
            let id_boleta: i64 = row.get(0)?;
            let boleta = boletas_map.entry(id_boleta).or_insert_with(|| BoletaConDetalles {
                id_boleta,
                fecha: row.get(1).expect("fecha"),
                metodo_pago: row.get(2).expect("metodo_pago"),
                total: row.get(3).expect("total"),
                propina: row.get(4).expect("propina"),
                tipo_pedido: row.get(5).expect("tipo_pedido"),
                numero_mesa: row.get(6).expect("numero_mesa"),
                detalles: Vec::new(),
            });

            if let Some(id_detalle_boleta) = row.get::<_, Option<i32>>(7)? {
                boleta.detalles.push(DetalleBoleta {
                    id_detalle_boleta,
                    id_producto: row.get(8)?,
                    nombre_producto: row.get(9)?,
                    cantidad: row.get(10)?,
                    precio_unitario: row.get(11)?,
                });
            }

            Ok(())
        }).map_err(|e| e.to_string())?;

        // Consumir el iterador para ejecutar la consulta
        for _ in boletas_iter {}

        let boletas: Vec<BoletaConDetalles> = boletas_map.into_values().collect();

        let mut writer = WriterBuilder::new()
            .delimiter(b';')
            .from_path(csv_path)
            .map_err(|e| e.to_string())?;

        // Escribir encabezados del CSV
        writer.write_record(&[
            "ID Boleta", "Fecha", "Metodo de Pago", "Total", "Propina", "Tipo Pedido", "Número Mesa", 
            "ID Detalle", "ID Producto", "Nombre Producto", "Cantidad", "Precio Unitario"
        ]).map_err(|e| e.to_string())?;

        // Escribir detalles de las boletas
        for boleta in boletas {
            for detalle in boleta.detalles {
                writer.write_record(&[
                    boleta.id_boleta.to_string(),
                    boleta.fecha.clone(),
                    boleta.metodo_pago.clone(),
                    boleta.total.to_string(),
                    boleta.propina.to_string(),
                    boleta.tipo_pedido.clone(),
                    boleta.numero_mesa.to_string(),
                    detalle.id_detalle_boleta.to_string(),
                    detalle.id_producto.to_string(),
                    detalle.nombre_producto.clone(),
                    detalle.cantidad.to_string(),
                    detalle.precio_unitario.to_string(),
                ]).map_err(|e| e.to_string())?;
            }
        }

        // Escribir el resumen del cierre de caja
        writer.write_record(&[
            "Resumen Cierre de Caja", "", "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Total Ventas:", cierre_caja_data.total_ventas.to_string().as_str(), "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Total Efectivo:", cierre_caja_data.total_efectivo.to_string().as_str(), "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Total Tarjeta:", cierre_caja_data.total_tarjeta.to_string().as_str(), "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Efectivo Inicial:", cierre_caja_data.efectivo_inicial.to_string().as_str(), "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Efectivo Final:", cierre_caja_data.efectivo_final.to_string().as_str(), "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Ingresos Efectivo:", cierre_caja_data.ingresos_efectivo.to_string().as_str(), "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Saldo Real:", cierre_caja_data.saldo_real.to_string().as_str(), "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Diferencia:", cierre_caja_data.diferencia.to_string().as_str(), "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Fecha Inicio:", &cierre_caja_data.fecha_inicio, "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Fecha Cierre:", &cierre_caja_data.fecha_cierre, "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;
        writer.write_record(&[
            "Hora Cierre:", &cierre_caja_data.hora_cierre, "", "", "", "", "", "", ""
        ]).map_err(|e| e.to_string())?;

        writer.flush().map_err(|e| e.to_string())?;

        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}


fn calculate_total(cart: &[Product]) -> i32 {
    cart.iter().map(|item| item.precio_producto).sum()
}

fn get_timestamp() -> String {
    let now = Local::now();
    now.format("%d/%m/%y %H:%M:%S").to_string()
}

#[tauri::command]
fn send_timestamp() -> Result<String, String> {
    Ok(get_timestamp())
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            db: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            add_category,
            update_category,
            add_product,
            update_product,
            add_table,
            add_table_transaction,
            pay_table_transaction,
            add_client,
            update_client,
            add_credit_transaction,
            pay_partial_debt,
            add_check,
            get_products,
            get_categories,
            get_checks,
            get_total_checks_count,
            get_fiado_data,
            get_clientes_fiados_count,
            get_sales_summary,
            delete_category,
            delete_product,
            generate_final_report,
            send_timestamp
        ])
        .setup(|app| {
            let handle = app.handle();
            let db = initialize_database(&handle).expect("Database initialize should succeed");
            create_database_schema(&db).expect("Database schema creation should succeed");
            {
                let state = handle.state::<AppState>();
                let mut state_db = state.db.lock().unwrap();
                *state_db = Some(db);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
