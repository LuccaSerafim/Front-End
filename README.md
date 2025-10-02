# 🚀 Frontend - Dashboard de Análise de Tráfego de Servidor

Frontend simples e responsivo para monitoramento em tempo real do tráfego de rede do servidor. Desenvolvido com HTML, CSS (Tailwind) e JavaScript, utiliza Chart.js para visualização gráfica dos dados.

---

## 📂 Estrutura do Projeto

frontend/  
├── index.html           # Página principal da dashboard  
├── script.js            # Lógica JavaScript para comunicação com API e gráficos  
└── style.css            # Estilos customizados em CSS com Tailwind  

---

## ⚙️ Tecnologias Utilizadas

- HTML5  
- CSS3 (Tailwind CSS)  
- JavaScript (ES6+)  
- Chart.js  

---

## 🚀 Como Executar Localmente

1. Clone o repositório frontend (ou baixe os arquivos).  
2. Abra o arquivo `index.html` no navegador.  
3. Certifique-se de que o backend (API) esteja rodando no mesmo IP local e porta `http://<SEU_IP_LOCAL>:5000` para que o frontend consiga buscar os dados.  
4. A dashboard atualizará automaticamente os dados a cada 5 segundos.

---

## 🛠️ Funcionalidades

- Visualização em gráfico de barras do tráfego inbound e outbound por IP cliente.  
- Drill down clicável para visualizar o tráfego por protocolo em um IP específico.  
- Indicador visual do status de conexão com a API backend.  
- Responsivo e estilizado com Tailwind para uma interface moderna e limpa.

---

## 📡 Comunicação com o Backend

O frontend consome a API do backend através do endpoint:  
`http://<SEU_IP_LOCAL>:5000/data`  

Os dados recebidos são processados e exibidos dinamicamente nos gráficos.

---

## 📋 Créditos

Projeto desenvolvido para a disciplina de Redes de Computadores.

---

## ⚠️ Observações

- É necessário que o backend esteja ativo para que os dados sejam exibidos corretamente.  
- Caso a API esteja inacessível, a dashboard indica erro na conexão.



