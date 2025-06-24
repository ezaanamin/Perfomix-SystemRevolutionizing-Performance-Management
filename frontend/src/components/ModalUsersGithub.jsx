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
import { fetchUsers } from "../API/slice/API"; // Updated import

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

const randomUsersMock = [
  {
    user_id: "r1",
    name: "RandomUser1",
    role: "Software Engineer",
    github_username: "randomuser1",
  },
  {
    user_id: "r2",
    name: "RandomUser2",
    role: "Software Engineer",
    github_username: "randomuser2",
  },
];

const getRandomBotPrediction = () => (Math.random() < 0.5 ? 1 : 0);

function ModalUsersGithub({ open, handleClose }) {
  const dispatch = useDispatch();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [botPrediction, setBotPrediction] = useState(null);
  const [selectedMetadata, setSelectedMetadata] = useState(null);

  const users = useSelector((state) => state.API.usersData); // Using your API state slice
  const status = useSelector((state) => state.API.userStatus); // Assuming this is the loading status
  const error = useSelector((state) => state.API.userError);

  useEffect(() => {
    if (open && status === "idle") {
      dispatch(fetchUsers());
    }
    if (!open) {
      setSelectedUserId(null);
      setBotPrediction(null);
      setSelectedMetadata(null);
    }
  }, [open, status, dispatch]);

  const softwareEngineers = Array.isArray(users)
    ? users.filter((u) => u.role === "Software Engineer")
    : [];

  const usersToShow =
    softwareEngineers.length > 0 ? softwareEngineers : randomUsersMock;

  const loading = status === "loading";

  const handleUserClick = (user) => {
    setSelectedUserId(user.user_id);
    setSelectedMetadata({
      github_username:
        user.github_username || user.name.toLowerCase().replace(/\s+/g, ""),
      last_commit: "2025-06-10",
      repo_count: 12,
      followers: 34,
    });
    setBotPrediction(getRandomBotPrediction());
  };

  const handleBack = () => {
    setSelectedUserId(null);
    setBotPrediction(null);
    setSelectedMetadata(null);
  };

  const botDetectionText = (prediction) => {
    return prediction === 1 ? "Bot Detected" : "No Bot Detected";
  };

  const selectedUser = usersToShow.find((u) => u.user_id === selectedUserId);

  const renderUserList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Typography color="error">Error: {error}</Typography>;
    }

    if (usersToShow.length === 0) {
      return <Typography>No software engineers found.</Typography>;
    }

    return (
      <>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Software Engineers
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ overflowY: "auto", flexGrow: 1, pr: 1, mb: 2 }}>
          <List>
            {usersToShow.map((user) => (
              <ListItem
                key={user.user_id}
                button
                onClick={() => handleUserClick(user)}
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
    if (!selectedUser) return null;

    return (
      <>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={handleBack} size="small" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="600">
            @{selectedUser.name.toLowerCase().replace(/\s+/g, "")}'s Bot Detection
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {selectedMetadata && (
              <Box mb={2}>
                <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                  Metadata Used:
                </Typography>
                <pre
                  style={{
                    backgroundColor: "#f4f4f4",
                    padding: "10px",
                    borderRadius: "4px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    fontSize: "0.85rem",
                  }}
                >
                  {JSON.stringify(selectedMetadata, null, 2)}
                </pre>
              </Box>
            )}

            {botPrediction !== null && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: botPrediction === 1 ? "#ffebee" : "#e8f5e9",
                  color: botPrediction === 1 ? "#c62828" : "#2e7d32",
                  fontWeight: "700",
                  fontSize: "1.25rem",
                  textAlign: "center",
                  boxShadow:
                    botPrediction === 1
                      ? "0 0 8px 2px rgba(198, 40, 40, 0.4)"
                      : "0 0 8px 2px rgba(46, 125, 50, 0.4)",
                }}
              >
                {botDetectionText(botPrediction)}
              </Box>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        handleClose();
        setSelectedUserId(null);
        setBotPrediction(null);
        setSelectedMetadata(null);
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

export default ModalUsersGithub;
