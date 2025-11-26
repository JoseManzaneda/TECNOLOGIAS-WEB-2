-- Crear bases de datos separadas para microservicios

-- Base de datos para Auth y Users
CREATE DATABASE IF NOT EXISTS cafeteria_auth
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

-- Base de datos para Products, Categories e Ingredientes
CREATE DATABASE IF NOT EXISTS cafeteria_products
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

-- Base de datos para Orders (Pedidos y Pagos)
CREATE DATABASE IF NOT EXISTS cafeteria_orders
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

-- Base de datos para Customer (Direcciones, Puntos, Reservas)
CREATE DATABASE IF NOT EXISTS cafeteria_customer
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

-- Mostrar bases de datos creadas
SHOW DATABASES LIKE 'cafeteria_%';
