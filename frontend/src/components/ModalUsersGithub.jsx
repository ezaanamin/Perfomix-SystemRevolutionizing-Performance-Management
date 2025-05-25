import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, Avatar, Box, Typography, CircularProgress, Divider
} from "@mui/material";
import { useDispatch } from "react-redux";
import BotDetectionResult from "./BotModal"

function ModalUsersGithub({ open, handleClose }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetadata, setSelectedMetadata] = useState(null); // new
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("https://api.github.com/repos/facebook/react/issues?per_page=10")
        .then((res) => res.json())
        .then((data) => {
          const enriched = data
            .filter(issue => !issue.pull_request)
            .map((issue) => {
              const created = new Date(issue.created_at);
              return {
                username: issue.user.login,
                avatar_url: issue.user.avatar_url,
                data: {
                  comment_length: issue.body ? issue.body.length : 0,
                  issue_id: issue.number,
                  issue_status: issue.state === "open" ? 0 : 1,
                  issue_resolved: issue.closed_at ? 1 : 0,
                  conversation_comments: issue.comments,
                  day: created.getDate(),
                  month: created.getMonth() + 1,
                  year: created.getFullYear(),
                  hour: created.getHours(),
                  minute: created.getMinutes(),
                  second: created.getSeconds(),
                  day_issue_created_date: created.getDate(),
                  month_issue_created_month: created.getMonth() + 1,
                  year_issue_created_year: created.getFullYear(),
                  activity_Closing_issue: issue.closed_at ? 1 : 0,
                  activity_Commenting_issue: issue.comments > 0 ? 1 : 0,
                  activity_Opening_issue: 1,
                  activity_Reopening_issue: 0,
                  activity_Transferring_issue: 0,
                },
              };
            });

          setIssues(enriched);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching GitHub issues:", err);
          setLoading(false);
        });
    }
  }, [open]);

  const handleUserClick = (user) => {
    setSelectedMetadata(user.data); // Triggers result modal
  };

  return (
    <>
      {/* Bot Detection Result Modal */}
      {selectedMetadata && (
        <BotDetectionResult
          open={Boolean(selectedMetadata)}
          metadata={selectedMetadata}
          handleClose={() => setSelectedMetadata(null)}
        />
      )}

      {/* GitHub Users Modal */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>GitHub Users (Click to Run Bot Detection)</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {issues.map((user, idx) => (
                <React.Fragment key={idx}>
                  <ListItem
                    onClick={() => handleUserClick(user)}
                    sx={{
                      cursor: "pointer",
                      padding: "20px",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                        transition: "0.3s ease",
                      },
                    }}
                  >
                    <Avatar
                      src={user.avatar_url}
                      alt={user.username}
                      sx={{ marginRight: 2, width: 60, height: 60 }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        @{user.username}
                      </Typography>
                    </Box>
                  </ListItem>
                  {idx !== issues.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ModalUsersGithub;
