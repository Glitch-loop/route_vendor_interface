import Toast from 'react-native-toast-message';
import { IResponse } from '../interfaces/interfaces';

export function createApiResponse<T>(
  responseCode: number,
  data: T,
  error: string | null = null,
  message: string | null = null,
): IResponse<T> {
  let messageInResponse:string = '';

  if (message === undefined || message === null) {
    // 200
    if (responseCode === 200) {
      messageInResponse = 'Success.';
    } else if (responseCode === 201) {
      messageInResponse = 'Inserted.';
    }

    // 500
    if(responseCode === 500) {
      messageInResponse = 'Internal server error.';
    }

  } else {
    /* Message has already information */
    messageInResponse = message;
  }

  return {
    responseCode:responseCode,
    message: messageInResponse,
    data,
    ...(error && { error }),
  };
}

export function apiResponseStatus<T>(apiResponse: IResponse<T>, valueExpected: number):boolean {
  const { responseCode } = apiResponse;
  let result:boolean = false;

  if (valueExpected === responseCode) {
    result = true;
  } else {
    result = false;
  }

  return result;
}

export function getDataFromApiResponse<T>(apiResponse: IResponse<T>):T {
  const { data } = apiResponse;

  return data;
}

export function apiResponseProcess<T>(
  apiResponse: IResponse<T>,
  configProcess?:any,
  valueExpected?: number,
  // showSuccessMessage:boolean = false,
  // showErrorMEssage:boolean = true,
  // toastTitleSuccess?: string,
  // toastMessageSuccess?: string,
  // toastTitleError?:string,
  // toastMessageError?:string
):T{

  // Variables used to determine what to print.
  let showSuccessMessage:boolean = false;
  let toastTitleSuccess:string = '';
  let toastMessageSuccess:string = '';
  let showErrorMessage:boolean = false;
  let toastTitleError:string = '';
  let toastMessageError:string = '';

  // Variables to set configurations for toasts.
  if (configProcess) {
    // User provided a configuration
    showSuccessMessage = configProcess.showSuccessMessage;
    toastTitleSuccess = configProcess.toastTitleSuccess;
    toastMessageSuccess = configProcess.toastMessageSuccess;
    showErrorMessage = configProcess.showErrorMessage;
    toastTitleError = configProcess.toastTitleError;
    toastMessageError = configProcess.toastMessageError;
  } else {
    // User didn't provide a configuration.
  }

  let title:string = '';
  let message:string = '';
  let isCorrectProcess:boolean = false;

  if(valueExpected) {
    isCorrectProcess = apiResponseStatus(apiResponse, valueExpected);
  } else {
    /* If expected code is not provided, then, expect the "success" default codes */
    isCorrectProcess = apiResponseStatus(apiResponse, 200) || apiResponseStatus(apiResponse, 201);
  }

  if (isCorrectProcess) { // Response status: OK
    if (toastTitleSuccess) {
      title = toastTitleSuccess;
    } else {
      title = 'Proceso terminado con exito';
    }

    if(toastMessageSuccess) {
      message = toastMessageSuccess;
    } else {
      message = 'El proceso se ha terminado exitosamente';
    }

    if (showSuccessMessage) {
      Toast.show({
        type: 'success',
        text1: title,
        text2: message,
      });
    } else {
      /* It is not necessary to show the message */
    }
  } else { // Response status: Error or fail
    if (toastTitleError) {
      title = toastTitleError;
    } else {
      title = 'Error durante el proceso';
    }

    if(toastMessageError) {
      message = toastMessageError;
    } else {
      message = 'Ha habido un error durante el processo';
    }

    if (showErrorMessage) {
      Toast.show({
        type: 'error',
        text1: title,
        text2: message,
      });
    } else {
      /* It is not necessary to show the message */
    }
  }

  return getDataFromApiResponse(apiResponse);
}
