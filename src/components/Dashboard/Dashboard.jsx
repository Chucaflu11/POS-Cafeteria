import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api';

function Dashboard() {
    // Step 2: Initialize state for storing checks data
    const [checks, setChecks] = useState([]);

    // Step 3: Update getChecks to fetch and store checks data
    const getChecks = async () => {
        const fetchedChecks = await invoke('get_checks');
        setChecks(fetchedChecks); // Assuming fetchedChecks is an array
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <button onClick={getChecks}>Load Checks</button>
            {/* Step 4: Render Checks */}
            <div>
                {checks.map((check, index) => {
                return (
                    <div key={index}>
                        <h2>Check ID: {check.id_boleta}</h2>
                        <p>Fecha: {check.fecha}</p>
                        <p>Método de Pago: {check.metodo_pago}</p>
                        <p>Total: {check.total}</p>
                        <h3>Detalles:</h3>
                        {check.detalles ? (
                            <div>
                                <p>Producto ID: {check.detalles.id_producto}</p>
                                <p>Cantidad: {check.detalles.cantidad}</p>
                                <p>Precio Unitario: {check.detalles.precio_unitario}</p>
                            </div>
                        ) : <p>No details available</p>}
                    </div>
                );
            })}
            </div>
        </div>
    );
};

export default Dashboard;