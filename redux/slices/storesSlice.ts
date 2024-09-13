import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IStore, IStoreStatusDay } from '../../interfaces/interfaces';

/*
  The purpose of this context is to store the information of all the routes that are going to be
  visited during the day.
*/

const initialState: (IStore&IStoreStatusDay )[] = [];

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    setStores: (state, action: PayloadAction<IStore[]>) => {
      action.payload.forEach(store => {
        let index = state.findIndex(storedStore =>
          storedStore.id_store === store.id_store);

        if(index === -1) {
          console.log("new stores")
          // Save store
          state.push({
            // Related to information of the stores
            id_store: store.id_store,
            street: store.street,
            ext_number: store.ext_number,
            colony: store.colony,
            postal_code: store.postal_code,
            address_reference: store.address_reference,
            store_name: store.store_name,
            owner_name: store.owner_name,
            cellphone: store.cellphone,
            latitude: store.latitude,
            longuitude: store.longuitude,
            id_creator: store.id_creator,
            creation_date: store.creation_date,
            creation_context: store.creation_context,
            status_store: store.status_store,

            /*
            Related to the information of the stores in the context of the route.
            This configuration indicates that the store is one of the route itself.
            */
            new_client: false,
            special_sale: false,
            visited: false,
            petition_to_visit: false,
          });
        } else {
          // The store already exists. Update the information.
          console.log("update store")
          state[index] = {
            ...store,
            new_client: false,
            special_sale: false,
            visited: false,
            petition_to_visit: false,
          };
        }
      });
    },
  },
});


export const { setStores } = storesSlice.actions;

export default storesSlice.reducer;
