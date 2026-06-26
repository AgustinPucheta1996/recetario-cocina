// ══════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════
const BASE = "http://localhost:3000";

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
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// Comparar IDs siempre como string — evita bugs number vs string
function idIgual(a, b) {
  return String(a) === String(b);
}

function showSection(nombre, e) {
  if (e) e.preventDefault();
  document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
  document.getElementById(`section-${nombre}`).classList.add("active");
  document.querySelectorAll(".nav-link[data-section]").forEach((l) => l.classList.remove("active"));
  const link = document.querySelector(`.nav-link[data-section="${nombre}"]`);
  if (link) link.classList.add("active");
  document.getElementById("main-nav")?.classList.remove("open");
  if (nombre === "inicio") {
    document.getElementById("buscador").value = "";
    filtrarDestacadas(null);
    const titulo = document.querySelector(".section-intro h2");
    if (titulo) titulo.textContent = "Recetas destacadas";
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ══════════════════════════════════════════════════════
//  CARRUSEL
// ══════════════════════════════════════════════════════
let carouselIndex = 0;
let carouselTimer = null;

function initCarrusel() {
  const slides = document.querySelectorAll(".carousel-slide");
  const dotsCont = document.getElementById("carousel-dots");
  if (!slides.length || !dotsCont) return;
  dotsCont.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dot.addEventListener("click", () => irACarrusel(i));
    dotsCont.appendChild(dot);
  });
  carouselTimer = setInterval(() => moverCarrusel(1), 5000);
}

function irACarrusel(index) {
  const slides = document.querySelectorAll(".carousel-slide");
  const dots   = document.querySelectorAll(".carousel-dot");
  if (!slides.length) return;
  carouselIndex = ((index % slides.length) + slides.length) % slides.length;
  slides.forEach((s, i) => s.classList.toggle("active", i === carouselIndex));
  dots.forEach((d, i)   => d.classList.toggle("active", i === carouselIndex));
}

function moverCarrusel(dir) {
  clearInterval(carouselTimer);
  irACarrusel(carouselIndex + dir);
  carouselTimer = setInterval(() => moverCarrusel(1), 5000);
}

// ══════════════════════════════════════════════════════
//  BUSCADOR & FILTROS DESTACADAS
// ══════════════════════════════════════════════════════
const MAPA_CATEGORIAS = { entrada: "entrada", principal: "principal", postre: "postre" };

function buscarRecetas(query) {
  const q = query.trim().toLowerCase();
  const cards = document.querySelectorAll(".featured-card");
  let visibles = 0;
  cards.forEach((card) => {
    const match = !q || card.dataset.nombre?.includes(q) || card.dataset.categoria?.includes(q) || card.textContent.toLowerCase().includes(q);
    card.classList.toggle("hidden", !match);
    if (match) visibles++;
  });
  const empty = document.getElementById("featured-empty");
  if (empty) empty.style.display = visibles === 0 ? "block" : "none";
}

function filtrarDestacadas(categoria) {
  const cards = document.querySelectorAll(".featured-card");
  let visibles = 0;
  cards.forEach((card) => {
    const match = !categoria || card.dataset.categoria === categoria;
    card.classList.toggle("hidden", !match);
    if (match) visibles++;
  });
  const empty = document.getElementById("featured-empty");
  if (empty) empty.style.display = visibles === 0 ? "block" : "none";
}

function filtrarDesdeNav(tipo, e) {
  if (e) e.preventDefault();
  showSection("inicio");
  document.getElementById("buscador").value = "";
  filtrarDestacadas(MAPA_CATEGORIAS[tipo] || null);
  const titulos = { entrada: "Entradas", principal: "Platos principales", postre: "Postres" };
  const el = document.querySelector(".section-intro h2");
  if (el) el.textContent = titulos[tipo] || "Recetas destacadas";
}

// ══════════════════════════════════════════════════════
//  AUTH (UI)
// ══════════════════════════════════════════════════════
let authModo = "login";

// Usuarios simulados
const USUARIOS = [
  { email: "admin@recetario.com", password: "1234", nombre: "Admin" },
  { email: "usuario@test.com",    password: "1234", nombre: "Usuario" }
];
let usuarioActual = null;

function actualizarNavAuth() {
  const navAuth = document.getElementById("nav-auth");
  if (!navAuth) return;
  if (usuarioActual) {
    navAuth.innerHTML = `
      <span style="font-size:13px;font-weight:600;color:var(--text)">👤 ${usuarioActual.nombre}</span>
      <button class="btn btn-outline" onclick="cerrarSesion()">Cerrar sesión</button>
    `;
  } else {
    navAuth.innerHTML = `
      <button class="btn btn-outline" onclick="abrirModalAuth('login')">Iniciar sesión</button>
      <button class="btn btn-primary" onclick="abrirModalAuth('register')">Registrarse</button>
    `;
  }
}

function cerrarSesion() {
  usuarioActual = null;
  actualizarNavAuth();
  mostrarToast("👋 Sesión cerrada");
}

function abrirModalAuth(modo) {
  authModo = modo;
  const esRegistro = modo === "register";
  document.getElementById("auth-title").textContent = esRegistro ? "Crear cuenta" : "Iniciar sesión";
  document.getElementById("auth-nombre-group").style.display = esRegistro ? "flex" : "none";
  document.getElementById("auth-switch").innerHTML = esRegistro
    ? "¿Ya tenés cuenta? <a onclick=\"abrirModalAuth('login')\">Iniciá sesión</a>"
    : "¿No tenés cuenta? <a onclick=\"abrirModalAuth('register')\">Registrate</a>";
  document.getElementById("modal-auth").classList.add("open");
}

function cerrarModalAuth() {
  document.getElementById("modal-auth").classList.remove("open");
  document.getElementById("auth-form").reset();
}

function enviarAuth(e) {
  e.preventDefault();
  const email    = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const nombre   = document.getElementById("auth-nombre")?.value.trim();

  if (authModo === "login") {
    const encontrado = USUARIOS.find(u => u.email === email && u.password === password);
    if (encontrado) {
      usuarioActual = encontrado;
      cerrarModalAuth();
      actualizarNavAuth();
      mostrarToast(`✅ ¡Bienvenido/a, ${encontrado.nombre}!`);
    } else {
      mostrarToast("❌ Email o contraseña incorrectos");
    }
  } else {
    // Registro simulado
    if (!nombre) { mostrarToast("⚠️ Ingresá tu nombre"); return; }
    const nuevoUsuario = { email, password, nombre };
    USUARIOS.push(nuevoUsuario);
    usuarioActual = nuevoUsuario;
    cerrarModalAuth();
    actualizarNavAuth();
    mostrarToast(`✅ ¡Cuenta creada! Bienvenido/a, ${nombre}`);
  }
}

function suscribirNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  mostrarToast(`📬 ¡Gracias! Te enviaremos recetas a ${input.value}`);
  input.value = "";
}

function badgeDificultad(dif) {
  const cls = { "fácil": "dificultad-facil", "media": "dificultad-media", "difícil": "dificultad-dificil" };
  return `<span class="badge ${cls[dif] || ""}">${dif}</span>`;
}

function getNombreCategoria(id) {
  const cat = categorias.find((c) => idIgual(c.id, id));
  return cat ? cat.nombre : "—";
}
function getColorCategoria(id) {
  const cat = categorias.find((c) => idIgual(c.id, id));
  return cat ? cat.color : "#ccc";
}

// ══════════════════════════════════════════════════════
//  IMAGEN — convertir a base64
// ══════════════════════════════════════════════════════
function leerImagenComoBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Error al leer imagen"));
    reader.readAsDataURL(file);
  });
}

function mostrarPreviewImagen(base64) {
  const preview = document.getElementById("receta-imagen-preview");
  if (!preview) return;
  if (base64) {
    preview.src = base64;
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
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
  const lista = document.getElementById("lista-categorias");
  if (categorias.length === 0) {
    lista.innerHTML = `<div class="empty"><div class="icon">🏷️</div>No hay categorías todavía.</div>`;
    return;
  }
  lista.innerHTML = "";
  categorias.forEach((cat) => {
    const div = document.createElement("div");
    div.className = "cat-item";
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
    div.querySelector(".btn-edit").addEventListener("click", () => editarCategoria(cat.id));
    div.querySelector(".btn-danger").addEventListener("click", () => eliminarCategoria(cat.id));
    lista.appendChild(div);
  });
}

function poblarSelectCategorias() {
  const sel = document.getElementById("receta-categoria");
  sel.innerHTML = categorias.map((cat) => `<option value="${cat.id}">${cat.nombre}</option>`).join("");
}

function renderizarFiltros() {
  const bar = document.getElementById("filtros-categoria");
  bar.innerHTML = "";
  const btnTodas = document.createElement("button");
  btnTodas.className = "filter-btn" + (filtroCategoriaId === null ? " active" : "");
  btnTodas.textContent = "Todas";
  btnTodas.addEventListener("click", () => filtrarRecetas(null, btnTodas));
  bar.appendChild(btnTodas);
  categorias.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (idIgual(filtroCategoriaId, cat.id) ? " active" : "");
    btn.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cat.color};margin-right:5px;vertical-align:middle"></span>${cat.nombre}`;
    btn.addEventListener("click", () => filtrarRecetas(cat.id, btn));
    bar.appendChild(btn);
  });

  // Actualizar dropdown del nav con las categorías reales
  actualizarDropdownNav();
}

function actualizarDropdownNav() {
  const menu = document.querySelector(".nav-dropdown-menu");
  if (!menu) return;
  menu.innerHTML = "";
  categorias.forEach((cat) => {
    const a = document.createElement("a");
    a.href = "#";
    a.innerHTML = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cat.color};margin-right:6px;vertical-align:middle;border-radius:50%"></span>${cat.nombre}`;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      // Ir a sección recetas y filtrar por esta categoría
      showSection("recetas");
      document.querySelectorAll(".nav-link[data-section]").forEach(l => l.classList.remove("active"));
      document.querySelector('.nav-link[data-section="recetas"]')?.classList.add("active");
      filtroCategoriaId = cat.id;
      renderizarFiltros();
      cargarRecetas();
    });
    menu.appendChild(a);
  });
}

async function guardarCategoria() {
  const nombre = document.getElementById("cat-nombre").value.trim();
  const color  = document.getElementById("cat-color").value;
  if (!nombre) { mostrarToast("⚠️ El nombre es obligatorio"); return; }
  if (editandoCategoriaId) {
    await axios.patch(`${BASE}/categorias/${editandoCategoriaId}`, { nombre, color });
    mostrarToast("✅ Categoría actualizada");
  } else {
    await axios.post(`${BASE}/categorias`, { nombre, color });
    mostrarToast("✅ Categoría creada");
  }
  limpiarFormCategoria();
  await cargarCategorias();
}

function editarCategoria(id) {
  const cat = categorias.find((c) => idIgual(c.id, id));
  if (!cat) return;
  editandoCategoriaId = cat.id;
  document.getElementById("cat-nombre").value = cat.nombre;
  document.getElementById("cat-color").value  = cat.color;
  document.getElementById("form-cat-title").textContent = "✏️ Editar categoría";
  document.getElementById("btn-cancelar-cat").style.display = "inline-block";
}

async function eliminarCategoria(id) {
  const res = await axios.get(`${BASE}/recetas`);
  const asociadas = res.data.filter((r) => idIgual(r.categoriaId, id));
  if (asociadas.length > 0) {
    const ok = confirm(`Esta categoría tiene ${asociadas.length} receta(s) asociada(s). ¿Eliminar igual?`);
    if (!ok) return;
  }
  await axios.delete(`${BASE}/categorias/${id}`);
  mostrarToast("🗑️ Categoría eliminada");
  await cargarCategorias();
  await cargarRecetas();
}

function cancelarEdicionCategoria() { limpiarFormCategoria(); }

function limpiarFormCategoria() {
  document.getElementById("cat-nombre").value = "";
  document.getElementById("cat-color").value  = "#6366F1";
  document.getElementById("form-cat-title").textContent = "➕ Nueva categoría";
  document.getElementById("btn-cancelar-cat").style.display = "none";
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
  const contenedor = document.getElementById("lista-recetas");
  const filtradas  = filtroCategoriaId !== null
    ? lista.filter((r) => idIgual(r.categoriaId, filtroCategoriaId))
    : lista;

  if (filtradas.length === 0) {
    contenedor.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="icon">🍳</div>No hay recetas todavía. ¡Crea la primera!</div>`;
    return;
  }

  contenedor.innerHTML = "";
  filtradas.forEach((receta) => {
    const catColor  = getColorCategoria(receta.categoriaId);
    const catNombre = getNombreCategoria(receta.categoriaId);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      ${receta.imagen ? `<img src="${receta.imagen}" alt="${receta.nombre}" class="card-img" onerror="this.style.display='none'" />` : ""}
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
        <p style="font-size:13px;color:var(--text-muted)">${receta.descripcion || ""}</p>
      </div>
      <div class="card-footer">
        <button class="btn btn-sm">🧂 Ingredientes</button>
        <button class="btn btn-sm btn-edit">Editar</button>
        <button class="btn btn-sm btn-danger">Eliminar</button>
      </div>
    `;

    const [btnIng, btnEdit, btnDel] = card.querySelectorAll(".card-footer .btn");
    btnIng.addEventListener("click",  () => abrirIngredientes(receta.id, receta.nombre));
    btnEdit.addEventListener("click", () => editarReceta(receta.id));
    btnDel.addEventListener("click",  () => eliminarReceta(receta.id));

    contenedor.appendChild(card);
  });
}

async function guardarReceta() {
  try {
    const nombre      = document.getElementById("receta-nombre").value.trim();
    const descripcion = document.getElementById("receta-desc").value.trim();
    const tiempo      = parseInt(document.getElementById("receta-tiempo").value);
    const dificultad  = document.getElementById("receta-dificultad").value;
    const porciones   = parseInt(document.getElementById("receta-porciones").value);
    const categoriaId = document.getElementById("receta-categoria").value;
    const fileInput   = document.getElementById("receta-imagen");

    if (!nombre || !tiempo || !porciones) {
      mostrarToast("⚠️ Completá nombre, tiempo y porciones");
      return;
    }

    if (!categoriaId) {
      mostrarToast("⚠️ Seleccioná una categoría");
      return;
    }

    // Leer imagen si se seleccionó una
    let imagen = "";
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      // Guardamos el nombre del archivo — el usuario debe moverlo a /img/ manualmente
      // o usamos ObjectURL para mostrar localmente sin límite de tamaño
      imagen = URL.createObjectURL(file);
      // Guardamos también el nombre para referencia
      imagen = `img/${file.name}`;
    } else if (editandoRecetaId) {
      const resActual = await axios.get(`${BASE}/recetas/${editandoRecetaId}`);
      imagen = resActual.data.imagen || "";
    }

    const datos = { nombre, descripcion, tiempo, dificultad, porciones, categoriaId, imagen };

    if (editandoRecetaId) {
      await axios.patch(`${BASE}/recetas/${editandoRecetaId}`, datos);
      mostrarToast("✅ Receta actualizada");
    } else {
      await axios.post(`${BASE}/recetas`, datos);
      mostrarToast("✅ Receta creada");
    }

    limpiarFormReceta();
    await cargarRecetas();
  } catch (err) {
    console.error("Error al guardar receta:", err);
    mostrarToast("❌ Error al guardar. ¿Está corriendo json-server?");
  }
}

async function editarReceta(id) {
  const res = await axios.get(`${BASE}/recetas/${id}`);
  const r   = res.data;
  editandoRecetaId = r.id;

  document.getElementById("receta-nombre").value     = r.nombre;
  document.getElementById("receta-desc").value       = r.descripcion;
  document.getElementById("receta-tiempo").value     = r.tiempo;
  document.getElementById("receta-dificultad").value = r.dificultad;
  document.getElementById("receta-porciones").value  = r.porciones;
  document.getElementById("receta-categoria").value  = r.categoriaId;
  document.getElementById("form-receta-title").textContent = "✏️ Editar receta";
  document.getElementById("btn-cancelar-receta").style.display = "inline-block";

  // Mostrar imagen actual si tiene
  mostrarPreviewImagen(r.imagen || "");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarReceta(id) {
  if (!confirm("¿Eliminar esta receta y todos sus ingredientes?")) return;
  const resIng = await axios.get(`${BASE}/ingredientes?recetaId=${id}`);
  await Promise.all(resIng.data.map((ing) => axios.delete(`${BASE}/ingredientes/${ing.id}`)));
  await axios.delete(`${BASE}/recetas/${id}`);
  mostrarToast("🗑️ Receta eliminada");
  await cargarRecetas();
}

function cancelarEdicionReceta() { limpiarFormReceta(); }

function limpiarFormReceta() {
  document.getElementById("receta-nombre").value     = "";
  document.getElementById("receta-desc").value       = "";
  document.getElementById("receta-tiempo").value     = "";
  document.getElementById("receta-dificultad").value = "fácil";
  document.getElementById("receta-porciones").value  = "";
  const fileInput = document.getElementById("receta-imagen");
  if (fileInput) fileInput.value = "";
  mostrarPreviewImagen("");
  document.getElementById("form-receta-title").textContent = "➕ Nueva receta";
  document.getElementById("btn-cancelar-receta").style.display = "none";
  editandoRecetaId = null;
}

async function filtrarRecetas(categoriaId, btn) {
  filtroCategoriaId = categoriaId !== null ? categoriaId : null;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  await cargarRecetas();
}

// ══════════════════════════════════════════════════════
//  INGREDIENTES — CRUD
// ══════════════════════════════════════════════════════
async function abrirIngredientes(recetaId, nombre) {
  recetaActivaId = String(recetaId); // siempre string para que coincida con recetaId en db
  document.getElementById("modal-receta-nombre").textContent = `🧂 ${nombre}`;
  document.getElementById("modal-ingredientes").classList.add("open");
  limpiarFormIngrediente();
  await cargarIngredientes();
}

function cerrarModal() {
  document.getElementById("modal-ingredientes").classList.remove("open");
  recetaActivaId = null;
  limpiarFormIngrediente();
}

async function cargarIngredientes() {
  const res = await axios.get(`${BASE}/ingredientes?recetaId=${recetaActivaId}`);
  renderizarIngredientes(res.data);
}

function renderizarIngredientes(lista) {
  const ul = document.getElementById("lista-ingredientes");
  if (lista.length === 0) {
    ul.innerHTML = `<li style="text-align:center;color:var(--text-muted);padding:16px">Sin ingredientes todavía.</li>`;
    return;
  }
  ul.innerHTML = "";
  lista.forEach((ing) => {
    const li = document.createElement("li");
    li.className = "ing-item";
    li.innerHTML = `
      <span class="ing-name">${ing.nombre}</span>
      <span class="ing-qty">${ing.cantidad} ${ing.unidad}</span>
      <div class="ing-actions">
        <button class="btn btn-sm btn-edit">Editar</button>
        <button class="btn btn-sm btn-danger">✕</button>
      </div>
    `;
    li.querySelector(".btn-edit").addEventListener("click",   () => editarIngrediente(ing.id));
    li.querySelector(".btn-danger").addEventListener("click", () => eliminarIngrediente(ing.id));
    ul.appendChild(li);
  });
}

async function guardarIngrediente() {
  const nombre   = document.getElementById("ing-nombre").value.trim();
  const cantidad = parseFloat(document.getElementById("ing-cantidad").value);
  const unidad   = document.getElementById("ing-unidad").value;
  if (!nombre || !cantidad) { mostrarToast("⚠️ Completá nombre y cantidad"); return; }

  if (editandoIngredienteId) {
    await axios.patch(`${BASE}/ingredientes/${editandoIngredienteId}`, { nombre, cantidad, unidad });
    mostrarToast("✅ Ingrediente actualizado");
  } else {
    // recetaId siempre como string para que coincida con el id de la receta
    await axios.post(`${BASE}/ingredientes`, { nombre, cantidad, unidad, recetaId: String(recetaActivaId) });
    mostrarToast("✅ Ingrediente agregado");
  }

  limpiarFormIngrediente();
  await cargarIngredientes();
}

async function editarIngrediente(id) {
  const res = await axios.get(`${BASE}/ingredientes/${id}`);
  const ing = res.data;
  editandoIngredienteId = ing.id;
  document.getElementById("ing-nombre").value   = ing.nombre;
  document.getElementById("ing-cantidad").value = ing.cantidad;
  document.getElementById("ing-unidad").value   = ing.unidad;
  document.getElementById("form-ing-title").textContent = "✏️ Editar ingrediente";
  document.getElementById("btn-cancelar-ing").style.display = "inline-block";
}

async function eliminarIngrediente(id) {
  await axios.delete(`${BASE}/ingredientes/${id}`);
  mostrarToast("🗑️ Ingrediente eliminado");
  await cargarIngredientes();
}

function cancelarEdicionIngrediente() { limpiarFormIngrediente(); }

function limpiarFormIngrediente() {
  document.getElementById("ing-nombre").value   = "";
  document.getElementById("ing-cantidad").value = "";
  document.getElementById("ing-unidad").value   = "g";
  document.getElementById("form-ing-title").textContent = "➕ Agregar ingrediente";
  document.getElementById("btn-cancelar-ing").style.display = "none";
  editandoIngredienteId = null;
}

// ── Cerrar modales al clickear overlay ─────────────────
document.getElementById("modal-ingredientes").addEventListener("click", function(e) {
  if (e.target === this) cerrarModal();
});
document.getElementById("modal-auth").addEventListener("click", function(e) {
  if (e.target === this) cerrarModalAuth();
});

// ── Nav mobile ──────────────────────────────────────────
document.getElementById("nav-toggle")?.addEventListener("click", () => {
  document.getElementById("main-nav").classList.toggle("open");
});
document.querySelector(".nav-dropdown-btn")?.addEventListener("click", function() {
  this.closest(".nav-dropdown").classList.toggle("open");
});

// ── Preview imagen al seleccionar archivo ───────────────
document.getElementById("receta-imagen")?.addEventListener("change", function() {
  if (this.files[0]) {
    // Usamos ObjectURL para preview local sin límite de tamaño
    const url = URL.createObjectURL(this.files[0]);
    mostrarPreviewImagen(url);
  }
});

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
async function init() {
  initCarrusel();
  await cargarCategorias();
  await cargarRecetas();
}

init();
