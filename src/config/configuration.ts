export default () => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  
  // Bases de datos por contexto
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    name: process.env.DB_NAME || 'cafeteria',
    auth: process.env.DATABASE_AUTH || 'cafeteria_auth',
    products: process.env.DATABASE_PRODUCTS || 'cafeteria_products',
    orders: process.env.DATABASE_ORDERS || 'cafeteria_orders',
    customer: process.env.DATABASE_CUSTOMER || 'cafeteria_customer',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'changeme',
    expiresIn: process.env.JWT_EXPIRES || '24h',
  },
  
  // Microservicios URLs
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    users: process.env.USERS_SERVICE_URL || 'http://localhost:3002',
    products: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003',
    orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:3004',
    customer: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3005',
  },
});