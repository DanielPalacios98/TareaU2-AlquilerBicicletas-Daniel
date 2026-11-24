# Tabla de referencias entre bases

| Referencia | Cómo se guarda | Quién garantiza que exista | Cómo se une |
| --- | --- | --- | --- |
| `Rental.userId → User.id` | FK real en PostgreSQL | Prisma/PostgreSQL | Relación Prisma |
| `Rental.bikeId → Bike._id` | `String?` + índice en PostgreSQL | `rental.service` usa `isValidObjectId`, `Bike.findById` y revisa disponibilidad | `$in` de Mongo + `Map` |
| `BikeReport.rentalId → Rental.id` | String en MongoDB | `report.service` consulta Prisma y responde 404 | Consulta por `rentalId` |
| `BikeReport.userId → User.id` | String derivado de JWT | Middleware JWT + consulta Prisma de pertenencia | Filtro por `userId` |
| `BikeReport.bikeId → Bike._id` | ObjectId con `ref: 'Bike'` | Servicio comprueba existencia | `populate('bikeId')` |

## Borrado

El catálogo se elimina solo si PostgreSQL no tiene ningún alquiler que lo use. En ese caso se borran primero los reportes MongoDB asociados y luego la bicicleta. Si existe una referencia, el endpoint responde `409`.
