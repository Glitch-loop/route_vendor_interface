import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IRoute } from '../../interfaces/interfaces';

const initialState: IRoute = {
  id_route: 0,
  route_name: '',
  description: '',
  route_status: '',
  id_vendor: 0,
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    setRoute: (state, action: PayloadAction<IRoute>) => {
      // state = action.payload;
      state.id_route = action.payload.id_route;
      state.route_name = action.payload.route_name;
      state.description = action.payload.description;
      state.route_status = action.payload.route_status;
      state.id_vendor = action.payload.id_vendor;
    },
  },
});


export const { setRoute } = routeSlice.actions;

export default routeSlice.reducer;
