import { type handlerCallback } from './types';

const messageHandlers = new Map<string, handlerCallback>();
let worker: Worker | null = null;

/**
 * Gets the URL of the worker script
 * @returns The URL of the worker script
 */
function getWorkerScriptUrl(): string {
  // Try to find the worker script in various locations

  // 1. Check if we're in a bundled environment with a global __IDBSQL_WORKER_URL__ variable
  if (typeof globalThis.__IDBSQL_WORKER_URL__ !== 'undefined') {
    return globalThis.__IDBSQL_WORKER_URL__;
  }

  // 2. Try to find the script in the same directory as the current script
  const scriptElements = document.getElementsByTagName('script');
  for (let i = 0; i < scriptElements.length; i++) {
    const src = scriptElements[i].src;
    if (src && src.includes('idbsql')) {
      const basePath = src.substring(0, src.lastIndexOf('/') + 1);
      return `${basePath}idbsql-worker.js`;
    }
  }

  // 3. Try to find the script in the current directory
  return './idbsql-worker.js';
}

/**
 * Generates a unique message ID
 * @returns A unique message ID
 */
function generateMessageId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Sets up the worker
 */
function setupWorker() {
  // Create a new worker with the worker script
  const workerBlob = new Blob([`importScripts('${getWorkerScriptUrl()}');`], {
    type: 'application/javascript',
  });
  worker = new Worker(URL.createObjectURL(workerBlob));

  worker.onmessage = (event) => {
    const { messageId, result, error } = event.data;
    if (messageHandlers.has(messageId)) {
      if (error) {
        messageHandlers.get(messageId)?.(Promise.reject(new Error(error)));
      } else {
        messageHandlers.get(messageId)?.(result);
      }
      messageHandlers.delete(messageId);
    }
  };
}

setupWorker();

/**
 * Creates a new client
 * @returns A new client
 */
async function client(
  sql: string,
  params: any[],
  method: 'run' | 'all' | 'values' | 'get'
) {
  return new Promise<{ rows: any[] }>((resolve, reject) => {
    if (!worker) {
      reject('Worker not initialized');
      return;
    }

    const messageId = generateMessageId();
    messageHandlers.set(messageId, resolve);
    worker.postMessage({ sql, params, method, messageId });
  });
}

/**
 * Terminates the worker
 */
function terminate() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

export { client, terminate };
