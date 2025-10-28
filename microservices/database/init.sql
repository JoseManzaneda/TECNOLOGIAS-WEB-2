-- ============================================
-- SCRIPTS DE BASES DE DATOS INDEPENDIENTES
-- Sistema de Microservicios - Cafetería
-- ============================================

-- ============================================
-- BASE DE DATOS 1: AUTH SERVICE
-- Responsabilidad: Autenticación y credenciales
-- ============================================

DROP DATABASE IF EXISTS auth_db;
CREATE DATABASE auth_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE auth_db;

CREATE TABLE usuarios (
  id_usuario INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  rol ENUM('cliente','admin') DEFAULT 'cliente',
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabla para tokens de refresco (opcional)
CREATE TABLE refresh_tokens (
  id INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_token (token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Usuario admin por defecto (contraseña: Admin123)
INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES 
('Administrador', 'admin@cafeteria.com', '$2b$10$XkEpYQH5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h', 'admin'),
('Cliente Demo', 'cliente@cafeteria.com', '$2b$10$XkEpYQH5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h', 'cliente');

-- ============================================
-- BASE DE DATOS 2: USERS SERVICE
-- Responsabilidad: Perfiles y datos de usuario
-- ============================================

DROP DATABASE IF EXISTS users_db;
CREATE DATABASE users_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE users_db;

CREATE TABLE usuarios (
  id_usuario INT(11) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20) DEFAULT NULL,
  rol ENUM('cliente','admin') DEFAULT 'cliente',
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE direcciones (
  id_direccion INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) DEFAULT NULL,
  referencia TEXT DEFAULT NULL,
  PRIMARY KEY (id_direccion),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Sincronizar datos iniciales desde auth_db
INSERT INTO usuarios (id_usuario, nombre, email, rol) VALUES 
(1, 'Administrador', 'admin@cafeteria.com', 'admin'),
(2, 'Cliente Demo', 'cliente@cafeteria.com', 'cliente');

-- Direcciones de ejemplo
INSERT INTO direcciones (id_usuario, direccion, ciudad, referencia) VALUES
(2, 'Av. Siempre Viva 123', 'Ciudad de México', 'Entre calle A y calle B');

-- ============================================
-- BASE DE DATOS 3: PRODUCTS SERVICE
-- Responsabilidad: Catálogo de productos
-- ============================================

DROP DATABASE IF EXISTS products_db;
CREATE DATABASE products_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE products_db;

CREATE TABLE categorias (
  id_categoria INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  PRIMARY KEY (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE productos (
  id_producto INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  precio DECIMAL(10,2) NOT NULL,
  id_categoria INT(11) DEFAULT NULL,
  imagen_url VARCHAR(255) DEFAULT NULL,
  stock INT(11) DEFAULT 0,
  disponible TINYINT(1) DEFAULT 1,
  PRIMARY KEY (id_producto),
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL,
  INDEX idx_categoria (id_categoria),
  INDEX idx_disponible (disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Datos de ejemplo: Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Bebidas Calientes', 'Cafés, tés y bebidas calientes'),
('Bebidas Frías', 'Jugos, smoothies y bebidas refrescantes'),
('Postres', 'Pasteles, galletas y dulces'),
('Snacks', 'Bocadillos y aperitivos');

-- Datos de ejemplo: Productos
INSERT INTO productos (nombre, descripcion, precio, id_categoria, stock, disponible) VALUES
('Cappuccino', 'Café espresso con leche vaporizada y espuma', 45.00, 1, 50, 1),
('Latte', 'Café espresso con leche caliente', 42.00, 1, 50, 1),
('Americano', 'Café espresso con agua caliente', 35.00, 1, 50, 1),
('Té Verde', 'Té verde japonés premium', 30.00, 1, 40, 1),
('Smoothie de Fresa', 'Batido natural de fresa con yogurt', 55.00, 2, 30, 1),
('Limonada Natural', 'Limonada fresca con menta', 35.00, 2, 40, 1),
('Pastel de Chocolate', 'Delicioso pastel de chocolate artesanal', 65.00, 3, 20, 1),
('Croissant', 'Croissant francés recién horneado', 40.00, 4, 25, 1),
('Muffin de Arándanos', 'Muffin casero con arándanos frescos', 38.00, 4, 30, 1),
('Frappe de Caramelo', 'Bebida fría de café con caramelo', 58.00, 2, 35, 1);

-- ============================================
-- VERIFICACIÓN DE INSTALACIÓN
-- ============================================

-- Verificar auth_db
SELECT 'AUTH_DB - Usuarios registrados:' AS info;
USE auth_db;
SELECT id_usuario, nombre, email, rol FROM usuarios;

-- Verificar users_db
SELECT 'USERS_DB - Perfiles sincronizados:' AS info;
USE users_db;
SELECT id_usuario, nombre, email, rol FROM usuarios;
SELECT COUNT(*) AS total_direcciones FROM direcciones;

-- Verificar products_db
SELECT 'PRODUCTS_DB - Catálogo:' AS info;
USE products_db;
SELECT COUNT(*) AS total_categorias FROM categorias;
SELECT COUNT(*) AS total_productos FROM productos;

SELECT 'INSTALACIÓN COMPLETADA EXITOSAMENTE' AS status;
