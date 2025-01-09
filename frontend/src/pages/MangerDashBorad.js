import React, { useEffect, useContext } from 'react';
import { UserContext } from '../ContextState/contextState';
import { useNavigate } from 'react-router-dom';

function MangerDashBorad() {
            const userContext = useContext(UserContext);
            const { Role } = userContext;
            const navigate = useNavigate();
        
            useEffect(() => {
                const accessToken = localStorage.getItem("access_token");
        
                if (Role !== 'Manger' || !accessToken) {
                    navigate('/');
                }
            }, [Role, navigate]); 
  return (
    <div>MangerDashBorad</div>
  )
}

export default MangerDashBorad