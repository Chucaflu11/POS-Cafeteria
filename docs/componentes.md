# Componentes de React

Este documento describe los componentes principales utilizados en el frontend de la aplicación.

## Índice

* [Componente App](#componente-app)
* [Componente Header](#componente-header)
* [Componente Sidebar](#componente-sidebar)
* [Componente Products](#componente-products)
* [Componente ComplementSidebar](#componente-complementsidebar)
  * [Componente CategoryForm](#componente-categoryform)
  * [Componente ProductForm](#componente-productform)
* [Componente Categories](#componente-categories)
* [Componente Dashboard](#componente-dashboard)
  * [Componente ChecksCard](#componente-checkscard)
* [Componente Clientes](#componente-clientes)
  * [Componente ClientsCard](#componente-clientscard)
  * [Componente AddClientModal](#componente-addclientmodal)
  * [Componente AddClientProductsModal](#componente-addclientproductsmodal)
* [Componente Report](#componente-report)

## Componente App

### **Descripción:**

El componente `App` es el componente principal de la aplicación y se encarga de manejar el estado global, incluyendo las categorías, productos, la categoría seleccionada y el carrito de compras. También gestiona la carga de datos desde la base de datos a través de funciones Tauri y renderiza los demás componentes de la vista principal de la aplicación (Header, Sidebar, Products, Categories, ComplementSidebar), utiliza React Router para gestionar la navegación entre las diferentes vistas de la aplicación.

### **Props:**

Este componente no recibe props externas.

### **Estado:**

* **categories:** Un array que almacena las categorías obtenidas de la base de datos.
* **products:** Un array que almacena los productos obtenidos de la base de datos.
* **selectedCategory:** Un objeto que representa la categoría actualmente seleccionada.
* **cart:** Un array que almacena los productos que el usuario ha agregado al carrito.

### **Funciones:**

* **fetchData():** Una función asíncrona que utiliza la función `invoke` de Tauri para obtener categorías y productos desde la base de datos y actualizar el estado correspondiente.
* **setSelectedCategory():** Función para actualizar la categoría seleccionada.
* **setCart():** Función para actualizar el contenido del carrito.

### **Rutas(react-router):**

* **`/`:** Muestra la vista principal de la aplicación con la barra lateral, productos, complementos y pie de página.
* **`/dashboard`:** Muestra el componente `Dashboard`.
* **`/clients`:** Muestra el componente `Clientes`.
* **`/report`:** Muestra el componente `Report`.

### **Estructura:**

* Utiliza react-router-dom para el enrutamiento.
* En la ruta principal (/) renderiza:
  * Header: Barra de encabezado.
  * Sidebar: Barra lateral izquierda con el carrito de compras.
  * Content: Área principal de contenido con:
    * Products: Lista de productos filtrados por la categoría seleccionada.
    * Categories: Lista de categorías para seleccionar.
  * ComplementSidebar: Barra lateral derecha con opciones adicionales.

### **Ejemplo de uso:**

Dado que este es el componente principal, no se "usa" dentro de otros componentes, sino que es el punto de entrada de toda la aplicación.

## Componente Header

### **Descripción:**

El componente `Header` representa la cabecera de la aplicación. Muestra el logotipo de la cafetería, el título "Cafetería Del Ángel" y un botón que permite navegar entre la vista principal (`/`), la vista del dashboard (`/dashboard`), reportes (`/report`) y clientes (`/clients`), además de un botón para cambiar el tema de la aplicación.

### **Props:**

* **toggleTheme:** Función para cambiar el tema de la aplicación entre claro y oscuro.

### **Estado:**

* **currentRoute:** Almacena la ruta actual (`/` o `/dashboard`) para determinar el estado del botón de navegación.

### **Funciones:**

* **handleDashboardClick():** Navega a la ruta del dashboard o regresa a la ruta principal.
* **handleClientsClick():** Navega a la ruta de clientes o regresa a la ruta principal.
* **handleReportClick():** Navega a la ruta de reportes o regresa a la ruta principal.

### **Estructura:**

* Un contenedor principal (header) con dos divs interiores:
  * title-header: Contiene el logo y el título de la cafetería.
  * buttons-header: Contiene los botones de navegación y el botón para cambiar el tema.
* Los botones de navegación utilizan iconos SVG para representar visualmente su función.

### **Ejemplo de uso:**

```JavaScript
    function App() {
        const [theme, setTheme] = useState('light-theme');

        const toggleTheme = () => {
            setTheme(theme === 'light-theme' ? 'dark-theme' : 'light-theme');
        };

        return (
            <div className={`app ${theme}`}>
            <Header toggleTheme={toggleTheme} />
            {/* ... resto del contenido de la aplicación */}
            </div>
        );
    }
```

## Componente Sidebar

### **Descripción:**

El componente `Sidebar` muestra un resumen de la boleta del cliente en la barra lateral, incluyendo los productos agregados al carrito, sus precios individuales y el precio total. Además, incluye un botón "Pagar" que, al hacer clic, abre un modal para procesar el pago.

### **Props:**

* **cart:** Un array que contiene los productos agregados al carrito. Cada producto debe ser un objeto con las propiedades `nombre_producto` y `precio_producto`.

* **setCart:** Una función para actualizar el contenido del carrito después de procesar el pago.

### **Estado:**

* **isPaymentOpen:** Un booleano que indica si el modal de pago está abierto.
* **isEditing:** Indica si el carrito está en modo de edición.

### **Funciones:**

* **openPayment():** Abre el modal de pago.
* **closePayment():** Cierra el modal de pago.
* **toggleEditing():** Activa/desactiva el modo de edición del carrito.
* **handleRemoveItem(index):** Elimina un producto del carrito en el índice especificado.

### **Estructura:**

* Un contenedor principal (div con clase sidebar) que contiene:
  * Un título (h2) "Resumen de la boleta".
  * Una lista (ul) de los productos del carrito:
    * Cada elemento (li) muestra el nombre y precio del producto.
    * Si está en modo de edición, se muestra un botón para eliminar el producto.
  * Un botón (button) para editar el carrito.
  * Un contenedor (div) con el total a pagar.
  * Un botón (button) para abrir el modal de pago.
  * El componente PaymentModal se muestra si isPaymentOpen es verdadero.

### **Ejemplo de uso:**

```JavaScript
    <Sidebar cart={[{ nombre_producto: "Café", precio_producto: 2000 }, { nombre_producto: "Sandwich", precio_producto: 4500 }]} setCart={setCart} />
```

## Componente Products

### **Descripción:**

El componente `Products` muestra una lista de productos pertenecientes a una categoría específica. Los productos se presentan en un diseño de cuadrícula que se ajusta dinámicamente al tamaño de la pantalla, garantizando una visualización óptima en diferentes dispositivos.

### **Props:**

* **products:** Un array de objetos que representan los productos a mostrar. Cada objeto debe tener las propiedades `id_producto`, `nombre_producto`, `id_categoria`, `precio_producto`.
* **cart:** Un array que contiene los productos que el usuario ha agregado al carrito.
* **setCart:** Una función para actualizar el contenido del carrito.

### **Estado:**

* **gridColumnCount:** Un número que representa la cantidad de columnas en la cuadrícula. Se actualiza dinámicamente en función del ancho del contenedor y el ancho de cada botón.
* **categoryProductsRef:** Una referencia al elemento contenedor de los productos, utilizada para obtener su ancho.

### **Funciones:**

* **addToCart(product):** Agrega el producto especificado al carrito de compras.
* **calculateColumns():** Calcula la cantidad óptima de columnas para la cuadrícula en función del ancho del contenedor y el ancho de cada botón.

### **Estructura:**

* Un contenedor principal (div con clase category-products) con:
  * Una lista (ul con clase category-products-list) que utiliza gridTemplateColumns para ajustar dinámicamente el número de columnas.
  * Un botón (button) para cada producto en el array products, el cual llama a addToCart al ser clickeado.

### **Ejemplo de uso:**

```JavaScript
    <Products 
    products={[{ id_producto: 1, nombre_producto: "Café", id_categoria: 1, precio_producto: 1200 }, { id_producto: 2, nombre_producto: "Sándwich", id_categoria: 2, precio_producto: 1600 }]}
    cart={[]}
    setCart={setCart} 
    />
```

## Componente ComplementSidebar

### **Descripción:**

El componente `ComplementSidebar` proporciona funcionalidades adicionales a la barra lateral de la aplicación. Incluye botones para remover el último elemento del carrito, agregar una nueva categoría o producto (abriendo formularios correspondientes), y tres botones adicionales que no tienen funcionalidad definida aún.

### **Props:**

* **cart:** Un array que contiene los productos agregados al carrito.
* **setCart:** Una función para actualizar el contenido del carrito.
* **fetchData:** Una función para recargar los datos de categorías y productos (Una vez se agrega uno de estos, para que sea mostrado).
* **categories:** Un array que contiene las categorías existentes (Para el formulario donde se agrega un producto).

### **Estado:**

* **isCatFormOpen:** Un booleano que indica si el formulario de agregar categoría está abierto.
* **isProdFormOpen:** Un booleano que indica si el formulario de agregar producto está abierto.

### **Funciones:**

* **removeLastItem():** Elimina el último producto agregado al carrito.
* **deleteCategory(categoryId):** Elimina la categoría con el ID especificado (Sin uso práctico por ahora).
* **openCatForm():** Abre el formulario para agregar una nueva categoría.
* **closeCatForm():** Cierra el formulario de categoría y recarga los datos.
* **openProdForm():** Abre el formulario para agregar un nuevo producto.
* **closeProdForm():** Cierra el formulario de producto y recarga los datos.

### **Estructura:**

* Un contenedor principal (div con clase complement-sidebar) que contiene:
  * Un contenedor de botones (div con clase button-container):
    * Botones para abrir los formularios de categoría y producto.
    * Componentes CategoryForm y ProductForm condicionales que se muestran si sus respectivos estados están en true.
    * Botones para eliminar el último elemento del carrito y otros botones sin funcionalidad (Botón 4 - Botón 13).
    * Un botón para eliminar una categoría (actualmente elimina la categoría con ID 1).

### **Ejemplo de uso:**

```JavaScript
    <ComplementSidebar 
    cart={[]} 
    setCart={setCart} 
    fetchData={fetchData} 
    categories={[]} 
    />
```

### **Notas adicionales:**

Este componente renderiza los componentes `CategoryForm` y `ProductForm`.

## Componente CategoryForm

### **Descripción:**

El componente `CategoryForm` presenta un formulario modal para agregar nuevas categorías de productos. Permite al usuario ingresar el nombre de la categoría y enviarlo a la base de datos a través de una función Tauri.

### **Props:**

* **closeCatForm:** Una función que se ejecuta para cerrar el formulario modal.

### **Estado:**

* **categoryName:** Almacena el nombre de la categoría ingresado por el usuario.
* **error:** Almacena un mensaje de error si la validación falla.

### **Funciones:**

* **handleInputChange(event):** Actualiza el estado categoryName con el valor ingresado en el campo de entrada y limpia el mensaje de error.
* **addCategory(event):**
  * Previene el comportamiento de envío de formulario por defecto.
  * Valida que el nombre de la categoría no esté vacío.
  * Si la validación es exitosa, llama a la función Tauri `add_category` para guardar la categoría en la base de datos.
  * Cierra el formulario modal llamando a `closeCatForm`.

### **Estructura:**

* Un contenedor principal (div con clase modal-overlay) que cubre toda la pantalla y oscurece el fondo.
* Un contenedor de contenido (div con clase modal-content) que contiene:
  * Un botón de cierre (button con clase close-button) que llama a closeCatForm al ser clickeado.
  * Un título (h2) "Categoría".
  * Un formulario (form):
    * Un campo de texto (input con tipo "text") para ingresar el nombre de la categoría.
    * Un mensaje de error condicional (p) que se muestra si error no está vacío.
    * Un botón de envío (button con tipo "submit") que llama a addCategory al ser clickeado.

### **Ejemplo de uso:**

```JavaScript
    <CategoryForm closeCatForm={closeCatForm} />
```

## Componente ProductForm

### **Descripción:**

El componente `ProductForm` presenta un formulario modal para agregar nuevos productos. Permite al usuario ingresar el nombre, precio y categoría del producto, validando los datos antes de enviarlos a la base de datos a través de una función Tauri.

### **Props:**

* **closeProdForm:** Función que cierra el formulario modal.
* **categories:** Array de objetos que representan las categorías disponibles, cada uno con propiedades id_categoria y nombre_categoria.

### **Estado:**

* **productName:** Almacena el nombre del producto ingresado por el usuario.
* **productPrice:** Almacena el precio del producto ingresado por el usuario.
* **categoryId:** Almacena el ID de la categoría seleccionada por el usuario.
* **error:** Almacena un mensaje de error si la validación falla.

### **Funciones:**

* **handleProductNameChange(event):** Actualiza el estado productName con el valor ingresado y limpia el mensaje de error.
* **handleProductPriceChange(event):** Actualiza el estado productPrice con el valor ingresado y limpia el mensaje de error.
* **handleCategoryIdChange(event):** Actualiza el estado categoryId con el ID de la categoría seleccionada.
* **addProduct(event):**
  * Previene el comportamiento de envío de formulario por defecto.
  * Valida que el nombre y precio del producto no estén vacíos y que el precio sea un número positivo.
  * Valida que se haya seleccionado una categoría.
  * Si la validación es exitosa, convierte el ID de categoría y el precio a números enteros.
  * Llama a la función Tauri `add_product` para guardar el producto en la base de datos.
  * Cierra el formulario modal llamando a `closeProdForm`.

### **Estructura:**

* Un contenedor principal (div con clase modal-overlay) que cubre toda la pantalla y oscurece el fondo.
* Un contenedor de contenido (div con clase modal-content) que contiene:
  * Un botón de cierre (button con clase close-button) que llama a closeProdForm al ser clickeado.
  * Un título (h2) "Producto".
  * Un formulario (form):
    * Un campo de texto (input con tipo "text") para ingresar el nombre del producto.
    * Un campo de texto (input con tipo "number") para ingresar el precio del producto.
    * Un menú desplegable (select) para seleccionar la categoría.
    * Un mensaje de error condicional (p) que se muestra si error no está vacío.
    * Un botón de envío (button con tipo "submit") que llama a addProduct al ser clickeado.

### **Ejemplo de uso:**

```JavaScript
    <ProductForm closeProdForm={closeProdForm} categories={categories} />
```

## Componente Categories

### **Descripción:**

El componente `Categories` muestra una lista de botones, cada uno representando una categoría de productos. Al hacer clic en un botón, se actualiza la categoría seleccionada en la aplicación. Los botones se muestran en un diseño de cuadrícula que se ajusta dinámicamente al tamaño de la pantalla.

### **Props:**

* **setSelectedCategory:** Una función para actualizar la categoría seleccionada en la aplicación.
* **categories:** Un array de objetos que representan las categorías de productos. Cada objeto debe tener la propiedad `nombre_categoria` y `id_categoria`.

### **Estado:**

* **gridColumnCount:** Un número que representa la cantidad de columnas en la cuadrícula. Se actualiza dinámicamente en función del ancho del contenedor y el ancho de cada botón.
* **footerRef:** Una referencia al elemento contenedor de los botones, utilizada para obtener su ancho.

### **Funciones:**

* **calculateColumns():** Calcula la cantidad óptima de columnas para la cuadrícula en función del ancho del contenedor y el ancho de cada botón.

### **Estructura:**

* Un contenedor principal (footer) con:
  * Un contenedor de botones (div con clase footer-button-container) que utiliza gridTemplateColumns para ajustar dinámicamente el número de columnas.
  * Un botón (button) para cada categoría en el array categories, el cual llama a setSelectedCategory al ser clickeado.

### **Ejemplo de uso:**

```JavaScript
    <Categories 
    setSelectedCategory={setSelectedCategory} 
    categories={[{ id_categoria: 1, nombre_categoria: "Bebidas" }, { id_categoria: 2, nombre_categoria: "Comidas" }]} 
    />
```

## Componente Dashboard

### **Descripción:**

El componente `Dashboard` muestra un listado de boletas de la cafetería obtenidas de la base de datos. Estas boletas se muestran en tarjetas ordenadas por su ID de manera descendente, permitiendo la paginación para navegar entre ellas. Además, incluye un botón para recargar las boletas desde la base de datos.

### **Props:**

Este componente no recibe props externas.

### **Estado:**

* **checks:** Un array que contiene los datos de las boletas obtenidas de la base de datos.
* **page:** Un número que representa la página actual de la paginación.
* **pageSize:** Un número que representa la cantidad de boletas por página.
* **isLastPage:** Un booleano que indica si se ha llegado a la última página de la paginación.
* **totalPages:** Número total de páginas de resultados.

### **Funciones:**

* **fetchData():** Función asíncrona que utiliza invoke de Tauri para obtener las boletas y el conteo total de boletas, y actualiza el estado correspondiente.
* **handlePageChange(newPage):** Cambia a la página indicada por newPage.
* **renderPageButtons():** Renderiza los botones de paginación, incluyendo botones numéricos, "Anterior" y "Siguiente".

### **Estructura:**

* Un contenedor principal (div con clase dashboard-content) que contiene:
  * Un título (h1) "Boletas".
  * Un componente ChecksCard para mostrar las boletas.
  * Un contenedor (div con clase pagination-controls) para los controles de paginación.

### **Ejemplo de uso:**

El componente `Dashboard` se utiliza como una ruta en el componente principal `App`:

```JavaScript
    <Route path="/dashboard" element={<Dashboard />} />
```

## Componente ChecksCard

### **Descripción:**

El componente `ChecksCards` muestra visualmente una lista de boletas (`checks`) en formato de tarjetas. Cada tarjeta presenta la información básica de una boleta (ID, fecha, método de pago y total) y los detalles de los productos que la componen, incluyendo el nombre, la cantidad y el precio unitario.

### **Props:**

* **checks:** Un array de objetos que representan las boletas. Cada boleta debe ser un objeto con las siguientes propiedades:
  * **id_boleta (número):** El identificador único de la boleta.
  * **fecha (string):** La fecha de la boleta en formato "yy/mm/dd HH:MM:SS".
  * **metodo_pago (string):** El método de pago utilizado (por ejemplo, "Efectivo", "Tarjeta").
  * **total (número):** El monto total de la boleta.
  * **detalles (array):** Un array de objetos que representan los detalles de la boleta, cada uno con las siguientes propiedades:
    * **nombre_producto (string):** El nombre del producto.
    * **cantidad (número):** La cantidad del producto en la boleta.
    * **precio_unitario (número):** El precio unitario del producto.

### **Estado:**

Este componente no maneja estado interno.

### **Funciones:**

Este componente no define funciones personalizadas.

### **Estructura:**

* Un contenedor principal (div con clase cards).
* Itera sobre el array checks y para cada elemento:
  * Renderiza un div con clase check-card.
  * Muestra la información básica de la boleta (ID, fecha, método de pago, total).
  * Muestra un título (h3) 'Detalles:' .
  * Si la boleta tiene detalles (check.detalles existe y no está vacío):
    * Itera sobre check.detalles y muestra los detalles de cada producto en un div con clase card-details.
  * Si la boleta no tiene detalles, muestra un mensaje (p)'Sin detalles'.

### **Ejemplo de uso:**

```JavaScript
    <ChecksCards 
        checks={[
            { 
                id_boleta: 1, 
                fecha: "24/06/27 15:08:00", 
                metodo_pago: "Efectivo", 
                total: 6500, 
                detalles: [
                    { nombre_producto: "Café", cantidad: 1, precio_unitario: 2000 }, 
                    { nombre_producto: "Sándwich", cantidad: 1, precio_unitario: 4500 }
                ]
            }
        ]}
    />
```

## Componente Clientes

### **Descripción:**

El componente `Clientes` muestra una lista paginada de clientes con cuentas de fiado, incluyendo información sobre sus deudas y detalles de las boletas asociadas. Permite agregar nuevos clientes y navegar entre las páginas de resultados.

### **Props:**

No recibe props.

### **Estado:**

* **fetchedClients:** Array que almacena los datos de los clientes obtenidos desde la base de datos.
* **page:** Número de la página actual.
* **pageSize:** Cantidad de clientes a mostrar por página.
* **isLastPage:** Indica si se ha alcanzado la última página de resultados.
* **totalPages:** Número total de páginas de resultados.
* **isClientModalOpen:** Indica si el modal para agregar un nuevo cliente está abierto.

### **Funciones:**

* **openClientModal():** Abre el modal para agregar un nuevo cliente.
* **closeClientModal()**: Cierra el modal para agregar un nuevo cliente.
* **fetchData():** Función asíncrona que utiliza invoke de Tauri para obtener los datos de los clientes y el número total de clientes, y actualiza el estado correspondiente.
* **handlePageChange(newPage):** Cambia a la página indicada por newPage.
* **renderPageButtons():** Renderiza los botones de paginación, incluyendo botones numéricos, "Anterior" y "Siguiente".

### **Estructura:**

* Un contenedor principal (div con clase clients-content) que contiene:
  * Un componente ClientsCard para mostrar la lista de clientes.
  * Un botón para agregar un nuevo cliente (button con clase add-client-button) que abre el modal AddClientModal cuando se hace clic.
  * El componente AddClientModal (condicionalmente renderizado si isClientModalOpen es true).
  * Controles de paginación (div con clase pagination-controls) que renderizan los botones de paginación.

### **Ejemplo de uso:**

```JavaScript
    <Route path="/clients" element={<Clientes />} />
```

## Componente ClientsCard

### **Descripción:**

El componente `ClientsCard` muestra una lista de tarjetas, donde cada tarjeta representa un cliente con una cuenta de fiado. Cada tarjeta puede expandirse para mostrar detalles de la deuda del cliente, como el total, el monto pagado y el monto restante. Además, proporciona botones para agregar productos a la cuenta del cliente y para registrar un pago.

### **Props:**

* **fetchedClients:** Array que contiene los datos de los clientes obtenidos desde la base de datos.
* **fetchData:** Función para volver a cargar los datos de los clientes después de realizar alguna acción (como agregar un producto o registrar un pago).

### **Estado:**

* **tarjetasAbiertas:** Objeto que mantiene el estado de expansión de cada tarjeta (abierta o cerrada).
* **isClientProductsModalOpen:** Indica si el modal para agregar productos al cliente está abierto.
* **isClientPaymentModalOpen:** Indica si el modal para registrar un pago del cliente está abierto.

### **Funciones:**

* **openClientPaymentModal():** Abre el modal para registrar un pago.
* **closeClientPaymentModal():** Cierra el modal para registrar un pago.
* **openClientProductsModal():** Abre el modal para agregar productos al cliente.
* **closeClientProductsModal():** Cierra el modal para agregar productos al cliente.
* **toggleDetalles(clientId):** Alterna el estado de expansión de la tarjeta del cliente con el ID especificado.

### **Estructura:**

* Un contenedor principal (div con clase clients-cards).
* Itera sobre el array fetchedClients y para cada cliente:
  * Renderiza un div con clase cliente (y la clase activo si la tarjeta está abierta).
    * En el encabezado (div con clase encabezado):
      * Muestra el nombre del cliente (h3).
      * Un botón con una flecha que permite expandir/contraer la tarjeta.
    * Si la tarjeta está expandida, muestra un contenedor (div con clase contenido):
      * Detalles de la deuda (div con clase detalles-deuda).
      * Botones para agregar productos, editar (sin funcionalidad), y registrar un pago (div con clase card-buttons).
      * Lista de productos (div con clase detalle-productos) si el cliente tiene una deuda (debt_id no es 0).
        * Muestra cada producto en un elemento de lista (li).

### **Ejemplo de uso:**

```JavaScript
    <ClientsCard fetchedClients={fetchedClients} fetchData={fetchData} />
```

## Componente AddClientProductsModal

### **Descripción:**

El componente `AddClientProductsModal` muestra un formulario modal que permite agregar productos a la cuenta de fiado de un cliente. Incluye una lista de categorías, una lista de productos filtrados por la categoría seleccionada, y una barra lateral para gestionar el carrito de compras del cliente.

### **Props:**

* **closeClientProductsModal:** Función para cerrar el modal.
* **clientId:** ID del cliente al que se le agregarán los productos.
* **fetchData:** Función para volver a cargar los datos de los clientes después de agregar productos.

### **Estado:**

* **categories:** Array que almacena las categorías obtenidas de la base de datos.
* **products:** Array que almacena los productos obtenidos de la base de datos.
* **selectedCategory:** Objeto que representa la categoría seleccionada actualmente.
* **cart:** Array que almacena los productos agregados al carrito del cliente.

### **Funciones:**

* **fetchProductsData():** Función asíncrona que utiliza `invoke` de Tauri para obtener las categorías y productos de la base de datos, y actualiza el estado correspondiente.

### **Estructura:**

* Un contenedor principal (div con clase modal-overlay) que cubre toda la pantalla y oscurece el fondo.
* Un contenedor de contenido (div con clase modal-client-product-content) que contiene:
  * Un botón de cierre (button con clase close-client-product-modal) que llama a closeClientProductsModal al ser clickeado.
  * Un contenedor main-content que contiene:
    * Un componente AddClientProductSidebar para gestionar el carrito del cliente.
    * Un contenedor content-right que contiene:
      * Un contenedor products-menu que contiene:
        * Un componente Products para mostrar los productos de la categoría seleccionada.
        * Un componente Categories para seleccionar la categoría.

### **Ejemplo de uso:**

```JavaScript
    <AddClientProductsModal closeClientProductsModal={closeClientProductsModal} clientId={cliente.client_id} fetchData={fetchData} />
```

## Componente AddClientProductsSidebar

### **Descripción:**

El componente `AddClientProductsSidebar` es una barra lateral que se muestra dentro del modal `AddClientProductsModal`. Su función es mostrar un resumen de los productos que se van a agregar a la cuenta de fiado del cliente, incluyendo la opción de editar (eliminar) productos del carrito y un botón para guardar la transacción de crédito.

### **Props:**

* **cart:** Array que contiene los productos agregados al carrito del cliente.
* **setCart:** Función para actualizar el contenido del carrito.
* **clientId:** ID del cliente al que se le agregarán los productos.
* **closeClientProductsModal:** Función para cerrar el modal.
* **fetchData:** Función para volver a cargar los datos de los clientes después de agregar productos.

### **Estado:**

* **isEditing:** Indica si el carrito está en modo de edición (permitiendo eliminar productos).

### **Funciones:**

* **toggleEditing():** Alterna el estado de edición del carrito.
* **handleRemoveItem(index):** Elimina el producto en el índice dado del carrito.
* **addCreditTransaction(clientId):** Función asíncrona que realiza una llamada Tauri para agregar una nueva transacción de crédito con los productos del carrito al cliente especificado.

### **Estructura:**

* Un contenedor principal (div con clase sidebar).
* Un contenedor interno (div con clase check) que muestra:
  * Un título (h2) "Resumen de la boleta".
  * Una lista (ul) de los productos del carrito:
    * Cada elemento (li) muestra el nombre y precio del producto.
    * Si está en modo de edición, muestra un botón para eliminar el producto.
  * Un botón con un ícono de edición para activar/desactivar el modo de edición.
  * Un contenedor (div) con el total a pagar.
  * Un botón (button con clase pay-button) que llama a la función addCreditTransaction para guardar la transacción.

### **Ejemplo de uso:**

```JavaScript
    <div className="modal-client-product-content">
      {/* ... otros componentes del modal */}
      <AddClientProductSidebar 
        cart={cart} 
        setCart={setCart} 
        clientId={clientId} 
        closeClientProductsModal={closeClientProductsModal} 
        fetchData={fetchData} 
      />
    </div>
```

## Componente ClientPaymentModal

### **Descripción:**

El componente `ClientPaymentModal` muestra un formulario modal que permite registrar un pago parcial de la deuda de un cliente. Incluye un campo de texto para ingresar el monto del pago, un menú desplegable para seleccionar el método de pago y un botón para guardar el pago.

### **Props:**

* **closeClientPaymentModal:** Función para cerrar el modal.
* **debtId:** ID de la deuda a la que se aplicará el pago.
* **fetchData:** Función para volver a cargar los datos de los clientes después de registrar el pago.

### **Estado:**

* **partialPayment:** Almacena el monto del pago ingresado por el usuario.
* **paymentMethod:** Almacena el método de pago seleccionado en el menú desplegable.
* **error:** Almacena un mensaje de error si la validación falla.

### **Funciones:**

* **handleInputChange(event)**: Actualiza el estado partialPayment con el valor ingresado en el campo de texto y limpia el mensaje de error.
* **handlePaymentMethodChange(event):** Actualiza el estado paymentMethod con el valor seleccionado en el menú desplegable.
* **partialPay(event):**
  * Previene el comportamiento de envío del formulario por defecto.
  * Valida que el monto del pago no esté vacío.
  * Si la validación es exitosa, llama a la función Tauri invoke('pay_partial_debt', { debtId, amount, paymentMethod }) para registrar el pago en la base de datos.
  * Cierra el formulario modal llamando a closeClientPaymentModal.

### **Estructura:**

* Un contenedor principal (div con clase modal-overlay) que cubre toda la pantalla y oscurece el fondo.
* Un contenedor de contenido (div con clase modal-pay-content) que contiene:
  * Un encabezado con un título (h2) 'Pago'  y un botón de cierre.
  * Un formulario (form):
    * Un campo de texto (input con tipo "number") para ingresar el monto del pago.
    * Un menú desplegable (select) para seleccionar el método de pago (efectivo o tarjeta).
    * Un mensaje de error condicional (p) que se muestra si error no está vacío.
    * Un botón de envío (button con tipo "submit") que llama a partialPay al ser clickeado.

### **Ejemplo de uso:**

```JavaScript
    <ClientPaymentModal closeClientPaymentModal={closeClientPaymentModal} debtId={cliente.debt_id} fetchData={fetchData} />
```

## Componente AddClientModal

### **Descripción:**

El componente `AddClientModal`  muestra un formulario modal para agregar nuevos clientes a la base de datos con una cuenta de fiado. Incluye un campo de texto para ingresar el nombre del cliente y un botón para registrar al cliente.

### **Props:**

* **closeClientModal:** Función para cerrar el modal.
* **fetchData:** Función para actualizar la lista de clientes después de agregar uno nuevo.

### **Estado:**

* **clientName:** Almacena el nombre del cliente ingresado por el usuario.
* **error:** Almacena un mensaje de error si la validación falla.

### **Funciones:**

* **handleInputChange(event)**: Actualiza el estado clientName con el valor ingresado en el campo de texto y limpia el mensaje de error.
* **addClient(event):**
  * Previene el comportamiento de envío del formulario por defecto.
  * Valida que el nombre del cliente no esté vacío.
  * Si la validación es exitosa, invoca el comando Tauri add_client para agregar el cliente a la base de datos.
  * Actualiza la lista de clientes llamando a fetchData.
  * Cierra el modal llamando a closeClientModal.
  * Si ocurre un error durante el proceso, muestra un mensaje de error.

### **Estructura:**

* Un contenedor principal (div con la clase modal-overlay) que cubre toda la pantalla y oscurece el fondo.
* Dentro del contenedor principal, un div con la clase modal-client-content:
  * Un encabezado (div con la clase client-form-header) que contiene el título "Nombre" y un botón de cierre (button con la clase close-client-form-button).
  * Un formulario (form):
    * Un campo de texto (input) para ingresar el nombre del cliente.
    * Un párrafo (p) que muestra un mensaje de error si existe.
    * Un botón (button) con la clase send-client-button para enviar el formulario y agregar el cliente.

### **Ejemplo de uso:**

```JavaScript
    <AddClientModal closeClientModal={closeClientModal} fetchData={fetchData} />
```

## Componente Report

### **Descripción:**

El componente `Report`  se encarga de generar un reporte de cierre de caja. Muestra un formulario con campos para ingresar información relevante sobre el cierre de caja, como fechas, totales de ventas, ingresos y saldos. También incluye botones para cargar un reporte desde la base de datos y generar un reporte final en formato CSV.

### **Props:**

No recibe props.

### **Estado:**

* **salesSummary:** Almacena el resumen de ventas obtenido de la base de datos.
* **fechaInicio:** Fecha de inicio del período del reporte.
* **fechaCierre:** Fecha de cierre del período del reporte.
* **horaCierre:** Hora de cierre del período del reporte.
* **efectivoInicial:** Monto de efectivo inicial en caja.
* **efectivoFinal:** Monto de efectivo final en caja (calculado automáticamente).
* **ingresosEfectivo:** Monto de ingresos en efectivo durante el período.
* **saldoReal:** Saldo real en caja (calculado automáticamente).
* **diferencias:** Diferencia entre el saldo esperado y el saldo real (calculada automáticamente).

### **Funciones:**

* **handleReporteClick():** Obtiene el resumen de ventas desde la base de datos y actualiza el estado.
* **handleGenerateReportClick():** Genera un reporte final en formato CSV y lo guarda en la ubicación seleccionada por el usuario.
* (Funciones internas): Calcula automáticamente el efectivo final, el saldo real y las diferencias en base a los valores ingresados.

### **Estructura:**

* Un contenedor principal (div con clase cierre-caja-container) que contiene:
  * Cuatro cuadros (div con clase cuadro) que agrupan campos de entrada relacionados:
    * Cuadro 1: Fechas (inicio, cierre, hora de cierre).
    * Cuadro 2: Ventas (total, efectivo, tarjeta).
    * Cuadro 3: Efectivo (inicial, ingresos, final).
    * Cuadro 4: Saldos (esperado, real, diferencias).
  * Dos botones:
    * "Reporte" (para generar el reporte final).
    * "Cargar Reporte" (para obtener datos de ventas desde la base de datos).

### **Ejemplo de uso:**

```JavaScript
    <Route path="/report" element={<Report />} />
```
