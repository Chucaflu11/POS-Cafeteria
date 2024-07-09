#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::prelude::*;
use rusqlite::{params, Connection, NO_PARAMS};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
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
    id_boleta: i32,
    fecha: String,
    metodo_pago: String,
    total: i32,
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
            id_categoria INTEGER,
            precio_producto INTEGER,
            FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
        );

        CREATE TABLE IF NOT EXISTS Clientes_Fiados (
            id_cliente INTEGER PRIMARY KEY,
            nombre_cliente TEXT
        );

        CREATE TABLE IF NOT EXISTS Deudas_Fiado (
            id_deuda INTEGER PRIMARY KEY,
            id_cliente INTEGER,
            fecha_inicio TEXT,
            monto_total INTEGER,
            monto_pagado INTEGER DEFAULT 0, -- Nuevo campo para el monto pagado
            FOREIGN KEY (id_cliente) REFERENCES Clientes_Fiados(id_cliente)
        );

        CREATE TABLE IF NOT EXISTS Transacciones_Fiado (
            id_transaccion_fiado INTEGER PRIMARY KEY,
            id_deuda INTEGER,
            id_producto INTEGER,
            cantidad INTEGER,
            fecha_venta TEXT,
            precio_unitario INTEGER, -- Nuevo campo para el precio unitario del producto en el momento de la transacción
            FOREIGN KEY (id_deuda) REFERENCES Deudas_Fiado(id_deuda),
            FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
        );

        CREATE TABLE IF NOT EXISTS Boletas (
            id_boleta INTEGER PRIMARY KEY,
            fecha TEXT,
            metodo_pago TEXT,
            total INTEGER
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

        ",
    )?;

    println!("Database schema created");

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
fn pay_partial_debt(app_handle: AppHandle, debt_id: i64, amount: i64, payment_method: &str) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        let (total_debt, current_paid): (i64, i64) = conn.query_row(
            "SELECT monto_total, monto_pagado FROM Deudas_Fiado WHERE id_deuda = ?",
            params![debt_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| e.to_string())?;

        let new_paid = current_paid + amount;

        if new_paid >= total_debt {
            // Obtener las transacciones de la deuda
            let mut stmt = conn
                .prepare("SELECT id_producto, cantidad, precio_unitario FROM Transacciones_Fiado WHERE id_deuda = ?")
                .map_err(|e| e.to_string())?;

            let transacciones: Vec<Product> = stmt
                .query_map([debt_id], |row| {
                    Ok(Product {
                        id_producto: row.get(0)?,
                        nombre_producto: String::new(),
                        id_categoria: 0,
                        precio_producto: row.get(2)?,
                    })
                })
                .map_err(|e| e.to_string())?
                .map(|res| res.unwrap())
                .collect();

            // Calcular las cantidades de cada producto en la deuda
            let mut product_quantities = HashMap::new();
            for product in &transacciones {
                *product_quantities.entry(product.id_producto).or_insert(0) += 1;
            }

            // Convertir el HashMap en un vector de structs Product
            let cart: Result<Vec<Product>, String> = product_quantities
                .iter()
                .map(|(id_producto, _cantidad)| {
                    // Buscar el producto en la tabla Productos
                    conn.query_row(
                        "SELECT id_producto, nombre_producto, id_categoria, precio_producto FROM Productos WHERE id_producto = ?",
                        params![id_producto],
                        |row| {
                            Ok(Product {
                                id_producto: row.get(0)?,
                                nombre_producto: row.get(1)?,
                                id_categoria: row.get(2)?,
                                precio_producto: row.get(3)?,
                            })
                        },
                    ).map_err(|e| e.to_string())
                })
                .collect();

            let cart = cart?; // Desenvolver el Result y propagar el error

            // Calcular el total de la compra
            let total = calculate_total(&cart);

            // Insertar la boleta
            conn.execute(
                "INSERT INTO Boletas (fecha, metodo_pago, total) VALUES (?, ?, ?)",
                params![get_timestamp(), payment_method, total],
            )
            .map_err(|e| e.to_string())?;

            let boleta_id = conn.last_insert_rowid();

            // Insertar los detalles de la boleta
            for product in cart {
                conn.execute(
                    "INSERT INTO Detalle_Boleta (id_boleta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
                    params![boleta_id, product.id_producto, *product_quantities.get(&product.id_producto).unwrap(), product.precio_producto],
                )
                .map_err(|e| e.to_string())?;
            }

            // Eliminar las transacciones de la deuda
            conn.execute(
                "DELETE FROM Transacciones_Fiado WHERE id_deuda = ?",
                params![debt_id],
            )
            .map_err(|e| e.to_string())?;

            // Eliminar la deuda fiada
            conn.execute(
                "DELETE FROM Deudas_Fiado WHERE id_deuda = ?",
                params![debt_id],
            )
            .map_err(|e| e.to_string())?;
        } else {
            // Actualizar el monto pagado si no se ha pagado la deuda completa
            conn.execute(
                "UPDATE Deudas_Fiado SET monto_pagado = ? WHERE id_deuda = ?",
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
) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &mut *conn {
        // Calcular el total de la compra
        let total = calculate_total(&cart);

        // Insertar la boleta
        conn.execute(
            "INSERT INTO Boletas (fecha, metodo_pago, total) VALUES (?, ?, ?)",
            params![get_timestamp(), payment_method, total],
        )
        .map_err(|e| e.to_string())?;

        let boleta_id = conn.last_insert_rowid();

        let mut product_quantities = HashMap::new();
        for product in &cart {
            *product_quantities.entry(product.id_producto).or_insert(0) += 1;
        }

        for (product_id, quantity) in product_quantities {
            let product = cart.iter().find(|p| p.id_producto == product_id).unwrap();
            conn.execute(
                "INSERT INTO Detalle_Boleta (id_boleta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
                params![boleta_id, product_id, quantity, product.precio_producto],
            )
            .map_err(|e| e.to_string())?;
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
    let conn = state
        .db
        .lock()
        .expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        let offset = (page - 1) * page_size;
        let query = "
            SELECT 
                B.id_boleta, 
                B.fecha, 
                B.metodo_pago, 
                B.total,
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

        let mut boletas_map: std::collections::HashMap<i32, BoletaConDetalles> =
            std::collections::HashMap::new();

        let boletas_iter = stmt
            .query_map([page_size, offset], |row| {
                let id_boleta: i32 = row.get(0)?;
                let boleta = boletas_map
                    .entry(id_boleta)
                    .or_insert_with(|| BoletaConDetalles {
                        id_boleta,
                        fecha: row.get(1).expect("fecha"),
                        metodo_pago: row.get(2).expect("metodo_pago"),
                        total: row.get(3).expect("total"),
                        detalles: Vec::new(),
                    });

                if let Some(id_detalle_boleta) = row.get::<_, Option<i32>>(4)? {
                    boleta.detalles.push(DetalleBoleta {
                        id_detalle_boleta,
                        id_producto: row.get(5)?,
                        nombre_producto: row.get(6)?,
                        cantidad: row.get(7)?,
                        precio_unitario: row.get(8)?,
                    });
                }

                Ok(())
            })
            .map_err(|e| e.to_string())?;

        // Collect the results into a vector of BoletaConDetalles
        for result in boletas_iter {
            result.map_err(|e| e.to_string())?;
        }

        let boletas: Vec<BoletaConDetalles> =
            boletas_map.into_iter().map(|(_, boleta)| boleta).collect();

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

fn calculate_total(cart: &[Product]) -> i32 {
    cart.iter().map(|item| item.precio_producto).sum()
}

fn get_timestamp() -> String {
    let now = Local::now();
    now.format("%d/%m/%y %H:%M:%S").to_string()
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            db: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            add_category,
            add_product,
            add_client,
            add_credit_transaction,
            pay_partial_debt,
            add_check,
            get_products,
            get_categories,
            get_checks,
            get_total_checks_count,
            get_fiado_data,
            get_clientes_fiados_count,
            delete_category,
            delete_product,
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
