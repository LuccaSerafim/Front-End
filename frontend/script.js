const API_URL = 'http://127.0.0.1:5000/data';
const REFRESH_INTERVAL = 5000; // ms
const trafficChartCanvas = document.getElementById('trafficChart').getContext('2d');
const backButton = document.getElementById('backButton');
const mainTitle = document.getElementById('main-title');
const subtitle = document.getElementById('subtitle');
const statusIndicator = document.getElementById('status-indicator').querySelector('span:first-child');
const statusText = document.getElementById('status-text');

let trafficChart;
let currentView = 'main'; // 'main' ou 'drilldown'
let currentDrilldownIp = null;
let lastData = {}; // Cache dos últimos dados para o drilldown

// --- FUNÇÕES DE FORMATAÇÃO E UTILITÁRIAS ---

/**
 * Converte bytes para uma unidade mais legível (KB, MB, GB).
 * @param {number} bytes - O número de bytes.
 * @returns {string} A string formatada.
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// --- LÓGICA DE ATUALIZAÇÃO DOS GRÁFICOS ---

/**
 * Atualiza o gráfico principal com os dados agregados por cliente.
 * @param {object} data - Os dados recebidos da API.
 */
function updateMainChart(data) {
    const clientIps = Object.keys(data);
    const inboundData = clientIps.map(ip => data[ip].inbound);
    const outboundData = clientIps.map(ip => data[ip].outbound);

    trafficChart.data.labels = clientIps;
    trafficChart.data.datasets[0].data = inboundData;
    trafficChart.data.datasets[1].data = outboundData;
    trafficChart.update();
}

/**
 * Atualiza o gráfico para a visão de drill down, mostrando protocolos para um IP.
 * @param {string} ip - O IP do cliente selecionado.
 */
function updateDrilldownChart(ip) {
    const clientData = lastData[ip];
    if (!clientData || !clientData.protocols) return;

    const protocols = Object.keys(clientData.protocols);
    const inboundData = protocols.map(p => clientData.protocols[p].inbound);
    const outboundData = protocols.map(p => clientData.protocols[p].outbound);

    trafficChart.data.labels = protocols;
    trafficChart.data.datasets[0].data = inboundData;
    trafficChart.data.datasets[1].data = outboundData;
    trafficChart.update();
}

// --- FUNÇÕES DE TRANSIÇÃO DE VIEW ---

/**
 * Transiciona para a visão de drill down para um cliente específico.
 * @param {string} ip - O IP do cliente.
 */
function showDrilldownView(ip) {
    currentView = 'drilldown';
    currentDrilldownIp = ip;

    backButton.classList.remove('hidden');
    subtitle.textContent = `Quebra de tráfego por protocolo para ${ip}`;
    updateDrilldownChart(ip);
}

/**
 * Retorna para a visão principal (geral).
 */
function showMainView() {
    currentView = 'main';
    currentDrilldownIp = null;
    
    backButton.classList.add('hidden');
    subtitle.textContent = 'Volume de dados por cliente (Janela de 5s)';
    updateMainChart(lastData);
}


// --- BUSCA DE DADOS E LÓGICA PRINCIPAL ---

/**
 * Busca os dados da API e atualiza o gráfico apropriado.
 */
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        const data = await response.json();
        lastData = data; // Armazena os dados mais recentes

        // Atualiza a view correta
        if (currentView === 'main') {
            updateMainChart(data);
        } else if (currentView === 'drilldown') {
            // Se o IP do drilldown não existir mais nos novos dados, volta para a main view
            if (data[currentDrilldownIp]) {
                 updateDrilldownChart(currentDrilldownIp);
            } else {
                showMainView();
            }
        }
        
        // Atualiza o status da conexão
        statusIndicator.classList.remove('bg-yellow-500', 'bg-red-500');
        statusIndicator.classList.add('bg-green-500');
        statusText.textContent = `Conectado. Última atualização: ${new Date().toLocaleTimeString()}`;

    } catch (error) {
        console.error("Falha ao buscar dados da API:", error);
        statusIndicator.classList.remove('bg-yellow-500', 'bg-green-500');
        statusIndicator.classList.add('bg-red-500');
        statusText.textContent = "Erro de conexão com a API. Verifique se o backend está rodando.";
    }
}

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    trafficChart = new Chart(trafficChartCanvas, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Tráfego de Entrada (Inbound)',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }, {
                label: 'Tráfego de Saída (Outbound)',
                data: [],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#d1d5db', // text-gray-300
                        callback: function(value) {
                            return formatBytes(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                     ticks: {
                        color: '#d1d5db', // text-gray-300
                    },
                     grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e5e7eb' // text-gray-200
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatBytes(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            // Evento de clique para implementar o drill down
            onClick: (event, elements) => {
                if (currentView !== 'main' || elements.length === 0) {
                    return; // Só permite drill down da visão principal
                }
                const chartElement = elements[0];
                const ip = trafficChart.data.labels[chartElement.index];
                showDrilldownView(ip);
            }
        }
    });

    // Adiciona o evento de clique ao botão de voltar
    backButton.addEventListener('click', showMainView);

    // Inicia a busca de dados inicial e depois a cada intervalo
    fetchData();
    setInterval(fetchData, REFRESH_INTERVAL);
});
