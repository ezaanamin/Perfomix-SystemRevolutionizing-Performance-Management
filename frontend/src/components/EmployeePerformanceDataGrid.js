import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Paper, Typography, Box } from "@mui/material";


const employeeData = [
  {
    id: 1,
    name: "John Doe",
    role: "Software Engineer",
    performance: {
      "Code Quality": 85.00, 
      "Code Efficiency": 15.00, 
      "Task Completion Rate": 75.00, 
    },
    recommendedCourses: ["Advanced Coding Standards", "Time Management for Engineers"],
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Project Manager",
    performance: {
      "Milestone Achievement Rate": 90.00, 
      "Budget Utilization": 3.00, 
      "Resource Allocation": 88.00, 
    },
    recommendedCourses: ["Project Management Best Practices", "Effective Resource Allocation"],
  },
  {
    id: 3,
    name: "Sam Lee",
    role: "Business Manager",
    performance: {
      "Revenue Growth": 8.00, 
      "Customer Satisfaction": 85.00, 
      "Operational Efficiency": 10.00, 
    },
    recommendedCourses: ["Customer Relationship Management", "Operational Efficiency Strategies"],
  },
];


const getThreshold = (kpiName) => {
  const thresholds = {
    "Code Quality": 90,
    "Code Efficiency": 20,
    "Task Completion Rate": 85,
    "Milestone Achievement Rate": 95,
    "Budget Utilization": 5,
    "Resource Allocation": 85,
    "Revenue Growth": 10,
    "Customer Satisfaction": 80,
    "Operational Efficiency": 15,
  };
  return thresholds[kpiName] || 0;
};


const isBelowAverage = (performance) => {
  return Object.keys(performance).some((key) => performance[key] < getThreshold(key));
};

const EmployeePerformanceDataGrid = () => {
  const columns = [
    { field: "name", headerName: "Employee", width: 200 },
    { field: "performance", headerName: "Performance", width: 150 },
    { field: "recommendedCourses", headerName: "Recommended Courses", width: 300 },
  ];

  const rows = employeeData.map((employee) => ({
    id: employee.id,
    name: employee.name,
    performance: isBelowAverage(employee.performance) ? "Below Average" : "Average",
    recommendedCourses: employee.recommendedCourses.join(", "), 
  }));

  return (
    <Box
      mt="10px"
      position="relative"
      width="100%" 
      height="22vh"
      sx={{
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        "& .MuiDataGrid-root": {
          border: "none",
          width: "100%", 
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "none",
        },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: "#D0DBE9", 
          color: "#2D3A56", 
          borderBottom: "none",
        },
        "& .MuiDataGrid-virtualScroller": {
          backgroundColor: "#F0F7FF", 
        },
        "& .MuiDataGrid-footerContainer": {
          backgroundColor: "#D0DBE9", 
          color: "#2D3A56", 
          borderTop: "none",
        },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
          color: "#4361EE", 
        },
      }}
    >
   
      <DataGrid
        rows={rows}
        columns={columns}
         rowsPerPageOptions={[3]}
        disableSelectionOnClick
  
        getCellClassName={(params) => {
          if (params.field === "performance") {
            return params.value === "Below Average" ? "below-average" : "average";
          }
          return "";
        }}
      />
    </Box>
  );
};

export default EmployeePerformanceDataGrid;
