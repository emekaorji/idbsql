interface IDBSQLCommands {
  createTable: (name: string, schema: Record<string, string>) => void;
  insert: (name: string, data: Record<string, any>) => void;
  select: (name: string) => void;
  update: (name: string, data: Record<string, any>) => void;
  delete: (name: string, data: Record<string, any>) => void;
}

/**
 * IDBSQL Commands
 *
 * Commands add a bunch of functions to the global window object that can be
 * used to interact with the database right in the browser console.
 *
 * This is useful for debugging and for testing.
 *
 * Commands are available in the global window object.
 *
 * @example
 *
 * window.idbsql.createTable('users', {
 *   id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
 *   name: 'TEXT',
 *   email: 'TEXT'
 * });
 *
 * window.idbsql.insert('users', {
 *   name: 'John Doe',
 *   email: 'john.doe@example.com'
 * });
 *
 * window.idbsql.select('users');
 *
 * window.idbsql.update('users', {
 *   name: 'John Doe',
 *   email: 'john.doe@example.com'
 * });
 *
 * window.idbsql.delete('users', {
 *   id: 1
 * });
 *
 * window.idbsql.run('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)');
 *
 * window.idbsql.run('INSERT INTO users (name, email) VALUES ("John Doe", "john.doe@example.com")');
 *
 * window.idbsql.run('UPDATE users SET name = "John Doe" WHERE id = 1');
 *
 * window.idbsql.run('DELETE FROM users WHERE id = 1');
 *
 * window.idbsql.run('SELECT * FROM users');
 *
 */
const idbsql: IDBSQLCommands = {
  createTable: (name: string, schema: Record<string, string>) => {
    console.log('createTable', name, schema);
  },
  insert: (name: string, data: Record<string, any>) => {
    console.log('insert', name, data);
  },
  select: (name: string) => {
    console.log('select', name);
  },
  update: (name: string, data: Record<string, any>) => {
    console.log('update', name, data);
  },
  delete: (name: string, data: Record<string, any>) => {
    console.log('delete', name, data);
  },
};

if (typeof window !== 'undefined') {
  window.idbsql = idbsql;
}
