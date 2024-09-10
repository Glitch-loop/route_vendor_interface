import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDayGeneralInformation, IRoute, IDay } from '../../interfaces/interfaces';

const initialState: IRoute&IDayGeneralInformation&IDay = {
  /*Fields related to the general information.*/
  id_work_day: '',
  start_date: '',
  finish_date: '',
  startPettyCash: 0,
  finalPettyCash: 0,
  /*Fields related to IRoute interface*/
  id_route: '',
  route_name: '',
  description: '',
  route_status: '',
  id_vendor: '',
  /*Fields related to IDay interface*/
  id_day: '',
  day_name: '',
};

const routeSlice = createSlice({
  name: 'routeDay',
  initialState,
  reducers: {
    setRouteInformation: (state, action: PayloadAction<IRoute>) => {
      state.id_route = action.payload.id_route;
      state.route_name = action.payload.route_name;
      state.description = action.payload.description;
      state.route_status = action.payload.route_status;
      state.id_vendor = action.payload.id_vendor;
    },
    setDayGeneralInformation: (state, action: PayloadAction<IDayGeneralInformation>) => {
      state.id_work_day = action.payload.id_work_day;
      state.start_date = action.payload.start_date;
      state.finish_date = action.payload.finish_date;
      state.startPettyCash = action.payload.startPettyCash;
      state.finalPettyCash = action.payload.finalPettyCash;
    },
    setDayInformation: (state, action: PayloadAction<IDay>) => {
      state.id_day = action.payload.id_day;
      state.day_name = action.payload.day_name;
    },
  },
});


export const { setRouteInformation, setDayGeneralInformation, setDayInformation } = routeSlice.actions;

export default routeSlice.reducer;
