
import { stringify } from 'uuid';
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

  for(let i = 0; i < words.length; i++) {
    const remaindLenght = line.length + words[i].length;
    if (i === words.length - 1) { // Last iteration
      if (remaindLenght < anchorPrint) {
        /*anchorPrint + 1: The addition represents the space between words.*/
        text = text + '\n' + line + words[i];
      } else {
        text = text + '\n' + line + '\n' + words[i];
      }
    } else {
      if (remaindLenght + 1 < anchorPrint) {
        /*anchorPrint + 1: The addition represents the space between words.*/
        line = line + words[i] + ' ';
      } else {
        text = text + '\n' + line;
        line = words[i] + ' ';
      }
    }
  }

  if (enterAtTheEnd) {
    text = text + '\n';
  } else {
    /* Do nothing*/
  }

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
      let firstSectionLine:string = `${product.amount} ${product.product_name}`;
      let secondSectionLine:string = `$${product.price} $${product.amount * product.price}`;
      sectionTicket = sectionTicket + getTicketLine(firstSectionLine,false);
      sectionTicket = sectionTicket + getTicketLine(secondSectionLine,false);
    });
  } else { // There weren't movements for this concept.
    if (messageNoMovements !== undefined) {
      sectionTicket += messageNoMovements;
    } else {
      sectionTicket += 'No hubieron movimientos en este concepto';
    }
  }

  return messageNoMovements;
}

export function getTicketSale(productsDevolution:IProductInventory[], productsReposition:IProductInventory[], productsSale: IProductInventory[], ):string {
  let ticket = '\n';

  // Header of the ticket
  ticket += getTicketLine('Ferdis', false);
  ticket += getTicketLine(`Fecha: ${timestamp_format()}`, false);
  ticket += getTicketLine('Vendedor: ', false);
  ticket += getTicketLine('Estatus: Completado', false);
  ticket += getTicketLine('Cliente: Tienda', true);
  

  // Body of the ticket
  // Writing devolution products section
  ticket += getTicketLine('Devolucion de producto', false);
  ticket += getTicketLine('Cantidad Producto Importe Total',false);
  ticket += getListSectionTicket(productsDevolution, 'No hubo movmimentos en la seccion de mermas');

  // Writing reposition product section
  ticket += getTicketLine('Reposicion de producto', false);
  ticket += getTicketLine('Cantidad Producto Importe Total',false);
  ticket += getListSectionTicket(productsReposition, 'No hubo movmimentos en la seccion de reposiciones');

  // Writing product of the sale section
  ticket += getTicketLine('Venta', false);
  ticket += getTicketLine('Cantidad Producto Importe Total',false);
  ticket += getListSectionTicket(productsSale, 'No hubo movmimentos en la seccion de ventas');

  // Finishing ticket
  ticket += '\n\n';

  return ticket;
}


