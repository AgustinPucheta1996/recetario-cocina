# 🍽️ Recetario de Cocina

Proyecto grupal para la materia **Programación Web**. Aplicación web para gestionar un recetario de cocina personal, desarrollada con HTML, CSS y JavaScript puro, consumiendo una API Fake local con **json-server** y **Axios**.

---

## 🚀 Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/recetario-cocina.git
cd recetario-cocina
```

### 2. Instalar json-server (si no lo tenés)

```bash
npm install -g json-server
```

### 3. Iniciar la API Fake

```bash
json-server --watch db.json --port 3000
```

### 4. Abrir la aplicación

Abrir el archivo `index.html` en el navegador (doble clic o desde el editor).

> ⚠️ **Importante:** json-server debe estar corriendo en `http://localhost:3000` antes de abrir el HTML.

---

## 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de la app (archivo único) |
| CSS3 | Estilos embebidos en `<style>` |
| JavaScript (ES6+) | Lógica y manipulación del DOM |
| [json-server](https://github.com/typicode/json-server) | API Fake local |
| [Axios](https://axios-http.com/) | Peticiones HTTP (desde CDN) |

---

## 📁 Estructura del proyecto

```
recetario-cocina/
├── index.html   ← App completa (HTML + CSS + JS)
├── db.json      ← Base de datos fake para json-server
└── README.md    ← Este archivo
```

---

## ✅ Funcionalidades

### 🍲 Recetas
- Crear receta con nombre, descripción, tiempo, dificultad, porciones y categoría
- Listar recetas en tarjetas con filtros por categoría
- Editar cualquier campo de una receta existente
- Eliminar receta (con eliminación en cascada de sus ingredientes)

### 🏷️ Categorías
- Crear categorías con nombre y color representativo
- Listar y usar como filtros en la sección de recetas
- Editar nombre y color de una categoría
- Eliminar con advertencia si tiene recetas asociadas

### 🧂 Ingredientes
- Agregar ingredientes a cada receta (nombre, cantidad, unidad)
- Ver los ingredientes de una receta en un panel desplegable
- Editar nombre, cantidad o unidad de un ingrediente
- Eliminar ingredientes individualmente

---

## 👥 Integrantes

| Nombre | Rol |
|---|---|
| [Nombre 1] | - |
| [Nombre 2] | - |
| [Nombre 3] | - |

---

## 📋 Métodos de Axios utilizados

```js
axios.get()     // Leer recetas, categorías e ingredientes
axios.post()    // Crear nuevos registros
axios.patch()   // Editar registros existentes
axios.delete()  // Eliminar registros
```
