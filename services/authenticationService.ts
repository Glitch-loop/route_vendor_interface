
// Queries
// Main database
import { RepositoryFactory } from '../queries/repositories/RepositoryFactory';

// Interfaces
import { IResponse, IUser } from '../interfaces/interfaces';
import { apiResponseProcess, apiResponseStatus, createApiResponse, getDataFromApiResponse } from '../utils/apiResponse';
import { dropUsersEmbeddedTable, getUserDataByCellphone, getUsers, insertUser } from '../queries/SQLite/sqlLiteQueries';

// Initializing database connection
let repository = RepositoryFactory.createRepository('supabase');


async function loginUserUsingCentralDatabase(userToLog:IUser):Promise<IResponse<IUser>> {
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

async function loginUserUsingEmbeddedDatabase(userToLog:IUser):Promise<IResponse<IUser>> {
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

  const response:IResponse<IUser> = await getUserDataByCellphone(userToLog);

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

/*
  The idea here is to maintian the table as small as possbile, in theory, this table should only
  store the information of the vendor (current user of the device and he is who is doing the 
  work day).
*/
export async function maintainUserTable(currentUser:IUser):Promise<IResponse<null>> {
  let finalResponseCode:number = 400;
  let finalMessage:string = '';

  const { cellphone, password, name } = currentUser;

    if (cellphone && password && name !== '') {
      const responseGetUserByCellphone = await repository.getUserDataByCellphone(currentUser);

      if(apiResponseStatus(responseGetUserByCellphone, 200)) {
        const responseDropUsersTable:IResponse<null> = await dropUsersEmbeddedTable();

        if(apiResponseStatus(responseDropUsersTable, 200)) {
          const responseInsertUser:IResponse<IUser> = await insertUser(currentUser);

          if (apiResponseStatus(responseInsertUser, 201)) {
            finalResponseCode = 200;
            finalMessage = 'Process finalized successfully';
          }
        } else {
          finalResponseCode = 400;
          finalMessage = 'Something was wrong during droping the users table';
        }
      } else {
        finalResponseCode = 400;
        finalMessage = 'Something was wrong during retreving of user\'s information.';
      }
    } else {
      finalResponseCode = 400;
      finalMessage = 'Some information is being missing';
    }

  return createApiResponse(finalResponseCode, null, null, finalMessage);
  }

export async function loginUser(userToLog:IUser):Promise<IResponse<IUser>> {
  const emptyUser:IUser = {
    id_vendor:  '',
    cellphone:  '',
    name:       '',
    password:   '',
    status:     0,
  };
  let wrongAnswer = createApiResponse<IUser>(500, emptyUser, null, 'Failed getting users.');
  let finalResponse = wrongAnswer;

  const responseLoginUsingEmbeddedDatabase = await loginUserUsingEmbeddedDatabase(userToLog);

  if(apiResponseStatus(responseLoginUsingEmbeddedDatabase , 200)) {
    finalResponse = responseLoginUsingEmbeddedDatabase;
  } else {
    const responseLoginUsingCentralDatabase = await loginUserUsingCentralDatabase(userToLog);
    if(apiResponseStatus(responseLoginUsingCentralDatabase, 200)) {
      // That means the user is not in the embedded database

      const userInformation:IUser = getDataFromApiResponse(responseLoginUsingCentralDatabase);

      finalResponse = await insertUser(userInformation);
      if (apiResponseStatus(finalResponse, 201)) {
        finalResponse = responseLoginUsingCentralDatabase;
      } else {
        finalResponse = wrongAnswer;
      }
    } else {
      finalResponse = wrongAnswer;
    }
  }

  return finalResponse;
}


