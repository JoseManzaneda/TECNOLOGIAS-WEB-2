# Shared Constants

Este directorio contendrá las constantes compartidas entre los diferentes microservicios.

## Propósito

Las constantes compartidas permiten:

- Centralizar valores comunes en toda la aplicación
- Mantener consistencia en configuraciones
- Facilitar cambios globales
- Evitar valores mágicos duplicados

## Ejemplos de constantes a compartir

- Enums de estado (pedidos, pagos, reservas, etc.)
- Códigos de error estándar
- Roles de usuario
- Límites y configuraciones por defecto
- Mensajes de error y validación

## Próximos pasos

Migrar los enums actuales desde `src/common/enums/`:
- `estado-pago.enum.ts`
- `estado-pedido.enum.ts`
- `estado-reserva.enum.ts`
- `metodo-pago.enum.ts`
- `rol-usuario.enum.ts`

## Estado

🚧 Pendiente de implementación
