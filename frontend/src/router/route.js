import React from 'react';
import { BrowserRouter as Router, Routes as ReactRoutes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import AdminDashBorad from '../pages/AdminDashBorad';
import MangerDashBorad from '../pages/MangerDashBorad';
import StaffDashBorad from '../pages/StaffDashBorad';
import SidebarAdmin from '../components/SideBar'; // Import Sidebar
import Topbar from '../components/TopBar'; // Import Topbar
import { Box } from '@mui/material';
import KPI from '../components/KPI';
import Users from '../components/Users';
import PerformanceGrid from '../components/PerformanceGrid';
import RecommendationsGrid from "../components/RecommendationsGrid"
import InsightChart from '../components/InsightChart';
import Setting from '../pages/Setting';

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
                                <Route path="/kpi" element={    <Box display="flex" height="100vh">
                            <SidebarAdmin />
                            <Box flex={1} display="flex" flexDirection="column">
                                <Topbar />
                           <KPI/>
                            </Box>
                        </Box>} />

                        <Route path="/users" element={    <Box display="flex" height="100vh">
                            <SidebarAdmin />
                            <Box flex={1} display="flex" flexDirection="column">
                                <Topbar />
                           <Users/>
                            </Box>
                        </Box>} />

                             <Route path="/reports" element={    <Box display="flex" height="100vh">
                            <SidebarAdmin />
                            <Box flex={1} display="flex" flexDirection="column">
                                <Topbar />
                           <PerformanceGrid/>
                            </Box>
                        </Box>} />
                          <Route path="/recommendations" element={    <Box display="flex" height="100vh">
                            <SidebarAdmin />
                            <Box flex={1} display="flex" flexDirection="column">
                                <Topbar />
                           <RecommendationsGrid/>
                            </Box>
                        </Box>} />

                            <Route path="/insights" element={    <Box display="flex" height="100vh">
                            <SidebarAdmin />
                            <Box flex={1} display="flex" flexDirection="column">
                                <Topbar />
                           <InsightChart/>
                            </Box>
                        </Box>} />

                             <Route path="/settings" element={    <Box display="flex" height="100vh">
                            <SidebarAdmin />
                            <Box flex={1} display="flex" flexDirection="column">
                                <Topbar />
               <Setting/>
                            </Box>
                        </Box>} />

            </ReactRoutes>
        </Router>
    );
}

export default AppRoutes;
