// =====================================================
// CONFIGURAÇÃO DE EVENTOS - DEVE SER CHAMADO PRIMEIRO!
// =====================================================
function setupPlayerEventListeners() {
    console.log("🎯 Configurando event listeners do player...");
    
    // 1. DELEGAÇÃO DE EVENTOS para cliques nos cards
    const container = document.getElementById('itemsContainer');
    if (container) {
        // Adiciona listener usando delegação
        container.addEventListener('click', function(e) {
            console.log("👆 Clique detectado!", e.target);
            
            // Procura o card clicado
            const card = e.target.closest('.item-card');
            
            if (card) {
                e.preventDefault(); // ESSENCIAL: Impede o comportamento padrão do link/onclick
                e.stopPropagation();
                
                // ⚠️ CORREÇÃO CRÍTICA: Pega a URL do novo atributo data-url
                const url = card.getAttribute('data-url');
                console.log("🎬 Card encontrado! URL:", url);
                handleCardClick(url);
            } else {
                console.log("⚠️ Clique fora do card");
            }
        }, true); // IMPORTANTE: use capture phase
        
        console.log("✅ Event listener do container configurado");
    } else {
        console.error("❌ Container não encontrado!");
    }

    // 2. Botão de fechar player
    const btnClose = document.getElementById('closePlayer');
    if (btnClose) {
        btnClose.addEventListener('click', closeVideoPlayer);
        console.log("✅ Botão fechar configurado");
    }
    
    // 3. Fechar ao clicar no fundo escuro
    const modal = document.getElementById('videoModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeVideoPlayer();
        });
        console.log("✅ Modal backdrop configurado");
    }
    
    // 4. Event listeners dos filtros
    ['filterDuracao', 'filterIdade', 'filterLuz', 'filterPlataforma'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', applyFilters);
    });
    
    // ⚠️ CORREÇÃO: Usando o ID real da barra de busca
    const searchBox = document.getElementById('searchBox'); 
    if (searchBox) {
        searchBox.addEventListener('input', applyFilters);
        console.log("✅ Barra de busca configurada");
    } else {
        console.error("❌ Barra de busca não encontrada! ID esperado: 'searchBox'");
    }
    
    console.log("✅ Todos os event listeners configurados!");
}

function handleCardClick(url) {
    if (!url) {
        console.warn("⚠️ URL vazia ou inválida");
        return;
    }
    
    console.log("🔍 Analisando URL:", url);
    
    // Detecta se é YouTube
    const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(url);
    
    if (isYouTube) {
        console.log("✅ É um vídeo do YouTube! Abrindo player...");
        openVideoPlayer(url);
    } else {
        console.log("🔗 Não é YouTube, abrindo em nova aba");
        window.open(url, '_blank');
    }
}

function openVideoPlayer(url) {
    const modal = document.getElementById('videoModal');
    const wrapper = document.getElementById('playerWrapper');

    if (!modal || !wrapper) {
        console.error("❌ Modal ou Wrapper não encontrados!");
        return;
    }

    // REGEX ATUALIZADA - Remove tudo após ? ou & para pegar só o ID
    let videoId = '';
    
    // Formato youtu.be/VIDEO_ID (ignora ?si= e outros parâmetros)
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    
    // Formato youtube.com/watch?v=VIDEO_ID
    const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    
    // Formato youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    
    if (shortMatch) {
        videoId = shortMatch[1].split('?')[0].split('&')[0]; // Remove parâmetros extras
        console.log("📹 ID extraído (youtu.be):", videoId);
    } else if (longMatch) {
        videoId = longMatch[1].split('&')[0]; // Remove parâmetros extras
        console.log("📹 ID extraído (youtube.com/watch):", videoId);
    } else if (embedMatch) {
        videoId = embedMatch[1].split('?')[0]; // Remove parâmetros extras
        console.log("📹 ID extraído (youtube.com/embed):", videoId);
    } else {
        console.error("❌ Não foi possível extrair o ID do vídeo da URL:", url);
        alert("Erro ao carregar vídeo. URL inválida.");
        return;
    }

    console.log("🎯 ID final limpo:", videoId);

    // URL de embed LIMPA, sem parâmetros extras que causam erro 153
    wrapper.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
            style="position:absolute; left:0; top:0; width:100%; height:100%; border-radius:8px;">
        </iframe>`;

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    console.log("✅ Player aberto com ID:", videoId);
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
    console.log("🔴 Player fechado");
}
// =====================================================
// CÓDIGO COMPLETO PARA SUBSTITUIR O filter.js
// =====================================================

let allData = [];
let filteredData = [];
let selectedGeneros = [];

let itemsToShow = 4; // Quantos vídeos mostrar no início
const itemsPerLoad = 4; // Quantos vídeos mostrar cada vez que clicar em "Ver Mais"

const USE_ONLINE = false;
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT0var1VwvNMPs4QRTB5Al3f8hjzrp5BQ2WLY17GoblJSCiOadsdvb8wZoiCviFFxgUFvO243zg8DIs/pub?gid=0&single=true&output=csv';

// Dados CSV
const INLINE_CSV = `Título,Imagem,Resumo,URL,Duração,Genero,Idade,Sensibilidade Luz,Plataforma
Pequenas histórias com Bluey,imagens/T02-pequenas-historias-bluey.png,"Este vídeo é uma coleção de quarenta pequenas histórias de Bluey, Bingo e a sua família. Testemunhe o caos criativo e as brincadeiras imaginativas que definem o dia a dia desta família, desde o Pai (Bandit) a tentar escapar de músicas infantis e a lidar com brinquedos novos, até uma hilariante recontagem moderna dos Três Porquinhos. Cada curta explora a forma única como Bluey e Bingo transformam situações quotidianas — como investigações de ""toques"" misteriosos ou a frustração do Pai com a desobediência — em aventuras memoráveis.",https://www.youtube.com/watch?v=5IRl-R73n3k&list=PLVkj_daPh17RO5CF23yT3S5MckpB2BbEJ,00:27:56,Arte,Livre,Não,YouTube
Visitando o Vovô,imagens/T03-visitando-vovo.png,"Daniel Tigre e a sua família fazem uma viagem para visitar o Vovô Tigre. Embora Daniel ache divertido, ele repara que muitas coisas são diferentes da sua casa, como dormir num colchonete ou guardar a roupa numa mala. Para transformar a experiência numa aventura, o Vovô leva a família numa caça ao tesouro de barco até à Ilha do Tigre. A aventura ensina a Daniel que, mesmo quando se viaja e as coisas parecem diferentes, o amor e a diversão em família continuam iguais.",https://www.youtube.com/watch?v=cp0xmXc5nLM,00:11:35,Aventura,14,Não,YouTube
Sid o cientista- A Lupa,imagens/T04-sid-lupa.png,"Neste episódio, o Sid está curioso sobre os seus ""bichinhos"" de estimação, os tatuzinhos. Ele repara que eles são tão pequenos que não consegue perceber como é que eles andam, especialmente porque eles se transformam em bola sempre que ele lhes toca. Na escola, a Professora Susana introduz uma ferramenta científica para resolver este mistério: a lupa. As crianças aprendem a usar lupas para ""ampliar"" as coisas e observá-las melhor, descobrindo finalmente que os tatuzinhos têm muitas perninhas pequenas que usam para andar.",https://www.youtube.com/watch?v=EwgfG0OJqjI,00:22:48,Educativo,16,Não,YouTube
Turma da Mônica-Linda Noite de Natal,imagens/T05-monica-natal.png,"Neste especial, a Turma da Mônica descobre o verdadeiro significado do Natal. Ao decidirem doar alguns dos seus brinquedos, Mônica, Cebolinha, Cascão e Magali recordam as memórias afetivas ligadas a cada objeto. O ato de generosidade culmina num encontro mágico com o Papai Noel, que lhes ensina que a partilha e o carinho são o verdadeiro ""espírito de Natal"".",https://www.youtube.com/watch?v=0O2aVH5Z0Ps,00:26:03,Fantasia,Livre,Não,YouTube
Franklin Joga Futebol,imagens/T06-frank-futebol.png,"Este vídeo apresenta duas histórias: primeiro, em ""Franklin Joga Futebol"", Franklin e a sua equipa, desanimados por nunca ganharem, aprendem a transformar as suas fraquezas individuais em forças de equipa, descobrindo o valor do esforço conjunto.",https://www.youtube.com/watch?v=g66un_jWVe0,00:22:57,Educativo,10,Sim,YouTube
O Pequeno Urso,imagens/T07-o-pequeno-urso.png,"Pequeno urso é um filme de animação baseado na série televisiva Little Bear, que por sua vez é baseada em uma série de livros infantis homônima escrita por Else Holmelund Minarik e ilustrada por Maurice Sendak. O filme foi produzido pela Nelvana Limited para a Paramount Pictures.",https://youtu.be/BE9ccDep7MI?si=VNUfAdY_pGaSR-6T,01:15:17,Aventura,10,Não,YouTube
"George, o Curioso - George vai para o Japão",imagens/T08-george-vai-para-o-japao.png,"George está animado para visitar o Japão, para o festival da neve no inverno!",https://youtu.be/7WITlCQ6spE?si=EJPKCR57qTK7zdYd,00:05:02,Educativo,Livre,Não,YouTube
Peixonauta - o Caso do Dia de Sol,imagens/T09-o-caso-do-dia-de-sol.png,"Peixonauta, Marina e Zico sofrem com a alta temperatura de um dia de verão. Mais uma missão: alguém está correndo perigo por causa do calor! ",https://youtu.be/7Kf15IXnXLY?si=NIHeujsuyElqGPpR,00:12:35,Aventura,Livre,Não,YouTube
Meu Amigãozão - Mais Alguma Coisa?,imagens/T10-mais-alguma-coisa.png,"Neste episódio, a personagem Lili sente que não está recebendo atenção suficiente de sua mãe, que está ocupada. Para demonstrar como é difícil agradar a todos e gerenciar muitos pedidos ao mesmo tempo, Lili decide montar sua própria sorveteria. ",https://youtu.be/FwY0CBzaQgA?si=hOsw1gZi7mLdAtQS,00:11:03,Educativo,Livre,Não,YouTube
Pocoyo - Quem é a Bea?,imagens/T11-quem-e-a-bea.png,A Bea chegou! O Pocoyo não sabe bem o que pensar da chegada da sua irmã... O que é que ele vai fazer?,https://youtu.be/1tjbPkcIXc0?si=Pr64K-PGWGW-mi8D,00:06:18,Educativo,Livre,Sim,YouTube
"Mickey Mouse - Biscoitos, Caldeiras e Dança Russa",imagens/T12-mickey-mouse.png,"Mickey viaja e deixa a Minnie cuidando do Pluto e depois precisa vencer seus medos para consertar a caldeira do prédio, mas tudo termina em dança em um inesquecível show de dança russa!",https://youtu.be/KtDW_Q_Kyhc?si=r0lqk24d-Rvp4oRk,00:11:12,Aventura,10,Não,YouTube
O Show da Luna - O Amarelo que ficou Verde,imagens/T13-amarelo-que-ficou-verde.png,"O Show da Luna! é um desenho brasileiro de uma menina de 6 anos totalmente apaixonada por ciências! Para Luna, o planeta Terra é um laboratório gigante. A cada episódio, uma curiosidade é abordada, seja no quintal de casa ou em uma estação espacial, Luna, seu irmão mais novo, Júpiter, e o furão de estimação da família, Cláudio, praticam ciência diariamente, formulando hipóteses e fazendo experimentos. Criativa, curiosa e destemida, Luna utiliza sua imaginação para descobrir suas diversas dúvidas.",https://youtu.be/kdlCkpoS7lc?si=-LaGaF_aSrxrrMFS,00:12:00,Educativo,Livre,Não,YouTube
Lazy Town - Bem-Vindos a Lazy-Town!,imagens/T14-lazy-town.png,"Neste episódio de estreia, a personagem Stephanie chega à cidade de LazyTown para passar o verão com seu tio, o prefeito Milford Meanswell. Ela logo percebe que as crianças da cidade são extremamente preguiçosas, passando o tempo todo comendo doces e jogando videogame, sem brincar ao ar livre.",https://youtu.be/Puh8Ok8XCVA?si=_puAQbRYunj98Y0z,00:24:42,Educativo,10,Sim,YouTube
Tom e Jerry - Um Pouco de Ar Fresco,imagens/T15-tom-e-jerry.png,Tom e Jerry dão mais certo ao ar livre e mal podem esperar por um tempo bom! Aproveite esta compilação com os melhores momentos ao ar livre!,https://youtu.be/0S0L-iqUM-4?si=wEiHEhOcq3Q3hEb2,00:21:19,Aventura,Livre,Não,YouTube
Irmão do Jorel - Jardim da Pesada,imagens/T16-irmao-do-jorel,Irmão do Jorel tenta acabar com uma rivalidade entre frutas e legumes através de uma batalha de rap com o Tomate.,https://youtu.be/RPf8cYrA9wQ?si=ypzC_rgKqBZT0a_E,00:11:13,Fantasia,10,Não,YouTube
Os 7 Monstrinhos - Uma Paixão,imagens/T17-os-7-monstrinhos,"A premissa central é a vida cotidiana dessa família incomum. Cada um dos sete monstrinhos é nomeado de acordo com um número (Um a Sete) e possui características físicas e de personalidade distintas e exageradas. Eles enfrentam os desafios típicos da infância e da convivência familiar, como rivalidades entre irmãos, medos, descobertas e a necessidade de aprender a trabalhar juntos, apesar de suas diferenças.",https://youtu.be/UmvvCL4MnFU?si=ZE33CWxJjULoiMiP,00:24:46,Aventura,10,Não,YouTube
A Turma do Charlie Brown e Snoopy - o Gigante,imagens/T18-snoopy.png,"""A Turma do Charlie Brown"" gira em torno das experiências diárias e reflexões de um grupo de crianças, liderado pelo melancólico e azarado Charlie Brown, e seu cão beagle, Snoopy.",https://youtu.be/lhYh98y1QHo?si=GaYftFellFkRN9Wz,00:21:21,Aventura,Livre,Não,YouTube
Pica-Pau - Trocando de Corpos,imagens/T19-pica-pau,Leôncio fica chateado após Pica-Pau fazer uma visita inesperada para ele.,https://youtu.be/6ql_yOx0je8?si=-CinRT3omNgRkzM0,00:20:54,Aventura,12,Não,YouTube`;
// =====================================================
// FUNÇÃO PARA ATUALIZAR AS TAGS SELECIONADAS
// =====================================================
function updateSelectedFilters() {
    const container = document.querySelector('.selected-filters ul');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    const filters = {};
    
    // DURAÇÃO
    const duracao = document.getElementById('filterDuracao').value;
    if (duracao) {
        const duracaoTexto = {
            'curta': 'menos de 30min',
            'media': '30min a 1h',
            'longa': 'mais de 1h'
        };
        filters.duracao = duracaoTexto[duracao];
    }
    
    // GÊNERO
    if (selectedGeneros.length > 0) {
        filters.genero = selectedGeneros.join(', ');
    }
    
    // IDADE
    const idade = document.getElementById('filterIdade').value;
    if (idade) {
        filters.idade = idade === 'Livre' ? 'Livre' : idade + ' anos';
    }
    
    // PLATAFORMA
    const plataforma = document.getElementById('filterPlataforma').value;
    if (plataforma) {
        filters.plataforma = plataforma;
    }
    
    // SENSIBILIDADE À LUZ
    const luz = document.getElementById('filterLuz').value;
    if (luz) {
        filters.luz = luz;
    }
    
    // Cria as tags HTML
    if (filters.duracao) {
        container.innerHTML += `<li class="tag duracao">Duração: ${filters.duracao}</li>`;
    }
    
    if (filters.genero) {
        container.innerHTML += `<li class="tag genero">Gênero: ${filters.genero}</li>`;
    }
    
    if (filters.idade) {
        container.innerHTML += `<li class="tag idade">Idade: ${filters.idade}</li>`;
    }
    
    if (filters.plataforma) {
        container.innerHTML += `<li class="tag plataforma">Plataforma: ${filters.plataforma}</li>`;
    }
    
    if (filters.luz) {
        container.innerHTML += `<li class="tag luz">Sensibilidade à Luz: ${filters.luz}</li>`;
    }
    
    // Se nenhum filtro está ativo, mostra mensagem
    if (Object.keys(filters).length === 0) {
        container.innerHTML = '<li style="color: #999; font-style: italic; list-style: none;">Nenhum filtro selecionado</li>';
    }
}

// =====================================================
// FUNÇÕES DE CARREGAMENTO DE DADOS
// =====================================================
async function loadData() {
    try {
        let csvText;
        
        if (USE_ONLINE) {
            console.log('🌐 Carregando do Google Sheets...');
            const response = await fetch(SHEET_URL);
            if (!response.ok) throw new Error('Erro ao acessar Google Sheets');
            csvText = await response.text();
        } else {
            console.log('📝 Usando CSV embutido no código');
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
            console.log('Dados carregados com sucesso:', allData.length, 'itens');
            initializeFilters();
            applyFilters();
            // É crucial chamar setupPlayerEventListeners APÓS o DOM estar carregado
            // Mas ele será chamado no final do script
        },
        error: function(error) {
            console.error('Erro ao processar CSV:', error);
            showError('Erro ao processar o arquivo CSV');
        }
    });
}

function showError(message) {
    document.getElementById('loading').innerHTML = 
        `<div style="color: white; background: rgba(255,0,0,0.2); padding: 20px; border-radius: 10px;">
            <strong>⚠️ Erro ao carregar os dados</strong><br><br>
            ${message}<br><br>
            <em>Modo atual: ${USE_ONLINE ? 'Online (Google Sheets)' : 'Local (CSV inline)'}</em>
        </div>`;
}

// =====================================================
// FUNÇÕES DE FILTRO
// =====================================================
function toggleGeneroDropdown() {
    const dropdown = document.getElementById('generoDropdown');
    dropdown.classList.toggle('show');
}

function updateGeneroFilter(isTodos = false) {
    if (isTodos) {
        const checkboxes = document.querySelectorAll('#generoDropdown input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.id !== 'genero-todos') {
                checkbox.checked = false;
            }
        });
    } else {
        document.getElementById('genero-todos').checked = false;
    }

    selectedGeneros = [];
    const checkboxes = document.querySelectorAll('#generoDropdown input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.id !== 'genero-todos') {
            selectedGeneros.push(checkbox.value);
        }
    });

    const label = document.getElementById('generoLabel');
    if (selectedGeneros.length === 0) {
        label.textContent = 'Todos os Gêneros';
    } else if (selectedGeneros.length === 1) {
        label.textContent = selectedGeneros[0];
    } else {
        label.textContent = `${selectedGeneros.length} gêneros selecionados`;
    }

    applyFilters();
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('generoDropdown');
    const toggle = document.getElementById('generoToggle');
    
    if (dropdown && toggle && !toggle.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

function parseDuration(duration) {
    if (!duration) return 0;
    const parts = duration.split(':');
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return hours * 60 + minutes + seconds / 60;
}

function getDurationCategory(duration) {
    const minutes = parseDuration(duration);
    if (minutes < 30) return 'curta';
    if (minutes <= 60) return 'media';
    return 'longa';
}

function formatDuration(duration) {
    if (!duration) return '';
    const parts = duration.split(':');
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    
    if (hours > 0) {
        return `${hours}h${minutes > 0 ? minutes + 'min' : ''}`;
    }
    return `${minutes}min`;
}

function checkAgeFilter(contentAge, filterAge) {
    if (!filterAge) return true;
    if (filterAge === 'Livre') return contentAge === 'Livre';
    
    const ageOrder = ['Livre', '10', '12', '14', '16'];
    const filterIndex = ageOrder.indexOf(filterAge);
    const contentIndex = ageOrder.indexOf(contentAge);
    
    return contentIndex <= filterIndex;
}

function initializeFilters() {
    document.getElementById('loading').style.display = 'none';
    updateSelectedFilters(); // Atualiza as tags ao inicializar
}

function applyFilters() {
    itemsToShow = 6; // Reseta para mostrar só 6 quando filtrar
    const searchBox = document.getElementById('searchBox');
    const searchTerm = searchBox ? searchBox.value.toLowerCase() : '';
    const duracao = document.getElementById('filterDuracao').value;
    const idade = document.getElementById('filterIdade').value;
    const luz = document.getElementById('filterLuz').value;
    const plataforma = document.getElementById('filterPlataforma').value;

    // ATUALIZA AS TAGS VISUAIS
    updateSelectedFilters();

    const hasActiveFilters = searchTerm || duracao || idade || luz || plataforma || selectedGeneros.length > 0;

    filteredData = allData.filter(item => {
        const matchSearch = !searchTerm || 
            item.Título.toLowerCase().includes(searchTerm) || 
            item.Resumo.toLowerCase().includes(searchTerm);
        
        const matchDuracao = !duracao || getDurationCategory(item.Duração) === duracao;
        const matchGenero = selectedGeneros.length === 0 || selectedGeneros.includes(item.Genero);
        const matchIdade = checkAgeFilter(item.Idade, idade);
        const matchLuz = !luz || item['Sensibilidade Luz'] === luz;
        const matchPlataforma = !plataforma || item.Plataforma === plataforma;

        return matchSearch && matchDuracao && matchGenero && matchIdade && matchLuz && matchPlataforma;
    });

    renderItems(hasActiveFilters);
}

function renderItems(hasActiveFilters) {
    const container = document.getElementById('itemsContainer');
    const info = document.getElementById('resultsInfo');
    
    if (info) {
        if (hasActiveFilters) {
            info.textContent = `Mostrando ${Math.min(itemsToShow, filteredData.length)} de ${filteredData.length} itens`;
        } else {
            info.textContent = `Mostrando ${Math.min(itemsToShow, filteredData.length)} de ${filteredData.length} conteúdos em destaque`;
        }
    }

    if (filteredData.length === 0) {
        container.innerHTML = '<div class="no-results">Nenhum item encontrado com os filtros selecionados.</div>';
        return;
    }

    // Mostra apenas os primeiros itemsToShow itens
    const itemsToDisplay = filteredData.slice(0, itemsToShow);
    
    // ⚠️ CORREÇÃO CRÍTICA APLICADA AQUI: Removido o onclick inline.
    // O clique agora é tratado exclusivamente pelo event listener delegado.
    container.innerHTML = itemsToDisplay.map(item => `
        <div class="item-card" data-url="${item.URL}">
            <img src="${item.Imagem || 'https://via.placeholder.com/400x200?text=Sem+Imagem'}" 
                 alt="${item.Título}" 
                 class="item-image"
                 onerror="this.src='https://via.placeholder.com/400x200?text=Imagem+Indisponível'">
            <div class="item-content">
                <div class="item-title">${item.Título}</div>
                <div class="item-description">${item.Resumo}</div>
                <div class="item-tags">
                    <span class="tag genero">${item.Genero}</span>
                    <span class="tag idade">${item.Idade === 'Livre' ? 'Livre' : item.Idade + ' anos'}</span>
                    <span class="tag duracao">${formatDuration(item.Duração)}</span>
                    <span class="tag plataforma">${item.Plataforma}</span>
                    ${item['Sensibilidade Luz'] === 'Sim' ? '<span class="tag luz">Sensibilidade à Luz</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');

    // Adiciona o botão "Ver Mais" se houver mais itens para mostrar
    showLoadMoreButton();
}

function showLoadMoreButton() {
    const container = document.getElementById('itemsContainer');
    // Remove o botão anterior, se existir
    let existingButton = document.getElementById('loadMoreButton');
    if (existingButton) {
        existingButton.remove();
    }

    if (filteredData.length > itemsToShow) {
        const button = document.createElement('button');
        button.id = 'loadMoreButton';
        button.className = 'btn-load-more';
        button.textContent = 'Ver Mais Conteúdos';
        button.onclick = loadMoreItems;
        container.parentNode.insertBefore(button, container.nextSibling); 
    }
}


function clearFilters() {
    const searchBox = document.getElementById('searchBox');
    if (searchBox) searchBox.value = '';
    
    document.getElementById('filterDuracao').value = '';
    document.getElementById('filterIdade').value = '';
    document.getElementById('filterLuz').value = '';
    document.getElementById('filterPlataforma').value = '';
    
    const checkboxes = document.querySelectorAll('#generoDropdown input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    selectedGeneros = [];
    document.getElementById('generoLabel').textContent = 'Todos os Gêneros';
    
    applyFilters();
}

function saveFilters() {
    alert('Funcionalidade de salvar opções será implementada - redirecionará para página de cadastro');
}

function loadMoreItems() {
    itemsToShow += itemsPerLoad;
    renderItems(true);
    
    // Rola suavemente para os novos itens
    setTimeout(() => {
        const cards = document.querySelectorAll('.item-card');
        if (cards.length > itemsPerLoad) {
            cards[cards.length - itemsPerLoad].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }, 100);
}


// =====================================================
// EVENT LISTENERS
// =====================================================
// Removi a re-declaração dos listeners que já estão em setupPlayerEventListeners
// e adicionei a chamada principal

// 1. Configura os Listeners do Modal/Filtro (incluindo a barra de busca)
setupPlayerEventListeners();

// 2. Carregar dados ao iniciar
loadData();

// Nota: A função showLoadMoreButton também foi adicionada para garantir que o botão "Ver Mais" seja recriado corretamente a cada renderização.