extern crate cc;

fn main() {
    // Compilar el código C++
    cc::Build::new()
        .cpp(true)
        .file("printer-cpp/printer.cpp")
        .flag_if_supported("-lgdi32")
        .flag_if_supported("-lcomdlg32")
        .compile("printer");

    // Construir la aplicación Tauri
    tauri_build::build()
}