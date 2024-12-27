import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProductInventory } from '../../interfaces/interfaces';


/*
  Comment about the state

  This state stores the current inventory.
*/

const initialState: IProductInventory[] = [];

const productsInventorySlice = createSlice({
  name: 'productsInventory',
  initialState,
  reducers: {
    setProductInventory: (state, action: PayloadAction<IProductInventory[]>) => {
      return action.payload.map(productInventory => ({
          id_product: productInventory.id_product,
          product_name: productInventory.product_name,
          barcode: productInventory.barcode,
          weight: productInventory.weight,
          unit: productInventory.unit,
          comission: productInventory.comission,
          price: productInventory.price,
          product_status: productInventory.product_status,
          amount: productInventory.amount,
          order_to_show: productInventory.order_to_show,
        }));
    },
    addProductsInventory: (state, action: PayloadAction<IProductInventory[]>) => {
      for (let i = 0; i < state.length; i++) {
        const foundProduct:undefined|IProductInventory = action.payload
          .find((product) => {return product.id_product === state[i].id_product;});

        if(foundProduct === undefined) {
          /* Do nothing*/
        } else {
          state[i] = {
            ...foundProduct,
            amount: state[i].amount + foundProduct.amount,
           };
        }
      }
    },
    updateProductsInventory: (state, action: PayloadAction<IProductInventory[]>) => {
      for (let i = 0; i < state.length; i++) {
        const foundProduct:undefined|IProductInventory = action.payload
          .find((product) => {return product.id_product === state[i].id_product;});

        if(foundProduct === undefined) {
          /* Do nothing*/
        } else {
          state[i] = {
            ...foundProduct,
           };
        }
      }
    },
    cleanProductsInventory: (state, action: PayloadAction<void>) => {
      return [

      ];
    },
  },
});

export const {
  setProductInventory,
  addProductsInventory,
  updateProductsInventory,
  cleanProductsInventory,
} = productsInventorySlice.actions;

export default productsInventorySlice.reducer;
