import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPettyCash } from '../../interfaces/interfaces';


const initialState: IPettyCash = {
  startPettyCash: 0,
  finalPettyCash: 0,
};

const pettyCashSlice = createSlice({
  name: 'pettyCash',
  initialState,
  reducers: {
    setStartPettyCash: (state, action: PayloadAction<number>) => {
      state.startPettyCash = action.payload;
    },
    setFinalPettyCash: (state, action: PayloadAction<number>) => {
      state.startPettyCash = action.payload;
    },
  },
});

export const { setStartPettyCash, setFinalPettyCash } = pettyCashSlice.actions;

export default pettyCashSlice.reducer;
