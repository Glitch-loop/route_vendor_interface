import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import routeSlice from './slices/routeSlice';
import routeDaySlice from './slices/routeDaySlice';
import productsInventorySlice from './slices/productsInventorySlice';
import pettyCashSlice from './slices/pettyCashSlice';

const store = configureStore({
  reducer: {
    user: userSlice,
    route: routeSlice,
    routeDay: routeDaySlice,
    productsInventory: productsInventorySlice,
    pettyCash: pettyCashSlice,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
