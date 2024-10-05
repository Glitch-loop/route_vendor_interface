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
  IStore,
  IStoreStatusDay,
  ITransactionOperation,
  ITransactionOperationDescription,
} from '../interfaces/interfaces';

// Utils
import {
  getGreatTotal,
  getMessageForProductDevolutionOperation,
  getProductDevolutionBalanceWithoutNegativeNumber,
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

// Moocks for testign
import SubtotalLine from '../components/SalesLayout/SubtotalLine';
import { updateStores } from '../redux/slices/storesSlice';
import { enumStoreStates } from '../interfaces/enumStoreStates';
import { determineRouteDayState } from '../utils/routeDayStoreStatesAutomata';
import { timesamp_standard_format, timestamp_format } from '../utils/momentFormat';
import {
  insertTransaction,
  insertTransactionOperationDescription,
  updateProducts,
  updateStore,
} from '../queries/SQLite/sqlLiteQueries';
import { updateProductsInventory } from '../redux/slices/productsInventorySlice';

const SalesLayout = ({navigation}:{navigation:any}) => {
  // Redux context definitions
  const dispatch: AppDispatch = useDispatch();
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const dayOperations = useSelector((state: RootState) => state.dayOperations);
  const routeDay = useSelector((state: RootState) => state.routeDay);

  const stores = useSelector((state: RootState) => state.stores);
  const productInventory = useSelector((state: RootState) => state.productsInventory);

  // Use states
  const [productDevolution, setProductDevolution] = useState<IProductInventory[]>([]);
  const [productReposition, setProductReposition] = useState<IProductInventory[]>([]);
  const [productSale, setProductSale] = useState<IProductInventory[]>([]);
  const [paymnetMethod, setPaymentMethod] = useState<IPaymentMethod>(PAYMENT_METHODS[0]);

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

  const handlePaySale = () => {
    /*In this handlers is where the sale is inserted in the database*/
    setFinishedSale(true);

    try {
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
    /*
      At the moment of completing a transaction there will be 3 possible operations:
        - Sale
        - Product devolution
        - Product Reposition

      So, if one of the possible operations don't have any product description, it is not necessary to
      declare or store the transaction because there were not movement for that transaction.
    */

    // Creating transaction operations
    const saleOperation:ITransactionOperation = {
      id_transaction: uuidv4(),
      date: timestamp_format(),
      state: 1, // Indicating "active transaction"
      id_work_day: routeDay.id_work_day,
      id_store: currentOperation.id_item, // Item will be the id of the store in question.
      id_type_operation: DAYS_OPERATIONS.sales,
      id_payment_method: paymnetMethod.id_payment_method,
    };

    const productDevolutionOperation:ITransactionOperation = {
      id_transaction: uuidv4(),
      date: timestamp_format(),
      state: 1, // Indicating "active transaction"
      id_work_day: routeDay.id_work_day,
      id_store: currentOperation.id_item, // Item will be the id of the store in question.
      id_type_operation: DAYS_OPERATIONS.product_devolution,
      id_payment_method: paymnetMethod.id_payment_method,
    };

    const productRepositionOperation:ITransactionOperation = {
      id_transaction: uuidv4(),
      date: timestamp_format(),
      state: 1, // Indicating "active transaction"
      id_work_day: routeDay.id_work_day,
      id_store: currentOperation.id_item, // Item will be the id of the store in question.
      id_type_operation: DAYS_OPERATIONS.product_reposition,
      id_payment_method: paymnetMethod.id_payment_method,
    };

    // Creating description for each type of transaction.
    const saleOperationDescription:ITransactionOperationDescription[] = [];
    const productDevolutionDescription:ITransactionOperationDescription[] = [];
    const productRepositionDescription:ITransactionOperationDescription[] = [];


    // Inventory after sale
    const updateInventory = productInventory.map((product) => {return {...product};});

    //Extracting information from the selling process.
    // Sale
    productSale.forEach((product) => {
      saleOperationDescription.push({
        id_transaction_description: uuidv4(),
        price_at_moment: product.price,
        amount: product.amount,
        id_route_transaction: saleOperation.id_transaction,
        id_product: product.id_product,
      });

      const index:number = updateInventory
        .findIndex(currentProduct => {return currentProduct.id_product === product.id_product; });
      if(index === -1) {
        /* Do nothing */
      } else {
        console.log("Amount: ", updateInventory[index].amount - product.amount)
        updateInventory[index] = {
          ...updateInventory[index],
          amount: updateInventory[index].amount - product.amount,
        };
      }
    });

    // Product devolution
    productDevolution.forEach((product) => {
      productDevolutionDescription.push({
        id_transaction_description: uuidv4(),
        price_at_moment: product.price,
        amount: product.amount,
        id_route_transaction: productDevolutionOperation.id_transaction,
        id_product: product.id_product,
      });
    });

    // Product reposition
    productReposition.forEach((product) => {
      productRepositionDescription.push({
        id_transaction_description: uuidv4(),
        price_at_moment: product.price,
        amount: product.amount,
        id_route_transaction: productRepositionOperation.id_transaction,
        id_product: product.id_product,
      });

      const index:number = updateInventory
      .findIndex(currentProduct => {currentProduct.id_product === product.id_product; });

      if(index === -1) {
        /* Do nothing */
      } else {
        updateInventory[index].amount = updateInventory[index].amount - product.amount;
      }
    });

    if (saleOperationDescription[0] !== undefined) {
      /* There was a movement in concept of sale. */
      await insertTransaction(saleOperation);
      await insertTransactionOperationDescription(saleOperationDescription);
    }

    if (productDevolutionDescription[0] !== undefined) {
      /* There was a movement in concept of devolution. */
      await insertTransaction(productDevolutionOperation);
      await insertTransactionOperationDescription(productDevolutionDescription);
    }

    if (productRepositionDescription[0] !== undefined) {
      /* There was a movement in concept of reposition. */
      await insertTransaction(productRepositionOperation);
      await insertTransactionOperationDescription(productRepositionDescription);
    }

    // Updating inventory
    /*
      Sales and product reposition will directly be substracted from the inventory
      (the outflow of these concepts impact to the inventory).

      In the other hand, the product devolutions will not have any effect in the inventory,
      in this case, this movements will be gathered until the end of shift to calculate an
      inventory to determine the "product devolution inventory".
    */
    // Updating redux context
    console.log("redux context")
    dispatch(updateProductsInventory(updateInventory));
    
    console.log("products")

    // Updating embedded database
    await updateProducts(updateInventory);

    // Updating the status of the store
    const foundStore:(IStore&IStoreStatusDay|undefined)
      = stores.find(store => store.id_store === currentOperation.id_item);

    console.log("Updating store")
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
    dispatch(setNextOperation());
    console.log("Go to route menu")
    navigation.navigate('routeOperationMenu');
  };

  const handlerOnFailedCompletionSale = () => {
    // Updating the status of the store

    // Moving to the next operation
    dispatch(setNextOperation());
    navigation.navigate('routeOperationMenu');
  };

  const handlerOnPrintTicket = () => {
    console.log('Printing ticket');
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
