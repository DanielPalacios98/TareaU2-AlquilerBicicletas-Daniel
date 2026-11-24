# Manual de demostración · Tarea U2

## 6. Guion de video — máximo 5:00

### Antes de grabar

1. Reinicia Windows si WSL2 o Docker todavía no arrancan.
2. Abre la carpeta del proyecto en VS Code.
3. Levanta la infraestructura y la API:

   powershell
   docker compose up -d
   npx prisma migrate deploy
   npm run dev

4. Abre Postman e importa postman/TareaU2_Palacios.postman_collection.json.
5. Abre Compass conectado a mongodb://localhost:27018.
6. Abre estas pestañas:
   - docs/Tarea_modelo_hibrido.md, sección 1.4 y sección 2.
   - src/routes/index.js.
   - src/middleware/auth.js.
   - src/controllers/report.controller.js.
   - src/services/report.service.js.
   - src/models/bikeReport.js.
   - src/services/rental.service.js.

### Guion hablado y pantalla

**0:00–0:35 · Presentación y workload**  
Pantalla: docs/Tarea_modelo_hibrido.md, sección 1.4.  
“Hola, soy Daniel Palacios. Mi caso es el 11, alquiler de bicicletas. Es una API REST en Express que usa PostgreSQL con Prisma para usuarios y alquileres, y MongoDB con Mongoose para el catálogo y los reportes. La operación crítica es crear un alquiler: la bicicleta debe existir y no puede tener otro alquiler activo.”

**0:35–1:15 · Decisión de base**  
Pantalla: sección 2, filas Rental y Bike.  
“Rental va en PostgreSQL porque hay concurrencia, transacciones y una relación 1:N con User. Bike va en MongoDB porque tiene forma flexible, por ejemplo accessories[], y se consulta muchas veces. BikeReport también va en MongoDB porque es historial append-only y crece sin límite.”

**1:15–2:25 · Seguridad y creación del reporte**  
Pantalla: abre los archivos en este orden:

1. src/routes/index.js: router.post('/reports', requireAuth, ...).
2. src/middleware/auth.js: jwt.verify deja el usuario en req.user.
3. src/controllers/report.controller.js: pasa req.user.sub y req.body.
4. src/services/report.service.js: valida rentalId, consulta Prisma con id + userId, diferencia 403 y 404, comprueba la bicicleta en MongoDB y crea el reporte.
5. src/models/bikeReport.js: muestra required, mensajes en español, enum, rating de 1 a 5 y ref: Bike.

Di: “El userId nunca viene del cliente: sale del JWT. El servicio valida la pertenencia del alquiler en PostgreSQL y copia rentalCode y bikeName al reporte. Esa copia es desnormalización para que el historial conserve el contexto.”

**2:25–3:10 · Postman**  
Pantalla: colección Tarea U2 · Daniel Palacios.

1. Ejecuta 01 a 11 para crear usuario, bicicleta, alquiler y devolverlo.
2. Ejecuta 12 · Crear reporte de estado 1; muestra el 201, rentalCode, bikeName y userId.
3. Ejecuta 13 · Crear reporte de estado 2.
4. Ejecuta 14 · Listar reportes con aggregate; muestra populate, summary, promedio y total.
5. Ejecuta 15 · Borrado bloqueado mientras existe Rental; muestra 409.

La colección contiene 19 solicitudes y 43 aserciones. Las solicitudes 16 a 19 limpian los datos. Para volver a correrla, inicia una ejecución nueva: el primer request genera correo y número de serie nuevos.

**3:10–4:20 · Fallos entre bases**  
Pantalla: src/services/rental.service.js.  
“No hay una transacción distribuida entre PostgreSQL y MongoDB. En PostgreSQL, la comprobación del alquiler activo y el create están dentro de una transacción Serializable. Si dos personas intentan alquilar la misma bicicleta, una operación gana y la otra recibe 409 por conflicto de serialización. Después se marca la bicicleta en MongoDB. Si ese paso falla, se borra compensatoriamente el alquiler recién creado y se responde 503; así no queda una operación a medias.”

Para mostrar una caída controlada, en VS Code usa Terminal → Ejecutar tarea… → Video · Apagar MongoDB. Luego vuelve a encenderlo con Video · Encender MongoDB. Si no deseas esperar el timeout de conexión, explica la compensación directamente desde el código.

**4:20–4:50 · Cierre**  
Pantalla: Compass o Postman.  
“En resumen, PostgreSQL garantiza la operación transaccional y MongoDB el catálogo flexible y el historial. Las referencias entre bases se validan en los servicios y la consulta unida usa $in y Map, sin N+1.”

**4:50–5:00 · Despedida**  
“Eso es todo. El repositorio contiene el código, la migración, la colección de Postman y la documentación del modelo híbrido. Gracias.”

## Nota importante

El texto de guion recibido mencionaba solicitudes numeradas 16, 18, 19, 20 y 22 que pertenecen a otra versión de la colección. Esta versión real usa 12 para el primer reporte, 13 para el segundo, 14 para aggregate y 16–19 para limpieza. El guion de esta carpeta ya está corregido para que no se señalen archivos o requests que no existen.
