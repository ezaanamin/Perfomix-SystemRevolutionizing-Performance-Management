import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { darken } from "polished"; 

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();

  
  const colors = {
    background: "#F5F9FF", 
    text: "#2D3A56", 
    primary: "#4361EE", 
    secondary: "#80B5FA", 
    accent: "#FFA600", 
    highlight: "#FF4C61", 
    axisLine: "#BBBBBB", 
    gridLine: "#E6E6E6", 
    hoverBox: "#E6F7F7", 
    hoverGraph: darken(0.1, "#4361EE"), 
  };

  
  const kpiData = [
    {
      role: "Software Engineer",
      "Code Quality": 95.00,
      "Code Efficiency": 10.00,
      "Commit Frequency": 10,
      "Task Completion Rate": 90.00,
    },
    {
      role: "Project Manager",
      "Milestone Achievement Rate": 95.00,
      "Budget Utilization": 5.00,
      "Resource Allocation": 85.00,
    },
    {
      role: "Business Manager",
      "Revenue Growth": 10.00,
      "Customer Satisfaction": 80.00,
      "Operational Efficiency": 15.00,
    },
    {
      role: "Testing Team",
      "Test Case Coverage": 95.00,
      "Bug Detection Rate": 100,
      "Test Execution Time": 20.00,
    },
    
  ];

  
  const allKeys = [
    "Code Quality",
    "Code Efficiency",
    "Commit Frequency",
    "Task Completion Rate",
    "Milestone Achievement Rate",
    "Budget Utilization",
    "Resource Allocation",
    "Revenue Growth",
    "Customer Satisfaction",
    "Operational Efficiency",
    "Test Case Coverage",
    "Bug Detection Rate",
    "Test Execution Time",
  ];

  return (
    <ResponsiveBar
      data={kpiData} 
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.axisLine,
            },
          },
          legend: {
            text: {
              fill: colors.text,
            },
          },
          ticks: {
            line: {
              stroke: colors.axisLine,
              strokeWidth: 1,
            },
            text: {
              fill: colors.text,
              fontSize: 9, 
            },
          },
        },
        legends: {
          text: {
            fill: colors.text,
          },
        },
      }}
      keys={allKeys} 
      indexBy="role" 
      margin={{ top: 50, right: 20, bottom: 20, left: 60 }}
      padding={0.5}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "nivo" }}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: colors.primary,
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: colors.accent,
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      borderColor={{
        from: "color",
        modifiers: [["darker", "1.6"]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Role",
        legendPosition: "middle",
        legendOffset: 32,
        tickFontSize: 10, 
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "KPI",
        legendPosition: "middle",
        legendOffset: -40,
        tickFontSize: 10, 
      }}
      enableLabel={true} 
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      label={{
        fontSize: 9, 
        fill: colors.text, 
      }}
      role="application"
      barAriaLabel={function (e) {
        return e.id + ": " + e.formattedValue + " in role: " + e.indexValue;
      }}
    />
  );
};

export default BarChart;
