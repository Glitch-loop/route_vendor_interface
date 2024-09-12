import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDayOperation } from '../../interfaces/interfaces';

/*
  The intention of this context is to store the
  operations that are made throughout the day.

  This context are useful for:
  - Store what corner stores are going to be visited
  along the day.
  - Store the inventory operations that are made
  throughout the day.
  - Store "special sales" (remember that an especial
  sale is a sale to a client {corner shop} that
  doesn't to the "route day")
*/

const initialState: IDayOperation[] = [];

const dayOperationsSlice = createSlice({
  name: 'dayOperations',
  initialState,
  reducers: {
    setArrayDayOperations: (state, action: PayloadAction<IDayOperation[]>) => {
      /*
        This reducer is to store a set of day operations, it was designed
        to store the stores to visit in a particular day.
      */
      action.payload.forEach(dayOperation => {
        state.push({
          id_day_operation: dayOperation.id_day_operation,
          id_item: dayOperation.id_item,
          id_type_operation: dayOperation.id_day_operation,
          operation_order: dayOperation.operation_order,
          current_operation: dayOperation.current_operation,
        });
      });
    },
    setDayOperation: (state, action: PayloadAction<IDayOperation>) => {
      /* This function to store a particular day operation */
      console.log("Adding operation")
      try {
        state.push({
          id_day_operation: action.payload.id_day_operation,
          id_item: action.payload.id_item,
          id_type_operation: action.payload.id_type_operation,
          operation_order: action.payload.operation_order,
          current_operation: action.payload.current_operation,
        });
        
      } catch (error) {
        console.log(error)
      }
    },
  },
});

export const {
  setArrayDayOperations,
  setDayOperation,
} = dayOperationsSlice.actions;

export default dayOperationsSlice.reducer;
