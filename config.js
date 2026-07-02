/* ==========================================================================
 * CONFIGURAÇÃO DO SERVIDOR
 * ==========================================================================
 * Aqui você configura UMA ÚNICA VEZ o endereço do servidor (o simulador).
 * Depois disso o site conversa direto com ele, sem precisar colar link nenhum.
 *
 * COMO PREENCHER:
 *
 *  1) Crie uma conta grátis no NGROK: https://ngrok.com/signup
 *  2) Pegue seu DOMÍNIO ESTÁTICO grátis em:
 *       https://dashboard.ngrok.com/domains
 *     (o plano free dá 1 domínio fixo, ex: seu-nome.ngrok-free.app)
 *  3) Cole esse domínio abaixo, com https:// na frente.
 *
 * Pronto. Toda vez que você subir o servidor com:
 *       ngrok http --domain=seu-nome.ngrok-free.app 5000
 *  o site vai achar ele sozinho, sem colar link.
 * ========================================================================== */

const CONFIG = {
    // <<< TROQUE AQUI pelo SEU domínio estático do NGROK >>>
    SERVIDOR: "https://shrubbery-overhung-pointing.ngrok-free.dev",

    // Intervalo de atualização dos dados (ms). Menor = mais fluido.
    INTERVALO_MS: 400,
};

/* --------------------------------------------------------------------------
 * Resolução automática do endereço:
 *  - Se você abrir o site em localhost / arquivo local -> usa localhost:5000
 *    (bom pra testar tudo na sua máquina, sem NGROK).
 *  - Caso contrário (GitHub Pages) -> usa o domínio configurado acima.
 * -------------------------------------------------------------------------- */
CONFIG.URL_BASE = (() => {
    const host = location.hostname;
    const local = host === "localhost" || host === "127.0.0.1" || host === "";
    return local ? "http://localhost:5000" : CONFIG.SERVIDOR;
})();
