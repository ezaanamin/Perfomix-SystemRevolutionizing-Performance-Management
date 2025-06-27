import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RecommendationsGrid from "../components/RecommendationsGrid";
import { useDispatch, useSelector } from "react-redux";
import {
  my_performance_with_courses,
  my_performance_report,
} from "../API/slice/API";
import { useContext } from 'react';
import { UserContext } from "../ContextState/contextState";

function base64UrlDecode(str) {

  str = str.replace(/-/g, "+").replace(/_/g, "/");

  while (str.length % 4) {
    str += "=";
  }
  try {
    return atob(str);
  } catch (e) {
    console.error("Failed to decode base64url:", e);
    return null;
  }
}


function decodeJWT(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = parts[1];
  const decoded = base64UrlDecode(payload);
  if (!decoded) return null;
  try {
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function StaffDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userContext = useContext(UserContext);
  const {    userInfo,
    setUserInfo } = userContext;

  const [downloading, setDownloading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  // const [userInfo, setUserInfo] = useState({ Name: "", Role: "" });

  // Extract recommendations from Redux
  const recommendations = useSelector(
    (state) => state.API.my_performance_with_courses_data || []
  );
  const recommendationsError = useSelector(
    (state) => state.API.my_performance_with_courses_error
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
      return;
    }
    const decoded = decodeJWT(token);
    if (!decoded) {
      navigate("/");
      return;
    }
    setUserInfo({ Name: decoded.sub || "", Role: decoded.role || "" });

    setLoadingRecommendations(true);
    dispatch(my_performance_with_courses())
      .unwrap()
      .catch((err) => {
        console.error("Failed to fetch recommendations:", err);
      })
      .finally(() => {
        setLoadingRecommendations(false);
      });
  }, [dispatch, navigate]);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const resultAction = await dispatch(my_performance_report());
      if (my_performance_report.fulfilled.match(resultAction)) {
        const blob = resultAction.payload;
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "performance_report.pdf");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download report");
      }
    } catch (err) {
      alert("An error occurred during download");
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
      <Typography
        variant="h4"
        fontWeight="bold"
        color={COLORS.lightThemeText}
        gutterBottom
      >
        Staff Dashboard - {userInfo.Name}
      </Typography>

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

        {loadingRecommendations ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="150px"
          >
            <CircularProgress />
          </Box>
        ) : recommendationsError ? (
          <Typography color="error">
            Failed to load recommendations: {recommendationsError}
          </Typography>
        ) : (
          <RecommendationsGrid
            isDashboard={true}
            recommendations={recommendations}
            filterUser={userInfo.Name || "none"}
          />
        )}
      </Box>

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
          disabled={downloading}
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
          {downloading ? "Downloading..." : "Download Report"}
        </Button>
      </Box>
    </Box>
  );
}

export default StaffDashboard;
