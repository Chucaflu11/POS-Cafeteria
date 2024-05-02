
## Prerrequisitos

Antes de comenzar a trabajar con esta aplicación, asegúrate de tener instalados los siguientes elementos:

1. **Tauri**: Tauri es un framework para construir aplicaciones de escritorio con tecnologías web. Puedes encontrar instrucciones detalladas de instalación en [el sitio web oficial de Tauri](https://tauri.studio/docs/getting-started/intro).
   
2. **React**: React es una biblioteca de JavaScript para construir interfaces de usuario. Si no tienes React instalado, puedes seguir [las instrucciones de instalación](https://es.reactjs.org/docs/getting-started.html).
   
3. **rustqlite**: Rustqlite es una biblioteca de SQLite para Rust. Aunque viene incluida en el `Cargo.toml`, puede que necesites instalar SQLite en tu sistema. Puedes hacerlo utilizando el administrador de paquetes de tu sistema operativo o a través de [la página de descargas de SQLite](https://www.sqlite.org/download.html).

Asegúrate de tener todas estas dependencias instaladas y configuradas correctamente antes de proceder con la instalación y ejecución de la aplicación.

# Documentación de Componentes de React

## Componente App

El componente `App` es el componente principal de la aplicación. Importa y utiliza otros componentes como `Header`, `Sidebar`, `Footer`, `MenuOptions` y `CategoryProducts`.

### Variables de Estado

- `selectedCategory`: Esta variable de estado se utiliza para almacenar la categoría seleccionada actualmente. Se establece inicialmente en `null`.
- `cart`: Esta variable de estado se utiliza para almacenar los elementos en el carrito. Se inicializa como un array vacío.

### Categorías

La constante `categories` es un array de objetos, cada uno representando una categoría. Cada objeto de categoría tiene un `name` y un array `products`. Cada producto es un objeto con un `id`, `name` y `price`.

### Componentes Renderizados

- `Header`: Este componente siempre se renderiza en la parte superior de la aplicación.
- `Sidebar`: Este componente se renderiza en el lado izquierdo de la aplicación. Recibe `cart` como prop.
- `CategoryProducts`: Este componente se renderiza cuando se selecciona una categoría. Recibe `category`, `cart` y `setCart` como props.
- `MenuOptions`: Este componente se renderiza cuando no se ha seleccionado ninguna categoría. Recibe `setSelectedCategory` y `categories` como props.
- `Footer`: Este componente siempre se renderiza en la parte inferior de la aplicación. Recibe `cart` y `setCart` como props.

### Clases de CSS

- `app`: Esta clase se aplica al div principal que envuelve todos los componentes.
- `main-content`: Esta clase se aplica al div que envuelve la `Sidebar` y el contenido de la derecha.
- `content`: Esta clase se aplica al div que envuelve la `Sidebar` y el `content-right`.
- `content-right`: Esta clase se aplica al div que envuelve los componentes `CategoryProducts` o `MenuOptions` y `Footer`.


## Componente Header

El componente `Header` es un componente funcional que renderiza el encabezado de la aplicación.

### Importaciones

- React: La biblioteca de JavaScript para construir interfaces de usuario.
- logo: La imagen del logo importada desde el directorio de assets.
- Header.css: El archivo CSS que contiene los estilos para este componente.

### Elementos Renderizados

- `<header>`: El contenedor principal para el encabezado. Tiene una clase CSS de `header`.
- `<img>`: La imagen del logo. Tiene una clase CSS de `logo` y utiliza el `logo` importado como su fuente. El texto alternativo es "Logo de la Cafetería".
- `<h1>`: El título de la aplicación, "Cafetería Del Ángel".

### Clases de CSS

- `header`: Esta clase se aplica al contenedor principal del encabezado.
- `logo`: Esta clase se aplica a la imagen del logo.


## Componente Sidebar

El componente `Sidebar` es un componente funcional que renderiza un resumen de los elementos en el carrito.

### Importaciones

- React: La biblioteca de JavaScript para construir interfaces de usuario.
- Sidebar.css: El archivo CSS que contiene los estilos para este componente.

### Props

- `cart`: Un array de elementos actualmente en el carrito. Cada elemento es un objeto con un `name` y un `price`.

### Variables

- `total`: El precio total de los elementos en el carrito. Se calcula reduciendo el array `cart` y sumando el `price` de cada elemento.

### Elementos Renderizados

- `<aside>`: El contenedor principal para la barra lateral. Tiene una clase CSS de `sidebar`.
- `<h2>`: El título de la barra lateral, "Resumen de la boleta".
- `<ul>`: Una lista de los elementos en el carrito. Cada elemento se renderiza como un elemento `<li>` con el `name` y `price` del elemento.
- `<div>`: Un contenedor para el precio total. Tiene una clase CSS de `total` y contiene dos elementos `<span>`: uno para el texto "Total" y otro para el precio total.

### Clases de CSS

- `sidebar`: Esta clase se aplica al contenedor principal de la barra lateral.
- `total`: Esta clase se aplica al contenedor del precio total.

## Componente Footer

El componente `Footer` es un componente funcional que renderiza un conjunto de botones en el pie de página de la aplicación.

### Importaciones

- React: La biblioteca de JavaScript para construir interfaces de usuario.
- Footer.css: El archivo CSS que contiene los estilos para este componente.

### Props

- `cart`: Un array de elementos actualmente en el carrito. Cada elemento es un objeto con un `name` y un `price`.
- `setCart`: Una función para actualizar el estado de `cart`.

### Funciones

- `removeLastItem`: Esta función elimina el último elemento del `cart`. Crea un nuevo array a partir de `cart`, elimina el último elemento del nuevo array y luego llama a `setCart` con el nuevo array.

### Elementos Renderizados

- `<footer>`: El contenedor principal para el pie de página. Tiene una clase CSS de `footer`.
- `<div>`: Un contenedor para los botones. Tiene una clase CSS de `button-container`.
- `<button>`: Hay seis botones en el pie de página. El primer botón tiene un controlador `onClick` que llama a `removeLastItem` cuando se hace clic en el botón.

### Clases de CSS

- `footer`: Esta clase se aplica al contenedor principal del pie de página.
- `button-container`: Esta clase se aplica al contenedor de botones.


## Componente MenuOptions

El componente `MenuOptions` es un componente funcional que renderiza un conjunto de botones para cada categoría.

### Importaciones

- React: La biblioteca de JavaScript para construir interfaces de usuario.
- MenuOptions.css: El archivo CSS que contiene los estilos para este componente.

### Props

- `setSelectedCategory`: Una función para actualizar el estado de `selectedCategory`.
- `categories`: Un array de objetos de categoría. Cada objeto de categoría tiene un `name` y un array `products`.

### Elementos Renderizados

- `<div>`: El contenedor principal para las opciones de menú. Tiene una clase CSS de `menu-options`.
- `<button>`: Un botón para cada categoría. La propiedad `key` se establece en el índice de la categoría en el array `categories`. El controlador `onClick` llama a `setSelectedCategory` con la categoría como argumento. El texto del botón es el `name` de la categoría.

### Clases de CSS

- `menu-options`: Esta clase se aplica al contenedor principal de las opciones de menú.


## Componente CategoryProducts

El componente `CategoryProducts` es un componente funcional que renderiza una lista de productos para una categoría seleccionada.

### Importaciones

- React: La biblioteca de JavaScript para construir interfaces de usuario.
- CategoryProducts.css: El archivo CSS que contiene los estilos para este componente.

### Props

- `category`: Un objeto que representa la categoría seleccionada. Tiene un `name` y un array `products`.
- `cart`: Un array de elementos actualmente en el carrito. Cada elemento es un objeto con un `name` y un `price`.
- `setCart`: Una función para actualizar el estado de `cart`.

### Funciones

- `addToCart`: Esta función agrega un producto al `cart`. Crea un nuevo array a partir de `cart`, agrega el producto al nuevo array y luego llama a `setCart` con el nuevo array.

### Elementos Renderizados

- `<div>`: El contenedor principal para los productos de la categoría. Tiene una clase CSS de `category-products`.
- `<ul>`: Una lista de los productos en la categoría. Cada producto se renderiza como un elemento `<li>` con un `<button>` que tiene un controlador `onClick` que llama a `addToCart` con el producto como argumento. El texto del botón es el `name` del producto.

### Clases de CSS

- `category-products`: Esta clase se aplica al contenedor principal de los productos de la categoría.


