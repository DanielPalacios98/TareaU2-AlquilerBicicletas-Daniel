# Decisión de base por entidad

## Cinco preguntas

| Pregunta | User/Rental en PostgreSQL | Bike/BikeReport en MongoDB |
| --- | --- | --- |
| ¿Necesita transacciones? | Sí: crear/devolver alquiler y pertenencia del usuario | No como operación única; los reportes se agregan históricamente |
| ¿Necesita claves foráneas? | Sí: `Rental.userId → User.id`; `bikeId` se valida en servicio | No hay FK nativa; `bikeId`, `rentalId` y `userId` se comprueban en el servicio |
| ¿Tiene forma variable? | No; usuario y alquiler tienen campos estables | Sí; accesorios y reportes pueden crecer o cambiar |
| ¿Cómo crece? | Moderado y con consultas por usuario/estado | Catálogo flexible y muchos reportes append-only |
| ¿Predomina lectura o escritura? | Escrituras consistentes y lecturas transaccionales | Muchas lecturas de catálogo y escrituras de reportes |

## Embeber o referenciar en MongoDB

| Pregunta | Decisión |
| --- | --- |
| ¿Se lee junto? | Una bicicleta se lista con sus atributos; el historial de reportes se consulta aparte |
| ¿Se escribe junto? | No: los reportes deben crecer sin reescribir una bicicleta |
| ¿Se usa junto o por partes? | Por partes; `BikeReport` referencia `Bike` y conserva `rentalId`/`userId` para validar la operación |

## Desnormalización

Al crear un alquiler se copian `bikeName` y `bikeType` de MongoDB a PostgreSQL. Al crear un reporte se copia `rentalCode` y `bikeName` desde PostgreSQL. El costo es que una modificación posterior del nombre del catálogo no actualiza automáticamente el histórico, pero el historial conserva el contexto que existía cuando ocurrió la operación.
