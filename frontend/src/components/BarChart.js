import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { darken } from "polished"; // For color adjustments

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();

  // Define a single color scheme
  const colors = {
    background: "#F5F9FF", // Soft Sky Blue for background
    text: "#2D3A56", // Dark Navy Blue for Text
    primary: "#4361EE", // Bright Blue for primary bars/lines
    secondary: "#80B5FA", // Soft Blue for secondary bars/lines
    accent: "#FFA600", // Vivid Orange for accent
    highlight: "#FF4C61", // Bright Coral Red for highlighted points
    axisLine: "#BBBBBB", // Gray for axis lines
    gridLine: "#E6E6E6", // Very Light Gray for grid lines
    hoverBox: "#E6F7F7", // Light Cyan for hover on box
    hoverGraph: darken(0.1, "#4361EE"), // Darkened Bright Blue for hover on graph
  };

  // Reshaped KPI data structure for better visualization
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
    // Add more data entries if necessary
  ];

  // All keys in the chart
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
      data={kpiData} // Using the reshaped KPI data
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
              fontSize: 9, // Reduced font size for tick labels
            },
          },
        },
        legends: {
          text: {
            fill: colors.text,
          },
        },
      }}
      keys={allKeys} // Display all keys in the chart
      indexBy="role" // The x-axis labels (roles)
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
        tickFontSize: 10, // Reduced font size for axis bottom labels
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "KPI",
        legendPosition: "middle",
        legendOffset: -40,
        tickFontSize: 10, // Reduced font size for axis left labels
      }}
      enableLabel={true} // Ensure that the keys are enabled
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      label={{
        fontSize: 9, // Reduced font size for labels (keys)
        fill: colors.text, // Set the text color for labels
      }}
      role="application"
      barAriaLabel={function (e) {
        return e.id + ": " + e.formattedValue + " in role: " + e.indexValue;
      }}
    />
  );
};

export default BarChart;
