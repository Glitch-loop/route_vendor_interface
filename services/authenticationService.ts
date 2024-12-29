
// Queries
// Main database
import { RepositoryFactory } from '../queries/repositories/RepositoryFactory';

// Interfaces
import { IResponse, IUser } from '../interfaces/interfaces';
import { apiResponseProcess, apiResponseStatus, createApiResponse, getDataFromApiResponse } from '../utils/apiResponse';
import { getUserDataByCellphone, getUsers, insertUser } from '../queries/SQLite/sqlLiteQueries';

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

async function update(userToLog:IUser):Promise<void> {
  // Verifying there is not a registerd user.
  const allUsers:IResponse<IUser[]> = await getUsers();

  let responseUsers:IUser[] = apiResponseProcess(userResponse, settingResponseUser);
  
  const userFound:IUser|undefined = responseUsers.find((responseUser:IUser) => {
    return responseUser.id_vendor === testingUser.id_vendor;
  });
  
  if (userFound === undefined) {
    // Store information in embeddded database.
    await insertUser(testingUser);
  } else {
    /*
      It means the user already exists, so it is not necessary to save the user or vendor.
    */
  }
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

  console.log("userToLog: ", userToLog)
  if(apiResponseStatus(responseLoginUsingEmbeddedDatabase , 200)) {
    finalResponse = responseLoginUsingEmbeddedDatabase;
    console.log(responseLoginUsingEmbeddedDatabase)
    console.log("Embedded database")
  } else {
    const responseLoginUsingCentralDatabase = await loginUserUsingCentralDatabase(userToLog);
    console.log("Central database")
    if(apiResponseStatus(responseLoginUsingCentralDatabase, 200)) {
      // That means the user is not in the embedded database

      const userInformation:IUser = getDataFromApiResponse(responseLoginUsingCentralDatabase);

      finalResponse = await insertUser(userInformation);
      if (apiResponseStatus(finalResponse, 201)) {
        console.log("inserting user")
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


