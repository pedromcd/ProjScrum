import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config({ path: '../credentials.env' }); // Adjust path if needed

export let conexao;

export function connectDatabase() {
  conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  conexao.connect((err) => {
    if (err) {
      console.error('Erro ao conectar ao banco de dados:', err);
      return;
    }
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
  });
}
