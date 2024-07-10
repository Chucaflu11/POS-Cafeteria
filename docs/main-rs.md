# Documentación de la Lógica en Rust (main.rs)

Este documento describe la estructura y funcionalidad del código Rust (`main.rs`) en la aplicación Tauri. Este código es responsable de la interacción con la base de datos SQLite y proporciona comandos para ser invocados desde el frontend JavaScript.

## Estructura de Datos

* **`Category`:**
  * Representa una categoría de productos.
  * Campos:
    * `id_categoria` (i32): Identificador único de la categoría.
    * `nombre_categoria` (String): Nombre de la categoría.
* **`Product`:**
  * Representa un producto.
  * Campos:
    * `id_producto` (i32): Identificador único del producto.
    * `nombre_producto` (String): Nombre del producto.
    * `id_categoria` (i32): ID de la categoría a la que pertenece el producto.
    * `precio_producto` (i32): Precio del producto.
* **`AppState`:**
  * Almacena el estado global de la aplicación, incluyendo la conexión a la base de datos.
  * Campos:
    * `db` (Mutex\<Option\<Connection\>>): Conexión a la base de datos protegida por un mutex para garantizar la seguridad en entornos concurrentes.
* **`BoletaConDetalles`:**
  * Representa una boleta con sus detalles.
  * Campos:
    * `id_boleta`: Identificador de la boleta.
    * `fecha`: Fecha de la boleta.
    * `metodo_pago`: Método de pago de la boleta.
    * `total`: Total de la boleta.
    * `detalles`: Array de detalles de la boleta (`DetalleBoleta`).

* **`DetalleBoleta`:**
  * Representa un detalle de una boleta (un producto y sus agregados).
  * Campos:
    * `id_detalle_boleta`: Identificador del detalle.
    * `id_producto`: Identificador del producto.
    * `nombre_producto`: Nombre del producto.
    * `cantidad`: Cantidad del producto.
    * `precio_unitario`: Precio unitario del producto.
    * `id_agregado`: Identificador del agregado (opcional).
    * `nombre_agregado`: Nombre del agregado (opcional).
    * `costo_agregado`: Costo del agregado (opcional).

* **`ClientFiadoData:`:**
  * Representa los datos de un cliente con una cuenta de fiado.
  * Campos:
    * `client_id (i32):` Identificador del cliente.
    * `client_name (String):` Nombre del cliente.
    * `debt_id (Option<i32>):` ID de la deuda asociada (si existe).
    * `total_debt (i32):` Total de la deuda.
    * `amount_paid (i32):` Monto pagado de la deuda.
    * `remaining_debt (i32):` Monto restante de la deuda.
    * `products (Vec<ProductFiadoData>):` Vector de productos comprados a crédito por el cliente.

* **`ProductFiadoData:`:**
  * Representa un producto comprado a crédito por un cliente.
  * Campos:
    * `product_id (i32):` ID del producto.
    * `product_name (String):` Nombre del producto.
    * `product_price (i32):` Precio del producto.
    * `quantity (i32):` Cantidad comprada.
    * `transaction_date (String):` Fecha de la transacción.

* **`ProductFiadoData:`:**
  * Representa un producto comprado a crédito por un cliente.
  * Campos:
    * `product_id (i32):` ID del producto.
    * `product_name (String):` Nombre del producto.
    * `product_price (i32):` Precio del producto.
    * `quantity (i32):` Cantidad comprada.
    * `transaction_date (String):` Fecha de la transacción.

* **`SalesSummary:`:**
  * Resumen de las ventas totales, en efectivo y con tarjeta, en un día específico.
  * Campos:
    * `total_ventas (i32):` Total de ventas del día.
    * `total_ventas_efectivo (i32):` Total de ventas en efectivo.
    * `total_ventas_tarjeta (i32):` Total de ventas con tarjeta.

* **`CierreCajaData:`:**
  * Datos para el reporte de cierre de caja.
  * Campos:
    * `total_ventas, total_efectivo, total_tarjeta:` (i32) Totales de ventas (igual que SalesSummary).
    * `efectivo_inicial (i32):` Efectivo inicial en caja.
    * `efectivo_final (i32):` Efectivo final en caja.
    * `ingresos_efectivo (i32):` Ingresos en efectivo durante el día.
    * `saldo_real (i32):` Saldo real en caja.
    * `diferencia (i32):` Diferencia entre saldo esperado y real.
    * `fecha_inicio, fecha_cierre (String):` Fechas de inicio y cierre del reporte.
    * `hora_cierre (String):` Hora de cierre del reporte.

## Funciones

* **`initialize_database(app_handle: &AppHandle)`:**
  * Inicializa la base de datos SQLite en el directorio de datos de la aplicación.
  * Crea el directorio si no existe y abre una conexión a la base de datos llamada "register.sqlite".
  * Devuelve un `Result` con la conexión si tiene éxito, o un error si falla.

* **`create_database_schema(conn: &Connection)`:**
  * Crea el esquema de la base de datos si no existe.
  * Define las tablas `Categoria`, `Productos`, `Agregados`, `Producto_Agregado`, `Clientes_Fiados`, `Transacciones_Fiado`, `Boletas` y `Detalle_Boleta`.

* **`calculate_total(cart: &[Product])`:** Calcula el total de una boleta sumando los precios de los productos en el carrito.

* **`get_timestamp() -> String`:** Obtiene la fecha y hora actual en el formato "dd/mm/yy HH:MM:SS".

## Comandos Tauri

### Gestión de Categorías y Productos

* **`add_category(app_handle: AppHandle, nombre: &str)`:** Inserta una nueva categoría en la base de datos.
* **`add_product(app_handle: AppHandle, nombre: &str, id_categoria: i32, precio: i32)`:** Inserta un nuevo producto en la base de datos.
* **`add_client(app_handle: AppHandle, nombre: &str)`:** Inserta un nuevo cliente en la base de datos.
* **`get_products(app_handle: AppHandle)`:** Obtiene todos los productos de la base de datos.
* **`get_categories(app_handle: AppHandle)`:** Obtiene todas las categorías de la base de datos.
* **`delete_category(category_id: i32)`:** Elimina una categoría y sus productos asociados.
* **`delete_product(product_id: i32)`:** Elimina un producto de la base de datos.

### Gestión de Clientes y Fiados

* **`add_client(nombre_cliente: &str):`** Agrega un nuevo cliente con cuenta de fiado a la base de datos.
* **`add_credit_transaction(cart: Vec<Product>, client_id: i64):`**
Agrega una nueva transacción de crédito (compra a fiado) para un cliente, actualizando o creando su deuda según corresponda.
* **`pay_partial_debt(debt_id: i64, amount: i64, payment_method: &str):`**
Registra un pago parcial de una deuda, actualiza el estado de la deuda y, si se salda por completo, genera una boleta para la transacción.
* **`get_fiado_data(page: i32, page_size: i32):`**
Obtiene los datos de clientes con fiado de forma paginada, incluyendo detalles de sus deudas y productos comprados a crédito.
* **`get_clientes_fiados_count():`** Obtiene el número total de clientes con fiado.

### Gestión de Boletas y Reportes

* **`add_check(app_handle: AppHandle, cart: Vec<Product>, payment_method: &str):`**
  * Calcula el total de la compra.
  * Inserta una nueva boleta en la base de datos con la fecha actual, el método de pago y el total.
  * Inserta los detalles de la boleta (productos y cantidades) en la tabla `Detalle_Boleta`.
* **`get_checks(app_handle: AppHandle, page: i32, page_size: i32):`**
  * Obtiene las boletas con sus detalles de forma paginada.
  * Utiliza un `HashMap` para agrupar los detalles de cada boleta.
  * Devuelve un vector de `BoletaConDetalles`.
* **`get_total_checks_count():`** Obtiene el número total de boletas.
* **`get_sales_summary():`** Obtiene un resumen de las ventas del día actual (totales, efectivo, tarjeta).
* **`generate_final_report(csv_path: &str, cierre_caja_data: CierreCajaData):`**
Genera un reporte de cierre de caja en formato CSV en la ruta especificada, incluyendo detalles de las boletas y el resumen del cierre de caja.
* **`send_timestamp():`** Obtiene la fecha y hora actual.

## Función principal (`main`)

1. Crea un `Builder` para la aplicación Tauri.
2. Gestiona el estado de la aplicación (`AppState`).
3. Registra los comandos Tauri utilizando  `invoke_handler`.
4. En la configuración (`setup`):

* Inicializa la base de datos llamando a initialize_database.
* Crea el esquema de la base de datos llamando a create_database_schema.
* Almacena la conexión en el estado de la aplicación (AppState).

5. Ejecuta la aplicación.

## Notas adicionales

* El código utiliza el crate `rusqlite` para interactuar con la base de datos SQLite.
* El crate `serde` se utiliza para serializar y deserializar los datos en formato JSON para la comunicación entre Rust y JavaScript.
* El crate `chrono` se utiliza para manejar fechas y horas.
* Los comandos Tauri devuelven un `Result<(), String>` para indicar éxito o un mensaje de error.
* Se utiliza un `Mutex` en `AppState` para proteger la conexión a la base de datos en un entorno concurrente.
* Se utiliza el crate `csv` para generar el reporte en formato CSV.
