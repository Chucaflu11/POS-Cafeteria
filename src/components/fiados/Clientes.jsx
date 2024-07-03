import React, { useEffect, useState } from 'react';

import { invoke } from '@tauri-apps/api';

import AddClientModal from './AddClientModal';

import '../../styles/fiados/Clientes.css';
import ClientsCard from './ClientsCard';

function Clientes() {
    const [fetchedClients, setFetchedClients] = useState([]);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isLastPage, setIsLastPage] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    const openClientModal = () => {
        setIsClientModalOpen(true);
    };

    const closeClientModal = () => {
        setIsClientModalOpen(false);
    };

    const fetchData = async () => {
        try {
            const fetchedData = await invoke('get_fiado_data', { page, pageSize });
            setFetchedClients(fetchedData);
            console.log('Datos fiados obtenidos:', fetchedData);
            setIsLastPage(fetchedData.length === 0);
            const totalClients = await invoke('get_clientes_fiados_count');
            console.log('Total de clientes:', totalClients);
            setTotalPages(Math.ceil(totalClients / pageSize));
        } catch (error) {
            console.error('Error al obtener datos:', error);
            setTotalPages(1);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, pageSize]);

    const handlePageChange = (newPage) => {
        if (!isLastPage || newPage < page) {
            setPage(newPage);
        }
    };

    const renderPageButtons = () => {
        const buttons = [];
        const maxVisibleButtons = 4;

        // Botón "Anterior"
        buttons.push(
            <button className="prev-button" key="prev" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                &larr; Anterior
            </button>
        );

        // Botones numéricos
        let startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        if (startPage > 1) {
            buttons.push(<button key={1} onClick={() => handlePageChange(1)}>1</button>);
            if (startPage > 2) {
                buttons.push(<span key="ellipsis1">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={i === page ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages - 1) {
            buttons.push(<span key="ellipsis2">...</span>);
        }

        if (endPage < totalPages) {
            buttons.push(<button key={totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</button>);
        }

        // Botón "Siguiente"
        buttons.push(
            <button className="next-button" key="next" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                Siguiente &rarr;
            </button>
        );

        return buttons;
    };
    
    const sortedChecks = fetchedClients.sort((a, b) => a.client_id - b.client_id);

    return (
        <div className='clients-content' >
            <ClientsCard fetchedClients={sortedChecks} fetchData={fetchData}/>
            <button className="add-client-button" onClick={openClientModal}> 
                <span> + </span>
            </button>
            {isClientModalOpen && (
                <AddClientModal closeClientModal={closeClientModal} />
            )}
            <div className='pagination-controls'>
                {renderPageButtons()}
            </div>
        </div>
    );
}

export default Clientes;
