import React, { useContext } from "react";
import { UserContext } from "../ContextState/contextState";
import { useNavigate } from "react-router-dom";
import { Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import DownloadIcon from "@mui/icons-material/Download"; // New icon for download
import GeographyChart from "../components/GeographyChart";

function AdminDashboard() {
  const userContext = useContext(UserContext);
  const { Role } = userContext;
  const navigate = useNavigate();

  // Define colors for the complementary scheme
  const COLORS = {
    lightThemeBackground: "#F5F9FF", // Soft Sky Blue
    lightThemeText: "#2D3A56", // Dark Navy Blue
    hoverBackground: "#E6F7F7", // Light Cyan
    brightBlue: "#4361EE", // Bright Blue for icons and highlights
    vividOrange: "#FFA600", // Accent color for key elements
    softCyan: "#80B5FA", // Secondary color
    greenAccent: "#6abf69", // Green Accent for revenue
  };

  // Sample data for monthly rating and number of months
  const monthlyRating = 85; // Sample rating
  const numberOfMonths = 12; // Example number of months

  return (
    <>
      {/* Top Section with Progress and Reports */}
      <Box display="flex" justifyContent="space-between" gap="20px" backgroundColor={COLORS.lightThemeBackground} padding="20px">
        {/* Progress Section */}
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

        {/* Report and Download Section */}
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

          {/* Download Button */}
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

      {/* Line Manager Menu */}
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
          
          {/* Menu Item 1 */}
          <ListItem
            button
            onClick={() => navigate("/performance-reports")}
            sx={{
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: COLORS.softCyan,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform: "scale(1.05)",
                transition: "all 0.3s ease-in-out",
              },
              padding: "12px 20px",
              marginBottom: "10px",
            }}
          >
            <ListItemText primary="Performance Reports" sx={{ fontWeight: "500", color: COLORS.lightThemeText }} />
          </ListItem>
          
          {/* Menu Item 2 */}
          <ListItem
            button
            onClick={() => navigate("/anomaly-detection")}
            sx={{
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: COLORS.softCyan,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform: "scale(1.05)",
                transition: "all 0.3s ease-in-out",
              },
              padding: "12px 20px",
              marginBottom: "10px",
            }}
          >
            <ListItemText primary="Anomaly Detection" sx={{ fontWeight: "500", color: COLORS.lightThemeText }} />
          </ListItem>
          
          {/* Menu Item 3 */}
          <ListItem
            button
            onClick={() => navigate("/recommendations")}
            sx={{
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: COLORS.softCyan,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transform: "scale(1.05)",
                transition: "all 0.3s ease-in-out",
              },
              padding: "12px 20px",
            }}
          >
            <ListItemText primary="Recommendations" sx={{ fontWeight: "500", color: COLORS.lightThemeText }} />
          </ListItem>
        </List>
      </Box>
    </>
  );
}

export default AdminDashboard;
