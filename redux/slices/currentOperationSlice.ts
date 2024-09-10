import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDayOperation } from '../../interfaces/interfaces';

/*
  This state stores the current operation that is being done
  by the user (vendor).

  At least at the moment it is directed to store actions 
  related to inventory operations.
*/


const initialState: IDayOperation = {
  id_day_operation: '',
  id_item: '',
  id_type_operation: 0,
  operation_order: 0,
  current_opreation: 0,
};


const currentOperationSlice = createSlice({
  name: 'currentOperation',
  initialState,
  reducers: {
    setDayOperation: (state, action: PayloadAction<IDayOperation>) => {
      state.id_day_operation = action.payload.id_day_operation;
      state.id_item = action.payload.id_item;
      state.id_type_operation = action.payload.id_type_operation;
      state.operation_order = action.payload.operation_order;
      state.current_opreation = action.payload.current_opreation;
    },
    clearDayOperation: (state) => {
      state.id_day_operation = '';
      state.id_item = '';
      state.id_type_operation = 0;
      state.operation_order = 0;
      state.current_opreation = 0;
    }
  },
});

export const { setDayOperation, clearDayOperation } = currentOperationSlice.actions;
export default currentOperationSlice.reducer;
