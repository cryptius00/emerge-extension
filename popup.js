document.addEventListener('DOMContentLoaded', function() {
    // --- Shared State & Configuration ---
    const emergeButton = document.getElementById('emerge-btn');
    const bubbleArea = document.getElementById('bubble-analysis-area');
    const serendipityArea = document.getElementById('serendipity-result-area');
    let userBubble = []; // Almacenará los dominios de la burbuja del usuario

    // Mapa simple de dominios a nichos/temas de subreddits (en minúsculas)
    const nicheMap = {
        'github.com': ['programming', 'javascript', 'webdev', 'coding', 'technology', 'software', 'opensource'],
        'stackoverflow.com': ['programming', 'javascript', 'webdev', 'coding', 'technology'],
        'dev.to': ['programming', 'javascript', 'webdev', 'coding', 'technology'],
        'youtube.com': ['videos', 'gaming', 'music', 'youtubevideos'],
        'twitter.com': ['news', 'politics'],
        'reddit.com': ['popular', 'all', 'askreddit'] // Evitar recursión
    };

    // --- Logic for "Surprise Me" Button (Anti-Bubble Version) ---
    if (emergeButton) {
        emergeButton.addEventListener('click', function() {
            serendipityArea.innerHTML = `<p class="placeholder">Buscando tendencias fuera de tu burbuja...</p>`;
            
            // Determinar los subreddits a evitar
            let forbiddenSubreddits = [];
            userBubble.forEach(domain => {
                // Extraer el nombre principal del dominio (ej. 'www.google.com' -> 'google')
                const mainDomain = domain.replace('www.', '').split('.')[0];
                if (nicheMap[domain]) {
                    forbiddenSubreddits.push(...nicheMap[domain]);
                }
                // Añadir también el nombre del dominio principal como palabra clave a evitar
                forbiddenSubreddits.push(mainDomain);
            });
            // Asegurarse de que no haya duplicados y todo esté en minúsculas
            const uniqueForbidden = [...new Set(forbiddenSubreddits.map(s => s.toLowerCase()))];
            console.log("Burbuja detectada, evitando subreddits relacionados con:", uniqueForbidden);

            fetch('http://localhost:3000/api/getSerendipity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bubble: uniqueForbidden })
            })
                .then(response => {
                    if (!response.ok) throw new Error('Error de red al contactar el backend.');
                    return response.json();
                })
                .then(data => {
                    const discoveryCardHTML = `
                        <div class="discovery-card">
                            <h4>${data.niche}</h4>
                            <p class="reason"><em>Razón:</em> ${data.reason}</p>
                            <p class="source">Fuente: ${data.source}</p>
                            <a href="${data.callToAction.url}" target="_blank" class="cta-button">${data.callToAction.text}</a>
                        </div>
                    `;
                    serendipityArea.innerHTML = discoveryCardHTML;
                })
                .catch(error => {
                    console.error('Error al obtener datos del backend:', error);
                    serendipityArea.innerHTML = `<p class="placeholder error">Error al buscar tendencias. Inténtalo de nuevo.</p>`;
                });
        });
    }

    // --- Logic for History Analyzer ---
    function analyzeHistory() {
        if (chrome.history) {
            chrome.history.search({text: '', maxResults: 100}, function(historyItems) {
                const domainCounts = {};
                historyItems.forEach(function(item) {
                    try {
                        const domain = new URL(item.url).hostname;
                        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
                    } catch (e) {}
                });

                const sortedDomains = Object.keys(domainCounts).sort((a, b) => domainCounts[b] - domainCounts[a]);
                const topDomains = sortedDomains.slice(0, 5); // Leemos 5 para tener más datos

                if (topDomains.length > 0) {
                    userBubble = topDomains; // Guardar la burbuja para que el otro módulo la use
                    let html = '<ul class="domain-list">';
                    // Mostramos solo 3 para no saturar la UI
                    topDomains.slice(0,3).forEach(function(domain) {
                        html += `<li>${domain} <span>(${domainCounts[domain]} visitas)</span></li>`;
                    });
                    html += '</ul>';
                    bubbleArea.innerHTML = html;
                } else {
                    bubbleArea.innerHTML = `<p class="placeholder">No hay suficiente historial para analizar.</p>`;
                }
            });
        } else {
             bubbleArea.innerHTML = `<p class="placeholder">La API de historial no está disponible.</p>`;
        }
    }

    // Ejecutar el análisis al abrir el popup
    analyzeHistory();
});
