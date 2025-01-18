import { Box, IconButton, InputBase, Typography } from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";

const Topbar = () => {
  const primaryColor = "#4B7DE7"; // Main color used for text/icons
  const secondaryColor = "#80B5FA"; // Lighter background color
  
  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      p={2} 
      bgcolor={"#D0DBE9"} 
    >
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={secondaryColor}
        borderRadius="3px"
      >
        <InputBase 
          sx={{ ml: 2, flex: 1, color: primaryColor }} 
          placeholder="Search" 
        />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon sx={{ color: primaryColor }} />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton>
          <NotificationsOutlinedIcon sx={{ color: primaryColor }} />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon sx={{ color: primaryColor }} />
        </IconButton>
        <IconButton>
          <PersonOutlinedIcon sx={{ color: primaryColor }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
