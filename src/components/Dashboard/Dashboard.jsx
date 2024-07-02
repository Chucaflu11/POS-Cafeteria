import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api';

import '../../styles/Dashboard/Dashboard.css';
import ChecksCard from './ChecksCard';

function Dashboard() {
    const [checks, setChecks] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isLastPage, setIsLastPage] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function fetchData() {
            try {
                const fetchedChecks = await invoke('get_checks', { page, pageSize });
                setChecks(fetchedChecks);
                setIsLastPage(fetchedChecks.length === 0);
                const totalChecks = await invoke('get_total_checks_count');
                setTotalPages(Math.ceil(totalChecks / pageSize));
            } catch (error) {
                console.error('Error al obtener datos:', error);
                setTotalPages(1);
            }
        }

        fetchData();
    }, [page, pageSize]);

    const handlePageChange = (newPage) => {
        if (!isLastPage || newPage < page) {
            setPage(newPage);
        }
    };

    const renderPageButtons = () => {
        const buttons = [];
        const maxVisibleButtons = 4; // Máximo de botones numéricos visibles

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
                    className={i === page ? 'active' : ''} // Clase 'active' para el botón de la página actual
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


    const sortedChecks = [...checks].sort((a, b) => Number(b.id_boleta) - Number(a.id_boleta));

    return (
        <div className='dashboard-content'>
            <div className='title-dashboard'>
                <h1>Boletas</h1>
            </div>
            <div>
                <ChecksCard checks={sortedChecks} />
                <div className="pagination-controls">
                    {renderPageButtons()}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;