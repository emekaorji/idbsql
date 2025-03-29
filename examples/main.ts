// import { eq } from 'drizzle-orm';
import { db } from './client';
import { pokemonTable } from './schema';

async function testDB() {
  db;
  // console.log('Inserting data...');
  // await db.insert(pokemonTable).values([
  //   { id: 1, name: 'Charizard', abilities: ['fire', 'fly'] },
  //   { id: 2, name: 'Squirtle', abilities: ['water', 'shell'] },
  // ]);
  // console.log('Fetching all Pokémon...');
  // const pokemons = await db.select().from(pokemonTable);
  // console.log('Pokémon List:', pokemons);
  // console.log('Updating Charizard...');
  // await db
  //   .update(pokemonTable)
  //   .set({ abilities: ['flames', 'dragon'] })
  //   .where(eq(pokemonTable.name, 'Charizard'));
  // console.log('Fetching updated Pokémon...');
  // const updatedPokemon = await db
  //   .select()
  //   .from(pokemonTable)
  //   .where(eq(pokemonTable.name, 'Charizard'));
  // console.log('Updated Pokémon:', updatedPokemon);
  // console.log('Deleting Squirtle...');
  // await db.delete(pokemonTable).where(eq(pokemonTable.name, 'Squirtle'));
  // console.log('Final Pokémon List:', await db.select().from(pokemonTable));
}

testDB();
