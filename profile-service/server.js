const Fastify = require('fastify');
require('dotenv').config();

const fastify = Fastify({ logger: true });

fastify.register(require('@fastify/cors'), { origin: 'http://localhost:3000' });
fastify.register(require('./database'));

const verifyJWT = require('./auth');

// GET /api/profile - получить профиль текущего пользователя
fastify.get('/api/profile', { preHandler: verifyJWT }, async (request, reply) => {
  try {
    const result = await fastify.pg.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [request.user.userId]
    );
    
    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'Профиль не найден' });
    }
    
    reply.send({ profile: result.rows[0] });
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ error: 'Ошибка сервера' });
  }
});

// POST /api/profile - создать профиль
fastify.post('/api/profile', { preHandler: verifyJWT }, async (request, reply) => {
  try {
    const { displayName, bio } = request.body;
    const userId = request.user.userId;

    // Проверяем, нет ли уже профиля у этого пользователя
    const existing = await fastify.pg.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );
    
    if (existing.rows.length > 0) {
      return reply.code(409).send({ error: 'Профиль уже существует' });
    }

    const result = await fastify.pg.query(
      'INSERT INTO profiles (user_id, display_name, bio) VALUES ($1, $2, $3) RETURNING *',
      [userId, displayName, bio]
    );

    reply.code(201).send({ 
      message: 'Профиль создан',
      profile: result.rows[0]
    });
  } catch (err) {
    fastify.log.error(err);
    reply.code(500).send({ error: 'Ошибка сервера' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3001;
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Profile Service запущен на порту ${PORT}`);
});