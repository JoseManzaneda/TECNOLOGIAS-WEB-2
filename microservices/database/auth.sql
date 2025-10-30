-- AUTH DB init script
DROP DATABASE IF EXISTS auth_db;
CREATE DATABASE auth_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
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

INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES 
('Administrador', 'admin@cafeteria.com', '$2b$10$XkEpYQH5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h', 'admin'),
('Cliente Demo', 'cliente@cafeteria.com', '$2b$10$XkEpYQH5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h5B5h', 'cliente');
