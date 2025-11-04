
        let allData = [];
        let filteredData = [];

        // ========================================================================
        // CONFIGURAÇÃO DA FONTE DE DADOS
        // ========================================================================
        
        // PARA TESTES LOCAIS (abrir HTML direto do computador):
        // 1. Deixe: const USE_ONLINE = false;
        // 2. Cole o conteúdo do seu CSV na variável INLINE_CSV abaixo
        
        // PARA PRODUÇÃO (site hospedado na web):
        // 1. Mude para: const USE_ONLINE = true;
        // 2. A planilha será carregada automaticamente do Google Sheets
        
        const USE_ONLINE = false;  // ← MUDE PARA true QUANDO HOSPEDAR ONLINE
        
        // ========================================================================
        
        
        // ==================== PLANILHA ONLINE (GOOGLE SHEETS) ====================
        // URL gerada ao publicar a planilha (Arquivo → Compartilhar → Publicar na web)
        const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT0var1VwvNMPs4QRTB5Al3f8hjzrp5BQ2WLY17GoblJSCiOadsdvb8wZoiCviFFxgUFvO243zg8DIs/pub?gid=0&single=true&output=csv';

        // ==================== CSV INLINE (PARA TESTES LOCAIS) ====================
        // Cole aqui o conteúdo completo do seu arquivo CSV
        // Formato: copie tudo do arquivo curumii-conteudo.csv e cole entre as crases ``
        // IMPORTANTE: Adicione a coluna "Plataforma" no seu CSV
        const INLINE_CSV = `Título,Imagem,Resumo,URL,Duração,Genero,Idade,Sensibilidade Luz,Plataforma
Peppa Santa´s Grotto,imagens/T01-pepa-santa.jpg,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",https://www.youtube.com/watch?v=bwGRxdpFmRU,00:22:33,Arte,Livre,Sim,YouTube
Título 2,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-02.html,01:15:18,Aventura,Livre,Não,Globoplay
Título 3,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-03.html,00:45:21,Aventura,14,Não,Prime Video
Título 4,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-04.html,00:25:36,Educativo,16,Não,HBO Max
Título 5,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-05.html,00:22:33,Fantasia,Livre,Não,Disney+
Título 6,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-06html,01:15:18,Musical,10,Sim,Disney+
Título 7,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-07.html,00:45:21,Arte,12,Não,Apple TV
Título 8,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-08.html,00:25:36,Arte,14,Não,Prime Video
Título 9,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-09.html,00:22:33,Fantasia,10,Não,Apple TV
Título 10,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-10.html,01:15:18,Musical,16,Não,HBO Max
Título 11,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-11.html,00:45:21,Arte,12,Sim,HBO Max
Título 12,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-12.html,00:25:36,Fantasia,Livre,Não,Globoplay
Título 13,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-13.html,00:22:33,Arte,Livre,Não,Prime Video
Título 14,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-14.html,01:15:18,Educativo,12,Sim,HBO Max
Título 15,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-15.html,00:45:21,Arte,Livre,Não,YouTube
Título 16,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-16.html,00:25:36,Musical,10,Não,Apple TV
Título 17,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-17.html,01:25:36,Musical,16,Não,Globoplay
Título 18,imagens/img-thumb.png,"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed dignissim placerat dapibus. Sed facilisis vulputate nunc eget pretium. Aliquam porttitor enim ipsum, et eleifend justo lobortis eget.",/titulo-18.html,02:25:36,Musical,10,Não,Disney+`;

        // ========================================================================

        let selectedGeneros = []; // Array para armazenar gêneros selecionados

        async function loadData() {
            try {
                let csvText;
                
                if (USE_ONLINE) {
                    // ==================== MODO ONLINE ====================
                    console.log('🌐 Carregando do Google Sheets...');
                    const response = await fetch(SHEET_URL);
                    if (!response.ok) throw new Error('Erro ao acessar Google Sheets');
                    csvText = await response.text();
                } else {
                    // ==================== MODO LOCAL (CSV INLINE) ====================
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

        function toggleGeneroDropdown() {
            const dropdown = document.getElementById('generoDropdown');
            dropdown.classList.toggle('show');
        }

        function updateGeneroFilter(isTodos = false) {
            // Se clicou em "Todos", desmarca todos os outros
            if (isTodos) {
                const checkboxes = document.querySelectorAll('#generoDropdown input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    if (checkbox.id !== 'genero-todos') {
                        checkbox.checked = false;
                    }
                });
            } else {
                // Se clicou em qualquer outro gênero, desmarca "Todos"
                document.getElementById('genero-todos').checked = false;
            }

            // Atualiza o array de gêneros selecionados
            selectedGeneros = [];
            const checkboxes = document.querySelectorAll('#generoDropdown input[type="checkbox"]');
            
            checkboxes.forEach(checkbox => {
                if (checkbox.checked && checkbox.id !== 'genero-todos') {
                    selectedGeneros.push(checkbox.value);
                }
            });

            // Atualiza o texto do botão
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

        // Fecha o dropdown ao clicar fora
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('generoDropdown');
            const toggle = document.getElementById('generoToggle');
            
            if (dropdown && toggle && !toggle.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });

        function parseDuration(duration) {
            // Converte duração HH:MM:SS para minutos
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
            // Lógica especial de idade: filtro inclui todas as idades abaixo
            if (!filterAge) return true;
            if (filterAge === 'Livre') return contentAge === 'Livre';
            
            const ageOrder = ['Livre', '10', '12', '14', '16'];
            const filterIndex = ageOrder.indexOf(filterAge);
            const contentIndex = ageOrder.indexOf(contentAge);
            
            return contentIndex <= filterIndex;
        }

        function initializeFilters() {
            document.getElementById('loading').style.display = 'none';
        }

        function applyFilters() {
            const searchTerm = document.getElementById('searchBox').value.toLowerCase();
            const duracao = document.getElementById('filterDuracao').value;
            const idade = document.getElementById('filterIdade').value;
            const luz = document.getElementById('filterLuz').value;
            const plataforma = document.getElementById('filterPlataforma').value;

            // Verifica se algum filtro está ativo
            const hasActiveFilters = searchTerm || duracao || idade || luz || plataforma || selectedGeneros.length > 0;

            filteredData = allData.filter(item => {
                const matchSearch = !searchTerm || 
                    item.Título.toLowerCase().includes(searchTerm) || 
                    item.Resumo.toLowerCase().includes(searchTerm);
                
                const matchDuracao = !duracao || getDurationCategory(item.Duração) === duracao;
                
                // Filtro de gênero com múltipla seleção
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
            
            // Altera o texto baseado se há filtros ativos
            if (hasActiveFilters) {
                info.textContent = `Mostrando ${filteredData.length} de ${allData.length} itens`;
            } else {
                info.textContent = 'Conteúdos em destaque - 18 itens';
            }

            if (filteredData.length === 0) {
                container.innerHTML = '<div class="no-results">Nenhum item encontrado com os filtros selecionados.</div>';
                return;
            }

            container.innerHTML = filteredData.map(item => `
                <div class="item-card" onclick="window.open('${item.URL}', '_blank')">
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
        }

        function clearFilters() {
            document.getElementById('searchBox').value = '';
            document.getElementById('filterDuracao').value = '';
            document.getElementById('filterIdade').value = '';
            document.getElementById('filterLuz').value = '';
            document.getElementById('filterPlataforma').value = '';
            
            // Limpa os checkboxes de gênero
            const checkboxes = document.querySelectorAll('#generoDropdown input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            selectedGeneros = [];
            document.getElementById('generoLabel').textContent = 'Todos os Gêneros';
            
            applyFilters();
        }

        function saveFilters() {
            alert('Funcionalidade de salvar opções será implementada - redirecionará para página de cadastro');
            // Aqui você pode redirecionar para a página de cadastro
            // window.location.href = 'cadastro.html';
        }

        // Event listeners
        document.getElementById('searchBox').addEventListener('input', applyFilters);
        document.getElementById('filterDuracao').addEventListener('change', applyFilters);
        document.getElementById('filterIdade').addEventListener('change', applyFilters);
        document.getElementById('filterLuz').addEventListener('change', applyFilters);
        document.getElementById('filterPlataforma').addEventListener('change', applyFilters);

        // Carregar dados ao iniciar
        loadData();
    