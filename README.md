# 🍽️ Recetario de Cocina

Proyecto grupal para la materia **Programación Web**. Aplicación web para gestionar un recetario de cocina desarrollada con HTML, CSS y JavaScript puro, consumiendo una API Fake local con **json-server** y **Axios**.

---

## Cómo ejecutar el proyecto

### Pasito 1 - Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/recetario-cocina.git
cd recetario-cocina
```

### Pasito 2 - Instalar json-server (si no lo tenes perro)

```bash
npm install -g json-server
```

### Pasito 3 - Iniciar la API Fake

```bash
json-server --watch db.json --port 3000
```

### 4. Abrir la aplicación

Abrir el archivo `index.html` en el navegador (doble clic o desde el editor).

> **Importantisimo:** json-server debe estar corriendo en `http://localhost:3000` antes de abrir el HTML.


---

## - Estructura del proyecto -

```
recetario-cocina/
├── index.html   ← App completa (HTML + JS)
├── db.json      ← Base de datos fake para json-server
├── style.css    ← Diseño de la pagina (CSS)
└── README.md    ← Este archivo, para comentarios e instrucciones.
```

---

## ✅ Funcionalidades

###  Recetas
- Crear receta con nombre, descripción, tiempo, dificultad, porciones y categoría
- Listar recetas en tarjetas con filtros por categoría
- Editar cualquier campo de una receta existente
- Eliminar receta (con eliminación en cascada de sus ingredientes)

###  Categorías
- Crear categorías con nombre y color representativo
- Listar y usar como filtros en la sección de recetas
- Editar nombre y color de una categoría
- Eliminar con advertencia si tiene recetas asociadas

###  Ingredientes
- Agregar ingredientes a cada receta (nombre, cantidad, unidad)
- Ver los ingredientes de una receta en un panel desplegable
- Editar nombre, cantidad o unidad de un ingrediente
- Eliminar ingredientes individualmente

---

##  Integrantes

| Nombre | Rol |
|---|---|
| [Nombre 1] | Jose Alvarez Vazquez |
| [Nombre 2] | Agustin Pucheta |
| [Nombre 3] | Jorge Collazos |

---

## 📋 Métodos de Axios utilizados

```js
axios.get()     // Leer recetas, categorías e ingredientes
axios.post()    // Crear nuevos registros
axios.patch()   // Editar registros existentes
axios.delete()  // Eliminar registros
```
