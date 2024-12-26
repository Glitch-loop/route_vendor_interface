import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDayOperation } from '../../interfaces/interfaces';

const initialState: IDayOperation = {
  id_day_operation: '',
  id_item: '',
  id_type_operation: '',
  operation_order: 0,
  current_operation: 0,
};


const currentOperationSlice = createSlice({
  name: 'currentOperation',
  initialState,
  reducers: {
    setCurrentOperation: (state, action: PayloadAction<IDayOperation>) => {
      console.log("Set current operation: ", action)
      return {
        id_day_operation:   action.payload.id_day_operation,
        id_item:            action.payload.id_item,
        id_type_operation:  action.payload.id_type_operation,
        operation_order:    action.payload.operation_order,
        current_operation:  action.payload.current_operation,
      };
    },
    clearCurrentOperation: (state) => {
      return {
        id_day_operation :  '',
        id_item          :  '',
        id_type_operation:  '',
        operation_order  :  0,
        current_operation:  0,
      };
    },
  },
});

export const { setCurrentOperation, clearCurrentOperation} = currentOperationSlice.actions;

export default currentOperationSlice.reducer;

