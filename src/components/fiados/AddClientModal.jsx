import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import '../../styles/fiados/AddClientModal.css';

function AddClientModal({ closeClientModal, fetchData, isEditing, currentClient }) {
  const [clientName, setClientName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing && currentClient) {
      setClientName(currentClient.client_name);
    } else {
      setClientName('');
    }
  }, [isEditing, currentClient]);

  const handleInputChange = (event) => {
    setClientName(event.target.value);
    setError('');
  };

  const addClient = async (event) => {
    event.preventDefault();

    if (!clientName.trim()) {
      setError('El nombre del cliente no puede estar vacío');
      return;
    }

    try {
      if (isEditing && currentClient) {
        await invoke('update_client', {
          clientId: currentClient.client_id,
          nuevoNombre: clientName,
        });
      } else {
        await invoke('add_client', { nombre: clientName });
      }

      fetchData();
    } catch (error) {
      setError('Error al guardar el cliente');
    }
    closeClientModal();
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-client-content">
        <div className="client-form-header">
          <h2>{isEditing ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
          <button className="close-client-form-button" onClick={closeClientModal}>
            X
          </button>
        </div>
        <form>
          <div>
            <input
              className="client-name-input"
              type="text"
              name="nombre"
              value={clientName}
              onChange={handleInputChange}
              placeholder="Ingrese el nombre del cliente"
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className="send-button-container">
            <button className="send-client-button" onClick={addClient} type="submit">
              {isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddClientModal;
