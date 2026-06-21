const fp = require('fastify-plugin');

async function databasePlugin(fastify, options) {
  await fastify.register(require('@fastify/postgres'), {
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  });

  // Создаём таблицу profiles при старте
  await fastify.pg.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL,
      display_name VARCHAR(255),
      bio TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(err => fastify.log.error('Ошибка создания таблицы profiles:', err));
}

module.exports = fp(databasePlugin);