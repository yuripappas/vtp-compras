/**
 * VTP Compras — Vai Ter Pizza!
 * compras.js — Módulo de Compras (v3)
 */

let _listaAtual = null;
let _comprasTab  = 'lista'; // 'lista' | 'historico'

// ══════════════════════════════════════════════════════════════
// RENDER PRINCIPAL
// ══════════════════════════════════════════════════════════════
function renderComprasModule() {
  _listaAtual = getListaAtiva();
  _renderDashCompras();
  if (_comprasTab === 'historico') {
    _renderHistorico();
  } else {
    _listaAtual ? _renderEtapa(_listaAtual.etapa) : _renderSemLista();
  }
}

function setComprasTab(tab) {
  _comprasTab = tab;
  renderComprasModule();
}

function _renderComprasTabs() {
  const el = document.getElementById('comprasTabs');
  if (!el) return;
  const tabs = [
    { id: 'lista',     label: 'Lista Ativa', icon: 'clipboard-list' },
    { id: 'historico', label: 'Histórico',   icon: 'clock'          },
  ];
  el.innerHTML = tabs.map(t => {
    const active = _comprasTab === t.id;
    return `<button onclick="setComprasTab('${t.id}')"
      style="display:flex;align-items:center;gap:6px;padding:8px 16px;border:none;
      border-bottom:2.5px solid ${active ? 'var(--purple)' : 'transparent'};
      background:none;color:${active ? 'var(--purple)' : 'var(--muted)'};
      font-size:.8rem;font-weight:${active ? '700' : '500'};cursor:pointer;
      font-family:Inter,sans-serif;transition:all .15s">
      ${lc(t.icon, 13, 'currentColor')} ${t.label}
    </button>`;
  }).join('');
}

function _renderSemLista() {
  document.getElementById('comprasContent').innerHTML = `
    <div style="text-align:center;padding:60px 24px">
      <div style="width:64px;height:64px;border-radius:50%;background:var(--purple-light);
        display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
        ${lc('shopping-cart', 28, 'var(--purple)')}
      </div>
      <div style="font-size:1.05rem;font-weight:800;margin-bottom:8px">Nenhuma lista ativa</div>
      <div style="font-size:.82rem;color:var(--muted);margin-bottom:24px;max-width:320px;margin-left:auto;margin-right:auto">
        Vá ao Estoque, adicione itens ao carrinho e clique em "Gerar Lista de Compras"
      </div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="goModule('estoque')">${lc('package', 14, '#fff')} Ir para o Estoque</button>
        <button class="btn btn-outline" onclick="setComprasTab('historico')">${lc('clock', 14, 'currentColor')} Ver histórico</button>
      </div>
    </div>`;
}

function _renderDashCompras() {
  const el = document.getElementById('comprasDash');
  if (!el) return;
  const la = _listaAtual;
  const st = la ? (STATUS_ETAPA[la.status] || {}) : null;

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:12px">
      <div style="flex:1;min-width:180px">
        ${la ? `
          <div style="font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted)">Lista ativa</div>
          <div style="font-size:.95rem;font-weight:800;color:var(--text)">${la.codigo}</div>
          <div style="font-size:.68rem;color:var(--muted)">Criada em ${fmtD(la.dataCriacao)} por ${la.criadoPor}</div>
        ` : `<div style="font-size:.88rem;font-weight:700">Compras</div><div style="font-size:.72rem;color:var(--muted)">Nenhuma lista ativa</div>`}
      </div>
      ${la ? `
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <div style="text-align:center;padding:6px 14px;background:var(--surface2);border-radius:var(--r8);border:1px solid var(--border)">
            <div style="font-size:.9rem;font-weight:800;color:var(--purple)">${la.itens.length}</div>
            <div style="font-size:.58rem;color:var(--muted);text-transform:uppercase">Itens</div>
          </div>
          <div style="text-align:center;padding:6px 14px;background:var(--surface2);border-radius:var(--r8);border:1px solid var(--border)">
            <div style="font-size:.88rem;font-weight:800;color:var(--purple)">R$${fmt(la.valorEstimado)}</div>
            <div style="font-size:.58rem;color:var(--muted);text-transform:uppercase">Estimado</div>
          </div>
          <div style="text-align:center;padding:6px 14px;background:${st.bg||'var(--surface2)'};border-radius:var(--r8);border:1px solid ${st.color||'var(--border)'}">
            <div style="font-size:.72rem;font-weight:700;color:${st.color||'var(--muted)'}">${st.label||la.status}</div>
            <div style="font-size:.58rem;color:var(--muted);text-transform:uppercase">Status</div>
          </div>
          <button class="btn btn-red btn-xs" onclick="encerrarListaManual()">${lc('x', 12)} Encerrar</button>
        </div>
      ` : ''}
    </div>
    <div id="comprasTabs" style="display:flex;border-bottom:1px solid var(--border);margin:-16px -24px 0;padding:0 24px;gap:4px"></div>
    ${la ? `
    <div style="margin-top:14px;display:flex;gap:3px">
      ${[{n:1,label:'Lista',icon:'clipboard-list'},{n:2,label:'Aprovação',icon:'check-circle'},{n:3,label:'Ordem',icon:'shopping-bag'},{n:4,label:'Recebimento',icon:'package'}].map(s => {
        const done = la.etapa > s.n, cur = la.etapa === s.n;
        return `<div style="flex:1;text-align:center;cursor:${done?'pointer':'default'}" ${done?`onclick="_renderEtapa(${s.n})"`:''}>
          <div style="height:3px;border-radius:2px;background:${done?'var(--green)':cur?'var(--purple)':'var(--border)'};margin-bottom:5px"></div>
          <div style="font-size:.58rem;font-weight:600;color:${done?'var(--green)':cur?'var(--purple)':'var(--muted)'};display:flex;align-items:center;justify-content:center;gap:3px">
            ${lc(s.icon, 11, 'currentColor')} ${s.n}. ${s.label}
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}`;

  _renderComprasTabs();
}

function _renderEtapa(n) {
  _comprasTab = 'lista';
  if (!_listaAtual) { _renderSemLista(); return; }
  if (n === 1) _renderEtapa1();
  else if (n === 2) _renderEtapa2();
  else if (n === 3) _renderEtapa3();
  else if (n === 4) _renderEtapa4();
}

// ══════════════════════════════════════════════════════════════
// ETAPA 1 — LISTA COM AUTO-FORNECEDORES
// ══════════════════════════════════════════════════════════════
function _renderEtapa1() {
  const l = _listaAtual;
  l.etapa = 1;
  saveListas();

  // AUTO-POPULATE: para cada item com fornecedor padrão cadastrado,
  // adiciona cotação automaticamente se ainda não tiver
  l.itens.forEach(i => {
    if (!i.cotacoes) i.cotacoes = [];
    // fornecedorId padrão do insumo no cadastro
    const itemCad = items.find(x => x.id === i.itemId);
    const supPadrao = itemCad?.supId;
    if (supPadrao && !i.cotacoes.some(c => c.supId === supPadrao)) {
      i.cotacoes.push({ supId: supPadrao, precoUnit: null, respondido: false, prazo: '', pagamento: '' });
    }
  });
  saveListas();

  const prazoHtml = l.prazoCotacao ? `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 14px;background:var(--yellow-light);
      border:1.5px solid var(--yellow);border-radius:var(--r8);font-size:.76rem;margin-bottom:14px">
      ${lc('clock', 14, 'var(--orange-dark)')}
      <span>Prazo: <strong>${fmtDT(l.prazoCotacao)}</strong></span>
      <span id="timer1" style="font-weight:800;color:var(--orange-dark);margin-left:4px"></span>
      <button onclick="abrirPrazoCotacao()"
        style="margin-left:auto;background:none;border:1px solid var(--yellow);border-radius:var(--r6);
        padding:2px 8px;font-size:.68rem;color:var(--orange-dark);cursor:pointer">
        ${lc('edit-2', 11, 'currentColor')} Alterar
      </button>
    </div>` : '';

  document.getElementById('comprasContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="font-size:.96rem;font-weight:800;margin-bottom:3px">${lc('clipboard-list', 14, 'var(--purple)')} Lista · ${l.codigo}</h3>
        <div style="font-size:.71rem;color:var(--muted)">${l.itens.length} itens · R$${fmt(l.valorEstimado)} estimado</div>
      </div>
      <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap">
        ${['montagem','cotacao','cotacao_encerrada'].map(s => {
          const st = STATUS_ETAPA[s]; const isActive = l.status === s;
          return `<button onclick="setStatusLista('${s}')"
            style="padding:4px 10px;border-radius:20px;font-size:.68rem;font-weight:600;
            border:1.5px solid ${isActive?st.color:'var(--border)'};
            background:${isActive?st.bg:'var(--surface)'};color:${isActive?st.color:'var(--muted)'};cursor:pointer">${st.label}</button>`;
        }).join('')}
        <div style="width:1px;height:20px;background:var(--border)"></div>
        <button class="btn btn-outline btn-sm" onclick="abrirPrazoCotacao()">${lc('clock', 13, 'currentColor')} Prazo</button>
        <button class="btn btn-wa btn-sm" onclick="enviarTodasCotacoesWA()">${lc('message-circle', 13, '#fff')} Cotar WA</button>
      </div>
    </div>
    ${prazoHtml}
    <div class="card" style="margin-bottom:16px;overflow:hidden">
      <div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--surface2)">
        <button onclick="abrirAddItemManual()"
          style="display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:var(--r8);
          border:1.5px solid var(--purple);background:white;color:var(--purple);font-size:.76rem;font-weight:700;cursor:pointer">
          ${lc('plus', 13, 'var(--purple)')} Adicionar item
        </button>
        <div style="font-size:.67rem;color:var(--muted)">${lc('info', 12, 'var(--muted)')} Fornecedores cadastrados já foram adicionados automaticamente</div>
      </div>
      <div class="tbl-wrap" style="border:none">
        <table>
          <thead><tr>
            <th style="min-width:180px">Item</th>
            <th class="c" style="width:88px">Qtd</th>
            <th class="c" style="width:48px">Un.</th>
            <th class="r" style="width:110px">Estimado</th>
            <th style="min-width:210px">Fornecedores / Cotações</th>
            <th class="c" style="width:32px"></th>
          </tr></thead>
          <tbody>${l.itens.map(i => _rowsItem(i)).join('')}</tbody>
          <tfoot>
            <tr style="background:var(--purple-xlight)">
              <td colspan="3" style="padding:10px 14px;font-weight:700;font-size:.82rem">Total estimado</td>
              <td class="r" style="padding:10px 14px;font-weight:800;font-size:.9rem;color:var(--purple)" id="totalEstimado">R$ ${fmt(l.valorEstimado)}</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div class="field" style="margin-bottom:20px">
      <label>Observações gerais</label>
      <textarea class="inp" rows="2" placeholder="Condições de pagamento, urgência..." onchange="setObsLista(this.value)">${l.observacoes||''}</textarea>
    </div>
    <div style="display:flex;justify-content:flex-end">
      <button class="btn btn-primary" onclick="avancarParaAprovacao()" style="padding:11px 28px;font-size:.86rem">
        Enviar para aprovação ${lc('arrow-right', 14, '#fff')}
      </button>
    </div>`;

  if (l.prazoCotacao) _startTimer('timer1', l.prazoCotacao);
}

function _rowsItem(i) {
  const cotacoes = i.cotacoes || [];
  const melhor   = _melhorCotacao(cotacoes);

  const mainRow = `<tr id="item1-${i.id}" style="background:var(--surface);border-bottom:${cotacoes.length?'none':'1px solid var(--border)'}">
    <td style="padding:10px 14px">
      <div style="font-size:.83rem;font-weight:700">${i.nome}</div>
      <div style="font-size:.63rem;color:var(--muted);margin-top:2px">
        ${lc(i.origem==='manual'?'edit-2':'package',11,'var(--muted)')} ${i.categoria}${i.origem==='manual'?' · Manual':''}
      </div>
    </td>
    <td class="c">
      <input type="number" value="${i.qtdSelecionada}" min="0.001" step="0.001"
        style="width:74px;padding:4px 6px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.78rem;text-align:center;font-family:monospace"
        onchange="setItemQtd1(${i.id},this.value)">
    </td>
    <td class="c" style="font-size:.74rem;color:var(--muted)">${i.unidade}</td>
    <td class="r" style="padding-right:14px">
      <div style="font-size:.74rem;font-family:monospace;font-weight:600">R$ ${fmt(i.qtdSelecionada*(i.precoUnitEstimado||0))}</div>
      <div style="font-size:.6rem;color:var(--muted)">R$${fmt(i.precoUnitEstimado||0)}/${i.unidade}</div>
    </td>
    <td style="padding:8px 12px">
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
        ${cotacoes.length===0?`<span style="font-size:.7rem;color:var(--muted);font-style:italic">Sem fornecedor — compra presencial</span>`:''}
        <button onclick="abrirAddFornecedor(${i.id})"
          style="display:flex;align-items:center;gap:3px;padding:3px 9px;border-radius:20px;
          border:1.5px dashed var(--purple);background:transparent;color:var(--purple);font-size:.68rem;font-weight:600;cursor:pointer">
          ${lc('plus',12,'var(--purple)')} Fornecedor
        </button>
      </div>
    </td>
    <td class="c">
      <button onclick="removerItem1(${i.id})" style="background:none;border:none;color:var(--muted);cursor:pointer;padding:4px">
        ${lc('trash-2',13,'currentColor')}
      </button>
    </td>
  </tr>`;

  const subRows = cotacoes.map((cot, idx) => {
    const sup    = suppliers.find(s => s.id === cot.supId);
    const isBest = melhor?.supId === cot.supId;
    const total  = cot.precoUnit ? i.qtdSelecionada * cot.precoUnit : null;
    return `<tr style="background:${isBest&&cot.respondido?'var(--green-light)':'var(--surface2)'};border-bottom:1px solid var(--border)">
      <td style="padding:6px 14px 6px 28px">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:6px;height:6px;border-radius:50%;background:${cot.respondido?'var(--green)':'var(--muted)'};flex-shrink:0"></div>
          <span style="font-size:.76rem;font-weight:600;color:${isBest&&cot.respondido?'var(--green)':'var(--text2)'}">${sup?.name||'—'}</span>
          ${isBest&&cot.respondido?`<span style="font-size:.58rem;font-weight:700;color:var(--green);background:var(--green-light);padding:1px 6px;border-radius:10px;border:1px solid var(--green)">Melhor</span>`:''}
        </div>
        ${sup?.phone?`<div style="font-size:.6rem;color:var(--muted);margin-top:1px;margin-left:12px">${sup.phone}</div>`:''}
      </td>
      <td colspan="2" class="c">
        <label style="display:flex;align-items:center;gap:5px;justify-content:center;cursor:pointer;font-size:.68rem;white-space:nowrap">
          <input type="checkbox" ${cot.respondido?'checked':''} onchange="marcarRespondido(${i.id},${idx},this.checked)" style="accent-color:var(--green);width:14px;height:14px">
          ${cot.respondido?'Respondeu':'Aguardando'}
        </label>
      </td>
      <td class="r" style="padding-right:14px">
        ${cot.respondido&&cot.precoUnit?`
          <div style="font-size:.86rem;font-weight:800;color:${isBest?'var(--green)':'var(--text)'};font-family:monospace">R$ ${fmt(total||0)}</div>
          <div style="font-size:.6rem;color:var(--muted)">R$${fmt(cot.precoUnit)}/${i.unidade}</div>
        `:`
          <div style="position:relative;display:inline-flex;align-items:center">
            <span style="position:absolute;left:7px;font-size:.65rem;color:var(--muted)">R$</span>
            <input type="number" value="${cot.precoUnit||''}" min="0" step="0.01" placeholder="0,00"
              style="width:96px;padding:4px 6px 4px 24px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.8rem;text-align:right;font-family:monospace"
              onchange="setCotacaoPreco(${i.id},${idx},this.value)">
          </div>
        `}
      </td>
      <td style="padding:6px 10px">
        ${sup?.phone?`
          <a href="https://wa.me/55${(sup.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(_montaMsgCotacaoForn(sup,i))}" target="_blank"
            style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#25D366;color:#fff;text-decoration:none">
            ${lc('message-circle',13,'#fff')}
          </a>
        `:''}
      </td>
      <td class="c">
        <button onclick="removerCotacao(${i.id},${idx})" style="background:none;border:none;color:var(--muted);cursor:pointer;padding:4px">
          ${lc('x',12,'currentColor')}
        </button>
      </td>
    </tr>`;
  }).join('');

  return mainRow + subRows;
}

function _melhorCotacao(cotacoes) {
  const resp = cotacoes.filter(c => c.respondido && c.precoUnit > 0);
  if (!resp.length) return null;
  return resp.reduce((b,c) => c.precoUnit < b.precoUnit ? c : b);
}

// Mensagem WA com link de formulário de cotação
function _montaMsgCotacaoForn(sup, item) {
  const l = _listaAtual;
  const itensForn = l.itens.filter(i => (i.cotacoes||[]).some(c => c.supId === sup.id));
  const linhas = itensForn.map(i => `• ${i.nome}: ${fmt(i.qtdSelecionada)} ${i.unidade}`).join('\n');
  const prazo  = l.prazoCotacao ? `\nPrazo: ${fmtDT(l.prazoCotacao)}` : '';
  // Link de formulário de resposta (Google Forms ou página interna futura)
  const formLink = `\n\n📋 *Preencha sua cotação aqui:*\nhttps://docs.google.com/forms/d/e/FORMULARIO_VTP/viewform?usp=pp_url&entry.codigo=${encodeURIComponent(l.codigo)}&entry.fornecedor=${encodeURIComponent(sup.name)}`;
  return `Olá ${sup.seller||sup.name}!\n\n*Vai Ter Pizza!* solicita cotação (${l.codigo}):\n\n${linhas}${prazo}\n\nPor favor informe:\n• Valor unitário de cada item\n• Prazo de entrega\n• Forma de pagamento\n• Prazo de pagamento${formLink}\n\nObrigado!`;
}

function abrirAddFornecedor(itemId) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  if (!i.cotacoes) i.cotacoes = [];
  const jaAdicionados = new Set(i.cotacoes.map(c => c.supId));
  const disponiveis   = suppliers.filter(s => !jaAdicionados.has(s.id));
  if (!disponiveis.length) { toast('Todos os fornecedores já adicionados', 'info'); return; }
  const popup = document.createElement('div');
  popup.id = 'popupForn';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px';
  popup.innerHTML = `
    <div style="background:white;border-radius:var(--r14);padding:22px;width:100%;max-width:340px;box-shadow:0 12px 40px rgba(0,0,0,.2)">
      <div style="font-size:.9rem;font-weight:800;margin-bottom:14px">${lc('building-2',15,'var(--purple)')} Adicionar fornecedor</div>
      <div style="font-size:.74rem;color:var(--muted);margin-bottom:10px;font-weight:600">${i.nome}</div>
      <select id="selFornPop" class="inp" style="margin-bottom:16px">
        <option value="">Selecionar fornecedor...</option>
        ${disponiveis.map(s=>`<option value="${s.id}">${s.name}${s.phone?'':' ⚠️ sem tel'}</option>`).join('')}
      </select>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-outline" onclick="document.getElementById('popupForn').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarAddFornecedor(${itemId})">Adicionar</button>
      </div>
    </div>`;
  document.body.appendChild(popup);
}

function confirmarAddFornecedor(itemId) {
  const supId = parseInt(document.getElementById('selFornPop')?.value);
  if (!supId) { toast('Selecione um fornecedor', 'err'); return; }
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  if (!i.cotacoes) i.cotacoes = [];
  i.cotacoes.push({ supId, precoUnit: null, respondido: false, prazo: '', pagamento: '' });
  saveListas();
  document.getElementById('popupForn')?.remove();
  _renderEtapa1();
  toast('Fornecedor adicionado!');
}

function removerCotacao(itemId, idx) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (i?.cotacoes) { i.cotacoes.splice(idx,1); saveListas(); _renderEtapa1(); }
}

function marcarRespondido(itemId, idx, checked) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i?.cotacoes?.[idx]) return;
  i.cotacoes[idx].respondido = checked;
  saveListas(); _renderEtapa1();
}

function setCotacaoPreco(itemId, idx, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i?.cotacoes?.[idx]) return;
  const v = parseFloat(val);
  i.cotacoes[idx].precoUnit = !isNaN(v)&&v>0 ? v : null;
  if (i.cotacoes[idx].precoUnit) i.cotacoes[idx].respondido = true;
  saveListas(); _renderEtapa1();
}

function enviarTodasCotacoesWA() {
  if (!_listaAtual) return;
  const l = _listaAtual;
  const bySup = {};
  l.itens.forEach(i => {
    (i.cotacoes||[]).forEach(cot => {
      const sup = suppliers.find(s => s.id === cot.supId);
      if (!sup?.phone) return;
      if (!bySup[cot.supId]) bySup[cot.supId] = { sup };
      bySup[cot.supId].sup = sup;
    });
  });
  const sups = Object.values(bySup);
  if (!sups.length) { toast('Nenhum fornecedor com telefone cadastrado', 'err'); return; }
  sups.forEach(({ sup }) => {
    window.open('https://wa.me/55'+sup.phone.replace(/\D/g,'')+'?text='+encodeURIComponent(_montaMsgCotacaoForn(sup,null)),'_blank');
  });
  l.status = 'cotacao'; saveListas(); _renderDashCompras(); _renderEtapa1();
  toast(`${sups.length} mensagem(ns) enviada(s)!`);
}

function setItemQtd1(itemId, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  const v = parseFloat(val);
  if (!isNaN(v)&&v>0) i.qtdSelecionada = v;
  _recalcEstimativa(); saveListas();
  const el = document.getElementById('totalEstimado');
  if (el) el.textContent = 'R$ '+fmt(_listaAtual.valorEstimado);
}

function removerItem1(itemId) {
  _listaAtual.itens = _listaAtual.itens.filter(x => x.id !== itemId);
  _recalcEstimativa(); saveListas(); _renderEtapa1();
}

function setObsLista(val) { if (_listaAtual) { _listaAtual.observacoes = val; saveListas(); } }

function setStatusLista(status) {
  if (!_listaAtual) return;
  _listaAtual.status = status; saveListas(); _renderEtapa1(); _renderDashCompras();
}

function _recalcEstimativa() {
  if (!_listaAtual) return;
  _listaAtual.valorEstimado = _listaAtual.itens.reduce((s,i) => s+i.qtdSelecionada*(i.precoUnitEstimado||0), 0);
}

function abrirAddItemManual() {
  document.getElementById('ovAddItem').classList.add('open');
  ['aiNome','aiQtd','aiPreco','aiObs','aiLocal'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  const u = document.getElementById('aiUnit'); if (u) u.value='un';
}

function saveItemManual() {
  const nome = document.getElementById('aiNome').value.trim();
  const qtd  = parseFloat(document.getElementById('aiQtd').value);
  if (!nome) { toast('Informe o nome do item','err'); return; }
  if (isNaN(qtd)||qtd<=0) { toast('Informe a quantidade','err'); return; }
  const localEl = document.getElementById('aiLocal');
  const newId = Math.max(0,..._listaAtual.itens.map(x=>x.id))+1;
  _listaAtual.itens.push({
    id:newId, itemId:null, nome,
    categoria: document.getElementById('aiCat')?.value||'Geral',
    unidade:   document.getElementById('aiUnit')?.value||'un',
    qtdSugerida:qtd, qtdSelecionada:qtd,
    qtdAprovada:null, qtdComprada:null, qtdRecebida:null,
    estoqueAtual:0, estoqueMinimo:0, estoqueIdeal:0,
    origem:'manual', tipoCompra: localEl?.value?'presencial':'fornecedor',
    fornecedorId:null, localCompra:localEl?.value||'', diaCompra:'', responsavelCompra:'',
    precoUnitEstimado: parseFloat(document.getElementById('aiPreco')?.value)||0,
    precoUnitFinal:null, valorTotal:0, statusItem:'pendente',
    observacoes: document.getElementById('aiObs')?.value||'',
    cotacoes:[], aprovado:null, comentarioAprovador:'',
    conferido:false, divergencia:false, comentarioConferencia:'',
    conferidoPor:'', dataRecebimento:'', horaRecebimento:'',
  });
  _recalcEstimativa(); saveListas(); closeModal('ovAddItem'); _renderEtapa1();
  toast('Item adicionado!');
}

function abrirPrazoCotacao() {
  document.getElementById('popupPrazo')?.remove();
  const atual  = _listaAtual.prazoCotacao ? new Date(_listaAtual.prazoCotacao) : null;
  const dataVal = atual ? atual.toISOString().slice(0,10) : '';
  const horaVal = atual ? `${String(atual.getHours()).padStart(2,'0')}:00` : '18:00';
  const horas   = Array.from({length:18},(_,i)=>`${String(i+6).padStart(2,'0')}:00`);
  const popup = document.createElement('div');
  popup.id = 'popupPrazo';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px';
  popup.innerHTML = `
    <div style="background:white;border-radius:var(--r14);padding:22px;width:100%;max-width:340px;box-shadow:0 12px 40px rgba(0,0,0,.2)">
      <div style="font-size:.9rem;font-weight:800;margin-bottom:16px">${lc('clock',15,'var(--purple)')} Prazo de cotação</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        <div class="field" style="margin:0"><label>Data</label><input type="date" id="prazoData" class="inp" value="${dataVal}"></div>
        <div class="field" style="margin:0"><label>Horário</label>
          <select id="prazoHora" class="inp">
            ${horas.map(h=>`<option value="${h}" ${h===horaVal?'selected':''}>${h}</option>`).join('')}
          </select>
        </div>
      </div>
      ${atual?`<button onclick="limparPrazo()" style="width:100%;padding:6px;border:1.5px solid var(--red);border-radius:var(--r6);background:var(--red-light);color:var(--red);font-size:.74rem;font-weight:600;cursor:pointer;margin-bottom:10px">${lc('x',12,'currentColor')} Remover prazo</button>`:''}
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-outline" onclick="document.getElementById('popupPrazo').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="salvarPrazo()">Salvar</button>
      </div>
    </div>`;
  document.body.appendChild(popup);
}

function salvarPrazo() {
  const data = document.getElementById('prazoData')?.value;
  const hora = document.getElementById('prazoHora')?.value;
  if (!data) { toast('Selecione a data','err'); return; }
  _listaAtual.prazoCotacao = new Date(`${data}T${hora}:00`).toISOString();
  saveListas(); document.getElementById('popupPrazo')?.remove(); _renderEtapa1(); toast('Prazo definido!');
}

function limparPrazo() {
  _listaAtual.prazoCotacao = null; saveListas();
  document.getElementById('popupPrazo')?.remove(); _renderEtapa1(); toast('Prazo removido.');
}

function avancarParaAprovacao() {
  if (!_listaAtual) return;
  _listaAtual.itens.forEach(i => { if (!i.cotacoes?.length) i.tipoCompra='presencial'; });
  _listaAtual.itens.forEach(i => {
    if (i.cotacoes?.length) {
      const melhor = _melhorCotacao(i.cotacoes);
      if (melhor) { i.precoUnitFinal=melhor.precoUnit; i.fornecedorId=melhor.supId; i.tipoCompra='fornecedor'; }
    }
  });
  _listaAtual.etapa=2; _listaAtual.status='aguard_aprovacao'; saveListas();
  _renderDashCompras(); _renderEtapa2(); toast('Lista enviada para aprovação!');
}

// ══════════════════════════════════════════════════════════════
// ETAPA 2 — APROVAÇÃO
// ══════════════════════════════════════════════════════════════
function _renderEtapa2() {
  const l = _listaAtual;
  const itensForn       = l.itens.filter(i => i.tipoCompra!=='presencial');
  const itensPresencial = l.itens.filter(i => i.tipoCompra==='presencial');
  const totalGeral      = l.itens.reduce((s,i)=>s+(i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0),0);
  const pendentes       = l.itens.filter(i=>i.aprovado===null).length;
  const aprovados       = l.itens.filter(i=>i.aprovado===true).length;
  const reprovados      = l.itens.filter(i=>i.aprovado===false).length;
  const todoRespondido  = pendentes===0;
  const apWa = l.aprovadorWa ? `https://wa.me/55${l.aprovadorWa.replace(/\D/g,'')}?text=${encodeURIComponent(`Lista ${l.codigo} aguardando sua aprovação no sistema Vai Ter Pizza!`)}` : null;

  document.getElementById('comprasContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="font-size:.96rem;font-weight:800;margin-bottom:3px">${lc('check-circle',14,'var(--green)')} Aprovação · ${l.codigo}</h3>
        <div style="font-size:.71rem;color:var(--muted)">${l.aprovadorNome?`Aprovador: <strong>${l.aprovadorNome}</strong>`:'Revise e aprove cada item'}</div>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-outline btn-sm" onclick="_renderEtapa1()">${lc('arrow-left',13)} Voltar</button>
        <button class="btn btn-outline btn-sm" onclick="abrirConfigAprovador()">${lc('user',13)} Aprovador</button>
        ${apWa?`<a href="${apWa}" target="_blank" class="btn btn-wa btn-sm">${lc('message-circle',13,'#fff')} Notificar</a>`:''}
        <button class="btn btn-red btn-sm" onclick="reprovarLista()">${lc('x',12)} Reprovar tudo</button>
        <button class="btn btn-primary btn-sm" onclick="aprovarLista()" ${!todoRespondido?'disabled style="opacity:.5;cursor:not-allowed"':''}>
          ${lc('check-circle',13,'#fff')} Aprovar lista
        </button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-bottom:16px">
      <div style="background:var(--purple-xlight);border:1.5px solid var(--purple-light);border-radius:var(--r10);padding:10px 14px;text-align:center">
        <div style="font-size:1.05rem;font-weight:800;color:var(--purple)">R$${fmt(totalGeral)}</div>
        <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Total</div>
      </div>
      <div style="background:var(--green-light);border:1.5px solid var(--green);border-radius:var(--r10);padding:10px 14px;text-align:center">
        <div style="font-size:1.05rem;font-weight:800;color:var(--green)">${aprovados}</div>
        <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Aprovados</div>
      </div>
      <div style="background:var(--red-light);border:1.5px solid var(--red);border-radius:var(--r10);padding:10px 14px;text-align:center">
        <div style="font-size:1.05rem;font-weight:800;color:var(--red)">${reprovados}</div>
        <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Reprovados</div>
      </div>
      <div style="background:var(--surface2);border:1.5px solid ${pendentes>0?'var(--yellow)':'var(--border)'};border-radius:var(--r10);padding:10px 14px;text-align:center">
        <div style="font-size:1.05rem;font-weight:800;color:${pendentes>0?'var(--orange-dark)':'var(--green)'}">${pendentes}</div>
        <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Pendentes</div>
      </div>
    </div>
    ${!todoRespondido?`<div style="display:flex;align-items:center;gap:8px;padding:9px 14px;background:var(--yellow-light);border:1.5px solid var(--yellow);border-radius:var(--r8);margin-bottom:14px;font-size:.74rem;color:var(--orange-dark);font-weight:600">${lc('alert-triangle',14,'var(--yellow)')} Responda todos os itens para habilitar a aprovação</div>`:''}
    ${itensForn.length?`<div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:8px">${lc('building-2',12,'var(--muted)')} Compras via Fornecedor</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">${itensForn.map(i=>_cardAprovacaoItem(i,false)).join('')}</div>`:''}
    ${itensPresencial.length?`<div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:8px">${lc('shopping-cart',12,'var(--muted)')} Compra Presencial</div><div style="background:var(--orange-light);border:1.5px solid var(--border);border-radius:var(--r8);padding:9px 12px;margin-bottom:8px;font-size:.72rem;color:var(--orange-dark)">${lc('info',12,'var(--orange-dark)')} Itens sem fornecedor — aprovação por orçamento máximo.</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">${itensPresencial.map(i=>_cardAprovacaoItem(i,true)).join('')}</div>`:''}`;
}

function _cardAprovacaoItem(i, isPresencial) {
  const sup=suppliers.find(s=>s.id===i.fornecedorId);
  const qtd=i.qtdAprovada??i.qtdSelecionada;
  const preco=i.precoUnitFinal||i.precoUnitEstimado||0;
  const total=qtd*preco;
  const isAprov=i.aprovado===true, isReprov=i.aprovado===false;
  return `<div style="border:1.5px solid ${isAprov?'var(--green)':isReprov?'var(--red)':'var(--border)'};border-radius:var(--r10);background:${isAprov?'var(--green-light)':isReprov?'var(--red-light)':'var(--surface)'};overflow:hidden;transition:all .2s">
    <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;flex-wrap:wrap">
      <div style="width:4px;align-self:stretch;background:${isAprov?'var(--green)':isReprov?'var(--red)':'var(--border)'};border-radius:2px;flex-shrink:0"></div>
      <div style="flex:1;min-width:140px">
        <div style="font-size:.84rem;font-weight:700">${i.nome}</div>
        <div style="font-size:.66rem;color:var(--muted);margin-top:2px">${isPresencial?`${lc('shopping-cart',11,'var(--muted)')} Compra presencial`:`${lc('building-2',11,'var(--muted)')} ${sup?.name||'Fornecedor'}`}</div>
      </div>
      <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div style="text-align:center"><div style="font-size:.58rem;color:var(--muted);text-transform:uppercase">Qtd</div><div style="font-size:.82rem;font-weight:700;font-family:monospace">${fmt(qtd)} ${i.unidade}</div></div>
        <div style="text-align:center"><div style="font-size:.58rem;color:var(--muted);text-transform:uppercase">${isPresencial?'Orç. máx.':'Preço unit.'}</div><div style="font-size:.82rem;font-weight:700;font-family:monospace;color:${isPresencial?'var(--orange-dark)':'var(--text)'}">R$ ${fmt(preco)}</div></div>
        <div style="text-align:center"><div style="font-size:.58rem;color:var(--muted);text-transform:uppercase">Total</div><div style="font-size:.88rem;font-weight:800;color:var(--purple);font-family:monospace">R$ ${fmt(total)}</div></div>
        <div style="display:flex;gap:5px">
          <button onclick="aprovarItem2(${i.id})" style="padding:6px 13px;border-radius:var(--r8);border:1.5px solid ${isAprov?'var(--green)':'var(--border)'};background:${isAprov?'var(--green)':'var(--surface)'};color:${isAprov?'#fff':'var(--text2)'};font-size:.72rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px">${lc('check',12,'currentColor')} Aprovar</button>
          <button onclick="reprovarItem2(${i.id})" style="padding:6px 13px;border-radius:var(--r8);border:1.5px solid ${isReprov?'var(--red)':'var(--border)'};background:${isReprov?'var(--red)':'var(--surface)'};color:${isReprov?'#fff':'var(--text2)'};font-size:.72rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px">${lc('x',12,'currentColor')} Reprovar</button>
        </div>
      </div>
    </div>
    <div style="padding:0 14px 10px 20px">
      <input type="text" placeholder="Comentário do aprovador..." value="${i.comentarioAprovador||''}"
        style="width:100%;padding:5px 9px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.72rem;background:var(--surface)"
        onchange="setComentarioAprovador(${i.id},this.value)">
    </div>
  </div>`;
}

function abrirConfigAprovador() {
  document.getElementById('popupAprovador')?.remove();
  const l=_listaAtual;
  const popup=document.createElement('div');
  popup.id='popupAprovador';
  popup.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px';
  popup.innerHTML=`<div style="background:white;border-radius:var(--r14);padding:22px;width:100%;max-width:340px;box-shadow:0 12px 40px rgba(0,0,0,.2)">
    <div style="font-size:.9rem;font-weight:800;margin-bottom:14px">${lc('user',15,'var(--purple)')} Configurar aprovador</div>
    <div class="field"><label>Nome do aprovador</label><input type="text" id="apNome" class="inp" placeholder="Ex: João (Gerente)" value="${l.aprovadorNome||''}"></div>
    <div class="field"><label>WhatsApp do aprovador</label><input type="tel" id="apWa" class="inp" placeholder="Ex: 11999990000" value="${l.aprovadorWa||''}"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
      <button class="btn btn-outline" onclick="document.getElementById('popupAprovador').remove()">Cancelar</button>
      <button class="btn btn-primary" onclick="salvarAprovador()">Salvar</button>
    </div>
  </div>`;
  document.body.appendChild(popup);
}

function salvarAprovador() {
  _listaAtual.aprovadorNome=document.getElementById('apNome')?.value.trim()||'';
  _listaAtual.aprovadorWa=document.getElementById('apWa')?.value.replace(/\D/g,'')||'';
  saveListas(); document.getElementById('popupAprovador')?.remove(); _renderEtapa2(); toast('Aprovador configurado!');
}

function aprovarItem2(itemId) { const i=_listaAtual.itens.find(x=>x.id===itemId); if(i){i.aprovado=true;saveListas();_renderEtapa2();} }
function reprovarItem2(itemId) { const i=_listaAtual.itens.find(x=>x.id===itemId); if(i){i.aprovado=false;saveListas();_renderEtapa2();} }
function setComentarioAprovador(itemId,val) { const i=_listaAtual.itens.find(x=>x.id===itemId); if(i){i.comentarioAprovador=val;saveListas();} }
function setQtdAprovada(itemId,val) { const i=_listaAtual.itens.find(x=>x.id===itemId); if(!i)return; const v=parseFloat(val); i.qtdAprovada=!isNaN(v)&&v>=0?v:i.qtdSelecionada; saveListas(); }

function aprovarLista() {
  _listaAtual.itens.forEach(i=>{if(i.aprovado===null)i.aprovado=true;});
  _listaAtual.itens=_listaAtual.itens.filter(i=>i.aprovado!==false);
  _listaAtual.status='aprovada'; _listaAtual.etapa=3;
  _listaAtual.dataAprovacao=new Date().toISOString();
  _listaAtual.valorAprovado=_listaAtual.itens.reduce((s,i)=>s+(i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0),0);
  saveListas(); _renderDashCompras(); _renderEtapa3(); toast('Lista aprovada!');
}

function reprovarLista() {
  if(!confirm('Reprovar toda a lista? Ela voltará para montagem.')) return;
  _listaAtual.status='reprovada'; _listaAtual.etapa=1; saveListas();
  _renderDashCompras(); _renderEtapa1(); toast('Lista reprovada. Revise e reenvie.');
}

// ══════════════════════════════════════════════════════════════
// ETAPA 3 — ORDEM DE COMPRA
// ══════════════════════════════════════════════════════════════
function _renderEtapa3() {
  const l=_listaAtual;
  const itensPresencial=l.itens.filter(i=>i.tipoCompra==='presencial');
  const itensForn=l.itens.filter(i=>i.tipoCompra!=='presencial');
  const bySup={};
  itensForn.forEach(i=>{const k=i.fornecedorId||0; if(!bySup[k])bySup[k]=[]; bySup[k].push(i);});

  document.getElementById('comprasContent').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="font-size:.96rem;font-weight:800;margin-bottom:3px">${lc('shopping-bag',14,'var(--purple)')} Ordem de Compra · ${l.codigo}</h3>
        <div style="font-size:.71rem;color:var(--muted)">Total aprovado: <strong style="color:var(--purple)">R$ ${fmt(l.valorAprovado)}</strong></div>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="_renderEtapa2()">${lc('arrow-left',13)} Aprovação</button>
        <button class="btn btn-primary btn-sm" onclick="avancarParaRecebimento()">Recebimento ${lc('arrow-right',13,'#fff')}</button>
      </div>
    </div>
    ${Object.entries(bySup).map(([supId,itens],idx)=>{
      const sup=parseInt(supId)?suppliers.find(s=>s.id===parseInt(supId)):null;
      const total=itens.reduce((s,i)=>s+(i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0),0);
      const ocText=_montaOCText(sup,itens,l);
      const stOC=itens[0]?.statusOC||'pendente';
      const stOCC={pendente:'var(--muted)',enviada:'var(--yellow)',confirmada:'var(--green)'};
      const stOCL={pendente:'Não enviada',enviada:'Enviada',confirmada:'Confirmada'};
      return `<div class="card" style="margin-bottom:14px;overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--purple-xlight);border-bottom:1.5px solid var(--purple-light);flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:.88rem;font-weight:800;color:var(--purple)">${sup?.name||'⚠️ Fornecedor não definido'}</div>
            ${sup?.seller?`<div style="font-size:.67rem;color:var(--muted);margin-top:1px">${lc('user',11,'var(--muted)')} ${sup.seller}</div>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:.67rem;font-weight:700;color:${stOCC[stOC]};padding:3px 8px;border-radius:20px;border:1px solid ${stOCC[stOC]};background:white">
              ${lc(stOC==='confirmada'?'check-circle':stOC==='enviada'?'send':'clock',11,'currentColor')} ${stOCL[stOC]}
            </span>
            <div style="font-size:.96rem;font-weight:800;color:var(--purple)">R$ ${fmt(total)}</div>
            <button class="btn btn-outline btn-xs" onclick="copiarOC3(${idx})">${lc('copy',12)} Copiar</button>
            ${sup?.phone?`<a href="https://wa.me/55${(sup.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(ocText)}" target="_blank" onclick="marcarOCEnviada(${idx})" class="btn btn-wa btn-xs">${lc('send',12,'#fff')} Enviar OC</a>`:''}
          </div>
        </div>
        ${itens.map((i,iIdx)=>`<div style="display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid var(--border);background:${iIdx%2===0?'var(--surface)':'var(--surface2)'}">
          <div style="flex:1"><div style="font-size:.8rem;font-weight:600">${i.nome}</div><div style="font-size:.62rem;color:var(--muted)">${i.categoria}</div></div>
          <div style="font-size:.76rem;font-family:monospace;color:var(--muted)">${fmt(i.qtdAprovada??i.qtdSelecionada)} ${i.unidade}</div>
          <div style="font-size:.8rem;font-weight:700;font-family:monospace;color:var(--purple)">R$ ${fmt((i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0))}</div>
        </div>`).join('')}
      </div>`;
    }).join('')}
    ${itensPresencial.length?`<div class="card" style="margin-bottom:14px;overflow:hidden">
      <div style="padding:12px 16px;background:var(--orange-light);border-bottom:1.5px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div><div style="font-size:.88rem;font-weight:800;color:var(--orange-dark)">${lc('shopping-cart',14,'var(--orange-dark)')} Compra Presencial</div></div>
        <button class="btn btn-outline btn-xs" onclick="imprimirListaPresencial()">${lc('printer',12)} Imprimir lista</button>
      </div>
      ${itensPresencial.map((i,idx)=>`<div style="padding:12px 16px;border-bottom:1px solid var(--border);background:${idx%2===0?'var(--surface)':'var(--surface2)'}">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
          <div style="flex:1"><div style="font-size:.82rem;font-weight:600">${i.nome}</div></div>
          <div style="font-size:.76rem;font-family:monospace">${fmt(i.qtdAprovada??i.qtdSelecionada)} ${i.unidade}</div>
          <div style="font-size:.72rem;color:var(--orange-dark);font-weight:700">Teto: R$ ${fmt((i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitEstimado||0))}</div>
        </div>
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:8px">
          <input type="text" placeholder="Local de compra..." value="${i.localCompra||''}" style="padding:5px 9px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.74rem" onchange="setSuperCampo(${i.id},'localCompra',this.value)">
          <input type="text" placeholder="Responsável" value="${i.responsavelCompra||''}" style="padding:5px 9px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.74rem" onchange="setSuperCampo(${i.id},'responsavelCompra',this.value)">
        </div>
      </div>`).join('')}
    </div>`:''}`;

  window._ocBySup=Object.entries(bySup).map(([supId,itens])=>({sup:parseInt(supId)?suppliers.find(s=>s.id===parseInt(supId)):null,itens}));
}

function marcarOCEnviada(idx) { const e=window._ocBySup?.[idx]; if(e) { e.itens.forEach(i=>{i.statusOC='enviada';}); saveListas(); } }
function _montaOCText(sup,itens,l) {
  const linhas=itens.map(i=>`• ${i.nome}: ${fmt(i.qtdAprovada??i.qtdSelecionada)} ${i.unidade} × R$${fmt(i.precoUnitFinal||i.precoUnitEstimado||0)} = R$${fmt((i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0))}`).join('\n');
  const total=itens.reduce((s,i)=>s+(i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0),0);
  return `Olá ${sup?.seller||sup?.name||''}!\n\nSegue Ordem de Compra ${l.codigo}:\n\n${linhas}\n\nTotal: R$${fmt(total)}\n\nObrigado!`;
}
function copiarOC3(idx) { const e=window._ocBySup?.[idx]; if(!e)return; navigator.clipboard.writeText(_montaOCText(e.sup,e.itens,_listaAtual)).then(()=>toast('OC copiada!','info')); }
function setSuperCampo(itemId,campo,val) { const i=_listaAtual.itens.find(x=>x.id===itemId); if(i){i[campo]=val;saveListas();} }

function imprimirListaPresencial() {
  const l=_listaAtual; const itens=l.itens.filter(i=>i.tipoCompra==='presencial'); const cfg=getConfig();
  const win=window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lista Presencial ${l.codigo}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:12px;padding:20px}h1{font-size:16px;margin-bottom:4px}.sub{color:#666;font-size:11px;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{background:#f0f0f0;padding:7px 10px;text-align:left;font-size:11px;border:1px solid #ddd}td{padding:8px 10px;border:1px solid #ddd;font-size:12px;vertical-align:top}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:20px;font-size:11px;color:#666;border-top:1px dashed #ccc;padding-top:12px}@media print{body{padding:0}}</style></head><body>
    <h1>${cfg.empresa||'Vai Ter Pizza!'} — Lista de Compra Presencial</h1>
    <div class="sub">Código: ${l.codigo} · Data: ${fmtD(new Date().toISOString())} · ${itens.length} itens</div>
    <table><thead><tr><th>#</th><th>Item</th><th>Qtd</th><th>Un.</th><th>Local sugerido</th><th>Teto (R$)</th><th>Obs.</th></tr></thead><tbody>
    ${itens.map((i,idx)=>`<tr><td>${idx+1}</td><td><strong>${i.nome}</strong><br><small style="color:#888">${i.categoria}</small></td><td style="text-align:center">${fmt(i.qtdAprovada??i.qtdSelecionada)}</td><td style="text-align:center">${i.unidade}</td><td>${i.localCompra||'—'}</td><td style="text-align:right">R$ ${fmt((i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitEstimado||0))}</td><td>${i.observacoes||''}</td></tr>`).join('')}
    </tbody></table>
    <div class="footer">Responsável: ${l.itens.find(i=>i.responsavelCompra)?.responsavelCompra||'_____________________'} &nbsp;&nbsp;&nbsp; Assinatura: _____________________</div>
    </body></html>`);
  win.document.close(); win.print();
}

function avancarParaRecebimento() {
  _listaAtual.etapa=4; _listaAtual.status='recebimento';
  if (!_listaAtual.dataRecebimento) _listaAtual.dataRecebimento=new Date().toISOString().slice(0,10);
  // Pré-preenche conferidoPor com o nome do usuário logado
  if (!_listaAtual.conferidoPor) {
    const u = typeof getCurrentUser==='function' ? getCurrentUser() : null;
    _listaAtual.conferidoPor = u?.name || '';
  }
  saveListas(); _renderDashCompras(); _renderEtapa4(); toast('Avançado para recebimento!');
}

// ══════════════════════════════════════════════════════════════
// ETAPA 4 — RECEBIMENTO AGRUPADO POR FORNECEDOR
// ══════════════════════════════════════════════════════════════
function _renderEtapa4() {
  const l=_listaAtual;
  const total=l.itens.length;
  const conferidos=l.itens.filter(i=>i.conferido).length;
  const pct=total>0?Math.round(conferidos/total*100):0;
  const tudo=conferidos===total;
  const horas=Array.from({length:18},(_,i)=>`${String(i+6).padStart(2,'0')}:00`);

  // Agrupa por fornecedor
  const bySup={};
  l.itens.forEach(i=>{
    const k=i.tipoCompra==='presencial'?'presencial':(i.fornecedorId||'0');
    if(!bySup[k]) bySup[k]=[];
    bySup[k].push(i);
  });

  document.getElementById('comprasContent').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="font-size:.96rem;font-weight:800;margin-bottom:3px">${lc('package',14,'var(--purple)')} Recebimento · ${l.codigo}</h3>
        <div style="font-size:.71rem;color:var(--muted)">${conferidos} de ${total} itens conferidos</div>
      </div>
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="_renderEtapa3()">${lc('arrow-left',13)} OC</button>
        <button class="btn btn-primary btn-sm" onclick="concluirLista()" ${!tudo?'disabled style="opacity:.5;cursor:not-allowed"':''}>
          ${lc('check-circle',13,'#fff')} Concluir lista
        </button>
      </div>
    </div>

    <!-- Progresso -->
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:.72rem;color:var(--muted)">Progresso</span>
        <span style="font-size:.72rem;font-weight:700;color:${pct===100?'var(--green)':'var(--purple)'}">${pct}%</span>
      </div>
      <div style="height:7px;background:var(--border);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${pct===100?'var(--green)':'var(--purple)'};border-radius:4px;transition:width .4s"></div>
      </div>
    </div>

    <!-- Dados globais -->
    <div style="background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--r10);padding:14px;margin-bottom:16px">
      <div style="font-size:.69rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:10px">${lc('clipboard-list',12,'var(--muted)')} Dados do recebimento</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
        <div class="field" style="margin:0"><label>Quem conferiu</label>
          <input type="text" class="inp" placeholder="Nome do conferente" value="${l.conferidoPor||''}" onchange="_setRecGlobal('conferidoPor',this.value)">
        </div>
        <div class="field" style="margin:0"><label>Data</label>
          <input type="date" class="inp" value="${l.dataRecebimento||new Date().toISOString().slice(0,10)}" onchange="_setRecGlobal('dataRecebimento',this.value)">
        </div>
        <div class="field" style="margin:0"><label>Horário</label>
          <select class="inp" onchange="_setRecGlobal('horaRecebimento',this.value)">
            ${horas.map(h=>`<option value="${h}" ${l.horaRecebimento===h?'selected':''}>${h}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Itens agrupados por fornecedor -->
    ${Object.entries(bySup).map(([supKey, itensGrupo])=>{
      const isPresencial = supKey==='presencial';
      const sup = !isPresencial&&parseInt(supKey) ? suppliers.find(s=>s.id===parseInt(supKey)) : null;
      const grupoConferidos = itensGrupo.filter(i=>i.conferido).length;
      const grupoTotal = itensGrupo.length;
      const grupoOk = grupoConferidos===grupoTotal;

      return `<div class="card" style="margin-bottom:14px;overflow:hidden">
        <!-- Cabeçalho do grupo -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;
          background:${isPresencial?'var(--orange-light)':'var(--purple-xlight)'};
          border-bottom:1.5px solid ${isPresencial?'var(--border)':'var(--purple-light)'};flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:.86rem;font-weight:800;color:${isPresencial?'var(--orange-dark)':'var(--purple)'}">
              ${isPresencial?`${lc('shopping-cart',13,'var(--orange-dark)')} Compra Presencial`:`${lc('building-2',13,'var(--purple)')} ${sup?.name||'Fornecedor'}`}
            </div>
            ${sup?.seller?`<div style="font-size:.66rem;color:var(--muted)">${lc('user',10,'var(--muted)')} ${sup.seller}</div>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:.7rem;font-weight:700;color:${grupoOk?'var(--green)':'var(--muted)'}">
              ${lc(grupoOk?'check-circle':'clock',12,'currentColor')} ${grupoConferidos}/${grupoTotal} conferidos
            </span>
            <button onclick="_conferirTodoGrupo('${supKey}')"
              style="padding:4px 10px;border-radius:var(--r6);border:1.5px solid var(--green);background:var(--green-light);color:var(--green);font-size:.68rem;font-weight:600;cursor:pointer">
              ${lc('check-check',11,'currentColor')} Conferir todos
            </button>
          </div>
        </div>
        <!-- Itens do grupo -->
        ${itensGrupo.map(i=>{
          const qtdS=i.qtdAprovada??i.qtdSelecionada;
          const qtdR=i.qtdRecebida??null;
          const diff=qtdR!==null?qtdR-qtdS:null;
          const isOk=i.conferido&&!i.divergencia;
          const isDivg=i.conferido&&i.divergencia;
          return `<div style="border-bottom:1px solid var(--border);background:${isOk?'var(--green-light)':isDivg?'var(--yellow-light)':'var(--surface)'}">
            <div style="display:flex;align-items:center;gap:12px;padding:10px 16px;flex-wrap:wrap">
              <div style="width:4px;align-self:stretch;background:${isOk?'var(--green)':isDivg?'var(--yellow)':'var(--border)'};border-radius:2px;flex-shrink:0"></div>
              <div style="flex:1;min-width:120px">
                <div style="font-size:.84rem;font-weight:700">${i.nome}</div>
                <div style="font-size:.62rem;color:var(--muted)">${i.categoria}</div>
              </div>
              <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                <div style="text-align:center">
                  <div style="font-size:.58rem;color:var(--muted);text-transform:uppercase">Pedido</div>
                  <div style="font-size:.82rem;font-weight:700;font-family:monospace">${fmt(qtdS)} ${i.unidade}</div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:.58rem;color:var(--muted);text-transform:uppercase">Recebido</div>
                  <input type="number" value="${qtdR??''}" min="0" step="0.001" placeholder="${fmt(qtdS)}"
                    style="width:72px;padding:4px 6px;border:1.5px solid ${diff!==null&&diff<0?'var(--red)':'var(--border)'};border-radius:var(--r6);font-size:.78rem;text-align:center;font-family:monospace"
                    onchange="setQtdRecebida(${i.id},this.value)">
                </div>
                ${diff!==null?`<div style="text-align:center">
                  <div style="font-size:.58rem;color:var(--muted);text-transform:uppercase">Diferença</div>
                  <div style="font-size:.82rem;font-weight:700;font-family:monospace;color:${diff<0?'var(--red)':diff>0?'var(--yellow)':'var(--green)'}">${diff>0?'+':''}${fmt(diff)}</div>
                </div>`:''}
                <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:.76rem;font-weight:600;white-space:nowrap">
                  <input type="checkbox" ${i.conferido?'checked':''} style="accent-color:var(--green);width:16px;height:16px" onchange="marcarConferido(${i.id},this.checked)">
                  Conferido
                </label>
              </div>
            </div>
            <div style="padding:0 16px 8px 32px">
              <input type="text" placeholder="Obs. de conferência..." value="${i.comentarioConferencia||''}"
                style="width:100%;padding:4px 8px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.71rem;background:var(--surface)"
                onchange="setComentarioConferencia(${i.id},this.value)">
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }).join('')}`;
}

function _conferirTodoGrupo(supKey) {
  const l=_listaAtual;
  l.itens.forEach(i=>{
    const k=i.tipoCompra==='presencial'?'presencial':(i.fornecedorId||'0');
    if(String(k)!==String(supKey)) return;
    if(!i.conferido) {
      i.conferido=true;
      if(i.qtdRecebida===null) i.qtdRecebida=i.qtdAprovada??i.qtdSelecionada;
    }
  });
  saveListas(); _renderEtapa4();
}

function _setRecGlobal(campo,val) { if(_listaAtual){_listaAtual[campo]=val;saveListas();} }

function setQtdRecebida(itemId,val) {
  const i=_listaAtual.itens.find(x=>x.id===itemId); if(!i) return;
  const v=parseFloat(val); const qtdS=i.qtdAprovada??i.qtdSelecionada;
  i.qtdRecebida=!isNaN(v)?parseFloat(v.toFixed(3)):null;
  i.divergencia=i.qtdRecebida!==null&&Math.abs(i.qtdRecebida-qtdS)>0.001;
  saveListas();
}

function marcarConferido(itemId,checked) {
  const i=_listaAtual.itens.find(x=>x.id===itemId); if(!i) return;
  i.conferido=checked;
  if(checked&&i.qtdRecebida===null) i.qtdRecebida=i.qtdAprovada??i.qtdSelecionada;
  saveListas(); _renderEtapa4();
}

function setComentarioConferencia(itemId,val) { const i=_listaAtual.itens.find(x=>x.id===itemId); if(i){i.comentarioConferencia=val;saveListas();} }

function concluirLista() {
  if(!_listaAtual) return;
  _listaAtual.itens.forEach(i=>{
    if(!i.itemId) return;
    const item=items.find(x=>x.id===i.itemId); if(!item) return;
    if(i.qtdRecebida!==null) item.qty=parseFloat((item.qty+i.qtdRecebida).toFixed(3));
    if(i.precoUnitFinal) item.cost=i.precoUnitFinal;
  });
  saveI();
  _listaAtual.status='concluida';
  _listaAtual.dataConclusao=new Date().toISOString();
  _listaAtual.valorFinal=_listaAtual.itens.reduce((s,i)=>s+(i.qtdRecebida??0)*(i.precoUnitFinal||i.precoUnitEstimado||0),0);
  saveListas();

  const economia=Math.max(0,(_listaAtual.valorEstimado||0)-(_listaAtual.valorFinal||0));
  const bySup={};
  _listaAtual.itens.forEach(i=>{const k=i.fornecedorId||0;if(!bySup[k])bySup[k]=[];bySup[k].push(i);});
  cycleHistory.push({
    id:_listaAtual.codigo, date:_listaAtual.dataConclusao,
    items:_listaAtual.itens.length, sups:Object.keys(bySup).filter(k=>k!=='0').length,
    total:_listaAtual.valorFinal, economia, listaId:_listaAtual.id,
    etapas:{criacao:_listaAtual.dataCriacao,aprovacao:_listaAtual.dataAprovacao||null,conclusao:_listaAtual.dataConclusao},
    conferidoPor:_listaAtual.conferidoPor||'', dataRecebimento:_listaAtual.dataRecebimento||'', horaRecebimento:_listaAtual.horaRecebimento||'',
  });
  localStorage.setItem('vtp_cycle_history',JSON.stringify(cycleHistory));

  _listaAtual=getListaAtiva();
  // Vai direto para o histórico ao concluir
  _comprasTab='historico';
  renderDashboard();
  renderComprasModule();
  toast('Lista concluída! Estoque atualizado.');
}

// ══════════════════════════════════════════════════════════════
// HISTÓRICO — com filtro de período e auditoria
// ══════════════════════════════════════════════════════════════
function _renderHistorico() {
  const busca  = (document.getElementById('histBusca')?.value||'').toLowerCase();
  const filtro =  document.getElementById('histFiltro')?.value||'';
  const de     =  document.getElementById('histDe')?.value||'';
  const ate    =  document.getElementById('histAte')?.value||'';

  const hist=[...listas]
    .sort((a,b)=>new Date(b.dataCriacao||0)-new Date(a.dataCriacao||0))
    .filter(l=>{
      if (filtro && l.status!==filtro) return false;
      if (busca && !l.codigo.toLowerCase().includes(busca)) return false;
      if (de) { const d=(l.dataCriacao||'').slice(0,10); if(d<de) return false; }
      if (ate) { const d=(l.dataCriacao||'').slice(0,10); if(d>ate) return false; }
      return true;
    });

  document.getElementById('comprasContent').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="font-size:.96rem;font-weight:800;margin-bottom:3px">${lc('clock',14,'var(--purple)')} Histórico de Compras</h3>
        <div style="font-size:.71rem;color:var(--muted)">${hist.length} lista(s) encontrada(s)</div>
      </div>
    </div>

    <!-- Filtros -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:flex-end">
      <div style="flex:1;min-width:140px;max-width:220px">
        <div style="font-size:.68rem;color:var(--muted);margin-bottom:3px;font-weight:600">Buscar</div>
        <input type="text" id="histBusca" class="inp" placeholder="Código da lista..." value="${busca}" oninput="_renderHistorico()">
      </div>
      <div>
        <div style="font-size:.68rem;color:var(--muted);margin-bottom:3px;font-weight:600">De</div>
        <input type="date" id="histDe" class="inp" value="${de}" onchange="_renderHistorico()" style="max-width:150px">
      </div>
      <div>
        <div style="font-size:.68rem;color:var(--muted);margin-bottom:3px;font-weight:600">Até</div>
        <input type="date" id="histAte" class="inp" value="${ate}" onchange="_renderHistorico()" style="max-width:150px">
      </div>
      <div>
        <div style="font-size:.68rem;color:var(--muted);margin-bottom:3px;font-weight:600">Status</div>
        <select id="histFiltro" class="inp" style="max-width:170px" onchange="_renderHistorico()">
          <option value="">Todos</option>
          ${Object.entries(STATUS_ETAPA).map(([k,v])=>`<option value="${k}" ${filtro===k?'selected':''}>${v.label}</option>`).join('')}
        </select>
      </div>
      ${(busca||de||ate||filtro)?`<button class="btn btn-outline btn-sm" onclick="_limparFiltrosHist()">${lc('x',12)} Limpar</button>`:''}
    </div>

    ${hist.length===0?`<div class="empty" style="padding:40px"><div class="empty-icon">${lc('clock',24,'var(--muted)')}</div>Nenhuma lista encontrada.</div>`
    :hist.map(l=>_cardHistorico(l)).join('')}`;
}

function _limparFiltrosHist() {
  ['histBusca','histDe','histAte'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const s=document.getElementById('histFiltro'); if(s) s.value='';
  _renderHistorico();
}

function _cardHistorico(l) {
  const st=STATUS_ETAPA[l.status]||{label:l.status,color:'var(--muted)',bg:'var(--surface2)'};
  const its=l.itens||[];
  const itensForn=its.filter(i=>i.tipoCompra!=='presencial');
  const itensPresencial=its.filter(i=>i.tipoCompra==='presencial');
  const bySup={};
  itensForn.forEach(i=>{const k=i.fornecedorId||0;if(!bySup[k])bySup[k]=[];bySup[k].push(i);});
  const numSups=Object.keys(bySup).filter(k=>k!=='0').length;
  const isOpen=l.status!=='concluida';

  const etapas=[
    {label:'Criação',icon:'file-plus',data:l.dataCriacao},
    {label:'Cotação',icon:'message-circle',data:l.etapa>=2?l.dataCriacao:null},
    {label:'Aprovação',icon:'check-circle',data:l.dataAprovacao},
    {label:'Ordem',icon:'shopping-bag',data:l.etapa>=3?(l.dataAprovacao||null):null},
    {label:'Concluído',icon:'package',data:l.dataConclusao},
  ];

  return `<div class="card" style="margin-bottom:12px;overflow:hidden">
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--surface2);border-bottom:1px solid var(--border);flex-wrap:wrap">
      <div style="flex:1;min-width:140px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:.9rem;font-weight:800">${l.codigo}</span>
          <span style="font-size:.67rem;font-weight:700;padding:2px 8px;border-radius:20px;background:${st.bg};color:${st.color};border:1px solid ${st.color}">${st.label}</span>
        </div>
        <div style="font-size:.66rem;color:var(--muted);margin-top:3px">
          Criada em ${fmtD(l.dataCriacao)} por ${l.criadoPor}
          ${l.conferidoPor?` · Conferida por <strong>${l.conferidoPor}</strong>`:''}
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div style="text-align:center;padding:4px 10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r6)">
          <div style="font-size:.82rem;font-weight:800;color:var(--purple)">${its.length}</div>
          <div style="font-size:.54rem;color:var(--muted);text-transform:uppercase">Itens</div>
        </div>
        <div style="text-align:center;padding:4px 10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r6)">
          <div style="font-size:.82rem;font-weight:800;color:var(--purple)">${numSups}</div>
          <div style="font-size:.54rem;color:var(--muted);text-transform:uppercase">Fornec.</div>
        </div>
        <div style="text-align:center;padding:4px 10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r6)">
          <div style="font-size:.82rem;font-weight:800;color:${l.status==='concluida'?'var(--green)':'var(--purple)'}">R$${fmt(l.valorFinal||l.valorEstimado||0)}</div>
          <div style="font-size:.54rem;color:var(--muted);text-transform:uppercase">${l.status==='concluida'?'Final':'Estimado'}</div>
        </div>
        ${isOpen?`<button class="btn btn-outline btn-xs" onclick="_reabrirLista(${l.id})">${lc('external-link',11)} Abrir</button>`:''}
        <button class="btn btn-outline btn-xs" onclick="abrirAuditoria(${l.id})">${lc('search',11)} Auditoria</button>
      </div>
    </div>

    <!-- Timeline -->
    <div style="padding:14px 16px;background:var(--surface)">
      <div style="position:relative;display:flex;align-items:flex-start">
        <div style="position:absolute;top:11px;left:12px;right:12px;height:2px;background:var(--border);z-index:0"></div>
        ${etapas.map((e,idx)=>{
          const done=!!e.data; const cur=!done&&idx===etapas.filter(x=>!!x.data).length;
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;position:relative;z-index:1">
            <div style="width:22px;height:22px;border-radius:50%;background:${done?'var(--green)':cur?'var(--purple)':'var(--border)'};border:2px solid ${done?'var(--green)':cur?'var(--purple)':'var(--border)'};display:flex;align-items:center;justify-content:center;margin-bottom:5px">
              ${lc(e.icon,10,done||cur?'#fff':'var(--muted)')}
            </div>
            <div style="font-size:.58rem;font-weight:600;color:${done?'var(--green)':cur?'var(--purple)':'var(--muted)'};text-align:center;line-height:1.3">${e.label}</div>
            ${done&&e.data?`<div style="font-size:.54rem;color:var(--muted);text-align:center">${fmtD(e.data)}</div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>

    ${numSups>0||itensPresencial.length>0?`
    <div style="padding:7px 16px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;gap:5px;align-items:center">
      ${numSups>0?`<span style="font-size:.6rem;color:var(--muted)">${lc('building-2',10,'var(--muted)')} Fornecedores:</span>`:''}
      ${Object.keys(bySup).filter(k=>k!=='0').map(k=>{const s=suppliers.find(x=>x.id===parseInt(k));return s?`<span class="badge b-purple" style="font-size:.58rem">${s.name}</span>`:''}).join('')}
      ${itensPresencial.length?`<span class="badge b-orange" style="font-size:.58rem">${lc('shopping-cart',9,'currentColor')} ${itensPresencial.length} presencial</span>`:''}
    </div>`:''}

    ${l.conferidoPor||l.dataRecebimento?`
    <div style="padding:6px 16px;border-top:1px solid var(--border);background:var(--surface2);display:flex;gap:12px;flex-wrap:wrap;font-size:.65rem;color:var(--muted);align-items:center">
      ${l.conferidoPor?`${lc('user',10,'currentColor')} Conferido por <strong>${l.conferidoPor}</strong>`:''}
      ${l.dataRecebimento?`${lc('calendar',10,'currentColor')} ${fmtD(l.dataRecebimento)} ${l.horaRecebimento||''}`:''}
    </div>`:''}
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// AUDITORIA — modal completo de uma lista
// ══════════════════════════════════════════════════════════════
function abrirAuditoria(listaId) {
  const l = listas.find(x=>x.id===listaId);
  if (!l) return;
  document.getElementById('popupAuditoria')?.remove();

  const st = STATUS_ETAPA[l.status]||{label:l.status,color:'var(--muted)',bg:'var(--surface2)'};
  const itensForn = (l.itens||[]).filter(i=>i.tipoCompra!=='presencial');
  const itensPresencial = (l.itens||[]).filter(i=>i.tipoCompra==='presencial');
  const bySup={};
  itensForn.forEach(i=>{const k=i.fornecedorId||0;if(!bySup[k])bySup[k]=[];bySup[k].push(i);});

  const popup=document.createElement('div');
  popup.id='popupAuditoria';
  popup.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:600;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto';

  popup.innerHTML=`
    <div style="background:var(--surface);border-radius:var(--r14);width:100%;max-width:720px;box-shadow:0 20px 60px rgba(0,0,0,.3);margin:auto">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1.5px solid var(--border);background:var(--purple-xlight);border-radius:var(--r14) var(--r14) 0 0">
        <div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:1rem;font-weight:800">${lc('search',16,'var(--purple)')} Auditoria · ${l.codigo}</span>
            <span style="font-size:.68rem;font-weight:700;padding:3px 10px;border-radius:20px;background:${st.bg};color:${st.color};border:1px solid ${st.color}">${st.label}</span>
          </div>
          <div style="font-size:.72rem;color:var(--muted);margin-top:3px">Criada em ${fmtD(l.dataCriacao)} por <strong>${l.criadoPor}</strong></div>
        </div>
        <button onclick="document.getElementById('popupAuditoria').remove()"
          style="background:none;border:none;cursor:pointer;padding:6px;border-radius:var(--r6);color:var(--muted)">
          ${lc('x',18,'currentColor')}
        </button>
      </div>

      <div style="padding:20px 22px;display:flex;flex-direction:column;gap:20px">

        <!-- Resumo geral -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px">
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r8);padding:10px 14px;text-align:center">
            <div style="font-size:.96rem;font-weight:800;color:var(--purple)">${(l.itens||[]).length}</div>
            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Itens total</div>
          </div>
          <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r8);padding:10px 14px;text-align:center">
            <div style="font-size:.96rem;font-weight:800;color:var(--purple)">R$${fmt(l.valorEstimado||0)}</div>
            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Estimado</div>
          </div>
          ${l.valorAprovado!=null?`<div style="background:var(--green-light);border:1px solid var(--green);border-radius:var(--r8);padding:10px 14px;text-align:center">
            <div style="font-size:.96rem;font-weight:800;color:var(--green)">R$${fmt(l.valorAprovado)}</div>
            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Aprovado</div>
          </div>`:''}
          ${l.valorFinal!=null?`<div style="background:var(--purple-xlight);border:1px solid var(--purple-light);border-radius:var(--r8);padding:10px 14px;text-align:center">
            <div style="font-size:.96rem;font-weight:800;color:var(--purple)">R$${fmt(l.valorFinal)}</div>
            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Final</div>
          </div>`:''}
        </div>

        <!-- Linha do tempo detalhada -->
        <div>
          <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:10px">${lc('clock',12,'var(--muted)')} Linha do Tempo</div>
          <div style="display:flex;flex-direction:column;gap:0">
            ${[
              {icon:'file-plus',label:'Lista criada',data:l.dataCriacao,detalhe:`por ${l.criadoPor}`,cor:'var(--purple)'},
              {icon:'message-circle',label:'Cotação enviada',data:l.etapa>=2?l.dataCriacao:null,detalhe:`${Object.keys(bySup).filter(k=>k!=='0').length} fornecedor(es) cotado(s)`,cor:'var(--yellow)'},
              {icon:'check-circle',label:'Aprovação',data:l.dataAprovacao,detalhe:l.aprovadorNome?`por ${l.aprovadorNome}`:'',cor:'var(--green)'},
              {icon:'shopping-bag',label:'Ordem de compra',data:l.etapa>=3?(l.dataAprovacao||null):null,detalhe:'',cor:'var(--purple)'},
              {icon:'package',label:'Recebimento concluído',data:l.dataConclusao,detalhe:`${l.conferidoPor?'Conferido por '+l.conferidoPor:''} ${l.dataRecebimento?'· '+fmtD(l.dataRecebimento)+' '+( l.horaRecebimento||''):''}`.trim(),cor:'var(--green)'},
            ].map((e,idx,arr)=>{
              const done=!!e.data;
              return `<div style="display:flex;gap:14px;align-items:flex-start">
                <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0">
                  <div style="width:28px;height:28px;border-radius:50%;background:${done?e.cor:'var(--border)'};display:flex;align-items:center;justify-content:center">
                    ${lc(e.icon,13,done?'#fff':'var(--muted)')}
                  </div>
                  ${idx<arr.length-1?`<div style="width:2px;height:28px;background:${done?e.cor:'var(--border)'}"></div>`:''}
                </div>
                <div style="padding-bottom:${idx<arr.length-1?'0':'0'}px;padding-top:3px">
                  <div style="font-size:.82rem;font-weight:${done?'700':'500'};color:${done?'var(--text)':'var(--muted)'}">${e.label}</div>
                  ${done&&e.data?`<div style="font-size:.68rem;color:var(--muted)">${fmtDT(e.data)}${e.detalhe?' · '+e.detalhe:''}</div>`:`<div style="font-size:.68rem;color:var(--muted)">Não realizado</div>`}
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Aprovador -->
        ${l.aprovadorNome?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r8);padding:10px 14px">
          <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:6px">${lc('user',11,'var(--muted)')} Aprovador</div>
          <div style="font-size:.84rem;font-weight:700">${l.aprovadorNome}</div>
          ${l.aprovadorWa?`<div style="font-size:.7rem;color:var(--muted)">${lc('message-circle',11,'currentColor')} ${l.aprovadorWa}</div>`:''}
        </div>`:''}

        <!-- Itens por fornecedor -->
        ${Object.entries(bySup).map(([supId,itens])=>{
          const sup=parseInt(supId)?suppliers.find(s=>s.id===parseInt(supId)):null;
          const total=itens.reduce((s,i)=>s+(i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0),0);
          const totalRecebido=itens.reduce((s,i)=>s+(i.qtdRecebida??0)*(i.precoUnitFinal||i.precoUnitEstimado||0),0);
          return `<div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <div style="font-size:.78rem;font-weight:700;color:var(--purple);display:flex;align-items:center;gap:6px">
                ${lc('building-2',13,'var(--purple)')} ${sup?.name||'Fornecedor não definido'}
                ${sup?.seller?`<span style="font-size:.66rem;color:var(--muted);font-weight:400">· ${sup.seller}</span>`:''}
              </div>
              <div style="font-size:.76rem;font-weight:700;color:var(--purple)">R$${fmt(total)}</div>
            </div>
            <div style="border:1px solid var(--border);border-radius:var(--r8);overflow:hidden">
              <table style="width:100%;border-collapse:collapse">
                <thead><tr style="background:var(--surface2)">
                  <th style="padding:7px 12px;text-align:left;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Item</th>
                  <th style="padding:7px 12px;text-align:center;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Pedido</th>
                  <th style="padding:7px 12px;text-align:center;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Recebido</th>
                  <th style="padding:7px 12px;text-align:right;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Preço unit.</th>
                  <th style="padding:7px 12px;text-align:right;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Total</th>
                  <th style="padding:7px 12px;text-align:center;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Status</th>
                </tr></thead>
                <tbody>
                  ${itens.map((i,iIdx)=>{
                    const qtdP=i.qtdAprovada??i.qtdSelecionada;
                    const qtdR=i.qtdRecebida??null;
                    const div=qtdR!==null?qtdR-qtdP:null;
                    const aprov=i.aprovado===true?`<span style="font-size:.62rem;font-weight:700;color:var(--green)">✓ Aprovado</span>`:i.aprovado===false?`<span style="font-size:.62rem;font-weight:700;color:var(--red)">✗ Reprovado</span>`:`<span style="font-size:.62rem;color:var(--muted)">—</span>`;
                    return `<tr style="border-top:1px solid var(--border);background:${iIdx%2===0?'var(--surface)':'var(--surface2)'}">
                      <td style="padding:7px 12px">
                        <div style="font-size:.78rem;font-weight:600">${i.nome}</div>
                        <div style="font-size:.62rem;color:var(--muted)">${i.categoria}</div>
                        ${i.comentarioAprovador?`<div style="font-size:.62rem;color:var(--orange-dark);margin-top:2px">${lc('message-square',10,'currentColor')} ${i.comentarioAprovador}</div>`:''}
                        ${i.comentarioConferencia?`<div style="font-size:.62rem;color:var(--muted);margin-top:2px">${lc('clipboard-list',10,'currentColor')} ${i.comentarioConferencia}</div>`:''}
                      </td>
                      <td style="padding:7px 12px;text-align:center;font-size:.76rem;font-family:monospace">${fmt(qtdP)} ${i.unidade}</td>
                      <td style="padding:7px 12px;text-align:center;font-size:.76rem;font-family:monospace;color:${div!==null&&div<0?'var(--red)':div!==null&&div>0?'var(--yellow)':'inherit'}">
                        ${qtdR!==null?fmt(qtdR)+' '+i.unidade:'—'}
                        ${div!==null&&Math.abs(div)>0.001?`<div style="font-size:.6rem">${div>0?'+':''}${fmt(div)}</div>`:''}
                      </td>
                      <td style="padding:7px 12px;text-align:right;font-size:.76rem;font-family:monospace">R$${fmt(i.precoUnitFinal||i.precoUnitEstimado||0)}</td>
                      <td style="padding:7px 12px;text-align:right;font-size:.76rem;font-weight:700;font-family:monospace;color:var(--purple)">R$${fmt((i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0))}</td>
                      <td style="padding:7px 12px;text-align:center">${aprov}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr style="background:var(--purple-xlight);border-top:2px solid var(--purple-light)">
                    <td colspan="4" style="padding:7px 12px;font-size:.76rem;font-weight:700">Total do fornecedor</td>
                    <td style="padding:7px 12px;text-align:right;font-size:.82rem;font-weight:800;color:var(--purple);font-family:monospace">R$${fmt(total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>`;
        }).join('')}

        <!-- Itens presenciais -->
        ${itensPresencial.length?`<div>
          <div style="font-size:.78rem;font-weight:700;color:var(--orange-dark);margin-bottom:8px;display:flex;align-items:center;gap:6px">
            ${lc('shopping-cart',13,'var(--orange-dark)')} Compra Presencial
          </div>
          <div style="border:1px solid var(--border);border-radius:var(--r8);overflow:hidden">
            <table style="width:100%;border-collapse:collapse">
              <thead><tr style="background:var(--orange-light)">
                <th style="padding:7px 12px;text-align:left;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Item</th>
                <th style="padding:7px 12px;text-align:center;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Qtd</th>
                <th style="padding:7px 12px;text-align:left;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Local</th>
                <th style="padding:7px 12px;text-align:left;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Responsável</th>
                <th style="padding:7px 12px;text-align:center;font-size:.64rem;color:var(--muted);text-transform:uppercase;font-weight:700">Status</th>
              </tr></thead>
              <tbody>
                ${itensPresencial.map((i,iIdx)=>{
                  const aprov=i.aprovado===true?`<span style="font-size:.62rem;font-weight:700;color:var(--green)">✓ Aprovado</span>`:i.aprovado===false?`<span style="font-size:.62rem;font-weight:700;color:var(--red)">✗ Reprovado</span>`:`<span style="font-size:.62rem;color:var(--muted)">—</span>`;
                  return `<tr style="border-top:1px solid var(--border);background:${iIdx%2===0?'var(--surface)':'var(--surface2)'}">
                    <td style="padding:7px 12px"><div style="font-size:.78rem;font-weight:600">${i.nome}</div></td>
                    <td style="padding:7px 12px;text-align:center;font-size:.76rem;font-family:monospace">${fmt(i.qtdAprovada??i.qtdSelecionada)} ${i.unidade}</td>
                    <td style="padding:7px 12px;font-size:.74rem">${i.localCompra||'—'}</td>
                    <td style="padding:7px 12px;font-size:.74rem">${i.responsavelCompra||'—'}</td>
                    <td style="padding:7px 12px;text-align:center">${aprov}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>`:''}

        <!-- Observações -->
        ${l.observacoes?`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r8);padding:10px 14px">
          <div style="font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:5px">${lc('message-square',11,'var(--muted)')} Observações</div>
          <div style="font-size:.8rem;color:var(--text)">${l.observacoes}</div>
        </div>`:''}

      </div><!-- /body -->
    </div>`;

  document.body.appendChild(popup);
  // Fechar ao clicar fora
  popup.addEventListener('click', e => { if(e.target===popup) popup.remove(); });
}

function _reabrirLista(id) {
  const l=listas.find(x=>x.id===id); if(!l) return;
  _listaAtual=l; _comprasTab='lista'; _renderDashCompras(); _renderEtapa(l.etapa||1);
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════
let _timerInterval=null;
function _startTimer(elId,deadline) {
  clearInterval(_timerInterval);
  _timerInterval=setInterval(()=>{
    const el=document.getElementById(elId); if(!el){clearInterval(_timerInterval);return;}
    const ms=new Date(deadline)-Date.now();
    if(ms<=0){el.textContent='— Encerrado';el.style.color='var(--red)';clearInterval(_timerInterval);return;}
    const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000);
    el.textContent=`${h}h ${m}m ${s}s restantes`;
  },1000);
}

function encerrarListaManual() {
  if(!_listaAtual) return;
  if(!confirm('Encerrar esta lista? Ela será movida para o histórico.')) return;
  _listaAtual.status='concluida'; _listaAtual.dataConclusao=new Date().toISOString(); _listaAtual.valorFinal=_listaAtual.valorEstimado||0;
  saveListas(); _listaAtual=getListaAtiva(); renderComprasModule(); toast('Lista encerrada.');
}

function calcEconomia() {
  return listas.filter(l=>l.status==='concluida').reduce((s,l)=>s+Math.max(0,(l.valorEstimado||0)-(l.valorFinal||0)),0);
}
