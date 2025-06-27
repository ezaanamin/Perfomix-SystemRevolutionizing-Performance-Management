import { useState, useContext } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import Admin from "../images/admin.jpeg";
import { UserContext } from "../ContextState/contextState";
import { useNavigate } from "react-router-dom";


const Item = ({ title, to, icon, selected, setSelected, isCollapsed }) => {
  const navigate = useNavigate();
  const handleNavigation = () => {
    setSelected(title);
    navigate(to);
  };
  const isActive = selected === title;
  return (
    <MenuItem
      active={isActive}
      onClick={handleNavigation}
   
      icon={icon}
      style={{
        color: isActive ? "#6870fa" : "#4B7DE7",
        backgroundColor: isActive ? "#E1ECFF" : "transparent",
      }}
    >
      {!isCollapsed && (
        <Typography
          sx={{
            color: isActive ? "#6870fa" : "#4B7DE7",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
      )}
      <Link to={to} />
    </MenuItem>
  );
};

const SidebarPerfomix = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const { Role,  userInfo,
    setUserInfo  } = useContext(UserContext);

    console.log(userInfo,'hello sidebar')

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          width: isCollapsed ? "80px" : "250px",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <Sidebar collapsed={isCollapsed} style={{ height: "100vh", backgroundColor: "#D0DBE9" }}>
        <Menu iconShape="square">
   
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h6" sx={{ color: "#4B7DE7" }}>
                  PERFOMIX
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon sx={{ color: "#4B7DE7" }} />
                </IconButton>
              </Box>
            )}
          </MenuItem>


          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={Admin}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0", color: "#4B7DE7" }}
                >
                 {userInfo.Name}
                </Typography>
                <Typography variant="h5" sx={{ color: "#4B7DE7" }}>
                  {Role === "admin" ? "Admin" : Role === "manager" ? "Line Manager" : userInfo.Role}
                </Typography>
              </Box>
            </Box>
          )}

    
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/admin"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              isCollapsed={isCollapsed}
            />

{Role !== "staff" && (
  <>

            <Typography
              variant="p"
              sx={{ m: "15px 0 5px 20px", color: "#4B7DE7" }}
            >
              Key Features
            </Typography>
           
        
                <Item
                  title="KPI Configuration"
                  to="/kpi"
                  icon={<BarChartOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  isCollapsed={isCollapsed}
                />
              </>
            )}
            {Role !== "staff" && (
              <Item
                title="Performance Reports"
                to="/reports"
                icon={<ReceiptOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
            )}
            {Role === "manager" && (
              <Item
                title="Anomaly Detection"
                to="/anomaly"
                icon={<TimelineOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
            )}
            {Role !== "staff" && (
              <Item
                title="Recommendations"
                to="/recommendations"
                icon={<PeopleOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
            )}

        
            {Role === "admin" && (
              <>
                <Typography
                  variant="p"
                  sx={{ m: "15px 0 5px 20px", color: "#4B7DE7" }}
                >
                  Admin Tools
                </Typography>
                <Item
                  title="User Management"
                  to="/users"
                  icon={<PersonOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  isCollapsed={isCollapsed}
                />
                <Item
                  title="System Settings"
                  to="/settings"
                  icon={<MapOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                  isCollapsed={isCollapsed}
                />
              </>
            )}

        
            {Role !== "admin" || Role !== "manager"  && (
              <Typography
                variant="p"
                sx={{ m: "15px 0 5px 20px", color: "#4B7DE7" }}
              >
                Analytics
              </Typography>
            )}
            {Role !== "staff" && (
              <Item
                title="Performance Insights"
                to="/insights"
                icon={<PieChartOutlineOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                isCollapsed={isCollapsed}
              />
            )}
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default SidebarPerfomix;
