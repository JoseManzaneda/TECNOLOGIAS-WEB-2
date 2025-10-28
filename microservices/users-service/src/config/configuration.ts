export default () => ({
  port: parseInt(process.env.PORT || '3002', 10),
  environment: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'users_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRATION || '1h',
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    queue: process.env.RABBITMQ_QUEUE || 'users_queue',
    exchange: process.env.RABBITMQ_EXCHANGE || 'cafeteria.events',
  },
});
