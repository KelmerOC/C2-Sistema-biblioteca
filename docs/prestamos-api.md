# API de Préstamos

Base URL: `http://localhost:3000`  
Todos los endpoints requieren el header `Authorization: Bearer <token>`.

---

## Tabla de endpoints

| Método | Ruta | Acceso / Quién puede usarlo | Códigos de respuesta |
| :--- | :--- | :--- | :--- |
| `GET` | `/prestamos` | Autenticado (`admin` ve todos; `usuario` solo los suyos) | `200`, `401`, `500` |
| `GET` | `/prestamos/:id` | Autenticado (`admin` cualquiera; `usuario` solo suyos) | `200`, `400`, `401`, `403`, `404`, `500` |
| `POST` | `/prestamos` | Autenticado (cualquier rol) | `201`, `400`, `401`, `404`, `409`, `500` |
| `PUT` | `/prestamos/:id/aprobar` | Solo `admin` | `200`, `400`, `401`, `403`, `404`, `409`, `500` |
| `PUT` | `/prestamos/:id/devolver` | Solo `admin` | `200`, `400`, `401`, `403`, `404`, `409`, `500` |

---

## Ejemplos con cURL

### 1. Listar préstamos
```bash
curl -s http://localhost:3000/prestamos \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Obtener un préstamo por ID
```bash
curl -s http://localhost:3000/prestamos/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Solicitar un préstamo
```bash
curl -s -X POST http://localhost:3000/prestamos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"libro_id": 1}'
```

### 4. Aprobar un préstamo
```bash
curl -s -X PUT http://localhost:3000/prestamos/1/aprobar \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

### 5. Registrar devolución de un préstamo
```bash
curl -s -X PUT http://localhost:3000/prestamos/1/devolver \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

