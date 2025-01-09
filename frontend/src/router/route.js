import React from 'react';
import { BrowserRouter as Router, Routes as ReactRoutes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import AdminDashBorad from '../pages/AdminDashBorad';
import MangerDashBorad from '../pages/MangerDashBorad';
import StaffDashBorad from '../pages/StaffDashBorad';

function AppRoutes() {
    return (
        <Router>
            <ReactRoutes>
                <Route path="/" element={<Login />} />
                <Route path="/admin" element={<AdminDashBorad />} />
                <Route path="/manager" element={<MangerDashBorad />} />
                <Route path="/staff" element={<StaffDashBorad />} />
            </ReactRoutes>
        </Router>
    );
}

export default AppRoutes;
