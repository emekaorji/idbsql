import { type handlerCallback } from './types';
import { generateMessageId } from './utils';
import { workerCode } from './worker-generated';

const messageHandlers = new Map<string, handlerCallback>();
let worker: Worker | null = null;

setupWorker();

/**
 * Sets up the worker
 */
function setupWorker() {
  // Create a new worker with the embedded worker code
  const workerBlob = new Blob([workerCode], {
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

/**
 * Creates a new client
 * @returns A new client
 */
async function client(
  sql: string,
  params: any[] = [],
  method: 'run' | 'all' | 'values' | 'get' = 'all'
) {
  return new Promise<{ rows: any[] }>((resolve, reject) => {
    if (!worker) {
      setupWorker();
      if (!worker) {
        reject(new Error('Failed to initialize worker'));
        return;
      }
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
