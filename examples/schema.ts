import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: text('id'),
  name: text('name'),
  email: text('email'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const pokemonTable = sqliteTable('pokemon', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  abilities: text('abilities').$type<string[]>(),
});
