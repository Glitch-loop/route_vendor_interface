import moment from 'moment';

export function standard_format() {
  moment.locale('es');
  return moment().format('dddd, DD-MMM-YY');
}

export function timestamp_format() {
  moment.locale('es');
  return moment().format('YYYY-MM-DD HH:mm:ss');
}
