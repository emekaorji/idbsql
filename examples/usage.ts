import { db } from './client';
import { usersTable } from './schema';

async function main() {
  const result = await db.select().from(usersTable);
  console.log(result);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
