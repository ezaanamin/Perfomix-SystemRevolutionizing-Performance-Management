import React from 'react';
import { Modal, Box, Typography, Divider, CircularProgress } from '@mui/material';
import { KPIButton } from '../style/style';

const UserDetailModal = ({
  user,
  detectedKpisResult,
  detectedKpisStatus,
  detectedKpisError,
  userKpiHistory,
  userKpiHistoryStatus,
  userKpiHistoryError,
  onClose,
}) => {
  // Only active KPIs with status 'active'
  const activeKpis = Array.isArray(detectedKpisResult)
    ? detectedKpisResult.filter(kpi => kpi.status === 'active')
    : [];

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
        {/* User Info */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          {user.name}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Role: {user.role}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {user.email}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Active KPIs */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Active KPIs
        </Typography>

        {detectedKpisStatus === 'loading' ? (
          <CircularProgress />
        ) : detectedKpisError ? (
          <Typography color="error">{typeof detectedKpisError === 'string' ? detectedKpisError : JSON.stringify(detectedKpisError)}</Typography>
        ) : activeKpis.length > 0 ? (
          activeKpis.map(kpi => (
            <Box
              key={kpi.id}
              sx={{ mb: 1, p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}
            >
              <Typography variant="body1">{kpi.kpi_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Target: {kpi.target}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography>No active KPIs detected.</Typography>
        )}

        {/* Close Button */}
        <KPIButton
          onClick={onClose}
          sx={{ mt: 3, backgroundColor: '#4361EE' }}
        >
          Close
        </KPIButton>
      </Box>
    </Modal>
  );
};

export default UserDetailModal;
