-- Crear base de datos
CREATE DATABASE IF NOT EXISTS cafeteria
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE cafeteria;

-- Tabla: categorias
CREATE TABLE categorias (
  id_categoria INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  PRIMARY KEY (id_categoria)
) ENGINE=InnoDB;

-- Tabla: direcciones
CREATE TABLE direcciones (
  id_direccion INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) DEFAULT NULL,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) DEFAULT NULL,
  referencia TEXT DEFAULT NULL,
  PRIMARY KEY (id_direccion),
  KEY id_usuario (id_usuario)
) ENGINE=InnoDB;

-- Tabla: ingredientes
CREATE TABLE ingredientes (
  id_ingrediente INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  unidad VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (id_ingrediente)
) ENGINE=InnoDB;

-- Tabla: pagos
CREATE TABLE pagos (
  id_pago INT(11) NOT NULL AUTO_INCREMENT,
  id_pedido INT(11) DEFAULT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo ENUM('tarjeta','qr','efectivo') DEFAULT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente','completado','fallido') DEFAULT 'pendiente',
  PRIMARY KEY (id_pago),
  KEY id_pedido (id_pedido)
) ENGINE=InnoDB;

-- Tabla: pedidos
CREATE TABLE pedidos (
  id_pedido INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) DEFAULT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente','en_preparacion','listo','entregado','cancelado') DEFAULT 'pendiente',
  metodo_pago ENUM('tarjeta','qr','efectivo') DEFAULT 'efectivo',
  total DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (id_pedido),
  KEY id_usuario (id_usuario)
) ENGINE=InnoDB;

-- Tabla: pedido_detalle
CREATE TABLE pedido_detalle (
  id_detalle INT(11) NOT NULL AUTO_INCREMENT,
  id_pedido INT(11) DEFAULT NULL,
  id_producto INT(11) DEFAULT NULL,
  cantidad INT(11) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_detalle),
  KEY id_pedido (id_pedido),
  KEY id_producto (id_producto)
) ENGINE=InnoDB;

-- Tabla: productos
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
  KEY id_categoria (id_categoria)
) ENGINE=InnoDB;

-- Tabla: producto_ingredientes
CREATE TABLE producto_ingredientes (
  id_producto INT(11) NOT NULL,
  id_ingrediente INT(11) NOT NULL,
  cantidad DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (id_producto, id_ingrediente),
  KEY id_ingrediente (id_ingrediente)
) ENGINE=InnoDB;

-- Tabla: puntos
CREATE TABLE puntos (
  id_puntos INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) DEFAULT NULL,
  puntos_acumulados INT(11) DEFAULT 0,
  ultima_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_puntos),
  KEY id_usuario (id_usuario)
) ENGINE=InnoDB;

-- Tabla: reservas
CREATE TABLE reservas (
  id_reserva INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) DEFAULT NULL,
  fecha_reserva DATE NOT NULL,
  hora TIME NOT NULL,
  num_personas INT(11) NOT NULL,
  estado ENUM('pendiente','confirmada','cancelada') DEFAULT 'pendiente',
  PRIMARY KEY (id_reserva),
  KEY id_usuario (id_usuario)
) ENGINE=InnoDB;

-- Tabla: roles
CREATE TABLE roles (
  id_rol INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_rol)
) ENGINE=InnoDB;

-- Tabla: usuarios
CREATE TABLE usuarios (
  id_usuario INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  contraseña VARCHAR(255) NOT NULL,
  rol ENUM('cliente','admin') DEFAULT 'cliente',
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY email (email)
) ENGINE=InnoDB;

-- Relaciones (FOREIGN KEYS)
ALTER TABLE direcciones
  ADD CONSTRAINT fk_direcciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE pagos
  ADD CONSTRAINT fk_pagos_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido);

ALTER TABLE pedidos
  ADD CONSTRAINT fk_pedidos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE pedido_detalle
  ADD CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
  ADD CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto);

ALTER TABLE productos
  ADD CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria);

ALTER TABLE producto_ingredientes
  ADD CONSTRAINT fk_pi_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
  ADD CONSTRAINT fk_pi_ingrediente FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id_ingrediente);

ALTER TABLE puntos
  ADD CONSTRAINT fk_puntos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);

ALTER TABLE reservas
  ADD CONSTRAINT fk_reservas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);
