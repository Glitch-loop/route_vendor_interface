import React, { useState } from 'react';
import { View, Text, Pressable, VirtualizedList } from 'react-native';
import tw from 'twrnc';
import {
  IProductInventory,
  IRouteTransaction,
  IRouteTransactionOperation,
  IRouteTransactionOperationDescription,
  IStore,
} from '../../interfaces/interfaces';

// Redux context.
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Utils
import DAYS_OPERATIONS from '../../lib/day_operations';

// Components
import SectionTitle from '../SalesLayout/SectionTitle';
import SummarizeFormat from './SummarizeFormat';
import TotalsSummarize from '../SalesLayout/TotalsSummarize';

// Services
import { printTicketBluetooth, getPrinterBluetoothConnction } from '../../services/printerService';
import { getTicketSale } from '../../utils/saleFunction';
import DangerButton from '../generalComponents/DangerButton';
import { updateTransation } from '../../queries/SQLite/sqlLiteQueries';
import ActionDialog from '../ActionDialog';
import VendorConfirmation from '../VendorConfirmation';
import ConfirmationBand from '../ConfirmationBand';

function convertOperationDescriptionToProductInventoryInterface(
  routeTransactionOperationDescription:IRouteTransactionOperationDescription[]|undefined,
  productInventory: IProductInventory[],
):IProductInventory[] {
  if (routeTransactionOperationDescription === undefined) {
    return [];
  } else {
    return routeTransactionOperationDescription.map((transactionDescription) => {
      const product:IProductInventory = {
        id_product: transactionDescription.id_product,
        product_name: '',
        barcode: '',
        weight: '',
        unit: '',
        comission: 0,
        price: transactionDescription.price_at_moment,
        product_status: 1,
        order_to_show: 0,
        amount: transactionDescription.price_at_moment,
      };

      const foundProduct = productInventory
        .find(currentProduct => { return currentProduct.id_product === transactionDescription.id_product;});

      /* Completing missing spaces */
      if (foundProduct === undefined) {
        /* Do nothing */
      } else {
        product.product_name =    foundProduct.product_name;
        product.barcode =         foundProduct.barcode;
        product.weight =          foundProduct.weight;
        product.unit =            foundProduct.unit;
        product.comission =       foundProduct.comission;
        product.product_status =  foundProduct.product_status;
        product.order_to_show =   foundProduct.order_to_show;
      }

      return product;
    });
  }
}

function getConceptTransactionOperation(idTransactionOperationType:string,
  routeTransactionOperations:IRouteTransactionOperation[]):string {
    let idTransactionOperation = '';

    /*
      Find the operation between all the operations of the transaction according with the
      operation type.

      Remember that at the moment (10-13-24), there are only 3 types of operation that a
      transaction can have:
        - Devolution
        - Reposition
        - Sale
    */
    const foundTransactionOperation = routeTransactionOperations
      .find(transactionOperation => {
          return transactionOperation.id_route_transaction_operation_type ===
          idTransactionOperationType; });

    if (foundTransactionOperation === undefined) {
      /* Do nothing */
    } else {
      idTransactionOperation = foundTransactionOperation.id_route_transaction_operation;
    }

    return idTransactionOperation;
  }

const SummarizeTransaction = ({
  routeTransaction,
  routeTransactionOperations,
  routeTransactionOperationDescriptions,
}:{
  routeTransaction:IRouteTransaction,
  routeTransactionOperations:IRouteTransactionOperation[],
  routeTransactionOperationDescriptions: Map<string,IRouteTransactionOperationDescription[]>,
}) => {
  /* Declaring redux context */
  const productInventory = useSelector((state: RootState) => state.productsInventory);
  const stores = useSelector((state: RootState) => state.stores);
  const vendor = useSelector((state: RootState) => state.user);
  /*
    Declaring states to store the movements for each operations.
    At the moment there are only 3 type of operations that a transaction can contain.

    In the declaration of each state, first it is gotten the specific id of the operation according to the type of the state;
    In the first state it is asked for the ID of the operation of the type operation devolution.

    Once the ID is gotten, it is used to get the "description" (or movements) of the operation, this consulting to the map that contains
    all the movements of all the operation of the trasnaction.

    Once it was retrieved the movements for the specific operation, it is converted to the interface that it comes to the IproductIvnetory
    interface.

  */
  const [currentTransaction, setCurrentTransaction] = useState<IRouteTransaction>(routeTransaction);

  const [productsDevolution, setProductsDevolution] =
    useState<IProductInventory[]>(
      convertOperationDescriptionToProductInventoryInterface(
        routeTransactionOperationDescriptions
        .get(getConceptTransactionOperation(DAYS_OPERATIONS.product_devolution, routeTransactionOperations)),
        productInventory)
      );

  const [productsReposition, setProductsReposition] =
    useState<IProductInventory[]>(
      convertOperationDescriptionToProductInventoryInterface(
        routeTransactionOperationDescriptions
        .get(getConceptTransactionOperation(DAYS_OPERATIONS.product_reposition, routeTransactionOperations)),
        productInventory)
    );

  const [productsSale, setProductSale] =
    useState<IProductInventory[]>(
      convertOperationDescriptionToProductInventoryInterface(
        routeTransactionOperationDescriptions
        .get(getConceptTransactionOperation(DAYS_OPERATIONS.sales, routeTransactionOperations)),
        productInventory)
      );

  // States regarded to the logic of the component
  const [showDialog, setShowDialog] = useState<boolean>(false);

  // Handlers
  const handleOnPrint = async () => {
    try {
      console.log("print")
      const foundStore:IStore|undefined =
        stores.find((store) => {return store.id_store === routeTransaction.id_store;});

      await printTicketBluetooth(
        getTicketSale(
          productsDevolution,
          productsReposition,
          productsSale,
          routeTransaction,
          foundStore,
          vendor
        ));
    } catch(error) {
      await getPrinterBluetoothConnction();
    }
  };

  const handleOnCancelASale = async () => {
    try {
      const updateTransaction:IRouteTransaction = {
        ...currentTransaction,
        state: 0,
      };
      await updateTransation(updateTransaction);
      setCurrentTransaction(updateTransaction);
      setShowDialog(false);
    } catch (error) {
      setCurrentTransaction(currentTransaction);
      setShowDialog(false);
    }
  };

  const handleOnStartASale = async () => {

  };

  const handleOnShowDialog = () => {
    setShowDialog(true);
  };

  const handleOnCancelShowDialog = () => {
    setShowDialog(false);
  };

  return (
    <View style={tw`w-full flex flex-row justify-center pt-7`}>
      <ActionDialog
        visible={showDialog}
        onAcceptDialog={() => {handleOnCancelASale();}}
        onDeclinedialog={() => {handleOnCancelShowDialog();}}>
          <Text style={tw`text-black text-xl text-center`}>
            ¿Estas seguro de cancelar la venta?
          </Text>
      </ActionDialog>
      <View style={tw`w-full flex flex-row justify-center pt-7`}>
        <View style={tw`absolute -top-0 -right-3 z-10 mr-3 mb-6`}>
          <DangerButton
            iconName={'trash'}
            onPressButton={() => {handleOnShowDialog();}}/>
        </View>
        <View style={tw`w-11/12 
          ${currentTransaction.state ? 'bg-amber-300' : 'bg-amber-200'} 
          border p-2 flex flex-col justify-center items-center rounded-md`}>
          <View style={tw`w-full flex flex-col`}>
            <SectionTitle
              title={`Operation - ${routeTransaction.date}`}
              caption={currentTransaction.state ? '' : '(Cancelada)'}
              titlePositionStyle={'text-center w-full items-center justify-center'}/>
            {/* Product devolution section */}
            <SectionTitle
              title={'Devolución de producto'}
              caption={''}
              titlePositionStyle={'text-center w-full items-center justify-center'}
            />
            <SummarizeFormat
              arrayProducts={productsDevolution}
              totalSectionCaptionMessage={'Valor total de devolución: '}/>
            <View style={tw`w-full border`}/>
            {/* Product reposition section */}
            <SectionTitle
              title={'Reposición de producto'}
              caption={''}
              titlePositionStyle={'text-center w-full flex flex-row justify-center'}
              />
            <SummarizeFormat
              arrayProducts={productsReposition}
              totalSectionCaptionMessage={'Valor total de reposición: '}/>
            <View style={tw`w-full border`}/>
            {/* Product sale section */}
            <SectionTitle
              title={'Venta'}
              caption={''}
              titlePositionStyle={'text-center w-full flex flex-row justify-center'}
              />
            <SummarizeFormat
              arrayProducts={productsSale}
                  totalSectionCaptionMessage={'Total venta: '}/>
            <View style={tw`w-full border`}/>
            {/* Totals sections */}
            <TotalsSummarize
                productsDevolution={productsDevolution}
                productsReposition={productsReposition}
                productsSale={productsSale}
            />
            <View style={tw`w-full flex flex-row`}>
              <ConfirmationBand
                textOnAccept={'Iniciar venta a partir de esta'}
                textOnCancel={'Imprimr'}
                handleOnAccept={() => {handleOnStartASale();}}
                handleOnCancel={() => {handleOnPrint();}}
                styleOnCancel={'bg-blue-500'}
                />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SummarizeTransaction;
