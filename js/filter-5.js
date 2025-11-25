// ========================================================================
// SCRIPT CURUMII - VERSÃO FINAL (DELEGAÇÃO DE EVENTOS) ⚡
// ========================================================================
console.log("Script Curumii: Versão Final Ativa ⚡");

let allData = [];
let filteredData = [];
let selectedGeneros = [];

// Configurações
let itemsToShow = 6;
const itemsPerLoad = 6;
const USE_ONLINE = false;
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT0var1VwvNMPs4QRTB5Al3f8hjzrp5BQ2WLY17GoblJSCiOadsdvb8wZoiCviFFxgUFvO243zg8DIs/pub?gid=0&single=true&output=csv';

// Dados CSV
const INLINE_CSV = `Título,Imagem,Resumo,URL,Duração,Genero,Idade,Sensibilidade Luz,Plataforma
Peppa Santa's Grotto,imagens/T01-pepa-santa.jpg,"Junte-se a Peppa Pig em aventuras de Natal!",https://www.youtube.com/watch?v=bwGRxdpFmRU,00:55:01,Aventura,Livre,Sim,YouTube
Pequenas histórias com Bluey,imagens/T02-pequenas-historias-bluey.png,"Coleção de histórias de Bluey e Bingo.",https://www.youtube.com/watch?v=5IRl-R73n3k,00:27:56,Fantasia,Livre,Não,YouTube
Visitando o Vovô,imagens/T03-visitando-vovo.png,"Daniel Tigre visita o Vovô Tigre.",https://www.youtube.com/watch?v=cp0xmXc5nLM,00:11:35,Aventura,14,Não,YouTube
Sid o cientista- A Lupa,imagens/T04-sid-lupa.png,"Sid descobre como usar uma lupa.",https://www.youtube.com/watch?v=EwgfG0OJqjI,00:22:48,Educativo,16,Não,YouTube
Turma da Mônica-Linda Noite de Natal,imagens/T05-monica-natal.png,"Especial de Natal da Turma da Mônica.",https://www.youtube.com/watch?v=0O2aVH5Z0Ps,00:26:03,Fantasia,Livre,Não,YouTube
Franklin Joga Futebol,imagens/T06-frank-futebol.png,"Franklin aprende a jogar futebol.",https://www.youtube.com/watch?v=g66un_jWVe0,00:22:57,Educativo,10,Sim,YouTube
Título 7,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-07.html,00:45:21,Arte,12,Não,YouTube
Título 8,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-08.html,00:25:36,Arte,14,Não,YouTube
Título 9,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-09.html,00:22:33,Fantasia,10,Não,YouTube
Título 10,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-10.html,01:15:18,Musical,16,Não,YouTube
Título 11,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-11.html,00:45:21,Arte,12,Sim,YouTube
Título 12,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-12.html,00:25:36,Fantasia,Livre,Não,YouTube
Título 13,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-13.html,00:22:33,Arte,Livre,Não,YouTube
Título 14,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-14.html,01:15:18,Educativo,12,Sim,YouTube
Título 15,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-15.html,00:45:21,Arte,Livre,Não,YouTube
Título 16,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-16.html,00:25:36,Musical,10,Não,YouTube
Título 17,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-17.html,01:25:36,Musical,16,Não,YouTube
Título 18,imagens/img-thumb.png,"Lorem ipsum dolor sit amet.",/titulo-18.html,02:25:36,Musical,10,Não,YouTube`;

// =====================================================
// LÓGICA PRINCIPAL
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

function setupEventListeners() {
    // 1. DELEGAÇÃO DE EVENTOS PARA O CLICK NOS CARDS
    // Isso garante que o clique funcione mesmo em itens criados depois
    const container = document.getElementById('itemsContainer');
    if (container) {
        container.addEventListener('click', function(e) {
            // Procura se o clique foi dentro de um card
            const card = e.target.closest('.item-card');
            if (card) {
                const url = card.getAttribute('data-url');
                console.log("Card clicado! URL:", url); // Debug
                handleCardClick(url);
            }
        });
    }

    // Listeners de filtros
    ['filterDuracao', 'filterIdade', 'filterLuz', 'filterPlataforma'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyFilters);
    });
    
    const searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.addEventListener('input', applyFilters);

    // Fechar Player
    const btnClose = document.getElementById('closePlayer');
    if (btnClose) btnClose.addEventListener('click', closeVideoPlayer);
    
    const modal = document.getElementById('videoModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeVideoPlayer();
        });
    }
}

// =====================================================
// CARREGAMENTO E RENDERIZAÇÃO
// =====================================================
async function loadData() {
    try {
        let csvText = USE_ONLINE ? await (await fetch(SHEET_URL)).text() : INLINE_CSV;
        Papa.parse(csvText, {
            header: true,
            complete: (results) => {
                allData = results.data.filter(row => row.Título && row.Título.trim() !== '');
                initializeFilters();
                applyFilters();
            }
        });
    } catch (error) {
        console.error('Erro:', error);
    }
}

function renderItems() {
    const container = document.getElementById('itemsContainer');
    const info = document.getElementById('resultsInfo');
    
    if (!container) return;

    // Atualiza Info
    if (info) {
        const total = filteredData.length;
        const showing = Math.min(itemsToShow, total);
        info.style.display = 'block';
        info.textContent = `Mostrando ${showing} de ${total} itens`;
    }

    if (filteredData.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhum item encontrado.</div>';
        removeLoadMoreButton();
        return;
    }

    // Renderiza HTML
    const itemsToDisplay = filteredData.slice(0, itemsToShow);
    container.innerHTML = itemsToDisplay.map(item => {
        const thumb = item.Imagem || 'https://via.placeholder.com/400x200?text=Sem+Imagem';
        // Escapa aspas para evitar quebrar o HTML
        const safeUrl = String(item.URL || '').replace(/'/g, "\\'");
        const safeTitle = String(item.Título || '').replace(/'/g, "\\'");
        
        return `
        <div class="item-card" data-url='${safeUrl}'>
            <img src="${thumb}" alt="${item.Título}" class="item-image">
            <div class="item-content">
                <div class="item-title">${item.Título}</div>
                <div class="item-description">${item.Resumo || ''}</div>
                <div class="item-tags">
                    <span class="tag genero">${item.Genero || ''}</span>
                    <span class="tag idade">${item.Idade || ''}</span>
                </div>
            </div>
        </div>`;
    }).join('');

    updateLoadMoreButton();
}

// =====================================================
// LÓGICA DO PLAYER (MODAL)
// =====================================================
function handleCardClick(url) {
    if (!url) return;
    const isYouTube = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i.test(url);
    
    if (isYouTube) {
        openVideoPlayer(url);
    } else {
        window.open(url, '_blank');
    }
}

function openVideoPlayer(url) {
    const modal = document.getElementById('videoModal');
    const wrapper = document.getElementById('playerWrapper');

    if (!modal || !wrapper) {
        console.error("Modal ou Wrapper não encontrados!");
        return;
    }

    let videoId = '';
    const shortMatch = url.match(/youtu\.be\/([^\?&]+)/);
    const longMatch = url.match(/[?&]v=([^&]+)/);
    
    if (shortMatch) videoId = shortMatch[1];
    else if (longMatch) videoId = longMatch[1];
    
    if (!videoId) return;

    // Código oficial e limpo
    wrapper.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen
            style="position:absolute; left:0; top:0; width:100%; height:100%; border-radius:8px;">
        </iframe>`;

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}

function closeVideoPlayer() {
    const modal = document.getElementById('videoModal');
    const wrapper = document.getElementById('playerWrapper');
    
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
    // Limpa o HTML para parar o vídeo imediatamente
    if (wrapper) {
        wrapper.innerHTML = '';
    }
}

// =====================================================
// FILTROS E UTILITÁRIOS
// =====================================================
function initializeFilters() {
    const loading = document.getElementById('loading');
    if(loading) loading.style.display = 'none';
    updateSelectedFilters();
}

function applyFilters() {
    itemsToShow = itemsPerLoad; // Reseta paginação ao filtrar
    const searchTerm = document.getElementById('searchBox')?.value.toLowerCase() || '';
    const duracao = document.getElementById('filterDuracao').value;
    const idade = document.getElementById('filterIdade').value;
    const luz = document.getElementById('filterLuz').value;
    const plataforma = document.getElementById('filterPlataforma').value;

    updateSelectedFilters();

    filteredData = allData.filter(item => {
        const matchSearch = !searchTerm || item.Título.toLowerCase().includes(searchTerm) || item.Resumo.toLowerCase().includes(searchTerm);
        const matchDuracao = !duracao || getDurationCategory(item.Duração) === duracao;
        const matchGenero = selectedGeneros.length === 0 || selectedGeneros.includes(item.Genero);
        const matchIdade = checkAgeFilter(item.Idade, idade);
        const matchLuz = !luz || item['Sensibilidade Luz'] === luz;
        const matchPlataforma = !plataforma || item.Plataforma === plataforma;

        return matchSearch && matchDuracao && matchGenero && matchIdade && matchLuz && matchPlataforma;
    });

    renderItems();
}

function updateLoadMoreButton() {
    removeLoadMoreButton();
    if (filteredData.length > itemsToShow) {
        const container = document.getElementById('itemsContainer');
        const btnDiv = document.createElement('div');
        btnDiv.id = 'loadMoreContainer';
        btnDiv.className = 'load-more-container';
        btnDiv.innerHTML = `<button class="btn-load-more" onclick="loadMoreItems()">Ver Mais</button>`;
        container.parentNode.insertBefore(btnDiv, container.nextSibling);
    }
}

function removeLoadMoreButton() {
    const btn = document.getElementById('loadMoreContainer');
    if (btn) btn.remove();
}

function loadMoreItems() {
    itemsToShow += itemsPerLoad;
    renderItems();
}

// Helpers simples
function parseDuration(d) { if(!d)return 0; const p=d.split(':'); return (parseInt(p[0])||0)*60+(parseInt(p[1])||0); }
function getDurationCategory(d) { const m=parseDuration(d); return m<30?'curta':m<=60?'media':'longa'; }
function formatDuration(d) { if(!d)return ''; const p=d.split(':'); const h=parseInt(p[0]),m=parseInt(p[1]); return h>0?`${h}h${m}min`:`${m}min`; }
function checkAgeFilter(c,f) { if(!f||f==='Livre')return c==='Livre'; const o=['Livre','10','12','14','16']; return o.indexOf(c)<=o.indexOf(f); }
function toggleGeneroDropdown() { document.getElementById('generoDropdown')?.classList.toggle('show'); }

function updateSelectedFilters() { /* Mantenha sua lógica visual de tags aqui se desejar */ }

// Listener para fechar dropdown
document.addEventListener('click', e => {
    const d = document.getElementById('generoDropdown');
    const t = document.getElementById('generoToggle');
    if(d && t && !t.contains(e.target) && !d.contains(e.target)) d.classList.remove('show');
});

function updateGeneroFilter(all) {
    const cbs = document.querySelectorAll('#generoDropdown input');
    if(all) cbs.forEach(c => {if(c.id!=='genero-todos')c.checked=false});
    else document.getElementById('genero-todos').checked=false;
    selectedGeneros = Array.from(cbs).filter(c=>c.checked&&c.id!=='genero-todos').map(c=>c.value);
    document.getElementById('generoLabel').textContent = selectedGeneros.length ? `${selectedGeneros.length} gêneros` : 'Todos os Gêneros';
    applyFilters();
}

function clearFilters() {
    document.getElementById('searchBox').value='';
    document.querySelectorAll('select').forEach(s=>s.value='');
    document.querySelectorAll('#generoDropdown input').forEach(c=>c.checked=false);
    selectedGeneros=[];
    document.getElementById('generoLabel').textContent='Todos os Gêneros';
    applyFilters();
}