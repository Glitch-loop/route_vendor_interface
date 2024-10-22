const PAYMENT_METHODS:any[] = [
  {
    id_payment_method: '52757755-1471-44c3-b6d5-07f7f83a0f6f',
    payment_method_name: 'Efectivo',
  },
  {
    id_payment_method: 'b68e6be3-8919-41dd-9d09-6527884e162e',
    payment_method_name: 'Transferencia',
  },
  // {
  //   id_payment_method: '0706f60e-69ae-462f-946e-450be1f914a6',
  //   payment_method_name: 'Tarjeta de credito',
  // },
  // {
  //   id_payment_method: '412ad9d7-b51a-4a25-9f10-ff61b4c8bd27',
  //   payment_method_name: 'Tarjeta de debito',
  // },
];

/*
  Note (10-21-24):
  Card payment methods are canceled because ther is not a clear process to include them.

  Although these methods are canceled, they are registered in the main database.
*/

export default PAYMENT_METHODS;
