-- Crear el schema para User Service
CREATE SCHEMA IF NOT EXISTS users_schema;

-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON SCHEMA users_schema TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA users_schema TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA users_schema TO admin;

-- Configurar search_path por defecto
ALTER DATABASE cafeteria SET search_path TO public, users_schema;
