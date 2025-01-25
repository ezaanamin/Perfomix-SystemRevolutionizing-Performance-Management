import React, { useContext } from "react";
import { UserContext } from "../ContextState/contextState";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download"; // Icon for download
import { useEffect } from "react";

function StaffDashboard() {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const { Role } = userContext;


  useEffect(() => {
      const accessToken = localStorage.getItem("access_token");
      if (Role !== 'staff' || !accessToken) {
          navigate('/');
      }
  }, [Role, navigate]); 
  const COLORS = {
    lightThemeBackground: "#F5F9FF", // Soft Sky Blue
    lightThemeText: "#2D3A56", // Dark Navy Blue
    hoverBackground: "#E6F7F7", // Light Cyan
    brightBlue: "#4361EE", // Bright Blue for icons and highlights
    vividOrange: "#FFA600", // Accent color for key elements
    softCyan: "#80B5FA", // Secondary color
  };

  return (
    <>
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
        margin="20px auto"
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
    </>
  );
}

export default StaffDashboard;
