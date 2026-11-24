# Tarea · Modelo híbrido PostgreSQL + MongoDB

## 1.4 Operación: crear un alquiler

| Actor | Operación | Lectura/escritura | Frecuencia estimada | Datos |
| --- | --- | --- | --- | --- |
| Usuario | Crear un alquiler | Lee MongoDB y escribe PostgreSQL/MongoDB | 400 por día, con picos concurrentes en una estación | bikeId, userId, estación, salida, estado |

La regla crítica es que una bicicleta no se alquila dos veces. PostgreSQL es la fuente de verdad del alquiler: la comprobación de otro ACTIVE y el create se ejecutan en una transacción con aislamiento Serializable. MongoDB valida que el catálogo exista y que esté disponible; luego se sincroniza su estado.

## 2. Decisión por entidad

| Entidad | Base | Decisión |
| --- | --- | --- |
| User | PostgreSQL | Tiene identidad estable, correo único y relación transaccional con muchos alquileres. |
| Rental | PostgreSQL | Necesita transacción, aislamiento serializable, índice por bikeId y clave foránea real hacia User. |
| Bike | MongoDB | Su forma cambia: accessories[], tipo, estación y estado se validan como documento flexible. Se lee mucho más de lo que se escribe. |
| BikeReport | MongoDB | Crece continuamente, conserva historial, usa populate y permite agregar reportes sin modificar el catálogo. |

## Referencias híbridas

- Rental.bikeId guarda el _id de MongoDB como String? e índice.
- BikeReport.rentalId guarda el id de PostgreSQL.
- BikeReport.userId sale del JWT y permite filtrar el historial del usuario.
- BikeReport.bikeId usa ref: Bike para populate.

## Fallos entre bases

No existe una transacción distribuida entre PostgreSQL y MongoDB. Si PostgreSQL confirma un alquiler y MongoDB no puede marcar la bicicleta como INACTIVA, rental.service.js ejecuta una acción compensatoria: elimina el alquiler recién creado y responde 503. Si el servidor cae entre pasos, PostgreSQL sigue siendo la fuente de verdad y evita el doble alquiler.
