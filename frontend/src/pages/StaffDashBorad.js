import React, { useContext, useEffect } from "react";
import { UserContext } from "../ContextState/contextState";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

function StaffDashboard() {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const { Role, Name } = userContext;

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (Role !== "staff" || !accessToken) {
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
  };

  return (
    <Box padding={3}>
      {/* Staff Info */}
      <Typography variant="h4" fontWeight="bold" color={COLORS.lightThemeText} gutterBottom>
        Staff Dashboard - {Name}
      </Typography>

      {/* View Profile Button */}
      <Box marginBottom="20px">
        <Button
          variant="contained"
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
          onClick={() => navigate("/profile")}  // Replace '/profile' with your profile route
        >
          View Profile
        </Button>
      </Box>

      {/* Report Download */}
      <Box
        height="200px"
        width="100%"
        backgroundColor={COLORS.lightThemeBackground}
        padding="30px"
        borderRadius="12px"
        boxShadow="0 6px 15px rgba(0, 0, 0, 0.1)"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        marginTop="20px"
      >
        <Typography variant="h5" fontWeight="600" color={COLORS.lightThemeText} display="flex" alignItems="center" mb="20px">
          <DownloadIcon fontSize="large" style={{ color: COLORS.vividOrange, marginRight: "8px" }} />
          Report and Download Report
        </Typography>

        <Button
          variant="contained"
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

        {/* View Recommended Courses Button */}
        <Box marginTop="20px">
          <Button
            variant="contained"
            sx={{
              backgroundColor: COLORS.softCyan,
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
            onClick={() => navigate("/recommended-courses")}  // Replace '/recommended-courses' with your route
          >
            View Recommended Courses
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default StaffDashboard;
