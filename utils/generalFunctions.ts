
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