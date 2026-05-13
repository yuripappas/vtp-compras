/**
 * VTP — Vai Ter Pizza!
 * checklist.js — Módulo de Checklist Operacional
 */

// ══════════════════════════════════════════════════════════════
// STORAGE
// ══════════════════════════════════════════════════════════════
const _getCkTemplates  = () => JSON.parse(localStorage.getItem('vtp_ck_templates')  || 'null') || _ckTemplatesDefault();
const _saveCkTemplates = t  => localStorage.setItem('vtp_ck_templates', JSON.stringify(t));
const _getCkSessoes    = () => JSON.parse(localStorage.getItem('vtp_ck_sessoes')    || '[]');
const _saveCkSessoes   = s  => localStorage.setItem('vtp_ck_sessoes', JSON.stringify(s));

let _ckTab = 'meu'; // 'meu' | 'equipe' | 'templates'

// ══════════════════════════════════════════════════════════════
// TEMPLATES PADRÃO
// ══════════════════════════════════════════════════════════════
function _ckTemplatesDefault() {
  return [
    {
      id: 1,
      nome: 'Pizzaiolo — Abertura',
      funcao: 'pizzaiolo',
      turno: 'abertura',
      cor: '#DC2626', bg: '#FEF2F2',
      ativo: true,
      itens: [
        { id:1, texto:'Verificar temperatura do forno principal',            horario:'17:00', obrigatorio:true  },
        { id:2, texto:'Conferir estoque de massas abertas',                  horario:'17:00', obrigatorio:true  },
        { id:3, texto:'Organizar bancada de trabalho e utensílios',          horario:'17:00', obrigatorio:true  },
        { id:4, texto:'Verificar nível de gás',                              horario:'17:00', obrigatorio:true  },
        { id:5, texto:'Conferir estoque de insumos (queijo, calabresa, etc)',horario:'17:15', obrigatorio:true  },
        { id:6, texto:'Ligar e testar equipamentos (forno, divisora)',       horario:'17:15', obrigatorio:true  },
        { id:7, texto:'Verificar limpeza dos carrinhos de massa',            horario:'17:20', obrigatorio:false },
      ]
    },
    {
      id: 2,
      nome: 'Pizzaiolo — Fechamento',
      funcao: 'pizzaiolo',
      turno: 'fechamento',
      cor: '#DC2626', bg: '#FEF2F2',
      ativo: true,
      itens: [
        { id:1, texto:'Desligar fornos e equipamentos',                      horario:'23:30', obrigatorio:true  },
        { id:2, texto:'Limpar e organizar bancada de trabalho',              horario:'23:30', obrigatorio:true  },
        { id:3, texto:'Guardar insumos sobressalentes na câmara fria',       horario:'23:30', obrigatorio:true  },
        { id:4, texto:'Registrar sobra de massas (quantidade)',              horario:'23:45', obrigatorio:true  },
        { id:5, texto:'Higienizar utensílios e formas',                      horario:'23:45', obrigatorio:true  },
        { id:6, texto:'Verificar se câmara fria está fechada',               horario:'00:00', obrigatorio:true  },
      ]
    },
    {
      id: 3,
      nome: 'Pré-Produção — Diário',
      funcao: 'preproducao',
      turno: 'producao',
      cor: '#7C3AED', bg: '#EDE9FE',
      ativo: true,
      itens: [
        { id:1, texto:'Verificar ordens de produção do dia',                 horario:'14:00', obrigatorio:true  },
        { id:2, texto:'Separar e pesar insumos para preparo',                horario:'14:15', obrigatorio:true  },
        { id:3, texto:'Preparar frango (cozinhar e desfiar)',                horario:'14:30', obrigatorio:false },
        { id:4, texto:'Preparar carne de sol',                               horario:'15:00', obrigatorio:false },
        { id:5, texto:'Preparar brigadeiros e cremes',                       horario:'15:30', obrigatorio:false },
        { id:6, texto:'Etiquetar e armazenar preparados com data',           horario:'16:30', obrigatorio:true  },
        { id:7, texto:'Registrar quantidades produzidas',                    horario:'16:45', obrigatorio:true  },
        { id:8, texto:'Higienizar área de produção',                         horario:'17:00', obrigatorio:true  },
      ]
    },
    {
      id: 4,
      nome: 'Atendimento — Abertura',
      funcao: 'atendimento',
      turno: 'abertura',
      cor: '#059669', bg: '#ECFDF5',
      ativo: true,
      itens: [
        { id:1, texto:'Ligar sistema de pedidos (cardápio web)',             horario:'17:00', obrigatorio:true  },
        { id:2, texto:'Verificar impressora de pedidos',                     horario:'17:00', obrigatorio:true  },
        { id:3, texto:'Conferir troco do caixa',                             horario:'17:00', obrigatorio:true  },
        { id:4, texto:'Atualizar cardápio / pausar itens em falta',         horario:'17:10', obrigatorio:true  },
        { id:5, texto:'Verificar funcionamento do delivery (iFood, CW)',    horario:'17:15', obrigatorio:true  },
        { id:6, texto:'Checar disponibilidade dos motoboys',                horario:'17:15', obrigatorio:true  },
      ]
    },
    {
      id: 5,
      nome: 'Atendimento — Fechamento',
      funcao: 'atendimento',
      turno: 'fechamento',
      cor: '#059669', bg: '#ECFDF5',
      ativo: true,
      itens: [
        { id:1, texto:'Pausar todos os canais de venda',                    horario:'23:00', obrigatorio:true  },
        { id:2, texto:'Fechar caixa e conferir valores',                    horario:'23:15', obrigatorio:true  },
        { id:3, texto:'Registrar total de pedidos e faturamento do dia',    horario:'23:30', obrigatorio:true  },
        { id:4, texto:'Enviar relatório diário para gerência',              horario:'23:45', obrigatorio:false },
        { id:5, texto:'Desligar sistema e equipamentos de atendimento',     horario:'00:00', obrigatorio:true  },
      ]
    },
    {
      id: 6,
      nome: 'Auxiliar de Cozinha — Turno',
      funcao: 'auxiliar',
      turno: 'turno',
      cor: '#D97706', bg: '#FFFBEB',
      ativo: true,
      itens: [
        { id:1, texto:'Higienizar bancadas e equipamentos',                 horario:'17:00', obrigatorio:true  },
        { id:2, texto:'Repor material de limpeza',                          horario:'17:00', obrigatorio:false },
        { id:3, texto:'Lavar e organizar louças e utensílios',              horario:'Contínuo', obrigatorio:true },
        { id:4, texto:'Manter área de descarte organizada',                 horario:'Contínuo', obrigatorio:true },
        { id:5, texto:'Apoiar pré-produção conforme demanda',               horario:'Contínuo', obrigatorio:false},
        { id:6, texto:'Limpeza geral ao final do turno',                   horario:'23:30', obrigatorio:true  },
      ]
    },
    {
      id: 7,
      nome: 'Compras e Estoque — Diário',
      funcao: 'compras',
      turno: 'diario',
      cor: '#2563EB', bg: '#EFF6FF',
      ativo: true,
      itens: [
        { id:1, texto:'Conferir estoque e atualizar sistema',               horario:'09:00', obrigatorio:true  },
        { id:2, texto:'Verificar itens críticos e gerar lista de compras',  horario:'09:30', obrigatorio:true  },
        { id:3, texto:'Contatar fornecedores para pedidos urgentes',        horario:'10:00', obrigatorio:false },
        { id:4, texto:'Receber e conferir entregas do dia',                 horario:'Conforme chegada', obrigatorio:true },
        { id:5, texto:'Registrar entradas no sistema',                      horario:'Conforme chegada', obrigatorio:true },
        { id:6, texto:'Organizar estoque por validade (PVPS)',              horario:'Conforme chegada', obrigatorio:true },
      ]
    },
  ];
}

// ══════════════════════════════════════════════════════════════
// RENDER PRINCIPAL
// ══════════════════════════════════════════════════════════════
function renderChecklist() {
  const u = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const isGestor = u?.role === 'gerente' || u?.role === 'supervisor';

  const el = document.getElementById('checklistContent');
  if (!el) return;

  // Tabs
  el.innerHTML = `
    <!-- Tab bar -->
    <div style="background:var(--surface);border-bottom:1.5px solid var(--border);padding:0 24px;display:flex;gap:0;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10">
      <div style="display:flex;gap:0">
        <button onclick="setCkTab('meu')" id="ckTab-meu"
          style="display:flex;align-items:center;gap:6px;padding:12px 16px;border:none;
          border-bottom:2.5px solid ${_ckTab==='meu'?'var(--purple)':'transparent'};
          background:none;color:${_ckTab==='meu'?'var(--purple)':'var(--muted)'};
          font-size:.8rem;font-weight:${_ckTab==='meu'?'700':'500'};cursor:pointer;font-family:Inter,sans-serif">
          ${lc('check-square',13,'currentColor')} Meu Checklist
        </button>
        ${isGestor ? `
        <button onclick="setCkTab('equipe')" id="ckTab-equipe"
          style="display:flex;align-items:center;gap:6px;padding:12px 16px;border:none;
          border-bottom:2.5px solid ${_ckTab==='equipe'?'var(--purple)':'transparent'};
          background:none;color:${_ckTab==='equipe'?'var(--purple)':'var(--muted)'};
          font-size:.8rem;font-weight:${_ckTab==='equipe'?'700':'500'};cursor:pointer;font-family:Inter,sans-serif">
          ${lc('users',13,'currentColor')} Equipe
          <span id="ckBadgeEquipe" style="display:none;background:var(--red);color:#fff;border-radius:20px;padding:1px 6px;font-size:.6rem;font-weight:800"></span>
        </button>
        <button onclick="setCkTab('templates')" id="ckTab-templates"
          style="display:flex;align-items:center;gap:6px;padding:12px 16px;border:none;
          border-bottom:2.5px solid ${_ckTab==='templates'?'var(--purple)':'transparent'};
          background:none;color:${_ckTab==='templates'?'var(--purple)':'var(--muted)'};
          font-size:.8rem;font-weight:${_ckTab==='templates'?'700':'500'};cursor:pointer;font-family:Inter,sans-serif">
          ${lc('layout',13,'currentColor')} Templates
        </button>` : ''}
      </div>
      <div style="padding:8px 0">
        ${isGestor ? `
          <button onclick="abrirModalNovaInstancia()"
            style="display:flex;align-items:center;gap:6px;padding:6px 14px;border:none;border-radius:var(--r8);
            background:var(--purple);color:#fff;font-size:.76rem;font-weight:700;cursor:pointer">
            ${lc('plus',13,'#fff')} Atribuir checklist
          </button>` : ''}
      </div>
    </div>
    <div id="ckPanelContent" style="padding:20px 24px"></div>`;

  _renderCkTab();
  _atualizarBadgeEquipe();
}

function setCkTab(tab) {
  _ckTab = tab;
  renderChecklist();
}

function _renderCkTab() {
  if (_ckTab === 'meu')       _renderCkMeu();
  else if (_ckTab === 'equipe')    _renderCkEquipe();
  else if (_ckTab === 'templates') _renderCkTemplates();
}

// ══════════════════════════════════════════════════════════════
// ABA: MEU CHECKLIST
// ══════════════════════════════════════════════════════════════
function _renderCkMeu() {
  const u        = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
  const el       = document.getElementById('ckPanelContent');
  const hoje     = new Date().toISOString().slice(0,10);
  const sessoes  = _getCkSessoes().filter(s => s.userId === u?.id && s.data === hoje);
  const all      = _getCkSessoes();
  // Instâncias atribuídas a este usuário hoje
  const instancias = all.filter(s => s.userId === u?.id && s.data === hoje);

  const now   = new Date();
  const hora  = now.getHours();
  const saud  = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  el.innerHTML = `
    <div style="max-width:680px;margin:0 auto">
      <!-- Saudação mobile-friendly -->
      <div style="text-align:center;padding:16px 0 20px">
        <div style="font-size:1.4rem;font-weight:800;margin-bottom:4px">${saud}, ${u?.name?.split(' ')[0] || 'você'}!</div>
        <div style="font-size:.8rem;color:var(--muted)">${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</div>
      </div>

      ${instancias.length === 0 ? `
        <div style="text-align:center;padding:40px 20px;background:var(--surface2);border-radius:var(--r12);border:1.5px dashed var(--border)">
          ${lc('check-square',32,'var(--muted)')}
          <div style="font-size:.9rem;font-weight:700;margin-top:12px;margin-bottom:6px">Nenhum checklist para hoje</div>
          <div style="font-size:.76rem;color:var(--muted)">Aguarde seu supervisor atribuir as tarefas do dia</div>
        </div>
      ` : instancias.map(inst => _cardInstanciaFuncionario(inst)).join('')}
    </div>`;
}

function _cardInstanciaFuncionario(inst) {
  const tmpl  = _getCkTemplates().find(t => t.id === inst.templateId);
  if (!tmpl) return '';
  const total    = tmpl.itens.length;
  const feitos   = Object.keys(inst.respostas||{}).length;
  const pct      = total > 0 ? Math.round(feitos/total*100) : 0;
  const concluido= pct === 100;

  return `
  <div class="card" style="margin-bottom:14px;overflow:hidden;border:1.5px solid ${concluido?'var(--green)':'var(--border)'}">
    <!-- Header do checklist -->
    <div style="padding:14px 16px;background:${concluido?'var(--green-light)':tmpl.bg||'var(--surface2)'};border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
        <div>
          <div style="font-size:.9rem;font-weight:800;color:${concluido?'var(--green)':tmpl.cor||'var(--text)'}">${tmpl.nome}</div>
          <div style="font-size:.66rem;color:var(--muted);margin-top:2px">${inst.turno||''} · ${inst.data?new Date(inst.data+'T12:00').toLocaleDateString('pt-BR',{day:'numeric',month:'short'}):''}</div>
        </div>
        ${concluido ? `
          <div style="display:flex;align-items:center;gap:5px;background:var(--green);color:#fff;padding:4px 10px;border-radius:20px;font-size:.72rem;font-weight:700">
            ${lc('check-circle',13,'#fff')} Concluído!
          </div>
        ` : `
          <div style="text-align:right">
            <div style="font-size:1rem;font-weight:800;color:${tmpl.cor||'var(--purple)'}">${pct}%</div>
            <div style="font-size:.6rem;color:var(--muted)">${feitos}/${total} itens</div>
          </div>
        `}
      </div>
      <!-- Barra de progresso -->
      <div style="height:6px;background:rgba(0,0,0,.1);border-radius:3px;overflow:hidden;margin-top:10px">
        <div style="height:100%;width:${pct}%;background:${concluido?'var(--green)':tmpl.cor||'var(--purple)'};border-radius:3px;transition:width .4s"></div>
      </div>
    </div>

    <!-- Itens do checklist -->
    <div style="padding:8px 0">
      ${tmpl.itens.map(item => {
        const feito = !!(inst.respostas||{})[item.id];
        return `
        <label style="display:flex;align-items:flex-start;gap:12px;padding:11px 16px;cursor:pointer;
          border-bottom:1px solid var(--border);transition:background .1s;
          background:${feito?'var(--green-light)':'var(--surface)'}"
          onmouseover="this.style.background='${feito?'var(--green-light)':'var(--surface2)'}'"
          onmouseout="this.style.background='${feito?'var(--green-light)':'var(--surface)'}'">
          <div style="flex-shrink:0;margin-top:1px">
            <input type="checkbox" ${feito?'checked':''} style="display:none"
              onchange="marcarItemCk('${inst.id}',${item.id},this.checked)">
            <div onclick="marcarItemCkClick('${inst.id}',${item.id})"
              style="width:22px;height:22px;border-radius:6px;border:2px solid ${feito?'var(--green)':'var(--border)'};
              background:${feito?'var(--green)':'var(--surface)'};display:flex;align-items:center;justify-content:center;
              transition:all .2s;cursor:pointer">
              ${feito ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
            </div>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-size:.84rem;font-weight:${feito?'600':'500'};color:${feito?'var(--muted)':'var(--text)'};
              text-decoration:${feito?'line-through':'none'};line-height:1.4">${item.texto}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:3px">
              ${item.horario ? `<span style="font-size:.64rem;color:var(--muted)">${lc('clock',10,'currentColor')} ${item.horario}</span>` : ''}
              ${item.obrigatorio ? `<span style="font-size:.6rem;font-weight:600;color:var(--red)">obrigatório</span>` : ''}
            </div>
          </div>
        </label>`;
      }).join('')}
    </div>

    <!-- Footer: assinar se concluído -->
    ${!concluido ? '' : `
    <div style="padding:12px 16px;background:var(--green-light);border-top:1px solid var(--green)">
      <div style="font-size:.74rem;font-weight:600;color:var(--green);text-align:center">
        ${lc('check-circle',14,'var(--green)')} Checklist assinado às ${inst.concluidoEm ? new Date(inst.concluidoEm).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '—'}
      </div>
    </div>`}
  </div>`;
}

function marcarItemCkClick(instId, itemId) {
  const sessoes = _getCkSessoes();
  const inst    = sessoes.find(s => s.id === instId);
  if (!inst) return;
  if (!inst.respostas) inst.respostas = {};
  const novoEstado = !inst.respostas[itemId];
  if (novoEstado) {
    inst.respostas[itemId] = { feito:true, hora: new Date().toISOString() };
  } else {
    delete inst.respostas[itemId];
  }
  // Verificar se concluiu tudo
  const tmpl = _getCkTemplates().find(t => t.id === inst.templateId);
  if (tmpl) {
    const obrigs = tmpl.itens.filter(i => i.obrigatorio);
    const todosObrigs = obrigs.every(i => inst.respostas[i.id]);
    const todosTudo   = tmpl.itens.every(i => inst.respostas[i.id]);
    if (todosTudo && !inst.concluidoEm) {
      inst.concluidoEm  = new Date().toISOString();
      inst.status       = 'concluido';
      toast('Checklist concluído!', 'ok');
    } else if (!todosTudo) {
      inst.status = 'em_andamento';
      delete inst.concluidoEm;
    }
  }
  _saveCkSessoes(sessoes);
  _renderCkMeu();
  _atualizarBadgeEquipe();
}

function marcarItemCk(instId, itemId, checked) {
  marcarItemCkClick(instId, itemId);
}

// ══════════════════════════════════════════════════════════════
// ABA: EQUIPE (GESTOR)
// ══════════════════════════════════════════════════════════════
function _renderCkEquipe() {
  const el   = document.getElementById('ckPanelContent');
  const hoje = new Date().toISOString().slice(0,10);
  const sessoes = _getCkSessoes();

  // Filtros
  if (!window._ckEquipeFiltro) window._ckEquipeFiltro = { data: hoje, userId: '' };
  const f    = window._ckEquipeFiltro;
  const sFs  = sessoes.filter(s => s.data === f.data && (f.userId ? s.userId === parseInt(f.userId) : true));

  // Funcs com sessões hoje
  const usersComSessao = [...new Set(sFs.map(s => s.userId))];
  const funcUsers = users.filter(u => u.active !== false);

  // KPIs
  const total     = sFs.length;
  const concluidos= sFs.filter(s => s.status === 'concluido').length;
  const pendentes = sFs.filter(s => s.status === 'pendente').length;
  const andamento = sFs.filter(s => s.status === 'em_andamento').length;

  el.innerHTML = `
    <div>
      <!-- Filtros -->
      <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:flex-end">
        <div>
          <div style="font-size:.68rem;color:var(--muted);margin-bottom:3px;font-weight:600">Data</div>
          <input type="date" value="${f.data}" class="inp" style="max-width:160px"
            onchange="window._ckEquipeFiltro.data=this.value;_renderCkEquipe()">
        </div>
        <div>
          <div style="font-size:.68rem;color:var(--muted);margin-bottom:3px;font-weight:600">Funcionário</div>
          <select class="inp" style="max-width:200px" onchange="window._ckEquipeFiltro.userId=this.value;_renderCkEquipe()">
            <option value="">Todos</option>
            ${funcUsers.map(u => `<option value="${u.id}" ${f.userId==u.id?'selected':''}>${u.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- KPIs do dia -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:20px">
        ${[
          { label:'Total', val:total, cor:'var(--purple)', bg:'var(--purple-xlight)' },
          { label:'Concluídos', val:concluidos, cor:'var(--green)', bg:'var(--green-light)' },
          { label:'Em andamento', val:andamento, cor:'var(--yellow)', bg:'var(--yellow-light)' },
          { label:'Pendentes', val:pendentes, cor:'var(--red)', bg:'var(--red-light)' },
        ].map(k => `
          <div style="background:${k.bg};border:1.5px solid ${k.cor}22;border-radius:var(--r10);padding:11px 14px;text-align:center">
            <div style="font-size:1.4rem;font-weight:800;color:${k.cor}">${k.val}</div>
            <div style="font-size:.62rem;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">${k.label}</div>
          </div>`).join('')}
      </div>

      <!-- Grid de funcionários -->
      <div style="display:flex;flex-direction:column;gap:12px">
        ${funcUsers.filter(u => f.userId ? u.id === parseInt(f.userId) : true).map(u => {
          const uSessoes = sFs.filter(s => s.userId === u.id);
          const uConc    = uSessoes.filter(s => s.status === 'concluido').length;
          const uPend    = uSessoes.filter(s => s.status === 'pendente').length;
          return `
          <div class="card" style="overflow:hidden">
            <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--surface2);border-bottom:1px solid var(--border);flex-wrap:wrap">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--purple);color:#fff;font-size:.88rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                ${u.name.charAt(0).toUpperCase()}
              </div>
              <div style="flex:1">
                <div style="font-size:.86rem;font-weight:700">${u.name}</div>
                <div style="font-size:.66rem;color:var(--muted)">${u.funcao||u.role} · ${uSessoes.length} checklist(s) hoje</div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                ${uConc > 0 ? `<span style="background:var(--green-light);color:var(--green);border:1px solid var(--green);border-radius:20px;padding:2px 8px;font-size:.66rem;font-weight:700">${uConc} concluído(s)</span>` : ''}
                ${uPend > 0 ? `<span style="background:var(--red-light);color:var(--red);border:1px solid var(--red);border-radius:20px;padding:2px 8px;font-size:.66rem;font-weight:700">${uPend} pendente(s)</span>` : ''}
                <button onclick="abrirModalNovaInstanciaUser(${u.id})"
                  style="padding:4px 10px;border:1.5px solid var(--purple);border-radius:var(--r6);background:var(--surface);color:var(--purple);font-size:.68rem;font-weight:600;cursor:pointer">
                  + Atribuir
                </button>
              </div>
            </div>
            ${uSessoes.length === 0 ? `
              <div style="padding:12px 16px;font-size:.74rem;color:var(--muted);font-style:italic">Nenhum checklist atribuído hoje</div>
            ` : uSessoes.map(s => {
              const tmpl = _getCkTemplates().find(t => t.id === s.templateId);
              if (!tmpl) return '';
              const total = tmpl.itens.length;
              const feitos = Object.keys(s.respostas||{}).length;
              const pct = total > 0 ? Math.round(feitos/total*100) : 0;
              const stColors = { concluido:'var(--green)', em_andamento:'var(--yellow)', pendente:'var(--red)' };
              const stLabels = { concluido:'Concluído', em_andamento:'Em andamento', pendente:'Pendente' };
              return `
              <div style="padding:10px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                <div style="width:6px;height:6px;border-radius:50%;background:${stColors[s.status]||'var(--muted)'};flex-shrink:0"></div>
                <div style="flex:1">
                  <div style="font-size:.78rem;font-weight:600">${tmpl.nome}</div>
                  <div style="font-size:.62rem;color:var(--muted)">${feitos}/${total} itens · ${s.turno||''}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:60px;height:5px;background:var(--border);border-radius:3px;overflow:hidden">
                    <div style="height:100%;width:${pct}%;background:${stColors[s.status]||'var(--muted)'};border-radius:3px"></div>
                  </div>
                  <span style="font-size:.7rem;font-weight:700;color:${stColors[s.status]}">${pct}%</span>
                  <button onclick="verDetalheInstancia('${s.id}')"
                    style="padding:3px 8px;border:1px solid var(--border);border-radius:var(--r6);background:var(--surface);font-size:.66rem;color:var(--muted);cursor:pointer">
                    Ver
                  </button>
                </div>
              </div>`;
            }).join('')}
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

function _atualizarBadgeEquipe() {
  const hoje    = new Date().toISOString().slice(0,10);
  const pend    = _getCkSessoes().filter(s => s.data === hoje && s.status === 'pendente').length;
  const badge   = document.getElementById('ckBadgeEquipe');
  if (badge) { badge.textContent = pend > 0 ? pend : ''; badge.style.display = pend > 0 ? 'inline' : 'none'; }
  const sbBadge = document.getElementById('badge-checklist');
  if (sbBadge) { sbBadge.style.display = pend > 0 ? 'block' : 'none'; }
}

// ══════════════════════════════════════════════════════════════
// ABA: TEMPLATES
// ══════════════════════════════════════════════════════════════
function _renderCkTemplates() {
  const el    = document.getElementById('ckPanelContent');
  const tmpls = _getCkTemplates();

  el.innerHTML = `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
        <div>
          <h3 style="font-size:.96rem;font-weight:800;margin-bottom:2px">Templates de Checklist</h3>
          <div style="font-size:.72rem;color:var(--muted)">Crie e edite os checklists por função e turno</div>
        </div>
        <button onclick="abrirModalNovoTemplate()"
          style="display:flex;align-items:center;gap:6px;padding:7px 14px;border:none;border-radius:var(--r8);background:var(--purple);color:#fff;font-size:.78rem;font-weight:700;cursor:pointer">
          ${lc('plus',13,'#fff')} Novo template
        </button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px">
        ${tmpls.map(t => `
          <div class="card" style="overflow:hidden;border:1.5px solid ${t.cor||'var(--border)'}22;cursor:pointer" onclick="abrirModalEditarTemplate(${t.id})">
            <div style="padding:14px 16px;background:${t.bg||'var(--surface2)'};border-bottom:1px solid var(--border)">
              <div style="display:flex;justify-content:space-between;align-items:flex-start">
                <div>
                  <div style="font-size:.86rem;font-weight:800;color:${t.cor||'var(--text)'}">${t.nome}</div>
                  <div style="font-size:.66rem;color:var(--muted);margin-top:3px">${t.funcao} · ${t.turno}</div>
                </div>
                <span style="font-size:.62rem;font-weight:700;padding:2px 7px;border-radius:20px;
                  background:${t.ativo?'var(--green-light)':'var(--surface)'};
                  color:${t.ativo?'var(--green)':'var(--muted)'};
                  border:1px solid ${t.ativo?'var(--green)':'var(--border)'}">
                  ${t.ativo?'Ativo':'Inativo'}
                </span>
              </div>
            </div>
            <div style="padding:10px 16px">
              <div style="font-size:.72rem;color:var(--muted);margin-bottom:7px">${t.itens.length} itens · ${t.itens.filter(i=>i.obrigatorio).length} obrigatórios</div>
              <div style="display:flex;flex-direction:column;gap:4px">
                ${t.itens.slice(0,3).map(i => `
                  <div style="display:flex;align-items:center;gap:7px;font-size:.72rem;color:var(--muted)">
                    <div style="width:5px;height:5px;border-radius:50%;background:${t.cor||'var(--border)'};flex-shrink:0"></div>
                    <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.texto}</span>
                  </div>`).join('')}
                ${t.itens.length > 3 ? `<div style="font-size:.68rem;color:var(--muted)">+${t.itens.length-3} mais...</div>` : ''}
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
// MODAIS
// ══════════════════════════════════════════════════════════════

// Modal: Atribuir checklist a usuário
function abrirModalNovaInstancia() { _modalAtribuir(null); }
function abrirModalNovaInstanciaUser(userId) { _modalAtribuir(userId); }

function _modalAtribuir(preUserId) {
  document.getElementById('popupCkAtribuir')?.remove();
  const tmpls = _getCkTemplates().filter(t => t.ativo);
  const hoje  = new Date().toISOString().slice(0,10);

  const popup = document.createElement('div');
  popup.id = 'popupCkAtribuir';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px';
  popup.innerHTML = `
    <div style="background:var(--surface);border-radius:var(--r14);width:100%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.25)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1.5px solid var(--border);background:var(--purple-xlight);border-radius:var(--r14) var(--r14) 0 0">
        <div style="font-size:.92rem;font-weight:800">${lc('user-check',15,'var(--purple)')} Atribuir Checklist</div>
        <button onclick="document.getElementById('popupCkAtribuir').remove()" style="background:none;border:none;cursor:pointer">${lc('x',18,'var(--muted)')}</button>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:12px">
        <div class="field" style="margin:0">
          <label>Funcionário *</label>
          <select id="ckAtribUser" class="inp">
            <option value="">Selecionar funcionário...</option>
            ${users.filter(u=>u.active!==false).map(u => `<option value="${u.id}" ${preUserId==u.id?'selected':''}>${u.name} (${u.role})</option>`).join('')}
          </select>
        </div>
        <div class="field" style="margin:0">
          <label>Template *</label>
          <select id="ckAtribTmpl" class="inp">
            <option value="">Selecionar template...</option>
            ${tmpls.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}
          </select>
        </div>
        <div class="f2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field" style="margin:0">
            <label>Data</label>
            <input type="date" id="ckAtribData" class="inp" value="${hoje}">
          </div>
          <div class="field" style="margin:0">
            <label>Turno</label>
            <select id="ckAtribTurno" class="inp">
              <option value="abertura">Abertura</option>
              <option value="producao">Produção</option>
              <option value="operacao">Operação</option>
              <option value="fechamento">Fechamento</option>
              <option value="diario">Diário</option>
            </select>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;padding:14px 20px;border-top:1px solid var(--border)">
        <button class="btn btn-outline" onclick="document.getElementById('popupCkAtribuir').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="salvarAtribuicaoCk()">Atribuir</button>
      </div>
    </div>`;
  document.body.appendChild(popup);
  popup.addEventListener('click', e => { if(e.target===popup) popup.remove(); });
}

function salvarAtribuicaoCk() {
  const userId   = parseInt(document.getElementById('ckAtribUser')?.value);
  const tmplId   = parseInt(document.getElementById('ckAtribTmpl')?.value);
  const data     = document.getElementById('ckAtribData')?.value;
  const turno    = document.getElementById('ckAtribTurno')?.value;
  const u        = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

  if (!userId) { toast('Selecione um funcionário','err'); return; }
  if (!tmplId) { toast('Selecione um template','err'); return; }
  if (!data)   { toast('Informe a data','err'); return; }

  const sessoes = _getCkSessoes();
  const novaId  = 'ck-' + Date.now();
  sessoes.push({
    id:          novaId,
    templateId:  tmplId,
    userId,
    data,
    turno,
    status:      'pendente',
    criadoPor:   u?.name||'Sistema',
    criadoEm:    new Date().toISOString(),
    respostas:   {},
    concluidoEm: null,
  });
  _saveCkSessoes(sessoes);
  document.getElementById('popupCkAtribuir')?.remove();
  renderChecklist();
  toast('Checklist atribuído!');
}

// Modal: Ver detalhe de uma instância
function verDetalheInstancia(instId) {
  const inst  = _getCkSessoes().find(s => s.id === instId);
  if (!inst) return;
  const tmpl  = _getCkTemplates().find(t => t.id === inst.templateId);
  if (!tmpl) return;
  const user  = users.find(u => u.id === inst.userId);
  const total = tmpl.itens.length;
  const feitos= Object.keys(inst.respostas||{}).length;

  const popup = document.createElement('div');
  popup.id = 'popupCkDetalhe';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:600;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto';
  popup.innerHTML = `
    <div style="background:var(--surface);border-radius:var(--r14);width:100%;max-width:520px;box-shadow:0 20px 60px rgba(0,0,0,.25);margin:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1.5px solid var(--border);background:${tmpl.bg||'var(--surface2)'};border-radius:var(--r14) var(--r14) 0 0">
        <div>
          <div style="font-size:.92rem;font-weight:800;color:${tmpl.cor||'var(--text)'}">${tmpl.nome}</div>
          <div style="font-size:.7rem;color:var(--muted);margin-top:2px">${user?.name||'?'} · ${inst.data} · ${inst.turno}</div>
        </div>
        <button onclick="document.getElementById('popupCkDetalhe').remove()" style="background:none;border:none;cursor:pointer">${lc('x',18,'var(--muted)')}</button>
      </div>
      <div style="padding:16px 20px;display:flex;flex-direction:column;gap:6px">
        ${tmpl.itens.map(item => {
          const resp = (inst.respostas||{})[item.id];
          const feito = !!resp;
          return `
          <div style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;border-radius:var(--r8);background:${feito?'var(--green-light)':'var(--surface2)'}">
            <div style="width:20px;height:20px;border-radius:5px;border:2px solid ${feito?'var(--green)':'var(--border)'};background:${feito?'var(--green)':'var(--surface)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px">
              ${feito?`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`:''}
            </div>
            <div style="flex:1">
              <div style="font-size:.78rem;font-weight:500;color:${feito?'var(--muted)':'var(--text)'};text-decoration:${feito?'line-through':'none'}">${item.texto}</div>
              <div style="display:flex;gap:8px;margin-top:2px">
                ${item.horario?`<span style="font-size:.62rem;color:var(--muted)">${item.horario}</span>`:''}
                ${feito && resp.hora ? `<span style="font-size:.62rem;color:var(--green)">✓ ${new Date(resp.hora).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span>` : ''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div style="padding:12px 20px;border-top:1px solid var(--border);background:var(--surface2);border-radius:0 0 var(--r14) var(--r14);display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:.76rem;color:var(--muted)">${feitos}/${total} itens concluídos</div>
        ${inst.concluidoEm ? `<div style="font-size:.72rem;font-weight:700;color:var(--green)">${lc('check-circle',12,'currentColor')} Finalizado às ${new Date(inst.concluidoEm).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>` : ''}
      </div>
    </div>`;
  document.body.appendChild(popup);
  popup.addEventListener('click', e => { if(e.target===popup) popup.remove(); });
}

// Modal: Editar template
function abrirModalNovoTemplate()      { _modalTemplate(null); }
function abrirModalEditarTemplate(id)  { _modalTemplate(id); }

function _modalTemplate(id) {
  const tmpls = _getCkTemplates();
  const tmpl  = id ? tmpls.find(t=>t.id===id) : null;

  const popup = document.createElement('div');
  popup.id = 'popupCkTemplate';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:600;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto';

  const cores = [
    {cor:'#DC2626',bg:'#FEF2F2',label:'Vermelho'},
    {cor:'#7C3AED',bg:'#EDE9FE',label:'Roxo'},
    {cor:'#059669',bg:'#ECFDF5',label:'Verde'},
    {cor:'#D97706',bg:'#FFFBEB',label:'Laranja'},
    {cor:'#2563EB',bg:'#EFF6FF',label:'Azul'},
  ];

  popup.innerHTML = `
    <div style="background:var(--surface);border-radius:var(--r14);width:100%;max-width:580px;box-shadow:0 20px 60px rgba(0,0,0,.3);margin:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1.5px solid var(--border);background:var(--purple-xlight);border-radius:var(--r14) var(--r14) 0 0">
        <div style="font-size:.92rem;font-weight:800">${id ? 'Editar' : 'Novo'} Template</div>
        <button onclick="document.getElementById('popupCkTemplate').remove()" style="background:none;border:none;cursor:pointer">${lc('x',18,'var(--muted)')}</button>
      </div>
      <div style="padding:20px;display:flex;flex-direction:column;gap:12px">
        <div class="f2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field" style="margin:0">
            <label>Nome do checklist *</label>
            <input type="text" id="tmplNome" class="inp" value="${tmpl?.nome||''}" placeholder="Ex: Pizzaiolo — Abertura">
          </div>
          <div class="field" style="margin:0">
            <label>Função</label>
            <select id="tmplFuncao" class="inp">
              ${['pizzaiolo','atendimento','preproducao','auxiliar','compras','gerencia','geral'].map(f =>
                `<option value="${f}" ${tmpl?.funcao===f?'selected':''}>${f}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="f2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="field" style="margin:0">
            <label>Turno</label>
            <select id="tmplTurno" class="inp">
              ${['abertura','producao','operacao','fechamento','diario','turno'].map(t =>
                `<option value="${t}" ${tmpl?.turno===t?'selected':''}>${t}</option>`
              ).join('')}
            </select>
          </div>
          <div class="field" style="margin:0">
            <label>Cor</label>
            <div style="display:flex;gap:6px;flex-wrap:wrap;padding-top:4px">
              ${cores.map(c => `
                <button onclick="document.getElementById('tmplCorSel').value='${c.cor}';document.getElementById('tmplBgSel').value='${c.bg}';document.querySelectorAll('.ck-cor-btn').forEach(b=>b.style.outline='none');this.style.outline='2px solid var(--purple)'"
                  class="ck-cor-btn"
                  style="width:24px;height:24px;border-radius:50%;border:none;background:${c.cor};cursor:pointer;${tmpl?.cor===c.cor?'outline:2px solid var(--purple)':''}">
                </button>`).join('')}
              <input type="hidden" id="tmplCorSel" value="${tmpl?.cor||'#DC2626'}">
              <input type="hidden" id="tmplBgSel" value="${tmpl?.bg||'#FEF2F2'}">
            </div>
          </div>
        </div>

        <!-- Itens -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <label style="font-size:.76rem;font-weight:600;color:var(--text2)">Itens do checklist</label>
            <button onclick="adicionarItemTemplate()" style="padding:4px 10px;border:1.5px solid var(--purple);border-radius:var(--r6);background:var(--surface);color:var(--purple);font-size:.7rem;font-weight:600;cursor:pointer">+ Item</button>
          </div>
          <div id="tmplItens" style="display:flex;flex-direction:column;gap:6px">
            ${(tmpl?.itens||[{id:1,texto:'',horario:'',obrigatorio:false}]).map((item,idx) => _rowItemTemplate(item,idx)).join('')}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--border)">
        <div>
          ${id ? `<button onclick="excluirTemplate(${id})" style="padding:7px 12px;border:1.5px solid var(--red);border-radius:var(--r8);background:var(--red-light);color:var(--red);font-size:.76rem;font-weight:600;cursor:pointer">Excluir</button>` : ''}
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-outline" onclick="document.getElementById('popupCkTemplate').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="salvarTemplate(${id||'null'})">Salvar</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(popup);
  popup.addEventListener('click', e => { if(e.target===popup) popup.remove(); });
}

let _tmplItemCounter = 100;

function _rowItemTemplate(item, idx) {
  return `
  <div id="tmplItem-${item.id}" style="display:flex;align-items:center;gap:7px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r8);padding:8px 10px">
    <input type="text" placeholder="Descreva a tarefa..." value="${item.texto||''}"
      data-item-id="${item.id}" data-field="texto"
      style="flex:1;padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.76rem">
    <input type="text" placeholder="Horário" value="${item.horario||''}"
      data-item-id="${item.id}" data-field="horario"
      style="width:80px;padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.72rem">
    <label style="display:flex;align-items:center;gap:4px;font-size:.68rem;white-space:nowrap;cursor:pointer">
      <input type="checkbox" ${item.obrigatorio?'checked':''} data-item-id="${item.id}" data-field="obrigatorio" style="accent-color:var(--red)"> Obrig.
    </label>
    <button onclick="removerItemTemplate(${item.id})"
      style="background:none;border:none;color:var(--muted);cursor:pointer;padding:2px;flex-shrink:0">${lc('x',14,'currentColor')}</button>
  </div>`;
}

function adicionarItemTemplate() {
  const wrap = document.getElementById('tmplItens');
  if (!wrap) return;
  _tmplItemCounter++;
  const novoItem = { id: _tmplItemCounter, texto:'', horario:'', obrigatorio:false };
  const div = document.createElement('div');
  div.innerHTML = _rowItemTemplate(novoItem, wrap.children.length);
  wrap.appendChild(div.firstElementChild);
}

function removerItemTemplate(itemId) {
  document.getElementById(`tmplItem-${itemId}`)?.remove();
}

function _coletarItensTemplate() {
  const wrap = document.getElementById('tmplItens');
  if (!wrap) return [];
  return [...wrap.querySelectorAll('[data-field="texto"]')].map(input => {
    const id = parseInt(input.dataset.itemId);
    const horEl  = wrap.querySelector(`[data-item-id="${id}"][data-field="horario"]`);
    const obrEl  = wrap.querySelector(`[data-item-id="${id}"][data-field="obrigatorio"]`);
    return {
      id,
      texto:       input.value.trim(),
      horario:     horEl?.value.trim()||'',
      obrigatorio: obrEl?.checked||false,
    };
  }).filter(i => i.texto);
}

function salvarTemplate(id) {
  const nome   = document.getElementById('tmplNome')?.value.trim();
  if (!nome) { toast('Informe o nome','err'); return; }
  const itens = _coletarItensTemplate();
  if (!itens.length) { toast('Adicione ao menos 1 item','err'); return; }

  const tmpls  = _getCkTemplates();
  const data   = {
    nome,
    funcao:  document.getElementById('tmplFuncao')?.value||'geral',
    turno:   document.getElementById('tmplTurno')?.value||'diario',
    cor:     document.getElementById('tmplCorSel')?.value||'#7C3AED',
    bg:      document.getElementById('tmplBgSel')?.value||'#EDE9FE',
    ativo:   true,
    itens,
  };

  if (id && id !== 'null') {
    const idx = tmpls.findIndex(t=>t.id===id);
    if (idx>=0) tmpls[idx] = { ...tmpls[idx], ...data };
    toast('Template atualizado!');
  } else {
    tmpls.push({ id: Math.max(0,...tmpls.map(t=>t.id)) + 1, ...data });
    toast('Template criado!');
  }
  _saveCkTemplates(tmpls);
  document.getElementById('popupCkTemplate')?.remove();
  renderChecklist();
}

function excluirTemplate(id) {
  if (!confirm('Excluir este template? As sessões existentes não serão afetadas.')) return;
  const tmpls = _getCkTemplates().filter(t=>t.id!==id);
  _saveCkTemplates(tmpls);
  document.getElementById('popupCkTemplate')?.remove();
  renderChecklist();
  toast('Template excluído.');
}
