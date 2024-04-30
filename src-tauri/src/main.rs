#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{params, Connection};

fn main() {
    let conn = Connection::open("categories.db").expect("Cannot open database");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS categories (
                  id INTEGER PRIMARY KEY,
                  name TEXT NOT NULL UNIQUE
                  )",
        params![],
    ).expect("Error creating categories table");

    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
                  id INTEGER PRIMARY KEY,
                  name TEXT NOT NULL,
                  price REAL NOT NULL,
                  category_id INTEGER,
                  FOREIGN KEY(category_id) REFERENCES categories(id)
                  )",
        params![],
    ).expect("Error creating products table");

    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}