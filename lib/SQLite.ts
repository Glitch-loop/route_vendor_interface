import SQLite  from 'react-native-sqlite-storage';

function errorCB(err:any) {
  console.log('SQL Error: ' + err);
}

function successCB() {
  console.log('SQL executed fine');
}

function openCB() {
  console.log('Database OPENED');
}

// Enable SQLite debugging
SQLite.enablePromise(true);

export async function createSQLiteConnection() {
  return SQLite.openDatabase({ name: 'mydb.db', location: 'default' },openCB, errorCB);
  
}



