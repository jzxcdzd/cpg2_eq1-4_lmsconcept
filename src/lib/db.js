import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export async function createConnection(database) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: database,
    ssl: JSON.parse(process.env.DB_SSL)
  });
  return connection;
}