import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Header from "../components/Header";
import { KPIButton } from '../style/style';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { UserContext } from '../ContextState/contextState';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Modal from "../Modal/Modal"
function Users() {
  const [rows, setRows] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Software Engineer', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Project Manager', status: 'Inactive' },
    { id: 3, name: 'Samuel Lee', email: 'samuel@example.com', role: 'Business Manager', status: 'Active' },
    { id: 4, name: 'Emily Brown', email: 'emily@example.com', role: 'Testing Team', status: 'Active' },
    { id: 5, name: 'Michael White', email: 'michael@example.com', role: 'Software Engineer', status: 'Inactive' },
  ]);

  // State for Modal
  const [openAddUsers, setopenAddUsers] = useState(false);
  const userContext = useContext(UserContext);
    const { setOpen,open, Role,SetRole } = userContext;
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const role = localStorage.getItem("role");
        SetRole(role)
        if (role !== 'admin' || !accessToken) {
            navigate('/');
        }
    }, [Role, navigate]); 
  
  
  const handleopenAddUsers = () => {
    setopenAddUsers(true);
  };

  const handleClose = () => {
    setopenAddUsers(false);
  };

  const handleOpen=()=>{
    setOpen(true)
  }

  const handleAddUser = (values) => {
    const newRow = {
      id: rows.length + 1,  // Assuming new ID will be one more than the current length
      name: values.name,
      email: values.email,
      role: values.role,
      status: values.status,
    };
    setRows([...rows, newRow]);
    handleClose(); // Close modal
  };

  // Validation schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    role: Yup.string().required('Role is required'),
    status: Yup.string().required('Status is required'),
  });

  // Function to apply styling based on status
  const getStatusStyle = (status) => {
    return status === 'Active'
      ? { backgroundColor: '#4CAF50', color: 'white', borderRadius: '20px',width:100,textAlign:"center" }
      : { backgroundColor: '#F44336', color: 'white', borderRadius: '20px',width:100,textAlign:"center" };
  };

  const data = [
    { id: 1, user: "Alice", team: "Marketing", kpiScore: 85, kpiStatus: "Achieved", status: "Active" },
    { id: 2, user: "Bob", team: "Development", kpiScore: 72, kpiStatus: "Not Achieved", status: "Active" },
    { id: 3, user: "Charlie", team: "Sales", kpiScore: 45, kpiStatus: "Not Achieved", status: "Inactive" },
    { id: 4, user: "David", team: "HR", kpiScore: 90, kpiStatus: "Achieved", status: "Active" },
  ];
  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
        <Header title={"Users Management"} subtitle={"Manage your users efficiently"} />
        <KPIButton style={{ marginLeft: "auto" }} onClick={handleopenAddUsers}>
          Add a User
        </KPIButton>
      </div>

      <Box
        mt="40px"
        position="relative"
        width="100%" // Full width
        height="75vh"
        sx={{
          display: "flex", // Center the DataGrid
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          "& .MuiDataGrid-root": {
            border: "none",
            width: "80%", // Adjust table width
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#D0DBE9", // Background color
            color: "#2D3A56", // Secondary color
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: "#F0F7FF", // Primary light color
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: "#D0DBE9", // Background color
            color: "#2D3A56", // Secondary color
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: "#4361EE", // Button text color
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={[
            { field: 'name', headerName: 'Name', width: 200 },
            { field: 'email', headerName: 'Email', width: 250 },
            { field: 'role', headerName: 'Role', width: 200 },
            {
              field: 'status',
              headerName: 'Status',
              width: 150,
              renderCell: (params) => (
                <div style={getStatusStyle(params.row.status)}>
                  {params.row.status}
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
                    border: "none", 
                    transition: "background-color 0.3s ease",
                    width:100,
                  }}
                  onClick={() => handleOpen()}
                >
                  Show User
                </KPIButton>
              ),
            },
          ]}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </Box>

      {/* Modal for adding new user */}
      <Dialog open={openAddUsers} onClose={handleClose}>
        <DialogTitle>Add New User</DialogTitle>
        <Formik
          initialValues={{
            name: '',
            email: '',
            role: '',
            status: '',
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => handleAddUser(values)}
        >
          {({ touched, errors, handleChange, handleBlur, values }) => (
            <Form>
              <DialogContent>
                <Field
                  as={TextField}
                  label="Name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                <Field
                  as={TextField}
                  label="Email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
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
                  label="Status"
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.status && Boolean(errors.status)}
                  helperText={touched.status && errors.status}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  Add User
                </Button>
         ``     </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {open && (
        <Modal
        title={"Team 10"}
          ModalType={"Users"}
          data={data}        
       
        />
      )}
    </>
  );
}

export default Users;
