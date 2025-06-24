import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPerformanceInsights } from '../API/slice/API';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';

const COLORS = ['#e63946', '#f4a261', '#2a9d8f'];

const InsightChart = () => {
  const dispatch = useDispatch();
  const { insightsData, insightsStatus } = useSelector((state) => state.API);

  useEffect(() => {
    dispatch(fetchPerformanceInsights());
  }, [dispatch]);

  if (insightsStatus === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!insightsData) {
    return (
      <Box p={3}>
        <Typography variant="h6">No insights data available.</Typography>
      </Box>
    );
  }

  const performanceDistribution = insightsData.performance_distribution || {};
  const performanceData = [
    { name: 'Under 50%', value: Number(performanceDistribution["Under 50%"] || 0) },
    { name: '50-70%', value: Number(performanceDistribution["50-70%"] || 0) },
    { name: '70%+', value: Number(performanceDistribution["70%+"] || 0) },
  ];

  const kpiDistributionData = insightsData.kpi_distribution || [];

  const isPerformanceDataEmpty = performanceData.every(item => item.value === 0);
  const isKpiDataEmpty = kpiDistributionData.length === 0;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Performance Insights
      </Typography>

      <Grid container spacing={3}>
        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Employee Performance Distribution
            </Typography>
            {isPerformanceDataEmpty ? (
              <Typography>No performance data available.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              KPI Underperformance Distribution
            </Typography>
            {isKpiDataEmpty ? (
              <Typography>No KPI distribution data available.</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpiDistributionData}>
                  <XAxis dataKey="kpi" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3a86ff" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InsightChart;
