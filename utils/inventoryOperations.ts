import { IProductInventory } from '../interfaces/interfaces';

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
