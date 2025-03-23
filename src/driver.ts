import {
  type CallbackHandler,
  type IncomingMessage,
  type IncomingMessageData,
  type MessageType,
  type OutgoingMessage,
  type OutgoingMessageData,
} from './types';
import { generateMessageId } from './utils';
import { workerCode } from './worker-generated';

const messageHandlers = new Map<string, CallbackHandler>();
let worker: Worker | null = null;

setupDriver();

/**
 * Sets up the driver
 */
async function setupDriver() {
  initializeWorker();
  await validateWorkerIsInitialized();
  await setupDatabase();
}

/**
 * Sets up the worker
 */
function initializeWorker() {
  // Create a new worker with the embedded worker code
  const workerBlob = new Blob([workerCode], {
    type: 'application/javascript',
  });
  worker = new Worker(URL.createObjectURL(workerBlob));

  worker.onmessage = messageHandler;
}

/**
 * Validates that the worker is initialized
 * @returns A promise that resolves when the worker is initialized
 */
async function validateWorkerIsInitialized() {
  return new Promise<void>((resolve, reject) => {
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    intervalId = setInterval(() => {
      if (worker) {
        resolve();
        clearInterval(intervalId);
        clearTimeout(timeoutId);
      }
    }, 50);

    timeoutId = setTimeout(() => {
      reject(new Error('Failed to initialize worker (after 1 second)'));
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    }, 1000);
  });
}

/**
 * Sets up the database
 */
async function setupDatabase() {
  await sendMessage('SETUP', { schema: [] });
}

/**
 * Handles messages from the worker
 * @param event - The message event
 */
function messageHandler(event: MessageEvent<IncomingMessage>) {
  const { messageId } = event.data;

  if (messageId === 'GLOBAL_ERROR') {
    console.error(event.data.error);
  } else if (messageHandlers.has(messageId)) {
    messageHandlers.get(messageId)?.(event.data);
    messageHandlers.delete(messageId);
  }
}

/**
 * Sends a message to the worker
 * @param type - The type of message to send
 * @param data - The data to send
 * @returns A promise that resolves to the result of the message
 */
async function sendMessage<T extends MessageType>(
  type: T,
  data: OutgoingMessageData<T>
) {
  const messageId = generateMessageId();

  return new Promise<IncomingMessageData<T>>((resolve, reject) => {
    messageHandlers.set(messageId, (value) => {
      if (value.type === 'ERROR') {
        reject(value.error);
      } else {
        resolve(value.data as IncomingMessageData<T>);
      }
    });
    worker!.postMessage({ type, data, messageId } as OutgoingMessage);
  });
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
  await validateWorkerIsInitialized();

  return sendMessage('CLIENT', { sql, params, method });
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
