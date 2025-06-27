import React, { useEffect, useState, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { KPI, ADDKPI, editKpi } from '../API/slice/API'; 
import Header from '../components/Header';
import { KPIButton } from '../style/style';
import { UserContext } from '../ContextState/contextState';
import { useNavigate } from 'react-router-dom';
import EditKPIModal from "../components/EditModal"; 
import Modal from "../Modal/Modal"

const KPIGrid = () => {
  const dispatch = useDispatch();
  const { kpiData, kpiStatus } = useSelector(state => state.API);
  const [rows, setRows] = useState([]);
  const [openNewKPI, setOpenNewKPI] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);

  const { open, Role, SetRole } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      SetRole(storedRole);
    }
    if (storedRole !== 'admin') {
      navigate('/');
    }
  }, [SetRole, navigate]);

  useEffect(() => {
    dispatch(KPI());
  }, [dispatch]);

  useEffect(() => {
    if (kpiStatus === 'succeeded' && Array.isArray(kpiData)) {
      const mappedRows = kpiData.map(entry => ({
        id: entry.id,
        kpi_name: entry.kpi_name,
        role: entry.role,
        target: entry.target || 'N/A',
        status: entry.status || 'inactive'
      }));
      setRows(mappedRows);
    }
  }, [kpiData, kpiStatus]);

  const getStatusStyle = status => {
    const styles = {
      active: { color: 'green', fontWeight: 'bold' },
      inactive: { color: 'red', fontWeight: 'bold' },
      pending: { color: 'orange', fontWeight: 'bold' }
    };
    return styles[status] || {};
  };

  const handleShowKPI = (kpi = null) => {
    setSelectedKPI(kpi || {}); 
    setOpenNewKPI(true);
  };

  const handleClose = () => {
    setOpenNewKPI(false);
    setSelectedKPI(null);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'kpi_name', headerName: 'KPI', width: 200 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'target', headerName: 'Target', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: params => (
        <div style={getStatusStyle(params.row.status)}>
          {params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1)}
        </div>
      )
    },
    {
      field: 'viewDetails',
      headerName: 'View Details',
      width: 150,
      renderCell: params => (
        <KPIButton
          style={{
            backgroundColor: '#4361EE',
            color: 'white',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '10px 20px',
            transition: 'background-color 0.3s ease',
            width: '100px',
            textAlign: 'center'
          }}
          onClick={() => handleShowKPI(params.row)}
        >
          Show KPI
        </KPIButton>
      )
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <Header
          title={'Key Performance Indicators'}
          subtitle={'Track and manage performance metrics effectively'}
        />
        <KPIButton style={{ marginLeft: 'auto' }} onClick={() => handleShowKPI()}>
          Add a KPI
        </KPIButton>
      </div>

      <DataGrid rows={rows} columns={columns} pageSize={5} autoHeight />

      {open && selectedKPI && (
        <Modal title={selectedKPI.kpi_name} data={selectedKPI} ModalType="KPI" />
      )}

      <EditKPIModal
        open={openNewKPI}
        onClose={handleClose}
        selectedKPI={selectedKPI}
        onSubmit={values => {
          if (selectedKPI && selectedKPI.id) {
            dispatch(editKpi(values)); 
          } else {
            dispatch(ADDKPI(values)); 
          }
          handleClose();
        }}
      />
    </>
  );
};

export default KPIGrid;
