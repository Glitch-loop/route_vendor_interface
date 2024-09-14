import { configureStore } from '@reduxjs/toolkit';
import userSlice from './slices/userSlice';
import routeDaySlice from './slices/routeDaySlice';
import productsInventorySlice from './slices/productsInventorySlice';
import dayOperationsSlice from './slices/dayOperationsSlice';
import storesSlice from './slices/storesSlice';
import currentOperationSlice from './slices/currentOperationSlice';

const store = configureStore({
  reducer: {
    user: userSlice,
    routeDay: routeDaySlice,
    productsInventory: productsInventorySlice,
    dayOperations: dayOperationsSlice,
    stores: storesSlice,
    currentOperation: currentOperationSlice,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
