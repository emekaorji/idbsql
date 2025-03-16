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
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { client } from 'idbsql';

// Define your schema
const userTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age'),
});

// Initialize the database
const db = drizzle(client, { schema });

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

IDBSQL dynamically generates the worker script in the browser, eliminating the need for separate worker files or complex bundling configurations. This makes it much easier to use the library in any project without worrying about file paths or bundler configurations.

The worker script uses SQL.js to provide SQLite functionality in the browser, loaded from a CDN for convenience. This approach ensures that:

1. No separate worker file needs to be included in your build
2. No complex bundler configuration is required
3. The library works out of the box in any environment

### Custom SQL.js Configuration

If you need to use a custom version of SQL.js or configure it differently, you can modify the worker code by editing the `src/worker.js` file and rebuilding the library.

### Development

If you're developing or contributing to IDBSQL, the worker code is stored in `src/worker.js` and is automatically inlined into the library during the build process. This approach provides better code organization and maintainability while still delivering a seamless experience for end users.

To modify the worker:

1. Edit the `src/worker.js` file
2. Run `npm run build` to generate the inlined worker code
3. Test your changes

## How It Works

IDBSQL loads your IndexedDB database into an in-memory SQLite database running in a web worker. This provides several benefits:

1. Better performance by offloading database operations to a separate thread
2. SQL query capabilities via SQLite
3. Type-safe queries with Drizzle ORM
4. Reduced main thread blocking

## License

MIT
