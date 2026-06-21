const jwt = require('jsonwebtoken');

function verifyJWT(request, reply, done) {
  const authHeader = request.headers['authorization'];
  
  if (!authHeader) {
    // В хуках Fastify ошибки передаются через done(err)
    return done(new Error('Токен не предоставлен'));
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
    done(); // Успех - вызываем done без ошибок
  } catch (err) {
    done(new Error('Невалидный токен'));
  }
}

module.exports = verifyJWT;