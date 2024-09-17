
import { IProductInventory } from '../interfaces/interfaces';


// Auxiliar functuion
export function getProductDevolutionBalance(productDevolution:IProductInventory[], productReposition:IProductInventory[]):number {
  const totalProductDevolution = productDevolution.reduce((acc,item) =>
    {return acc + item.price * item.amount;}, 0);

  const totalProductReposition = productReposition.reduce((acc, item) =>
    {return acc + item.price * item.amount;}, 0);

  return totalProductDevolution - totalProductReposition;
}

export function getProductDevolutionBalanceWithoutNegativeNumber(productDevolution:IProductInventory[], productReposition:IProductInventory[]) {
  let total = getProductDevolutionBalance(productDevolution, productReposition);
  if (total < 0) {
    return total * -1;
  } else {
    return total;
  }
}

export function getMessageForProductDevolutionOperation(productDevolution:IProductInventory[], productReposition:IProductInventory[]) {
  let total = getProductDevolutionBalance(productDevolution, productReposition);
  if (total < 0) {
    return 'Balance de la devolución de producto (por cobrar): ';
  } else {
    return 'Balance de la devolución de producto (a pagar): ';
  }
};

export function getGreatTotal(
  productsDevolution:IProductInventory[],
  productsReposition:IProductInventory[],
  salesProduct:IProductInventory[],
):number {
  let subtotalProductDevolution = getProductDevolutionBalance(productsDevolution,[]);
  let subtotalProductReposition = getProductDevolutionBalance(productsReposition,[]);
  let subtotalSaleProduct = getProductDevolutionBalance(salesProduct,[]);
  let greatTotal = 0;


  if (subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution < 0) {
    greatTotal = ((subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution) * -1);
  } else {
    greatTotal = subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution;
  }

  return greatTotal;
};