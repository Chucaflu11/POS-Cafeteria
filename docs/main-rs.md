# Documentación de la Lógica en Rust (main.rs)

Este documento describe la estructura y funcionalidad del código Rust (`main.rs`) en la aplicación Tauri. Este código es responsable de la interacción con la base de datos SQLite y proporciona comandos para ser invocados desde el frontend JavaScript.

## Estructura de Datos

* **`Category`:** Representa una categoría de productos.
  * Campos:
    * `id_categoria` (i32): Identificador único de la categoría.
    * `nombre_categoria` (String): Nombre de la categoría.

* **`Product`:** Representa un producto.
  * Campos:
    * `id_producto` (i32): Identificador único del producto.
    * `nombre_producto` (String): Nombre del producto.
    * `id_categoria` (i32): ID de la categoría a la que pertenece el producto.
    * `precio_producto` (i32): Precio del producto.

* **`Topping`:** Representa un agregado (topping) para los productos.
  * Campos:
    * `id_agregado` (i32): Identificador único del agregado.
    * `nombre_agregado` (String): Nombre del agregado.
    * `costo_agregado` (i32): Costo del agregado.

* **`AppState`:** Almacena el estado global de la aplicación, incluyendo la conexión a la base de datos.
  * Campos:
    * `db` (Mutex\<Option\<Connection\>>): Conexión a la base de datos protegida por un mutex para garantizar la seguridad en entornos concurrentes.

## Funciones

* **`initialize_database(app_handle: &AppHandle)`:**
  * Inicializa la base de datos SQLite en el directorio de datos de la aplicación.
  * Crea el directorio si no existe y abre una conexión a la base de datos.
  * Devuelve un `Result` con la conexión si tiene éxito, o un error si falla.

* **`create_database_schema(conn: &Connection)`:**
  * Crea el esquema de la base de datos si no existe.
  * Define las tablas `Categoria`, `Productos`, `Agregados`, `Producto_Agregado`, `Clientes_Fiados`, `Transacciones_Fiado`, `Boletas` y `Detalle_Boleta`.

## Comandos Tauri

* **`add_category(app_handle: AppHandle, nombre: &str)`:** Inserta una nueva categoría en la base de datos.

* **`add_product(app_handle: AppHandle, nombre: &str, id_categoria: i32, precio: i32)`:** Inserta un nuevo producto en la base de datos.

* **`add_client(app_handle: AppHandle, nombre: &str)`:** Inserta un nuevo cliente en la base de datos.

* **`add_topping(app_handle: AppHandle, nombre: &str, costo: i32)`:** Inserta un nuevo agregado (topping) en la base de datos.

* **`get_products(app_handle: AppHandle)`:** Obtiene todos los productos de la base de datos.

* **`get_categories(app_handle: AppHandle)`:** Obtiene todas las categorías de la base de datos.

* **`get_toppings(app_handle: AppHandle)`:** Obtiene todos los agregados (toppings) de la base de datos.

## Función principal (`main`)

1. Crea un `Builder` para la aplicación Tauri.
2. Gestiona el estado de la aplicación (`AppState`).
3. Registra los comandos Tauri para que puedan ser llamados desde el frontend.
4. En la configuración (`setup`), inicializa la base de datos y crea el esquema.
5. Ejecuta la aplicación.

## Notas adicionales

* El código utiliza el crate `rusqlite` para interactuar con la base de datos SQLite.
* El crate `serde` se utiliza para serializar y deserializar los datos en formato JSON para la comunicación entre Rust y JavaScript.
* Los comandos Tauri devuelven un `Result<(), String>` para indicar éxito o un mensaje de error.
