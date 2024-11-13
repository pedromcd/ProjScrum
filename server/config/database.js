import mysql from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load the env file
dotenv.config({
  path: path.resolve(__dirname, 'credentials.env'),
});

export let conexao;

export function connectDatabase() {
  console.log('Environment Variables:', {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? 'PROVIDED' : 'NOT_PROVIDED',
    DB_NAME: process.env.DB_NAME,
  });

  try {
    conexao = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    conexao.connect((err) => {
      if (err) {
        console.error('Detailed Connection Error:', {
          message: err.message,
          code: err.code,
          sqlState: err.sqlState,
          sqlMessage: err.sqlMessage,
        });
        return;
      }
      console.log('Conexão com o banco de dados estabelecida com sucesso.');
    });
  } catch (error) {
    console.error('Connection Setup Error:', error);
  }
}
