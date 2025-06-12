import React, { useEffect, useState, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
  fetchActiveKpisByRole,
  fetchUserKpiHistory,
  detectSoftwareEngineerKPIs,
  detectProjectManagerKPIs,
  detectBusinessManagerKPIs,
  detectTestingTeamKPIs,
} from '../API/slice/API';

import Header from '../components/Header';
import { KPIButton } from '../style/style';
import { UserContext } from '../ContextState/contextState';
import UserDetailModal from './UserDetailsModal';
import AnalyzeKpiModal from './AnalyzeKpiPerformanceModal';
import { CircularProgress, Box, Typography } from '@mui/material';

// 📌 Target mapping helper
const getTargetForKPI = (kpiName) => {
  const targets = {
    'Budget Utilization': 80,
    'Code Efficiency': 10,
    'Code Quality': 90,
    'Commit Frequency': 12,
    'Task Completion Rate': 95,
    'Milestone Achievement Rate': 90,
    'Resource Allocation': 85,
  };
  return targets[kpiName] ?? 0;
};

const UserGrid = () => {
  const dispatch = useDispatch();
  const { open, SetRole, setOpen } = useContext(UserContext);

  // Redux selectors
  const {
    usersData,
    userStatus,
    userError,
    userKpiHistory,
    userKpiHistoryStatus,
    userKpiHistoryError,
    activeKpisByRole,
    fetchStatus: kpiFetchStatus,
    fetchError: kpiFetchError,
  } = useSelector((state) => state.API);

  // Local states
  const [rows, setRows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [selectedUserPerformance, setSelectedUserPerformance] = useState(null);

  // Set role from local storage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    if (storedRole) SetRole(storedRole);
  }, [SetRole]);

  // Fetch users
  useEffect(() => {
    if (userStatus === 'idle') dispatch(fetchUsers());
    console.log(usersData,'user')
  }, [dispatch, userStatus]);

  // Build DataGrid rows when users are fetched
  useEffect(() => {
    if (userStatus === 'succeeded') {
      const filtered = usersData.filter((u) => u.role !== 'Admin');
      setRows(
        filtered.map((user) => ({
          id: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          team_name: user.team_name || 'N/A',
        }))
      );
    }
  }, [usersData, userStatus]);

  // Open User Details
  const handleShowUser = (user) => {
    setSelectedUser(user);
    setOpen(true);
    dispatch(fetchUserKpiHistory(user.id));
    dispatch(fetchActiveKpisByRole(user.role));
  };

  // Analyze KPI performance
  const handleAnalyzePerformance = (user) => {
    setSelectedUser(user);

    // Choose detection thunk
    const thunkMap = {
      'Software Engineer': detectSoftwareEngineerKPIs,
      'Project Manager': detectProjectManagerKPIs,
      'Business Manager': detectBusinessManagerKPIs,
      'Testing Team': detectTestingTeamKPIs,
    };
    const thunk = thunkMap[user.role];
    if (!thunk) {
      console.warn(`No KPI detection defined for role: ${user.role}`);
      return;
    }

    // Dispatch detection and patch target values
    dispatch(thunk(user.id))
      .unwrap()
      .then((detectedKpis) => {
        const kpisWithTargets = {};
        for (const [kpi, value] of Object.entries(detectedKpis)) {
          kpisWithTargets[kpi] = {
            target: getTargetForKPI(kpi),
            performance: value,
          };
        }
        setSelectedUserPerformance(kpisWithTargets);
        setAnalyzeOpen(true);
      })
      .catch((err) => {
        console.error('Failed to detect KPIs:', err);
        setSelectedUserPerformance(null);
        setAnalyzeOpen(false);
      });
  };

  const handleClose = () => {
    setSelectedUser(null);
    setOpen(false);
  };

  const handleAnalyzeClose = () => {
    setAnalyzeOpen(false);
    setSelectedUserPerformance(null);
  };

  // Table columns
  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'role', headerName: 'Role', width: 150 },
    { field: 'team_name', headerName: 'Team Name', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 260,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <KPIButton onClick={() => handleShowUser(params.row)} sx={{ backgroundColor: '#4361EE', flex: 1 }}>
            View Details
          </KPIButton>
          <KPIButton onClick={() => handleAnalyzePerformance(params.row)} sx={{ backgroundColor: '#2F9E44', flex: 1 }}>
            Analyze KPI
          </KPIButton>
        </Box>
      ),
    },
  ];

  return (
    <>
      <Header title="Users" subtitle="Manage and track user data" />

      {/* Loader */}
      {userStatus === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading Users...
          </Typography>
        </Box>
      )}

      {/* Error */}
      {userStatus === 'failed' && (
        <Box sx={{ textAlign: 'center', color: 'error.main', mt: 4 }}>
          <Typography variant="h6">Failed to load users</Typography>
          <Typography>{userError?.message || 'Please check your connection or backend.'}</Typography>
        </Box>
      )}

      {/* No users */}
      {userStatus === 'succeeded' && rows.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          No users found.
        </Typography>
      )}

      {/* DataGrid */}
      {userStatus === 'succeeded' && rows.length > 0 && (
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          autoHeight
          sx={{
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
            '& .MuiDataGrid-cell': { borderColor: '#ddd' },
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        />
      )}

      {/* User Detail Modal */}
      {open && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          detectedKpisResult={activeKpisByRole[selectedUser.role]?.kpis || []}
          detectedKpisStatus={kpiFetchStatus}
          detectedKpisError={kpiFetchError}
          userKpiHistory={userKpiHistory}
          userKpiHistoryStatus={userKpiHistoryStatus}
          userKpiHistoryError={userKpiHistoryError}
          onClose={handleClose}
        />
      )}

      {/* Analyze KPI Modal */}
      {analyzeOpen && selectedUser && (
        <AnalyzeKpiModal
          user={selectedUser}
          userKpiHistory={selectedUserPerformance}
          onClose={handleAnalyzeClose}
        />
      )}
    </>
  );
};

export default UserGrid;
