import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import DownloadIcon from '@mui/icons-material/Download';
import { useDispatch, useSelector } from 'react-redux';
import { UserContext } from '../ContextState/contextState';
import ModalUsersGithub from '../components/ModalUsersGithub';
import ModalPerformanceReport from '../components/ModalPerformanceReport';
import { latest_performance, performance_report } from '../API/slice/API';

function ManagerDashboard() {
  const { Role } = useContext(UserContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openGithubModal, setOpenGithubModal] = useState(false);
  const [openPerformanceModal, setOpenPerformanceModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { latest_performance: performanceData, loading, error } = useSelector(
    (state) => state.API
  );

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (Role !== 'manager' || !token) {
      navigate('/');
    } else {
      dispatch(latest_performance());
    }
  }, [Role, navigate, dispatch]);

  const COLORS = {
    background: '#F5F9FF',
    text: '#2D3A56',
    blue: '#4361EE',
    orange: '#FFA600',
    green: '#6abf69',
    red: '#e63946',
  };

  const getPerformanceColor = (value) => {
    if (value >= 85) return COLORS.green;
    if (value < 70) return COLORS.red;
    return COLORS.orange;
  };

  const renderPerformanceContent = () => {
    if (loading) return <CircularProgress sx={{ mt: 3 }} />;
    if (error)
      return (
        <Typography color={COLORS.red} sx={{ mt: 3, fontWeight: '600' }}>
          Error loading performance data
        </Typography>
      );
    if (!performanceData.length)
      return (
        <Typography color={COLORS.text} sx={{ mt: 3 }}>
          No performance data available
        </Typography>
      );

    const { PerformancePercent, Timestamp } = performanceData[0];
    return (
      <>
        <Typography
          variant="h3"
          fontWeight="bold"
          sx={{ mt: '10px', color: getPerformanceColor(PerformancePercent) }}
        >
          {PerformancePercent}%
        </Typography>
        <Typography variant="h6" fontWeight="400" color={COLORS.text} mt="5px">
          As of {new Date(Timestamp).toLocaleDateString()}
        </Typography>
      </>
    );
  };

  const quickLinkItem = (text, action) => (
    <ListItem
      button
      onClick={action}
      sx={{ borderRadius: '8px', '&:hover': { backgroundColor: '#E6F7F7' } }}
      key={text}
    >
      <ListItemText primary={text} sx={{ fontWeight: '500', color: COLORS.text }} />
    </ListItem>
  );

  // New download handler
  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const resultAction = await dispatch(performance_report());

      if (performance_report.fulfilled.match(resultAction)) {
        const blob = resultAction.payload;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;

        // Set a filename, adjust extension as needed
        link.setAttribute('download', 'performance_report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download report');
      }
    } catch (err) {
      alert('An error occurred during download');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <ModalUsersGithub open={openGithubModal} handleClose={() => setOpenGithubModal(false)} />
      <ModalPerformanceReport
        open={openPerformanceModal}
        handleClose={() => setOpenPerformanceModal(false)}
      />

      <Box display="flex" justifyContent="space-between" gap="20px" bgcolor={COLORS.background} p="20px">
        <Box
          height="324px"
          width="412px"
          bgcolor={COLORS.background}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p="20px"
          borderRadius="12px"
          boxShadow="0 6px 15px rgba(0, 0, 0, 0.1)"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={COLORS.text}
            display="flex"
            alignItems="center"
          >
            <InsightsIcon fontSize="large" sx={{ color: COLORS.blue, mr: '8px' }} /> Latest Performance
          </Typography>
          {renderPerformanceContent()}
        </Box>

        <Box
          height="324px"
          width="412px"
          bgcolor={COLORS.background}
          p="30px"
          borderRadius="12px"
          boxShadow="0 6px 15px rgba(0, 0, 0, 0.1)"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Typography
            variant="h5"
            fontWeight="600"
            color={COLORS.text}
            display="flex"
            alignItems="center"
            mb="20px"
          >
            <DownloadIcon fontSize="large" sx={{ color: COLORS.orange, mr: '8px' }} /> Report and Download
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: COLORS.blue,
              px: '30px',
              py: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              '&:hover': {
                bgcolor: COLORS.orange,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transform: 'scale(1.05)',
                transition: 'all 0.3s ease-in-out',
              },
            }}
            onClick={handleDownloadReport}
            disabled={downloading}
          >
            {downloading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Download Report'}
          </Button>
        </Box>
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        bgcolor={COLORS.background}
        p="20px"
        mt="20px"
        borderRadius="12px"
        boxShadow="0 6px 15px rgba(0, 0, 0, 0.1)"
      >
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: COLORS.background }}>
          <Typography variant="h5" fontWeight="600" color={COLORS.text} mb="15px">
            Quick Links
          </Typography>
          {quickLinkItem('Performance Reports', () => setOpenPerformanceModal(true))}
          {quickLinkItem('Bot Detection', () => setOpenGithubModal(true))}
          {quickLinkItem('Recommendations', () => navigate('/recommendations'))}
        </List>
      </Box>
    </>
  );
}

export default ManagerDashboard;
