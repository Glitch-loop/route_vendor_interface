// Libraries
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import tw from 'twrnc';
import 'react-native-get-random-values'; // Necessary for uuid
import {v4 as uuidv4 } from 'uuid';
import Toast from 'react-native-toast-message';

// Redux context.
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { setCurrentOperation, setNextOperation } from '../redux/slices/dayOperationsSlice';

// Interfaces and enums
import {
  IDayOperation,
  IPaymentMethod,
  IProductInventory,
  IResponse,
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription,
  IStore,
  IStoreStatusDay,
} from '../interfaces/interfaces';

// Utils
import {
  getGreatTotal,
  getMessageForProductDevolutionOperation,
  getProductDevolutionBalanceWithoutNegativeNumber,
  getTicketSale,
} from '../utils/saleFunction';
import DAYS_OPERATIONS from '../lib/day_operations';

// Components
// import productInventory from '../moocks/productInventory';
import TableProduct from '../components/SalesLayout/TableProduct';
import SaleSummarize from '../components/SalesLayout/SaleSummarize';
import ConfirmationBand from '../components/ConfirmationBand';
import ResultSale from '../components/ResultSale';
import SubtotalLine from '../components/SalesLayout/SubtotalLine';
import PaymentProcess from '../components/SalesLayout/PaymentProcess';
import MenuHeader from '../components/generalComponents/MenuHeader';

// Utils
import { timestamp_format } from '../utils/momentFormat';
import { determineRouteDayState } from '../utils/routeDayStoreStatesAutomata';
import { avoidingUndefinedItem } from '../utils/generalFunctions';

// Services
import { printTicketBluetooth } from '../services/printerService';

// Redux context
import { updateStores } from '../redux/slices/storesSlice';
import { enumStoreStates } from '../interfaces/enumStoreStates';
import { updateProductsInventory } from '../redux/slices/productsInventorySlice';

// Database
import {
  deleteRouteTransactionById,
  deleteRouteTransactionOperationById,
  deleteRouteTransactionOperationDescriptionsById,
  insertRouteTransaction,
  insertRouteTransactionOperation,
  insertRouteTransactionOperationDescription,
  updateDayOperation,
  updateProducts,
  updateStore,
} from '../queries/SQLite/sqlLiteQueries';
import { apiResponseStatus } from '../utils/apiResponse';

const initialStateStore:IStore&IStoreStatusDay = {
  id_store: '',
  street: '',
  ext_number: '',
  colony: '',
  postal_code: '',
  address_reference: '',
  store_name: '',
  owner_name: '',
  cellphone: '',
  latitude: '',
  longuitude: '',
  id_creator: 0,
  creation_date: '',
  creation_context: '',
  status_store: '',
  route_day_state: 0,
};

function getInitialInventoryParametersFromRoute(params:any, inventoryName:string) {
  if (params === undefined) {
    return [];
  } else {
    return avoidingUndefinedItem(params[inventoryName], []);
  }
}

function productCommitedValidation(productInventory:IProductInventory[],
  productsToCommit:IProductInventory[],
  productSharingInventory:IProductInventory[],
  isProductReposition:boolean) {
  let isNewAmountAllowed:boolean = true;
  let errorTitle:string = 'Cantidad a vender excede el inventario.';
  let errorCaption:string = '';

  // Verify the amount between salling and repositing don't be grater that the current inventory
  productInventory.forEach((product:IProductInventory) => {
    // Find the product in the inventory after adding product
    let productToCommitFound:IProductInventory|undefined =
    productsToCommit.find((productRepositionToCommit:IProductInventory) =>
        { return productRepositionToCommit.id_product === product.id_product; });

    // Find product in product commited for sale.
    let productSharingFound:IProductInventory|undefined = productSharingInventory.find((currentProductSale:IProductInventory) => {
      return currentProductSale.id_product === product.id_product;
    });

    // Starting distribution of product between concepts
    if (productSharingFound !== undefined && productToCommitFound !== undefined) {
      /*
        It means, both concepts are outflowing the same product, so it is needed to verify that
        both amounts (product reposition and sale) combined don't be grater than what is currently
        in stock.
      */
      if(product.amount === 0) { /* There is not product in inventory */
        isNewAmountAllowed = false;
        productToCommitFound.amount = 0; // Beacuse it is not product to fullfill
        errorCaption = 'Actualmente no hay suficiente inventario disponible para completar toda la solicitud correctamente';
      } else if ((productSharingFound.amount + productToCommitFound.amount) <= product.amount) {
        /* Product enough to supply both requests */
        /* No instrucciones; It's a valid input */
      } else { /* There is not product enough to fullfil both requests */
        isNewAmountAllowed = false; // Not possible amount.
        errorCaption = 'No hay suficiente inventario para completar la reposición y venta.';
        productToCommitFound.amount = product.amount - productSharingFound.amount;
      }
    } else if (productToCommitFound !== undefined) {
      /* It means that only one concept (product reposition or sale) is outflowing product. */
      if (productToCommitFound.amount <= product.amount) {
        /* No instructions; valid input */
      } else {
        productToCommitFound.amount = product.amount;
        isNewAmountAllowed = false; // There is not product enough to fullfill the requeriment.
        if (isProductReposition) {
          errorCaption = 'Estas intentando reponer mas producto del que tienes en el inventario.';
        } else {
          errorCaption = 'Estas intentando vender mas producto del que tienes en el inventario.';
        }
      }
    } else {
      /* Not instructions for this if-else block in this particular function */
    }
  });

  if (isNewAmountAllowed) {
    /* No instrucctions */
  } else {
    Toast.show({type: 'error', text1:errorTitle, text2: errorCaption});
  }

  return productsToCommit;
}

function determiningNextStatusOfStore(foundStore: IStore&IStoreStatusDay|undefined):IStore&IStoreStatusDay {

  let updatedStore:IStore&IStoreStatusDay;
  // Creating variable to store the new status
  if (foundStore === undefined) {
    updatedStore = { ...initialStateStore };
  } else {
    updatedStore = { ...foundStore };
  }

  if (foundStore !== undefined) {
    /*
      It means, the store is already plannified for this day, but we don't know if the client
      asked to be visited or if it is a client that belongs to today.
    */
   // Determining new status based on this context.
    if(foundStore.route_day_state === enumStoreStates.REQUEST_FOR_SELLING) {
      updatedStore = {
        ...foundStore,
        route_day_state: determineRouteDayState(foundStore.route_day_state, 4),
      };
    } else {
      /* This store belongs to the route of the today*/
      // Update redux context.
      updatedStore = {
        ...foundStore,
        route_day_state: determineRouteDayState(foundStore.route_day_state, 2),
      };

    }
  } else {
    /*
      If the user was not in the redux state "stores" that means that it is an special sale
      without a "petition to visit"; Vendor visited a store that didn't belong to the route
      and it didn't have a "petition to visit" status.
    */
    /*TO DO*/
  }

  return updatedStore;

}


/*
  This function helps to determine if there is necessary to update the current day operation.

  If it is necessary to update, the fucntion will return the next day operation, otherwise, it will 
  return the current day operation.
*/
function determinigNextOperation(currentOperation: IDayOperation,
  dayOperations: IDayOperation[],
  stores:(IStore&IStoreStatusDay)[]
):IDayOperation {
  let nextDayOperation:IDayOperation = { ...currentOperation };

  /* Determining if moving to the next operation. */
  if (currentOperation.current_operation) {
    /* Moving to the next operation */
    // Updating embedded database
    const index = dayOperations
      .findIndex(operation => { return operation.id_item === currentOperation.id_item; });

    if (index > -1) { // The operation is in the list of day operations to do.
      if (index + 1 < dayOperations.length) { // Verifying it is not the last day operation.
        let candidateNextDayOperation:IDayOperation = dayOperations[index + 1];
        /*
          The vendor can follow the order of the route but also, he can
          sell to any store, it doesn't matter if the store is the next one or
          not, so it is needed to "find" the next day operation, not necessarily
          the next operation in the list.
        */
        // Searching the day operation (next store in status of pending)
        // For always going to start in the next day operation.
        for (let i = index + 1; i < dayOperations.length; i++) {
            // Finding in the array of stores that one that corresponds to the day operation
            const currentStore = stores.find((store:IStore&IStoreStatusDay) => {
              return dayOperations[i].id_item === store.id_store;
            });

            if(currentStore !== undefined) {
              if(currentStore.route_day_state === enumStoreStates.PENDING_TO_VISIT
              || currentStore.route_day_state === enumStoreStates.REQUEST_FOR_SELLING) {
                /*
                  Store gathers the criteria to be the next current operation.

                  Remember that:
                  - PENDING TO VISIT: It is the state on which the store belogns to the current
                  workday but it hasn't been visited.
                  - REQUEST FOR VISTING: It is the state on which the store doesn't belongs
                  to the current workday but they asked to be visited today.
                */
                candidateNextDayOperation = dayOperations[i];
                break;
              } else {
                /* There is not instructions; Store doesn't accomplish the criteria. */
              }
            } else {
              /* There is not instructions; Store doesn't exists in the "stores" state */
            }
        }

      nextDayOperation = { ...candidateNextDayOperation };

      } else {
        /*
          If it is the last operation, then it is not needed to move to the next one because
          the vendor is already in the last one.
        */
      }
    } else { /* There is not instructions. */ }
  } else {
    /*
      If the current store is not the current operation, then, it is not needed to make
      anything.

      The pointer that points to the current operation is only going to move when the store
      that is being selling is current operation.

      In this context, the vendor is selling a store that has already visited or
      that is pending to visit.
    */
  }

  return nextDayOperation;
}

async function updateDayOperations(currentOperation: IDayOperation, nextDayOperation: IDayOperation)
:Promise<boolean> {
  try {
    let resultProcess:boolean = true;
    let resultUpdateCurrentDay:IResponse<IDayOperation>;
    let resultUpdateNextDay:IResponse<IDayOperation>;

    if (currentOperation.id_day_operation !== nextDayOperation.id_day_operation) {
      // Update embedded database.
      resultUpdateCurrentDay = await updateDayOperation({
        ...currentOperation,
        current_operation: 0,
      });

      resultUpdateNextDay = await updateDayOperation({
        ...nextDayOperation,
        current_operation: 1,
      });

      if (apiResponseStatus(resultUpdateCurrentDay, 200)
      && apiResponseStatus(resultUpdateNextDay, 200)) {
        resultProcess = true;
      } else {
        resultProcess = false;
      }
    } else {
      /* It means, there is not a new current day. The current day remains */
    }

    return resultProcess;
  } catch (error) {
    return false;
  }
}

function createRouteTransactionOperation(
  routeTransaction:IRouteTransaction,
  typeOfOperation:string):IRouteTransactionOperation {
  const { id_route_transaction } = routeTransaction;

  const routeTransactionOperation:IRouteTransactionOperation = {
    id_route_transaction_operation: uuidv4(),
    id_route_transaction: id_route_transaction,
    id_route_transaction_operation_type: typeOfOperation,
  };

  return routeTransactionOperation;
}

function createRouteTransactionOperationDescription(
  routeTransactionOperation:IRouteTransactionOperation,
  movementInTransaction: IProductInventory[]
):IRouteTransactionOperationDescription[] {
  const routeTransactionOperationDescriptions:IRouteTransactionOperationDescription[] = [];

  const { id_route_transaction_operation } = routeTransactionOperation;

  movementInTransaction.forEach((product) => {
    const {price, amount, id_product} = product;
    routeTransactionOperationDescriptions.push({
      id_route_transaction_operation_description: uuidv4(),
      price_at_moment: price,
      amount: amount,
      id_route_transaction_operation: id_route_transaction_operation,
      id_product: id_product,
    });
  });

  return routeTransactionOperationDescriptions;
}

function substractingProductFromCurrentInventory(currentInventory: IProductInventory[],
  inventoryToSubstract:IProductInventory[]):IProductInventory[] {
    // Creating a copy of the current inventory
    const updatedInventory:IProductInventory[] = currentInventory
    .map((product:IProductInventory) => { return { ...product }; });

    inventoryToSubstract.forEach((product:IProductInventory) => {
      const amountToSubstract:number = product.amount;

      const index:number = updatedInventory.findIndex(currentProduct =>
          { return currentProduct.id_product === product.id_product; });

      const currentAmount:number = updatedInventory[index].amount;

      if(index === -1) {
        /* Do nothing */
      } else {
        updatedInventory[index] = {
          ...updatedInventory[index],
          amount: currentAmount - amountToSubstract,
        };
      }

    });

    return updatedInventory;
}

async function insertionTransactionOperationsAndOperationDescriptions(
  routeTransactionOperation:IRouteTransactionOperation,
  routeTransactionOperationDescription:IRouteTransactionOperationDescription[]
):Promise<boolean> {
  try {
    let resultInsertion:boolean = true;
    if (routeTransactionOperationDescription[0] !== undefined) {
      /* There was a movement in concept of devolution. */
      let resultInsertionOperationDevolution:IResponse<IRouteTransactionOperation>
        = await insertRouteTransactionOperation(routeTransactionOperation);
      let resultInsertionOperationDescriptionDevolution
      :IResponse<IRouteTransactionOperationDescription[]>
        = await insertRouteTransactionOperationDescription(routeTransactionOperationDescription);

        if (apiResponseStatus(resultInsertionOperationDevolution, 201)
        && apiResponseStatus(resultInsertionOperationDescriptionDevolution, 201)) {
          resultInsertion = true;
        } else {
          Toast.show({
            type: 'error',
            text1:'Ha habido un error durante el registro de la venta',
            text2: 'Ha habido un error al insertar una de las descripciones de la venta'});
          resultInsertion = false;
        }
    } else {
      /* It means, that there is not movements for the current operation,
         so, it won't be registered  */
      resultInsertion = true;
    }

    return resultInsertion;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1:'Ha habido un error durante el registro de la venta',
      text2: 'Ha habido un error al insertar una de las descripciones de la venta'});
    return false;
  }

}

const SalesLayout = ({ route, navigation }:{ route:any, navigation:any }) => {
  // Auxiliar variables
  // Getting information from parameters
  let initialProductDevolution:IProductInventory[]
  = getInitialInventoryParametersFromRoute(route.params, 'initialProductDevolution');

  let initialProductResposition:IProductInventory[]
    = getInitialInventoryParametersFromRoute(route.params, 'initialProductReposition');

  let initialSaleProduct:IProductInventory[]
    = getInitialInventoryParametersFromRoute(route.params, 'initialProductSale');


  // Redux context definitions
  const dispatch: AppDispatch = useDispatch();
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const routeDay = useSelector((state: RootState) => state.routeDay);
  const dayOperations = useSelector((state: RootState) => state.dayOperations);

  const stores = useSelector((state: RootState) => state.stores);
  const productInventory = useSelector((state: RootState) => state.productsInventory);

  // Use states
  /* States to store the current product according with their context. */
  const [productDevolution, setProductDevolution]
    = useState<IProductInventory[]>(initialProductDevolution);

  const [productReposition, setProductReposition]
    = useState<IProductInventory[]>(productCommitedValidation(
      productInventory,
      initialProductResposition,
      initialSaleProduct,
      true));

  const [productSale, setProductSale]
    = useState<IProductInventory[]>(productCommitedValidation(
      productInventory,
      initialSaleProduct,
      initialProductResposition,
      false));


  /* States used in the logic of the layout. */
  const [startPaymentProcess, setStartPaymentProcess] = useState<boolean>(false);
  const [finishedSale, setFinishedSale] = useState<boolean>(false);
  const [resultSaleState, setResultSaleState] = useState<boolean>(true);

  // Handlers
  const handleCancelSale = () => {
    navigation.navigate('storeMenu');
  };

  const handleOnGoBack = () => {
    navigation.navigate('storeMenu');
  };

  const handleSalePaymentProcess = () => {
    setStartPaymentProcess(true);
  };

  /*
    According with the workflow of the application, it is not until the vendor confirms
    the payment method (and the extra steps that each payment method requires are done)
    that the sale is closed.
  */

  const handlerPaySale = async (receivedCash:number, paymnetMethod:IPaymentMethod) => {
    /*This handler inserts the sale in the database*/
    /* Validating that the payment a correct state for the payment method*/
    setFinishedSale(true); // Finishing sale payment process.

    // Creating route transaction

    /*
      When a vendor vistis a store, a transaction is created.

      A transaction can contain of one the following "transaction  operations":
        - Sale
        - Product devolution
        - Product Reposition

      It is possible that a transaction doesn't have any "transaction operation", in this way,
      if this case happens, it indicates that the vendor visited the store but it wasn't any operation.

      To determine if it were a transaction operation, it is necessary that the transaction opertation
      counts with at least one transaction operation movement (this one is actual movement inventory and
      cash {inflow/outflow} operations that were made in the visit to the store).
    */
      Toast.show({
        type: 'info',
        text1:'Comenzando proceso para registrar la venta',
        text2: 'Iniciando proceso para registrar la venta'});

    // Variables to perform operations.
    // Variable get the inventory after route transaction.
    const updateInventory:IProductInventory[] = [];

    // Variables used to store the response of the insertions
    // Bands for determine if there was during the process.
    let resultOperationDevolution:boolean = true;
    let resultOperationSale:boolean       = true;
    let resultOperationReposition:boolean = true;

    // Creating transaction
    const routeTransaction:IRouteTransaction = {
      id_route_transaction: uuidv4(),
      date: timestamp_format(),
      state: 1, // Indicating "active transaction"
      cash_received: receivedCash,
      id_work_day: routeDay.id_work_day,
      id_payment_method: paymnetMethod.id_payment_method,
      id_store: currentOperation.id_item, // Item will be the id of the store in question.
    };

    // Creating route transaction operations
    const productDevolutionRouteTransactionOperation:IRouteTransactionOperation
      = createRouteTransactionOperation(routeTransaction, DAYS_OPERATIONS.product_devolution);

    const productRepositionRouteTransactionOperation:IRouteTransactionOperation
      = createRouteTransactionOperation(routeTransaction, DAYS_OPERATIONS.product_reposition);

    const saleRouteTransactionOperation:IRouteTransactionOperation
      = createRouteTransactionOperation(routeTransaction, DAYS_OPERATIONS.sales);


    // Creating description for each type of transaction operation.
    /*
      The information used to create the route transaction operation description
      comes from the states that are in this component.
    */

    // Product devolution
    const productDevolutionRouteTransactionOperationDescription
      :IRouteTransactionOperationDescription[]
      = createRouteTransactionOperationDescription(
        productDevolutionRouteTransactionOperation,
        productDevolution);

    // Sale
    const saleRouteTransactionOperationDescription
      :IRouteTransactionOperationDescription[]
      = createRouteTransactionOperationDescription(
        saleRouteTransactionOperation,
        productSale);

      // Product reposition
    const productRepositionRouteTransactionOperationDescription
      :IRouteTransactionOperationDescription[]
      = createRouteTransactionOperationDescription(
        productRepositionRouteTransactionOperation,
        productReposition);

    /* Updating the inventory substrating it product sale and product reposition from the
        current inventory.

      The intention of this is to get the inventory after the route transaction operations.

      To make this, it is needed to substract the product of the concepts of "selling" and
      "product reposition" from the current operation.

      Once this is done, we got the inventory with the new amounts.

      Note product devolution doesn't have any effect in the current inventory.
      This concept is handler in a different way.
    */
    substractingProductFromCurrentInventory(
      substractingProductFromCurrentInventory(productInventory, productReposition),
      productSale)
        .forEach((updatedProduct:IProductInventory) => { updateInventory.push(updatedProduct); });

    // Storing transaction
    Toast.show({
      type: 'info',
      text1:'Guardando venta',
      text2: 'Registrando los movimientos de la venta.'});

    // Storing the route transaction in the database
    console.log("Creating transaction")

    // Updating the status of the store
    const foundStore:(IStore&IStoreStatusDay|undefined) = stores.find(store => store.id_store === currentOperation.id_item);

    const updatedStore:IStore&IStoreStatusDay = determiningNextStatusOfStore(foundStore);

    /*
      Verifying the vendor is not making a second sale to a store that has already
      sold (in the route).

      If the current store is the current operation to do (it is the "turn" of the store
      to be visited), then it means that after this sale, the vendor has to go to the "next
      store" (it is needed to update the current operation).

      Otherwise, it means that the vendor is visiting other store that is not the current one.
    */
    const nextDayOperation:IDayOperation = determinigNextOperation(currentOperation, dayOperations, stores);

    try {
    // Inserting the transaction
    const resultInsertionRouteTransaction:IResponse<IRouteTransaction>
      = await insertRouteTransaction(routeTransaction);

    // Inserting movements of the route transaction
    resultOperationDevolution = await insertionTransactionOperationsAndOperationDescriptions(productDevolutionRouteTransactionOperation,
      productDevolutionRouteTransactionOperationDescription);

    resultOperationReposition = await insertionTransactionOperationsAndOperationDescriptions(productRepositionRouteTransactionOperation,
      productRepositionRouteTransactionOperationDescription);

    resultOperationSale = await insertionTransactionOperationsAndOperationDescriptions(saleRouteTransactionOperation,
      saleRouteTransactionOperationDescription);

    // Updating inventory
    /*
      Sales and product reposition will directly be substracted from the inventory
      (the outflow of these concepts impact to the inventory).

      In the other hand, the product devolutions will not have any effect in the inventory,
      in this case, this movements will be gathered until the end of shift to calculate an
      inventory to determine the "product devolution inventory".
    */
    Toast.show({
      type: 'info',
      text1:'Actualizando inventario',
      text2: 'Registrando cambios en el inventario.'});

    // Updating embedded database
    let resultUpdateProducts:IResponse<IProductInventory[]> = await updateProducts(updateInventory);

    // Updating store's status
    /*
      Once the inventory has been updated successfully, the store's status will be
      updating depending on the context of the store in the route.
    */
    Toast.show({
      type: 'info',
      text1:'Actualizando estatus de la tienda',
      text2: 'Cambiando el estatus de la tienda en la ruta.'});


    let resultUpdatingStore = await updateStore(updatedStore);

    // Updating day operations
    let resultUpdateDayOperations:boolean = await updateDayOperations(currentOperation, nextDayOperation);

    // Validating the process was correctly completed
    if (apiResponseStatus(resultInsertionRouteTransaction, 201)
    && resultOperationDevolution
    && resultOperationReposition
    && resultOperationSale
    && apiResponseStatus(resultUpdateProducts, 200)
    && apiResponseStatus(resultUpdatingStore, 200)
    && resultUpdateDayOperations
    ) {
      Toast.show({
        type: 'success',
        text1:'Se ha registrado la venta satisfactoriamente.',
        text2: 'Se ha registrado la venta satisfactoriamente.'});

      // Updating redux states
      dispatch(updateProductsInventory(updateInventory));

      /* This store doesn't belong to this day, but it was requested to be visited. */
      // Update redux context
      dispatch(updateStores([ updatedStore ]));

      if (nextDayOperation.id_day_operation !== currentOperation.id_day_operation) {
        // Updating redux state for the current operation
        dispatch(setCurrentOperation(nextDayOperation));
      }
    } else {
      Toast.show({
        type: 'error',
        text1:'Hubo un problema durante el registro de la venta',
        text2: 'Hubo un problema durante el registro de la venta, porfavor, intente nuevamente.'});

      // Deleting route transaction operations descriptions
      await deleteRouteTransactionOperationDescriptionsById(productDevolutionRouteTransactionOperationDescription);
      await deleteRouteTransactionOperationDescriptionsById(productRepositionRouteTransactionOperationDescription);
      await deleteRouteTransactionOperationDescriptionsById(saleRouteTransactionOperationDescription);

      // Deleting route transaction operations
      await deleteRouteTransactionOperationById(productDevolutionRouteTransactionOperation);
      await deleteRouteTransactionOperationById(saleRouteTransactionOperation);
      await deleteRouteTransactionOperationById(productRepositionRouteTransactionOperation);

      // Deleting route transaction
      await deleteRouteTransactionById(routeTransaction);

      // Recoverying inventory to before the transaction
      await updateProducts(productInventory);

      // Recoverying the store state to before the transaction
      if (foundStore !== undefined) {
        await updateStore(foundStore);
      } else { /* The store was not registered in the store to visit today. */ }

      // Recoverying the operations to before the transactions
      await updateDayOperations(nextDayOperation, currentOperation);
    }

    setResultSaleState(true); // The sale was completed successfully.
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:'Hubo un problema durante el registro de la venta',
        text2: 'Hubo un problema durante el registro de la venta, porfavor, intente nuevamente.'});

        // Deleting route transaction operations descriptions
        await deleteRouteTransactionOperationDescriptionsById(productDevolutionRouteTransactionOperationDescription);
        await deleteRouteTransactionOperationDescriptionsById(productRepositionRouteTransactionOperationDescription);
        await deleteRouteTransactionOperationDescriptionsById(saleRouteTransactionOperationDescription);

        // Deleting route transaction operations
        await deleteRouteTransactionOperationById(productDevolutionRouteTransactionOperation);
        await deleteRouteTransactionOperationById(saleRouteTransactionOperation);
        await deleteRouteTransactionOperationById(productRepositionRouteTransactionOperation);

        // Deleting route transaction
        await deleteRouteTransactionById(routeTransaction);

        // Recoverying inventory to before the transaction
        await updateProducts(productInventory);

        // Recoverying the store state to before the transaction
        if (foundStore !== undefined) {
          await updateStore(foundStore);
        } else { /* The store was not registered in the store to visit today. */ }

        // Recoverying the operations to before the transactions
        await updateDayOperations(nextDayOperation, currentOperation);
      setResultSaleState(false); // Something was wrong during the sale.
    }
  };

  const handlerOnSuccessfullCompletionSale = async () => {
    navigation.navigate('routeOperationMenu');
  };

  const handlerOnFailedCompletionSale = () => {
    // Updating the status of the store and moving to the next operation.
    dispatch(setNextOperation());
    navigation.navigate('routeOperationMenu');
  };

  const handlerOnPrintTicket = async () => {
    try {
      await printTicketBluetooth(getTicketSale(productDevolution,productReposition, productSale));
    } catch(error) {
      Toast.show({
        type: 'error',
        text1:'Hubo un problema de conexción con la impresora.',
        text2: 'No se encontro la impresora, porfavor intente conectarla con el telefono he intente nuevamente.'});
    }
  };

  const handlerOnTryAgain = () => {
    setFinishedSale(false);
    setResultSaleState(false);
  };

  // Related to add product
  /*
    Handler that cares the outflow of product.
    It is not possible to sell product that you don't have
  */
  const handlerSetProductReposition = (productsToCommit:IProductInventory[]) => {
    setProductReposition(
      productCommitedValidation(productInventory, productsToCommit, productSale, true));
  };

  const handlerSetSaleProduct = (productsToCommit:IProductInventory[]) => {
    setProductSale(
      productCommitedValidation(productInventory, productsToCommit, productReposition, false));
  };

  return (
    finishedSale === false ?
      <ScrollView
        nestedScrollEnabled={true}
        style={tw`w-full flex flex-col`}>
          {/*
            This dialog contais the process for finishing a sale.
            Steps:
              1- Choose a payment method.
              2- Client pays according to its selection.
          */}
          <PaymentProcess
            transactionIdentifier={routeDay.id_route_day}
            totalToPay={getGreatTotal(productDevolution, productReposition, productSale)}
            paymentProcess={startPaymentProcess}
            onCancelPaymentProcess={setStartPaymentProcess}
            onPaySale={(receivedCash:number, paymnetMethod:IPaymentMethod) => handlerPaySale(receivedCash, paymnetMethod)}/>
        <View style={tw`w-full flex flex-1 flex-col items-center`}>
          <View style={tw`my-3 w-full flex flex-row justify-center items-center`}>
            <MenuHeader onGoBack={handleOnGoBack}/>
          </View>
          <View style={tw`w-full flex flex-row`}>
            <TableProduct
              catalog={productInventory}
              commitedProducts={productDevolution}
              setCommitedProduct={setProductDevolution}
              sectionTitle={'Devolución de producto'}
              sectionCaption={'(Precios consultados al día de la venta)'}
              totalMessage={'Total de valor de devolución:'}
              />
          </View>
          <View style={tw`w-full flex flex-row`}>
            <TableProduct
              catalog={productInventory}
              commitedProducts={productReposition}
              setCommitedProduct={handlerSetProductReposition}
              sectionTitle={'Reposición de producto'}
              sectionCaption={'(Precios actuales tomados para la reposición)'}
              totalMessage={'Total de valor de la reposición:'}
              />
          </View>
          <View style={tw`flex flex-row my-1`}>
            <SubtotalLine
              description={getMessageForProductDevolutionOperation(productDevolution, productReposition)}
              total={getProductDevolutionBalanceWithoutNegativeNumber(productDevolution,
                    productReposition).toString()}
              fontStyle={'font-bold text-lg'}/>
          </View>
          <View style={tw`flex flex-row w-11/12 border border-solid mt-2`} />
          <View style={tw`w-full flex flex-row`}>
            <TableProduct
              catalog={productInventory}
              commitedProducts={productSale}
              setCommitedProduct={handlerSetSaleProduct}
              sectionTitle={'Productos para vender'}
              sectionCaption={'(Venta sugerida: Última venta)'}
              totalMessage={'Total de la venta:'}
              />
          </View>
          <View style={tw`w-full flex flex-row justify-center my-5`}>
            <SaleSummarize
              productsDevolution={productDevolution}
              productsReposition={productReposition}
              productsSale={productSale}/>
          </View>
        </View>
        <ConfirmationBand
          textOnAccept={'Continuar'}
          textOnCancel={'Cancelar operación'}
          handleOnAccept={handleSalePaymentProcess}
          handleOnCancel={handleCancelSale}/>
        <View style={tw`flex flex-row mt-10`} />
      </ScrollView>
      :
      <ResultSale
        onSuccessfullCompletion={handlerOnSuccessfullCompletionSale}
        onPrintTicket={handlerOnPrintTicket}
        onFailedCompletion={handlerOnFailedCompletionSale}
        onTryAgain={handlerOnTryAgain}
        resultSaleState={resultSaleState}/>
  );
};

export default SalesLayout;
