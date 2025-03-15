import { createIDBSQL, eq } from '../src';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Define your schema
const userTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age'),
});

async function main() {
  try {
    // Initialize the database
    const db = await createIDBSQL({
      dbName: 'example-db',
      schema: {
        users: userTable,
      },
    });

    console.log('Database initialized');

    // Insert a user
    await db.insert(userTable).values({
      id: '1',
      name: 'John Doe',
      age: 30,
    });

    console.log('User inserted');

    // Query the user
    const users = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        age: userTable.age,
      })
      .from(userTable)
      .where(eq(userTable.id, '1'));

    console.log('User queried:', users);

    // Update the user
    await db.update(userTable).set({ age: 31 }).where(eq(userTable.id, '1'));

    console.log('User updated');

    // Query the updated user
    const updatedUsers = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        age: userTable.age,
      })
      .from(userTable)
      .where(eq(userTable.id, '1'));

    console.log('Updated user:', updatedUsers);

    // Delete the user
    await db.delete(userTable).where(eq(userTable.id, '1'));

    console.log('User deleted');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
