import moment from 'moment';

export function standard_format() {
  moment.locale('es');
  return moment().format('dddd, DD-MMM-YY');
}
