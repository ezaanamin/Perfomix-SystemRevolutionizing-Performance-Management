import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Header from "../components/Header";
import { KPIButton } from '../style/style';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../ContextState/contextState';
import { useContext } from 'react';
import Modal from "../Modal/Modal"
import { useNavigate } from "react-router-dom";

function Users() {
  const [rows, setRows] = useState([
    { id: 1, role: 'Software Engineer', kpi: 'Code Quality', target: 95.00, status: 'active' },
    { id: 2, role: 'Software Engineer', kpi: 'Code Efficiency', target: 10.00, status: 'inactive' },
    { id: 3, role: 'Software Engineer', kpi: 'Commit Frequency', target: 10, status: 'active' },
    { id: 4, role: 'Software Engineer', kpi: 'Task Completion Rate', target: 90.00, status: 'inactive' },
    { id: 5, role: 'Project Manager', kpi: 'Milestone Achievement Rate', target: 95.00, status: 'active' },
    { id: 6, role: 'Project Manager', kpi: 'Budget Utilization', target: 5.00, status: 'inactive' },
    { id: 7, role: 'Project Manager', kpi: 'Resource Allocation', target: 85.00, status: 'active' },
    { id: 8, role: 'Business Manager', kpi: 'Revenue Growth', target: 10.00, status: 'inactive' },
    { id: 9, role: 'Business Manager', kpi: 'Customer Satisfaction', target: 80.00, status: 'active' },
    { id: 10, role: 'Business Manager', kpi: 'Operational Efficiency', target: 15.00, status: 'inactive' },
    { id: 11, role: 'Testing Team', kpi: 'Test Case Coverage', target: 95.00, status: 'active' },
    { id: 12, role: 'Testing Team', kpi: 'Bug Detection Rate', target: 100, status: 'inactive' },
    { id: 13, role: 'Testing Team', kpi: 'Test Execution Time', target: 20.00, status: 'active' },
  ]);

  const data = [
    { id: 1, name: "John Doe", status: "Active" },
    { id: 2, name: "Jane Smith", status: "Inactive" },
    { id: 3, name: "Alice Johnson", status: "Active" },
    { id: 4, name: "Bob Brown", status: "Inactive" },
  ];

    const userContext = useContext(UserContext);
    const { setOpen,open, Role,SetRole } = userContext;
    const [opennewKPI, setopennewKPI] = useState(false);
    const [KPITitle,SetNewKPI]=useState("")
    const navigate = useNavigate();
  useEffect(() => {
      const accessToken = localStorage.getItem("access_token");
      const role = localStorage.getItem("role");
      SetRole(role)
      if (role !== 'admin' || !accessToken) {
          navigate('/');
      }
  }, [Role, navigate]); 


  const HandleShowKPI = async (title) => {
    await SetNewKPI(title)
    setOpen(!open)
 }


  const handleOpen = () => {
    setopennewKPI(true);
  };


  const handleClose = () => {
    setopennewKPI(false);
  };


  const handleAddKPI = (values) => {
    const newRow = {
      id: rows.length + 1,  
      role: values.role,
      kpi: values.kpi,
      target: parseFloat(values.target),
      status: 'inactive',  
    };
    setRows([...rows, newRow]);
    handleClose(); 
  };


  const validationSchema = Yup.object({
    role: Yup.string().required('Role is required'),
    kpi: Yup.string().required('KPI Name is required'),
    target: Yup.number().required('Target is required').positive('Target must be positive').max(100, 'Target must be less than or equal to 100'),
  });

  const getStatusStyle = (status) => {
    const baseStyle = {
      color: 'white',
      borderRadius: '20px',
      width: 100,
      textAlign: 'center',
      marginBottom: 100,
    };
  
    const statusStyles = {
      active: { backgroundColor: '#4CAF50' }, 
      inactive: { backgroundColor: '#F44336' }, 
    };
  
    return { ...baseStyle, ...statusStyles[status] || statusStyles.inactive };
  };
  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
        <Header title={"Key Performance Indicators"} subtitle={"Track and manage performance metrics effectively"} />
        <KPIButton style={{ marginLeft: "auto" }} onClick={handleOpen}>
          Add a KPI
        </KPIButton>
      </div>

      <Box
        mt="40px"
        position="relative"
        width="100%" 
        height="75vh"
        sx={{
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          "& .MuiDataGrid-root": {
            border: "none",
            width: "80%",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#D0DBE9", 
            color: "#2D3A56", 
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#F0F7FF",
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#D0DBE9",
            color: "#2D3A56",
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: "#4361EE", 
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={[
            { field: 'kpi', headerName: 'KPI', width: 200 },
            { field: 'role', headerName: 'Role', width: 200 },
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
    marginBottom: "20px",       
    fontSize: "14px",          
    cursor: "pointer",        
    border: "none",             
    padding: "10px 20px",      
    transition: "background-color 0.3s ease", 
    width: "100px",           
    textAlign: "center",       
  }}
                  // onClick={() => alert(`Show details for KPI with ID: ${params.row.kpi}`)}
                                //HandleShowKPI

                                onClick={()=>(HandleShowKPI(params.row.kpi))}
                >
                  Show KPI
                </KPIButton>
              ),
            },
          ]}
          pageSize={1}
          rowsPerPageOptions={[5]}
        />
      </Box>

      {open && (
        <Modal
          title={KPITitle} 
          data={data}  
          ModalType={"KPI"}        
       
        />
      )}
      <Dialog open={opennewKPI} onClose={handleClose}>
        <DialogTitle>Add New KPI</DialogTitle>
        <Formik
          initialValues={{
            role: '',
            kpi: '',
            target: '',
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleAddKPI(values)}
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
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  Add KPI
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
}

export default Users;
