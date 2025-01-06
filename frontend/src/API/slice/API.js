import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
export const SignUpPost = createAsyncThunk(
  'post/postRequest',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:4000/users/', data);

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
      .addCase(SignUpPost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(SignUpPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(SignUpPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

  },

})




// This is only a template on how to handle API calls in the future - Ezaan Amin


export default APISlice.reducer;