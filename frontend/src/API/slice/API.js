import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  console.log(token,'redux')
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

// --- Thunks ---
export const fetchActiveKpisByRole = createAsyncThunk(
  'kpi/fetchActiveByRole',
  async (role, { rejectWithValue }) => {
    try {
      // Send role exactly as received, without lowercasing or removing spaces
      const response = await axios.get(
        `${API_BASE_URL}/active-kpis/${encodeURIComponent(role)}`,  // encode URI component for safety
        getAuthHeaders()
      );
      return { role, data: response.data };
    } catch (error) {
      console.error('fetchActiveKpisByRole error:', error.response || error.message);
      return rejectWithValue(
        error?.response?.data || error.message || 'Unknown error fetching active KPIs by role'
      );
    }
  }
);


export const Login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, data);
    if (response.data.error === 'User Exist') {
      return rejectWithValue({ error: 'User Exist' });
    }
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data || 'Unknown error during login');
  }
});

export const KPI = createAsyncThunk('kpi/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/kpi`, getAuthHeaders());
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data || 'Unknown error fetching KPIs');
  }
});

export const ADDKPI = createAsyncThunk('kpi/add', async (kpiData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/new_kpi`, kpiData, getAuthHeaders());
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data || 'Unknown error adding KPI');
  }
});
// API slice file (e.g., API.js or slice/API.js)


export const fetchUsers = createAsyncThunk('API/get_users', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_users`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data || 'Unknown error fetching users');
  }
});
export const Performance_Data = createAsyncThunk('API/performance_Data', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get/performance_data`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data || 'Unknown error fetching users');
  }
});


export const editKpi = createAsyncThunk('kpi/editKpi', async (kpiData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/edit_kpi/${kpiData.kpi_id}`, kpiData, getAuthHeaders());
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data || 'Unknown error updating KPI');
  }
});

export const Bot_Detection = createAsyncThunk('kpi/Bot_Detection', async (detectionData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bot_detection`, detectionData, getAuthHeaders());
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data || 'Unknown error during bot detection');
  }
});

export const performance_with_courses = createAsyncThunk(
  'kpi/performance_with_courses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get/low_performance_with_courses`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || 'Unknown error while fetching recommendations');
    }
  }
);


const createKpiDetectionThunk = (role) =>
  createAsyncThunk(`kpi/detect_${role}`, async (userId, thunkAPI) => {
    try {
      // POST request to backend endpoint per role
      const response = await axios.post(
        `${API_BASE_URL}/detect_kpi/${role}/${userId}`,
        {}, // POST body empty
        getAuthHeaders()
      );
      // Expect response.data.detected_kpis = { KPIName: value, ... }
      return response.data.detected_kpis;
    } catch (error) {
      // Return error message to rejected action
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  });

  export const fetchPerformanceInsights = createAsyncThunk(
  'kpi/fetchPerformanceInsights',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get/performance_insights`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || 'Unknown error fetching insights');
    }
  }
);

  
export const detectSoftwareEngineerKPIs = createKpiDetectionThunk('software_engineer');
export const detectProjectManagerKPIs = createKpiDetectionThunk('project_manager');
export const detectBusinessManagerKPIs = createKpiDetectionThunk('business_manager');
export const detectTestingTeamKPIs = createKpiDetectionThunk('testing_team');


export const fetchUserKpiHistory = createAsyncThunk('kpi/fetchUserKpiHistory', async (userId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/kpi_data?user_id=${userId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data || `Error fetching KPI history for user ${userId}`);
  }
});

export const updateSettings = createAsyncThunk(
  'API/updateSettings',
  async (settingsData, { rejectWithValue }) => {
    console.log('Sending settingsData:', settingsData);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/update_settings`,
        settingsData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('updateSettings error:', error.response || error.message);
      return rejectWithValue(
        error?.response?.data?.error || error.message || 'Unknown error updating settings'
      );
    }
  }
);

// --- Initial State ---

const initialState = {
  loginData: null,
  kpiData: [],
  usersData: [],
  performance_data:[],
  low_performance_with_courses:[],
  performance_status: 'idle',
  activeKpisByRole: {},   // store KPIs keyed by role, e.g. { "admin": [...], "user": [...] }
  loginStatus: 'idle',
  kpiStatus: 'idle',
  userStatus: 'idle',
  loginError: null,
  kpiError: null,
  userError: null,
  editKpiStatus: 'idle',
  editKpiError: null,
  latestBotDetection: null,
  settingsData: null,
settingsStatus: 'idle',
settingsError: null,
  detectedKpisResults: {
    software_engineer: null,
    project_manager: null,

    business_manager: null,
    testing_team: null,
  },
  detectedKpisStatus: {
    software_engineer: 'idle',
    project_manager: 'idle',
    business_manager: 'idle',
    testing_team: 'idle',
  },
  detectedKpisError: {
    software_engineer: null,
    project_manager: null,
    business_manager: null,
    testing_team: null,
  },
  userKpiHistory: [],
  userKpiHistoryStatus: 'idle',
  userKpiHistoryError: null,
    insightsData: null,
  insightsStatus: 'idle',
  insightsError: null,
};

// --- Slice ---

const APISlice = createSlice({
  name: 'API',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login
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

      // KPI Fetch
      .addCase(KPI.pending, (state) => {
        state.kpiStatus = 'loading';
      })
      .addCase(KPI.fulfilled, (state, action) => {
        state.kpiStatus = 'succeeded';
        state.kpiData = action.payload;
      })
      .addCase(KPI.rejected, (state, action) => {
        state.kpiStatus = 'failed';
        state.kpiError = action.payload;
      })

      // Users Fetch
      .addCase(fetchUsers.pending, (state) => {
        state.userStatus = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.userStatus = 'succeeded';
        // state.performance_data = action.payload;
          state.usersData = action.payload;

      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.userStatus = 'failed';
        state.userError = action.payload;
      })
    .addCase(Performance_Data.pending, (state) => {
        state.performance_status = 'loading';
      })
      .addCase(Performance_Data.fulfilled, (state, action) => {
        state.performance_status = 'succeeded';
                state.performance_data = action.payload;

      })
      .addCase(Performance_Data.rejected, (state, action) => {
        state.performance_status = 'failed';
        state.performance_status = action.payload;
      })
         .addCase(performance_with_courses.pending, (state) => {
        state.performance_status = 'loading';
      })
      .addCase(performance_with_courses.fulfilled, (state, action) => {
        state.performance_status = 'succeeded';
                state.low_performance_with_courses = action.payload;

      })
      .addCase(performance_with_courses.rejected, (state, action) => {
        state.performance_status = 'failed';
        state.performance_status = action.payload;
      })
      // Edit KPI
      .addCase(editKpi.pending, (state) => {
        state.editKpiStatus = 'loading';
      })
      .addCase(editKpi.fulfilled, (state, action) => {
        state.editKpiStatus = 'succeeded';
        state.kpiData = state.kpiData.map((kpi) =>
          kpi.id === action.payload?.data?.id ? { ...kpi, ...action.payload.data } : kpi
        );
      })
      .addCase(editKpi.rejected, (state, action) => {
        state.editKpiStatus = 'failed';
        state.editKpiError = action.payload;
      })

      // Bot Detection
      .addCase(Bot_Detection.pending, (state) => {
        state.editKpiStatus = 'loading';
      })
      .addCase(Bot_Detection.fulfilled, (state, action) => {
        state.editKpiStatus = 'succeeded';
        state.latestBotDetection = action.payload;
      })
      .addCase(Bot_Detection.rejected, (state, action) => {
        state.editKpiStatus = 'failed';
        state.editKpiError = action.payload;
      })

      // User KPI History
      .addCase(fetchUserKpiHistory.pending, (state) => {
        state.userKpiHistoryStatus = 'loading';
        state.userKpiHistory = [];
      })
      .addCase(fetchUserKpiHistory.fulfilled, (state, action) => {
        state.userKpiHistoryStatus = 'succeeded';
        state.userKpiHistory = action.payload;
      })
      .addCase(fetchUserKpiHistory.rejected, (state, action) => {
        state.userKpiHistoryStatus = 'failed';
        state.userKpiHistoryError = action.payload;
      })

      // Software Engineer KPI Detection
   builder
  // Software Engineer KPI Detection
  .addCase(detectSoftwareEngineerKPIs.pending, (state) => {
    state.detectedKpisStatus.software_engineer = 'loading';
    state.detectedKpisError.software_engineer = null;
  })
  .addCase(detectSoftwareEngineerKPIs.fulfilled, (state, action) => {
    state.detectedKpisStatus.software_engineer = 'succeeded';
    state.detectedKpisResults.software_engineer = action.payload;
    state.detectedKpisError.software_engineer = null;
  })
  .addCase(detectSoftwareEngineerKPIs.rejected, (state, action) => {
    state.detectedKpisStatus.software_engineer = 'failed';
    state.detectedKpisError.software_engineer =
      action.payload?.error || action.error?.message || 'Failed to fetch software engineer KPIs';
  })

  // Project Manager KPI Detection
  .addCase(detectProjectManagerKPIs.pending, (state) => {
    state.detectedKpisStatus.project_manager = 'loading';
    state.detectedKpisError.project_manager = null;
  })
  .addCase(detectProjectManagerKPIs.fulfilled, (state, action) => {
    state.detectedKpisStatus.project_manager = 'succeeded';
    state.detectedKpisResults.project_manager = action.payload;
    state.detectedKpisError.project_manager = null;
  })
  .addCase(detectProjectManagerKPIs.rejected, (state, action) => {
    state.detectedKpisStatus.project_manager = 'failed';
    state.detectedKpisError.project_manager =
      action.payload?.error || action.error?.message || 'Failed to fetch project manager KPIs';
  })

  // Business Manager KPI Detection
  .addCase(detectBusinessManagerKPIs.pending, (state) => {
    state.detectedKpisStatus.business_manager = 'loading';
    state.detectedKpisError.business_manager = null;
  })
  .addCase(detectBusinessManagerKPIs.fulfilled, (state, action) => {
    state.detectedKpisStatus.business_manager = 'succeeded';
    state.detectedKpisResults.business_manager = action.payload;
    state.detectedKpisError.business_manager = null;
  })
  .addCase(detectBusinessManagerKPIs.rejected, (state, action) => {
    state.detectedKpisStatus.business_manager = 'failed';
    state.detectedKpisError.business_manager =
      action.payload?.error || action.error?.message || 'Failed to fetch business manager KPIs';
  })

  // Testing Team KPI Detection
  .addCase(detectTestingTeamKPIs.pending, (state) => {
    state.detectedKpisStatus.testing_team = 'loading';
    state.detectedKpisError.testing_team = null;
  })
  .addCase(detectTestingTeamKPIs.fulfilled, (state, action) => {
    state.detectedKpisStatus.testing_team = 'succeeded';
    state.detectedKpisResults.testing_team = action.payload;
    state.detectedKpisError.testing_team = null;
  })
  .addCase(detectTestingTeamKPIs.rejected, (state, action) => {
    state.detectedKpisStatus.testing_team = 'failed';
    state.detectedKpisError.testing_team =
      action.payload?.error || action.error?.message || 'Failed to fetch testing team KPIs';
  })
         builder
      .addCase(fetchActiveKpisByRole.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchActiveKpisByRole.fulfilled, (state, action) => {
  state.fetchStatus = 'succeeded';
  state.activeKpisByRole[action.meta.arg] = {
    role: action.payload.role,
    kpis: action.payload.data,
  };
})
      .addCase(fetchActiveKpisByRole.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.fetchError = action.payload || action.error.message;
      })
        builder

    .addCase(fetchPerformanceInsights.pending, (state) => {
      state.insightsStatus = 'loading';
      state.insightsError = null;
    })
    .addCase(fetchPerformanceInsights.fulfilled, (state, action) => {
      state.insightsStatus = 'succeeded';
      state.insightsData = action.payload;
    })
    .addCase(fetchPerformanceInsights.rejected, (state, action) => {
      state.insightsStatus = 'failed';
      state.insightsError = action.payload;
    })
    .addCase(updateSettings.pending, (state) => {
  state.settingsStatus = 'loading';
})
.addCase(updateSettings.fulfilled, (state, action) => {
  state.settingsStatus = 'succeeded';
  state.settingsData = action.payload;
  state.settingsError = null;
})
.addCase(updateSettings.rejected, (state, action) => {
  state.settingsStatus = 'failed';
  state.settingsError = action.payload;
})

  },
});
export default APISlice.reducer;
