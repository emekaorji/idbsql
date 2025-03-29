import {
  ClientIncomingMessageData,
  type CallbackHandler,
  type IncomingMessage,
  type IncomingMessageData,
  type MessageType,
  type OutgoingMessage,
  type OutgoingMessageData,
} from './types';
import { generateMessageId, wait } from './utils';
import { workerCode } from './worker-generated';

interface IDBSQLOptions {
  databaseName?: string;
  schema: Record<string, unknown>;
}

interface Table {
  id: string;
  columns: {
    columnName: string;
    columnDataType: string;
  }[];
}

type Schema = Table[];

const defaultOptions = {
  databaseName: 'idb-sql',
};

class IDBSQL {
  client: (
    sql: string,
    params?: any[],
    method?: 'run' | 'all' | 'values' | 'get'
  ) => Promise<ClientIncomingMessageData>;
  private messageHandlers: Map<string, CallbackHandler> = new Map();
  private worker: Worker | null = null;
  private databaseName: string;
  private schema: Schema;

  constructor(options: IDBSQLOptions) {
    const { databaseName, schema } = { ...defaultOptions, ...options };
    this.databaseName = databaseName;
    this.schema = this.parseSchema(schema);

    this.client = (...params) => this._client(...params);

    this.setup();
  }

  private parseSchema(schema: Record<string, unknown>): Schema {
    try {
      const parsedSchema = Object.entries(schema).map(
        ([tableName, table]: [string, any]) => ({
          id: tableName,
          columns: Object.entries(table).map(
            ([columnName, column]: [string, any]) => ({
              columnName,
              columnDataType: column.dataType as string,
            })
          ),
        })
      );

      return parsedSchema;
    } catch (error) {
      throw new Error('Error parsing schema' + error);
    }
  }

  /**
   * Drizzle-like client for executing queries
   * @param sql - The SQL query to execute
   * @param params - The parameters to pass to the query
   * @param method - The method to use to execute the query
   * @returns A promise that resolves to the result of the query
   */
  private async _client(
    sql: string,
    params: any[] = [],
    method: 'run' | 'all' | 'values' | 'get' = 'all'
  ) {
    await this.validateWorkerIsInitialized();

    return this.sendMessage('CLIENT', { sql, params, method });
  }

  /**
   * Sets up the driver
   */
  private async setup() {
    this.initializeWorker();
    await this.validateWorkerIsInitialized();
    await this.setupDatabase();
  }

  /**
   * Sets up the worker
   */
  private initializeWorker() {
    // Create a new worker with the embedded worker code
    const workerBlob = new Blob([workerCode], {
      type: 'application/javascript',
    });
    this.worker = new Worker(URL.createObjectURL(workerBlob));

    this.worker.addEventListener('message', (event) =>
      this.handleMessage(event)
    );
  }

  /**
   * Validates that the worker is initialized
   * @returns A promise that resolves when the worker is initialized
   */
  private async validateWorkerIsInitialized() {
    return new Promise<void>((resolve, reject) => {
      if (this.worker) {
        resolve();
        return;
      }

      let intervalId: NodeJS.Timeout;
      let timeoutId: NodeJS.Timeout;

      intervalId = setInterval(() => {
        if (this.worker) {
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
  private async setupDatabase() {
    const result = await this.sendMessage('SETUP', {
      databaseName: this.databaseName,
      schema: this.schema,
    });

    console.log('Database setup', result);
  }

  /**
   * Handles messages from the worker
   * @param event - The message event
   */
  private handleMessage(event: MessageEvent<IncomingMessage>) {
    const { messageId } = event.data;

    if (!this.messageHandlers) {
      this.messageHandlers = new Map();
    }

    if (messageId === 'GLOBAL_ERROR') {
      console.error(event.data.error);
    } else if (this.messageHandlers.has(messageId)) {
      this.messageHandlers.get(messageId)?.(event.data);
      this.messageHandlers.delete(messageId);
    }
  }

  /**
   * Sends a message to the worker
   * @param type - The type of message to send
   * @param data - The data to send
   * @returns A promise that resolves to the result of the message
   */
  private async sendMessage<T extends MessageType>(
    type: T,
    data: OutgoingMessageData<T>
  ) {
    const messageId = generateMessageId();
    const _data = JSON.stringify(data);

    return new Promise<IncomingMessageData<T>>((resolve, reject) => {
      if (!this.messageHandlers) {
        this.messageHandlers = new Map();
      }

      this.messageHandlers.set(messageId, (value) => {
        if (value.type === 'ERROR') {
          reject(value.error);
        } else {
          resolve(JSON.parse(value.data as string) as IncomingMessageData<T>);
        }
      });

      this.worker!.postMessage({
        type,
        data: _data,
        messageId,
      } as OutgoingMessage);
    });
  }

  /**
   * Terminates the worker
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export {};
export default IDBSQL;
