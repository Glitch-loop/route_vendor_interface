import { configureStore } from '@reduxjs/toolkit';
import conuterSlice from './slices/conuterSlice';
import userSlice from './slices/userSlice';
import routeSlice from './slices/routeSlice';

const store = configureStore({
  reducer: {
    counter: conuterSlice,
    user: userSlice,
    route: routeSlice,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
