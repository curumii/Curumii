// ========================================================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ========================================================================
console.log("Script Curumii: Versão Manual (Mais Segura) Carregada 🚀");

let allData = [];
let filteredData = [];
let selectedGeneros = [];
let videoWrapper = null; // Onde o vídeo será injetado

// Configuração de Paginação
let itemsToShow = 6;
const itemsPerLoad = 6;

const USE_ONLINE = false;
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT0var1VwvNMPs4QRTB5Al3f8hjzrp5BQ2WLY17GoblJSCiOadsdvb8wZoiCviFFxgUFvO243zg8DIs/pub?gid=0&single=true&output=csv';

// Seus dados CSV
const INLINE_CSV = `Título,Imagem,Resumo,URL,Duração,Genero,Idade,Sensibilidade Luz,Plataforma
Peppa Santa´s Grotto,imagens/T01-pepa-santa.jpg,"Junte-se a Peppa Pig, seu irmãozinho George, Mamãe Pig e Papai Pig nesta divertida compilação de episódios!",https://www.youtube.com/watch?v=bwGRxdpFmRU,00:55:01,Aventura,Livre,Sim,YouTube
Pequenas histórias com Bluey,imagens/T02-pequenas-historias-bluey.png,"Coleção de pequenas histórias de Bluey, Bingo e a sua família.",https://www.youtube.com/watch?v=5IRl-R73n3k,00:27:56,Fantasia,Livre,Não,YouTube
Visitando o Vovô,imagens/T03-visitando-vovo.png,"Daniel Tigre e a sua família fazem uma viagem para visitar o Vovô Tigre.",https://www.youtube.com/watch?v=cp0xmXc5nLM,00:11:35,Aventura,14,Não,YouTube
Sid o cientista- A Lupa,imagens/T04-sid-lupa.png,"Sid está curioso sobre os seus bichinhos de estimação, os tatuzinhos.",https://www.youtube.com/watch?v=EwgfG0OJqjI,00:22:48,Educativo,16,Não,YouTube
Turma da Mônica-Linda Noite de Natal,imagens/T05-monica-natal.png,"Especial de Natal da Turma da Mônica.",https://www.youtube.com/watch?v=0O2aVH5Z0Ps,00:26:03,Fantasia,Livre,Não,YouTube
Franklin Joga Futebol,imagens/T06-frank-futebol.png,"Franklin e a sua equipa aprendem a jogar futebol.",https://www.youtube.com/watch?v=g66un_jWVe0,00:22:57,Educativo,10,Sim,YouTube
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
// CARREGAMENTO DE DADOS
// =====================================================
async function loadData() {
    try {
        let csvText;
        if (USE_ONLINE) {
            const response = await fetch(SHEET_URL);
            if (!response.ok) throw new Error('Erro ao acessar Google Sheets');
            csvText = await response.text();
        } else {
            csvText = INLINE_CSV;
        }
        processCSV(csvText);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError(error.message);
    }
}

function processCSV(csvText) {
    Papa.parse(csvText, {
        header: true,
        complete: function(results) {
            allData = results.data.filter(row => row.Título && row.Título.trim() !== '');
            initializeFilters();
            applyFilters();
        },
        error: function(error) {
            showError('Erro ao processar o arquivo CSV');
        }
    });
}

function showError(message) {
    const loading = document.getElementById('loading');
    if (loading) loading.innerHTML = `⚠️ ${message}`;
}

// =====================================================
// LÓGICA DE FILTROS
// =====================================================
function initializeFilters() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    updateSelectedFilters();
}

function applyFilters() {
    itemsToShow = 6;

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

// =====================================================
// RENDERIZAÇÃO
// =====================================================
function renderItems() {
    const container = document.getElementById('itemsContainer');
    const info = document.getElementById('resultsInfo');
    
    if (!container) return;

    if (info) {
        const total = filteredData.length;
        const showing = Math.min(itemsToShow, total);
        info.style.display = 'block';
        info.textContent = `Mostrando ${showing} de ${total} itens`;
    }

    if (filteredData.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhum item encontrado com os filtros selecionados.</div>';
        removeLoadMoreButton();
        return;
    }

    const itemsToDisplay = filteredData.slice(0, itemsToShow);

    container.innerHTML = itemsToDisplay.map(item => {
        const thumb = item.Imagem || 'https://via.placeholder.com/400x200?text=Sem+Imagem';
        const safeUrl = String(item.URL || '').replace(/'/g, "\\'");
        const safeTitle = String(item.Título || '').replace(/'/g, "\\'");
        
        return `
        <div class="item-card" data-url='${safeUrl}' aria-label="${safeTitle}">
            <img src="${thumb}" alt="${item.Título}" class="item-image" onerror="this.src='https://via.placeholder.com/400x200?text=Imagem+Erro'">
            <div class="item-content">
                <div class="item-title">${item.Título}</div>
                <div class="item-description">${item.Resumo || ''}</div>
                <div class="item-tags">
                    <span class="tag genero">${item.Genero || ''}</span>
                    <span class="tag idade">${item.Idade === 'Livre' ? 'Livre' : item.Idade + ' anos'}</span>
                    <span class="tag duracao">${formatDuration(item.Duração)}</span>
                    <span class="tag plataforma">${item.Plataforma || ''}</span>
                    ${item['Sensibilidade Luz'] === 'Sim' ? '<span class="tag luz">Sensibilidade à Luz</span>' : ''}
                </div>
            </div>
        </div>`;
    }).join('');

    // Adiciona cliques aos cards
    container.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => handleCardClick(card.getAttribute('data-url')));
    });

    updateLoadMoreButton();
}

function handleCardClick(url) {
    if (!url) return;
    const isYouTube = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/i.test(url);
    if (isYouTube) {
        openVideoPlayer(url);
    } else {
        window.open(url, '_blank');
    }
}

// =====================================================
// PLAYER DE VÍDEO (VERSÃO ROBUSTA SEM AUTOPLAY)
// =====================================================
function openVideoPlayer(url) {
    const modal = document.getElementById('videoModal');
    
    // Garante que encontramos o wrapper
    if (!videoWrapper && modal) {
        videoWrapper = modal.querySelector('.modal-conteudo > div[style*="position:relative"]') || 
                       modal.querySelector('.modal-conteudo > div');
    }

    if (!modal || !videoWrapper) {
        console.error("Erro crítico: Player não encontrado.");
        window.open(url, '_blank');
        return;
    }

    const embedUrl = normalizeYouTubeEmbed(url);

    // Limpa conteúdo anterior
    videoWrapper.innerHTML = '';

    // Cria o iframe
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.title = "YouTube video player";
    iframe.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;border-radius:8px;";
    iframe.frameBorder = "0";
    // Removido autoplay das permissões para evitar erros
    iframe.allow = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;

    videoWrapper.appendChild(iframe);

    // Força o display e z-index alto para garantir que apareça
    modal.style.display = 'flex';
    modal.style.zIndex = '10000'; 
    modal.setAttribute('aria-hidden', 'false');
}

function closeVideoPlayer() {
    const modal = document.getElementById('videoModal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
    // Limpa o iframe para parar o som
    if (videoWrapper) {
        videoWrapper.innerHTML = '';
    }
}

function normalizeYouTubeEmbed(url) {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    
    let videoId = '';
    const shortMatch = url.match(/youtu\.be\/([^\?&]+)/);
    const longMatch = url.match(/[?&]v=([^&]+)/);
    
    if (shortMatch) videoId = shortMatch[1];
    else if (longMatch) videoId = longMatch[1];
    
    // O SEGREDO: Apenas ?rel=0. Nada de autoplay.
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
}

// =====================================================
// PAGINAÇÃO E UTILITÁRIOS
// =====================================================
function updateLoadMoreButton() {
    removeLoadMoreButton();
    if (filteredData.length > itemsToShow) {
        const container = document.getElementById('itemsContainer');
        const btnContainer = document.createElement('div');
        btnContainer.id = 'loadMoreContainer';
        btnContainer.className = 'load-more-container';
        btnContainer.innerHTML = `
            <button class="btn-load-more" onclick="loadMoreItems()">
                Ver Mais <span class="dots">•••</span>
            </button>
            <div class="load-more-text">Exibindo mais aventuras!</div>`;
        container.parentNode.insertBefore(btnContainer, container.nextSibling);
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

function updateSelectedFilters() {
    const container = document.querySelector('.selected-filters ul');
    if (!container) return;
    container.innerHTML = '';
    
    const addTag = (cls, txt) => container.innerHTML += `<li class="tag ${cls}">${txt}</li>`;
    
    const d = document.getElementById('filterDuracao').value;
    if (d) addTag('duracao', `Duração: ${d}`);
    
    if (selectedGeneros.length) addTag('genero', `Gênero: ${selectedGeneros.join(', ')}`);
    
    const i = document.getElementById('filterIdade').value;
    if (i) addTag('idade', `Idade: ${i}`);
    
    const p = document.getElementById('filterPlataforma').value;
    if (p) addTag('plataforma', `Plataforma: ${p}`);

    const l = document.getElementById('filterLuz').value;
    if (l) addTag('luz', `Luz: ${l}`);
    
    if (!container.innerHTML) container.innerHTML = '<li style="color:#999;font-style:italic;">Nenhum filtro selecionado</li>';
}

function parseDuration(d) { if(!d)return 0; const p=d.split(':'); return (parseInt(p[0])||0)*60+(parseInt(p[1])||0); }
function getDurationCategory(d) { const m=parseDuration(d); return m<30?'curta':m<=60?'media':'longa'; }
function formatDuration(d) { if(!d)return ''; const p=d.split(':'); const h=parseInt(p[0]),m=parseInt(p[1]); return h>0?`${h}h${m}min`:`${m}min`; }
function checkAgeFilter(c,f) { if(!f||f==='Livre')return c==='Livre'; const o=['Livre','10','12','14','16']; return o.indexOf(c)<=o.indexOf(f); }
function toggleGeneroDropdown() { document.getElementById('generoDropdown')?.classList.toggle('show'); }
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

// =====================================================
// INICIALIZAÇÃO
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    // Captura e limpa o iframe inicial
    const staticFrame = document.getElementById('videoFrame');
    if (staticFrame) {
        videoWrapper = staticFrame.parentNode;
        staticFrame.remove();
        console.log("Player pronto: Wrapper capturado.");
    }

    // Listeners
    document.addEventListener('click', e => {
        const d = document.getElementById('generoDropdown');
        const t = document.getElementById('generoToggle');
        if(d && t && !t.contains(e.target) && !d.contains(e.target)) d.classList.remove('show');
    });

    ['filterDuracao', 'filterIdade', 'filterLuz', 'filterPlataforma'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', applyFilters);
    });
    document.getElementById('searchBox')?.addEventListener('input', applyFilters);

    // Player modal - fecha no botão e no fundo escuro
    document.getElementById('closePlayer')?.addEventListener('click', closeVideoPlayer);
    const modal = document.getElementById('videoModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeVideoPlayer();
        });
    }

    loadData();
});