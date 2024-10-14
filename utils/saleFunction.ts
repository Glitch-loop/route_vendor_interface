
import { IProductInventory } from '../interfaces/interfaces';
import { timestamp_format } from './momentFormat';


// Auxiliar functuion
export function getProductDevolutionBalance(productDevolution:IProductInventory[], productReposition:IProductInventory[]):number {
  const totalProductDevolution = productDevolution.reduce((acc,item) =>
    {return acc + item.price * item.amount;}, 0);

  const totalProductReposition = productReposition.reduce((acc, item) =>
    {return acc + item.price * item.amount;}, 0);

  return totalProductDevolution - totalProductReposition;
}

export function getProductDevolutionBalanceWithoutNegativeNumber(productDevolution:IProductInventory[], productReposition:IProductInventory[]) {
  let total = getProductDevolutionBalance(productDevolution, productReposition);
  if (total < 0) {
    return total * -1;
  } else {
    return total;
  }
}

export function getMessageForProductDevolutionOperation(productDevolution:IProductInventory[], productReposition:IProductInventory[]) {
  let total = getProductDevolutionBalance(productDevolution, productReposition);
  if (total < 0) {
    return 'Balance de la devolución de producto (por cobrar): ';
  } else {
    return 'Balance de la devolución de producto (a pagar): ';
  }
}

export function getGreatTotal(
  productsDevolution:IProductInventory[],
  productsReposition:IProductInventory[],
  salesProduct:IProductInventory[],
):number {
  let subtotalProductDevolution = getProductDevolutionBalance(productsDevolution,[]);
  let subtotalProductReposition = getProductDevolutionBalance(productsReposition,[]);
  let subtotalSaleProduct = getProductDevolutionBalance(salesProduct,[]);
  let greatTotal = 0;


  if (subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution < 0) {
    greatTotal = ((subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution) * -1);
  } else {
    greatTotal = subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution;
  }

  return greatTotal;
}

// Related to tickets for selling.
export function getAmountSpacesNextSection(titleSection:number|string, wordSection:number|string):string {
  let sectionString = '';
  let titleString = '';
  let timesToPrint = 0;

  if (typeof wordSection === 'number') {
    sectionString = wordSection.toString();
  } else {
    sectionString = wordSection;
  }

  if (typeof titleSection === 'number') {
    titleString = titleSection.toString();
  } else {
    titleString = titleSection;
  }

  timesToPrint = titleString.length - sectionString.length;

  if (timesToPrint < 0) {
    /* That means the content is longer than the title of the section, so it is only needed
    an space to separate it from the new space */
    timesToPrint = 1;

  } else {
    /* That means the content is shorter than the title therefore, it is needed to print
    spaces to compensate the empty space

    */
    timesToPrint += 1;

  }
  return ' '.repeat(timesToPrint);
}

/*
  This function helps to determine if it is needed to break the "line to write" depending on the
  lenght of the text and the anchor of the printer.

  The anchor of the printer that is currently being used is 58mm, this measure allows us to write a
  line of lenght 32 characteres.

  The parameter of indentation is of type of number and depending of the input is the number of 
  "blank spaces" that it will be let in the ticket.
*/
export function getTicketLine(lineToWrite:string, enterAtTheEnd:boolean = true, indent:number = 0) {
  const anchorPrint:number = 32;
  let text:string = '';
  let line:string = '';
  let filteredLineToWrite:string = '';
  let indentation = 0;

  // Validation for indentation
  if (indent < 0) {
    indentation = 0;
  } else if  (indent > 32) {
    indentation = 25;
  } else {
    indentation = indent;
  }

  // Filtering tabulators and enters
  for (let  i = 0; i < lineToWrite.length; i++) {
    if (lineToWrite[i] === '\n') {
      continue;
    } else if (lineToWrite[i] === '\t') {
      continue;
    } else {
      filteredLineToWrite += lineToWrite[i];
    }
  }

  const wordsToFilter:string[] = filteredLineToWrite.split(' ');

  // Filtering blank spaces or empty strings.
  const words = wordsToFilter.filter((word:string) => {return word !== '';});
  console.log("-------------------------------")
  for(let i = 0; i < words.length; i++) {
    const remaindLenght = indentation + line.length + words[i].length;
    if (i === words.length - 1) { // Last iteration
      if (remaindLenght < anchorPrint) {
        /*anchorPrint + 1: The addition represents the space between words.*/
        text = text + ' '.repeat(indentation) + line + words[i];
      } else {
        text = text + '\n' + ' '.repeat(indentation) + line + '\n' + ' '.repeat(indentation) + words[i];
      }
    } else {
      if (remaindLenght + 1 < anchorPrint) {
        /*anchorPrint + 1: The addition represents the space between words.*/
        line = line + words[i] + ' ';
      } else {
        text = text + '\n' + ' '.repeat(indentation) + line;
        line = words[i] + ' ';
      }
    }
  }

  if (enterAtTheEnd) {
    text = text + '\n';
  } else {
    /* Do nothing*/
  }
  console.log("Text to print: ", text)
  return text;
}

/*
  This function helps to create a section easily. Writing all the products in the array, and if there are not then
  writing a message to let to know to the user what is happening.
*/
export function getListSectionTicket(productList:IProductInventory[], messageNoMovements?:string|undefined) {
  let sectionTicket = '';
  if (productList.length > 0) { // There were movements for this concept.
    productList.forEach(product => {
      let amount:   string = `${product.amount}`;
      let product_name:  string = `${product.product_name}`;
      let price:  string = `$${product.price}`;
      let total:  string = `$${product.amount * product.price}`;

      /*
        At least for sale ticket sectino, the identation is calculated according with the headers of the list 
        on which are displayed.
        The issue is that what is going to be displayed before will affect into the identation. So that means
        that the words that will be displayed must be subtracted to the next word identation.
      */

      // First section
      sectionTicket = sectionTicket + getTicketLine(amount,false); // Cantidad
      sectionTicket = sectionTicket + getTicketLine(product_name,true, (9 - amount.length)); // Producto

      // Second section
      sectionTicket = sectionTicket + getTicketLine(price,false, 18); // Price
      sectionTicket = sectionTicket + getTicketLine(total,true, (8 - price.length)); // Total
    });
  } else { // There weren't movements for this concept.
    if (messageNoMovements !== undefined) {
      sectionTicket += getTicketLine(messageNoMovements,true, 0);
    } else {
      sectionTicket += getTicketLine('No hubieron movimientos en este concepto',true, 0);
    }
  }

  return sectionTicket;
}

export function getTicketSale(productsDevolution:IProductInventory[], productsReposition:IProductInventory[], productsSale: IProductInventory[], ):string {
  // Variable used to containt the ticket to print
  let ticket = '\n';

  // Getting Subtotals of each concept
  let subtotalProductDevolution = getProductDevolutionBalance(productsDevolution,[]);
  let subtotalProductReposition = getProductDevolutionBalance(productsReposition,[]);
  let subtotalSaleProduct = getProductDevolutionBalance(productsSale,[]);
  let productDevolutionBalance = '$0';
  let greatTotal = '$0';

  /*
  Variables for setting the format of the ticket.
    Note: The anchor of the printer that is used for the application is 58mm equivalent to 32
    characters
  */

  let showTotalPosition:number = 26; // 32 - 26 = $99999 (maximum possible number to print)

  if (subtotalProductReposition - subtotalProductDevolution < 0) {
    productDevolutionBalance = '-$' + ((subtotalProductReposition - subtotalProductDevolution) * -1).toString();
  } else {
    productDevolutionBalance = '$' + (subtotalProductReposition - subtotalProductDevolution).toString();
  }

  if (subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution < 0) {
    greatTotal = '-$' + ((subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution) * -1).toString();
  } else {
    greatTotal = '$' + (subtotalSaleProduct + subtotalProductReposition - subtotalProductDevolution).toString();
  }


  // Header of the ticket
  ticket += getTicketLine('Ferdis', true, 13);
  ticket += getTicketLine(`Fecha: ${timestamp_format()}`, true);
  ticket += getTicketLine('Vendedor: ', true);
  ticket += getTicketLine('Estatus: Completado', true);
  ticket += getTicketLine('Cliente: Tienda', true);
  ticket += getTicketLine('', true);

  // Body of the ticket
  // Writing devolution products section
  ticket += getTicketLine('Devolucion de producto', true, 5);
  ticket += getTicketLine('Cantidad Producto Precio Total',true);
  ticket += getListSectionTicket(productsDevolution, 'No hubo movmimentos en la seccion de mermas');
  if (productsDevolution.length > 0) {
    ticket += getTicketLine(`Valor total de devolucion: $${subtotalProductDevolution}`,true);
  }
  ticket += getTicketLine('', true);

  // Writing reposition product section
  ticket += getTicketLine('Reposicion de producto', true, 5);
  ticket += getTicketLine('Cantidad Producto Precio Total',true);
  ticket += getListSectionTicket(productsReposition, 'No hubo movmimentos en la seccion de reposiciones');
  if (productsReposition.length > 0) {
    ticket += getTicketLine(`Valor total de reposicion: $${subtotalProductReposition}`,true);
  }
  ticket += getTicketLine('', true);

  // Writing product of the sale section
  ticket += getTicketLine('Venta', true, 13);
  ticket += getTicketLine('Cantidad Producto Precio Total',true);
  ticket += getListSectionTicket(productsSale, 'No hubo movmimentos en la seccion de ventas');
  if (productsSale.length > 0) {
    ticket += getTicketLine('Total venta:', false); // 12-lenght characters string
    ticket += getTicketLine(`$${subtotalSaleProduct}`,true, (showTotalPosition - 12));
  } else {
    ticket += getTicketLine('',true);
  }

  // Summarizing Section
  ticket += getTicketLine('--------------------------------',true);

  ticket += getTicketLine('Valor concepto devolucion:', false); // 26-lenght characters string
  ticket += getTicketLine(`-$${subtotalProductDevolution}`,true, (showTotalPosition - 26));

  ticket += getTicketLine('Valor concepto reposicion:',false); // 26-lenght characters string
  ticket += getTicketLine(`$${subtotalProductReposition}`,true, (showTotalPosition - 26));

  ticket += getTicketLine('Balance devolucion de productos:',false);
  ticket += getTicketLine(`${productDevolutionBalance}`, true, (showTotalPosition - 10));

  ticket += getTicketLine('Venta total:',false); // 11-lenght characters string
  ticket += getTicketLine(`$${subtotalSaleProduct}`,true, (showTotalPosition - 12));

  ticket += getTicketLine('Gran total:',false); // 11-lenght characters string
  ticket += getTicketLine(`${greatTotal}`,true, (showTotalPosition - 11));

  // Finishing ticket
  ticket += '\n\n\n';

  return ticket;
}


