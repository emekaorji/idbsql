import { drizzle } from 'drizzle-orm/sqlite-proxy';
import IDBSQL from '../dist';

import * as schema from './schema';

const { client } = new IDBSQL({ schema });

export const db = drizzle(client);
