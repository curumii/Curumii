// Obtém os elementos pelo ID
const modal = document.getElementById('meuModal');
const btn = document.getElementById('abrirModalBtn');
const linkCurumii = modal.querySelector('.btn-acao');

// Quando o usuário clica no botão, abre o modal
btn.onclick = function() {
  // A classe 'modal' no CSS tem 'display: none'. 
  // Removendo ou alterando o estilo direto faz ele aparecer.
  modal.style.display = "flex"; 
}

// Quando o usuário clica no botão "Ver meu Curumii",
// o modal é fechado e a página é redirecionada (ação padrão do <a>)
linkCurumii.onclick = function() {
  // Opcional: Fechar o modal antes de redirecionar, caso a ação de redirecionar demore um pouco
  modal.style.display = "none";
  // A navegação acontecerá normalmente.
}

// Opcional: Fechar o modal se o usuário clicar fora do box de conteúdo
window.onclick = function(event) {
  // Verifica se o clique foi no próprio elemento 'modal' (o fundo escuro)
  if (event.target == modal) {
    modal.style.display = "none";
  }
}