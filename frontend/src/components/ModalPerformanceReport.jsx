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
import { fetchUsers } from "../API/slice/API"; // Update to your actual path

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

// Fake performance — replace with API if needed
const performanceMock = {
  Rating: "88%",
  Efficiency: "91%",
  BotsDetected: 2,
};

function ModalPerformanceReport({ open, handleClose }) {
  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState(null);

  const users = useSelector((state) => state.user.usersData);
  const status = useSelector((state) => state.user.userStatus);
  const error = useSelector((state) => state.user.userError);

  useEffect(() => {
    if (open && status === "idle") {
      dispatch(fetchUsers());
    }
  }, [open, status, dispatch]);

  const handleUserClick = (userId) => setSelectedUserId(userId);
  const handleBack = () => setSelectedUserId(null);

  const renderUserList = () => {
    if (status === "loading") {
      return (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Typography color="error">Error: {error}</Typography>;
    }

    const filteredUsers = Array.isArray(users)
      ? users.filter((u) => u.role !== "Admin")
      : [];

    if (filteredUsers.length === 0) {
      return <Typography>No users found (Admins are excluded).</Typography>;
    }

    return (
      <>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Team Members
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            overflowY: "auto",
            flexGrow: 1,
            pr: 1,
            mb: 2,
          }}
        >
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
    const user = users.find((u) => u.user_id === selectedUserId);
    if (!user) return null;

    return (
      <>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={handleBack} size="small" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="600">
            @{user.name.toLowerCase().replace(/\s+/g, "")}'s Performance
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" fontWeight="600" gutterBottom>
          Performance Metrics
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Rating"
              secondary={performanceMock.Rating}
              primaryTypographyProps={{ fontWeight: 500 }}
              secondaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Efficiency"
              secondary={performanceMock.Efficiency}
              primaryTypographyProps={{ fontWeight: 500 }}
              secondaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>
        </List>

        <Typography variant="subtitle1" fontWeight="600" mt={3}>
          Bots Detected
        </Typography>
        <Typography
          color={performanceMock.BotsDetected > 0 ? "error" : "success.main"}
          mb={1}
        >
          {performanceMock.BotsDetected} bot
          {performanceMock.BotsDetected !== 1 ? "s" : ""} detected
        </Typography>
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
