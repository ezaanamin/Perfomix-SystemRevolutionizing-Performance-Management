import { configureStore } from '@reduxjs/toolkit';
 import APIReducer from "./slice/API"


 export const store = configureStore({
    reducer: {
      API: APIReducer,
   
    },
  });