import React from 'react';
import { BrowserRouter as Router, Routes as ReactRoutes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import AdminDashBorad from '../pages/AdminDashBorad';
import MangerDashBorad from '../pages/MangerDashBorad';
import StaffDashBorad from '../pages/StaffDashBorad';
import SidebarAdmin from '../components/SideBar'; // Import Sidebar
import Topbar from '../components/TopBar'; // Import Topbar
import { Box } from '@mui/material';

function AppRoutes() {
    return (
        <Router>
            <ReactRoutes>
                <Route path="/" element={<Login />} />

                <Route 
                    path="/admin" 
                    element={
                        <Box display="flex" height="100vh">
                            <SidebarAdmin />
                            <Box flex={1} display="flex" flexDirection="column">
                                <Topbar />
                                <AdminDashBorad />
                            </Box>
                        </Box>
                    } 
                />

                <Route 
                    path="/manager" 
                    element={
                        <Box display="flex" height="100vh">
                            <SidebarAdmin />
                            <Box flex={1} display="flex" flexDirection="column">
                                <Topbar />
                                <MangerDashBorad />
                            </Box>
                        </Box>
                    } 
                />

                <Route 
                    path="/staff" 
                    element={
                        <Box display="flex" height="100vh">
                            <SidebarAdmin />
                            <Box flex={1} display="flex" flexDirection="column">
                                <Topbar />
                                <StaffDashBorad />
                            </Box>
                        </Box>
                    } 
                />
            </ReactRoutes>
        </Router>
    );
}

export default AppRoutes;
