/**
 * Global declarations
 */
declare global {
  var __IDBSQL_WORKER_URL__: string | undefined;
}

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

export { type handlerCallback };
