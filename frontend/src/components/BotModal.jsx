import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Typography, Box
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import { useDispatch } from "react-redux";
import { Bot_Detection } from "../API/slice/API"

function BotDetectionResult({ open, handleClose, metadata }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    runBotDetection();
  }, []);

  const runBotDetection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await dispatch(Bot_Detection(metadata)).unwrap(); // unpacks the returned payload
      setResult(res.prediction === 1 ? "human" : "bot");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bot Detection Result</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          {loading && <CircularProgress />}
          {error && <Typography color="error">{error}</Typography>}
          {!loading && result && (
            <>
              {result === "human" ? (
                <>
                  <CheckCircleIcon sx={{ fontSize: 60, color: "green" }} />
                  <Typography variant="h5" fontWeight="bold" mt={2}>
                     Human Detected
                  </Typography>
                </>
              ) : (
                <>
                  <WarningIcon sx={{ fontSize: 60, color: "red" }} />
                  <Typography variant="h5" fontWeight="bold" mt={2}>
                    Bot Detected
                  </Typography>
                </>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default BotDetectionResult;
