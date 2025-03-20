import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { client } from '../dist';
import * as schema from './schema';

export const db = drizzle(client, { schema });
