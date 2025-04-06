import React, { useEffect, useState, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { KPI,ADDKPI } from "../API/slice/API";
import Header from "../components/Header";
import { KPIButton } from '../style/style';
import { UserContext } from '../ContextState/contextState';
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const KPIGrid = () => {
  const dispatch = useDispatch();
  const { kpiData, kpiStatus } = useSelector(state => state.API);
  const [rows, setRows] = useState([]);
  const [openNewKPI, setOpenNewKPI] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);

  const { open, Role, SetRole } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
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
    console.log(kpiData)
    if (kpiStatus === 'succeeded' && Array.isArray(kpiData)) {
      setRows(kpiData.map(entry => ({
        id: entry.id,
        kpi_name: entry.kpi_name,
        role: entry.role,
        target: entry.target || 'N/A',
        status: entry.status || 'inactive',
      })));
    }
  }, [kpiData, kpiStatus]);

  const getStatusStyle = (status) => ({
    active: { color: 'green', fontWeight: 'bold' },
    inactive: { color: 'red', fontWeight: 'bold' },
    pending: { color: 'orange', fontWeight: 'bold' },
  }[status] || {});

  const handleShowKPI = (kpi) => {
    setSelectedKPI(kpi);
    setOpenNewKPI(true);
  };

  const handleClose = () => {
    setOpenNewKPI(false);
    setSelectedKPI(null);
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
        <Header title={"Key Performance Indicators"} subtitle={"Track and manage performance metrics effectively"} />
        <KPIButton style={{ marginLeft: "auto" }} onClick={handleShowKPI}>
          Add a KPI
        </KPIButton>
      </div>
      <DataGrid
        rows={rows}
        columns={[
          { field: 'id', headerName: 'ID', width: 80 },
          { field: 'kpi_name', headerName: 'KPI', width: 200 },
          { field: 'role', headerName: 'Role', width: 150 },
          { field: 'target', headerName: 'Target', width: 150 },
          {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => (
              <div style={getStatusStyle(params.row.status)}>
                {params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1)}
              </div>
            ),
          },
          {
            field: 'viewDetails',
            headerName: 'View Details',
            width: 150,
            renderCell: (params) => (
              <KPIButton
                style={{
                  backgroundColor: "#4361EE",
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "14px",
                  cursor: "pointer",
                  padding: "10px 20px",
                  transition: "background-color 0.3s ease",
                  width: "100px",
                  textAlign: "center",
                }}
                
              >
                Show KPI
              </KPIButton>
            ),
          },
        ]}
        pageSize={5}
      />

      {open && selectedKPI && (
        <Modal
          title={selectedKPI.kpi_name} 
          data={selectedKPI}  
          ModalType="KPI"        
        />
      )}

      <Dialog open={openNewKPI} onClose={handleClose}>
        <DialogTitle>Add New KPI</DialogTitle>
        <Formik
          initialValues={{ role: '', kpi: '', target: '' }}
          validationSchema={Yup.object({
            role: Yup.string().oneOf(['employee', 'manager', 'admin'], 'Role must be either Employee, Manager, or Admin')
            .required('Role is required'),
            kpi: Yup.string().required('KPI Name is required'),
            target: Yup.number().positive().integer().required('Target is required'),
          })}
          onSubmit={(values) => {
            console.log("New KPI:", values);
            dispatch(ADDKPI(values))
            handleClose();
          }}
        >
          {({ touched, errors, handleChange, handleBlur, values }) => (
            <Form>
              <DialogContent>
                <Field
                  as={TextField}
                  label="Role"
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.role && Boolean(errors.role)}
                  helperText={touched.role && errors.role}
                />
                <Field
                  as={TextField}
                  label="KPI Name"
                  name="kpi"
                  value={values.kpi}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.kpi && Boolean(errors.kpi)}
                  helperText={touched.kpi && errors.kpi}
                />
                <Field
                  as={TextField}
                  label="Target"
                  name="target"
                  value={values.target}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  type="number"
                  error={touched.target && Boolean(errors.target)}
                  helperText={touched.target && errors.target}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">Cancel</Button>
                <Button type="submit" color="primary">Add KPI</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default KPIGrid;
