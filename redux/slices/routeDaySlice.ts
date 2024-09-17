import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDayGeneralInformation, IRoute, IRouteDay, IDay, ICompleteRouteDay } from '../../interfaces/interfaces';

const initialState: IRoute&IDayGeneralInformation&IDay&IRouteDay = {
  /*Fields related to the general information.*/
  id_work_day: '',
  start_date: '',
  finish_date: '',
  start_petty_cash: 0,
  final_petty_cash: 0,
  /*Fields related to IRoute interface*/
  id_route: '',
  route_name: '',
  description: '',
  route_status: '',
  id_vendor: '',
  /*Fields related to IDay interface*/
  id_day: '',
  day_name: '',
  order_to_show: 0,
  /*Fields relate to IRouteDay*/
  id_route_day: '',
};

const routeDaySlice = createSlice({
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
      state.start_petty_cash = action.payload.start_petty_cash;
      state.final_petty_cash = action.payload.final_petty_cash;
    },
    setDayInformation: (state, action: PayloadAction<IDay>) => {
      state.id_day = action.payload.id_day;
      state.day_name = action.payload.day_name;
      state.order_to_show = action.payload.order_to_show;
    },
    setStartDay: (state, action: PayloadAction<any>) => {
      state.start_date = action.payload.start_date;
      state.start_petty_cash = action.payload.start_petty_cash;
    },
    setEndDay: (state, action: PayloadAction<any>) => {
      state.finish_date = action.payload.finish_date;
      state.final_petty_cash = action.payload.final_petty_cash;
    },
    setRouteDay: (state, action: PayloadAction<ICompleteRouteDay>) => {
      state.id_route_day = action.payload.id_route_day;
    },
  },
});


export const {
  setRouteInformation,
  setDayGeneralInformation,
  setDayInformation,
  setStartDay,
  setEndDay,
  setRouteDay,
 } = routeDaySlice.actions;

export default routeDaySlice.reducer;
