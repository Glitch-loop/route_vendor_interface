
// Queries
// Main database
import { RepositoryFactory } from '../queries/repositories/RepositoryFactory';

// Interfaces
import { IResponse, IUser } from '../interfaces/interfaces';
import { createApiResponse, getDataFromApiResponse } from '../utils/apiResponse';

// Initializing database connection
let repository = RepositoryFactory.createRepository('supabase');


export async function loginUser(userToLog:IUser):Promise<IResponse<IUser>> {
  const emptyUser:IUser = {
    id_vendor:  '',
    cellphone:  '',
    name:       '',
    password:   '',
    status:     0,
  };
  let finalResponseCode:number = 400;
  let finalMessage:string = '';
  let finalUserInformation:IUser = {...emptyUser};

  const response:IResponse<IUser> = await repository.getUserDataByCellphone(userToLog);

  const { responseCode } = response;
  const userInformation:IUser = getDataFromApiResponse(response);

  if (responseCode === 200) {
    const passwordToLog:string|undefined = userToLog.password;
    const passwordRegistered:string|undefined = userInformation.password;

    if (passwordToLog === undefined) {
      finalResponseCode = 400;
      finalMessage = 'Missing information.';
      finalUserInformation = { ...emptyUser };
    } else { /* There are no instructions */ }

    if (passwordRegistered === undefined) {
      finalResponseCode = 400;
      finalMessage = 'Missing information.';
      finalUserInformation = { ...emptyUser };
    } else { /* There are no instructions */ }

    if (passwordToLog === passwordRegistered) {
      finalResponseCode = 200;
      finalMessage = 'The user was autheticated successfully.';
      finalUserInformation = { ...userInformation };
    } else {
      finalResponseCode = 400;
      finalMessage = 'Incorrect cellphone or password.';
      finalUserInformation = { ...emptyUser };
    }

  } else {
    finalResponseCode = 500;
    finalMessage = 'Something was wrong during logging.';
    finalUserInformation = { ...emptyUser };
  }

  return createApiResponse(
    finalResponseCode,
    finalUserInformation,
    null,
    finalMessage,
  );
}
