import { IResponse } from '../interfaces/interfaces';

export function createApiResponse<T>(
  responseCode: number,
  data: T | null = null,
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
