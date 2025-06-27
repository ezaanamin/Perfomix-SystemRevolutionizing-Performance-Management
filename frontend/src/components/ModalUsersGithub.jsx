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
import { fetchGitHubUsers, Bot_Detection } from "../API/slice/API";

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

function ModalUsersGithub({ open, handleClose }) {
  const dispatch = useDispatch();

  const [selectedUser, setSelectedUser] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const {
    githubUsers,
    githubUserStatus,
    githubUserError,
    editKpiStatus,
    latestBotDetection,
    editKpiError,
  } = useSelector((state) => state.API);

  useEffect(() => {
    if (open && githubUserStatus === "idle") {
      dispatch(fetchGitHubUsers());
    }
    if (!open) {
      resetState();
    }
  }, [open, githubUserStatus, dispatch]);

  const resetState = () => {
    setSelectedUser(null);
    setMetadata(null);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setMetadata({
      username: user.login,
      avatar: user.avatar_url,
      profile: user.html_url,
      userId: user.id,
      fetchedAt: new Date().toISOString(),
    });

    dispatch(Bot_Detection({ user_id: user.id, ...user.activity }));
  };

  const handleBack = () => {
    resetState();
  };

  const renderUserList = () => {
    if (githubUserStatus === "loading") {
      return (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      );
    }

    if (githubUserError) {
      return (
        <Typography color="error">
          Error:{" "}
          {typeof githubUserError === "string"
            ? githubUserError
            : JSON.stringify(githubUserError)}
        </Typography>
      );
    }

    if (!githubUsers || githubUsers.length === 0) {
      return <Typography>No active GitHub users found.</Typography>;
    }

    return (
      <>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Active GitHub Users
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ overflowY: "auto", flexGrow: 1, pr: 1, mb: 2 }}>
          <List>
            {githubUsers.map((user) => (
              <ListItem
                key={user.id}
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
                  src={user.avatar_url}
                  alt={user.login}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                    mr: 2,
                  }}
                />
                <ListItemText
                  primary={<Typography fontWeight="600">@{user.login}</Typography>}
                  secondary={`GitHub ID: ${user.id}`}
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
            @{selectedUser.login}'s Bot Detection
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {metadata && (
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              User Metadata:
            </Typography>
            <pre
              style={{
                backgroundColor: "#f4f4f4",
                padding: "10px",
                borderRadius: "4px",
                maxHeight: "180px",
                overflowY: "auto",
                fontSize: "0.85rem",
              }}
            >
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </Box>
        )}

        {editKpiStatus === "loading" && (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        )}

        {editKpiStatus === "failed" && (
          <Typography color="error" mb={2}>
            Error:{" "}
            {typeof editKpiError === "string"
              ? editKpiError
              : JSON.stringify(editKpiError)}
          </Typography>
        )}

        {editKpiStatus === "succeeded" && latestBotDetection && (
          <Box
            sx={{
              mt: 1,
              p: 2,
              borderRadius: 2,
              backgroundColor:
                latestBotDetection.prediction === 1 ? "#ffebee" : "#e8f5e9",
              color: latestBotDetection.prediction === 1 ? "#c62828" : "#2e7d32",
              fontWeight: "700",
              fontSize: "1.25rem",
              textAlign: "center",
              boxShadow:
                latestBotDetection.prediction === 1
                  ? "0 0 8px 2px rgba(198, 40, 40, 0.4)"
                  : "0 0 8px 2px rgba(46, 125, 50, 0.4)",
            }}
          >
            {latestBotDetection.prediction === 1
              ? "Bot Detected"
              : "No Bot Detected"}
          </Box>
        )}
      </>
    );
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        handleClose();
        resetState();
      }}
    >
      <Box sx={modalStyle}>
        {selectedUser ? renderUserDetails() : renderUserList()}
        <Box mt={2} textAlign="right">
          <Button
            variant="contained"
            onClick={() => {
              handleClose();
              resetState();
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ModalUsersGithub;
