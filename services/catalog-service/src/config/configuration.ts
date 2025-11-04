export default () => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3003', 10),
  },
  database: {
    host: process.env.DATABASE_HOST || process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'cafeteria',
  },
});