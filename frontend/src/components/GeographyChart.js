import { ResponsiveChoropleth } from "@nivo/geo";
import { geoFeatures } from "../data/mockGeoFeatures"; // Correct import
import { darken } from "polished"; // Importing polished to darken hover colors

const GeographyChart = ({ isDashboard = false }) => {
  // Custom color scheme
  const lightBackgroundColor = "#F5F9FF"; // Soft Sky Blue
  const darkBackgroundColor = "#2B2F3A"; // Dark Grayish Blue
  const textColorLight = "#2D3A56"; // Dark Navy Blue
  const textColorDark = "#E6F7F7"; // Soft Cyan
  const primaryColor = "#4361EE"; // Bright Blue
  const secondaryColor = "#80B5FA"; // Soft Blue
  const accentColor = "#FFA600"; // Vivid Orange
  const highlightedColor = "#FF4C61"; // Bright Coral Red
  const axisLineColor = "#BBBBBB"; // Gray
  const gridLineColorLight = "#E6E6E6"; // Very Light Gray
  const gridLineColorDark = "#4A4A4A"; // Dark Gray
  const hoverBackgroundColor = "#E6F7F7"; // Light Cyan

  return (
    <ResponsiveChoropleth
      data={geoFeatures.features} // Use geoFeatures directly
      theme={{
        axis: {
          domain: {
            line: {
              stroke: axisLineColor,
            },
          },
          legend: {
            text: {
              fill: textColorLight, // Directly apply the light text color
            },
          },
          ticks: {
            line: {
              stroke: axisLineColor,
              strokeWidth: 1,
            },
            text: {
              fill: textColorLight, // Directly apply the light text color
            },
          },
        },
        legends: {
          text: {
            fill: textColorLight, // Directly apply the light text color
          },
        },
      }}
      features={geoFeatures.features}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      domain={[0, 1000000]}
      unknownColor="#666666"
      label="properties.name"
      valueFormat=".2s"
      projectionScale={isDashboard ? 40 : 150}
      projectionTranslation={isDashboard ? [0.49, 0.6] : [0.5, 0.5]}
      projectionRotation={[0, 0, 0]}
      borderWidth={1.5}
      borderColor="#ffffff"
      legends={
        !isDashboard
          ? [
              {
                anchor: "bottom-left",
                direction: "column",
                justify: true,
                translateX: 20,
                translateY: -100,
                itemsSpacing: 0,
                itemWidth: 94,
                itemHeight: 18,
                itemDirection: "left-to-right",
                itemTextColor: textColorLight, // Directly apply the light text color
                itemOpacity: 0.85,
                symbolSize: 18,
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemTextColor: "#ffffff",
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]
          : undefined
      }
      // Adding color transitions and hover effects
      onMouseEnter={(e) => {
        e.target.style.fill = darken(0.1, primaryColor); // Darken color on hover
      }}
      onMouseLeave={(e) => {
        e.target.style.fill = primaryColor; // Revert back to original color
      }}
    />
  );
};

export default GeographyChart;
