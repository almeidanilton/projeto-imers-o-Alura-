// Seleciona os elementos do HTML com os quais vamos interagir.
// Assumindo que o container dos cards tem o id="card-container" no seu HTML.
const cardContainer = document.getElementById("card-container");
const campoBusca = document.getElementById("busca");
const formBusca = document.getElementById("form-busca");
const botaoLimpar = document.getElementById("limpar-busca");

// Seleciona os elementos do Modal
const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");
const modalCloseBtn = document.getElementById("modal-close-btn");
let dados = []; // Array para armazenar os dados do JSON
let debounceTimer;

// Função debounce para otimizar a busca, evitando execuções excessivas
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Função assíncrona para buscar os dados do arquivo JSON
async function carregarDados() {
    try {
        renderizarEsqueleto(); // Mostra o esqueleto de carregamento
        const resposta = await fetch("data.json");
        if (!resposta.ok) {
            throw new Error(`HTTP error! status: ${resposta.status}`);
        }
        dados = await resposta.json();
        
        // Pequeno atraso para simular carregamento e exibir o efeito
        setTimeout(() => {
            renderizarCards(dados); // Exibe todos os cards após carregar
            renderizarGrafico(dados); // Exibe o gráfico
        }, 500); 

    } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        cardContainer.innerHTML = "<p>Ocorreu um erro ao carregar as informações. Por favor, tente novamente mais tarde.</p>";
    }
}

// Função para renderizar o esqueleto de carregamento
function renderizarEsqueleto() {
    cardContainer.innerHTML = ""; // Limpa o container
    for (let i = 0; i < 9; i++) { // Cria 9 placeholders
        const esqueletoCard = document.createElement("article");
        esqueletoCard.className = 'card';
        esqueletoCard.innerHTML = `
            <div class="card-imagem-container" style="background-color: #4a4e51; animation: pulse 1.5s infinite ease-in-out;"></div>
            <div class="card-conteudo">
                <div style="height: 2rem; width: 60%; background-color: #4a4e51; border-radius: 4px; margin-bottom: 1rem; animation: pulse 1.5s infinite ease-in-out;"></div>
                <div style="height: 1rem; background-color: #4a4e51; border-radius: 4px; animation: pulse 1.5s infinite ease-in-out;"></div>
                <div style="height: 1rem; width: 80%; background-color: #4a4e51; border-radius: 4px; margin-top: 0.5rem; animation: pulse 1.5s infinite ease-in-out;"></div>
            </div>
        `;
        cardContainer.appendChild(esqueletoCard);
    }
}

// Função para renderizar os cards na tela
function renderizarCards(items) {
    cardContainer.innerHTML = ""; // Limpa o container antes de adicionar novos cards
    if (items.length === 0) {
        cardContainer.innerHTML = "<p>Nenhum resultado encontrado.</p>";
        return;
    }

    for (const item of items) {
        const card = document.createElement("article");
        card.className = 'card'; // Adiciona a classe 'card' para estilização
        
        // Adiciona um evento de clique para abrir o modal com os dados deste item
        card.addEventListener('click', () => abrirModal(item));

        card.innerHTML = `
            <div class="card-imagem-container">
                <img src="${item.imagem}" alt="Logo da linguagem ${item.nome}">
            </div>
            <div class="card-conteudo">
                <h2>${item.nome}</h2>
                <p>${item.descrição}</p>
                <p><strong>Ano de criação:</strong> ${item.ano}</p>
                <a href="${item.link}" target="_blank">Saiba Mais</a>
            </div>
        `;
        cardContainer.appendChild(card);
    }
}

// Função para lidar com a busca
function handleSearch() {
    const termoBusca = campoBusca.value.toLowerCase();
    const resultados = dados.filter(item => 
        item.nome.toLowerCase().includes(termoBusca) || 
        item.descrição.toLowerCase().includes(termoBusca));
    renderizarCards(resultados);
}

// Função para renderizar o gráfico de popularidade
function renderizarGrafico(items) {
    const ctx = document.getElementById('linguagensChart').getContext('2d');

    // Ordena os dados por popularidade (do maior para o menor)
    const dadosOrdenados = [...items].sort((a, b) => b.popularidade - a.popularidade);

    // Extrai os nomes e os valores de popularidade
    const labels = dadosOrdenados.map(item => item.nome);
    const data = dadosOrdenados.map(item => item.popularidade);

    new Chart(ctx, {
        type: 'bar', // Tipo de gráfico: 'bar' (barras), 'pie' (pizza), 'line' (linha), etc.
        data: {
            labels: labels,
            datasets: [{
                label: 'Popularidade (%)',
                data: data,
                backgroundColor: 'rgba(139, 92, 246, 0.6)', // Cor das barras (roxo com transparência)
                borderColor: 'rgba(139, 92, 246, 1)', // Cor da borda das barras (roxo sólido)
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Faz o gráfico de barras ser horizontal, melhor para muitos itens
            responsive: true,
            plugins: {
                legend: {
                    display: false // Esconde a legenda, pois o título do eixo y já é claro
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}
// Função para abrir e preencher o modal
function abrirModal(item) {
    modalContent.innerHTML = `
        <img src="${item.imagem}" alt="Logo da linguagem ${item.nome}">
        <h2>${item.nome}</h2>
        <p><strong>Ano de criação:</strong> ${item.ano}</p>
        <p>${item.descrição}</p>
        <a href="${item.link}" target="_blank">Visitar Documentação Oficial</a>
    `;
    modalOverlay.classList.add('modal-visible');
}

// Função para fechar o modal
function fecharModal() {
    modalOverlay.classList.remove('modal-visible');
}

// Adiciona eventos para fechar o modal
modalCloseBtn.addEventListener('click', fecharModal);
modalOverlay.addEventListener('click', (event) => {
    // Fecha o modal apenas se o clique for no fundo (overlay) e não no conteúdo
    if (event.target === modalOverlay) {
        fecharModal();
    }
});

// Adiciona evento para fechar o modal com a tecla "Escape"
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalOverlay.classList.contains('modal-visible')) {
        fecharModal();
    }
});

// Adiciona um "ouvinte" de evento para o campo de busca
campoBusca.addEventListener("input", debounce(handleSearch, 300));

// Adiciona um "ouvinte" para o envio do formulário para prevenir o recarregamento da página
formBusca.addEventListener("submit", (event) => {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página
    handleSearch(); // Executa a busca ao pressionar Enter ou clicar no botão
});

// Adiciona um "ouvinte" para o botão de limpar
botaoLimpar.addEventListener("click", () => {
    campoBusca.value = ""; // Limpa o campo de busca
    renderizarCards(dados); // Renderiza todos os cards novamente
    campoBusca.focus(); // Devolve o foco para o campo de busca
    botaoLimpar.blur(); // Remove o foco do botão de limpar
    campoBusca.blur(); // Remove o foco do campo de busca
});

// Inicia o carregamento dos dados quando o script é executado
carregarDados();

// Efeito de fundo interativo que segue o mouse
document.body.addEventListener('mousemove', (event) => {
    const { clientX, clientY } = event;
    document.body.style.setProperty('--mouse-x', `${clientX}px`);
    document.body.style.setProperty('--mouse-y', `${clientY}px`);
});
