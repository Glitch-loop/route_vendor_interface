import { configureStore } from '@reduxjs/toolkit';
import conuterSlice from './slices/conuterSlice';

const store = configureStore({
  reducer: {
    counter: conuterSlice,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
