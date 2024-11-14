import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, 'credentials.env'),
});

export let conexao;

export function connectDatabase() {
  console.log('Turso Database Configuration:', {
    DATABASE_URL: process.env.TURSO_DATABASE_URL,
    AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'PROVIDED' : 'NOT_PROVIDED',
  });

  try {
    conexao = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
    console.error('Connection Setup Error:', error);
  }
}

export async function executeQuery(query, params = []) {
  try {
    const result = await conexao.execute({
      sql: query,
      args: params,
    });
    return result;
  } catch (error) {
    console.error('Query Error:', error);
    throw error;
  }
}
