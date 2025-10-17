// client/src/js/pages/admin.js
import { initTypingEffect } from "../components/typing-effect.js";

function initAdminHeroAnimation() {
    const heroTitle = document.getElementById('hero-h1');
    const heroParagraph = document.getElementById('hero-paragraph');
    const textToType = "Panell de Control";

    if (heroTitle && heroParagraph) {
        initTypingEffect('hero-h1', textToType, () => {
            heroParagraph.classList.add('visible');
        });
    }
}

/**
 * Carrega i mostra els registres d'auditoria a la taula.
 * @param {number} limit - El nombre de registres a carregar.
 */
async function carregarRegistresAuditoria(limit = 50) {
    const tableBody = document.querySelector("#audit-log-table tbody");
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6">Carregant registres...</td></tr>';

    try {
        const response = await fetch(`/api/audit-logs?limit=${limit}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Error en la resposta del servidor.");
        }

        if (result.data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No s\'han trobat registres d\'auditoria.</td></tr>';
            return;
        }

        tableBody.innerHTML = ""; // Neteja la taula

        result.data.forEach(log => {
            const row = document.createElement("tr");

            // Formata la data per a millor llegibilitat
            const dataFormatada = new Date(log.data_accio_nk).toLocaleString('ca-ES', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            row.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${log.id_admin_nk || 'Sistema'}</td>
                <td>${log.accio_nk}</td>
                <td>${log.taula_objectiu_nk}</td>
                <td>${log.id_objectiu_nk}</td>
                <td><pre>${JSON.stringify(JSON.parse(log.valor_nou_nk || '{}'), null, 2)}</pre></td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error en carregar els registres d'auditoria:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="error-message">Error: ${error.message}</td></tr>`;
    }
}

/**
 * Inicialitza la secció d'auditoria, incloent la càrrega inicial i l'esdeveniment del selector.
 */
function initAuditoriaSection() {
    const limitSelect = document.getElementById('audit-limit-select');
    if (limitSelect) {
        // Càrrega inicial
        carregarRegistresAuditoria(limitSelect.value);

        // Esdeveniment per recarregar quan canvia la selecció
        limitSelect.addEventListener('change', () => carregarRegistresAuditoria(limitSelect.value));
    }
}

export function adminPage() {
    initAdminHeroAnimation();
    initAuditoriaSection(); // <-- Afegim la inicialització de la secció d'auditoria
}