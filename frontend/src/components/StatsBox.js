import { Box, Typography } from "@mui/material";
import ProgressCircle from "./ProgressCircle";

const StatBox = ({ title, subtitle, icon, progress, increase }) => {
  const primaryColor = "#4B7DE7"; 
  const greyColor = "#B0B0B0";  
  const greenAccentColor = "#4CAF50";  
  const greenAccentDarkColor = "#388E3C";  

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: greyColor }}
          >
            {title}
          </Typography>
        </Box>
        <Box>
          <ProgressCircle progress={progress} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: greenAccentColor }}>
          {subtitle}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: greenAccentDarkColor }}
        >
          {increase}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
