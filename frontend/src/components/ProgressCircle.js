import { Box } from "@mui/material";

const ProgressCircle = ({ progress = "0.75", size = "40" }) => {
  const angle = progress * 360;

  const primaryColor = "#4B7DE7";  
  const blueAccentColor = "#80B5FA";  
  const greenAccentColor = "#4CAF50";  

  return (
    <Box
      sx={{
        background: `radial-gradient(${primaryColor} 55%, transparent 56%),
            conic-gradient(transparent 0deg ${angle}deg, ${blueAccentColor} ${angle}deg 360deg),
            ${greenAccentColor}`,
        borderRadius: "50%",
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

export default ProgressCircle;
