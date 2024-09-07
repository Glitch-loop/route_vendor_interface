import { configureStore } from '@reduxjs/toolkit';
import conuterSlice from './slices/conuterSlice';
import userSlice from './slices/userSlice';

const store = configureStore({
  reducer: {
    counter: conuterSlice,
    user: userSlice,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
