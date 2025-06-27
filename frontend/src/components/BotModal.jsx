import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";

function BotDetectionResult({ open, handleClose, metadata, prediction }) {
  
  let predValue = null;
  let message = "";

  if (prediction !== null && prediction !== undefined) {
    if (typeof prediction === "object") {
      predValue = prediction.prediction;
      message = prediction.message || "";
    } else {
      predValue = prediction;
      message = "";
    }
  }

  
  const hasPrediction = predValue === 0 || predValue === 1;

  
  const isBot = predValue === 1;

  
  const isDetectionDoneToday = message === "Bot detection was already done today.";

  
  const formattedData = Object.entries(metadata || {}).map(([key, value]) => ({
    label: key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value,
  }));

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bot Detection Analysis</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Typography variant="body1" gutterBottom>
          {message || "No message provided."}
        </Typography>

        {hasPrediction && (
          <Box my={2}>
            <Typography variant="h6">
              Prediction:{" "}
              <span style={{ color: isBot ? "red" : "green" }}>
                {isBot ? "Bot Detected (Yes)" : "Human (No Bot)"}
              </span>
            </Typography>
          </Box>
        )}

     
          <>
            <Divider sx={{ my: 2 }} />
            <List dense>
              {formattedData.map((item, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={item.label}
                      secondary={String(item.value)}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                  {idx !== formattedData.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
   
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BotDetectionResult;
