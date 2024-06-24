import React, {useState} from 'react';
import { invoke } from "@tauri-apps/api/tauri";
import '../styles/CategoryForm.css';


const FormularioCategoria = ({ closeModal }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  
  const handleInputChange = (event) => {
    setCategoryName(event.target.value);
    setError('');
  };

  const addCategory = (event) => {
    event.preventDefault();

    if (!categoryName.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }

    invoke("add_category", { nombre: categoryName });
  };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-button" onClick={closeModal}>X</button>
          <h2>Categoría</h2>
          <form>
            <div>
              <label>Nombre de categoría: </label>
              <input
              type="text"
              name="nombre"
              value={categoryName}
              onChange={handleInputChange}
              />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
              <button className='send-button' onClick={addCategory} type="submit">Enviar</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default FormularioCategoria;