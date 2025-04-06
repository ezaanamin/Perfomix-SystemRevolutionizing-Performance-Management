import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const Login = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', data);

      if (response.data.error === 'User Exist') {
        return rejectWithValue({ error: 'User Exist' });
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Unknown error");
    }
  }
);

export const KPI = createAsyncThunk(
  'kpi/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get('http://127.0.0.1:5000/kpi', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Unknown error");
    }
  }
);

export const ADDKPI = createAsyncThunk(
  'kpi/add',
  async (kpiData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post('http://127.0.0.1:5000/new_kpi', kpiData, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || "Unknown error");
    }
  }
);
export const User = createAsyncThunk(
  'get_users',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.get('http://127.0.0.1:5000/get_users', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched Users:", response.data); // Log the data to check its structure
      return response.data; // This should match what your reducer expects
    } catch (error) {
      console.error("API Error:", error); // Log any errors
      return rejectWithValue(error?.response?.data || "Unknown error");
    }
  }
);


// 🟢 CREATE SLICE
export const APISlice = createSlice({
  name: 'API',
  initialState: { 
    loginData: null, 
    kpiData: [], 
    usersData: [], // Add usersData to store the list of users
    loginStatus: 'idle',
    kpiStatus: 'idle',
    userStatus: 'idle', // Add userStatus to track user fetching state
    loginError: null, 
    kpiError: null,
    userError: null, // Add userError to store errors related to users
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔹 LOGIN API REDUCERS
      .addCase(Login.pending, (state) => {
        state.loginStatus = 'loading';
      })
      .addCase(Login.fulfilled, (state, action) => {
        state.loginStatus = 'succeeded';
        state.loginData = action.payload;
        state.loginError = null;
      })
      .addCase(Login.rejected, (state, action) => {
        state.loginStatus = 'failed';
        state.loginError = action.payload;
      })

      // 🔹 KPI API REDUCERS
      .addCase(KPI.pending, (state) => {
        state.kpiStatus = 'loading';
      })
      .addCase(KPI.fulfilled, (state, action) => {
        state.kpiStatus = 'succeeded';
        state.kpiData = action.payload;
        state.kpiError = null;
      })
      .addCase(KPI.rejected, (state, action) => {
        state.kpiStatus = 'failed';
        state.kpiError = action.payload;
      })

      // 🔹 USER API REDUCERS
      .addCase(User.pending, (state) => {
        state.userStatus = 'loading';
      })
      .addCase(User.fulfilled, (state, action) => {
        state.userStatus = 'succeeded';
        state.userData = action.payload;
        state.userError = null;
      })
      .addCase(User.rejected, (state, action) => {
        state.userStatus = 'failed';
        state.userError = action.payload;
      });
  },
});

export default APISlice.reducer;
