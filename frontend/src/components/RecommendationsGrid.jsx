import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { performance_with_courses } from '../API/slice/API';
import Header from './Header';
import { Box, CircularProgress, Typography, Chip } from '@mui/material';

const RecommendationsGrid = () => {
  const dispatch = useDispatch();

  const {
    low_performance_with_courses,
    performance_status,
    performance_error,
  } = useSelector((state) => state.API);

  const [rows, setRows] = useState([]);

  useEffect(() => {
    dispatch(performance_with_courses());
  }, [dispatch]);

  useEffect(() => {
    if (performance_status === 'succeeded') {
      const mappedRows = low_performance_with_courses.map((item) => ({
        id: item.PerformanceID,
        userName: item.UserName,
        kpiName: item.KPIName,
        actualValue: item.ActualValue,
        targetValue: item.TargetValue,
        performancePercent: `${item.PerformancePercent}%`,
        timestamp: item.Timestamp,
        courses: item.RecommendedCourses.join(', '),
      }));
      setRows(mappedRows);
    }
  }, [low_performance_with_courses, performance_status]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'userName', headerName: 'User Name', width: 160 },
    { field: 'kpiName', headerName: 'KPI', width: 160 },
    { field: 'actualValue', headerName: 'Actual', width: 100 },
    { field: 'targetValue', headerName: 'Target', width: 100 },
    {
      field: 'performancePercent',
      headerName: 'Performance %',
      width: 140,
      renderCell: (params) => {
        const percent = parseFloat(params.value.replace('%', ''));
        let color = 'default';
        if (percent < 50) color = 'error';
        else if (percent < 70) color = 'warning';
        else color = 'success';
        return <Chip label={params.value} color={color} />;
      },
    },
    { field: 'timestamp', headerName: 'Timestamp', width: 200 },
    { field: 'courses', headerName: 'Recommended Courses', width: 250 },
  ];

  return (
    <>
      <Header title="Recommendations" subtitle="Employees needing upskilling suggestions" />

      {performance_status === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading recommendations...
          </Typography>
        </Box>
      )}

      {performance_status === 'failed' && (
        <Box sx={{ textAlign: 'center', color: 'error.main', mt: 4 }}>
          <Typography variant="h6">Failed to load recommendations</Typography>
          <Typography>{performance_error || 'Please check your server connection.'}</Typography>
        </Box>
      )}

      {performance_status === 'succeeded' && rows.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          No underperforming records found.
        </Typography>
      )}

      {performance_status === 'succeeded' && rows.length > 0 && (
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
    </>
  );
};

export default RecommendationsGrid;
