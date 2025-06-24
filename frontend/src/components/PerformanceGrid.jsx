import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';
import { Performance_Data } from '../API/slice/API';
import { Box, CircularProgress, Typography, Chip } from '@mui/material';
import Header from '../components/Header';

const PerformanceGrid = () => {
  const dispatch = useDispatch();

  const {
    performance_data,
    performance_status,
    performance_error,
  } = useSelector((state) => state.API);

  useEffect(() => {
    if (performance_status === 'idle') {
      dispatch(Performance_Data());
      console.log(performance_data,'per')
    }
  }, [dispatch, performance_status]);

  const getPerformanceChip = (value) => {
    if (value < 50) {
      return <Chip label={`${value}%`} sx={{ backgroundColor: '#FF6B6B', color: 'white' }} />;
    } else if (value < 80) {
      return <Chip label={`${value}%`} sx={{ backgroundColor: '#FFD93D', color: 'black' }} />;
    } else {
      return <Chip label={`${value}%`} sx={{ backgroundColor: '#6BCB77', color: 'white' }} />;
    }
  };

  const columns = [
    { field: 'PerformanceID', headerName: 'ID', width: 90 },
    { field: 'UserName', headerName: 'User Name', width: 160 },
    { field: 'KPIName', headerName: 'KPI', width: 200 },
    { field: 'ActualValue', headerName: 'Actual', width: 120 },
    { field: 'TargetValue', headerName: 'Target', width: 120 },
    {
      field: 'PerformancePercent',
      headerName: 'Performance',
      width: 160,
      renderCell: (params) => getPerformanceChip(params.value),
      sortComparator: (v1, v2) => v1 - v2, // Enable numeric sorting
    },
    { field: 'Timestamp', headerName: 'Timestamp', width: 200 },
  ];

  if (performance_status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Performance Data...</Typography>
      </Box>
    );
  }

  if (performance_status === 'failed') {
    return (
      <Box sx={{ textAlign: 'center', color: 'error.main', mt: 4 }}>
        <Typography variant="h6">Failed to load performance data</Typography>
        <Typography>{performance_error?.message || 'Please check your connection or backend.'}</Typography>
      </Box>
    );
  }

  if (performance_status === 'succeeded' && performance_data.length === 0) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
        No performance records found.
      </Typography>
    );
  }

  return (
    <>
      <Header title="Performance Data" subtitle="Track and evaluate performance metrics" />
      <DataGrid
        rows={performance_data}
        columns={columns}
        pageSize={5}
        autoHeight
        getRowId={(row) => row.PerformanceID}
        sx={{
          '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
          '& .MuiDataGrid-cell': { borderColor: '#ddd' },
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      />
    </>
  );
};

export default PerformanceGrid;
