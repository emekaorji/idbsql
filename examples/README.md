# IDBSQL Examples

This directory contains examples of how to use the IDBSQL library with Drizzle ORM.

## Running the Example

To run the example locally:

1. Make sure you have installed all dependencies:

   ```
   npm install
   ```

2. Build the library:

   ```
   npm run build
   ```

3. Start the development server:

   ```
   npm run example:dev
   ```

   This will start a Vite development server and open the example in your browser.

## Building the Example

To build the example for production:

```
npm run example:build
```

This will create a production-ready build in the `dist-example` directory.

## Example Structure

- `index.html` - The HTML entry point
- `main.ts` - The main TypeScript file that demonstrates IDBSQL usage
- `schema.ts` - Defines the database schema using Drizzle ORM
- `client.ts` - Sets up the database client

## How It Works

The example demonstrates:

1. Creating tables
2. Inserting data
3. Querying data
4. Updating records
5. Deleting records

All operations are performed using Drizzle ORM syntax, but the underlying storage is IndexedDB via SQLite running in a Web Worker.
