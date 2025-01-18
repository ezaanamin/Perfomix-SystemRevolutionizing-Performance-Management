import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";

const LineChart = () => {

  const colors = {
    primaryLine: "#4361EE", // Bright Blue
    anomalyLine: "#FF4C61", // Red for anomalies
  };

  // Custom Data representing KPI tracking with anomalies
  const data = [
    {
      id: "employee_123",
      data: [
        { x: "2023-01", y: 85 },
        { x: "2023-02", y: 78 },
        { x: "2023-03", y: 92 },
        { x: "2023-04", y: 88 },
        { x: "2023-05", y: 90 },
        { x: "2023-06", y: 75 },
        { x: "2023-07", y: 80 },
        { x: "2023-08", y: 95 },
        { x: "2023-09", y: 100 },
        { x: "2023-10", y: 95 },
        { x: "2023-11", y: 85 },
        { x: "2023-12", y: 90 },
      ],
    },
  ];

  return (
    <ResponsiveLine
      data={data}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.primaryLine, // Axis line color
            },
          },
          ticks: {
            line: {
              stroke: colors.primaryLine, // Axis tick line color
              strokeWidth: 1,
            },
            text: {
              fill: colors.primaryLine, // Tick text color
            },
          },
        },
      }}
      colors={[colors.primaryLine]} // Apply primary line color
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "band", padding: 0.3 }} // Band scale for categorical data
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      curve="linear"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5,
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      lineWidth={3}
    />
  );
};

export default LineChart;
