-- PRODUCTS DB init script
DROP DATABASE IF EXISTS products_db;
CREATE DATABASE products_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE products_db;

CREATE TABLE categorias (
  id_categoria INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  PRIMARY KEY (id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO categorias (nombre, descripcion) VALUES
('Bebidas Calientes', 'Cafés, tés y bebidas calientes'),
('Bebidas Frías', 'Jugos, smoothies y bebidas refrescantes'),
('Postres', 'Pasteles, galletas y dulces'),
('Snacks', 'Bocadillos y aperitivos');

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
