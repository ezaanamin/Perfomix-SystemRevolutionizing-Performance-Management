import React, { useContext, useEffect } from "react";
import { UserContext } from "../ContextState/contextState";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RecommendationsGrid from "../components/RecommendationsGrid";
import { latest_performance, performance_report } from '../API/slice/API';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from "react";

function StaffDashboard() {
  const userContext = useContext(UserContext);
  const navigate = useNavigate();
  const { Role, Name } = userContext;
  const [downloading, setDownloading] = useState(false);
    const dispatch = useDispatch();
  

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (Role !== "staff" || !accessToken) {
      navigate("/");
    }
  }, [Role, navigate]);

    const handleDownloadReport = async () => {
      setDownloading(true);
      try {
        const resultAction = await dispatch(performance_report());
  
        if (performance_report.fulfilled.match(resultAction)) {
          const blob = resultAction.payload;
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
  
          
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
      {}
      <Typography
        variant="h4"
        fontWeight="bold"
        color={COLORS.lightThemeText}
        gutterBottom
      >
        Staff Dashboard - {Name}
      </Typography>

      {}
      <Box
        backgroundColor={COLORS.lightThemeBackground}
        padding="20px"
        borderRadius="12px"
        boxShadow="0 6px 15px rgba(0, 0, 0, 0.08)"
        marginBottom="30px"
      >
        <Typography
          variant="h6"
          fontWeight="600"
          color={COLORS.lightThemeText}
          marginBottom="15px"
        >
          Course Recommendations
        </Typography>

        <RecommendationsGrid isDashboard={true} />
      </Box>

      {}
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
      >
        <Typography
          variant="h5"
          fontWeight="600"
          color={COLORS.lightThemeText}
          display="flex"
          alignItems="center"
          mb="20px"
        >
          <DownloadIcon
            fontSize="large"
            style={{ color: COLORS.vividOrange, marginRight: "8px" }}
          />
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
                    onClick={handleDownloadReport}

        >
          Download Report
        </Button>

      </Box>
    </Box>
  );
}

export default StaffDashboard;
