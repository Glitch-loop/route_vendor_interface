import moment from 'moment';

export function standard_format() {
  moment.locale('es');
  console.log(moment().format('dddd, DD-MMM-YY'));
  return moment().format('dddd, DD-MMM-YY');
}
