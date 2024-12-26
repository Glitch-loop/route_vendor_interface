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
export function calculateNewInventoryAfterAnInventoryOperation(
  currentInventory: IProductInventory[],
  inventoryMovements: IProductInventory[],
  isInventoryMovementCancelation: boolean,
) {
  const newInventory:IProductInventory[] = [];

  currentInventory.forEach((currentInventoryUpdate) => {
    const productFound:undefined|IProductInventory = inventoryMovements
      .find(productInventory => productInventory.id_product === currentInventoryUpdate.id_product);
      if (productFound !== undefined) {
        let newAmount = currentInventoryUpdate.amount;

        if(isInventoryMovementCancelation) {
          newAmount -= productFound.amount;
        } else {
          newAmount += productFound.amount;
        }

        newInventory.push({
          ...productFound,
          amount: newAmount,
        });
      }
  });

  return newInventory;
}

export function mergeInventories(baseInventory:IProductInventory[], targetInventory:IProductInventory[]):IProductInventory[] {
  const newInventoryOperation = baseInventory.map((proudct:IProductInventory) => {
    let amountForInventory:number = 0;

    const productOfOperation:IProductInventory|undefined = targetInventory
    .find((productOperation:IProductInventory) => {
      return productOperation.id_product === proudct.id_product;
    });

    if(productOfOperation === undefined) {
      amountForInventory = 0;
    } else {
      amountForInventory = productOfOperation.amount;
    }

    return {
      ...proudct,
      amount: amountForInventory,
    };
  });

  return newInventoryOperation;
}
