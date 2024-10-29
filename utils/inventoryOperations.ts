import MXN_CURRENCY from '../lib/mxnCurrency';
import { IProductInventory, ICurrency } from '../interfaces/interfaces';

/*
  This function gets the amount of a particualar product in an array of type "IProductInventory"
  interface.

  This auxiliar function was specifically designed for both 'inventory operation' and 'inventory
  visualization' components
*/
export function findProductAmountInArray(arrProduct: IProductInventory[], current_id_product: string):number {
  let resultAmount = 0;
  if (arrProduct.length > 0) {
    let foundSuggestedProduct = arrProduct.find(suggestedProduct =>
      suggestedProduct.id_product === current_id_product);

      if (foundSuggestedProduct !== undefined) {
        resultAmount = foundSuggestedProduct.amount;
      } else {
        resultAmount = 0;
      }
  } else {
    resultAmount =  0;
  }

  return resultAmount;
}

// Related to currency
export function initialMXNCurrencyState():ICurrency[] {
  let arrDenomination:ICurrency[] = [];

  for (const key in MXN_CURRENCY) {
    arrDenomination.push({
      id_denomination: parseInt(key,32),
      value: MXN_CURRENCY[key].value,
      amount: 0,
      coin: MXN_CURRENCY[key].coin,
    });
  }
  return arrDenomination;
}

// Related to product inventory

