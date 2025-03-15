# IDBSQL

A high-performance library for interacting with IndexedDB using SQLite and Drizzle ORM in a separate worker thread.

## Features

- Uses SQLite WASM in a web worker for better performance
- Drizzle ORM for type-safe database queries
- In-memory database for fast queries
- Asynchronous API with promises
- TypeScript support

## Installation

```bash
npm install idbsql
```

## Usage

### Define your schema

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createIDBSQL } from 'idbsql';

// Define your schema
const userTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age'),
});

// Initialize the database
const db = await createIDBSQL({
  dbName: 'my-database',
  schema: {
    users: userTable,
  },
});

// Query the database
const users = await db.select({
  id: userTable.id,
  name: userTable.name,
  age: userTable.age,
}).from(userTable).where(eq(userTable.id, "1"));

// Insert data
await db.insert(userTable).values({
  id: '2',
  name: 'Jane Doe',
  age: 30,
});

// Update data
await db.update(userTable)
  .set({ age: 31 })
  .where(eq(userTable.id, '2'));

// Delete data
await db.delete(userTable)
  .where(eq(userTable.id, '2'));
```

## Worker Script

IDBSQL uses a worker script (`idbsql-worker.js`) to run SQLite operations in a separate thread. This script is automatically included in the build and will be loaded by the library when needed.

### Custom Worker URL

If you need to specify a custom location for the worker script, you can set the global variable `__IDBSQL_WORKER_URL__`:

```javascript
// Set this before importing IDBSQL
window.__IDBSQL_WORKER_URL__ = '/path/to/idbsql-worker.js';

// Then import and use IDBSQL
import { createIDBSQL } from 'idbsql';
```

### Bundling with Webpack or Rollup

If you're using a bundler like Webpack or Rollup, you'll need to make sure the worker script is included in your build. Here's an example of how to do this with Webpack:

```javascript
// webpack.config.js
module.exports = {
  // ... other config
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/idbsql/dist/idbsql-worker.js',
          to: 'idbsql-worker.js'
        },
      ],
    }),
  ],
};
```

## How It Works

IDBSQL loads your IndexedDB database into an in-memory SQLite database running in a web worker. This provides several benefits:

1. Better performance by offloading database operations to a separate thread
2. SQL query capabilities via SQLite
3. Type-safe queries with Drizzle ORM
4. Reduced main thread blocking

## License

MIT
