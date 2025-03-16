/**
 * This file is auto-generated from src/worker.js.
 * Do not modify this file directly, as it will be overwritten during the build process.
 * Instead, modify the src/worker.js file and run the build script.
 */

export const workerCode = `/**
 * Initialize SQLite using sql.js
 * @type {SQL.Database}
 */
let db = null;

/**
 * Formats the result based on the method
 * @param {any} result - The result of the query
 * @param {string} method - The method to use for the query
 * @returns {any} The formatted result
 */
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

/**
 * Executes an SQL query
 * @param {string} sql - The SQL query to execute
 * @param {any[]} params - The parameters for the query
 * @param {string} method - The method to use for the query
 * @returns {any} The result of the query
 */
function execute(sql, params, method) {
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
      throw new Error(\`Unknown method: \${method}\`);
  }

  return result;
}

/**
 * Handles messages from the main thread
 * @param {MessageEvent} event - The message event
 */
self.onmessage = async function (event) {
  const { sql, params, method, messageId } = event.data;

  try {
    // Execute the SQL query
    const result = execute(sql, params, method);

    // Format the result based on the method
    const formattedResult = formatResult(result, method);

    // Send the result back to the main thread
    self.postMessage({ messageId, result: formattedResult });
  } catch (error) {
    console.error('[Worker]:', error);

    // Send the error back to the main thread
    self.postMessage({
      messageId,
      error: \`[Worker Message Error]: \${
        error?.message || 'Unknown error in SQL worker'
      }\`,
    });
  }
};

/**
 * Handles errors in the worker
 * @param {ErrorEvent} error - The error event
 */
self.onerror = function (error) {
  console.error('[Worker]:', error);
  self.postMessage({
    error: \`[Worker Global Error]: \${error?.message || 'Unknown error'}\`,
  });
};

/**
 * Loads the SQL.js WebAssembly module
 */
async function loadSqlJsLibrary() {
  if (db) {
    return;
  }

  await new Promise(async (resolve, reject) => {
    try {
      // Use CDN for sql.js if not already loaded
      const sqlJsUrl =
        'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';

      // Dynamically import sql.js
      importScripts(sqlJsUrl);

      // Initialize SQL.js with WebAssembly
      const SQL = await initSqlJs({
        locateFile: (file) =>
          \`https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/\${file}\`,
      });

      // Create a new database
      db = new SQL.Database();

      // Create any necessary tables or indexes
      // This is where you would set up your schema if needed

      resolve(db);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Sets up the worker
 */
function setup() {
  loadSqlJsLibrary().then(() => {
    console.log('[Worker]: SQL.js library loaded from CDN successfully');
  });
}

setup();
`;
