import { SQLiteDB } from './sqlite-db';
import { WorkerClient } from './worker-client';
import { DBSchema, IDBSQLConfig } from './types';

/**
 * Creates a new IDBSQL instance
 * @param config Configuration for the IDBSQL instance
 * @returns A promise that resolves to the IDBSQL instance
 */
export async function createIDBSQL<T extends DBSchema>(
  config: IDBSQLConfig<T>
) {
  const workerClient = new WorkerClient();
  await workerClient.init(config);
  return new SQLiteDB<T>(workerClient);
}

// Export types and utilities
export * from './types';
export {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  like,
  between,
} from './operators';
