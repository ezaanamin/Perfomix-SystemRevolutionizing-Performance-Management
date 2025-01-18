import React, { useContext } from "react";
import { UserContext } from "../ContextState/contextState";
import { useNavigate } from "react-router-dom";
import { AdminDashboardDiv } from "../style/style"; // Import your styled components
import LineChart from "../components/LineChart";
import BarChart from "../components/BarChart"; // Import BarChart component
import GeographyChart from "../components/GeographyChart";
import ProgressCircle from "../components/ProgressCircle"; // Import ProgressCircle component
import { Box, Button, Typography } from "@mui/material";
import StatBox from "../components/StatsBox";
import Header from "../components/Header";
import InsightsIcon from "@mui/icons-material/Insights";
import BugReportIcon from "@mui/icons-material/BugReport";
import AssessmentIcon from "@mui/icons-material/Assessment";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import { mockTransactions } from "../data/mockData";

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

  return (
    <AdminDashboardDiv>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="PERFOMIX DASHBOARD" subtitle="Track performance, detect anomalies, and gain insights" />
        <Box>
          <Button
            sx={{
              backgroundColor: COLORS.brightBlue,
              color: COLORS.lightThemeBackground,
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              "&:hover": {
                backgroundColor: COLORS.hoverBackground,
                color: COLORS.lightThemeText,
              },
            }}
          >
            <InsightsIcon sx={{ mr: "10px" }} />
            View Detailed Insights
          </Button>
        </Box>
      </Box>

      {/* Grid and Stats Section */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        mt="20px"
      >
        {[
          {
            title: "85%",
            subtitle: "KPI Achievement Rate",
            progress: "0.85",
            increase: "+5%",
            icon: <AssessmentIcon sx={{ color: COLORS.brightBlue, fontSize: "26px" }} />,
          },
          {
            title: "23",
            subtitle: "Anomalies Detected",
            progress: "0.20",
            increase: "+8%",
            icon: <BugReportIcon sx={{ color: COLORS.vividOrange, fontSize: "26px" }} />,
          },
          {
            title: "56",
            subtitle: "NLP Recommendations",
            progress: "0.65",
            increase: "+12%",
            icon: <InsightsIcon sx={{ color: COLORS.softCyan, fontSize: "26px" }} />,
          },
          {
            title: "3",
            subtitle: "Tool Integrations Active",
            progress: "1.00",
            increase: "+0%",
            icon: <IntegrationInstructionsIcon sx={{ color: COLORS.brightBlue, fontSize: "26px" }} />,
          },
        ].map((stat, index) => (
          <Box
            key={index}
            gridColumn="span 3"
            backgroundColor={COLORS.lightThemeBackground}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="8px"
            p="16px"
            sx={{
              "&:hover": {
                backgroundColor: COLORS.hoverBackground,
              },
            }}
          >
            <StatBox {...stat} />
          </Box>
        ))}

        {/* Perfomix System Overview */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={COLORS.lightThemeBackground}
          p="30px"
        >
          <Typography variant="h5" fontWeight="600">
            Perfomix System Overview
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="center" mt="25px">
            <ProgressCircle size={125} />
            <Typography variant="p" color={COLORS.greenAccent} sx={{ mt: "15px" }}>
              Automated KPI Tracking & Performance Insights
            </Typography>
            <Typography>
              Provides real-time anomaly detection and personalized feedback to improve employee productivity.
            </Typography>
          </Box>
        </Box>

        {/* KPI Tracking and Anomaly Detection */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={COLORS.lightThemeBackground}
        >
          <Typography variant="h5" fontWeight="600" sx={{ padding: "30px 30px 0 30px" }}>
            Real-Time KPI Tracking & Anomaly Detection
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>

        {/* NLP-Based Recommendations */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={COLORS.lightThemeBackground}
          padding="30px"
        >
          <Typography variant="h5" fontWeight="600" sx={{ marginBottom: "15px" }}>
            NLP-Based Employee Recommendations
          </Typography>
          <Box height="200px">
            <GeographyChart isDashboard={true} />
          </Box>
        </Box>
      </Box>

      {/* Revenue and Transactions Section */}
      <Box display="flex" justifyContent="space-between" gap="20px" mt="15px">
        {/* Total Performance Score */}
        <Box
          gridColumn="span 6"
          backgroundColor={COLORS.lightThemeBackground}
          p="20px"
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
                85% {/* Sample data reflecting overall performance */}
              </Typography>
            </Box>
          </Box>
          <Box height="200px" width="1200px" mt="15px">
            <LineChart isDashboard={true} chartHeight="100%" chartWidth="100%" />
          </Box>
        </Box>

        {/* Recent Performance Reports */}
        <Box
          gridColumn="span 6"
          backgroundColor={COLORS.lightThemeBackground}
          p="20px"
          borderRadius="8px"
          overflow="auto"
          display="flex"
          flexDirection="column"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${COLORS.brightBlue}`}
            p="15px"
          >
            <Typography color={COLORS.lightThemeText} variant="h5" fontWeight="600">
              Recent Performance Reports
            </Typography>
          </Box>
          {mockTransactions.slice(0, 2).map((transaction, i) => (
            <Box
              key={`${transaction.txId}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${COLORS.brightBlue}`}
              p="15px"
            >
              <Box>
                <Typography color={COLORS.brightBlue} variant="h5" fontWeight="600">
                  {transaction.txId}
                </Typography>
                <Typography color={COLORS.lightThemeText}>{transaction.user}</Typography>
              </Box>
              <Box color={COLORS.lightThemeText}>{transaction.date}</Box>
              <Box backgroundColor={COLORS.brightBlue} p="5px 10px" borderRadius="4px">
                {transaction.cost}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </AdminDashboardDiv>
  );
}

export default AdminDashboard;
