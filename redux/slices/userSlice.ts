import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../../interfaces/interfaces';

const initialState: IUser = {
  id_vendor: '',
  cellphone: '',
  name: '',
  password: '',
  status: 0,
};


const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.id_vendor = action.payload.id_vendor;
      state.name      = action.payload.name;
      state.cellphone = action.payload.cellphone;
      state.password  = action.payload.password;
      state.status    = action.payload.status;
    },
  },
});


export const { setUser } = userSlice.actions;

export default userSlice.reducer;
