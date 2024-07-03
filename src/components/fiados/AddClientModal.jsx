import React, { useState } from 'react';
import { invoke } from "@tauri-apps/api/tauri";

import '../../styles/fiados/AddClientModal.css'

function AddClientModal({ closeClientModal }) {
    const [clientName, setClientName] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (event) => {
        setClientName(event.target.value);
        setError('');
    };

    const addClient= (event) => {
        event.preventDefault();

        if (!clientName.trim()) {
            setError('El nombre del cliente no puede estar vacío');
            return;
        }
        try {
            invoke("add_client", { nombreCliente: clientName });
        } catch (error) {
            setError('Error al agregar el cliente');
        }
        closeClientModal();

    };

    return (
        <div className="modal-overlay">
            <div className="modal-client-content">
                <div className='client-form-header'>
                    <h2>Nombre</h2>
                    <button className="close-client-form-button" onClick={closeClientModal}>X</button>
                </div>
                <form>
                    <div>
                        <input className='client-name-input'
                            type="text"
                            name="nombre"
                            value={clientName}
                            onChange={handleInputChange}
                            placeholder="Ingrese el nombre del cliente"
                        />
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <div className='send-button-container'>
                        <button className='send-client-button' onClick={addClient} type="submit">Registrar Cliente</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClientModal;