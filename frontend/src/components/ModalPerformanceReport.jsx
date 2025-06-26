import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  fetchUserPerformanceRating,
} from "../API/slice/API";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  maxHeight: "85vh",
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 3,
  display: "flex",
  flexDirection: "column",
};

function ModalPerformanceReport({ open, handleClose }) {
  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState(null);

  const {
    usersData: users,
    userStatus,
    userError,
    userPerformance,
    userPerformanceLoading,
    userPerformanceError,
  } = useSelector((state) => state.API);

  useEffect(() => {
    if (open) {
      dispatch(fetchUsers());
    } else {
      setSelectedUserId(null);
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (selectedUserId) {
      const user = users.find((u) => u.user_id === selectedUserId);
      if (user) {
        dispatch(fetchUserPerformanceRating(user.name));
      }
    }
  }, [selectedUserId, users, dispatch]);

  const handleUserClick = (userId) => setSelectedUserId(userId);
  const handleBack = () => setSelectedUserId(null);

  const renderUserList = () => {
    if (userStatus === "loading") {
      return (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      );
    }

    if (userError) {
      return <Typography color="error">Error: {userError}</Typography>;
    }

    const filteredUsers = users.filter((u) => u.role !== "Admin");

    if (filteredUsers.length === 0) {
      return <Typography>No team members found.</Typography>;
    }

    return (
      <>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Team Members
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ overflowY: "auto", flexGrow: 1, pr: 1, mb: 2 }}>
          <List>
            {filteredUsers.map((user) => (
              <ListItem
                key={user.user_id}
                button
                onClick={() => handleUserClick(user.user_id)}
                sx={{
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                }}
              >
                <Box
                  component="img"
                  src={`https://i.pravatar.cc/100?u=${user.user_id}`}
                  alt={user.name}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                    mr: 2,
                  }}
                />
                <ListItemText
                  primary={
                    <Typography fontWeight="600">
                      @{user.name.toLowerCase().replace(/\s+/g, "")}
                    </Typography>
                  }
                  secondary={user.role}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </>
    );
  };

  const renderUserDetails = () => {
    if (userPerformanceLoading) {
      return (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      );
    }

    if (userPerformanceError) {
      return <Typography color="error">Error: {userPerformanceError}</Typography>;
    }

    if (!userPerformance) {
      return <Typography>No performance data available.</Typography>;
    }

    return (
      <>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={handleBack} size="small" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="600">
            @{userPerformance.UserName.toLowerCase().replace(/\s+/g, "")}'s Performance
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
          Performance Summary
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary="Performance"
              secondary={`${userPerformance.PerformancePercent}%`}
              primaryTypographyProps={{ fontWeight: 500 }}
              secondaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Bots Detected"
              secondary={userPerformance.BotCount}
              primaryTypographyProps={{ fontWeight: 500 }}
              secondaryTypographyProps={{
                fontWeight: 600,
                color:
                  userPerformance.BotCount > 0 ? "error.main" : "success.main",
              }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Final Rating"
              secondary={userPerformance.Rating.toFixed(2)}
              primaryTypographyProps={{ fontWeight: 500 }}
              secondaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Last Updated"
              secondary={
                new Date(userPerformance.LastUpdated).toLocaleString() || "N/A"
              }
              primaryTypographyProps={{ fontWeight: 500 }}
              secondaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>
        </List>
      </>
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        handleClose();
        setSelectedUserId(null);
      }}
    >
      <Box sx={modalStyle}>
        {selectedUserId ? renderUserDetails() : renderUserList()}
        <Box mt={2} textAlign="right">
          <Button variant="contained" onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ModalPerformanceReport;
