import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { client } from '../src';
import * as schema from './schema';

export const db = drizzle(client, { schema });
