import moment from 'moment';
import 'moment/locale/es';

export function timesamp_standard_format() {
  moment.locale('es');
  return moment().format('dddd, DD-MMM-YY');
}

export function timestamp_format() {
  moment.locale('es');
  return moment().format('YYYY-MM-DD HH:mm:ss');
}

export function current_day_name() {
  moment.locale('es-mx');
  return moment().format('dddd');
}
