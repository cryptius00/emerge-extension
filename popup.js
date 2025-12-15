document.addEventListener('DOMContentLoaded', function() {
    // Referencias a las nuevas áreas de contenido
    const emergeButton = document.getElementById('emerge-btn');
    const bubbleArea = document.getElementById('bubble-analysis-area');
    const serendipityArea = document.getElementById('serendipity-result-area');
    
    // --- Lógica del botón ¡Sorpréndeme! (Apunta a serendipityArea) ---
    if (emergeButton) {
        emergeButton.addEventListener('click', function() {
            serendipityArea.innerHTML = `<p class="placeholder">Buscando tendencias en Reddit...</p>`;
            
            fetch('https://www.reddit.com/r/popular/hot.json?limit=25')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error de red al contactar Reddit.');
                    }
                    return response.json();
                })
                .then(data => {
                    const posts = data.data.children.filter(post => !post.data.stickied);
                    if (posts.length === 0) {
                        throw new Error('No se encontraron posts válidos en la respuesta de Reddit.');
                    }
                    
                    const randomPost = posts[Math.floor(Math.random() * posts.length)].data;
                    
                    const discoveryCardHTML = `
                        <div class="discovery-card">
                            <h4>${randomPost.subreddit_name_prefixed}</h4>
                            <p class="title">${randomPost.title}</p>
                            <div class="metrics">
                                <span>🔥 ${randomPost.ups.toLocaleString('es')}</span>
                                <span>💬 ${randomPost.num_comments.toLocaleString('es')}</span>
                            </div>
                            <a href="https://www.reddit.com${randomPost.permalink}" target="_blank" class="cta-button">Explorar Discusión</a>
                        </div>
                    `;
                    
                    serendipityArea.innerHTML = discoveryCardHTML;
                })
                .catch(error => {
                    console.error('Error al obtener datos de Reddit:', error);
                    serendipityArea.innerHTML = `<p class="placeholder error">Error al buscar tendencias. Inténtalo de nuevo.</p>`;
                });
        });
    }

    // --- Lógica del Analizador de Historial (Apunta a bubbleArea) ---
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
                const topDomains = sortedDomains.slice(0, 3);

                if (topDomains.length > 0) {
                    let html = '<ul class="domain-list">';
                    topDomains.forEach(function(domain) {
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
