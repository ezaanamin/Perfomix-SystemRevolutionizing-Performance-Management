import React, { useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UserContext } from "../ContextState/contextState";
import { useNavigate } from "react-router-dom";
import { AdminDashboardDiv } from "../style/style";
import LineChart from "../components/LineChart";
import BarChart from "../components/BarChart";
import GeographyChart from "../components/EmployeePerformanceDataGrid";
import ProgressCircle from "../components/ProgressCircle";
import { Box, Button, Typography } from "@mui/material";
import StatBox from "../components/StatsBox";
import Header from "../components/Header";
import InsightsIcon from "@mui/icons-material/Insights";
import BugReportIcon from "@mui/icons-material/BugReport";
import AssessmentIcon from "@mui/icons-material/Assessment";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import { fetchAdminDashboardData } from "../API/slice/API";
import RecommendationsGrid from "../components/RecommendationsGrid";

function AdminDashboard() {
  const userContext = useContext(UserContext);
  const { Role, SetRole } = userContext;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const adminDashboardData = useSelector(state => state.API.adminDashboardData);
  const adminDashboardStatus = useSelector(state => state.API.adminDashboardStatus);
  const adminDashboardError = useSelector(state => state.API.adminDashboardError);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    SetRole(role);
    if (role !== "admin" || !accessToken) {
      navigate("/");
    } else {
      dispatch(fetchAdminDashboardData());
    }
  }, [Role, navigate, SetRole, dispatch]);

  const COLORS = {
    lightThemeBackground: "#F5F9FF",
    lightThemeText: "#2D3A56",
    hoverBackground: "#E6F7F7",
    brightBlue: "#4361EE",
    vividOrange: "#FFA600",
    softCyan: "#80B5FA",
    greenAccent: "#6abf69",
  };

  const stats = adminDashboardData ? [
    {
      title: `${adminDashboardData.stats?.kpi_achievement_rate ?? "N/A"}%`,
      subtitle: "KPI Achievement Rate",
      progress: (Number(adminDashboardData.stats?.kpi_achievement_rate) || 0) / 100,
      increase: "",
      icon: <AssessmentIcon sx={{ color: COLORS.brightBlue, fontSize: "26px" }} />,
    },
    {
      title: adminDashboardData.stats?.total_bots?.toString() ?? "N/A",
      subtitle: "Bot Detection",
      progress: 1,
      increase: "",
      icon: <BugReportIcon sx={{ color: COLORS.vividOrange, fontSize: "26px" }} />,
    },
    {
      title: adminDashboardData.stats?.total_users?.toString() ?? "N/A",
      subtitle: "Tool Integrations Active",
      progress: 1,
      increase: "",
      icon: <IntegrationInstructionsIcon sx={{ color: COLORS.brightBlue, fontSize: "26px" }} />,
    },
  ] : [];

  if (adminDashboardStatus === "loading") {
    return <AdminDashboardDiv><Typography>Loading dashboard data...</Typography></AdminDashboardDiv>;
  }

  if (adminDashboardStatus === "failed") {
    return <AdminDashboardDiv><Typography color="error">Error loading dashboard data: {adminDashboardError}</Typography></AdminDashboardDiv>;
  }

  return (
    <AdminDashboardDiv>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="PERFOMIX DASHBOARD" subtitle="Track performance, detect anomalies, and gain insights" />
        <Button
          sx={{
            backgroundColor: COLORS.brightBlue,
            color: COLORS.lightThemeBackground,
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
            "&:hover": { backgroundColor: COLORS.hoverBackground, color: COLORS.lightThemeText },
          }}
        >
          <InsightsIcon sx={{ mr: "10px" }} />
          View Detailed Insights
        </Button>
      </Box>

      {/* Stats Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        mt="20px"
      >
        {stats.map((stat, index) => (
          <Box
            key={index}
            gridColumn="span 4"
            backgroundColor={COLORS.lightThemeBackground}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="8px"
            p="16px"
            sx={{ "&:hover": { backgroundColor: COLORS.hoverBackground } }}
          >
            <StatBox {...stat} />
          </Box>
        ))}

        {/* System Overview */}
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={COLORS.lightThemeBackground} p="30px">
          <Typography variant="h5" fontWeight="600">Perfomix System Overview</Typography>
          <Box display="flex" flexDirection="column" alignItems="center" mt="25px">
            <ProgressCircle size={125} />
            <Typography variant="body2" color={COLORS.greenAccent} sx={{ mt: "15px" }}>
              Automated KPI Tracking & Performance Insights
            </Typography>
            <Typography variant="body2">Real-time anomaly detection and personalized feedback.</Typography>
          </Box>
        </Box>

        {/* KPI Bar Chart */}
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={COLORS.lightThemeBackground}>
          <Typography variant="body1" fontWeight="600" sx={{ padding: "20px" }}>
            Real-Time KPI Tracking & Anomaly Detection
          </Typography>
          <Box height="250px" mt="-10px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>

        {/* NLP Chart */}
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={COLORS.lightThemeBackground} p="10px">
          <Typography variant="body1" fontWeight="600" mb="10px">
            NLP-Based Employee Recommendations
          </Typography>
          <Box height="100px">
            {/* <GeographyChart isDashboard={true} /> */}
           <RecommendationsGrid isDashboard={true} />
          </Box>
        </Box>
      </Box>

      {/* Total Performance Score Full Width */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gap="20px"
        mt="20px"
      >
        <Box
          gridColumn="1 / -1"
          backgroundColor={COLORS.lightThemeBackground}
          p="5px"
          borderRadius="8px"
          display="flex"
          flexDirection="column"
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="600" color={COLORS.lightThemeText}>
                Total Performance Score
              </Typography>
              <Typography variant="h3" fontWeight="bold" color={COLORS.brightBlue}>
                {adminDashboardData?.stats?.kpi_achievement_rate
                  ? `${adminDashboardData.stats.kpi_achievement_rate}%`
                  : "N/A"}
              </Typography>
            </Box>
          </Box>
          <Box height="180px" width="100%" mt="20px">
            <LineChart isDashboard={true} chartHeight="100%" chartWidth="100%" />
          </Box>
        </Box>
      </Box>
    </AdminDashboardDiv>
  );
}

export default AdminDashboard;
