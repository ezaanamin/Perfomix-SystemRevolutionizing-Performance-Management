import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button
} from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import DownloadIcon from "@mui/icons-material/Download";
import { UserContext } from "../ContextState/contextState";
// import ModalUsersGithub from "../components/ModalUsersGithub";
// import ModalPerformanceReport from "../components/ModalPerformanceReport";

function ManagerDashboard() {
  const { Role } = useContext(UserContext);
  const navigate = useNavigate();
  const [openGithubModal, setOpenGithubModal] = useState(false);
  const [openPerformanceModal, setOpenPerformanceModal] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (Role !== "manager" || !accessToken) {
      navigate("/");
    }
  }, [Role, navigate]);

  const COLORS = {
    lightThemeBackground: "#F5F9FF",
    lightThemeText: "#2D3A56",
    hoverBackground: "#E6F7F7",
    brightBlue: "#4361EE",
    vividOrange: "#FFA600",
    softCyan: "#80B5FA",
    greenAccent: "#6abf69",
  };

  const monthlyRating = 85;
  const numberOfMonths = 12;

  return (
    <>
      {/* Modals */}
      {/* <ModalUsersGithub open={openGithubModal} handleClose={() => setOpenGithubModal(false)} /> */}
      {/* <ModalPerformanceReport open={openPerformanceModal} handleClose={() => setOpenPerformanceModal(false)} /> */}

      {/* Top Section */}
      <Box display="flex" justifyContent="space-between" gap="20px" backgroundColor={COLORS.lightThemeBackground} padding="20px">
        {/* Progress Box */}
        <Box
          height="324px"
          width="412px"
          backgroundColor={COLORS.lightThemeBackground}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          padding="20px"
          borderRadius="12px"
          boxShadow="0 6px 15px rgba(0, 0, 0, 0.1)"
        >
          <Typography variant="h5" fontWeight="600" color={COLORS.lightThemeText} display="flex" alignItems="center">
            <InsightsIcon fontSize="large" style={{ color: COLORS.brightBlue, marginRight: "8px" }} />
            Progress
          </Typography>
          <Typography variant="h3" fontWeight="bold" color={COLORS.brightBlue} mt="10px">
            {monthlyRating}%
          </Typography>
          <Typography variant="h6" fontWeight="400" color={COLORS.lightThemeText} mt="5px">
            {numberOfMonths} Months Rating
          </Typography>
        </Box>

        {/* Report Box */}
        <Box
          height="324px"
          width="412px"
          backgroundColor={COLORS.lightThemeBackground}
          padding="30px"
          borderRadius="12px"
          boxShadow="0 6px 15px rgba(0, 0, 0, 0.1)"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="600" color={COLORS.lightThemeText} display="flex" alignItems="center" mb="20px">
            <DownloadIcon fontSize="large" style={{ color: COLORS.vividOrange, marginRight: "8px" }} />
            Report and Download Report
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: COLORS.brightBlue,
              padding: "12px 30px",
              fontWeight: "600",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: COLORS.vividOrange,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform: "scale(1.05)",
                transition: "all 0.3s ease-in-out",
              },
            }}
            onClick={() => console.log("Download Report")}
          >
            Download Report
          </Button>
        </Box>
      </Box>

      {/* Quick Links */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        backgroundColor={COLORS.lightThemeBackground}
        padding="20px"
        mt="20px"
        borderRadius="12px"
        boxShadow="0 6px 15px rgba(0, 0, 0, 0.1)"
      >
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: COLORS.lightThemeBackground }}>
          <Typography variant="h5" fontWeight="600" color={COLORS.lightThemeText} sx={{ marginBottom: "15px" }}>
            Quick Links
          </Typography>

          {/* Open Performance Modal */}
          <ListItem button onClick={() => setOpenPerformanceModal(true)} sx={quickLinkStyle(COLORS)}>
            <ListItemText primary="Performance Reports" sx={{ fontWeight: "500", color: COLORS.lightThemeText }} />
          </ListItem>

          {/* GitHub Bot Detection */}
          <ListItem button onClick={() => setOpenGithubModal(true)} sx={quickLinkStyle(COLORS)}>
            <ListItemText primary="Bot Detection" sx={{ fontWeight: "500", color: COLORS.lightThemeText }} />
          </ListItem>

          {/* Recommendations Page */}
          <ListItem button onClick={() => navigate("/recommendations")} sx={quickLinkStyle(COLORS)}>
            <ListItemText primary="Recommendations" sx={{ fontWeight: "500", color: COLORS.lightThemeText }} />
          </ListItem>
        </List>
      </Box>
    </>
  );
}

const quickLinkStyle = (COLORS) => ({
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: COLORS.softCyan,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transform: "scale(1.05)",
    transition: "all 0.3s ease-in-out",
  },
  padding: "12px 20px",
  marginBottom: "10px",
});

export default ManagerDashboard;
