/**
 * VTP Compras — Vai Ter Pizza!
 * data.js — Estado global, dados iniciais e persistência (localStorage)
 */

// ══════════════════════════════════════════════════════════════
// DADOS INICIAIS
// ══════════════════════════════════════════════════════════════

let items = JSON.parse(localStorage.getItem('vtp_items') || 'null') || [
  { id:1,  name:'Mussarela em Barra',       cat:'Laticínios',         unit:'kg', qty:4,    min:20,  ideal:55,  cost:33.92, supId:null, brands:['Polenghi','Scala','Tirolez'], code:'169713', isProd:false },
  { id:2,  name:'Farinha de Trigo',          cat:'Massas',             unit:'kg', qty:18,   min:20,  ideal:85,  cost:4.43,  supId:null, brands:['Anaconda','Venturelli'],       code:'167714', isProd:false },
  { id:3,  name:'Calabresa',                 cat:'Carnes e Frios',     unit:'kg', qty:6,    min:8,   ideal:15,  cost:24.80, supId:null, brands:['Sadia','Seara'],               code:'157637', isProd:false },
  { id:4,  name:'Pepperoni',                 cat:'Carnes e Frios',     unit:'kg', qty:2,    min:5,   ideal:10,  cost:48,    supId:null, brands:['Sadia'],                        code:'157640', isProd:false },
  { id:5,  name:'Requeijão',                 cat:'Laticínios',         unit:'kg', qty:9,    min:7.5, ideal:16,  cost:48,    supId:null, brands:[],                              code:'157631', isProd:false },
  { id:6,  name:'Caixa Pizza Grande',        cat:'Embalagens',         unit:'un', qty:40,   min:400, ideal:482, cost:3.30,  supId:null, brands:[],                              code:'159735', isProd:false },
  { id:7,  name:'Molho de Tomate',           cat:'Molhos',             unit:'kg', qty:12,   min:2,   ideal:24,  cost:8.39,  supId:null, brands:['Oderich','Fugini'],            code:'157677', isProd:false },
  { id:8,  name:'Cream Cheese',              cat:'Laticínios',         unit:'kg', qty:3.9,  min:5,   ideal:12,  cost:35,    supId:null, brands:[],                              code:'157636', isProd:false },
  { id:9,  name:'Bacon em Cubos',            cat:'Carnes e Frios',     unit:'kg', qty:2,    min:3,   ideal:12,  cost:32.61, supId:null, brands:['Sadia','Seara'],               code:'157640', isProd:false },
  { id:10, name:'Caixa Pizza Pequena',       cat:'Embalagens',         unit:'un', qty:40,   min:400, ideal:393, cost:2.60,  supId:null, brands:[],                              code:'160000', isProd:false },
  { id:11, name:'Frango Desfiado',           cat:'Produção Interna',   unit:'kg', qty:8,    min:1,   ideal:18,  cost:57.01, supId:null, brands:[],                              code:'157638', isProd:true,  medPorcao:0.090 },
  { id:12, name:'Carne de Sol Desfiada',     cat:'Produção Interna',   unit:'kg', qty:12,   min:2,   ideal:20,  cost:70,    supId:null, brands:[],                              code:'157645', isProd:true,  medPorcao:0.080 },
  { id:13, name:'Mussarela Triturada',       cat:'Produção Interna',   unit:'kg', qty:16.8, min:3,   ideal:30,  cost:34,    supId:null, brands:[],                              code:'157629', isProd:true,  medPorcao:0.090 },
  { id:14, name:'Brigadeiro de Chocolate',   cat:'Produção Interna',   unit:'kg', qty:16.9, min:0.5, ideal:20,  cost:24.58, supId:null, brands:[],                              code:'163291', isProd:true,  medPorcao:0.175 },
  { id:15, name:'Creme de Gorgonzola',       cat:'Produção Interna',   unit:'kg', qty:8.4,  min:0.3, ideal:12,  cost:61.83, supId:null, brands:[],                              code:'157633', isProd:true,  medPorcao:0.080 },
  { id:16, name:'Costela Bovina Desfiada',   cat:'Produção Interna',   unit:'kg', qty:7.1,  min:3,   ideal:15,  cost:75.81, supId:null, brands:[],                              code:'157646', isProd:true,  medPorcao:0.075 },
];

let suppliers = JSON.parse(localStorage.getItem('vtp_suppliers') || '[]');

let users = JSON.parse(localStorage.getItem('vtp_users') || 'null') || [
  { id:1, name:'Yuri Pappas', email:'gerente@vaiterpizza.com',    role:'gerente',    active:true },
  { id:2, name:'Ana Silva',   email:'supervisor@vaiterpizza.com', role:'supervisor', active:true },
  { id:3, name:'Carlos Lima', email:'comprador@vaiterpizza.com',  role:'comprador',  active:true },
];

let ordens       = JSON.parse(localStorage.getItem('vtp_ordens')         || '[]');
let cycle        = JSON.parse(localStorage.getItem('vtp_cycle')          || 'null');
let responses    = JSON.parse(localStorage.getItem('vtp_responses')      || '{}');
let approvals    = JSON.parse(localStorage.getItem('vtp_approvals')      || '{}');
let cycleHistory = JSON.parse(localStorage.getItem('vtp_cycle_history')  || '[]');

// ── Contadores de ID ──
let nextIid = Math.max(...items.map(i => i.id), 0) + 1;
let nextSid = Math.max(...(suppliers.length ? suppliers.map(s => s.id) : [0]), 0) + 1;
let nextUid = Math.max(...users.map(u => u.id), 0) + 1;

// ── Estado de UI ──
let changedIds     = new Set();
let editItemId     = null;
let editSupId      = null;
let editUserId     = null;
let importData     = [];
let sazonalPctAtual = 0;
let currentTab3    = 'compare';
let sidebarOpen    = false;

// ══════════════════════════════════════════════════════════════
// PERSISTÊNCIA
// ══════════════════════════════════════════════════════════════

// Tipos de pizza (base)
const PIZZA_TIPOS = [
  { id:'pq_sal', label:'Pizza Pequena Salgada', basePrice:34.90, cat:'pq_sal', grande:false },
  { id:'gr_sal', label:'Pizza Grande Salgada',  basePrice:50.90, cat:'gr_sal', grande:true  },
  { id:'pq_doc', label:'Pizza Pequena Doce',    basePrice:34.90, cat:'pq_doc', grande:false },
  { id:'gr_doc', label:'Pizza Grande Doce',     basePrice:49.90, cat:'gr_doc', grande:true  },
];

// Sabores com acréscimo por categoria
let sabores = JSON.parse(localStorage.getItem('vtp_sabores') || 'null') || [
  // Pizza Pequena Salgada
  { id:1,  tipo:'pq_sal', name:'Mussarela',                    acr:0.00,  active:true },
  { id:2,  tipo:'pq_sal', name:'Milho Verde',                  acr:0.00,  active:true },
  { id:3,  tipo:'pq_sal', name:'Marguerita',                   acr:1.00,  active:true },
  { id:4,  tipo:'pq_sal', name:'Queijo e Presunto',            acr:1.00,  active:true },
  { id:5,  tipo:'pq_sal', name:'Calabresa',                    acr:1.00,  active:true },
  { id:6,  tipo:'pq_sal', name:'Frango Caipira',               acr:5.00,  active:true },
  { id:7,  tipo:'pq_sal', name:'Lombinho',                     acr:5.00,  active:true },
  { id:8,  tipo:'pq_sal', name:'Americana',                    acr:6.00,  active:true },
  { id:9,  tipo:'pq_sal', name:'Catupirella',                  acr:7.00,  active:true },
  { id:10, tipo:'pq_sal', name:'Frango Catupiry',              acr:7.00,  active:true },
  { id:11, tipo:'pq_sal', name:'Quatro Queijos',               acr:7.00,  active:true },
  { id:12, tipo:'pq_sal', name:'Lombinho Cremoso',             acr:7.00,  active:true },
  { id:13, tipo:'pq_sal', name:'Portuguesa',                   acr:8.00,  active:true },
  { id:14, tipo:'pq_sal', name:'Frango com Bacon',             acr:8.00,  active:true },
  { id:15, tipo:'pq_sal', name:'Carne de Sol na Nata',         acr:14.00, active:true },
  { id:16, tipo:'pq_sal', name:'Filé ao Gorgonzola',          acr:14.00, active:true },
  { id:17, tipo:'pq_sal', name:'Carne de Sol Nordestina',      acr:15.00, active:true },
  { id:18, tipo:'pq_sal', name:'Filé, Cream Cheese e Barbecue de Goiabada', acr:15.00, active:true },
  { id:19, tipo:'pq_sal', name:'Filé ao Alho',                acr:17.00, active:true },
  { id:20, tipo:'pq_sal', name:'Costela Queijuda',             acr:19.00, active:true },
  { id:21, tipo:'pq_sal', name:'Costela, Cream Cheese e Barbecue de Goiabada', acr:20.00, active:true },
  // Pizza Grande Salgada (preços = acréscimo por 1/2)
  { id:22, tipo:'gr_sal', name:'1/2 Mussarela',               acr:0.00,  active:true },
  { id:23, tipo:'gr_sal', name:'1/2 Milho Verde',             acr:0.00,  active:true },
  { id:24, tipo:'gr_sal', name:'1/2 Marguerita',              acr:0.00,  active:true },
  { id:25, tipo:'gr_sal', name:'1/2 Queijo e Presunto',       acr:0.00,  active:true },
  { id:26, tipo:'gr_sal', name:'1/2 Calabresa',               acr:0.00,  active:true },
  { id:27, tipo:'gr_sal', name:'1/2 Lombinho',                acr:3.50,  active:true },
  { id:28, tipo:'gr_sal', name:'1/2 Frango Caipira',          acr:4.00,  active:true },
  { id:29, tipo:'gr_sal', name:'1/2 Americana',               acr:4.00,  active:true },
  { id:30, tipo:'gr_sal', name:'1/2 Portuguesa',              acr:6.50,  active:true },
  { id:31, tipo:'gr_sal', name:'1/2 Frango com Bacon',        acr:6.50,  active:true },
  { id:32, tipo:'gr_sal', name:'1/2 Lombinho Cremoso',        acr:7.00,  active:true },
  { id:33, tipo:'gr_sal', name:'1/2 Frango Catupiry',         acr:7.50,  active:true },
  { id:34, tipo:'gr_sal', name:'1/2 Catupirella',             acr:7.50,  active:true },
  { id:35, tipo:'gr_sal', name:'1/2 Quatro Queijos',          acr:8.00,  active:true },
  { id:36, tipo:'gr_sal', name:'1/2 Carne de Sol na Nata',    acr:8.50,  active:true },
  { id:37, tipo:'gr_sal', name:'1/2 Filé ao Gorgonzola',     acr:8.50,  active:true },
  { id:38, tipo:'gr_sal', name:'1/2 Filé, Cream Cheese e Barbecue', acr:9.00, active:true },
  { id:39, tipo:'gr_sal', name:'1/2 Filé ao Alho',            acr:9.50,  active:true },
  { id:40, tipo:'gr_sal', name:'1/2 Costela, Cream Cheese e Barbecue', acr:12.50, active:true },
  { id:41, tipo:'gr_sal', name:'1/2 Carne de Sol Nordestina', acr:13.00, active:true },
  { id:42, tipo:'gr_sal', name:'1/2 Costela Queijuda',        acr:13.00, active:true },
  // Pizza Pequena Doce
  { id:43, tipo:'pq_doc', name:'Cartola',                     acr:0.00,  active:true },
  { id:44, tipo:'pq_doc', name:'Leite Ninho com Nutella',     acr:0.00,  active:true },
  { id:45, tipo:'pq_doc', name:'Romeu e Julieta',             acr:0.00,  active:true },
  { id:46, tipo:'pq_doc', name:'Brigadeiro',                  acr:0.00,  active:true },
  { id:47, tipo:'pq_doc', name:"M&M's",                      acr:4.00,  active:true },
  { id:48, tipo:'pq_doc', name:'Nutella',                     acr:4.00,  active:true },
  { id:49, tipo:'pq_doc', name:'Banana Nevada',               acr:4.00,  active:true },
  { id:50, tipo:'pq_doc', name:'Sonho de Valsa',              acr:4.00,  active:true },
  { id:51, tipo:'pq_doc', name:'Cheesecake de Morango',       acr:9.00,  active:true },
  // Pizza Grande Doce (1/2)
  { id:52, tipo:'gr_doc', name:'1/2 Cartola',                 acr:0.00,  active:true },
  { id:53, tipo:'gr_doc', name:'1/2 Romeu e Julieta',         acr:0.50,  active:true },
  { id:54, tipo:'gr_doc', name:'1/2 Brigadeiro',              acr:0.50,  active:true },
  { id:55, tipo:'gr_doc', name:'1/2 Leite Ninho com Nutella', acr:0.50,  active:true },
  { id:56, tipo:'gr_doc', name:"1/2 M&M's",                  acr:2.50,  active:true },
  { id:57, tipo:'gr_doc', name:'1/2 Banana Nevada',           acr:2.50,  active:true },
  { id:58, tipo:'gr_doc', name:'1/2 Sonho de Valsa',          acr:5.00,  active:true },
  { id:59, tipo:'gr_doc', name:'1/2 Nutella',                 acr:5.50,  active:true },
  { id:60, tipo:'gr_doc', name:'1/2 Cheesecake de Morango',   acr:8.00,  active:true },
];
let nextSabId = Math.max(...sabores.map(s => s.id), 0) + 1;

let produtos = JSON.parse(localStorage.getItem('vtp_produtos') || '[]');
let nextPid  = Math.max(...(produtos.length ? produtos.map(p => p.id) : [0]), 0) + 1;

const saveP    = () => localStorage.setItem('vtp_produtos', JSON.stringify(produtos));
const saveSab  = () => localStorage.setItem('vtp_sabores',  JSON.stringify(sabores));
const saveI  = () => localStorage.setItem('vtp_items',         JSON.stringify(items));
const saveS  = () => localStorage.setItem('vtp_suppliers',     JSON.stringify(suppliers));
const saveU  = () => localStorage.setItem('vtp_users',         JSON.stringify(users));
const saveO  = () => localStorage.setItem('vtp_ordens',        JSON.stringify(ordens));
const saveC  = () => localStorage.setItem('vtp_cycle',         JSON.stringify(cycle));
const saveR  = () => localStorage.setItem('vtp_responses',     JSON.stringify(responses));
const saveAp = () => localStorage.setItem('vtp_approvals',     JSON.stringify(approvals));
const saveCH = () => localStorage.setItem('vtp_cycle_history', JSON.stringify(cycleHistory));

// ══════════════════════════════════════════════════════════════
// PERMISSÕES
// ══════════════════════════════════════════════════════════════

const PERMS = {
  gerente: {
    label: '👑 Gerente', color: '#6B21D4', bg: '#EDE9FE',
    perms: ['Ver Dashboard','Estoque','Pré-produção','Desperdício','Compras','Aprovação de compras','Fornecedores','Relatórios','Gerenciar usuários','Configurações']
  },
  supervisor: {
    label: '🔑 Supervisor', color: '#D97706', bg: '#FEF3C7',
    perms: ['Ver Dashboard','Estoque','Pré-produção','Desperdício','Compras','Aprovação de compras','Fornecedores','Relatórios']
  },
  comprador: {
    label: '🛒 Comprador', color: '#16A34A', bg: '#DCFCE7',
    perms: ['Ver Dashboard','Estoque','Pré-produção','Compras','Fornecedores']
  },
};
