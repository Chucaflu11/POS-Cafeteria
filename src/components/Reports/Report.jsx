import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api';
import {save} from '@tauri-apps/api/dialog'

import '../../styles/Reports/Report.css';

function Report() {
    const [error, setError] = useState('');
    const [salesSummary, setSalesSummary] = useState([]);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaCierre, setFechaCierre] = useState('');
    const [horaCierre, setHoraCierre] = useState('');
    const [efectivoInicial, setEfectivoInicial] = useState(0);
    const [efectivoFinal, setEfectivoFinal] = useState(0);
    const [ingresosEfectivo, setIngresosEfectivo] = useState(0);
    const [saldoReal, setSaldoReal] = useState(0);
    const [diferencias, setDiferencias] = useState(0);


    const handleReporteClick = async () => {
        try {
            const data = await invoke('get_sales_summary');
            setSalesSummary(data);
            console.log('Reporte cargado:', data);
        } catch (error) {
            console.error('Error al generar reporte:', error);
        }
    }

    const handleGenerateReportClick = async () => {
        try {
            // Crear el objeto CierreCajaData
            const cierreCajaData = {
              total_ventas: salesSummary.total_ventas,
              total_efectivo: salesSummary.total_ventas_efectivo,
              total_tarjeta: salesSummary.total_ventas_tarjeta,
              efectivo_inicial: parseInt(efectivoInicial),
              efectivo_final: parseInt(efectivoFinal),
              ingresos_efectivo: parseInt(ingresosEfectivo),
              saldo_real: parseInt(saldoReal),
              diferencia: diferencias,
              fecha_inicio: fechaInicio,
              fecha_cierre: fechaCierre,
              hora_cierre: horaCierre,
            };

            const name = fechaCierre.replace(/\//g, '') + '_' + horaCierre.replace(/:/g, '-');
            
            const save_path = await save({
              defaultPath: '/' + name,
              filters: [{
                name: 'Excel',
                extensions: ['csv']
              }]
            });
            console.log('Guardado en:', save_path);
            await invoke('generate_final_report', {
              csvPath: save_path,
              cierreCajaData: cierreCajaData,
            });
        } catch (error) {
            setError('Error al generar reporte: '+ error);
        }
    }

    // Calcular efectivoFinal cuando ingresosEfectivo cambia
    useEffect(() => {
      const ventasEfectivo = parseInt(ingresosEfectivo) || 0;
      const efectivoInicialValue = parseInt(efectivoInicial) || 0;
      setEfectivoFinal(efectivoInicialValue + ventasEfectivo);
    }, [ingresosEfectivo, efectivoInicial]);

    // Calcular diferencias cuando saldoEsperado o saldoReal cambian
    useEffect(() => {
      setDiferencias(parseInt(salesSummary.total_ventas) - parseInt(saldoReal) || 0);
    }, [saldoReal]);

    useEffect(() => {
      setSaldoReal(parseInt(ingresosEfectivo) + parseInt(salesSummary.total_ventas_tarjeta) || 0);
    }, [ingresosEfectivo, salesSummary.total_ventas_tarjeta]);

    useEffect(() => {
        const obtenerFechaHoraCierre = async () => {
            try {
                const timestamp = await invoke('send_timestamp');
                const [fecha, hora] = timestamp.split(' '); // Separar fecha y hora
                setFechaInicio(fecha);
                setFechaCierre(fecha);
                setHoraCierre(hora);
            } catch (error) {
                console.error('Error al obtener fecha y hora:', error);
            }
        };

        obtenerFechaHoraCierre(); // Obtener al cargar el componente
    }, []);
    
    return (
        <div className="cierre-caja-container">
          {/* Cuadro 1: Fechas */}
          <div className="cuadro">
            <label htmlFor="fechaInicio">Fecha Inicio:</label>
            <input type="text" id="fechaInicio" value={fechaInicio} placeholder='Fecha' onChange={(e) => setFechaInicio(e.target.value)} />
    
            <label htmlFor="fechaCierre">Fecha Cierre:</label>
            <input type="text" id="fechaCierre" value={fechaCierre} placeholder='Fecha' onChange={(e) => setFechaCierre(e.target.value)} />
    
            <label htmlFor="horaCierre">Hora Cierre:</label>
            <input type="text" id="horaCierre" value={horaCierre} placeholder='Hora' onChange={(e) => setHoraCierre(e.target.value)} />
          </div>
    
          {/* Cuadro 2: Ventas */}
          <div className="cuadro">
            <label htmlFor="totalVentas">Total Ventas:</label>
            <input type="text" id="totalVentas" value={salesSummary.total_ventas} placeholder='$' onChange={(e) => setTotalVentas(e.target.value)} />
    
            <label htmlFor="ventasEfectivo">Ventas Efectivo:</label>
            <input type="text" id="ventasEfectivo" value={salesSummary.total_ventas_efectivo} placeholder='$' onChange={(e) => setVentasEfectivo(e.target.value)} />
    
            <label htmlFor="ventasTarjeta">Ventas Tarjeta:</label>
            <input type="text" id="ventasTarjeta" value={salesSummary.total_ventas_tarjeta} placeholder='$' onChange={(e) => setVentasTarjeta(e.target.value)} />
          </div>
    
          {/* Cuadro 3: Efectivo */}
          <div className="cuadro">
            <label htmlFor="efectivoInicial">Efectivo Inicial:</label>
            <input type="text" id="efectivoInicial" value={efectivoInicial} placeholder='$' onChange={(e) => setEfectivoInicial(e.target.value)} />
    
            <label htmlFor="ingresosEfectivo">Ingresos Efectivo:</label>
            <input type="text" id="ingresosEfectivo" value={ingresosEfectivo} placeholder='$' onChange={(e) => setIngresosEfectivo(e.target.value)} />
    
            <label htmlFor="efectivoFinal">Efectivo Final:</label>
            <input type="text" id="efectivoFinal" value={efectivoFinal} placeholder='$' readOnly /> {/* Solo lectura */}
          </div>
    
          {/* Cuadro 4: Saldos */}
          <div className="cuadro">
            <label htmlFor="saldoEsperado">Saldo Esperado:</label>
            <input type="text" id="saldoEsperado" value={salesSummary.total_ventas} placeholder='$' readOnly />
    
            <label htmlFor="saldoReal">Saldo Real:</label>
            <input type="text" id="saldoReal" value={saldoReal} placeholder='$' readOnly />
    
            <label htmlFor="diferencias">Diferencias:</label>
            <input type="text" id="diferencias" value={diferencias} placeholder='$' readOnly /> {/* Solo lectura */}
          </div>
    
          {/* Botones */}
          <button className='report-button' onClick={handleGenerateReportClick} >Reporte</button>
          <button className='load-report-button' onClick={handleReporteClick}>Cargar Reporte</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      );
};

export default Report;