import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../interfaces/interfaces';

const initialState: IUser = {
  id_vendor: 0,
  number: '',
  name: '',
  password: '',
  status: 0,
};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state = action.payload;
    },
  },
});


export const { setUser } = userSlice.actions;

export default userSlice.reducer;