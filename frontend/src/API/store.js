import { configureStore } from '@reduxjs/toolkit';
import APISliceReducer from '../API/slice/API'; // Make sure the path is correct

export const store = configureStore({
  reducer: {
    // THIS IS THE FIX: Use APISliceReducer (which is APISlice.reducer)
    API: APISliceReducer, 
    // Add other reducers here if you have them, e.g.:
    // otherFeature: otherFeatureReducer,
  },
});
