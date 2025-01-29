import React, { useContext } from "react";
import { Modal, Box, Button, Typography } from "@mui/material";
import { UserContext } from "../ContextState/contextState";
import { DataGrid } from "@mui/x-data-grid";
import { CheckCircle, Cancel } from "@mui/icons-material";

const CustomModal = ({ title, data, ModalType }) => {
  const { setOpen, open } = useContext(UserContext);

  const handleClose = () => setOpen(false);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "#D0DBE9",
    boxShadow: 24,
    borderRadius: "15px",
    p: 3,
  };

  const columns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "name", headerName: "Name", width: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {params.value === "Active" ? (
            <CheckCircle sx={{ color: "#4CAF50" }} />
          ) : (
            <Cancel sx={{ color: "#F44336" }} />
          )}
          <Typography
            sx={{
              color: params.value === "Active" ? "#4CAF50" : "#F44336",
              fontWeight: "bold",
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
  ];

  const Userscolumns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "user", headerName: "User", width: 150 },
    { field: "team", headerName: "Team", width: 150 },
    {
      field: "kpiScore",
      headerName: "KPI Score",
      width: 120,
      renderCell: (params) => (
        <Typography
          sx={{
            color: params.value >= 75 ? "#4CAF50" : params.value >= 50 ? "#FFC107" : "#F44336",
            fontWeight: "bold",
          }}
        >
          {params.value}%
        </Typography>
      ),
    },
    {
      field: "kpiStatus",
      headerName: "KPI Status",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {params.value === "Achieved" ? (
            <CheckCircle sx={{ color: "#4CAF50" }} />
          ) : (
            <Cancel sx={{ color: "#F44336" }} />
          )}
          <Typography
            sx={{
              color: params.value === "Achieved" ? "#4CAF50" : "#F44336",
              fontWeight: "bold",
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {params.value === "Active" ? (
            <CheckCircle sx={{ color: "#4CAF50" }} />
          ) : (
            <Cancel sx={{ color: "#F44336" }} />
          )}
          <Typography
            sx={{
              color: params.value === "Active" ? "#4CAF50" : "#F44336",
              fontWeight: "bold",
            }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
  ];

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography
          variant="h5"
          sx={{ color: "black", fontWeight: "bold", mb: 2, textAlign: "center" }}
        >
          {title || "Default Title"}
        </Typography>

        {ModalType === "KPI" && (
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={data}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              sx={{
                bgcolor: "white",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            />
          </Box>
        )}

        {ModalType === "Users" && (
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={data}
              columns={Userscolumns}
              pageSize={5}
              rowsPerPageOptions={[5]}
              sx={{
                bgcolor: "white",
                borderRadius: "10px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            />
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
          <Button
            onClick={handleClose}
            sx={{
              backgroundColor: "#4361EE",
              color: "white",
              borderRadius: "20px",
              px: 3,
              "&:hover": { backgroundColor: "#3651C5" },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomModal;
