import React, { useEffect, useState, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { User } from "../API/slice/API";
import Header from "../components/Header";
import { KPIButton } from '../style/style';
import { UserContext } from '../ContextState/contextState';
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const UserGrid = () => {
  const dispatch = useDispatch();
  const { userData, userStatus, error } = useSelector((state) => {
    console.log("Redux State:", state.API); // Log the state to verify data
    return state.API;
  });
  
  const [rows, setRows] = useState([]);
  const [openNewUser, setOpenNewUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
    dispatch(User());
  }, [dispatch]);

  useEffect(() => {
    console.log(userStatus,'ezaan')

    if (userStatus === 'succeeded' && Array.isArray(userData) && userData.length > 0) {
      console.log(userData,'ezaan')
      setRows(userData.map(entry => ({
        id: entry.user_id, // Make sure this matches the API response
        name: entry.name,
        email: entry.email,
        role: entry.role,
        team_name: entry.team_name || 'N/A',  // Update the field name from team_id to team_name
      })));
    } else if (userStatus === 'failed') {
      console.error("Failed to fetch users:", userData);
    }
  }, [userData, userStatus]);

  const handleShowUser = (user) => {
    setSelectedUser(user);
    setOpenNewUser(true);
  };

  const handleClose = () => {
    setOpenNewUser(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
        <Header title={"Users"} subtitle={"Manage and track user data"} />
        <KPIButton style={{ marginLeft: "auto" }} onClick={() => setOpenNewUser(true)}>
          Add User
        </KPIButton>
      </div>
      <DataGrid
        rows={rows}
        columns={[
          { field: 'id', headerName: 'ID', width: 80 },
          { field: 'name', headerName: 'Name', width: 200 },
          { field: 'email', headerName: 'Email', width: 250 },
          { field: 'role', headerName: 'Role', width: 150 },
          { field: 'team_name', headerName: 'Team Name', width: 150 },  // Updated to show team_name
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
                onClick={() => handleShowUser(params.row)}
              >
                Show User
              </KPIButton>
            ),
          },
        ]}
        pageSize={5}
      />

      {open && selectedUser && (
        <Modal
          title={selectedUser.name}
          data={selectedUser}
          ModalType="User"
        />
      )}

      <Dialog open={openNewUser} onClose={handleClose}>
        <DialogTitle>Add New User</DialogTitle>
        <Formik
          initialValues={{ name: '', email: '', role: '', team_name: '' }}  // Change to team_name
          validationSchema={Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            role: Yup.string().oneOf(['employee', 'manager', 'admin'], 'Role must be either Employee, Manager, or Admin').required('Role is required'),
            team_name: Yup.string().required('Team Name is required'),  // Validation for team_name
          })}
          onSubmit={(values) => {
            console.log("New User:", values);
            // dispatch(ADDUser(values));  // Add functionality to add user
            handleClose();
          }}
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
                  label="Team Name"
                  name="team_name"
                  value={values.team_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  error={touched.team_name && Boolean(errors.team_name)}
                  helperText={touched.team_name && errors.team_name}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">Cancel</Button>
                <Button type="submit" color="primary">Add User</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};

export default UserGrid;
