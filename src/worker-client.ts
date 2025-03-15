import {
  DBSchema,
  IDBSQLConfig,
  MessageType,
  WorkerMessage,
  QueryMessage,
} from './types';

/**
 * Client for communicating with the worker thread
 */
export class WorkerClient {
  private worker: Worker;
  private messageHandlers: Map<string, (result: any) => void> = new Map();
  private errorHandlers: Map<string, (error: string) => void> = new Map();
  private initialized = false;

  /**
   * Creates a new worker client
   */
  constructor() {
    // Create a new worker with the worker script
    const workerBlob = new Blob(
      [`importScripts('${this.getWorkerScriptUrl()}');`],
      { type: 'application/javascript' }
    );
    this.worker = new Worker(URL.createObjectURL(workerBlob));

    // Set up message handler
    this.worker.onmessage = this.handleWorkerMessage.bind(this);
  }

  /**
   * Gets the URL of the worker script
   * @returns The URL of the worker script
   */
  private getWorkerScriptUrl(): string {
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
   * Initializes the worker with the given configuration
   * @param config Configuration for the IDBSQL instance
   * @returns A promise that resolves when the worker is initialized
   */
  public async init<T extends DBSchema>(
    config: IDBSQLConfig<T>
  ): Promise<void> {
    if (this.initialized) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const messageId = this.generateMessageId();

      this.messageHandlers.set(messageId, () => {
        this.initialized = true;
        resolve();
      });

      this.errorHandlers.set(messageId, (error) => {
        reject(new Error(error));
      });

      this.worker.postMessage({
        type: MessageType.INIT,
        id: messageId,
        config,
      });
    });
  }

  /**
   * Executes a query on the worker
   * @param sql SQL query to execute
   * @param params Parameters for the query
   * @returns A promise that resolves with the query result
   */
  public async query<T = any>(sql: string, params: any[] = []): Promise<T> {
    if (!this.initialized) {
      throw new Error('Worker not initialized');
    }

    return new Promise<T>((resolve, reject) => {
      const messageId = this.generateMessageId();

      this.messageHandlers.set(messageId, (result) => {
        resolve(result);
      });

      this.errorHandlers.set(messageId, (error) => {
        reject(new Error(error));
      });

      const message: QueryMessage = {
        type: MessageType.QUERY,
        id: messageId,
        sql,
        params,
      };

      this.worker.postMessage(message);
    });
  }

  /**
   * Handles messages from the worker
   * @param event Message event
   */
  private handleWorkerMessage(event: MessageEvent<WorkerMessage>): void {
    const message = event.data;
    const { id, type } = message;

    if (type === MessageType.RESULT) {
      const handler = this.messageHandlers.get(id);
      if (handler) {
        handler(message.result);
        this.messageHandlers.delete(id);
        this.errorHandlers.delete(id);
      }
    } else if (type === MessageType.ERROR) {
      const handler = this.errorHandlers.get(id);
      if (handler) {
        handler(message.error);
        this.messageHandlers.delete(id);
        this.errorHandlers.delete(id);
      }
    }
  }

  /**
   * Generates a unique message ID
   * @returns A unique message ID
   */
  private generateMessageId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Terminates the worker
   */
  public terminate(): void {
    this.worker.terminate();
  }
}
