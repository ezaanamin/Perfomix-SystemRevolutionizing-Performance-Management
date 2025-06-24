import { Box, IconButton, InputBase, Typography, Menu, MenuItem } from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const primaryColor = "#4B7DE7";
  const secondaryColor = "#80B5FA";
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

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
        <IconButton onClick={handleClick}>
          <PersonOutlinedIcon sx={{ color: primaryColor }} />
        </IconButton>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 6,
            sx: {
              borderRadius: 2,
              backgroundColor: "#f0f6ff",
              color: primaryColor,
              minWidth: 150,
              '& .MuiMenuItem-root': {
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: "#d9e9ff",
                  color: "#003c8f",
                },
              },
            },
          }}
        >
          <MenuItem onClick={handleLogout}>
            🚪 Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
