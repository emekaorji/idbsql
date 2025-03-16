// Initialize SQLite using sql.js
let db;
let initialized = false;
let initializationPromise = null;

// Load SQL.js WebAssembly module
async function initSqlJs() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      if (!initialized) {
        // Use CDN for sql.js if not already loaded
        const sqlJsUrl =
          'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';

        // Dynamically import sql.js
        importScripts(sqlJsUrl);

        // Initialize SQL.js with WebAssembly
        const SQL = await initSqlJs({
          locateFile: (file) =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
        });

        // Create a new database
        db = new SQL.Database();

        // Create any necessary tables or indexes
        // This is where you would set up your schema if needed

        initialized = true;
        resolve(db);
      } else {
        resolve(db);
      }
    } catch (error) {
      reject(error);
    }
  });

  return initializationPromise;
}

// Format the result based on the method
function formatResult(result, method) {
  switch (method) {
    case 'run':
      return {
        changes: result?.changes || 0,
        lastInsertRowid: result?.lastInsertRowid || null,
      };
    case 'all':
    case 'values':
      if (!result || result.length === 0) {
        return { rows: [] };
      }

      // Extract column names and values
      const columns = result[0].columns;
      const values = result[0].values;

      // Convert to array of objects
      const rows = values.map((row) => {
        const obj = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });

      return { rows };
    case 'get':
      return { rows: [result] };
    default:
      return { rows: [] };
  }
}

// Handle messages from the main thread
self.onmessage = async function (event) {
  const { sql, params, method, messageId } = event.data;

  try {
    // Initialize SQLite if not already initialized
    await initSqlJs();

    // Execute the SQL query
    let result;

    switch (method) {
      case 'run':
        result = db.run(sql, params || []);
        break;
      case 'all':
      case 'values':
        result = db.exec(sql, params || []);
        break;
      case 'get':
        const stmt = db.prepare(sql);
        if (params && params.length > 0) {
          stmt.bind(params);
        }
        result = stmt.getAsObject();
        stmt.free();
        break;
      default:
        throw new Error(`Unknown method: ${method}`);
    }

    // Format the result based on the method
    const formattedResult = formatResult(result, method);

    // Send the result back to the main thread
    self.postMessage({ messageId, result: formattedResult });
  } catch (error) {
    console.error('Error in worker:', error);

    // Send the error back to the main thread
    self.postMessage({
      messageId,
      error: error.message || 'Unknown error in SQL worker',
    });
  }
};

// Handle errors
self.onerror = function (error) {
  console.error('Worker error:', error);
  self.postMessage({
    error: 'Worker error: ' + (error.message || 'Unknown error'),
  });
};
