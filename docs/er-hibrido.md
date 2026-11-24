# ER híbrido

```mermaid
erDiagram
    USER ||--o{ RENTAL : realiza
    RENTAL }o..|| BIKE : "bikeId validado"
    RENTAL ||--o{ BIKE_REPORT : genera
    BIKE ||--o{ BIKE_REPORT : recibe

    USER {
      string id PK
      string name
      string email UK
      string passwordHash
    }
    RENTAL {
      string id PK
      string code UK
      string userId FK
      string bikeId FK
      enum status
      datetime startedAt
      datetime returnedAt
    }
    BIKE {
      objectId id PK
      string name
      enum type
      string serialNumber UK
      string[] accessories
      string station
      enum status
    }
    BIKE_REPORT {
      objectId id PK
      string rentalId
      string userId
      objectId bikeId FK
      string rentalCode
      string bikeName
      enum status
      int rating
      string notes
      datetime createdAt
    }
```

## Zonas

- **PostgreSQL:** `User` y `Rental`. Aquí se garantizan las transacciones y la relación 1:N.
- **MongoDB:** `Bike` y `BikeReport`. Aquí se garantizan validaciones del documento, el catálogo flexible, los índices y el historial.
- Las relaciones entre bases son conceptuales y se representan con líneas punteadas: `Rental.bikeId → Bike._id`, `BikeReport.rentalId → Rental.id` y `BikeReport.userId → User.id`.
