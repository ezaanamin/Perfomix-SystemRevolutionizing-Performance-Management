import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import { KPIButton } from '../style/style';

const AnalyzeKpiPerformanceModal = ({
  user,
  userKpiHistory,
  userKpiHistoryStatus,
  userKpiHistoryError,
  onClose,
}) => {
  const getErrorMessage = (error) => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    try {
      return JSON.stringify(error);
    } catch {
      return 'An unknown error occurred.';
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: 3,
          p: 4,
          maxWidth: 600,
          mx: 'auto',
          mt: 8,
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          KPI Performance Analysis for {user.name}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {userKpiHistoryStatus === 'loading' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 100 }}>
            <CircularProgress />
          </Box>
        ) : userKpiHistoryError ? (
          <Typography color="error">{getErrorMessage(userKpiHistoryError)}</Typography>
        ) : userKpiHistory?.error ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {userKpiHistory.error}
          </Typography>
        ) : userKpiHistory && Object.keys(userKpiHistory).length > 0 ? (
          Object.entries(userKpiHistory).map(([kpiName, data]) => (
            <Box
              key={kpiName}
              sx={{
                mb: 2,
                p: 2,
                backgroundColor: '#f0f4ff',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                {kpiName}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Target: {data?.target ?? 'N/A'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Performance: {data?.performance ?? 'N/A'}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Typography>No KPI performance data available.</Typography>
        )}

        <KPIButton
          onClick={onClose}
          sx={{ mt: 3, backgroundColor: '#ff6f61' }}
        >
          Close
        </KPIButton>
      </Box>
    </Modal>
  );
};

export default AnalyzeKpiPerformanceModal;
