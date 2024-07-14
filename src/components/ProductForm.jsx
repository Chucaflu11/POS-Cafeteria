import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import '../styles/ProductForm.css';

function ProductForm({ closeProdForm, categories, isEditing, setIsEditing, currentProduct }) {
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [error, setError] = useState('');

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (isEditing && currentProduct) {
      setProductName(currentProduct.nombre_producto);
      setCategoryId(currentProduct.id_categoria.toString()); // Asegúrate de que categoryId sea una cadena
      setProductPrice(currentProduct.precio_producto.toString());
    } else {
      // Limpiar los campos si estamos agregando
      setProductName('');
      setCategoryId('');
      setProductPrice('');
    }
  }, [isEditing, currentProduct]);

  const handleProductNameChange = (event) => {
    setProductName(event.target.value);
    setError('');
  };

  const handleProductPriceChange = (event) => {
    setProductPrice(event.target.value);
    setError('');
  };

  const handleCategoryIdChange = (event) => {
    setCategoryId(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!productName.trim()) {
      setError('El nombre del producto no puede estar vacío');
      return;
    }
    if (!productPrice.trim()) {
      setError('El precio del producto no puede estar vacío');
      return;
    }
    if (isNaN(productPrice) || parseFloat(productPrice) <= 0) {
      setError('El precio del producto debe ser un número positivo');
      return;
    }
    if (!categoryId) {
      setError('Debe seleccionar una categoría');
      return;
    }

    const idCategoria = parseInt(categoryId, 10);
    const precio = parseInt(productPrice, 10);

    try {
      if (isEditing && currentProduct) {
        // Editar producto
        await invoke('update_product', {
          idProducto: currentProduct.id_producto,
          nuevoNombre: productName,
          nuevaCategoria: idCategoria,
          nuevoPrecio: precio,
        });
      } else {
        // Agregar producto
        await invoke('add_product', { nombre: productName, idCategoria: idCategoria, precio });
      }

      closeProdForm();
      setIsEditing(false);
    } catch (error) {
      setError('Error al guardar el producto. Verifica que la categoría exista.' + error); 
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeProdForm}>
          X
        </button>
        <h2>{isEditing ? 'Editar Producto' : 'Agregar Producto'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="nombre"
              className="product-name-input"
              value={productName}
              onChange={handleProductNameChange}
              placeholder="Nombre del producto"
            />
          </div>
          <div>
            <input
              type="number"
              name="precio"
              className="product-price-input"
              value={productPrice}
              onChange={handleProductPriceChange}
              placeholder="Precio del producto"
            />
          </div>
          <div>
            <select className="category-select" value={categoryId} onChange={handleCategoryIdChange}>
              <option value="">Seleccione una categoría</option>
              {categories.map((category) => (
                <option key={category.id_categoria} value={category.id_categoria}>
                  {category.nombre_categoria}
                </option>
              ))}
            </select>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div>
            <button className="send-product-button" type="submit">
              {isEditing ? 'Guardar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
