// Libraries
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import tw from 'twrnc';
import 'react-native-get-random-values'; // Necessary for uuid
import {v4 as uuidv4 } from 'uuid';

// Redux context.
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { setNextOperation } from '../redux/slices/dayOperationsSlice';

// Interfaces and enums
import {
  IPaymentMethod,
  IProductInventory,
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
import PAYMENT_METHODS from '../utils/paymentMethod';
import DAYS_OPERATIONS from '../lib/day_operations';

// Components
// import productInventory from '../moocks/productInventory';
import TableProduct from '../components/SalesLayout/TableProduct';
import SaleSummarize from '../components/SalesLayout/SaleSummarize';
import ConfirmationBand from '../components/ConfirmationBand';
import ActionDialog from '../components/ActionDialog';
import PaymentMethod from '../components/SalesLayout/PaymentMethod';
import PaymentMenu from '../components/SalesLayout/PaymentMenu';
import StoreHeader from '../components/SalesLayout/StoreHeader';
import ResultSale from '../components/ResultSale';
import SubtotalLine from '../components/SalesLayout/SubtotalLine';

// Utils
import { timestamp_format } from '../utils/momentFormat';
import { determineRouteDayState } from '../utils/routeDayStoreStatesAutomata';
import { avoidingUndefinedItem } from '../utils/generalFunctions';

// Services
import { getPrinterBluetoothConnction, printTicketBluetooth } from '../services/printerService';

// Redux context
import { updateStores } from '../redux/slices/storesSlice';
import { enumStoreStates } from '../interfaces/enumStoreStates';
import { updateProductsInventory } from '../redux/slices/productsInventorySlice';

// Database
import {
  insertRouteTransaction,
  insertRouteTransactionOperation,
  insertRouteTransactionOperationDescription,
  updateDayOperation,
  updateProducts,
  updateStore,
} from '../queries/SQLite/sqlLiteQueries';

function getInitialInventoryParametersFromRoute(params:any, inventoryName:string) {
  console.log("Initializing states")
  if (params === undefined) {
    return [];
  } else {
    return avoidingUndefinedItem(params[inventoryName], []);
  }
}


// Axiliar funciton
const SalesLayout = ({
    route,
    navigation,
    initialProductDevolution,
    initialProductReposition,
    initialProductSale,
  }:{
    route:any,
    navigation:any,
    initialProductDevolution?: IProductInventory[],
    initialProductReposition?: IProductInventory[],
    initialProductSale?: IProductInventory[],
  }) => {

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
    = useState<IProductInventory[]>(getInitialInventoryParametersFromRoute(
        route.params, 'initialProductDevolution'));

  const [productReposition, setProductReposition]
    = useState<IProductInventory[]>(getInitialInventoryParametersFromRoute(
        route.params, 'initialProductReposition'));

  const [productSale, setProductSale]
    = useState<IProductInventory[]>(getInitialInventoryParametersFromRoute(
      route.params, 'initialProductSale'));

  /* States used to store the payment methods. */
  const [paymnetMethod, setPaymentMethod] = useState<IPaymentMethod>(PAYMENT_METHODS[0]);

  /* States used in the logic of the layout. */
  const [confirmedPaymentMethod, setConfirmedPaymentMethod] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [finishedSale, setFinishedSale] = useState<boolean>(false);
  const [resultSaleState, setResultSaleState] = useState<boolean>(true);

  // Handlers
  const handleStartSalePayment = () => {
    setShowDialog(true);
  };

  const handleConfirmPaymentMethod = () => {
    setConfirmedPaymentMethod(true);

  };

  const handlerDeclineDialog = () => {
    setShowDialog(false);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setConfirmedPaymentMethod(false);
  };

  const handleCancelSale = () => {
    navigation.navigate('storeMenu');
  };

  const handleOnGoBack = () => {
    navigation.navigate('storeMenu');
  };

  /*
    According with the workflow of the application, it is not until the vendor confirms
    the payment method (and the extra steps that each payment method requires are done)
    that the sale is closed.
  */

  const handlePaySale = async () => {
    /*This handler inserts the sale in the database*/
    setFinishedSale(true);
    try {
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
    // Creating transaction
    const routeTransaction:IRouteTransaction = {
      id_route_transaction: uuidv4(),
      date: timestamp_format(),
      state: 1, // Indicating "active transaction"
      id_work_day: routeDay.id_work_day,
      id_payment_method: paymnetMethod.id_payment_method,
      id_store: currentOperation.id_item, // Item will be the id of the store in question.
    };

    // Creating transaction operations
    const saleRouteTransactionOperation:IRouteTransactionOperation = {
      id_route_transaction_operation: uuidv4(),
      id_route_transaction: routeTransaction.id_route_transaction,
      id_route_transaction_operation_type: DAYS_OPERATIONS.sales,
    };

    const productDevolutionRouteTransactionOperation:IRouteTransactionOperation = {
      id_route_transaction_operation: uuidv4(),
      id_route_transaction: routeTransaction.id_route_transaction,
      id_route_transaction_operation_type: DAYS_OPERATIONS.product_devolution,
    };

    const productRepositionRouteTransactionOperation:IRouteTransactionOperation = {
      id_route_transaction_operation: uuidv4(),
      id_route_transaction: routeTransaction.id_route_transaction,
      id_route_transaction_operation_type: DAYS_OPERATIONS.product_reposition,
    };

    // Creating description for each type of transaction operation.
    const saleRouteTransactionOperationDescription:IRouteTransactionOperationDescription[] = [];
    const productDevolutionRouteTransactionOperationDescription:IRouteTransactionOperationDescription[] = [];
    const productRepositionRouteTransactionOperationDescription:IRouteTransactionOperationDescription[] = [];


    // Variable get the inventory after sale.
    const updateInventory = productInventory.map((product) => {return {...product};});

    //Extracting information from the selling process.
    // Product devolution
    productDevolution.forEach((product) => {
      productDevolutionRouteTransactionOperationDescription.push({
        id_route_transaction_operation_description: uuidv4(),
        price_at_moment: product.price,
        amount: product.amount,
        id_route_transaction_operation: productDevolutionRouteTransactionOperation.id_route_transaction_operation,
        id_product: product.id_product,
      });
    });

    // Sale
    productSale.forEach((product) => {
      saleRouteTransactionOperationDescription.push({
        id_route_transaction_operation_description: uuidv4(),
        price_at_moment: product.price,
        amount: product.amount,
        id_route_transaction_operation: saleRouteTransactionOperation.id_route_transaction_operation,
        id_product: product.id_product,
      });

      const index:number = updateInventory
        .findIndex(currentProduct => {return currentProduct.id_product === product.id_product; });
      if(index === -1) {
        /* Do nothing */
      } else {
        updateInventory[index] = {
          ...updateInventory[index],
          amount: updateInventory[index].amount - product.amount,
        };
      }
    });

    // Product reposition
    productReposition.forEach((product) => {
      productRepositionRouteTransactionOperationDescription.push({
        id_route_transaction_operation_description: uuidv4(),
        price_at_moment: product.price,
        amount: product.amount,
        id_route_transaction_operation: productRepositionRouteTransactionOperation.id_route_transaction_operation,
        id_product: product.id_product,
      });

      const index:number = updateInventory
      .findIndex(currentProduct => {return currentProduct.id_product === product.id_product; });

      if(index === -1) {
        /* Do nothing */
      } else {
        updateInventory[index] = {
          ...updateInventory[index],
          amount: updateInventory[index].amount - product.amount,
        };
      }
    });

    console.log("Creating transaction")
    // Storing transaction
    await insertRouteTransaction(routeTransaction);
    if (productDevolutionRouteTransactionOperationDescription[0] !== undefined) {
      console.log("Creating devolution transaction operation")
      /* There was a movement in concept of devolution. */
      await insertRouteTransactionOperation(productDevolutionRouteTransactionOperation);
      await insertRouteTransactionOperationDescription(productDevolutionRouteTransactionOperationDescription);
    }

    if (saleRouteTransactionOperationDescription[0] !== undefined) {
      console.log("Creating  transaction operation")
      /* There was a movement in concept of sale. */
      await insertRouteTransactionOperation(saleRouteTransactionOperation);
      await insertRouteTransactionOperationDescription(saleRouteTransactionOperationDescription);
    }

    if (productRepositionRouteTransactionOperationDescription[0] !== undefined) {
      console.log("Creating reposition transaction operation")
      /* There was a movement in concept of reposition. */
      await insertRouteTransactionOperation(productRepositionRouteTransactionOperation);
      await insertRouteTransactionOperationDescription(productRepositionRouteTransactionOperationDescription);
    }

    // Updating inventory
    /*
      Sales and product reposition will directly be substracted from the inventory
      (the outflow of these concepts impact to the inventory).

      In the other hand, the product devolutions will not have any effect in the inventory,
      in this case, this movements will be gathered until the end of shift to calculate an
      inventory to determine the "product devolution inventory".
    */
   console.log("Updating products transaction operation")
    // Updating redux context
    dispatch(updateProductsInventory(updateInventory));

    // Updating embedded database
    await updateProducts(updateInventory);

    console.log("Updating stores operation")
    // Updating the status of the store
    const foundStore:(IStore&IStoreStatusDay|undefined)
      = stores.find(store => store.id_store === currentOperation.id_item);

    if (foundStore !== undefined) {
      /*
        It means, the store is already plannified for this day, but we don't know if the client
        asked to be visited or if it is a client that belongs to today.
      */
      if(foundStore.route_day_state === enumStoreStates.REQUEST_FOR_SELLING) {
        /* This store doesn't belong to this day, but it was requested to be visited. */
        // Update redux context
        dispatch(updateStores([{
          ...foundStore,
          route_day_state: determineRouteDayState(foundStore.route_day_state, 4),
        }]));


        // Update embedded database
        await updateStore({
          ...foundStore,
          route_day_state: determineRouteDayState(foundStore.route_day_state, 4),
        });
      } else {

        /* This store belongs to the route of today*/
        // Update redux context.
        dispatch(updateStores([{
          ...foundStore,
          route_day_state: determineRouteDayState(foundStore.route_day_state, 2),
        }]));
        console.log("Planified client")
        // Update embedded context.
        await updateStore({
          ...foundStore,
          route_day_state: determineRouteDayState(foundStore.route_day_state, 2),
        });
      }
    } else {
      /*
        If the user was not in the state "stores" that means that it is an special sale
        without a "petition to visit".
      */
      /*To do*/
    }

    /*
      Moving to the next operation.
    */

    console.log("Next operation")
    // Updating redux state
    dispatch(setNextOperation());

    // Updating embedded database
    const index = dayOperations.findIndex(operation => {return operation.id_item === currentOperation.id_item;});
    console.log("INDEX TO UPDATE: ", index, "+++++++++++++++++++++++++++++++++++++++++++")
    if (index > -1) { // The operations is the list of day operations to do.
      if (index + 1 < dayOperations.length) { // Verifying it is not the last day operation.
        console.log("UPDATING+++++++++++++++++++++++++++++++++++++++++++++")
        const currentDayOperation = dayOperations[index];
        const nextDayOperation = dayOperations[index + 1];

        // Updating in database that the current operation is not longer the current one
        currentDayOperation.current_operation = 0;
        nextDayOperation.current_operation = 1;

        console.log("currentDayOperation: ", {currentDayOperation})
        console.log("nextDayOperation: ", nextDayOperation)

        // Update embedded database.
        await updateDayOperation({
          ...currentDayOperation,
          current_operation: 0,
        });
        await updateDayOperation({
          ...nextDayOperation,
          current_operation: 1,
        });

      }
    }
      setResultSaleState(true); // The sale was completed successfully.
    } catch (error) {
      setResultSaleState(false); // Something was wrong during the sale.
    }
  };

  /*
    This function is in charge of updating the redux states and embedded database.
    This database is in the case on which the sale was completed successfully.
  */
  const handlerOnSuccessfullCompletionSale = async () => {


    console.log("Go to route menu")
    navigation.navigate('routeOperationMenu');
  };

  const handlerOnFailedCompletionSale = () => {
    // Updating the status of the store

    // Moving to the next operation
    dispatch(setNextOperation());
    navigation.navigate('routeOperationMenu');
  };

  const handlerOnPrintTicket = async () => {
    try {
      await printTicketBluetooth(
        getTicketSale(productDevolution,productReposition, productSale));
    } catch(error) {
      await getPrinterBluetoothConnction();
    }
  };

  const handlerOnTryAgain = () => {
    setFinishedSale(false);
    setResultSaleState(false);
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
        <ActionDialog
          visible={showDialog}
          onAcceptDialog={confirmedPaymentMethod === true ? handlePaySale : handleConfirmPaymentMethod}
          onDeclinedialog={handlerDeclineDialog}
        >
          { confirmedPaymentMethod === true ?
            <PaymentMenu
              total={getGreatTotal(productDevolution, productReposition, productSale)}
              paymentMethod={paymnetMethod}/>
              :
            <PaymentMethod
              currentPaymentMethod={paymnetMethod}
              onSelectPaymentMethod={setPaymentMethod}/>
          }
        </ActionDialog>
        <View style={tw`w-full flex flex-1 flex-col items-center`}>
          <View style={tw`my-3 ml-10 w-full flex flex-row justify-center items-center`}>
            <StoreHeader onGoBack={handleOnGoBack} />
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
              setCommitedProduct={setProductReposition}
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
              setCommitedProduct={setProductSale}
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
          handleOnAccept={handleStartSalePayment}
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
