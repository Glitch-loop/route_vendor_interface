
export function capitalizeFirstLetter(input: string|undefined|null): string {
  if (!input || input === undefined || input === null) {
    return '';
  } else {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }
}

export function avoidingUndefinedItem(item: any, itemUndefinedCase: any) {
  if (item === undefined) {
    return itemUndefinedCase;
  } else {
    return item;
  }
}

export function convertingDictionaryInArray(dictionary:any) {
  const newArray:any[] = [];
  for (const key in dictionary) {
    newArray.push(dictionary[key]);
  }

  return newArray;
}

export function convertingArrayInDictionary(arrData:any[], fieldForKey:string) {
  const newDict:any = {};

  for (let  i = 0; i < arrData.length; i++) {
    const key = arrData[i][fieldForKey];

    newDict[key] = arrData[i];
  }

  return newDict;
}

export function addingInformationParticularFieldOfObject(
  dictionary: any,
  idField: string,
  fieldToAddTheInformation: string,
  informationToAdd:any,
  newObject: any) {
  let updatedDictionary:any = { ...dictionary };

  if (!updatedDictionary[idField]) {
    updatedDictionary[idField] = { ...newObject };
  } else {
    if (fieldToAddTheInformation in updatedDictionary[idField]) {
      updatedDictionary[idField][fieldToAddTheInformation] += informationToAdd;
    } else {
      /* The field doesn't exist in the object/json */
      updatedDictionary[idField][fieldToAddTheInformation] = informationToAdd;
    }
  }

  return updatedDictionary;
}
