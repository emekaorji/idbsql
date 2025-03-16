/**
 * The callback function for the worker message handler
 */
type handlerCallback = (
  value:
    | {
        rows: any[];
      }
    | PromiseLike<{
        rows: any[];
      }>
) => void;

declare global {
  interface Window {
    idbsql: IDBSQLCommands;
  }
}

export { type handlerCallback };
