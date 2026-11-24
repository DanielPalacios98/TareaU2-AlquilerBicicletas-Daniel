# Workload · Caso 11: Alquiler de bicicletas

## 1. Caso de uso

Una persona crea una cuenta, consulta bicicletas disponibles por estación y tipo, alquila una bicicleta desde una estación, la devuelve y registra uno o varios reportes de estado. El personal puede mantener el catálogo de bicicletas. Una bicicleta no puede tener dos alquileres activos; los reportes de estado no se reemplazan porque deben conservar el historial.

## 2. Datos principales

| Dominio | Datos |
| --- | --- |
| Usuario | id, nombre, correo, contraseña cifrada, fecha de creación |
| Alquiler | id, código, userId, bikeId, nombre/tipo copiados, estado, salida, retorno |
| Bicicleta | nombre, tipo, número de serie, accesorios, estación, estado |
| Reporte de estado | alquiler, usuario, bicicleta, estado, calificación, notas, fecha |

## 3. Suposiciones

1. Un usuario puede tener varios alquileres, pero cada bicicleta solo puede estar en un alquiler `ACTIVE` a la vez.
2. El `_id` de la bicicleta es generado por MongoDB y se guarda como `Rental.bikeId` en PostgreSQL.
3. Un reporte pertenece al usuario que posee el alquiler; el usuario se obtiene del JWT y no del cuerpo.
4. El catálogo debe poder agregar accesorios sin migrar columnas, por eso se guarda en MongoDB.
5. El borrado físico de una bicicleta se bloquea mientras exista cualquier alquiler relacionado en PostgreSQL.

## 4. Operaciones

| Actor | Operación | Lectura/escritura | Frecuencia estimada | Datos involucrados |
| --- | --- | --- | --- | --- |
| Usuario | Registrarse | Escritura PostgreSQL | Baja, una vez por usuario | User |
| Usuario | Iniciar sesión | Lectura PostgreSQL | Varias veces al día | User, JWT |
| Usuario | Buscar bicicletas por texto/estación | Lectura MongoDB | Alta | Bike, índices |
| Personal | Crear o actualizar bicicleta | Escritura MongoDB | Media | Bike, validaciones |
| Usuario | Crear alquiler | Escritura PostgreSQL + lectura MongoDB | Media-alta | Rental, Bike |
| Usuario | Consultar sus alquileres unidos al catálogo | Lectura PostgreSQL + MongoDB | Alta | Rental, Bike, `$in` + `Map` |
| Usuario | Devolver bicicleta | Escritura PostgreSQL + actualización MongoDB | Media | Rental, Bike |
| Usuario | Crear reporte de estado | Lectura PostgreSQL + escritura MongoDB | Alta | Rental, BikeReport |
| Usuario | Consultar historial y promedio de reportes | Lectura MongoDB | Media | BikeReport, `populate`, aggregate |
| Personal | Eliminar bicicleta | Lectura PostgreSQL + escritura MongoDB | Baja | Rental, BikeReport, Bike |

## 5. Entidades y operaciones críticas

`User` y `Rental` son la parte transaccional. `Bike` es el catálogo variable. `BikeReport` es un registro append-only: cada reporte nuevo crece el historial y no sobrescribe los anteriores.

El flujo de alquiler comprueba `isValidObjectId`, verifica que la bicicleta exista y esté disponible, revisa que no haya otro `Rental.ACTIVE`, crea la operación en PostgreSQL y marca la bicicleta como `INACTIVA` en MongoDB. La consulta unida obtiene todos los `bikeId` distintos con `$in` y resuelve en memoria con `Map`, sin N+1.
