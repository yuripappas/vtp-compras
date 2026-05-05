# 🍕 VTP Compras — Vai Ter Pizza!

Sistema de gestão de compras, estoque e pré-produção.

## 📁 Estrutura do projeto

```
vtp-compras/
├── index.html          # Página principal
├── css/
│   └── style.css       # Todos os estilos
└── js/
    ├── data.js         # Dados, estado global e persistência (localStorage)
    ├── utils.js        # Helpers, toast, sidebar e navegação
    ├── dashboard.js    # Módulo Dashboard
    ├── estoque.js      # Módulo Estoque + importação CSV
    ├── compras.js      # Módulo Compras (Requisição → Cotação → Mapa → OC)
    └── modules.js      # Pré-produção, Fornecedores, Relatórios, Usuários, PDF
```

## 🚀 Como usar

1. Abra `index.html` no navegador **ou** ative o **GitHub Pages** no repositório
2. Todos os dados são salvos automaticamente no `localStorage` do navegador

## 🌐 GitHub Pages

1. Acesse **Settings → Pages** no repositório
2. Em *Branch*, selecione **main** e clique **Save**
3. Acesse: `https://SEU-USUARIO.github.io/vtp-compras/`

## ✨ Funcionalidades

- **Dashboard** — KPIs, alertas de estoque, ranking de fornecedores
- **Estoque** — Contagem de insumos, importação CSV do Cardápio Web
- **Pré-produção** — Ordens de produção interna, exportação PDF
- **Compras** — Ciclo completo: requisição → cotação → mapa comparativo → ordem de compra → envio via WhatsApp
- **Fornecedores** — Cadastro com insumos vinculados
- **Relatórios** — Histórico de ciclos e evolução de preços
- **Usuários** — Controle de acesso por perfil (Gerente / Supervisor / Comprador)

## 🛠️ Tecnologias

- HTML5 + CSS3 + JavaScript puro (sem frameworks)
- Persistência via `localStorage`
- Sem dependências externas (exceto Google Fonts)
