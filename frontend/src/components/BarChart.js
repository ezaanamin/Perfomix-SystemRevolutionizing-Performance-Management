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

  // mockData.js

 const mockBarData = [
  {
    country: "USA",
    "hot dog": 133,
    burger: 45,
    sandwich: 57,
    kebab: 39,
    fries: 91,
    donut: 45,
  },
  {
    country: "Canada",
    "hot dog": 101,
    burger: 68,
    sandwich: 89,
    kebab: 29,
    fries: 55,
    donut: 34,
  },
  {
    country: "UK",
    "hot dog": 120,
    burger: 85,
    sandwich: 66,
    kebab: 75,
    fries: 100,
    donut: 40,
  },
  {
    country: "Germany",
    "hot dog": 95,
    burger: 120,
    sandwich: 45,
    kebab: 50,
    fries: 78,
    donut: 52,
  },
  {
    country: "Australia",
    "hot dog": 140,
    burger: 78,
    sandwich: 60,
    kebab: 32,
    fries: 88,
    donut: 46,
  },
];

  return (
    <ResponsiveBar
      data={mockBarData} // Using the mock data
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
            },
          },
        },
        legends: {
          text: {
            fill: colors.text,
          },
        },
      }}
      keys={["hot dog", "burger", "sandwich", "kebab", "fries", "donut"]}
      indexBy="country"
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
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
        legend: isDashboard ? undefined : "country",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "food",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      enableLabel={false}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      role="application"
      barAriaLabel={function (e) {
        return e.id + ": " + e.formattedValue + " in country: " + e.indexValue;
      }}
    />
  );
};

export default BarChart;
