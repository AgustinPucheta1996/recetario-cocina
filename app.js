// ══════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════
const BASE = 'http://localhost:3000';

// Estado local
let editandoRecetaId      = null;
let editandoCategoriaId   = null;
let editandoIngredienteId = null;
let recetaActivaId        = null;
let categorias            = [];
let filtroCategoriaId     = null;

// ══════════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════════
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function showSection(nombre) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${nombre}`).classList.add('active');
  document.querySelectorAll('header nav button').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
}

function badgeDificultad(dif) {
  const cls = {
    'fácil':   'dificultad-facil',
    'media':   'dificultad-media',
    'difícil': 'dificultad-dificil'
  };
  return `<span class="badge ${cls[dif] || ''}">${dif}</span>`;
}

// Siempre comparar IDs como strings para evitar problemas de tipo
function idIgual(a, b) {
  return String(a) === String(b);
}

function getNombreCategoria(id) {
  const cat = categorias.find(c => idIgual(c.id, id));
  return cat ? cat.nombre : '—';
}
function getColorCategoria(id) {
  const cat = categorias.find(c => idIgual(c.id, id));
  return cat ? cat.color : '#ccc';
}

// ══════════════════════════════════════════════════════
//  CATEGORÍAS — CRUD
// ══════════════════════════════════════════════════════
async function cargarCategorias() {
  const res = await axios.get(`${BASE}/categorias`);
  categorias = res.data;
  renderizarCategorias();
  renderizarFiltros();
  poblarSelectCategorias();
}

function renderizarCategorias() {
  const lista = document.getElementById('lista-categorias');
  if (categorias.length === 0) {
    lista.innerHTML = `<div class="empty"><div class="icon">🏷️</div>No hay categorías todavía.</div>`;
    return;
  }
  lista.innerHTML = '';
  categorias.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'cat-item';
    div.innerHTML = `
      <span class="cat-name">
        <span class="cat-dot" style="background:${cat.color}"></span>
        ${cat.nombre}
      </span>
      <div class="cat-actions">
        <button class="btn btn-sm btn-edit">Editar</button>
        <button class="btn btn-sm btn-danger">Eliminar</button>
      </div>
    `;
    div.querySelector('.btn-edit').addEventListener('click', () => editarCategoria(cat.id));
    div.querySelector('.btn-danger').addEventListener('click', () => eliminarCategoria(cat.id));
    lista.appendChild(div);
  });
}

function poblarSelectCategorias() {
  const sel = document.getElementById('receta-categoria');
  sel.innerHTML = categorias.map(cat =>
    `<option value="${cat.id}">${cat.nombre}</option>`
  ).join('');
}

function renderizarFiltros() {
  const bar = document.getElementById('filtros-categoria');
  bar.innerHTML = '';

  const btnTodas = document.createElement('button');
  btnTodas.className = 'filter-btn' + (filtroCategoriaId === null ? ' active' : '');
  btnTodas.textContent = 'Todas';
  btnTodas.addEventListener('click', () => filtrarRecetas(null, btnTodas));
  bar.appendChild(btnTodas);

  categorias.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (idIgual(filtroCategoriaId, cat.id) ? ' active' : '');
    btn.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cat.color};margin-right:5px;vertical-align:middle"></span>${cat.nombre}`;
    btn.addEventListener('click', () => filtrarRecetas(cat.id, btn));
    bar.appendChild(btn);
  });
}

async function guardarCategoria() {
  const nombre = document.getElementById('cat-nombre').value.trim();
  const color  = document.getElementById('cat-color').value;
  if (!nombre) { mostrarToast('⚠️ El nombre es obligatorio'); return; }

  if (editandoCategoriaId) {
    await axios.patch(`${BASE}/categorias/${editandoCategoriaId}`, { nombre, color });
    mostrarToast('✅ Categoría actualizada');
  } else {
    await axios.post(`${BASE}/categorias`, { nombre, color });
    mostrarToast('✅ Categoría creada');
  }
  limpiarFormCategoria();
  await cargarCategorias();
}

function editarCategoria(id) {
  const cat = categorias.find(c => idIgual(c.id, id));
  if (!cat) return;
  editandoCategoriaId = cat.id;
  document.getElementById('cat-nombre').value = cat.nombre;
  document.getElementById('cat-color').value  = cat.color;
  document.getElementById('form-cat-title').textContent = '✏️ Editar categoría';
  document.getElementById('btn-cancelar-cat').style.display = 'inline-block';
}

async function eliminarCategoria(id) {
  const res = await axios.get(`${BASE}/recetas`);
  const asociadas = res.data.filter(r => idIgual(r.categoriaId, id));
  if (asociadas.length > 0) {
    const ok = confirm(`Esta categoría tiene ${asociadas.length} receta(s) asociada(s). ¿Eliminar igual?`);
    if (!ok) return;
  }
  await axios.delete(`${BASE}/categorias/${id}`);
  mostrarToast('🗑️ Categoría eliminada');
  await cargarCategorias();
  await cargarRecetas();
}

function cancelarEdicionCategoria() { limpiarFormCategoria(); }

function limpiarFormCategoria() {
  document.getElementById('cat-nombre').value = '';
  document.getElementById('cat-color').value  = '#6366F1';
  document.getElementById('form-cat-title').textContent = '➕ Nueva categoría';
  document.getElementById('btn-cancelar-cat').style.display = 'none';
  editandoCategoriaId = null;
}

// ══════════════════════════════════════════════════════
//  RECETAS — CRUD
// ══════════════════════════════════════════════════════
async function cargarRecetas() {
  const res = await axios.get(`${BASE}/recetas`);
  renderizarRecetas(res.data);
}

function renderizarRecetas(lista) {
  const contenedor = document.getElementById('lista-recetas');
  const filtradas  = filtroCategoriaId !== null
    ? lista.filter(r => idIgual(r.categoriaId, filtroCategoriaId))
    : lista;

  if (filtradas.length === 0) {
    contenedor.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="icon">🍳</div>No hay recetas todavía. ¡Crea la primera!</div>`;
    return;
  }

  contenedor.innerHTML = '';
  filtradas.forEach(receta => {
    const catColor  = getColorCategoria(receta.categoriaId);
    const catNombre = getNombreCategoria(receta.categoriaId);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header" style="border-top: 3px solid ${catColor}">
        <h3>${receta.nombre}</h3>
        <div class="meta">
          ${badgeDificultad(receta.dificultad)}
          <span class="badge badge-cat" style="color:${catColor}">${catNombre}</span>
        </div>
        <div class="meta" style="margin-top:6px">
          <span>⏱ ${receta.tiempo} min</span>
          <span>🍽 ${receta.porciones} porciones</span>
        </div>
      </div>
      <div class="card-body">
        <p style="font-size:13px;color:var(--text-muted)">${receta.descripcion || ''}</p>
      </div>
      <div class="card-footer">
        <button class="btn btn-sm">🧂 Ingredientes</button>
        <button class="btn btn-sm btn-edit">Editar</button>
        <button class="btn btn-sm btn-danger">Eliminar</button>
      </div>
    `;

    // Siempre usar addEventListener — nunca onclick inline
    const [btnIng, btnEdit, btnDel] = card.querySelectorAll('.card-footer .btn');
    btnIng.addEventListener('click',  () => abrirIngredientes(receta.id, receta.nombre));
    btnEdit.addEventListener('click', () => editarReceta(receta.id));
    btnDel.addEventListener('click',  () => eliminarReceta(receta.id));

    contenedor.appendChild(card);
  });
}

async function guardarReceta() {
  const nombre      = document.getElementById('receta-nombre').value.trim();
  const descripcion = document.getElementById('receta-desc').value.trim();
  const tiempo      = parseInt(document.getElementById('receta-tiempo').value);
  const dificultad  = document.getElementById('receta-dificultad').value;
  const porciones   = parseInt(document.getElementById('receta-porciones').value);
  const categoriaId = document.getElementById('receta-categoria').value; // string, lo deja json-server manejar

  if (!nombre || !tiempo || !porciones) {
    mostrarToast('⚠️ Completá los campos obligatorios');
    return;
  }

  const datos = { nombre, descripcion, tiempo, dificultad, porciones, categoriaId };

  if (editandoRecetaId) {
    await axios.patch(`${BASE}/recetas/${editandoRecetaId}`, datos);
    mostrarToast('✅ Receta actualizada');
  } else {
    await axios.post(`${BASE}/recetas`, datos);
    mostrarToast('✅ Receta creada');
  }

  limpiarFormReceta();
  await cargarRecetas();
}

async function editarReceta(id) {
  const res = await axios.get(`${BASE}/recetas/${id}`);
  const r   = res.data;
  editandoRecetaId = r.id;

  document.getElementById('receta-nombre').value     = r.nombre;
  document.getElementById('receta-desc').value       = r.descripcion;
  document.getElementById('receta-tiempo').value     = r.tiempo;
  document.getElementById('receta-dificultad').value = r.dificultad;
  document.getElementById('receta-porciones').value  = r.porciones;
  document.getElementById('receta-categoria').value  = r.categoriaId;
  document.getElementById('form-receta-title').textContent = '✏️ Editar receta';
  document.getElementById('btn-cancelar-receta').style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function eliminarReceta(id) {
  if (!confirm('¿Eliminar esta receta y todos sus ingredientes?')) return;
  const resIng = await axios.get(`${BASE}/ingredientes?recetaId=${id}`);
  await Promise.all(resIng.data.map(ing => axios.delete(`${BASE}/ingredientes/${ing.id}`)));
  await axios.delete(`${BASE}/recetas/${id}`);
  mostrarToast('🗑️ Receta eliminada');
  await cargarRecetas();
}

function cancelarEdicionReceta() { limpiarFormReceta(); }

function limpiarFormReceta() {
  document.getElementById('receta-nombre').value     = '';
  document.getElementById('receta-desc').value       = '';
  document.getElementById('receta-tiempo').value     = '';
  document.getElementById('receta-dificultad').value = 'fácil';
  document.getElementById('receta-porciones').value  = '';
  document.getElementById('form-receta-title').textContent = '➕ Nueva receta';
  document.getElementById('btn-cancelar-receta').style.display = 'none';
  editandoRecetaId = null;
}

async function filtrarRecetas(categoriaId, btn) {
  filtroCategoriaId = categoriaId !== null ? categoriaId : null;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  await cargarRecetas();
}

// ══════════════════════════════════════════════════════
//  INGREDIENTES — CRUD
// ══════════════════════════════════════════════════════
async function abrirIngredientes(recetaId, nombre) {
  recetaActivaId = recetaId; // guardamos tal cual viene de la receta
  document.getElementById('modal-receta-nombre').textContent = `🧂 ${nombre}`;
  document.getElementById('modal-ingredientes').classList.add('open');
  limpiarFormIngrediente();
  await cargarIngredientes();
}

function cerrarModal() {
  document.getElementById('modal-ingredientes').classList.remove('open');
  recetaActivaId = null;
  limpiarFormIngrediente();
}

async function cargarIngredientes() {
  // Usamos el id tal cual — json-server filtra por igualdad de string
  const res = await axios.get(`${BASE}/ingredientes?recetaId=${recetaActivaId}`);
  renderizarIngredientes(res.data);
}

function renderizarIngredientes(lista) {
  const ul = document.getElementById('lista-ingredientes');
  if (lista.length === 0) {
    ul.innerHTML = `<li style="text-align:center;color:var(--text-muted);padding:16px">Sin ingredientes todavía.</li>`;
    return;
  }
  ul.innerHTML = '';
  lista.forEach(ing => {
    const li = document.createElement('li');
    li.className = 'ing-item';
    li.innerHTML = `
      <span class="ing-name">${ing.nombre}</span>
      <span class="ing-qty">${ing.cantidad} ${ing.unidad}</span>
      <div class="ing-actions">
        <button class="btn btn-sm btn-edit">Editar</button>
        <button class="btn btn-sm btn-danger">✕</button>
      </div>
    `;
    li.querySelector('.btn-edit').addEventListener('click',   () => editarIngrediente(ing.id));
    li.querySelector('.btn-danger').addEventListener('click', () => eliminarIngrediente(ing.id));
    ul.appendChild(li);
  });
}

async function guardarIngrediente() {
  const nombre   = document.getElementById('ing-nombre').value.trim();
  const cantidad = parseFloat(document.getElementById('ing-cantidad').value);
  const unidad   = document.getElementById('ing-unidad').value;

  if (!nombre || !cantidad) { mostrarToast('⚠️ Completá nombre y cantidad'); return; }

  if (editandoIngredienteId) {
    await axios.patch(`${BASE}/ingredientes/${editandoIngredienteId}`, { nombre, cantidad, unidad });
    mostrarToast('✅ Ingrediente actualizado');
  } else {
    // recetaId lo guardamos tal cual está en la receta activa
    await axios.post(`${BASE}/ingredientes`, { nombre, cantidad, unidad, recetaId: recetaActivaId });
    mostrarToast('✅ Ingrediente agregado');
  }

  limpiarFormIngrediente();
  await cargarIngredientes();
}

async function editarIngrediente(id) {
  const res = await axios.get(`${BASE}/ingredientes/${id}`);
  const ing = res.data;
  editandoIngredienteId = ing.id;
  document.getElementById('ing-nombre').value   = ing.nombre;
  document.getElementById('ing-cantidad').value = ing.cantidad;
  document.getElementById('ing-unidad').value   = ing.unidad;
  document.getElementById('form-ing-title').textContent = '✏️ Editar ingrediente';
  document.getElementById('btn-cancelar-ing').style.display = 'inline-block';
}

async function eliminarIngrediente(id) {
  await axios.delete(`${BASE}/ingredientes/${id}`);
  mostrarToast('🗑️ Ingrediente eliminado');
  await cargarIngredientes();
}

function cancelarEdicionIngrediente() { limpiarFormIngrediente(); }

function limpiarFormIngrediente() {
  document.getElementById('ing-nombre').value   = '';
  document.getElementById('ing-cantidad').value = '';
  document.getElementById('ing-unidad').value   = 'g';
  document.getElementById('form-ing-title').textContent = '➕ Agregar ingrediente';
  document.getElementById('btn-cancelar-ing').style.display = 'none';
  editandoIngredienteId = null;
}

// Cerrar modal al clickear overlay
document.getElementById('modal-ingredientes').addEventListener('click', function(e) {
  if (e.target === this) cerrarModal();
});

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
async function init() {
  await cargarCategorias();
  await cargarRecetas();
}

init();
