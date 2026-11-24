# Tarea U2 · Alquiler de bicicletas

**Estudiante:** Daniel Palacios  
**Caso:** 11 · Alquiler de bicicletas

Este proyecto implementa un negocio híbrido: PostgreSQL conserva las operaciones transaccionales de usuarios y alquileres; MongoDB conserva el catálogo flexible de bicicletas y los reportes de estado que crecen con el tiempo.

## Arranque

1. Copia `.env.example` como `.env` y cambia `JWT_SECRET` por un valor local.
2. Levanta las bases:

   ```bash
   docker compose up -d
   ```

3. Instala dependencias, genera Prisma y aplica la migración:

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Inicia la API:

   ```bash
   npm run dev
   ```

API: `http://localhost:3000`  
Colección Postman: `postman/TareaU2_Palacios.postman_collection.json`

## Estructura

- `prisma/`: entidad `User`, entidad transaccional `Rental` y migración PostgreSQL.
- `src/models/`: `Bike` y `BikeReport` en Mongoose.
- `src/services/`: reglas de negocio e integración entre bases.
- `postman/`: colección con datos propios, aserciones y limpieza.
- `docs/`: workload, decisiones, ER híbrido y tabla de referencias.

## Pruebas

Con Docker y la API activos, importa la colección en Postman y ejecuta **Run collection**. La colección registra un usuario y datos nuevos en cada ejecución, guarda sus variables y elimina reportes, alquileres y bicicleta al final.

Las capturas solicitadas de Compass, pgAdmin y el resumen de Postman deben guardarse en `docs/capturas/`.
