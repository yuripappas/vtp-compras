# 🍕 VTP Compras — Vai Ter Pizza!

Sistema web de gestão de compras, estoque e pré-produção desenvolvido para a rede **Vai Ter Pizza!**

🔗 **Acesso:** [yuripappas.github.io/vtp-compras](https://yuripappas.github.io/vtp-compras/)

---

## 📁 Estrutura do projeto

```
vtp-compras/
├── index.html              # App principal (SPA)
├── assets/
│   ├── logo-bg.jpg         # Logo com fundo roxo (sidebar, dashboard)
│   └── logo-transparent.png# Logo PNG transparente (PDFs)
├── css/
│   └── style.css           # Estilos globais (design system VTP)
├── js/
│   ├── data.js             # Estado global, dados iniciais e persistência
│   ├── utils.js            # Funções utilitárias e navegação entre módulos
│   ├── login.js            # Autenticação e controle de permissões
│   ├── dashboard.js        # Módulo Dashboard (KPIs, alertas, ranking)
│   ├── estoque.js          # Módulo Estoque (edição inline, importação CSV)
│   ├── compras.js          # Módulo Compras (ciclo completo de cotação)
│   ├── modules.js          # Pré-produção, Relatórios, Usuários, PDF
│   ├── cadastros.js        # Cadastro de Insumos, Fornecedores, Pré-preparo
│   ├── configuracoes.js    # Configurações gerais da empresa
│   └── desperdicio.js      # Módulo de Controle de Desperdício
└── README.md
```

---

## 🔐 Login e Permissões

### Senhas padrão
| E-mail | Senha | Perfil |
|--------|-------|--------|
| gerente@vaiterpizza.com | gerente123 | Gerente |
| supervisor@vaiterpizza.com | supervisor123 | Supervisor |
| comprador@vaiterpizza.com | comprador123 | Comprador |

> As senhas podem ser alteradas pelo Gerente no módulo **Usuários**.

### Controle de acesso por perfil

| Módulo | Gerente | Supervisor | Comprador |
|--------|:-------:|:----------:|:---------:|
| Dashboard | ✅ | ✅ | ✅ |
| Estoque | ✅ | ✅ | ✅ |
| Pré-produção | ✅ | ✅ | ✅ |
| Desperdício | ✅ | ✅ | ❌ |
| Compras | ✅ | ✅ | ✅ |
| Cadastros | ✅ | ✅ | ❌ |
| Relatórios | ✅ | ✅ | ❌ |
| Usuários | ✅ | ❌ | ❌ |
| Configurações | ✅ | ❌ | ❌ |

---

## 📦 Módulos

### 🏠 Dashboard
- KPIs em tempo real: itens críticos, pendentes, ordens ativas, custo estimado
- Alertas de estoque por status (crítico / baixo)
- Ranking de fornecedores por score
- Custo por categoria
- Histórico recente de ciclos

### 📦 Estoque
- Visualização com filtros por **busca**, **categoria** e **status** (crítico / baixo / OK)
- Edição inline de **quantidade atual**, **mínimo** e **ideal** (salva ao sair do campo)
- Coluna de **necessidade de reposição** calculada automaticamente
- **Importação CSV** do Cardápio Web — sync por código de produto
- **Seleção de itens** para gerar lista de compras: checkboxes por linha, selecionados vão diretamente para o Step 1 de Compras

#### Importação CSV (Cardápio Web)
1. Exporte o relatório de estoque atual do Cardápio Web em formato CSV
2. Acesse **Estoque → Importar CSV**
3. Arraste ou selecione o arquivo
4. Revise as diferenças e confirme a importação
5. O sistema faz o match pelo **código do produto** e atualiza quantidade, custo e mínimo

---

### 🍳 Pré-produção
- Cards por preparado com **status** (crítico / baixo / OK) e barra de progresso
- **Badge vermelho na sidebar** indicando quantidade de itens críticos em tempo real
- **Filtro de período** — evita contagem infinita de ordens antigas
- **Zerar ciclo** — arquiva ordens concluídas do período sem apagar o histórico
- Criação de ordens com data, turno, responsável e conferente
- **Finalizar ordem**: campo de **quantidade realizada** (pode diferir do planejado)
  - Mostra variação ▲ a mais / ▼ a menos em relação ao planejado
- **KPI de rendimento** geral e por item (planejado vs realizado)
- Exportação de ordens em **PDF** com logo da Vai Ter Pizza!

---

### 🗑️ Desperdício
> Acesso restrito: **Gerente** e **Supervisor**

- Registro de perdas com débito automático do estoque
- **6 categorias de desperdício:**
  - 🍳 Erro de pré-produção
  - 🍕 Montagem incorreta
  - 🛵 Erro de entrega
  - 📅 Vencimento / validade
  - ⚠️ Acidente / queda
  - 📦 Outro
- **KPIs:** total de registros, custo desperdiçado, breakdown por tipo
- **Gráfico de barras** por categoria de desperdício
- **Ranking dos insumos** mais desperdiçados
- **Filtros** por período e tipo
- Campo de responsável e descrição do ocorrido

---

### 🛒 Compras — Ciclo completo em 4 steps

#### Step 1 — Requisição
- Lista de insumos com **necessidade de reposição**
- **Filtros:** busca por nome, filtro por categoria, botões de status (com necessidade / críticos / baixos / todos)
- Agrupamento por categoria com checkbox de seleção em grupo
- Quantidade editável por item
- Contador em tempo real de itens selecionados
- Seleção feita no **Estoque** é importada automaticamente

#### Step 2 — Seleção de fornecedores
- **Fornecedores WhatsApp:** seleção para envio de cotação
- **Compra Presencial:** seção separada para supermercados e fornecedores sem WhatsApp
  - Cadastro de locais presenciais (Atacadão, supermercado, etc.) com observações
  - **Checklist interativo** com barra de progresso, salvo para retomada posterior
  - Ao finalizar: quantidades atualizadas automaticamente no estoque
- **Lista avulsa:** checklist de itens críticos sem vínculo com ciclo ativo
- Configuração de prazo, entrega, forma de pagamento e observações

#### Step 3 — Cotações
- Painel de **cotações abertas** com timer countdown e barra de progresso
- Mensagens prontas por fornecedor para enviar no WhatsApp
- Abertura automática do WhatsApp com link rastreável
- Formulário de resposta para o fornecedor (cotacao-fornecedor.html)
- Simulação de resposta para testes
- Bloqueio automático ao expirar o prazo

#### Step 4 — Mapa de compras e OC
- Comparativo de preços por fornecedor
- Seleção do melhor fornecedor por item
- Geração de **Ordem de Compra (OC)**
- Fechamento do ciclo com atualização do estoque e histórico

---

### 📋 Cadastros

#### Insumos
- Cadastro de insumos com: nome, categoria, unidade, custo, mínimo, ideal, marcas e código Cardápio Web
- Vinculação com fornecedor

#### Fornecedores
- Dados completos: nome, vendedor, telefone, e-mail
- **Categorias pré-definidas** como tags selecionáveis (Laticínios, Massas, Carnes e Frios, Embalagens, Molhos, Produção Interna, Bebidas, Higiene/Limpeza, Descartáveis, Outros)
- **Busca em tempo real de insumos** — digita e filtra com destaque, agrupado por categoria
- Insumos vinculados aparecem nas cotações automaticamente

#### Pré-preparo
- Cadastro de preparados de produção interna
- Campos: nome, **código Cardápio Web**, unidade, custo, mínimo, ideal, porção/pizza, observações
- Código usado para sync via importação CSV

---

### ⚙️ Configurações
> Acesso restrito: **Gerente**

- WhatsApp da empresa
- Nome e dados da empresa
- Dados gerais do sistema

---

### 📊 Relatórios
- Filtro por período
- Histórico de ciclos de compra com totais e economias
- Evolução de preços dos top insumos
- Desempenho por fornecedor

---

### 👥 Usuários
> Acesso restrito: **Gerente**

- Cadastro e edição de usuários
- Definição de perfil (Gerente / Supervisor / Comprador)
- Definição e alteração de senha
- Preview das permissões por perfil

---

## 💾 Tecnologia e Armazenamento

- **Frontend:** HTML5, CSS3, JavaScript puro (sem frameworks)
- **Armazenamento:** `localStorage` do navegador (todos os dados ficam no dispositivo)
- **Autenticação:** `sessionStorage` (sessão encerrada ao fechar o navegador)
- **Hospedagem:** GitHub Pages
- **Fontes:** Google Fonts (Inter)

> ⚠️ Os dados são armazenados localmente no navegador. Para preservar os dados entre dispositivos ou compartilhar entre usuários, recomenda-se futuramente migrar para um backend com banco de dados.

---

## 🔄 Fluxo de uso recomendado

```
1. ESTOQUE
   └─ Importar CSV do Cardápio Web
   └─ Ajustar mínimos e ideais
   └─ Selecionar itens → Gerar Lista de Compras

2. COMPRAS
   └─ Step 1: Confirmar itens e quantidades
   └─ Step 2: Escolher fornecedores (WhatsApp ou presencial)
   └─ Step 3: Enviar cotações e aguardar respostas
   └─ Step 4: Aprovar mapa e gerar OC

3. PRÉ-PRODUÇÃO
   └─ Criar ordens de produção por período
   └─ Finalizar ordens informando qtd. realizada
   └─ Zerar ciclo ao fim do período

4. DESPERDÍCIO
   └─ Registrar perdas conforme ocorrem
   └─ Monitorar KPIs semanalmente
   └─ Identificar padrões por categoria
```

---

## 📝 Versões e histórico

| Versão | Descrição |
|--------|-----------|
| v1.0 | Estrutura inicial: Estoque, Compras básico, Cadastros |
| v2.0 | Ciclo completo de cotação com WhatsApp e timer |
| v3.0 | Login + permissões, Pré-produção, Relatórios, PDF |
| v3.1 | Logo real VTP, Compra Presencial com checklist |
| v3.2 | Filtros em Compras, Qtd. realizada na Pré-prod, **Desperdício** |
| v3.3 | Busca em tempo real em Fornecedores, Categorias pré-definidas, Badge sidebar, Código Pré-preparo |

---

*Sistema desenvolvido exclusivamente para a rede Vai Ter Pizza! · 2025–2026*
