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
      action.payload.map(productInventory => {
        state.push({
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
        });
      });
    },
  },
});

export const { setProductInventory } = productsInventorySlice.actions;

export default productsInventorySlice.reducer;
