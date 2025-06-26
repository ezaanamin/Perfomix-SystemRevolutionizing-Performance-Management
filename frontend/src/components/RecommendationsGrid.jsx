import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { performance_with_courses } from "../API/slice/API";
import Header from "./Header";
import { Box, CircularProgress, Typography, Chip } from "@mui/material";

const RecommendationsGrid = ({ isDashboard = false }) => {
  const dispatch = useDispatch();

  const {
    low_performance_with_courses,
    performance_status,
    performance_error,
  } = useSelector((state) => state.API);

  const [rows, setRows] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    dispatch(performance_with_courses());
  }, [dispatch]);

  // Map API response to DataGrid row format
  useEffect(() => {
    if (performance_status === "succeeded") {
      let mappedRows = low_performance_with_courses.map((item) => ({
        id: item.RecommendationID,
        userName: item.UserName,
        courses: item.RecommendationText,
      }));

      if (isDashboard) {
        mappedRows = mappedRows.slice(0, 3); // show only first 5 rows on dashboard
      }

      setRows(mappedRows);
    }
  }, [low_performance_with_courses, performance_status, isDashboard]);

  // Define DataGrid columns based on dashboard or full view
  const columns = isDashboard
    ? [
        { field: "userName", headerName: "User Name", flex: 1, minWidth: 150 },
        {
          field: "courses",
          headerName: "Recommended Courses",
          flex: 2,
          minWidth: 250,
          renderCell: (params) => (
            <Typography variant="body2" noWrap title={params.value}>
              {params.value}
            </Typography>
          ),
        },
      ]
    : [
        { field: "id", headerName: "ID", width: 80 },
        { field: "userName", headerName: "User Name", width: 160 },
        { field: "role", headerName: "Role", width: 160 },
        { field: "kpiName", headerName: "KPI", width: 160 },
        { field: "actualValue", headerName: "Actual", width: 100 },
        { field: "targetValue", headerName: "Target", width: 100 },
        {
          field: "performancePercent",
          headerName: "Performance %",
          width: 140,
          renderCell: (params) => {
            const percent = parseFloat(params.value.replace("%", ""));
            let color = "default";
            if (percent < 50) color = "error";
            else if (percent < 70) color = "warning";
            else color = "success";
            return <Chip label={params.value} color={color} />;
          },
        },
        { field: "timestamp", headerName: "Timestamp", width: 200 },
        {
          field: "courses",
          headerName: "Recommended Courses",
          width: 320,
          renderCell: (params) => (
            <Typography variant="body2" noWrap title={params.value}>
              {params.value}
            </Typography>
          ),
        },
      ];

  return (
    <>
      {!isDashboard && (
        <Header
          title="Employee Performance & Course Recommendations"
          subtitle="Upskilling suggestions for underperforming employees based on their role"
        />
      )}

      {/* Loading state */}
      {performance_status === "loading" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 200,
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading recommendations...
          </Typography>
        </Box>
      )}

      {/* Error state */}
      {performance_status === "failed" && (
        <Box sx={{ textAlign: "center", color: "error.main", mt: 4 }}>
          <Typography variant="h6">Failed to load recommendations</Typography>
          <Typography>
            {performance_error || "Please check your server connection."}
          </Typography>
        </Box>
      )}

      {/* No data state */}
      {performance_status === "succeeded" && rows.length === 0 && (
        <Typography
          variant="h6"
          sx={{ textAlign: "center", mt: 4, color: "text.secondary" }}
        >
          No underperforming records found.
        </Typography>
      )}

      {/* Success state with data */}
      {performance_status === "succeeded" && rows.length > 0 && (
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={isDashboard ? 5 : 10}
          autoHeight
          disableSelectionOnClick
          hideFooter={isDashboard}
          sx={{
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: isDashboard ? "transparent" : "#f5f5f5",
            },
            "& .MuiDataGrid-cell": { borderColor: "#ddd" },
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        />
      )}
    </>
  );
};

export default RecommendationsGrid;
