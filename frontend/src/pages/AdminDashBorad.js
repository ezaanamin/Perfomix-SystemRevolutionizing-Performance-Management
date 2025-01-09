import React, { useEffect, useContext } from 'react';
import { UserContext } from '../ContextState/contextState';
import { useNavigate } from 'react-router-dom';

function AdminDashBorad() {
    const userContext = useContext(UserContext);
    const { Role } = userContext;
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");

        if (Role !== 'Admin' || !accessToken) {
            navigate('/');
        }
    }, [Role, navigate]); 

    return (
        <div>
            <h1>Admin Dashboard</h1>
        </div>
    );
}

export default AdminDashBorad;
