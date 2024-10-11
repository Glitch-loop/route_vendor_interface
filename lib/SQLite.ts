import SQLite  from 'react-native-sqlite-storage';

let db: SQLite.SQLiteDatabase | null = null;

function errorCB(err:any) {
  console.log('SQL Error: ' + err);
}

function openCB() {
  console.log('Database OPENED');
}

// Enable SQLite debugging
SQLite.enablePromise(true);

export async function createSQLiteConnection() {
  try {
    if (!db) {
      db = await SQLite.openDatabase({ name: 'mydb.db', location: 'default' },openCB, errorCB);
    }

    return db;

  } catch (error) {
    console.error('Failed to open database: ', error);
    throw error;
  }
}


export async function closeSQLiteConnection() {
  try {
    if(db) {
      await db.close();
      db = null;
    }
  } catch (error) {
    console.error('Failed to close the database: ', error);
    throw error;
  }
}


