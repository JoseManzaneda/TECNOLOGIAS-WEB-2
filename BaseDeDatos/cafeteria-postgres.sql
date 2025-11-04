-- Tipos ENUM para PostgreSQL
CREATE TYPE metodo_pago_enum AS ENUM ('tarjeta', 'qr', 'efectivo');
CREATE TYPE estado_pago_enum AS ENUM ('pendiente', 'completado', 'fallido');
CREATE TYPE estado_pedido_enum AS ENUM ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado');
CREATE TYPE estado_reserva_enum AS ENUM ('pendiente', 'confirmada', 'cancelada');
CREATE TYPE rol_usuario_enum AS ENUM ('cliente', 'admin');

-- Tabla: categorias
CREATE TABLE categorias (
  id_categoria SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL
);

-- Tabla: usuarios
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20) DEFAULT NULL,
  contrasena VARCHAR(255) NOT NULL,
  rol rol_usuario_enum DEFAULT 'cliente',
  fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: direcciones
CREATE TABLE direcciones (
  id_direccion SERIAL PRIMARY KEY,
  id_usuario INT DEFAULT NULL,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) DEFAULT NULL,
  referencia TEXT DEFAULT NULL,
  CONSTRAINT fk_direcciones_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Tabla: ingredientes
CREATE TABLE ingredientes (
  id_ingrediente SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  unidad VARCHAR(50) DEFAULT NULL
);

-- Tabla: productos
CREATE TABLE productos (
  id_producto SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  precio DECIMAL(10,2) NOT NULL,
  id_categoria INT DEFAULT NULL,
  imagen_url VARCHAR(255) DEFAULT NULL,
  stock INT DEFAULT 0,
  disponible BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_producto_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

-- Tabla: pedidos
CREATE TABLE pedidos (
  id_pedido SERIAL PRIMARY KEY,
  id_usuario INT DEFAULT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado estado_pedido_enum DEFAULT 'pendiente',
  metodo_pago metodo_pago_enum DEFAULT 'efectivo',
  total DECIMAL(10,2) DEFAULT NULL,
  CONSTRAINT fk_pedidos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Tabla: pagos
CREATE TABLE pagos (
  id_pago SERIAL PRIMARY KEY,
  id_pedido INT DEFAULT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo metodo_pago_enum DEFAULT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado estado_pago_enum DEFAULT 'pendiente',
  CONSTRAINT fk_pagos_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido)
);

-- Tabla: pedido_detalle
CREATE TABLE pedido_detalle (
  id_detalle SERIAL PRIMARY KEY,
  id_pedido INT DEFAULT NULL,
  id_producto INT DEFAULT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
  CONSTRAINT fk_detalle_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

-- Tabla: producto_ingredientes
CREATE TABLE producto_ingredientes (
  id_producto INT NOT NULL,
  id_ingrediente INT NOT NULL,
  cantidad DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (id_producto, id_ingrediente),
  CONSTRAINT fk_pi_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
  CONSTRAINT fk_pi_ingrediente FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id_ingrediente)
);

-- Tabla: puntos
CREATE TABLE puntos (
  id_puntos SERIAL PRIMARY KEY,
  id_usuario INT DEFAULT NULL,
  puntos_acumulados INT DEFAULT 0,
  ultima_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_puntos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Tabla: reservas
CREATE TABLE reservas (
  id_reserva SERIAL PRIMARY KEY,
  id_usuario INT DEFAULT NULL,
  fecha_reserva DATE NOT NULL,
  hora TIME NOT NULL,
  num_personas INT NOT NULL,
  estado estado_reserva_enum DEFAULT 'pendiente',
  CONSTRAINT fk_reservas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Tabla: roles (Opcional, ya que se usa ENUM en usuarios)
CREATE TABLE roles (
  id_rol SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);
