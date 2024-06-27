import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api';

import '../../styles/Dashboard/Dashboard.css';
import ChecksCard from './ChecksCard';

function Dashboard() {
    const [checks, setChecks] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isLastPage, setIsLastPage] = useState(false);

    const getChecks = async (page, pageSize) => {
        const fetchedChecks = await invoke('get_checks', { page, pageSize });
        setChecks(fetchedChecks);
        setIsLastPage(fetchedChecks.length === 0); 
    };

    React.useEffect(() => {
        getChecks(page, pageSize);
    }, [page, pageSize]);

    const handlePageChange = (newPage) => {
        if (!isLastPage || newPage < page) {
            setPage(newPage);
        }
    };

    const sortedChecks = [...checks].sort((a, b) => Number(b.id_boleta) - Number(a.id_boleta));

    return (
        <div className='dashboard-content'>
            <div className='title-dashboard'>
                <h1>Boletas</h1>
                <button className='refresh-button' onClick={() => getChecks(page, pageSize)}> Recargar Boletas </button>
            </div>
            <div>
                <ChecksCard checks={sortedChecks} />
                <div className="pagination-controls">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}> &larr; </button>
                    <span> {page} </span>
                    <button onClick={() => handlePageChange(page + 1)} disabled={isLastPage}> &rarr; </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;