import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import routeDaySlice from './slices/routeDaySlice';
import productsInventorySlice from './slices/productsInventorySlice';
import currentOperationSlice from './slices/currentOperationSlice';
import dayOperationsSlice from './slices/dayOperationsSlice';

const store = configureStore({
  reducer: {
    user: userSlice,
    routeDay: routeDaySlice,
    productsInventory: productsInventorySlice,
    currentOperation: currentOperationSlice,
    dayOperations: dayOperationsSlice,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
