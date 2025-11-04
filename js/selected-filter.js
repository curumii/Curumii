// Função para atualizar as tags de filtros selecionados dinamicamente
function updateSelectedFilters() {
    const container = document.querySelector('.selected-filters ul');
    
    if (!container) return;
    
    // Limpa as tags existentes
    container.innerHTML = '';
    
    // Objeto para armazenar os filtros ativos
    const filters = {};
    
    // 1. DURAÇÃO
    const duracao = document.getElementById('filterDuracao').value;
    if (duracao) {
        const duracaoTexto = {
            'curta': 'menos de 30min',
            'media': '30min a 1h',
            'longa': 'mais de 1h'
        };
        filters.duracao = duracaoTexto[duracao];
    }
    
    // 2. GÊNERO
    if (selectedGeneros.length > 0) {
        filters.genero = selectedGeneros.join(', ');
    }
    
    // 3. IDADE
    const idade = document.getElementById('filterIdade').value;
    if (idade) {
        filters.idade = idade === 'Livre' ? 'Livre' : idade + ' anos';
    }
    
    // 4. PLATAFORMA
    const plataforma = document.getElementById('filterPlataforma').value;
    if (plataforma) {
        filters.plataforma = plataforma;
    }
    
    // 5. SENSIBILIDADE À LUZ
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

// MODIFICA a função applyFilters existente para incluir a atualização das tags
function applyFilters() {
    const searchTerm = document.getElementById('searchBox')?.value.toLowerCase() || '';
    const duracao = document.getElementById('filterDuracao').value;
    const idade = document.getElementById('filterIdade').value;
    const luz = document.getElementById('filterLuz').value;
    const plataforma = document.getElementById('filterPlataforma').value;

    // Atualiza as tags visuais
    updateSelectedFilters();

    // Verifica se algum filtro está ativo
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

// MODIFICA a função clearFilters para limpar as tags também
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
    
    // Atualiza as tags e aplica os filtros
    updateSelectedFilters();
    applyFilters();
}

// Inicializa as tags quando a página carrega
window.addEventListener('DOMContentLoaded', function() {
    // Aguarda um momento para garantir que tudo está carregado
    setTimeout(updateSelectedFilters, 100);
});