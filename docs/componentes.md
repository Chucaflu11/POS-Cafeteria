# Componentes de React

Este documento describe los componentes principales utilizados en el frontend de la aplicación.

## Índice

* [Componente App](#componente-app)
* [Componente Header](#componente-header)
* [Componente Sidebar](#componente-sidebar)
* [Componente CategoryProducts](#componente-categoryproducts)
* [Componente ComplementSidebar](#componente-complementsidebar)
  * [Componente CategoryForm](#componente-categoryform)
  * [Componente ProductForm](#componente-productform)
* [Componente Footer](#componente-footer)

## Componente App

### **Descripción:**

El componente `App` es el componente principal de la aplicación y se encarga de manejar el estado global, incluyendo las categorías, productos, la categoría seleccionada y el carrito de compras. También gestiona la carga de datos desde la base de datos a través de funciones Tauri y renderiza los demás componentes de la vista principal de la aplicación (Header, Sidebar, Footer, CategoryProducts, ComplementSidebar).

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

### **Ejemplo de uso:**

Dado que este es el componente principal, no se "usa" dentro de otros componentes, sino que es el punto de entrada de toda la aplicación.

## Componente Header

### **Descripción:**

El componente `Header` representa la cabecera de la aplicación. Muestra el logotipo de la cafetería y el título "Cafetería Del Ángel".

### **Props:**

Este componente no recibe props externas.

### **Estado:**

Este componente no maneja estado interno.

### **Funciones:**

Este componente no define funciones personalizadas.

### **Ejemplo de uso:**

```JavaScript
    <Header />
```

## Componente Sidebar

### **Descripción:**

El componente `Sidebar` muestra un resumen de la boleta del cliente en la barra lateral. Lista los productos que el cliente ha agregado al carrito, junto con sus precios individuales y el precio total.

### **Props:**

* **cart:** Un array que contiene los productos agregados al carrito. Cada producto debe ser un objeto con las propiedades `nombre_producto` y `precio_producto`.

### **Estado:**

Este componente no maneja estado interno.

### **Funciones:**

Este componente no define funciones personalizadas.

### **Ejemplo de uso:**

```JavaScript
    <Sidebar cart={[{ nombre_producto: "Café", precio_producto: 2000 }, { nombre_producto: "Sandwich", precio_producto: 4500 }]} />
```

## Componente CategoryProducts

### **Descripción:**

El componente `CategoryProducts` muestra una lista de productos pertenecientes a una categoría específica. Los productos se presentan en un diseño de cuadrícula que se ajusta dinámicamente al tamaño de la pantalla, garantizando una visualización óptima en diferentes dispositivos.

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

### **Ejemplo de uso:**

```JavaScript
    <CategoryProducts 
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
* **openCatForm():** Abre el formulario para agregar una nueva categoría.
* **closeCatForm():** Cierra el formulario de categoría y recarga los datos.
* **openProdForm():** Abre el formulario para agregar un nuevo producto.
* **closeProdForm():** Cierra el formulario de producto y recarga los datos.

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

### **Ejemplo de uso:**

```JavaScript
    <ProductForm closeProdForm={closeProdForm} categories={categories} />
```

## Componente Footer

### **Descripción:**

El componente `Footer` muestra una lista de botones, cada uno representando una categoría de productos. Al hacer clic en un botón, se actualiza la categoría seleccionada en la aplicación. Los botones se muestran en un diseño de cuadrícula que se ajusta dinámicamente al tamaño de la pantalla.

### **Props:**

* **setSelectedCategory:** Una función para actualizar la categoría seleccionada en la aplicación.
* **categories:** Un array de objetos que representan las categorías de productos. Cada objeto debe tener la propiedad `nombre_categoria` y `id_categoria`.

### **Estado:**

* **gridColumnCount:** Un número que representa la cantidad de columnas en la cuadrícula. Se actualiza dinámicamente en función del ancho del contenedor y el ancho de cada botón.
* **footerRef:** Una referencia al elemento contenedor de los botones, utilizada para obtener su ancho.

### **Funciones:**

* **calculateColumns():** Calcula la cantidad óptima de columnas para la cuadrícula en función del ancho del contenedor y el ancho de cada botón.

### **Ejemplo de uso:**

```JavaScript
    <Footer 
    setSelectedCategory={setSelectedCategory} 
    categories={[{ id_categoria: 1, nombre_categoria: "Bebidas" }, { id_categoria: 2, nombre_categoria: "Comidas" }]} 
    />
```
