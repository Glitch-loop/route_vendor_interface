// Libraries
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, BackHandler, Pressable } from 'react-native';
import 'react-native-get-random-values'; // Necessary for uuid
import tw from 'twrnc';

// Queries
// Embedded database
import {
  getInventoryOperation,
  getInventoryOperationDescription,
  getProducts,
  getAllInventoryOperations,
  getRouteTransactionByStore,
  getRouteTransactionOperations,
  getRouteTransactionOperationDescriptions,
} from '../queries/SQLite/sqlLiteQueries';

// Redux context
import { useSelector, useDispatch } from 'react-redux';
import store, { RootState, AppDispatch } from '../redux/store';
import { setDayGeneralInformation } from '../redux/slices/routeDaySlice';
import { addProductsInventory, setProductInventory, updateProductsInventory } from '../redux/slices/productsInventorySlice';
import { setStores } from '../redux/slices/storesSlice';
import {
  setArrayDayOperations,
  setDayOperation,
  setDayOperationBeforeCurrentOperation,
} from '../redux/slices/dayOperationsSlice';
import { setCurrentOperation } from '../redux/slices/currentOperationSlice';

// Components
import RouteHeader from '../components/RouteHeader';
import TableInventoryOperations from '../components/InventoryComponents/TableInventoryOperations';
import VendorConfirmation from '../components/VendorConfirmation';
import TableInventoryVisualization from '../components/InventoryComponents/TableInventoryVisualization';
import TableInventoryOperationsVisualization from '../components/InventoryComponents/TableInventoryOperationsVisualization';
import Icon from 'react-native-vector-icons/FontAwesome';

// Interfaces
import {
  ICurrency,
  IProductInventory,
  IRouteDayStores,
  IStore,
  IDayGeneralInformation,
  IDay,
  IRouteDay,
  IRoute,
  IDayOperation,
  IInventoryOperation,
  IInventoryOperationDescription,
  IStoreStatusDay,
  IRouteTransaction,
  IRouteTransactionOperation,
  IResponse,
  IProduct,
 } from '../interfaces/interfaces';

// Utils
import DAYS_OPERATIONS from '../lib/day_operations';
import TableCashReception from '../components/InventoryComponents/TableCashReception';
import { calculateNewInventoryAfterAnInventoryOperation, initialMXNCurrencyState } from '../utils/inventoryOperations';
import { addingInformationParticularFieldOfObject, convertingDictionaryInArray } from '../utils/generalFunctions';
import {
  apiResponseProcess,
  apiResponseStatus,
  getDataFromApiResponse,
} from '../utils/apiResponse';
import Toast from 'react-native-toast-message';

import { cleanAllRecordsToSyncFromDatabase, syncingRecordsWithCentralDatabase } from '../services/syncService';

// Controllers
import {
  getTitleOfInventoryOperation,
  createInventoryOperation,
  createVendorInventory,
  cleanAllInventoryOperationsFromDatabase,
  updateVendorInventory,
  setVendorInventory,
  cancelCreationOfInventoryOperation,
  getProductForInventoryOperation,
  getCurrentVendorInventory,
  getInventoryOperationForInventoryVisualization,
  getAllInventoryOperationsForInventoryVisualization,
  getTotalInventoriesOfAllStoresByIdOperationType,
  getTotalInventoryOfAllTransactionByIdOperationType,
  desactivateInventoryOperation,
  cancelDesactivateInventoryOperation,

} from '../controllers/InventoryController';

import {
  cancelWorkDayUpdate,
  cleanWorkdayFromDatabase,
  createWorkDay,
  finishWorkDay,
} from '../controllers/WorkDayController';

import {
  cleanAllStoresFromDatabase,
  createListOfStoresOfTheRouteDay,
  getStoresOfRouteDay,
} from '../controllers/StoreController';

import {
  appendDayOperation,
  cleanAllDayOperationsFromDatabase,
  createDayOperationBeforeTheCurrentOperation,
  createDayOperationConcept,
  createListOfDayOperations,
  setDayOperations,
} from '../controllers/DayOperationController';

import { cleanAllRouteTransactionsFromDatabase } from '../controllers/SaleController';

// Definitions
const settingOperationDescriptions:any = {
  showErrorMessage: true,
  toastTitleError: 'Error durante la consulta de la operación de inventario',
  toastMessageError: 'Ha habido un error durante la consulta, no se ha podido recuperar parte de las operaciones de inventario, por favor intente nuevamente',
};
const settingAllInventoryOperations:any = {
  showErrorMessage: true,
  toastTitleError:'Error al mostrar inventario final',
  toastMessageError: 'Ha habido un error durante la consulta de las operaciones de inventario del dia, por favor intente nuevamente',
};
const settingOperationDescriptionsFinalInventory:any = {
  showErrorMessage: true,
  toastTitleError:'Error en mostrar el inventario final',
  toastMessageError: 'Ha habido un error durante la consulta de las operaciones que componen el inventario final, por favor intente nuevamente',
};
const settingFinalInventoryByStores:any = {
  showErrorMessage: true,
  toastTitleError:'Error al mostrar inventario final',
  toastMessageError: 'Ha habido un error durante la consulta de los movimientos de producto por tienda',
};
const settingResponseProducts:any = {
  showErrorMessage: true,
  toastTitleError: 'Error durante la consulta de productos',
  toastMessageError: 'Ha habido un error durante la consulta de los productos, por favor intente nuevamente',
};


const InventoryOperationLayout = ({ navigation }:{ navigation:any }) => {
  // Defining redux context
  const dispatch:AppDispatch = useDispatch();
  const productsInventory = useSelector((state: RootState) => state.productsInventory);
  const dayOperations = useSelector((state: RootState) => state.dayOperations);
  const routeDay = useSelector((state: RootState) => state.routeDay);
  const currentOperation = useSelector((state: RootState) => state.currentOperation);
  const stores = useSelector((state: RootState) => state.stores);

  // Defining states
  /* States related to 'movements' in the operation. */
  const [inventory, setInventory] = useState<IProductInventory[]>([]);
  const [cashInventory, setCashInventory] = useState<ICurrency[]>(initialMXNCurrencyState());

  /* States related to the recommendation for the inventory to be taken. */
  const [suggestedProduct, setSuggestedProduct] = useState<IProductInventory[]>([]);

  /*
    Current inventory state stores the vendor's inventory (the inventory that currently has the
    vendor).
  */
  const [currentInventory, setCurrentInventory] = useState<IProductInventory[]>([]);

  /* States related to the configuration for inventory operation visualization. */
  const [initialShiftInventory, setInitialShiftInventory] = useState<IProductInventory[]>([]);
  const [restockInventories, setRestockInventories] = useState<IProductInventory[][]>([]);
  const [finalShiftInventory, setFinalShiftInventory] = useState<IProductInventory[]>([]);
  const [productRepositionTransactions, setProductRepositionTransactions]
    = useState<IProductInventory[]>([]);
  const [productSoldTransactions, setProductSoldTransactions] = useState<IProductInventory[]>([]);

  const [inventoryWithdrawal, setInventoryWithdrawal] = useState<boolean>(false);
  const [inventoryOutflow, setInventoryOutflow] = useState<boolean>(false);
  const [finalOperation, setFinalOperation] = useState<boolean>(false);
  const [issueInventory, setIssueInventory] = useState<boolean>(false);
  const [isInventoryOperationModifiable, setIsInventoryOperationModifiable] = useState<boolean>(false);

  /* States related to the layout logic */
  const [isOperation, setIsOperation] = useState<boolean>(true);

  /* States for route transaction operations */
  const [productSoldByStore, setProductSoldByStore] = useState<IProductInventory[][]>([]);
  const [productRepositionByStore, setProductRepositionByStore] = useState<IProductInventory[][]>([]);
  const [nameOfStores, setNameOfStores] = useState<string[]>([]);

  // State used for the logic of the component
  const [isInventoryAccepted, setIsInventoryAccepted] = useState<boolean>(false);
  const [isOperationToUpdate, setIsOperationToUpdate] = useState<boolean>(false);

  // Use effect operations
  useEffect(() => {
    /*
      If the current operation contains an item, that means the user is consulting
      a previous inventory operation.
    */

    /* Getting the available products for the inventory operation */
    getProductForInventoryOperation()
    .then((response:IResponse<IProductInventory[]>) => {
      setInventory(getDataFromApiResponse(response));
    })
    .catch(() => { setInventory([]); });

    // Dertermining if the current process is an inventory visualization or and inventory operation
    if (currentOperation.id_item) { // It is an inventory operation visualization.
      let currentProductInventory:IProductInventory[] = [];

      // Variables used for final shift inventory
      const startShiftInventoryProduct:IProductInventory[][] = [];
      const restockInventoryProduct:IProductInventory[][] = [];

      /*
        Since it is an visualization, it is need to 'reset' the states related to
        'inventory operations'.
      */
      setCurrentInventory([]);
      setInventory([]);
      setIsOperation(false);


      // Retrieving the inventory operation.
      getInventoryOperationForInventoryVisualization(currentOperation.id_item)
      .then(async (responseInventoryOperationProducts) => {
        const inventoryOperationProducts:IProductInventory[] = apiResponseProcess(
          responseInventoryOperationProducts,
          settingOperationDescriptions
        );

        /*
          Depending on the type of inventory operation selected by the vendor, the necessary
          actions must be taken to display the information correctly.
        */

        // Reseting setting for product visualization
        setInventoryWithdrawal(false);
        setInventoryOutflow(false);
        setFinalOperation(false);
        setIssueInventory(false);

        if (currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
          setInitialShiftInventory(inventoryOperationProducts);
          setRestockInventories([]);
          setFinalShiftInventory([]);
        } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory
        || currentOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
          setInitialShiftInventory([]);
          setRestockInventories([inventoryOperationProducts]);
          setFinalShiftInventory([]);
        } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) {
          // Variables used by the process.
          let inventoryOperations:IInventoryOperation[] = [];
          // let productInventoryOfInventoryOperation:IProductInventory[] = [];

          setInventoryWithdrawal(true);
          setInventoryOutflow(true);
          setFinalOperation(true);
          setIssueInventory(true);
          /*
            End shift inventory is an special case. This inventory visualization intends to show
            the summarize of all the inventory operations that were made during the route.

            In this way, it is needed to get all the inventory operations of the day (inflow and remaining of product):
            - Initial inventory
            - Re-stock inventory
            - Final invnetory

            And also, it is needed to retrieve the outflow of product:
              - product reposition transactions
              - selling transactions

            Product devolution is not included becuase it is considered as another inventory out
            of the product inventory of the day.
          */

          // Get all the inventory operations
          inventoryOperations = apiResponseProcess(
            await getAllInventoryOperationsForInventoryVisualization(),
            settingAllInventoryOperations
          );

          const mapInventoryOperationRequests = inventoryOperations
          .map(async (inventoryOperation) => {
            const {
              id_inventory_operation,
              id_inventory_operation_type,
              state,
            } = inventoryOperation;

            if (state === 1) {
              const resultGetInventoryOperation:IResponse<IProductInventory[]> = await getInventoryOperationForInventoryVisualization(id_inventory_operation);
              const inventoryOperationInformation:IProductInventory[] = getDataFromApiResponse(
                resultGetInventoryOperation
              );
  
              // Determining where to store the information of the current inventory operation.
              if (id_inventory_operation_type === DAYS_OPERATIONS.start_shift_inventory) {
                startShiftInventoryProduct.push(inventoryOperationInformation);
              } else if (id_inventory_operation_type === DAYS_OPERATIONS.restock_inventory) {
                restockInventoryProduct.push(inventoryOperationInformation);
              } else {
                /* Other case of operations are ignored */
              }
            } else {
              /* "Inactive" inventory operations will not be processed. */
            }
          });

          await Promise.all(mapInventoryOperationRequests)
          .then(() => {
            // Storing information related to the inventory operations
            if (startShiftInventoryProduct.length > 0) {
              setInitialShiftInventory(startShiftInventoryProduct[0]);
            } else {
              setInitialShiftInventory([]);
            }
            setRestockInventories(restockInventoryProduct);

            // This information is retrieved with the "currentOperation" state.
            setFinalShiftInventory(currentProductInventory);
          });


          // Get the "inventory" of the "route transactions".
          /*
            Route transactions and invnetory transactions have their own format, but
            route transactions can be "formatted" to "inventory operation"
          */
          /*
            The information of this section is used for two purposes:
            - Summarize of all the day.
            - Summarize by store of the day.
          */

          // Information of the day
          getTotalInventoryOfAllTransactionByIdOperationType(
            DAYS_OPERATIONS.product_reposition)
            .then((response:IProductInventory[]) => {
              setProductRepositionTransactions(response); });

          getTotalInventoryOfAllTransactionByIdOperationType(
            DAYS_OPERATIONS.product_reposition)
            .then((response:IProductInventory[]) => {
              setProductSoldTransactions(response); });

          // Information by store
          setNameOfStores(stores.map((currentStore) => {return currentStore.store_name;}));
          getTotalInventoriesOfAllStoresByIdOperationType(
            DAYS_OPERATIONS.product_reposition, stores)
          .then((response: (IStore & IStoreStatusDay & { productInventory: IProductInventory[] })[]) => {
            const totalProductRepositionOfStores:IProductInventory[][] = [];

            for(let record of response) {
              const { productInventory } = record;
              totalProductRepositionOfStores.push(productInventory);
            }
            setProductRepositionByStore(totalProductRepositionOfStores);
          })
          .catch(() => {
            setProductRepositionByStore([]);
          });

          getTotalInventoriesOfAllStoresByIdOperationType(DAYS_OPERATIONS.sales, stores)
          .then((response: (IStore & IStoreStatusDay & { productInventory: IProductInventory[] })[]) => {
            const totalProductSaleOfStores:IProductInventory[][] = [];

            for(let record of response) {
              const { productInventory } = record;
              totalProductSaleOfStores.push(productInventory);
            }
            setProductSoldByStore(totalProductSaleOfStores);
          })
          .catch(() => {
            setProductSoldByStore([]);
          });

        } else {
          /* Other inventory operation */
        }

        // Determining if there is possible to make modifications to the inventory operation.
        let isCurrentInventoryOperationModifiable:boolean = false;

        const index = dayOperations.findIndex((dayOperation) => {
          return dayOperation.id_day_operation === currentOperation.id_day_operation;
        });

        if (index !== -1) {
          if (currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) {
            /* End shit inventory is modificable */
            isCurrentInventoryOperationModifiable = true;
          } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
            /* Per day, there is only one product devolution inventory, so
            it is modificable */
            isCurrentInventoryOperationModifiable = true;
          }
          else {
            // Verifying it is the last inventory operation (excluding product devolution inventory)
            let isNextOperationCurrentOne:boolean = false;
            let isAnotherInventoryOperationAbove:boolean = false;
            if (dayOperations[index + 1].current_operation === 1) {
              isNextOperationCurrentOne = true;
            } else {
              isNextOperationCurrentOne = false;
            }

            // Checking if there is another inventory operation above.
            for(let i = index + 1; i < dayOperations.length; i++) {
              const dayOperation:IDayOperation = dayOperations[i];
              if (dayOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
                isAnotherInventoryOperationAbove = true;
              } else if(dayOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
                isAnotherInventoryOperationAbove = true;
              } else if(dayOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) {
                isAnotherInventoryOperationAbove = true;
              } else {
                /* Other operations that doesn't affetc */
              }
            }

            if(isAnotherInventoryOperationAbove === false && isNextOperationCurrentOne === true) {
              isCurrentInventoryOperationModifiable = true;
            } else {
              isCurrentInventoryOperationModifiable = false;
            }
          }
        } else {
          /* It means the record was not found in the array. */
          isCurrentInventoryOperationModifiable = false;
        }

        if(isCurrentInventoryOperationModifiable === true) {
          setIsInventoryOperationModifiable(true);
        } else {
          setIsInventoryOperationModifiable(false);
        }
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          text1: 'Error durante la recuperación de la operacion de inventario.',
          text2: 'Ha ocurrido un error durante la recuperación de la operación de inventario.',
        });
      });

    } else { // It is a new inventory operation
      /*
        It is a product inventory operation.

        Although there are 4 types of product inventory operations, it doesn't really matter which operation is currently made,
        all of them will imply a 'product' movement, so it is needed the complete list with all the products.

        Inventory operations:
        - Start shift inventory
        - Re-stock inventory
        - Product devolution inventory
        - Final shift inventory

        In addition, we don't know which product the vendor is going to take to the route, or which one is going to
        bring back from the route, so the better option is to dipose the list of all the products.
      */

      if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
        /* If it is a restock inventory operation, it is needed to get the current inventory */
        getCurrentVendorInventory()
        .then((allProducts:IProductInventory[]) => {setCurrentInventory(allProducts);})
        .catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Error durante la creación de la operación de inventario.',
            text2: 'Ha habido un error al momento de obtener el producto para la operación de inventario.',
          });
          setCurrentInventory([]);
        });
      } else {
        setCurrentInventory([]);
      }

      /* State for determining if it is a product inventory operation or if it is an operation. */
      setIsOperation(true);
    }

    // Determining where to redirect in case of the user touch the handler "back handler" of the phone
    const backAction = () => {
      if (currentOperation.id_type_operation === '') {
        navigation.navigate('selectionRouteOperation');
      } else {
        navigation.navigate('routeOperationMenu');
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentOperation, stores, navigation]);

  // Handlers
  const handlerGoBack = () => {
    /*
      According with the workflow of the system, the system identify if the user is making the first "inventory
      operation" of the day (referring to "Start shift inventory operation") when the current operation is undefined.

      In this case, the navigation should return to the select inventory reception.

      Following the scenario below, once the user finishes the first operation, all of the following operations
      should return to the route menu.
    */
    if (currentOperation.id_type_operation === '') {
      navigation.navigate('selectionRouteOperation');
    } else {
      navigation.navigate('routeOperationMenu');
    }
  };

  const handlerReturnToRouteMenu = async ():Promise<void> => {
    navigation.navigate('routeOperationMenu');
  };

  const handleVendorConfirmation = async ():Promise<void> => {
    // By default it is considered that the process is going to fail.
    let processResult:boolean = false;
    try {
      /* Avoiding re-executions in case of inventory */
      if (isInventoryAccepted === true) {
        return;
      }

      setIsInventoryAccepted(true);
      /*
        There are 3 types of inventory operations:
        - Start shift inventory: Unique in the day.
        - Re-stock inventory: It might be several ones.
        - End shift inventory: Unique in the day.
          - This inventory operation is subdivided into 2 inventory type
            - Devolutions
            - Remainded products
      */

      if (isOperationToUpdate) {
        /*
          When an inventory is "updated", the original inventory is kept stored and a new one is created.
        */

          // Determining the type of inventory operation.
        /*
          Notes:
            For "start shift inventory operation" it is only allowed to modify the product not the
            "petty cash".
        */
       console.log("Operation to update")
        let movementOfInventoryOperationToModify:IProductInventory[] = [];
        let resultDayOperation:IResponse<IDayOperation>;
        let newDayOperation:IDayOperation;
        let currentInventoryToModify:IProductInventory[] = productsInventory;

        // Retriving the movements of the inventory operation to modify.
        if (currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
          movementOfInventoryOperationToModify = initialShiftInventory;
          //currentInventoryToModify = productsInventory;
        } else if(currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory
        || currentOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
          movementOfInventoryOperationToModify = restockInventories[0];
        } else if(currentOperation.id_day_operation === DAYS_OPERATIONS.end_shift_inventory) {
          movementOfInventoryOperationToModify = finalShiftInventory;
        }

        // Inventory operations.
        console.log("Creating inventory operation: ", routeDay)
        const resultCreateInventoryOperation:IResponse<IInventoryOperation>
        = await createInventoryOperation(
          routeDay,
          inventory,
          currentOperation.id_type_operation
        );
        const inventoryOperation = getDataFromApiResponse(resultCreateInventoryOperation);

        console.log("Desactivatin inventory operation")
        const resultDesactivateInventoryOperation:IResponse<IInventoryOperation> 
        = await desactivateInventoryOperation(currentOperation.id_item);

        /* Updating vendor inventory */
        console.log("Update vendor's inventory operation")
        const resultSubstractVendorPastInventoryOperation:IResponse<IProductInventory[]>
        = await updateVendorInventory(
          currentInventoryToModify,
          movementOfInventoryOperationToModify,
          true
        );

        const substractedInventory:IProductInventory[] =  getDataFromApiResponse(
          resultSubstractVendorPastInventoryOperation
        );

        const resultAddVendorInventoryOperation:IResponse<IProductInventory[]>
        = await updateVendorInventory(
          substractedInventory,
          inventory,
          false
        );

        const newVendorInvnetory:IProductInventory[] = getDataFromApiResponse(
          resultAddVendorInventoryOperation
        );

        console.log("Current inventory++++++++++++++++++++++++++++++")
        currentInventoryToModify.forEach((item) => {
          console.log("product: ", item.id_product, " - amount: ", item.amount,  " - order: ", item.order_to_show)
        })
        console.log("Inventory of the operation to modify+++++++++++++++++++++")
        movementOfInventoryOperationToModify.forEach((item) => {
          console.log("product: ", item.product_name, " - amount: ", item.amount,  " - order: ", item.order_to_show)
        })

        console.log("SUBSTRACTED INVENTORY+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*")
        substractedInventory.forEach((item) => {
          console.log("product: ", item.product_name, " - amount: ", item.amount,  " - order: ", item.order_to_show)
        })

        console.log("Inventory of the operation+++++++++++++++++++++++++")
        inventory.forEach((item) => {
          console.log("product: ", item.product_name, " - amount: ", item.amount,  " - order: ", item.order_to_show)
        })

        console.log("Final inventory+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*")
        newVendorInvnetory.forEach((item) => {
          console.log("product: ", item.product_name, " - amount: ", item.amount,  " - order: ", item.order_to_show)
        })

        // newVendorInventory

        /*Adding day operation */
        /*
          Depending on the type of operation is how the new day operation will be included in the
          day operation list.
        */
        console.log("Adding inventory operation day")
        if(currentOperation.id_day_operation === DAYS_OPERATIONS.end_shift_inventory) {
          resultDayOperation = await appendDayOperation(inventoryOperation);
          newDayOperation = getDataFromApiResponse(resultDayOperation);
        } else {
          resultDayOperation = await createDayOperationBeforeTheCurrentOperation(
            inventoryOperation
          );
          newDayOperation = getDataFromApiResponse(resultDayOperation);
        }

        console.log(apiResponseStatus(resultCreateInventoryOperation, 201))
        console.log(apiResponseStatus(resultDesactivateInventoryOperation, 200))
        console.log(apiResponseStatus(resultSubstractVendorPastInventoryOperation, 200))
        console.log(apiResponseStatus(resultAddVendorInventoryOperation, 200))
        console.log(apiResponseStatus(resultDayOperation, 201))

        if (apiResponseStatus(resultCreateInventoryOperation, 201)
          && apiResponseStatus(resultDesactivateInventoryOperation, 200)
          && apiResponseStatus(resultSubstractVendorPastInventoryOperation, 200)
          && apiResponseStatus(resultAddVendorInventoryOperation, 200)
          && apiResponseStatus(resultDayOperation, 201)) {
          /* The process has been finished successfully */
          /* Updating redux states */
          dispatch(updateProductsInventory(newVendorInvnetory));

          // Store the information (new operation) in redux context.
          dispatch(setDayOperationBeforeCurrentOperation(newDayOperation));

          // Executing a synchronization process to register the start shift inventory
          // Note: In case of failure, the background process will eventually synchronize the records.
          syncingRecordsWithCentralDatabase();

          Toast.show({
            type: 'success',
            text1: 'Se ha actualizado el inventario correctamente.',
            text2: 'El proceso para actualizar el inventario ha sido completado exitosamente.',
          });

          processResult = true;
        } else {
          /*
            Something was wrong during the creation of the 'route day' or
            during the registration of the inventory operation.

            According with the workflow, it is not possible to start a new work day if it is missing
            information, therefore it is needed to delete (or clean) the database and start again.
          */

          Toast.show({
            type: 'error',
            text1: 'Ha habido un error durante el registro del inventario.',
            text2: 'Ha sucedido un error durante el registro del inventario, por favor intente nuevamente.',
          });

            // Keeping the vendor's inventory to the previous state (before the current inventory operation).
            setVendorInventory(currentInventory);

            // Canceling inventory operation
            cancelCreationOfInventoryOperation(inventoryOperation);

            // Ensuring that the new day operation don't appear in the list of actions.
            setDayOperations(dayOperations);

            // Cancel the desacivation of inventory operation.
            cancelDesactivateInventoryOperation(currentOperation.id_item);

          processResult = false;
        }

        if (processResult) {
          navigation.reset({
            index: 0, // Set the index of the new state (0 means first screen)
            routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
          });

          navigation.navigate('routeOperationMenu');
        }
      } else {
        // Determining the type of inventory operation.
        if (currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
          /*
            According with the flow, when vendor accepts the 'initial inventory' he is
            acception to make the current 'work day'*.
  
            It is needed to retrieve and process the following information to create the
            work day:
              - route: Information related to the route identification.
              - day: The information of the day.
              - routeDay: Information that relates the day to perform and the route.

            Work day: This concept refers to all the "general  information" needed to
            identify the "current day" as working one.
          */
          // Related to work day operations
          Toast.show({
            type: 'info',
            text1: 'Creando dia de trabajo.',
            text2: 'Registrando el dia.',
          });
          console.log("Creating work day")
          const resultCreateWorkDay = await createWorkDay(cashInventory, routeDay);
          const dayGeneralInformation:IRoute&IDayGeneralInformation&IDay&IRouteDay
            = getDataFromApiResponse(resultCreateWorkDay);

          Toast.show({
            type: 'info',
            text1: 'Comenzando registro de inventario inicial.',
            text2: 'Registrando inventario inicial y consultando información para la ruta.',
          });

          console.log("Creating stores list")
          // Stores operations
          const resultCreateListStoreOfRouteDay = await createListOfStoresOfTheRouteDay(
            dayGeneralInformation
          );
          const resulGetStoresOfRouteOfRouteDay = await getStoresOfRouteDay(dayGeneralInformation);

          const arrListStoreOfRouteDay:(IStore&IStoreStatusDay)[]
            = getDataFromApiResponse(resultCreateListStoreOfRouteDay);

          const arrStoresOfRouteDay:IRouteDayStores[]
            = getDataFromApiResponse(resulGetStoresOfRouteOfRouteDay);

          console.log("Creating inventory operation")
          // Inventory operations.
          const resultCreateInventoryOperation = await createInventoryOperation(
            dayGeneralInformation,
            inventory,
            currentOperation.id_type_operation
          );

          const inventoryOperation = getDataFromApiResponse(resultCreateInventoryOperation);

          console.log("Creating vendor inventory")
          /* This inventory is what will be used to perform calculation */
          const resultCreateVendorInventoryOperation = await createVendorInventory(inventory);

          console.log("Creating list")
          // Related to day operations
          /*
            For this operation it is needed to create:
              - A day operation for the start shift inventory operation.
              - A day for each store in the route day.
          */
          const resultCreateListOfDayOperations = await createListOfDayOperations(
            inventoryOperation, arrStoresOfRouteDay
          );

          const arrDayOperations:IDayOperation[] = getDataFromApiResponse(
            resultCreateListOfDayOperations
          );
        /*
          At this point the records needed to start a database have been created.
          In the workflow of the application, the first operation has been completed (starting
          shift inventory), so it is needed to advance to the next operation (first store of
          the route).
        */
          console.log("Verifying all is ok")
        if (apiResponseStatus(resultCreateWorkDay, 201)
        && apiResponseStatus(resultCreateListStoreOfRouteDay, 201)
        && apiResponseStatus(resultCreateInventoryOperation, 201)
        && apiResponseStatus(resultCreateVendorInventoryOperation, 201)
        && apiResponseStatus(resultCreateListOfDayOperations, 201)) {
            /* The process has been finished successfully */
            /* Updating redux states */
    
            dispatch(setDayGeneralInformation(dayGeneralInformation));
            dispatch(setStores(arrListStoreOfRouteDay));
            dispatch(setProductInventory(inventory));
            dispatch(setArrayDayOperations(arrDayOperations));
    
            // Executing a synchronization process to register the start shift inventory
            // Note: In case of failure, the background process will eventually synchronize the records.
            syncingRecordsWithCentralDatabase();
    
            Toast.show({
              type: 'success',
              text1: 'Se ha registrado el inventario inicial con exito.',
              text2: 'El proceso para registrar el inventario inicial ha sido completado exitosamente.',
            });
    
            processResult = true;
          } else {
            /*
              Something was wrong during the creation of the 'route day' or
              during the registration of the inventory operation.
    
              According with the workflow, it is not possible to start a new work day if it is missing
              information, therefore it is needed to delete (or clean) the database and start again.
            */
    
            Toast.show({
              type: 'error',
              text1: 'Ha habido un error durante el registro del inventario inicial.',
              text2: 'Ha sucedido un error durante el registro del inventario inicial, por favor intente nuevamente.',
            });
    
            await cleanAllDayOperationsFromDatabase();
            await cleanAllRouteTransactionsFromDatabase();
            await cleanAllInventoryOperationsFromDatabase();
            await cleanAllStoresFromDatabase();
            await cleanAllRecordsToSyncFromDatabase();
            await cleanWorkdayFromDatabase();
    
            processResult = false;
          }
          if (processResult) {
            navigation.reset({
              index: 0, // Set the index of the new state (0 means first screen)
              routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
            });
    
            navigation.navigate('routeOperationMenu');
          } else {
            /*
              Since this is the operations of the day, it is important to ensure the integrity of
              the workflow, thus, to achieve this, it is needed to redirect the user to the main manu
              to force complete all the process again.
            */
              navigation.reset({
                index: 0, // Set the index of the new state (0 means first screen)
                routes: [{ name: 'selectionRouteOperation' }], // Array of route objects, with the route to navigate to
              });
    
              navigation.navigate('selectionRouteOperation');
          }
        } else if(currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory
        || currentOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
          /*
            Analyzing the workflow of the operations both re-stock operation and product devolution
            share great part of the process, they only differ at the end of the process;
            re-stock operation goes back to the route operation menu and product devolution
            prepare a new inventory for doing the final inventory.
          */
          Toast.show({
            type: 'info',
            text1: 'Comenzando registro de operación de inventario.',
            text2: 'Comenzado el registro de la operación de inventario.',
          });
  
          // Inventory operations
          const resultCreateInventoryOperation = await createInventoryOperation(
            routeDay,
            inventory,
            currentOperation.id_type_operation);
  
          const inventoryOperation = getDataFromApiResponse(resultCreateInventoryOperation);
  
          const resultUpdateVendorInventory = await updateVendorInventory(currentInventory, inventory, false);
  
          const resultDayOperation:IResponse<IDayOperation> =
          await createDayOperationBeforeTheCurrentOperation(inventoryOperation);
          const newDayOperation:IDayOperation = getDataFromApiResponse(resultDayOperation);
  
          if(apiResponseStatus(resultCreateInventoryOperation, 201)
          && apiResponseStatus(resultUpdateVendorInventory, 200)
          && apiResponseStatus(resultDayOperation, 201)) {
            /* There was not an error during the process. */
            /* At this point, the inventory operation has been finished and registered. */
  
            // Updating redux states.
            // Updating the the inventory with the last changes.
            dispatch(addProductsInventory(inventory));
  
            // Store the information (new operation) in redux context.
            dispatch(setDayOperationBeforeCurrentOperation(newDayOperation));
  
            if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
              /* There is not extra instructions. */
              Toast.show({
                type: 'success',
                text1: 'Se ha registrado el re-stock de producto exitosamente.',
                text2: 'Se ha agregado los productos del re-stock de producto al inventario.',
              });
  
              // Executing a synchronization process to register the start shift inventory
              // Note: In case of failure, the background process will eventually synchronize the records.
              syncingRecordsWithCentralDatabase();
            } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) { // It is an product devolution
              Toast.show({
                type: 'success',
                text1: 'Se ha registrado la devolución de producto exitosamente.',
                text2: 'Se ha registrado el inventario de devolución de producto exitosamente.',
              });
  
              /* The inventory operation was an "product devolution inventoy" */
              // Creating a new work day operation for "end shift inventory".
              let nextDayOperation:IDayOperation
                = createDayOperationConcept(
                  '', // It isn't still determined the UUID of the end shift inventory
                  DAYS_OPERATIONS.end_shift_inventory,
                  0,
                  0);
  
              // Set the new day operation as the current one.
              dispatch(setCurrentOperation(nextDayOperation));
            }
            processResult = true;
          } else {
            // Keeping the vendor's inventory to the previous state (before the current inventory operation).
            await setVendorInventory(currentInventory);
  
            // Canceling the current inventory operation
            await cancelCreationOfInventoryOperation(inventoryOperation);
  
            // Ensuring that the new day operation don't appear in the list of actions.
            await setDayOperations(dayOperations);
  
            /* The user is not being redirected to the 'RouteOperationLayout' to avoid to re-make all the operation again. */
  
            processResult = false;
          }
  
          if(processResult) {
            if (currentOperation.id_type_operation === DAYS_OPERATIONS.restock_inventory) {
              /* The inventory operation was a "restock inventory" */
              navigation.reset({
                index: 0, // Set the index of the new state (0 means first screen)
                routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
              });
              navigation.navigate('routeOperationMenu');
            } else {
              Toast.show({
                type: 'info',
                text1: 'Preparando el inventario final.',
                text2: 'Preparando información para registrar el inventario final.',
              });
              // Reseting states for making the end shift inventory.
              const newInventoryForFinalOperation = inventory.map((proudct:IProductInventory) => {
                return {
                  ...proudct,
                  amount: 0,
                };
              });
  
              setInventory(newInventoryForFinalOperation);
              setIsOperation(true);
              setIsInventoryAccepted(false); // State to avoid double-click
            }
          } else {
            /*
              In case of error, the user can make another petition to process the inventory.
              The information that is currently stored in memory can be used to try again,
              that is the reason of why it is not being redirected to the route operation menu.
            */
            setIsInventoryAccepted(false);
          }
        } else if (currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) {
          Toast.show({
            type: 'info',
            text1: 'Comenzando registro de inventario final.',
            text2: 'Registrando inventario final.',
          });
  
          const resultCreateInventory:IResponse<IInventoryOperation>
            = await createInventoryOperation(
              routeDay,
              inventory,
              currentOperation.id_type_operation
            );
          const inventoryOperation:IInventoryOperation = getDataFromApiResponse(resultCreateInventory);
  
          const resultUpdateVendorInventory:IResponse<IProductInventory[]>
            = await updateVendorInventory(currentInventory, inventory, false);
  
          /* Closing work day operation */
          Toast.show({
            type: 'info',
            text1: 'Registrando inventario final.',
            text2: 'Registrando información necesaria para cerrar el inventario final y terminar el dia correctamente.',
          });
  
          const resultFinishWorkDay:IResponse<IRoute&IDayGeneralInformation&IDay&IRouteDay>
            = await finishWorkDay(cashInventory, routeDay);
          const dayGeneralInformation:IRoute&IDayGeneralInformation&IDay&IRouteDay
            = getDataFromApiResponse(resultFinishWorkDay);
  
          const resultAppendDayOperation:IResponse<IDayOperation>
           = await appendDayOperation(inventoryOperation);
          const newDayOperation:IDayOperation
            = getDataFromApiResponse(resultAppendDayOperation);
  
          /* At this moment the final operations has been done, now it is needed to display the summarazie of all the day */
  
          if (apiResponseStatus(resultCreateInventory, 201)
            &&  apiResponseStatus(resultUpdateVendorInventory, 200)
            &&  apiResponseStatus(resultFinishWorkDay, 200)
            &&  apiResponseStatus(resultAppendDayOperation, 201)) {
  
              // Updating redux context
              dispatch(addProductsInventory(inventory));
  
              // Storing information in redux context.
              dispatch(setDayGeneralInformation(dayGeneralInformation));
  
              // Store the information (new operation) in redux context.
              dispatch(setDayOperation(newDayOperation));
  
              Toast.show({type: 'success',
                text1:'Se ha registrado el inventario final exitosamente.',
                text2: 'Se ha registrado el inventario final exitosamente.'});
  
              // Executing a synchronization process to register the start shift inventory
              // Note: In case of failure, the background process will eventually synchronize the records.
              syncingRecordsWithCentralDatabase();
  
              processResult = true;
            } else {
              /* Something was wrong during the final shift inventory */
              Toast.show({
                type: 'error',
                text1: 'Ha habido un error durnate el inventario final.',
                text2: 'Ha habido un error durante el registro de la operación del inventario final, porfavor intente nuevamente.',
              });
  
              // Keeping the vendor's inventory to the previous state (before the current inventory operation).
              setVendorInventory(currentInventory);
  
              // Canceling inventory operation
              cancelCreationOfInventoryOperation(inventoryOperation);
  
              // Ensuring that the new day operation don't appear in the list of actions.
              setDayOperations(dayOperations);
  
              // Keeping the workday status to the previous state  (before the current inventory operation).
              cancelWorkDayUpdate(routeDay);
  
              processResult = false;
            }
  
          if(processResult) {
            navigation.reset({
              index: 0, // Set the index of the new state (0 means first screen)
              routes: [{ name: 'routeOperationMenu' }], // Array of route objects, with the route to navigate to
            });
            navigation.navigate('routeOperationMenu');
          } else {
            /*
              In case of error, the user can make another petition to process the inventory.
              The information that is currently stored in memory can be used to try again,
              that is the reason of why it is not being redirected to the route operation menu.
            */
              setIsInventoryAccepted(false);
          }
        } else {
          /* At the moment, there is not a default case */
        }
      }
    } catch (error) {
      setIsInventoryAccepted(false);
    }
  };

  const handlerOnVendorCancelation = () => {
    if (currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
      /*
        Vendor might change the day of route (it might be the reason of why he
        didn't finish the first inventory).

        In this case, the application must redirect to the route operation selection to
        make able to the vendor to select a route.
      */
     navigation.navigate('routeSelection');
    } else {
      /*
        Since it is not the start shift inventory, it means the vendor is already making a route.
      */
      navigation.navigate('routeOperationMenu');
    }
  };

  const handlerOnModifyInventory = () => {
    const {id_type_operation} = currentOperation;
    let currentInventoryOperation:IProductInventory[] = [];

    if (id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
      currentInventoryOperation = initialShiftInventory;
    } else if (id_type_operation === DAYS_OPERATIONS.restock_inventory
            || id_type_operation === DAYS_OPERATIONS.product_devolution_inventory) {
      currentInventoryOperation = restockInventories[0];
    } else if (id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
      currentInventoryOperation = finalShiftInventory;
    } else {
      /* Other invalid day operation */
    }

    // Reseting states for making the end shift inventory.
    const newInventoryOperation = inventory.map((proudct:IProductInventory) => {
      let amountForInventory:number = 0;

      const productOfOperation:IProductInventory|undefined = currentInventoryOperation
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

    if (id_type_operation === DAYS_OPERATIONS.start_shift_inventory) {
      setCurrentInventory([]);
    } else {
      setCurrentInventory(
        calculateNewInventoryAfterAnInventoryOperation(
          productsInventory,
          newInventoryOperation,
          true
        )

      ); // Set vendor's inventory information
    }

    setInventory(newInventoryOperation); // Set information that has the inventory operation
    setIsOperation(true);
    setIsOperationToUpdate(true);
    setIsInventoryAccepted(false); // State to avoid double-click
  };

  return (
    <ScrollView style={tw`w-full flex flex-col`}>
      <View style={tw`mt-3 w-full flex basis-1/6`}>
        <RouteHeader onGoBack={handlerGoBack}/>
      </View>

      {/* Product inventory section. */}
      <View style={tw`w-full flex flex-row items-center justify-center`}>
        <Text style={tw`text-center text-black text-2xl`}>
          {getTitleOfInventoryOperation(currentOperation)}
        </Text>
        { (isInventoryOperationModifiable && !isOperation) &&
          <Pressable
            style={tw`bg-blue-500 py-6 px-6 rounded-full ml-3`}
            onPress={handlerOnModifyInventory}>
            <Icon
              name={'edit'}
              style={tw`absolute inset-0 top-3 text-base text-center`} color="#fff" />
          </Pressable>
        }
      </View>
      {/* Inventory product section */}
      {/* Depending on the action, it will be decided the menu to be displayed. */}
      { isOperation ?
        <View style={tw`flex basis-auto w-full mt-3`}>
          <TableInventoryOperations
            suggestedInventory={suggestedProduct}
            currentInventory={currentInventory}
            operationInventory={inventory}
            setInventoryOperation={setInventory}
            currentOperation={currentOperation}/>
        </View>
        :
        <View style={tw`flex basis-auto w-full mt-3`}>
          <TableInventoryVisualization
            inventory                       = {productsInventory}
            suggestedInventory              = {suggestedProduct}
            initialInventory                = {initialShiftInventory}
            restockInventories              = {restockInventories}
            soldOperations                  = {productSoldTransactions}
            repositionsOperations           = {productRepositionTransactions}
            returnedInventory               = {finalShiftInventory}
            inventoryWithdrawal             = {inventoryWithdrawal}
            inventoryOutflow                = {inventoryOutflow}
            finalOperation                  = {finalOperation}
            issueInventory                  = {issueInventory}
            isInventoryOperationModifiable  = {isInventoryOperationModifiable}
            />
          { currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory &&
            <View style={tw`flex basis-auto w-full mt-3`}>
              <Text style={tw`w-full text-center text-black text-2xl`}>
                Producto vendido por tienda
              </Text>
              <TableInventoryOperationsVisualization
                inventory             = {productsInventory}
                titleColumns          = {nameOfStores}
                productInventories    = {productSoldByStore}
                calculateTotal        = {true}/>
              <Text style={tw`w-full text-center text-black text-2xl`}>
                Reposición de producto por tienda
              </Text>
                <TableInventoryOperationsVisualization
                  inventory             = {productsInventory}
                  titleColumns          = {nameOfStores}
                  productInventories    = {productRepositionByStore}
                  calculateTotal        = {true}
                  />
            </View>
          }
        </View>
      }
      {/* Cash reception section. */}
      {((currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory
      || currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory)
      && isOperation && !isOperationToUpdate) &&
        /*
          The reception of money can only be possible in tow scenarios:
            1. Start shift inventory operation.
            2. End shift inventory operation.
        */
        <View style={tw`flex basis-auto w-full mt-3`}>
          <Text style={tw`w-full text-center text-black text-2xl`}>Dinero</Text>
          <TableCashReception
            cashInventoryOperation={cashInventory}
            setCashInventoryOperation={setCashInventory}
          />
          <Text style={tw`w-full text-center text-black text-xl mt-2`}>
            Total:
            ${cashInventory.reduce((accumulator, denomination) => {
                return accumulator + denomination.amount! * denomination.value;},0)}
            </Text>
        </View>
      }
      { ((currentOperation.id_type_operation === DAYS_OPERATIONS.start_shift_inventory
      || currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory) && !isOperation) &&
        <View style={tw`w-11/12 ml-3 flex flex-col basis-auto mt-3`}>
          <Text style={tw`text-black text-lg`}>
            Dinero llevado al inicio de la ruta: ${routeDay.start_petty_cash}
          </Text>
        </View>
      }
      { (currentOperation.id_type_operation === DAYS_OPERATIONS.end_shift_inventory && !isOperation) &&
        <View style={tw`w-11/12 ml-3 flex flex-col basis-auto mt-3`}>
          <Text style={tw`text-black text-lg`}>
            Dinero regresado al final de la ruta: ${routeDay.final_petty_cash}
          </Text>
        </View>
      }
      <View style={tw`flex basis-1/6 mt-3`}>
        <VendorConfirmation
          onConfirm={isOperation ? handleVendorConfirmation : handlerReturnToRouteMenu}
          onCancel={isOperation ? handlerOnVendorCancelation : handlerReturnToRouteMenu}
          message={'Escribiendo mi numero de telefono y marcando el cuadro de texto acepto tomar estos productos.'}
          confirmMessageButton={isOperation ? 'Aceptar' : 'Volver al menú'}
          cancelMessageButton={isOperation ? 'Cancelar' : 'Volver al menú'}
          requiredValidation={
            false
            //isOperation
            }/>
      </View>
      <View style={tw`flex basis-1/6`} />
    </ScrollView>
  );
};

export default InventoryOperationLayout;
