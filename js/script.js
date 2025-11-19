// Pestañas
function openTab(evt, tabName) {
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.classList.add("active");
}

// Slider para confianza (Media)
function updateSlider(value) {
  document.getElementById("slider-value").textContent = value + "%";
  document.getElementById("confianza-media").value = value;
}

// Slider para proporción
function updateSliderProp(value) {
  document.getElementById("slider-prop-value").textContent = value + "%";
}

// Toggle pasos (solo se usa para Media)
function toggleSteps(type) {
  const div = document.getElementById(`pasos-${type}`);
  div.classList.toggle("show");
}

// === FUNCIÓN PARA OBTENER VALOR CRÍTICO t DE STUDENT ===
function getTStudent(df, nivel) {
  const tValues = {
    0.90: [6.314,2.920,2.353,2.132,2.015,1.943,1.895,1.860,1.833,1.812,1.796,1.782,1.771,1.761,1.753,1.746,1.740,1.734,1.729,1.725,1.721,1.717,1.714,1.711,1.708,1.706,1.703,1.701,1.699,1.697,1.684,1.671,1.658,1.645],
    0.95: [12.706,4.303,3.182,2.776,2.571,2.447,2.365,2.306,2.262,2.228,2.201,2.179,2.160,2.145,2.131,2.120,2.110,2.101,2.093,2.086,2.080,2.074,2.069,2.064,2.060,2.056,2.052,2.048,2.045,2.042,2.021,2.000,1.980,1.960],
    0.99: [31.821,6.965,4.541,3.747,3.365,3.143,2.998,2.896,2.821,2.764,2.718,2.681,2.650,2.624,2.602,2.583,2.567,2.552,2.539,2.528,2.518,2.508,2.500,2.492,2.485,2.479,2.473,2.467,2.462,2.457,2.423,2.390,2.358,2.326]
  };
  const conf = nivel === 0.90 ? 0.90 : nivel === 0.95 ? 0.95 : 0.99;
  const tabla = tValues[conf];
  const idx = df - 1;
  return idx < tabla.length ? tabla[idx] : tabla[tabla.length - 1];
}

// === MEDIA (AQUÍ ESTÁ LA ÚNICA PARTE MEJORADA) ===
function calcularMedia() {
  const texto = document.getElementById("datos-media").value.trim();
  const nivelConfianza = parseFloat(document.getElementById("confianza-media").value);
  const nivel = nivelConfianza / 100;
  const datos = texto.split(/[\s,\n;]+/).map(Number).filter(n => !isNaN(n));
  if (datos.length < 2) return showError("media", "Ingresa al menos 2 números válidos");

  const n = datos.length;
  const suma = datos.reduce((a, b) => a + b, 0);
  const media = suma / n;
  const varianza = datos.reduce((sum, v) => sum + Math.pow(v - media, 2), 0) / (n - 1);
  const s = Math.sqrt(varianza);
  const gl = n - 1;
  const t = getTStudent(gl, nivel);
  const error = t * s / Math.sqrt(n);
  const inf = media - error;
  const sup = media + error;

  // Resultado principal (sin cambios)
  document.getElementById("resultado-media").innerHTML = `
    <div class="resultado-item">
      <strong>Estimación Puntual (Media)</strong><br>${media.toFixed(4)}
    </div>
    <div class="resultado-item">
      <strong>Intervalo ${nivelConfianza}%</strong><br>[${inf.toFixed(4)}, ${sup.toFixed(4)}]
    </div>
  `;

  // PASOS DETALLADOS AHORA QUEDAN HERMOSOS (como en proporción)
  document.getElementById("pasos-media").innerHTML = `
    <h3 style="color:#27ae60; margin-bottom:20px;">Pasos Detallados del Cálculo (Media)</h3>
    <ol style="font-size:16.5px; line-height:2.2; padding-left:28px;">
      <li><strong>Datos ingresados:</strong><br>
          <span style="background:#f8f9fa; padding:6px 12px; border-radius:8px; font-family:monospace; font-size:15px;">
            ${datos.join(', ')}
          </span> (n = ${n})
      </li>

      <li><strong>Media muestral (¯x):</strong><br>
          \\(\\bar{x} = \\dfrac{${suma.toFixed(2)}}{${n}} = ${media.toFixed(4)}\\)
      </li>

      <li><strong>Desviación estándar muestral (s):</strong><br>
          \\(s = ${s.toFixed(4)}\\)
      </li>

      <li><strong>Grados de libertad:</strong> gl = n - 1 = ${gl}</li>

      <li><strong>Nivel de confianza:</strong> ${nivelConfianza}% → 
          t<sub>α/2, ${gl}</sub> = <strong>${t.toFixed(4)}</strong>
      </li>

      <li><strong>Margen de error (E):</strong><br>
          \\(E = ${t.toFixed(4)} \\times \\dfrac{${s.toFixed(4)}}{\\sqrt{${n}}} = ${error.toFixed(4)}\\)
      </li>

      <li><strong>Intervalo de confianza ${nivelConfianza}%:</strong><br>
          <div style="background:#d4edda; padding:20px 25px; border-radius:12px; text-align:center; font-size:1.5em; margin:25px 0; border-left:6px solid #27ae60;">
            <strong>[ ${inf.toFixed(4)} , ${sup.toFixed(4)} ]</strong>
          </div>
      </li>

      <li><strong>Interpretación:</strong><br>
          <em>Con un <strong>${nivelConfianza}%</strong> de confianza, la media poblacional (μ) está entre 
          <strong>${inf.toFixed(4)}</strong> y <strong>${sup.toFixed(4)}</strong>.</em>
      </li>
    </ol>
  `;

  // Renderizar fórmulas con MathJax
  MathJax.typesetClear();
  MathJax.typesetPromise();

  guardarEnHistorial("media", texto.substring(0, 80) + (texto.length > 80 ? "..." : ""), `Media: ${media.toFixed(4)} | IC [${inf.toFixed(4)}, ${sup.toFixed(4)}]`);
}

function showError(id, msg) {
  document.getElementById(`resultado-${id}`).innerHTML = `<div class="error" style="color:#e74c3c;padding:20px;">${msg}</div>`;
}

// === PROPORCIÓN (TODO IGUAL, SIN CAMBIOS) ===
function calcularProporcion() {
  const x = parseInt(document.getElementById("exitos").value);
  const n = parseInt(document.getElementById("tamano").value);
  const conf = parseInt(document.getElementById("nivel-conf").value);
  if (isNaN(x) || isNaN(n) || x > n || x < 0 || n < 1) return showError("prop", "Datos inválidos");

  const z = conf === 90 ? 1.645 : conf === 95 ? 1.96 : 2.576;
  document.getElementById("z-value").value = z.toFixed(3);

  const z2 = z * z;
  const p = x / n;
  const wilsonCenter = (x + z2 / 2) / (n + z2);
  const margen = z * Math.sqrt((p * (1 - p) / n) + (z2 / (4 * n * n)));
  const denominador = 1 + z2 / n;
  const wilsonInf = wilsonCenter - margen / denominador;
  const wilsonSup = wilsonCenter + margen / denominador;

  const usarJeffrey = n < 40 || x < 5 || (n - x) < 5;
  const mejorMethod = usarJeffrey ? "Jeffrey" : "Wilson";
  const mejorValue = usarJeffrey ? (x + 0.5) / (n + 1) : wilsonCenter;

  document.getElementById("resultados-prop").innerHTML = `
    <div class="resultado-item"><strong>MLE</strong><br>${p.toFixed(6)}</div>
    <div class="resultado-item"><strong>Jeffrey</strong><br>${((x+0.5)/(n+1)).toFixed(6)}</div>
    <div class="resultado-item"><strong>Wilson</strong><br>${wilsonCenter.toFixed(6)}</div>
    <div class="resultado-item"><strong>Laplace</strong><br>${((x+1)/(n+2)).toFixed(6)}</div>
  `;

  document.getElementById("mejor-estimado").innerHTML = `
    <h3>Mejor Estimado</h3>
    <div class="valor">${mejorMethod}: ${mejorValue.toFixed(6)}</div>
    <h4>Intervalo Wilson ${conf}%</h4>
    <div class="valor">[${wilsonInf.toFixed(6)}, ${wilsonSup.toFixed(6)}]</div>
  `;

  guardarEnHistorial("proporcion", `x=${x}, n=${n}`, `IC: [${wilsonInf.toFixed(4)}, ${wilsonSup.toFixed(4)}]`, mejorMethod + ": " + mejorValue.toFixed(6));
}

// === NUEVA FUNCIÓN: PASOS DETALLADOS PARA PROPORCIÓN (sin cambios) ===
function mostrarPasosProporcion() {
  const x = parseInt(document.getElementById("exitos").value) || 0;
  const n = parseInt(document.getElementById("tamano").value) || 0;
  const conf = parseInt(document.getElementById("nivel-conf").value) || 95;

  if (n < 1 || x > n || x < 0) {
    document.getElementById("pasos-prop").innerHTML = `<p style="color:#e74c3c; text-align:center;">Primero ingresa datos válidos y presiona "Calcular Estimaciones"</p>`;
    document.getElementById("pasos-prop").classList.add("show");
    return;
  }

  const z = conf === 90 ? 1.645 : conf === 95 ? 1.96 : 2.576;
  const z2 = z * z;
  const p = x / n;
  const wilsonCenter = (x + z2 / 2) / (n + z2);
  const margen = z * Math.sqrt((p * (1 - p) / n) + (z2 / (4 * n * n)));
  const denominador = 1 + z2 / n;
  const wilsonInf = wilsonCenter - margen / denominador;
  const wilsonSup = wilsonCenter + margen / denominador;
  const usarJeffrey = n < 40 || x < 5 || (n - x) < 5;
  const jeffrey = (x + 0.5) / (n + 1);

  document.getElementById("pasos-prop").innerHTML = `
    <h3>Pasos Detallados del Cálculo (Proporción)</h3>
    <ol>
      <li><strong>Datos ingresados:</strong> x = ${x} éxitos, n = ${n} observaciones</li>
      <li><strong>Proporción muestral (MLE):</strong><br>
          \\(\\hat{p} = \\dfrac{${x}}{${n}} = ${p.toFixed(6)}\\)</li>
      <li><strong>Nivel de confianza:</strong> ${conf}% → z = ${z.toFixed(3)}</li>
      <li><strong>Centro Wilson:</strong><br>
          \\(\\tilde{p} = \\dfrac{${x} + \\dfrac{${z2.toFixed(3)}}{2}}{${n} + ${z2.toFixed(3)}} = ${wilsonCenter.toFixed(6)}\\)</li>
      <li><strong>Margen de error ajustado:</strong> ${margen.toFixed(6)}</li>
      <li><strong>Denominador Wilson:</strong> 1 + z²/n = ${denominador.toFixed(6)}</li>
      <li><strong>Intervalo Wilson ${conf}%:</strong><br>
          \\(\\left[ ${wilsonCenter.toFixed(6)} \\pm \\dfrac{${margen.toFixed(6)}}{${denominador.toFixed(6)}} \\right]\\)<br>
          → [<strong>${wilsonInf.toFixed(6)}</strong>, <strong>${wilsonSup.toFixed(6)}</strong>]</li>
      <li><strong>Muestra pequeña?</strong> (n<40 o x<5 o n-x<5) → ${usarJeffrey ? "SÍ → Recomendado Jeffrey" : "NO → Wilson es adecuado"}</li>
      <li><strong>Mejor estimado puntual:</strong> <strong>${usarJeffrey ? "Jeffrey" : "Wilson"}</strong> = ${(usarJeffrey ? jeffrey : wilsonCenter).toFixed(6)}</li>
    </ol>
    <p><strong>Interpretación:</strong> Con ${conf}% de confianza, la proporción real está entre 
    <strong>${(wilsonInf*100).toFixed(2)}%</strong> y <strong>${(wilsonSup*100).toFixed(2)}%</strong>.</p>
  `;

  const div = document.getElementById("pasos-prop");
  div.classList.add("show");

  MathJax.typesetClear();
  MathJax.typeset();
}

// ===================================================================
// 4 EJEMPLOS PRÁCTICOS — TODO EN LA MISMA PESTAÑA
// ===================================================================

const ejemplos = {
  1: { tipo: "proporcion", titulo: "Proyectos entregados a tiempo", texto: "En una empresa de desarrollo web se revisaron 120 proyectos. 96 se entregaron en la fecha acordada.", valores: { exitos: 96, tamano: 120, confianza: 95 } },
  2: { tipo: "proporcion", titulo: "Clics en botón 'Comprar ahora'", texto: "De 300 visitantes a una tienda online, 78 hicieron clic en el botón.", valores: { exitos: 78, tamano: 300, confianza: 95 } },
  3: { tipo: "media", titulo: "Horas diarias frente a la PC", texto: "40 estudiantes de informática reportaron sus horas diarias frente a la pantalla.", datos: "7,8,9,6,10,8,7,9,8,6,11,7,8,9,8,7,10,6,8,9,7,8,9,8,7,6,10,8,9,7,8,9,8,7,6,8,9,7,8,9", confianza: 95 },
  4: { tipo: "media", titulo: "Tiempo de carga de página web", texto: "Se midió el tiempo de carga (en segundos) en 30 visitas a un sitio web.", datos: "2.1,2.4,1.9,2.6,2.3,2.0,2.5,2.2,2.1,2.4,1.8,2.7,2.3,2.1,2.5,2.0,2.4,2.2,2.3,2.1,2.6,1.9,2.4,2.2,2.0,2.5,2.3,2.1,2.4,2.2", confianza: 90 }
};

let ejemploSeleccionado = 1;

function seleccionarEjemplo(id) {
  ejemploSeleccionado = id;
  document.querySelectorAll('.btn-ejemplo').forEach(b => b.classList.remove('active'));
  document.querySelector(`.btn-ejemplo[data-id="${id}"]`).classList.add('active');

  const ej = ejemplos[id];
  document.getElementById('contenido-ejemplo').innerHTML = `
    <h3>${ej.titulo}</h3>
    <p><strong>Enunciado:</strong><br>${ej.texto}</p>
    <p><strong>Datos:</strong> ${ej.tipo === "proporcion" ? `x = ${ej.valores.exitos}, n = ${ej.valores.tamano}` : ej.datos.split(',').length + " mediciones"}</p>
    <p><strong>Nivel de confianza:</strong> ${ej.valores?.confianza || ej.confianza}%</p>
  `;
}

document.getElementById('btn-cargar-ejemplo').addEventListener('click', function() {
  const ej = ejemplos[ejemploSeleccionado];
  let htmlResultado = "";

  if (ej.tipo === "proporcion") {
    const {exitos: x, tamano: n, confianza: conf} = ej.valores;
    const z = conf === 95 ? 1.96 : (conf === 90 ? 1.645 : 2.576);
    const z2 = z * z;
    const pHat = x / n;
    const wilson = (x + z2/2) / (n + z2);
    const margen = z * Math.sqrt((pHat*(1-pHat)/n) + z2/(4*n*n));
    const denom = 1 + z2/n;
    const inf = (wilson - margen/denom).toFixed(4);
    const sup = (wilson + margen/denom).toFixed(4);

    htmlResultado = `
      <div style="background:#e8f5e8;padding:25px;border-radius:15px;border-left:6px solid #27ae60;margin-top:25px;box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        <h3 style="color:#27ae60;margin-top:0;">Resultado Completo</h3>
        <p><strong>${ej.titulo}</strong></p>
        <p>Éxitos: <strong>${x}</strong> de <strong>${n}</strong> casos → <strong>${(pHat*100).toFixed(1)}%</strong></p>
        <p><strong>Mejor estimado (Wilson):</strong> ${(wilson*100).toFixed(2)}%</p>
        <p><strong>Intervalo de confianza ${conf}%:</strong></p>
        <p style="font-size:1.6em;color:#27ae60;font-weight:bold;">[${inf}, ${sup}]</p>
        <p style="background:#d0f0d0;padding:15px;border-radius:8px;">
          <strong>Interpretación:</strong> Con ${conf}% de confianza, la proporción real está entre <strong>${(inf*100).toFixed(1)}%</strong> y <strong>${(sup*100).toFixed(1)}%</strong>.
        </p>
      </div>
    `;

    guardarEnHistorial("proporcion", `x=${x}, n=${n}`, `IC ${conf}%: [${inf}, ${sup}]`, `Wilson: ${wilson.toFixed(4)}`);

  } else if (ej.tipo === "media") {
    const datos = ej.datos.split(',').map(Number);
    const n = datos.length;
    const suma = datos.reduce((a,b)=>a+b,0);
    const media = suma / n;
    const varianza = datos.reduce((sum,v)=>sum+Math.pow(v-media,2),0)/(n-1);
    const s = Math.sqrt(varianza);
    const t = getTStudent(n-1, ej.confianza/100);
    const error = t * s / Math.sqrt(n);
    const inf = (media - error).toFixed(4);
    const sup = (media + error).toFixed(4);

    htmlResultado = `
      <div style="background:#e8f5ff;padding:25px;border-radius:15px;border-left:6px solid #3498db;margin-top:25px;box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        <h3 style="color:#3498db;margin-top:0;">Resultado Completo</h3>
        <p><strong>${ej.titulo}</strong></p>
        <p>Muestreo de <strong>${n}</strong> mediciones</p>
        <p><strong>Media muestral:</strong> ${media.toFixed(4)} ${ejemploSeleccionado===3?'horas':'segundos'}</p>
        <p><strong>Desviación típica:</strong> ${s.toFixed(4)}</p>
        <p><strong>Intervalo de confianza ${ej.confianza}%:</strong></p>
        <p style="font-size:1.6em;color:#3498db;font-weight:bold;">[${inf}, ${sup}]</p>
        <p style="background:#d0e8ff;padding:15px;border-radius:8px;">
          <strong>Interpretación:</strong> Con ${ej.confianza}% de confianza, el promedio real está entre <strong>${inf}</strong> y <strong>${sup}</strong> ${ejemploSeleccionado===3?'horas':'segundos'}.
        </p>
      </div>
    `;

    guardarEnHistorial("media", `n=${n} valores`, `Media: ${media.toFixed(4)} | IC [${inf}, ${sup}]`);
  }

  document.getElementById("solucion-ejemplo").innerHTML = htmlResultado;
  document.getElementById("solucion-ejemplo").scrollIntoView({behavior: "smooth"});
});

document.addEventListener('DOMContentLoaded', () => {
  seleccionarEjemplo(1);
  document.querySelectorAll('.btn-ejemplo').forEach(btn => {
    btn.addEventListener('click', () => seleccionarEjemplo(btn.dataset.id));
  });
});

// ===================================================================
// HISTORIAL: SOLO VISUALIZAR Y ELIMINAR CON X
// ===================================================================

let historial = JSON.parse(localStorage.getItem("historialCalc")) || [];

function guardarEnHistorial(tipo, datos, resultado, mejor = null) {
  const entrada = { id: Date.now(), fecha: new Date().toLocaleString(), tipo, datos, resultado, mejor };
  historial.unshift(entrada);
  localStorage.setItem("historialCalc", JSON.stringify(historial));
  if (document.getElementById("historial").style.display === "block") mostrarHistorial();
}

function mostrarHistorial() {
  const contenedor = document.getElementById("lista-historial");
  if (historial.length === 0) {
    contenedor.innerHTML = `<p style="text-align:center; color:#95a5a6; grid-column:1/-1;">Aún no hay cálculos guardados</p>`;
    return;
  }
  contenedor.innerHTML = historial.map(item => `
    <div class="historial-item" style="position:relative;padding-right:50px;">
      <h4>${item.tipo === "media" ? "Media μ" : "Proporción p"}</h4>
      <p><strong>${item.tipo === "media" ? "Datos" : "Éxitos/Muestra"}:</strong> ${item.datos}</p>
      <p><strong>Resultado:</strong> ${item.resultado}</p>
      ${item.mejor ? `<p><strong>Mejor método:</strong> ${item.mejor}</p>` : ""}
      <small>${item.fecha}</small>
      <button 
        onclick="eliminarDelHistorial(${item.id})" 
        style="
          position:absolute;
          top:15px;
          right:15px;
          width:32px;
          height:32px;
          background:#e74c3c;
          color:white;
          border:none;
          border-radius:50%;
          font-size:18px;
          font-weight:bold;
          cursor:pointer;
          box-shadow:0 2px 5px rgba(0,0,0,0.2);
        "
        onmouseover="this.style.background='#c0392b'"
        onmouseout="this.style.background='#e74c3c'"
      >X</button>
    </div>
  `).join("");
}

function eliminarDelHistorial(id) {
  historial = historial.filter(h => h.id !== id);
  localStorage.setItem("historialCalc", JSON.stringify(historial));
  mostrarHistorial();
}

function limpiarHistorial() {
  if (confirm("¿Seguro que quieres borrar todo el historial?")) {
    historial = [];
    localStorage.removeItem("historialCalc");
    mostrarHistorial();
  }
}

document.querySelector("button[onclick*='historial']").addEventListener("click", mostrarHistorial);

// Scroll to top button
window.onscroll = function() {
  const btn = document.getElementById("btn-up");
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    btn.classList.add("show");
  } else {
    btn.classList.remove("show");
  }
};

document.getElementById("btn-up").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", function(e) {
    const target = this.getAttribute("href").substring(1);
    document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    if (target !== "about") {
      document.getElementById(target).style.display = "block";
      document.querySelector(`button[onclick*="${target}"]`).classList.add("active");
    }
  });
});
// LIMPIAR PROPORCIÓN
function limpiarProporcion() {
  document.getElementById("exitos").value = "";
  document.getElementById("tamano").value = "";
  document.getElementById("nivel-conf").value = 95;
  document.getElementById("slider-prop-value").textContent = "95%";
  document.getElementById("z-value").value = "";
  document.getElementById("resultados-prop").innerHTML = "";
  document.getElementById("mejor-estimado").innerHTML = "";
  document.getElementById("pasos-prop").innerHTML = "";
  document.getElementById("pasos-prop").classList.remove("show");
}

// LIMPIAR MEDIA
function limpiarMedia() {
  document.getElementById("datos-media").value = "";
  document.getElementById("confianza-media").value = 95;
  document.getElementById("slider-value").textContent = "95%";
  document.getElementById("resultado-media").innerHTML = "";
  document.getElementById("pasos-media").innerHTML = "";
  document.getElementById("pasos-media").classList.remove("show");
}