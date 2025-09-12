# TECNOLOGIAS-WEB-2
Este repositorio es para la materia de Tecnologías Web 2 semestre 2-2025
Backend Cafetería
Sistema backend para la gestión de una cafetería, desarrollado con NestJS y MySQL.

Requisitos
Node.js (v16 o superior)
npm
MySQL
Instalación
Clona el repositorio o descarga el proyecto.

Instala las dependencias:

Configura la base de datos:

Crea una base de datos llamada cafeteria en tu servidor MySQL.
Ajusta las credenciales de conexión en src/data-source.ts si es necesario (usuario, contraseña, host).
Ejecuta las migraciones o asegúrate de que la estructura de tablas esté creada (puedes usar los scripts SQL proporcionados).

Ejecución
Modo desarrollo:

Modo producción:

Endpoints principales
CRUD para usuarios, productos y reservas.
Validaciones y manejo de errores con respuestas JSON claras.
Notas
Asegúrate de tener el servicio de MySQL corriendo antes de iniciar el backend.
Puedes probar los endpoints con Postman, Insomnia o cualquier cliente HTTP.
