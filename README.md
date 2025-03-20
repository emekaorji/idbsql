# IDBSQL

A high-performance library for interacting with IndexedDB on the browser using SQLite and Drizzle ORM in a separate worker thread.

## Features

- SQLite-powered IndexedDB wrapper that brings SQL capabilities to the browser
- SQLite WASM execution in dedicated web worker thread
- Type-safe query building via Drizzle ORM integration
- In-memory database operations for minimal latency
- Promise-based asynchronous API
- Comprehensive TypeScript type definitions

## Installation

```bash
npm install idbsql
```

## ESM Module Format

IDBSQL is distributed as an ESM (ECMAScript Modules) package. This modern module format provides better tree-shaking, static analysis, and compatibility with newer JavaScript tools and frameworks.

### Usage with ESM

```javascript
import { client } from 'idbsql';
```

### Usage with CommonJS Projects

If you're using a CommonJS project, you'll need to use dynamic imports:

```javascript
async function init() {
  const { client } = await import('idbsql');
  // Use client here
}
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

IDBSQL is built as an ESM (ECMAScript Modules) package. The development workflow has been configured to work seamlessly with modern JavaScript tooling.

#### Project Setup

- **Module System**: Uses native ESM with `"type": "module"` in package.json
- **TypeScript Config**: Configured with `"moduleResolution": "bundler"` for compatibility with modern bundlers
- **Worker Generation**: Automatically inlines the worker code during build

#### Development Commands

```bash
# Generate the worker code
npm run generate-worker

# Watch for changes and rebuild (worker, library, and examples)
npm run dev

# Build the library for production
npm run build
```

#### Development Components

The development workflow is split into three parallel processes, color-coded in the terminal for better visibility:

- **Worker** (Gray): Watches for changes to worker.js and regenerates the worker code
- **Library** (Green): Watches for changes to TypeScript files and rebuilds the library
- **Examples** (Blue): Runs a Vite dev server for testing the library in a real-world context

#### Development Tools

- **tsx**: Fast TypeScript execution (replacing ts-node)
- **Vite**: Used for serving example applications
- **Concurrently**: Runs multiple development processes in parallel
- **Nodemon**: Watches for file changes and triggers rebuilds

#### Modifying the Worker

If you need to modify the worker functionality:

1. Edit the `src/worker.js` file
2. The changes will be automatically detected and the worker code will be regenerated
3. The library will be rebuilt to include the new worker code

#### Project Structure

```
idbsql/
├── dist/                 # Compiled output (generated)
├── src/                  # Source code
│   ├── worker.js         # Web worker implementation
│   ├── worker-generated.ts  # Auto-generated worker code (don't edit)
│   └── index.ts          # Main library entry point
├── scripts/
│   └── generate-worker.ts # Script to generate worker code
├── examples/             # Example applications
├── package.json          # Project configuration
└── tsconfig.json         # TypeScript configuration
```

## How It Works

IDBSQL loads your IndexedDB database into an in-memory SQLite database running in a web worker. This provides several benefits:

1. Better performance by offloading database operations to a separate thread
2. SQL query capabilities via SQLite
3. Type-safe queries with Drizzle ORM
4. Reduced main thread blocking

## License

MIT
