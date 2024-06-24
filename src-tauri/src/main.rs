#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection, NO_PARAMS};
use serde::{Deserialize, Serialize};
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

#[derive(Debug, Deserialize, Serialize)]
struct Topping {
    id_agregado: i32,
    nombre_agregado: String,
    costo_agregado: i32,
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
    let sqlite_path = app_dir.join("MyApp.sqlite");

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
            fecha_venta INTEGER,
            monto_pendiente INTEGER,
            FOREIGN KEY (id_cliente) REFERENCES Clientes_Fiados(id_cliente),
            FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
        );

        CREATE TABLE IF NOT EXISTS Boletas (
            id_boleta INTEGER PRIMARY KEY,
            fecha INTEGER,
            metodo_pago TEXT,
            total INTEGER
        );

        CREATE TABLE IF NOT EXISTS Detalle_Boleta (
            id_detalle_boleta INTEGER PRIMARY KEY,
            id_boleta INTEGER,
            id_producto INTEGER,
            cantidad INTEGER,
            precio_unitario REAL, -- Cambiado a REAL para decimales
            id_agregado INTEGER,
            FOREIGN KEY (id_boleta) REFERENCES Boletas(id_boleta),
            FOREIGN KEY (id_producto) REFERENCES Productos(id_producto),
            FOREIGN KEY (id_agregado) REFERENCES Agregados(id_agregado)
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
            get_products,
            get_categories,
            get_toppings
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
