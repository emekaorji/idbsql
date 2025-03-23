declare global {
  interface Window {
    idbsql: IDBSQLCommands;
  }
}

/** The type of message to be sent */
type MessageType = 'CLIENT' | 'SETUP';

// ----------------------------------------------------

/** The data to be sent in a client outgoing message */
interface ClientOutgoingMessageData {
  sql: string;
  params: any[];
  method: 'run' | 'all' | 'values' | 'get';
}

/** The data to be sent in a setup outgoing message */
interface SetupOutgoingMessageData {
  schema: any;
}

/** The data to be sent in an outgoing message */
type OutgoingMessageData<T extends MessageType> = T extends 'CLIENT'
  ? ClientOutgoingMessageData
  : SetupOutgoingMessageData;

/** The client outgoing message to be sent */
interface ClientOutgoingMessage {
  type: 'CLIENT';
  data: ClientOutgoingMessageData;
  messageId: string;
}

/** The setup outgoing message to be sent */
interface SetupOutgoingMessage {
  type: 'SETUP';
  data: SetupOutgoingMessageData;
  messageId: string;
}

/** The outgoing message to be sent */
type OutgoingMessage = ClientOutgoingMessage | SetupOutgoingMessage;

// ----------------------------------------------------

/** The data to be received in a client incoming message */
interface ClientIncomingMessageData {
  rows: any[];
}

/** The data to be received in a setup incoming message */
type SetupIncomingMessageData = string;

/** The data to be received in an incoming message */
type IncomingMessageData<T extends MessageType> = T extends 'CLIENT'
  ? ClientIncomingMessageData
  : SetupIncomingMessageData;

/** The client incoming message to be received */
interface ClientIncomingMessage {
  type: 'RESULT';
  messageId: string;
  data: ClientIncomingMessageData;
  error?: never;
}

/** The setup incoming message to be received */
interface SetupIncomingMessage {
  type: 'RESULT';
  messageId: string;
  data: SetupIncomingMessageData;
  error?: never;
}

/** The error message to be received */
interface ErrorMessage {
  type: 'ERROR';
  messageId: string | 'GLOBAL_ERROR';
  error: string;
  data?: never;
}

/** The incoming message to be received */
type IncomingMessage =
  | ClientIncomingMessage
  | SetupIncomingMessage
  | ErrorMessage;

// ----------------------------------------------------

/** The callback function for the worker message handler */
type CallbackHandler = (value: IncomingMessage) => void;

export {
  type CallbackHandler,
  type ClientIncomingMessage,
  type ClientIncomingMessageData,
  type ClientOutgoingMessage,
  type ClientOutgoingMessageData,
  type ErrorMessage,
  type IncomingMessage,
  type IncomingMessageData,
  type MessageType,
  type OutgoingMessage,
  type OutgoingMessageData,
  type SetupIncomingMessage,
  type SetupIncomingMessageData,
  type SetupOutgoingMessage,
  type SetupOutgoingMessageData,
};
