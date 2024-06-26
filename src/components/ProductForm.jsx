import React, {useState} from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import '../styles/ProductForm.css';


const ProductForm = ({ closeProdForm, categories }) => {
    const [productName, setProductName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [error, setError] = useState('');
  
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

  const addProduct = (event) => {
    event.preventDefault();

    if (!productName.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }
    if (!productPrice.trim()) {
      setError('El precio del producto no puede estar vacío');
      return;
    }

    if (isNaN(productPrice) || productPrice <= 0) {
        setError('El precio del producto debe ser un número positivo');
        return;
      }
    if (!categoryId) {
        setError('Debe seleccionar una categoría');
        return;
    }

    const idCategoria = parseInt(categoryId, 10);
    const precio = parseInt(productPrice, 10);

    invoke("add_product", { nombre: productName, idCategoria, precio });
    closeProdForm();
  };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-button" onClick={closeProdForm}>X</button>
          <h2>Producto</h2>
          <form>
            <div>
              <label>Nombre de producto: </label>
              <input
              type="text"
              name="nombre"
              value={productName}
              onChange={handleProductNameChange}
              />
            </div>
            <div>
              <label>Precio del producto: </label>
              <input
              type="text"
              name="precio"
              value={productPrice}
              onChange={handleProductPriceChange}
              />
            </div>
            <div>
            <label>Categoría: </label>
            <select value={categoryId} onChange={handleCategoryIdChange}>
                <option value="">Seleccione una categoría</option>
                {categories.map((category) => (
                    <option key={category.id_categoria} value={category.id_categoria}>{category.nombre_categoria}</option>
                ))}
            </select>
          </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
              <button className='send-button' onClick={addProduct} type="submit">Enviar</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default ProductForm;