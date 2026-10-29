# API de Libros

Base URL: `http://localhost:3000`  
Todos los endpoints requieren el header `Authorization: Bearer <token>`.

---

## Autenticación y permisos

| Rol              | Endpoints permitidos                           |
|------------------|------------------------------------------------|
| `usuario` (auth) | `GET /libros`, `GET /libros/:id`               |
| `admin`          | Todos los anteriores + `POST`, `PUT`, `DELETE` |

---

## Endpoints

### `GET /libros`

Lista todos los libros. Acepta un parámetro opcional de búsqueda parcial por título.

**Acceso:** cualquier usuario autenticado

**Query params:**

| Parámetro | Tipo   | Requerido | Descripción                           |
|-----------|--------|-----------|---------------------------------------|
| `titulo`  | string | No        | Filtra por coincidencia parcial (LIKE)|

**Respuestas:**

| Código | Descripción                              |
|--------|------------------------------------------|
| 200    | Array de libros (puede estar vacío `[]`) |
| 401    | Token ausente o inválido                 |
| 500    | Error interno del servidor               |

**Ejemplo:**

```bash
# Sin filtro
curl -s http://localhost:3000/libros \
  -H "Authorization: Bearer $TOKEN"

# Con búsqueda parcial
curl -s "http://localhost:3000/libros?titulo=cien" \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta exitosa (200):**
```json
[
  { "id": 1, "titulo": "Cien años de soledad", "autor": "Gabriel García Márquez", "categoria": "Novela", "cantidad": 3 },
  { "id": 3, "titulo": "Cien consejos de programación", "autor": "Autor de prueba", "categoria": "Informática", "cantidad": 5 }
]
```

---

### `GET /libros/:id`

Obtiene un libro por su ID.

**Acceso:** cualquier usuario autenticado

**Path params:**

| Parámetro | Tipo    | Descripción      |
|-----------|---------|------------------|
| `id`      | integer | ID del libro     |

**Respuestas:**

| Código | Descripción              |
|--------|--------------------------|
| 200    | Objeto del libro         |
| 400    | El id no es numérico     |
| 401    | Token ausente o inválido |
| 404    | Libro no encontrado      |
| 500    | Error interno            |

**Ejemplo:**

```bash
curl -s http://localhost:3000/libros/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta exitosa (200):**
```json
{ "id": 1, "titulo": "Cien años de soledad", "autor": "Gabriel García Márquez", "categoria": "Novela", "cantidad": 3 }
```

---

### `POST /libros`

Crea un nuevo libro.

**Acceso:** solo `admin`

**Body (JSON):**

| Campo      | Tipo    | Requerido | Descripción                    |
|------------|---------|-----------|--------------------------------|
| `titulo`   | string  | Sí        | Título del libro               |
| `autor`    | string  | Sí        | Autor del libro                |
| `categoria`| string  | Sí        | Categoría o género             |
| `cantidad` | integer | Sí        | Número de ejemplares (≥ 0)     |

**Respuestas:**

| Código | Descripción                                |
|--------|--------------------------------------------|
| 201    | Libro creado correctamente                 |
| 400    | Campos inválidos o faltantes               |
| 401    | Token ausente o inválido                   |
| 403    | El usuario no tiene rol `admin`            |
| 500    | Error interno                              |

**Ejemplo:**

```bash
curl -s -X POST http://localhost:3000/libros \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"El Quijote","autor":"Miguel de Cervantes","categoria":"Clásico","cantidad":2}'
```

**Respuesta exitosa (201):**
```json
{
  "mensaje": "Libro creado correctamente",
  "libro": { "id": 4, "titulo": "El Quijote", "autor": "Miguel de Cervantes", "categoria": "Clásico", "cantidad": 2 }
}
```

**Error de validación (400):**
```json
{ "mensaje": "El campo cantidad debe ser un entero mayor o igual a 0" }
```

---

### `PUT /libros/:id`

Actualiza todos los campos de un libro existente.

**Acceso:** solo `admin`

**Path params:**

| Parámetro | Tipo    | Descripción  |
|-----------|---------|--------------|
| `id`      | integer | ID del libro |

**Body (JSON):** mismos campos que `POST /libros`, todos obligatorios.

**Respuestas:**

| Código | Descripción                     |
|--------|---------------------------------|
| 200    | Libro actualizado correctamente |
| 400    | Campos inválidos o faltantes    |
| 401    | Token ausente o inválido        |
| 403    | El usuario no tiene rol `admin` |
| 404    | Libro no encontrado             |
| 500    | Error interno                   |

**Ejemplo:**

```bash
curl -s -X PUT http://localhost:3000/libros/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Cien años de soledad","autor":"Gabriel García Márquez","categoria":"Novela","cantidad":5}'
```

**Respuesta exitosa (200):**
```json
{
  "mensaje": "Libro actualizado correctamente",
  "libro": { "id": 1, "titulo": "Cien años de soledad", "autor": "Gabriel García Márquez", "categoria": "Novela", "cantidad": 5 }
}
```

---

### `DELETE /libros/:id`

Elimina un libro por su ID.

**Acceso:** solo `admin`

**Path params:**

| Parámetro | Tipo    | Descripción  |
|-----------|---------|--------------|
| `id`      | integer | ID del libro |

**Respuestas:**

| Código | Descripción                                                        |
|--------|--------------------------------------------------------------------|
| 200    | Libro eliminado correctamente                                      |
| 400    | El id no es numérico                                               |
| 401    | Token ausente o inválido                                           |
| 403    | El usuario no tiene rol `admin`                                    |
| 404    | Libro no encontrado                                                |
| 409    | No se puede eliminar: el libro tiene préstamos asociados           |
| 500    | Error interno                                                      |

**Ejemplo:**

```bash
curl -s -X DELETE http://localhost:3000/libros/4 \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta exitosa (200):**
```json
{ "mensaje": "Libro eliminado correctamente" }
```

**Conflicto de integridad referencial (409):**
```json
{ "mensaje": "No se puede eliminar el libro porque tiene préstamos asociados" }
```
