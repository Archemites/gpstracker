/* ==========================================================================
 * Rastreador GPS - lógica do frontend
 * Conversa direto com o servidor definido em config.js (CONFIG.URL_BASE).
 * Não pede link nenhum: conecta sozinho e fica atualizando.
 * ========================================================================== */

const canvas = document.getElementById("mapa");
const ctx = canvas.getContext("2d");

const el = {
    status: document.getElementById("status"),
    rotuloServidor: document.getElementById("rotuloServidor"),
    btnReconectar: document.getElementById("btnReconectar"),
    erro: document.getElementById("erro"),
    lista: document.getElementById("listaCarros"),
    header: document.getElementById("painelHeader"),
    inputId: document.getElementById("inputId"),
    btnAdicionar: document.getElementById("btnAdicionar"),
    msgFrota: document.getElementById("msgFrota"),
};

let config = null;          // limites lat/lon vindos do servidor
let carros = {};
let selecionado = null;
let conectado = false;
let timer = null;

/* ---- Todas as requisições passam por aqui (headers padronizados) ---------- */
async function api(caminho, opcoes = {}) {
    const res = await fetch(CONFIG.URL_BASE + caminho, {
        ...opcoes,
        headers: {
            // Evita a página de aviso do NGROK free em requisições fetch.
            "ngrok-skip-browser-warning": "true",
            ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
            ...(opcoes.headers || {}),
        },
    });
    let corpo = null;
    try { corpo = await res.json(); } catch (_) { /* sem corpo */ }
    if (!res.ok) {
        const msg = (corpo && corpo.erro) ? corpo.erro : "HTTP " + res.status;
        throw new Error(msg);
    }
    return corpo;
}

/* ---- Adicionar veículo à frota pelo ID (precisa estar cadastrado) -------- */
async function adicionarFrota() {
    const id = el.inputId.value.trim().toUpperCase();
    if (!id) {
        mostrarMsgFrota("Digite um ID", false);
        return;
    }
    el.btnAdicionar.disabled = true;
    try {
        await api("/api/frota", { method: "POST", body: JSON.stringify({ id }) });
        el.inputId.value = "";
        mostrarMsgFrota("✓ " + id + " na frota", true);
        atualizar();
    } catch (e) {
        mostrarMsgFrota("✗ " + e.message, false);
    } finally {
        el.btnAdicionar.disabled = false;
    }
}

function mostrarMsgFrota(texto, ok) {
    el.msgFrota.textContent = texto;
    el.msgFrota.className = "msg-frota " + (ok ? "ok" : "falha");
    if (ok) setTimeout(() => { el.msgFrota.textContent = ""; }, 3000);
}

/* ---- Canvas responsivo ---- */
function redimensionarCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 520;
    desenharMapa();
}
window.addEventListener("resize", redimensionarCanvas);

/* ---- Conexão ---- */
async function conectar() {
    pararLoop();
    definirStatus("conectando");
    el.erro.classList.add("oculto");

    try {
        config = await api("/api/config");
        conectado = true;
        definirStatus("online");
        loop();
    } catch (e) {
        conectado = false;
        definirStatus("offline");
        mostrarErro(
            "Não consegui falar com o servidor em <b>" + CONFIG.URL_BASE + "</b>.<br>" +
            "Verifique se o simulador está rodando e se o domínio no <b>config.js</b> está certo. " +
            "(" + e.message + ")"
        );
    }
}

function definirStatus(estado) {
    el.rotuloServidor.textContent = CONFIG.URL_BASE;
    if (estado === "online") {
        el.status.textContent = "● Conectado";
        el.status.className = "status online";
    } else if (estado === "conectando") {
        el.status.textContent = "● Conectando ao servidor…";
        el.status.className = "status offline";
    } else {
        el.status.textContent = "● Desconectado";
        el.status.className = "status offline";
    }
}

function mostrarErro(html) {
    el.erro.innerHTML = html;
    el.erro.classList.remove("oculto");
}

/* ---- Loop de atualização ---- */
async function atualizar() {
    try {
        carros = await api("/api/carros");
        if (!conectado) {          // reconectou sozinho após uma falha
            conectado = true;
            definirStatus("online");
            el.erro.classList.add("oculto");
        }
        atualizarLista();
        desenharMapa();
    } catch (e) {
        conectado = false;
        definirStatus("offline");
        console.error("Falha ao atualizar:", e.message);
    }
}

function loop() {
    atualizar();
    timer = setTimeout(loop, CONFIG.INTERVALO_MS);
}

function pararLoop() {
    if (timer) clearTimeout(timer);
    timer = null;
}

/* ---- Painel lateral ---- */
function atualizarLista() {
    const valores = Object.values(carros);
    el.header.textContent = "Frota (" + valores.length + ")";

    if (valores.length === 0) {
        el.lista.innerHTML = '<div class="carregando">Nenhum carro na frota</div>';
        return;
    }

    el.lista.innerHTML = valores.map(c => `
        <div class="carro-item ${selecionado === c.id ? "selecionado" : ""}"
             data-id="${c.id}">
            <div class="placa" style="color:${c.cor}">${c.placa} <small style="color:#999">#${c.id}</small></div>
            <div class="info">
                <div class="velocidade">⚡ ${c.velocidade.toFixed(0)} km/h</div>
                <div class="distancia">📍 ${c.distancia.toFixed(1)} km</div>
                <div>👤 ${c.motorista}</div>
                <div class="coords">${c.lat.toFixed(5)}°, ${c.lon.toFixed(5)}°</div>
            </div>
        </div>
    `).join("");
}

el.lista.addEventListener("click", (ev) => {
    const item = ev.target.closest(".carro-item");
    if (!item) return;
    const id = item.dataset.id;
    selecionado = selecionado === id ? null : id;
    atualizarLista();
    desenharMapa();
});

/* ---- Desenho do mapa ---- */
function geoParaPx(lat, lon) {
    const x = (lon - config.lon_min) / (config.lon_max - config.lon_min) * canvas.width;
    const y = (config.lat_max - lat) / (config.lat_max - config.lat_min) * canvas.height;
    return [x, y];
}

function desenharMapa() {
    ctx.fillStyle = "#0f2027";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grade
    ctx.strokeStyle = "#1b3a4b";
    ctx.lineWidth = 1;
    const linhas = 6;
    for (let i = 0; i <= linhas; i++) {
        const x = (i / linhas) * canvas.width;
        const y = (i / linhas) * canvas.height;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    if (!config) return;

    for (const id in carros) {
        const c = carros[id];
        const [x, y] = geoParaPx(c.lat, c.lon);
        const sel = selecionado === id;
        const r = sel ? 10 : 7;
        const contorno = sel ? "#ffff00" : "#000";

        ctx.fillStyle = c.cor;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = contorno;
        ctx.lineWidth = sel ? 3 : 1;
        ctx.stroke();

        // Seta de direção
        const ax = x + Math.cos(c.rumo) * (r + 8);
        const ay = y - Math.sin(c.rumo) * (r + 8);
        ctx.strokeStyle = contorno;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        // Placa
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText(c.placa, x, y - r - 8);
    }
}

/* ---- Início ---- */
el.btnReconectar.addEventListener("click", conectar);
el.btnAdicionar.addEventListener("click", adicionarFrota);
el.inputId.addEventListener("keypress", (e) => {
    if (e.key === "Enter") adicionarFrota();
});
redimensionarCanvas();
conectar();
