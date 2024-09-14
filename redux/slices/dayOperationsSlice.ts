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
    setNextOperation: (state, action: PayloadAction<void>) => {
      try {
        const index = state.findIndex(operationDay =>
                        operationDay.current_operation === 1);

        if (index === -1) {
          /* Do nothing */
        } else {
          if (state.length - 1 === index) {
            /*
              The current operation is the last one of the day
            */
          } else {
            // Switching to the next operation.
            /*
              The current opeartion is not the current one any more.
            */
            state[index] = {
              ...state[index],
              current_operation: 0,
            };
            /*
              Setting the new curret operation
            */
            state[index + 1] = {
              ...state[index + 1],
              current_operation: 1,
            };
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
});

export const {
  setArrayDayOperations,
  setDayOperation,
  setNextOperation,
} = dayOperationsSlice.actions;

export default dayOperationsSlice.reducer;
