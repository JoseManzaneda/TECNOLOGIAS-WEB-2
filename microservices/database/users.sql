-- USERS DB init script
DROP DATABASE IF EXISTS users_db;
CREATE DATABASE users_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;

CREATE TABLE direcciones (
  id_direccion INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) DEFAULT NULL,
  referencia TEXT DEFAULT NULL,
  PRIMARY KEY (id_direccion),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;

INSERT INTO usuarios (id_usuario, nombre, email, rol) VALUES 
(1, 'Administrador', 'admin@cafeteria.com', 'admin'),
(2, 'Cliente Demo', 'cliente@cafeteria.com', 'cliente');

INSERT INTO direcciones (id_usuario, direccion, ciudad, referencia) VALUES
(2, 'Av. Siempre Viva 123', 'Ciudad de México', 'Entre calle A y calle B');
