#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection, NO_PARAMS};
use serde::{Deserialize, Serialize};
use std::fs;
use std::collections::HashMap;
use chrono::prelude::*;
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

#[derive(Debug, Deserialize, Serialize)]
struct Topping {
    id_agregado: i32,
    nombre_agregado: String,
    costo_agregado: i32,
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
    id_agregado: Option<i32>,
    nombre_agregado: Option<String>,
    costo_agregado: Option<i32>,
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

        CREATE TABLE IF NOT EXISTS Agregados (
            id_agregado INTEGER PRIMARY KEY,
            nombre_agregado TEXT,
            costo_agregado INTEGER
        );

        CREATE TABLE IF NOT EXISTS Producto_Agregado (
            id_producto INTEGER,
            id_agregado INTEGER,
            PRIMARY KEY (id_producto, id_agregado),
            FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
            FOREIGN KEY (id_agregado) REFERENCES Agregados(id_agregado)
        );

        CREATE TABLE IF NOT EXISTS Clientes_Fiados (
            id_cliente INTEGER PRIMARY KEY,
            nombre_cliente TEXT
        );

        CREATE TABLE IF NOT EXISTS Transacciones_Fiado (
            id_transaccion_fiado INTEGER PRIMARY KEY,
            id_cliente INTEGER,
            id_producto INTEGER,
            cantidad INTEGER,
            fecha_venta TEXT,
            monto_pendiente INTEGER,
            FOREIGN KEY (id_cliente) REFERENCES Clientes_Fiados(id_cliente),
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
            id_agregado INTEGER REFERENCES Agregados(id_agregado),
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
fn add_client(app_handle: AppHandle, nombre: &str) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().unwrap();

    if let Some(conn) = &mut *conn {
        conn.execute(
            "INSERT INTO Clientes_Fiados (nombre_cliente) VALUES (?)",
            params![nombre],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn add_topping(app_handle: AppHandle, nombre: &str, costo: i32) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().unwrap();

    if let Some(conn) = &mut *conn {
        conn.execute(
            "INSERT INTO Agregados (nombre_agregado, costo_agregado) VALUES (?, ?)",
            params![nombre, costo],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn add_check(app_handle: AppHandle, cart: Vec<Product>, payment_method: &str) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let mut conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

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
        let mut stmt = conn.prepare("SELECT id_producto, nombre_producto, id_categoria, precio_producto FROM Productos")
            .map_err(|e| e.to_string())?;

        let products_iter = stmt.query_map(NO_PARAMS, |row| {
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
fn get_toppings(app_handle: AppHandle) -> Result<Vec<Topping>, String> {
    let state = app_handle.state::<AppState>();
    let conn = state.db.lock().unwrap();

    if let Some(conn) = &*conn {
        let mut stmt = conn
            .prepare("SELECT id_agregado, nombre_agregado, costo_agregado FROM Agregados")
            .map_err(|e| e.to_string())?;

        let toppings = stmt
            .query_map(NO_PARAMS, |row| {
                Ok(Topping {
                    id_agregado: row.get(0)?,
                    nombre_agregado: row.get(1)?,
                    costo_agregado: row.get(2)?,
                })
            })
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<Topping>, _>>()
            .map_err(|e| e.to_string())?;

        Ok(toppings)
    } else {
        Err("No se pudo obtener la conexión a la base de datos".to_string())
    }
}

#[tauri::command]
fn get_checks(app_handle: AppHandle, page: i32, page_size: i32) -> Result<Vec<BoletaConDetalles>, String> {
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
                DB.id_detalle_boleta,
                DB.id_producto,
                P.nombre_producto,
                DB.cantidad,
                DB.precio_unitario,
                DB.id_agregado,
                A.nombre_agregado,
                A.costo_agregado
            FROM (
                SELECT *
                FROM Boletas
                ORDER BY id_boleta DESC
                LIMIT ? OFFSET ?
            ) AS B
            LEFT JOIN Detalle_Boleta AS DB ON B.id_boleta = DB.id_boleta
            LEFT JOIN Productos AS P ON DB.id_producto = P.id_producto
            LEFT JOIN Agregados AS A ON DB.id_agregado = A.id_agregado;
        ";

        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let mut boletas_map: std::collections::HashMap<i32, BoletaConDetalles> = std::collections::HashMap::new();
        
        let boletas_iter = stmt.query_map([page_size, offset], |row| {
            let id_boleta: i32 = row.get(0)?;
            let boleta = boletas_map.entry(id_boleta).or_insert_with(|| BoletaConDetalles {
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
                    id_agregado: row.get(9)?,
                    nombre_agregado: row.get(10)?,
                    costo_agregado: row.get(11)?,
                });
            }

            Ok(())
        })
        .map_err(|e| e.to_string())?;

        // Collect the results into a vector of BoletaConDetalles
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
fn delete_category(app_handle: AppHandle, category_id: i32) -> Result<(), String> {
    let state = app_handle.state::<AppState>();
    let conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

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
    let conn = state.db.lock().expect("Error al obtener el bloqueo de la base de datos");

    if let Some(conn) = &*conn {
        // Eliminar relaciones en Producto_Agregado (si es necesario)
        conn.execute(
            "DELETE FROM Producto_Agregado WHERE id_producto = ?",
            params![product_id],
        )
        .map_err(|e| e.to_string())?;

        // Eliminar el producto
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
            add_topping,
            add_check,
            get_products,
            get_categories,
            get_toppings,
            get_checks,
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
