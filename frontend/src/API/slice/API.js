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

export const fetchActiveKpisByRole = createAsyncThunk(
  'kpi/fetchActiveByRole',
  async (role, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/active-kpis/${encodeURIComponent(role)}`,  
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
  console.log(response.data,'performance_ezaan')
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
      const response = await axios.post(
        `${API_BASE_URL}/detect_kpi/${role}/${userId}`,
        {}, 
        getAuthHeaders()
      );
      return response.data.detected_kpis;
    } catch (error) {
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

export const latest_performance = createAsyncThunk(
  'API/latest_performance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get/latest_performance`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('latest_performance error:', error.response || error.message);
      return rejectWithValue(
        error?.response?.data?.error || error.message || 'Unknown error fetching latest performance'
      );
    }
  }
);


export const performance_report = createAsyncThunk(
  'api/performance_report',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/performance_report?download=1`, {
        ...getAuthHeaders(),
        responseType: 'blob', 
      });

      return response.data;
    } catch (error) {
      console.error('performance_report error:', error.response || error.message);
      return rejectWithValue(
        error?.response?.data?.error || error.message || 'Unknown error downloading report'
      );
    }
  }
);

export const fetchUserPerformanceRating = createAsyncThunk(
  'performance/fetchUserPerformanceRating',
  async (username, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user_performance_rating`, {
        params: { username },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      return response.data; 
    } catch (error) {
      console.error('fetchUserPerformanceRating error:', error.response || error.message);
      return rejectWithValue(
        error?.response?.data?.error || error.message || 'Failed to fetch user performance rating'
      );
    }
  }
);

export const fetchAdminDashboardData = createAsyncThunk(
  'dashboard/fetchAdminDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin_dashboard_data`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('fetchAdminDashboardData error:', error.response || error.message);
      return rejectWithValue(
        error?.response?.data?.error || error.message || 'Failed to fetch admin dashboard data'
      );
    }
  }
);

export const fetchGitHubUsers = createAsyncThunk(
  "API/fetchUsersWithGitHubActivity",
  async (_, { rejectWithValue }) => {
    try {
      // 1. Fetch users from your backend with auth header
      const usersResponse = await axios.get(`${API_BASE_URL}/get_users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      const users = usersResponse.data;
      console.log("Users from DB:", users);

      // 2. Fetch GitHub issues (no auth needed here)
      const issuesResponse = await axios.get(
        "https://api.github.com/repos/facebook/react/issues?per_page=30"
      );
      const issues = issuesResponse.data.filter(issue => !issue.pull_request);
      console.log("Filtered GitHub issues:", issues);

      // 3. Map GitHub issues to your users by index (loop users if fewer than issues)
      const enriched = issues.map((issue, idx) => {
        const user = users[idx % users.length];
        const created = new Date(issue.created_at);

        return {
          id: user.user_id,        // from your DB
          login: user.name,        // from your DB
          avatar_url: issue.user.avatar_url,
          html_url: issue.user.html_url || `https://github.com/${issue.user.login}`,
          email: user.email,
          role: user.role,
          team_name: user.team_name,
          manager_id: user.manager_id,
          activity: {
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

      return enriched;
    } catch (error) {
      console.error("fetchUsersWithGitHubActivity error:", error.response || error.message);
      return rejectWithValue(
        error?.response?.data?.error || error.message || "Failed to fetch users with GitHub activity"
      );
    }
  }
);


const initialState = {
  loginData: null,
  userPerformance: null,
  latest_performance:[],
  kpiData: [],
  usersData: [],
  performance_data:[],
    performance_report:[],
  low_performance_with_courses:[],
  performance_status: 'idle',
  activeKpisByRole: {}, 
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
  adminDashboardData: null,
adminDashboardStatus: 'idle',
adminDashboardError: null,
 githubUsers: [],
  githubUserStatus: 'idle',
  githubUserError: null,

};



const APISlice = createSlice({
  name: 'API',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

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

   
      .addCase(fetchUsers.pending, (state) => {
        state.userStatus = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.userStatus = 'succeeded';
          state.usersData = action.payload;

      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.userStatus = 'failed';
        state.userError = action.payload;
      })
  builder
    .addCase(Performance_Data.pending, (state) => {
      state.performance_status = 'loading';
    })
    .addCase(Performance_Data.fulfilled, (state, action) => {
      state.performance_status = 'succeeded';
      state.performance_data = action.payload;
    })
    .addCase(Performance_Data.rejected, (state, action) => {
      state.performance_status = 'failed';
      state.performance_error = action.payload;
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

  
   builder

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
   builder
      .addCase(latest_performance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(latest_performance.fulfilled, (state, action) => {
        state.loading = false;
        state.latest_performance = action.payload;
      })
      .addCase(latest_performance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch latest performance';
      })
        builder
      .addCase(performance_report.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performance_report.fulfilled, (state, action) => {
        state.loading = false;
        state.performance_report = action.payload;
      })
      .addCase(performance_report.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch latest performance';
      })
        .addCase(fetchUserPerformanceRating.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.userPerformance = null;
      })
      .addCase(fetchUserPerformanceRating.fulfilled, (state, action) => {
        state.loading = false;
        state.userPerformance = action.payload;
      })
      .addCase(fetchUserPerformanceRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch data';
      })
      builder
  .addCase(fetchAdminDashboardData.pending, (state) => {
    state.adminDashboardStatus = 'loading';
    state.adminDashboardError = null;
  })
  .addCase(fetchAdminDashboardData.fulfilled, (state, action) => {
    state.adminDashboardStatus = 'succeeded';
    state.adminDashboardData = action.payload;
  })
  .addCase(fetchAdminDashboardData.rejected, (state, action) => {
    state.adminDashboardStatus = 'failed';
    state.adminDashboardError = action.payload || 'Failed to fetch admin dashboard data';
  })
    .addCase(fetchGitHubUsers.pending, (state) => {
    state.githubUserStatus = 'loading';
  })
  .addCase(fetchGitHubUsers.fulfilled, (state, action) => {
    state.githubUserStatus = 'succeeded';
    state.githubUsers = action.payload;
  })
  .addCase(fetchGitHubUsers.rejected, (state, action) => {
    state.githubUserStatus = 'failed';
    state.githubUserError = action.payload;
  });



  },
})



export default APISlice.reducer;
