import { SQLiteTable } from 'drizzle-orm/sqlite-core';

/**
 * Global declarations
 */
declare global {
  var __IDBSQL_WORKER_URL__: string | undefined;
}

/**
 * Database schema type
 */
export type DBSchema = Record<string, SQLiteTable>;

/**
 * Configuration for the IDBSQL instance
 */
export interface IDBSQLConfig<T extends DBSchema> {
  /**
   * Name of the database
   */
  dbName: string;

  /**
   * Schema of the database
   */
  schema: T;

  /**
   * Version of the database
   * @default 1
   */
  version?: number;
}

/**
 * Message types for worker communication
 */
export enum MessageType {
  INIT = 'INIT',
  QUERY = 'QUERY',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
}

/**
 * Base message interface
 */
export interface Message {
  type: MessageType;
  id: string;
}

/**
 * Init message
 */
export interface InitMessage extends Message {
  type: MessageType.INIT;
  config: IDBSQLConfig<any>;
}

/**
 * Query message
 */
export interface QueryMessage extends Message {
  type: MessageType.QUERY;
  sql: string;
  params: any[];
}

/**
 * Result message
 */
export interface ResultMessage extends Message {
  type: MessageType.RESULT;
  result: any;
}

/**
 * Error message
 */
export interface ErrorMessage extends Message {
  type: MessageType.ERROR;
  error: string;
}

/**
 * Worker message type
 */
export type WorkerMessage =
  | InitMessage
  | QueryMessage
  | ResultMessage
  | ErrorMessage;
