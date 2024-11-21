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
