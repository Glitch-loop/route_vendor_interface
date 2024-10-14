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
        This reducer is to store a set of day operations.
        This functions was designed to store the 'corner shops' that will be visited
        the current day.
      */
      action.payload.forEach(dayOperation => {
        state.push({
          id_day_operation: dayOperation.id_day_operation,
          id_item: dayOperation.id_item,
          id_type_operation: dayOperation.id_type_operation,
          operation_order: dayOperation.operation_order,
          current_operation: dayOperation.current_operation,
        });
      });
    },
    setDayOperation: (state, action: PayloadAction<IDayOperation>) => {
      /*
        This function is to store a new day operation with the consideration that
        the operation will be stored at the end of the list od the day operations.
      */
      try {
        state.push({
          id_day_operation: action.payload.id_day_operation,
          id_item: action.payload.id_item,
          id_type_operation: action.payload.id_type_operation,
          operation_order: action.payload.operation_order,
          current_operation: action.payload.current_operation,
        });
      } catch (error) {
        console.error(error);
      }
    },
    setDayOperationBeforeCurrentOpeation: (state, action: PayloadAction<IDayOperation>) => {
      /*
        Opposite to "setDayOperation" which push a new operation at the end of the list
        of day operations, this function push the new operation before the current
        operation.
      */
      try {
        const newDayOperation:IDayOperation = {
          id_day_operation: action.payload.id_day_operation,
          id_item: action.payload.id_item,
          id_type_operation: action.payload.id_type_operation,
          operation_order: action.payload.operation_order,
          current_operation: action.payload.current_operation,
        };

        const index = state.findIndex(operationDay =>
          operationDay.current_operation === 1);

        if (index === -1) {
          /*
            It means that something happened to the list, so the order was lost.
            In this case the new operation is stored at the end of the list.
          */
          state.push(newDayOperation);
        } else {
          /* All is in order */
          state.splice(index, 0, newDayOperation);
        }
      } catch (error) {
        console.error(error);
      }
    },
    setNextOperation: (state, action: PayloadAction<void>) => {
      /*
        In the workflow of the application, at the beginning of the day,
        it is made a list of operations "stores to visit" that will be made by the vendor during the day.

        So this function is to mark the current operation as a done and going ahead 
        with the next one.
      */
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
        console.error(error);
      }
    },
  },
});

export const {
  setArrayDayOperations,
  setDayOperation,
  setNextOperation,
  setDayOperationBeforeCurrentOpeation,
} = dayOperationsSlice.actions;

export default dayOperationsSlice.reducer;
