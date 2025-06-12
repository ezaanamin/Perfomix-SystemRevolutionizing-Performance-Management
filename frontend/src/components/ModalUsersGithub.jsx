import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  Avatar,
  Box,
  Typography,
  CircularProgress,
  Divider,
  TextField,
  Snackbar,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, Bot_Detection } from "../API/slice/API";
import BotDetectionResult from "./BotModal";

function ModalUsersGithub({ open, handleClose }) {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.user.usersData);
  const status = useSelector((state) => state.user.userStatus);
  const error = useSelector((state) => state.user.userError);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetadata, setSelectedMetadata] = useState(null);
  const [botPrediction, setBotPrediction] = useState(null);
  const [notFoundMessage, setNotFoundMessage] = useState("");

  useEffect(() => {
    if (open && status === "idle") {
      dispatch(fetchUsers());
    }
  }, [open, status, dispatch]);

  const handleUserClick = async (user) => {
    const githubUser =
      user.github_username || user.name.replace(/\s+/g, "").toLowerCase();

    try {
      const res = await fetch(
        `https://api.github.com/search/issues?q=author:${githubUser}&per_page=1`
      );
      const json = await res.json();
      const issue = json.items?.[0];

      if (!issue) {
        setNotFoundMessage(`GitHub user "${githubUser}" not found or has no issue activity.`);
        return;
      }

      const created = new Date(issue.created_at);

      const metadata = {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        team_name: user.team_name,
        manager_id: user.manager_id,
        comment_length: issue.body?.length || 0,
        issue_status: issue.state === "open" ? 0 : 1,
        issue_resolved: issue.closed_at ? 1 : 0,
        conversation_comments: issue.comments || 0,
        day: created.getDate(),
        month: created.getMonth() + 1,
        year: created.getFullYear(),
        activity_Opening_issue: 1,
        activity_Commenting_issue: issue.comments > 0 ? 1 : 0,
        activity_Closing_issue: issue.closed_at ? 1 : 0,
        activity_Reopening_issue: 0,
      };

      const response = await dispatch(Bot_Detection(metadata));
      setSelectedMetadata(metadata);
      setBotPrediction(response.payload);
    } catch (err) {
      console.error("GitHub fetch failed:", err);
      setNotFoundMessage("Failed to fetch GitHub data. Try again later.");
    }
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(
        (user) =>
          (user.role === "Software Engineer" || user.role === "Testing") &&
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      {selectedMetadata && (
        <BotDetectionResult
          open={Boolean(selectedMetadata)}
          metadata={selectedMetadata}
          prediction={botPrediction}
          handleClose={() => {
            setSelectedMetadata(null);
            setBotPrediction(null);
          }}
        />
      )}

      <Snackbar
        open={Boolean(notFoundMessage)}
        autoHideDuration={4000}
        onClose={() => setNotFoundMessage("")}
        message={notFoundMessage}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>GitHub Bot Detection</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
          <TextField
            fullWidth
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />

          {status === "loading" ? (
            <Box display="flex" justifyContent="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">Error: {error}</Typography>
          ) : filteredUsers.length === 0 ? (
            <Typography>No matching users found.</Typography>
          ) : (
            <List>
              {filteredUsers.map((user, idx) => {
                const avatarUser =
                  user.github_username ||
                  user.name.replace(/\s+/g, "").toLowerCase();
                return (
                  <React.Fragment key={idx}>
                    <ListItem
                      onClick={() => handleUserClick(user)}
                      sx={{
                        cursor: "pointer",
                        padding: "16px",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                          transition: "0.3s",
                        },
                      }}
                    >
                      <Avatar
                        src={`https://github.com/${avatarUser}.png`}
                        alt={user.name}
                        sx={{ mr: 2, width: 56, height: 56 }}
                      />
                      <Box>
                        <Typography variant="h6">{user.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {user.role}
                        </Typography>
                      </Box>
                    </ListItem>
                    {idx !== filteredUsers.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ModalUsersGithub;
