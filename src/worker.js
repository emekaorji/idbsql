/**
 * IDBSQL Worker
 *
 * This worker script handles database operations in a separate thread.
 * It uses SQLite WASM to provide SQL capabilities in the browser.
 */

/**
 * Initialize SQLite using sql.js
 * @type {SQL.Database}
 */
let db = null;

self.onmessage = messageHandler;
self.onerror = errorHandler;

setup();

/** INITIALIZATION ⬇ */

/**
 * Loads the SQL.js WebAssembly module
 */
async function loadSQLJSLibrary() {
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
          `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
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
 * Creates tables based on the schema
 * @param {Object} schema Database schema
 */
async function createTables(schema) {
  // In a real implementation, this would create tables based on the schema
  // For now, we'll just log the schema
  console.log('Creating tables for schema:', schema);
}

/**
 * Sets up the worker
 */
async function setup() {
  try {
    await loadSQLJSLibrary();
    console.log('[Worker]: SQL.js library loaded from CDN successfully');
  } catch (error) {
    console.error('[Worker]:', error);
    sendGlobalError(error);
  }
}

/** INITIALIZATION ⬆ */

/** HANDLERS ⬇ */

/**
 * Handles messages from the main thread
 * @param {MessageEvent} event - The message event
 */
function messageHandler(event) {
  console.log(event);
  // const { sql, params, method, messageId } = event.data;

  // try {
  //   // Execute the SQL query
  //   const result = executeQuery(sql, params, method);

  //   // Format the result based on the method
  //   const formattedResult = formatResult(result, method);

  //   // Send the result back to the main thread
  //   self.postMessage({ type: 'RESULT', messageId, data: formattedResult });
  // } catch (error) {
  //   console.error('[Worker]:', error);

  //   // Send the error back to the main thread
  //   sendError(messageId, error);
  // }
}

/**
 * Handles errors in the worker
 * @param {ErrorEvent} error - The error event
 */
function errorHandler(error) {
  console.error('[Worker]:', error);
  sendError('GLOBAL_ERROR', error);
}

/** HANDLERS ⬆ */

/** DATABASE OPERATIONS ⬇ */

/**
 * Executes an SQL query
 * @param {string} sql - The SQL query to execute
 * @param {any[]} params - The parameters for the query
 * @param {string} method - The method to use for the query
 * @returns {any} The result of the query
 */
function executeQuery(sql, params, method) {
  const query = JSON.parse(sql);

  // Execute the query based on its type
  switch (query.type) {
    case 'select':
      return executeSelectQuery(query, params);
    case 'insert':
      return executeInsertQuery(query, params);
    case 'update':
      return executeUpdateQuery(query, params);
    case 'delete':
      return executeDeleteQuery(query, params);
    default:
      throw new Error(`Unknown query type: ${query.type}`);
  }

  // switch (method) {
  //   case 'run':
  //     result = db.run(sql, params || []);
  //     break;
  //   case 'all':
  //   case 'values':
  //     result = db.exec(sql, params || []);
  //     break;
  //   case 'get':
  //     const stmt = db.prepare(sql);
  //     if (params && params.length > 0) {
  //       stmt.bind(params);
  //     }
  //     result = stmt.getAsObject();
  //     stmt.free();
  //     break;
  //   default:
  //     throw new Error(`Unknown method: ${method}`);
  // }
}

/**
 * Executes a select query
 * @param {Object} query Query object
 * @param {Array} params Query parameters
 * @returns {Promise<Array>} Query result
 */
async function executeSelectQuery(query, params) {
  // In a real implementation, this would convert the query object to SQL
  // and execute it
  console.log('Executing select query:', query);

  // Mock implementation that returns empty results
  return [];
}

/**
 * Executes an insert query
 * @param {Object} query Query object
 * @param {Array} params Query parameters
 * @returns {Promise<Object>} Query result
 */
async function executeInsertQuery(query, params) {
  // In a real implementation, this would convert the query object to SQL
  // and execute it
  console.log('Executing insert query:', query);

  // Mock implementation that returns success
  return { success: true, rowsAffected: query.values.length };
}

/**
 * Executes an update query
 * @param {Object} query Query object
 * @param {Array} params Query parameters
 * @returns {Promise<Object>} Query result
 */
async function executeUpdateQuery(query, params) {
  // In a real implementation, this would convert the query object to SQL
  // and execute it
  console.log('Executing update query:', query);

  // Mock implementation that returns success
  return { success: true, rowsAffected: 1 };
}

/**
 * Executes a delete query
 * @param {Object} query Query object
 * @param {Array} params Query parameters
 * @returns {Promise<Object>} Query result
 */
async function executeDeleteQuery(query, params) {
  // In a real implementation, this would convert the query object to SQL
  // and execute it
  console.log('Executing delete query:', query);

  // Mock implementation that returns success
  return { success: true, rowsAffected: 1 };
}

/** DATABASE OPERATIONS ⬆ */

/** UTILITIES ⬇ */

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
 * Sends a result message
 * @param {string} id Message ID
 * @param {Object} result Result object
 */
function sendResult(messageId, data) {
  self.postMessage({
    type: 'RESULT',
    messageId,
    data,
  });
}

/**
 * Sends an error message
 * @param {string} id Message ID
 * @param {string} error Error message
 */
function sendError(messageId, error) {
  self.postMessage({
    type: 'ERROR',
    messageId,
    error: `[Worker Error]: ${error?.message || 'Unknown error'}`,
  });
}

/** UTILITIES ⬆ */
