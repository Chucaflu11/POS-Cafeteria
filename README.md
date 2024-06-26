# Cafetería del Ángel

## Prerrequisitos

Antes de comenzar a trabajar con esta aplicación, asegúrate de tener instalados los siguientes elementos:

1. **Tauri:** Tauri es un framework para construir aplicaciones de escritorio con tecnologías web. Puedes encontrar instrucciones detalladas de instalación en [el sitio web oficial de Tauri](https://tauri.studio/docs/getting-started/intro).

2. **React:** React es una biblioteca de JavaScript para construir interfaces de usuario. Si no tienes React instalado, puedes seguir [las instrucciones de instalación](https://es.reactjs.org/docs/getting-started.html).

3. **rustqlite:** Rustqlite es una biblioteca de SQLite para Rust. Aunque viene incluida en el `Cargo.toml`, puede que necesites instalar SQLite en tu sistema. Puedes hacerlo utilizando el administrador de paquetes de tu sistema operativo o a través de [la página de descargas de SQLite](https://www.sqlite.org/download.html).

Asegúrate de tener todas estas dependencias instaladas y configuradas correctamente antes de proceder con la instalación y ejecución de la aplicación.

## Instalación

1. **Clonar el repositorio:**

    ```Bash
        git clone https://github.com/Chucaflu11/Cafeteria-del-Angel
    ```

2. **Instalar las dependencias del proyecto, desde la carpeta raíz del proyecto:**

    ```bash
    npm install
    cd src-tauri
    cargo build
    cd ..
    ```

3. Para ejecutar el entorno de desarrollo, desde la carpeta raíz del proyecto:

    ```bash
    npm run tauri dev
    ```

    En el entorno de desarrollo se ejecutará la aplicación de forma normal, pero el rendimiento puede verse reducido debido a que se está ejecutando en modo desarrollo.

4. Para ejecutar la aplicación, desde la carpeta raíz del proyecto:

    ```bash
    npm run tauri build
    ```

    Esto creará un archivo `register_1.0.0_x64-setup.exe` en la carpeta `\src-tauri\target\release\bundle\nsis`.
    Este archivo corresponde al instalador. Para ejecutar la aplicación, se debe ejecutar este archivo, y seguir las instrucciones que aparecen en la pantalla.
