import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IRouteDay } from '../../interfaces/interfaces';

const initialState: IRouteDay = {
  id_route_number: '',
  position_in_route: 0,
  id_route: '',
  id_day: '',
};

const routeSlice = createSlice({
  name: 'routeDay',
  initialState,
  reducers: {
    setRouteDay: (state, action: PayloadAction<IRouteDay>) => {
      state.id_route_number = action.payload.id_route;
      state.position_in_route = action.payload.position_in_route;
      state.id_route = action.payload.id_route;
      state.id_day = action.payload.id_day;
    },
  },
});


export const { setRouteDay } = routeSlice.actions;

export default routeSlice.reducer;
