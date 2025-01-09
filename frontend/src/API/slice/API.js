import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
export const Login = createAsyncThunk(
  'post/postRequest',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', data);

      if (response.data.error === 'User Exist') {
        return rejectWithValue({ error: 'User Exist' });
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);





export const APISlice = createSlice({
  name: 'API',
  initialState: { data: [], error: null, status: 'idle',verfiedStatus:null},
  reducers: {},
  extraReducers: (builder) => {
  
      builder
      .addCase(Login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(Login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(Login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

  },

})




// This is only a template on how to handle API calls in the future - Ezaan Amin


export default APISlice.reducer;