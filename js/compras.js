/**
 * VTP Compras — Vai Ter Pizza!
 * compras.js — Módulo de Compras (4 etapas)
 */

let _listaAtual = null;

// ══════════════════════════════════════════════════════════════
// RENDER PRINCIPAL
// ══════════════════════════════════════════════════════════════
function renderComprasModule() {
  _listaAtual = getListaAtiva();
  _renderDashCompras();
  _listaAtual ? _renderEtapa(_listaAtual.etapa) : _renderSemLista();
}

function _renderSemLista() {
  document.getElementById('comprasContent').innerHTML = `
    <div style="text-align:center;padding:60px 24px">
      <div style="font-size:3rem;margin-bottom:16px">${lc("shopping-cart",14,"currentColor")}</div>
      <div style="font-size:1.1rem;font-weight:700;margin-bottom:8px">Nenhuma lista ativa</div>
      <div style="font-size:.82rem;color:var(--muted);margin-bottom:24px">Vá ao Estoque, adicione itens ao carrinho e clique em "Gerar Lista de Compras"</div>
      <button class="btn btn-primary" onclick="goModule('estoque')">${lc("package",16,"#fff")} Ir para o Estoque</button>
    </div>`;
}

function _renderDashCompras() {
  const el = document.getElementById('comprasDash');
  if (!el) return;
  const la = _listaAtual;
  const st = la ? (STATUS_ETAPA[la.status] || {}) : null;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">
        ${la ? `
          <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--muted)">Lista ativa</div>
          <div style="font-size:.9rem;font-weight:800;color:var(--text)">${la.codigo}</div>
          <div style="font-size:.68rem;color:var(--muted)">Criada em ${fmtD(la.dataCriacao)} por ${la.criadoPor}</div>
        ` : `<div style="font-size:.82rem;color:var(--muted)">Nenhuma lista ativa</div>`}
      </div>
      ${la ? `
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <div style="text-align:center;padding:6px 14px;background:var(--surface2);border-radius:var(--r8)">
            <div style="font-size:.9rem;font-weight:800;color:var(--purple)">${la.itens.length}</div>
            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Itens</div>
          </div>
          <div style="text-align:center;padding:6px 14px;background:var(--surface2);border-radius:var(--r8)">
            <div style="font-size:.9rem;font-weight:800;color:var(--purple)">R$${fmt(la.valorEstimado)}</div>
            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Estimado</div>
          </div>
          <div style="text-align:center;padding:6px 14px;background:${st.bg||'var(--surface2)'};border-radius:var(--r8)">
            <div style="font-size:.75rem;font-weight:700;color:${st.color||'var(--muted)'}">${st.label||la.status}</div>
            <div style="font-size:.6rem;color:var(--muted);text-transform:uppercase">Status</div>
          </div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-red btn-xs" onclick="encerrarListaManual()">${lc("x",13)} Encerrar</button>
        </div>
      ` : `<button class="btn btn-primary btn-sm" onclick="goModule('estoque')">${lc("shopping-cart",14,"currentColor")} Ir ao Estoque</button>`}
    </div>
    ${la ? `
    <div style="margin-top:14px;display:flex;gap:4px">
      ${[{n:1,label:'Lista'},{n:2,label:'Aprovação'},{n:3,label:'Ordem de Compra'},{n:4,label:'Recebimento'}].map(s => {
        const done = la.etapa > s.n, cur = la.etapa === s.n;
        return `<div style="flex:1;text-align:center;cursor:${done?'pointer':'default'}" ${done?`onclick="_renderEtapa(${s.n})"`:''}">
          <div style="height:4px;border-radius:2px;background:${done?'var(--green)':cur?'var(--purple)':'var(--border)'};margin-bottom:4px"></div>
          <div style="font-size:.6rem;font-weight:600;color:${done?'var(--green)':cur?'var(--purple)':'var(--muted)'}">${s.n}. ${s.label}</div>
        </div>`;
      }).join('')}
    </div>` : ''}`;
}

function _renderEtapa(n) {
  if (!_listaAtual) { _renderSemLista(); return; }
  if (n === 1) _renderEtapa1();
  else if (n === 2) _renderEtapa2();
  else if (n === 3) _renderEtapa3();
  else if (n === 4) _renderEtapa4();
}

// ══════════════════════════════════════════════════════════════
// ETAPA 1 — LISTA DE COMPRAS COM MULTI-FORNECEDOR
// ══════════════════════════════════════════════════════════════
function _renderEtapa1() {
  const l = _listaAtual;
  l.etapa = 1;
  saveListas();

  // Garante que cada item tem array de cotações
  l.itens.forEach(i => { if (!i.cotacoes) i.cotacoes = []; });

  const prazoHtml = l.prazoCotacao ? `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--yellow-light);border:1.5px solid var(--yellow);border-radius:var(--r8);font-size:.75rem;margin-bottom:12px">
      ${lc("clock",14)} Prazo: ${fmtDT(l.prazoCotacao)} · <span id="timer1" style="font-weight:700"></span>
    </div>` : '';

  document.getElementById('comprasContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="font-size:1rem;font-weight:800;margin-bottom:4px">${lc("clipboard-list",14,"currentColor")} Lista de Compras · ${l.codigo}</h3>
        <div style="font-size:.72rem;color:var(--muted)">${l.itens.length} itens</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${['montagem','cotacao','cotacao_encerrada'].map(s => {
          const st = STATUS_ETAPA[s];
          const isActive = l.status === s;
          return `<button onclick="setStatusLista('${s}')"
            style="padding:4px 10px;border-radius:20px;font-size:.7rem;font-weight:600;border:1.5px solid ${isActive?st.color:'var(--border)'};background:${isActive?st.bg:'var(--surface)'};color:${isActive?st.color:'var(--muted)'};cursor:pointer">${st.label}</button>`;
        }).join('')}
        <button class="btn btn-outline btn-sm" onclick="abrirPrazoCotacao()">${lc("clock",14)} Prazo</button>
        <button class="btn btn-primary btn-sm" onclick="enviarTodasCotacoesWA()">${lc("message-circle",14,"#fff")} Enviar cotações WA</button>
      </div>
    </div>

    ${prazoHtml}

    <div class="card" style="margin-bottom:16px;overflow:hidden">
      <div style="padding:10px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--surface2)">
        <button onclick="abrirAddItemManual()"
          style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:var(--r8);border:1.5px solid var(--purple);background:white;color:var(--purple);font-size:.76rem;font-weight:700;cursor:pointer">
          ${lc("plus",14,"var(--purple)")} Adicionar item
        </button>
        <div style="font-size:.68rem;color:var(--muted)">Adicione fornecedores por item para cotar</div>
      </div>
      <div class="tbl-wrap" style="border:none">
        <table>
          <thead><tr>
            <th style="min-width:200px">Item</th>
            <th class="c" style="width:90px">Qtd</th>
            <th class="c" style="width:55px">Un.</th>
            <th class="r" style="width:120px">Ref. estimado</th>
            <th style="min-width:220px">Fornecedores e cotações</th>
            <th class="c" style="width:36px"></th>
          </tr></thead>
          <tbody id="itens1Body">
            ${l.itens.map(i => _rowsItem(i)).join('')}
          </tbody>
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

    <div class="field" style="margin-bottom:16px">
      <label>Observações gerais</label>
      <textarea class="inp" rows="2" placeholder="Condições de pagamento, urgência..." onchange="setObsLista(this.value)">${l.observacoes}</textarea>
    </div>

    <div style="display:flex;justify-content:flex-end">
      <button class="btn btn-primary" onclick="avancarParaAprovacao()" style="padding:12px 28px;font-size:.88rem">
        Enviar para aprovação ${lc("arrow-right",14,"#fff")}
      </button>
    </div>`;

  if (l.prazoCotacao) _startTimer('timer1', l.prazoCotacao);
}

// Gera as linhas de um item + sublinhas de cotação
function _rowsItem(i) {
  const cotacoes = i.cotacoes || [];
  const melhor   = _melhorCotacao(cotacoes);

  // Linha principal do item
  const mainRow = `<tr id="item1-${i.id}" style="background:var(--surface);border-bottom:${cotacoes.length?'none':'1px solid var(--border)'}">
    <td style="padding:10px 14px">
      <div style="font-size:.83rem;font-weight:700">${i.nome}</div>
      <div style="font-size:.65rem;color:var(--muted)">${i.categoria} · ${i.origem==='manual'?'${lc("edit-2",13,"currentColor")}️ Manual':'${lc("package",14,"currentColor")} Estoque'}</div>
    </td>
    <td class="c">
      <input type="number" value="${i.qtdSelecionada}" min="0.001" step="0.001"
        style="width:76px;padding:4px 6px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.78rem;text-align:center;font-family:monospace"
        onchange="setItemQtd1(${i.id}, this.value)">
    </td>
    <td class="c" style="font-size:.75rem;color:var(--muted)">${i.unidade}</td>
    <td class="r" style="padding-right:14px">
      <div style="font-size:.72rem;color:var(--muted);font-family:monospace">R$ ${fmt(i.qtdSelecionada*(i.precoUnitEstimado||0))}</div>
      <div style="font-size:.6rem;color:var(--muted)">ref: R$${fmt(i.precoUnitEstimado||0)}/${i.unidade}</div>
    </td>
    <td style="padding:8px 12px">
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
        ${cotacoes.length === 0 ? `<span style="font-size:.72rem;color:var(--muted);font-style:italic">Nenhum fornecedor — será compra presencial</span>` : ''}
        <button onclick="abrirAddFornecedor(${i.id})"
          style="display:flex;align-items:center;gap:3px;padding:4px 10px;border-radius:20px;border:1.5px dashed var(--purple);background:transparent;color:var(--purple);font-size:.7rem;font-weight:600;cursor:pointer">
          ${lc("plus",13,"var(--purple)")} Fornecedor
        </button>
        ${cotacoes.length > 0 && i.fornecedorId ? `
          <button onclick="enviarCotacaoWAItem(${i.id})"
            style="width:26px;height:26px;border-radius:50%;border:none;background:#25D366;color:#fff;font-size:.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center" title="Enviar WA para todos os fornecedores deste item">${lc("message-circle",14,"currentColor")}</button>
        ` : ''}
      </div>
    </td>
    <td class="c">
      <button onclick="removerItem1(${i.id})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:.8rem;padding:4px" title="Remover">${lc("trash-2",14,"currentColor")}</button>
    </td>
  </tr>`;

  // Sublinhas por fornecedor
  const subRows = cotacoes.map((cot, idx) => {
    const sup    = suppliers.find(s => s.id === cot.supId);
    const isBest = melhor?.supId === cot.supId;
    const total  = cot.precoUnit ? i.qtdSelecionada * cot.precoUnit : null;
    return `<tr style="background:${isBest&&cot.respondido?'var(--green-light)':'var(--surface2)'};border-bottom:1px solid var(--border)">
      <td style="padding:6px 14px 6px 32px">
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:5px;height:5px;border-radius:50%;background:${cot.respondido?'var(--green)':'var(--muted)'};flex-shrink:0"></div>
          <span style="font-size:.76rem;font-weight:600;color:${isBest&&cot.respondido?'var(--green)':'var(--text2)'}">${sup?.name||'—'}</span>
          ${isBest&&cot.respondido?'<span style="font-size:.6rem;font-weight:700;color:var(--green);background:var(--green-light);padding:1px 6px;border-radius:10px">Melhor</span>':''}
        </div>
        ${sup?.phone?`<div style="font-size:.62rem;color:var(--muted);margin-top:1px;margin-left:11px">${lc("phone",13,"var(--muted)")} ${sup.phone}</div>`:''}
      </td>
      <td colspan="2" class="c">
        <label style="display:flex;align-items:center;gap:5px;justify-content:center;cursor:pointer;font-size:.7rem">
          <input type="checkbox" ${cot.respondido?'checked':''} onchange="marcarRespondido(${i.id},${idx},this.checked)" style="accent-color:var(--green);width:14px;height:14px">
          ${cot.respondido?'Respondeu':'Aguardando'}
        </label>
      </td>
      <td class="r" style="padding-right:14px">
        ${cot.respondido ? `
          <div style="font-size:.88rem;font-weight:800;color:${isBest?'var(--green)':'var(--text)'};font-family:monospace">R$ ${fmt(total||0)}</div>
          <div style="font-size:.62rem;color:var(--muted)">R$${fmt(cot.precoUnit||0)}/${i.unidade}</div>
        ` : `
          <div style="position:relative;display:inline-flex;align-items:center">
            <span style="position:absolute;left:7px;font-size:.65rem;color:var(--muted)">R$</span>
            <input type="number" value="${cot.precoUnit||''}" min="0" step="0.01" placeholder="0,00"
              style="width:100px;padding:4px 6px 4px 26px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.82rem;text-align:right;font-family:monospace"
              onchange="setCotacaoPreco(${i.id},${idx},this.value)">
          </div>
        `}
      </td>
      <td style="padding:6px 12px">
        ${sup?.phone?`
          <a href="https://wa.me/55${(sup.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(_montaMsgCotacaoForn(sup, i))}" target="_blank"
            style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#25D366;color:#fff;text-decoration:none;font-size:.8rem" title="Enviar WA">${lc("message-circle",14,"currentColor")}</a>
        `:''}
      </td>
      <td class="c">
        <button onclick="removerCotacao(${i.id},${idx})" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:.75rem;padding:4px" title="Remover fornecedor">${lc("x",13,"currentColor")}</button>
      </td>
    </tr>`;
  }).join('');

  return mainRow + subRows;
}

function _melhorCotacao(cotacoes) {
  const respondidas = cotacoes.filter(c => c.respondido && c.precoUnit > 0);
  if (!respondidas.length) return null;
  return respondidas.reduce((best, c) => c.precoUnit < best.precoUnit ? c : best);
}

function _montaMsgCotacaoForn(sup, item) {
  const l = _listaAtual;
  // Busca todos os itens deste fornecedor
  const itensForn = l.itens.filter(i => (i.cotacoes||[]).some(c => c.supId === sup.id));
  const linhas = itensForn.map(i => `• ${i.nome}: ${fmt(i.qtdSelecionada)} ${i.unidade}`).join('\n');
  const prazo  = l.prazoCotacao ? `\n${lc("clock",14)} Prazo para cotação: ${fmtDT(l.prazoCotacao)}` : '';
  return `Olá ${sup.seller||sup.name}! ${lc("hand-metal",14,"currentColor")}\n\nA *Vai Ter Pizza!* solicita sua cotação (${l.codigo}):\n\n${linhas}${prazo}\n\nPor favor, responda com:\n${lc("check-circle",14,"var(--green)")} Preço unitário de cada item\n${lc("check-circle",14,"var(--green)")} Prazo de entrega\n${lc("check-circle",14,"var(--green)")} Condição de pagamento\n\nAguardamos seu retorno! ${lc("tag",13,"currentColor")}`;
}

// ── Ações da sublinha ──
function abrirAddFornecedor(itemId) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  if (!i.cotacoes) i.cotacoes = [];

  // Lista fornecedores ainda não adicionados a este item
  const jaAdicionados = new Set(i.cotacoes.map(c => c.supId));
  const disponiveis   = suppliers.filter(s => !jaAdicionados.has(s.id));

  if (!disponiveis.length) { toast('Todos os fornecedores já foram adicionados', 'info'); return; }

  // Cria mini-modal inline
  const sel = disponiveis.map(s =>
    `<option value="${s.id}">${s.name}${s.phone?' ${lc("phone",13,"var(--muted)")}':'${lc("alert-triangle",14,"var(--yellow)")}️ sem tel'}</option>`
  ).join('');

  const popup = document.createElement('div');
  popup.id = 'popupForn';
  popup.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:500;display:flex;align-items:center;justify-content:center';
  popup.innerHTML = `
    <div style="background:white;border-radius:var(--r12);padding:20px;min-width:320px;box-shadow:0 8px 32px rgba(0,0,0,.2)">
      <div style="font-size:.9rem;font-weight:700;margin-bottom:12px">Adicionar fornecedor — ${i.nome}</div>
      <select id="selFornPop" class="inp" style="margin-bottom:12px">
        <option value="">Selecionar fornecedor...</option>
        ${sel}
      </select>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-outline" onclick="document.getElementById('popupForn').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="confirmarAddFornecedor(${itemId})">Adicionar</button>
      </div>
    </div>`;
  document.body.appendChild(popup);
}

function confirmarAddFornecedor(itemId) {
  const sel = document.getElementById('selFornPop');
  const supId = parseInt(sel?.value);
  if (!supId) { toast('Selecione um fornecedor', 'err'); return; }
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  if (!i.cotacoes) i.cotacoes = [];
  i.cotacoes.push({ supId, precoUnit: null, respondido: false, prazo: '', pagamento: '' });
  saveListas();
  document.getElementById('popupForn')?.remove();
  _renderEtapa1();
  toast('${lc("check-circle",14,"var(--green)")} Fornecedor adicionado!');
}

function removerCotacao(itemId, idx) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (i?.cotacoes) { i.cotacoes.splice(idx, 1); saveListas(); _renderEtapa1(); }
}

function marcarRespondido(itemId, idx, checked) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i?.cotacoes?.[idx]) return;
  i.cotacoes[idx].respondido = checked;
  saveListas();
  _renderEtapa1();
}

function setCotacaoPreco(itemId, idx, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i?.cotacoes?.[idx]) return;
  const v = parseFloat(val);
  i.cotacoes[idx].precoUnit = !isNaN(v) && v > 0 ? v : null;
  if (i.cotacoes[idx].precoUnit) i.cotacoes[idx].respondido = true;
  saveListas();
  _renderEtapa1();
}

function enviarTodasCotacoesWA() {
  if (!_listaAtual) return;
  const l = _listaAtual;
  // Agrupa itens por fornecedor
  const bySup = {};
  l.itens.forEach(i => {
    (i.cotacoes || []).forEach(cot => {
      const sup = suppliers.find(s => s.id === cot.supId);
      if (!sup?.phone) return;
      if (!bySup[cot.supId]) bySup[cot.supId] = { sup, itens: [] };
      bySup[cot.supId].itens.push(i);
    });
  });
  const sups = Object.values(bySup);
  if (!sups.length) { toast('Nenhum fornecedor com telefone cadastrado', 'err'); return; }
  sups.forEach(({ sup, itens }) => {
    const msg = _montaMsgCotacaoForn(sup, itens[0]); // usa função que já agrupa todos
    window.open('https://wa.me/55' + sup.phone.replace(/\D/g,'') + '?text=' + encodeURIComponent(msg), '_blank');
  });
  l.status = 'cotacao';
  saveListas();
  _renderDashCompras();
  _renderEtapa1();
  toast(`${lc("message-circle",14,"currentColor")} ${sups.length} mensagem(ns) enviada(s)!`);
}

function enviarCotacaoWAItem(itemId) {
  const i   = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  (i.cotacoes || []).forEach(cot => {
    const sup = suppliers.find(s => s.id === cot.supId);
    if (!sup?.phone) return;
    const msg = _montaMsgCotacaoForn(sup, i);
    window.open('https://wa.me/55' + sup.phone.replace(/\D/g,'') + '?text=' + encodeURIComponent(msg), '_blank');
  });
}

// ── Ações gerais etapa 1 ──
function setItemQtd1(itemId, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  const v = parseFloat(val);
  if (!isNaN(v) && v > 0) i.qtdSelecionada = v;
  _recalcEstimativa();
  saveListas();
  const footEl = document.getElementById('totalEstimado');
  if (footEl) footEl.textContent = 'R$ ' + fmt(_listaAtual.valorEstimado);
}

function setItemFornecedor1(itemId, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (i) { i.fornecedorId = val ? parseInt(val) : null; saveListas(); }
}

function removerItem1(itemId) {
  _listaAtual.itens = _listaAtual.itens.filter(x => x.id !== itemId);
  _recalcEstimativa();
  saveListas();
  _renderEtapa1();
}

function setObsLista(val) { if (_listaAtual) { _listaAtual.observacoes = val; saveListas(); } }

function setStatusLista(status) {
  if (!_listaAtual) return;
  _listaAtual.status = status;
  saveListas();
  _renderEtapa1();
  _renderDashCompras();
}

function _recalcEstimativa() {
  if (!_listaAtual) return;
  _listaAtual.valorEstimado = _listaAtual.itens.reduce((s, i) =>
    s + i.qtdSelecionada * (i.precoUnitEstimado || 0), 0);
}

function abrirAddItemManual() {
  document.getElementById('ovAddItem').classList.add('open');
  document.getElementById('aiNome').value  = '';
  document.getElementById('aiQtd').value   = '';
  document.getElementById('aiUnit').value  = 'un';
  document.getElementById('aiCat').value   = '';
  document.getElementById('aiPreco').value = '';
}

function saveItemManual() {
  const nome = document.getElementById('aiNome').value.trim();
  const qtd  = parseFloat(document.getElementById('aiQtd').value);
  if (!nome) { toast('Informe o nome do item', 'err'); return; }
  if (isNaN(qtd) || qtd <= 0) { toast('Informe a quantidade', 'err'); return; }
  const newId = Math.max(0, ..._listaAtual.itens.map(x => x.id)) + 1;
  _listaAtual.itens.push({
    id: newId, itemId: null, nome,
    categoria: document.getElementById('aiCat').value || 'Geral',
    unidade:   document.getElementById('aiUnit').value || 'un',
    qtdSugerida: qtd, qtdSelecionada: qtd,
    qtdAprovada: null, qtdComprada: null, qtdRecebida: null,
    estoqueAtual: 0, estoqueMinimo: 0, estoqueIdeal: 0,
    origem: 'manual', tipoCompra: 'fornecedor',
    fornecedorId: null, localCompra: '', diaCompra: '', responsavelCompra: '',
    precoUnitEstimado: parseFloat(document.getElementById('aiPreco').value) || 0,
    precoUnitFinal: null, valorTotal: 0, statusItem: 'pendente',
    observacoes: '', cotacoes: [],
    aprovado: null, comentarioAprovador: '',
    conferido: false, divergencia: false, comentarioConferencia: '',
  });
  _recalcEstimativa();
  saveListas();
  closeModal('ovAddItem');
  _renderEtapa1();
  toast('${lc("check-circle",14,"var(--green)")} Item adicionado!');
}

function abrirPrazoCotacao() {
  const d   = _listaAtual.prazoCotacao ? new Date(_listaAtual.prazoCotacao).toISOString().slice(0,16) : '';
  const val = prompt('Prazo de encerramento (AAAA-MM-DDTHH:MM):', d || new Date(Date.now()+24*3600000).toISOString().slice(0,16));
  if (!val) return;
  _listaAtual.prazoCotacao = new Date(val).toISOString();
  saveListas();
  _renderEtapa1();
  toast('${lc("clock",14)} Prazo definido!');
}

function avancarParaAprovacao() {
  if (!_listaAtual) return;
  // Marca itens sem fornecedor como compra presencial
  _listaAtual.itens.forEach(i => {
    if (!i.cotacoes?.length) i.tipoCompra = 'presencial';
  });
  // Para itens cotados, seleciona melhor preço disponível
  _listaAtual.itens.forEach(i => {
    if (i.cotacoes?.length) {
      const melhor = _melhorCotacao(i.cotacoes);
      if (melhor) {
        i.precoUnitFinal  = melhor.precoUnit;
        i.fornecedorId    = melhor.supId;
        i.tipoCompra      = 'fornecedor';
      }
    }
  });
  _listaAtual.etapa  = 2;
  _listaAtual.status = 'aguard_aprovacao';
  saveListas();
  _renderDashCompras();
  _renderEtapa2();
  toast('Lista enviada para aprovação!');
}

// ══════════════════════════════════════════════════════════════
// ETAPA 2 — APROVAÇÃO
// ══════════════════════════════════════════════════════════════
function _renderEtapa2() {
  const l = _listaAtual;
  const itensForn     = l.itens.filter(i => i.tipoCompra !== 'presencial');
  const itensPresencial = l.itens.filter(i => i.tipoCompra === 'presencial');
  const totalForn     = itensForn.reduce((s,i) => s+(i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0), 0);
  const totalPres     = itensPresencial.reduce((s,i) => s+i.qtdSelecionada*(i.precoUnitEstimado||0), 0);
  const totalGeral    = totalForn + totalPres;

  document.getElementById('comprasContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="font-size:1rem;font-weight:800;margin-bottom:4px">${lc("check-circle",14,"var(--green)")} Aprovação · ${l.codigo}</h3>
        <div style="font-size:.72rem;color:var(--muted)">Revise e aprove os itens antes da compra</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="_renderEtapa1()">${lc("arrow-left",14)} Voltar</button>
        <button class="btn btn-red btn-sm" onclick="reprovarLista()">${lc("x",13)} Reprovar</button>
        <button class="btn btn-primary btn-sm" onclick="aprovarLista()">${lc("check-circle",14,"#fff")} Aprovar lista</button>
      </div>
    </div>

    <!-- Total geral -->
    <div style="background:var(--purple-xlight);border:1.5px solid var(--purple-light);border-radius:var(--r10);padding:12px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
      <div style="font-size:.78rem;font-weight:600;color:var(--purple)">Total aprovado (estimado)</div>
      <div style="font-size:1.1rem;font-weight:800;color:var(--purple)">R$ ${fmt(totalGeral)}</div>
    </div>

    <!-- Itens com fornecedor -->
    ${itensForn.length ? `
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:8px">${lc("building-2",13,"var(--muted)")} Compras via Fornecedor</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
        ${itensForn.map(i => _cardAprovacaoItem(i, false)).join('')}
      </div>
    ` : ''}

    <!-- Itens presenciais -->
    ${itensPresencial.length ? `
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:8px">${lc("shopping-cart",14,"currentColor")} Compra Presencial (sem fornecedor)</div>
      <div style="background:var(--orange-light);border:1.5px solid var(--border);border-radius:var(--r10);padding:12px 14px;margin-bottom:8px;font-size:.74rem;color:var(--orange-dark)">
        ${lc("alert-triangle",14,"var(--yellow)")}️ Esses itens não têm fornecedor definido. A aprovação é por <strong>orçamento máximo</strong> — o comprador não pode gastar mais que o valor estimado.
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
        ${itensPresencial.map(i => _cardAprovacaoItem(i, true)).join('')}
      </div>
    ` : ''}`;
}

function _cardAprovacaoItem(i, isPresencial) {
  const sup    = suppliers.find(s => s.id === i.fornecedorId);
  const qtd    = i.qtdAprovada ?? i.qtdSelecionada;
  const preco  = i.precoUnitFinal || i.precoUnitEstimado || 0;
  const total  = qtd * preco;
  const isAprov  = i.aprovado === true;
  const isReprov = i.aprovado === false;

  return `<div style="border:1.5px solid ${isAprov?'var(--green)':isReprov?'var(--red)':'var(--border)'};border-radius:var(--r10);background:${isAprov?'var(--green-light)':isReprov?'var(--red-light)':'var(--surface)'};overflow:hidden">
    <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;flex-wrap:wrap">
      <div style="flex:1;min-width:150px">
        <div style="font-size:.84rem;font-weight:700">${i.nome}</div>
        <div style="font-size:.68rem;color:var(--muted)">${i.categoria} · ${isPresencial ? '${lc("shopping-cart",14,"currentColor")} Compra presencial' : '${lc("building-2",13,"var(--muted)")} ' + (sup?.name||'Fornecedor')}</div>
      </div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <div style="text-align:center">
          <div style="font-size:.6rem;color:var(--muted)">Qtd</div>
          <div style="font-size:.82rem;font-weight:700;font-family:monospace">${fmt(qtd)} ${i.unidade}</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:.6rem;color:var(--muted)">${isPresencial ? 'Orçamento máx.' : 'Preço unit.'}</div>
          <div style="font-size:.82rem;font-weight:700;font-family:monospace;color:${isPresencial?'var(--orange-dark)':'var(--text)'}">R$ ${fmt(preco)}</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:.6rem;color:var(--muted)">${isPresencial ? 'Teto máximo' : 'Total'}</div>
          <div style="font-size:.88rem;font-weight:800;color:var(--purple);font-family:monospace">R$ ${fmt(total)}</div>
        </div>
        <div style="display:flex;gap:5px">
          <button onclick="aprovarItem2(${i.id})"
            style="padding:6px 12px;border-radius:var(--r8);border:1.5px solid ${isAprov?'var(--green)':'var(--border)'};background:${isAprov?'var(--green)':'var(--surface)'};color:${isAprov?'#fff':'var(--text2)'};font-size:.72rem;font-weight:600;cursor:pointer">${lc("check",13)} Aprovar</button>
          <button onclick="reprovarItem2(${i.id})"
            style="padding:6px 12px;border-radius:var(--r8);border:1.5px solid ${isReprov?'var(--red)':'var(--border)'};background:${isReprov?'var(--red)':'var(--surface)'};color:${isReprov?'#fff':'var(--text2)'};font-size:.72rem;font-weight:600;cursor:pointer">${lc("x",13)} Reprovar</button>
        </div>
      </div>
    </div>
    <div style="padding:0 14px 10px">
      <input type="text" placeholder="Comentário do aprovador..." value="${i.comentarioAprovador||''}"
        style="width:100%;padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.72rem"
        onchange="setComentarioAprovador(${i.id}, this.value)">
    </div>
  </div>`;
}

function aprovarItem2(itemId) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (i) { i.aprovado = true; saveListas(); _renderEtapa2(); }
}

function reprovarItem2(itemId) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (i) { i.aprovado = false; saveListas(); _renderEtapa2(); }
}

function setComentarioAprovador(itemId, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (i) { i.comentarioAprovador = val; saveListas(); }
}

function setQtdAprovada(itemId, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  const v = parseFloat(val);
  i.qtdAprovada = !isNaN(v) && v >= 0 ? v : i.qtdSelecionada;
  saveListas();
}

function aprovarLista() {
  _listaAtual.itens.forEach(i => { if (i.aprovado === null) i.aprovado = true; });
  _listaAtual.itens = _listaAtual.itens.filter(i => i.aprovado !== false);
  _listaAtual.status = 'aprovada';
  _listaAtual.etapa  = 3;
  _listaAtual.valorAprovado = _listaAtual.itens.reduce((s,i) =>
    s+(i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0), 0);
  saveListas();
  _renderDashCompras();
  _renderEtapa3();
  toast('${lc("check-circle",14,"var(--green)")} Lista aprovada!');
}

function reprovarLista() {
  if (!confirm('Reprovar toda a lista? Ela voltará para montagem.')) return;
  _listaAtual.status = 'reprovada';
  _listaAtual.etapa  = 1;
  saveListas();
  _renderDashCompras();
  _renderEtapa1();
  toast('${lc("x-circle",14,"var(--red)")} Lista reprovada. Revise e reenvie.');
}

// ══════════════════════════════════════════════════════════════
// ETAPA 3 — ORDEM DE COMPRA
// ══════════════════════════════════════════════════════════════
function _renderEtapa3() {
  const l = _listaAtual;
  const itensPresencial = l.itens.filter(i => i.tipoCompra === 'presencial');
  const itensForn       = l.itens.filter(i => i.tipoCompra !== 'presencial');
  const bySup = {};
  itensForn.forEach(i => {
    const key = i.fornecedorId || 0;
    if (!bySup[key]) bySup[key] = [];
    bySup[key].push(i);
  });

  document.getElementById('comprasContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="font-size:1rem;font-weight:800;margin-bottom:4px">${lc("shopping-bag",14,"currentColor")}️ Ordem de Compra · ${l.codigo}</h3>
        <div style="font-size:.72rem;color:var(--muted)">Total aprovado: <strong style="color:var(--purple)">R$ ${fmt(l.valorAprovado)}</strong></div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline btn-sm" onclick="_renderEtapa2()">${lc("arrow-left",14)} Aprovação</button>
        <button class="btn btn-primary btn-sm" onclick="avancarParaRecebimento()">Registrar recebimento ${lc("arrow-right",14,"#fff")}</button>
      </div>
    </div>

    ${Object.entries(bySup).map(([supId, itens], idx) => {
      const sup   = parseInt(supId) ? suppliers.find(s => s.id === parseInt(supId)) : null;
      const total = itens.reduce((s,i) => s+(i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0), 0);
      const ocText = _montaOCText(sup, itens, l);
      return `<div class="card" style="margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--purple-xlight);border-bottom:1.5px solid var(--purple-light);flex-wrap:wrap;gap:8px">
          <div>
            <div style="font-size:.88rem;font-weight:800;color:var(--purple)">${sup?.name||'${lc("alert-triangle",14,"var(--yellow)")}️ Fornecedor não definido'}</div>
            ${sup?.seller?`<div style="font-size:.68rem;color:var(--muted)">${lc("user",14,"currentColor")} ${sup.seller}</div>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="font-size:1rem;font-weight:800;color:var(--purple)">R$ ${fmt(total)}</div>
            ${sup?.phone?`<a href="https://wa.me/55${(sup.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(ocText)}" target="_blank" class="btn btn-wa btn-sm">${lc("send",14,"#fff")} Enviar OC</a>`:''}
            <button class="btn btn-outline btn-sm" onclick="copiarOC3(${idx})">${lc("copy",14)} Copiar</button>
          </div>
        </div>
        ${itens.map((i,iIdx) => `
          <div style="display:flex;align-items:center;gap:10px;padding:9px 14px;border-bottom:1px solid var(--border);background:${iIdx%2===0?'var(--surface)':'var(--surface2)'}">
            <div style="flex:1"><div style="font-size:.8rem;font-weight:600">${i.nome}</div></div>
            <div style="font-size:.75rem;font-family:monospace;color:var(--muted)">${fmt(i.qtdAprovada??i.qtdSelecionada)} ${i.unidade}</div>
            <div style="font-size:.78rem;font-weight:700;font-family:monospace">R$ ${fmt((i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0))}</div>
          </div>`).join('')}
      </div>`;
    }).join('')}

    ${itensPresencial.length ? `
    <div class="card" style="margin-bottom:12px">
      <div style="padding:12px 14px;background:var(--orange-light);border-bottom:1.5px solid var(--border)">
        <div style="font-size:.88rem;font-weight:800;color:var(--orange-dark)">${lc("shopping-cart",14,"currentColor")} Compra Presencial</div>
        <div style="font-size:.7rem;color:var(--muted)">Defina local, data e responsável</div>
      </div>
      ${itensPresencial.map((i,idx) => `
        <div style="padding:10px 14px;border-bottom:1px solid var(--border);background:${idx%2===0?'var(--surface)':'var(--surface2)'}">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
            <div style="flex:1;font-size:.82rem;font-weight:600">${i.nome}</div>
            <div style="font-size:.75rem;font-family:monospace">${fmt(i.qtdAprovada??i.qtdSelecionada)} ${i.unidade}</div>
            <div style="font-size:.72rem;color:var(--orange-dark);font-weight:600">Teto: R$ ${fmt((i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitEstimado||0))}</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <input type="text" placeholder="Local (ex: Atacadão)" value="${i.localCompra||''}"
              style="flex:1;min-width:120px;padding:4px 8px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.72rem"
              onchange="setSuperCampo(${i.id},'localCompra',this.value)">
            <input type="date" value="${i.diaCompra||''}"
              style="padding:4px 8px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.72rem"
              onchange="setSuperCampo(${i.id},'diaCompra',this.value)">
            <input type="text" placeholder="Responsável" value="${i.responsavelCompra||''}"
              style="flex:1;min-width:120px;padding:4px 8px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.72rem"
              onchange="setSuperCampo(${i.id},'responsavelCompra',this.value)">
          </div>
        </div>`).join('')}
    </div>` : ''}`;

  // Store bySup for copiarOC3
  window._ocBySup = Object.entries(bySup).map(([supId, itens]) => ({
    sup: parseInt(supId) ? suppliers.find(s => s.id === parseInt(supId)) : null,
    itens
  }));
}

function _montaOCText(sup, itens, l) {
  const linhas = itens.map(i => '• ' + i.nome + ': ' + fmt(i.qtdAprovada??i.qtdSelecionada) + ' ' + i.unidade + ' × R$' + fmt(i.precoUnitFinal||i.precoUnitEstimado||0) + ' = R$' + fmt((i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0))).join('\n');
  const total  = itens.reduce((s,i) => s+(i.qtdAprovada??i.qtdSelecionada)*(i.precoUnitFinal||i.precoUnitEstimado||0), 0);
  return 'Olá ' + (sup?.seller||sup?.name||'') + '! ${lc("hand-metal",14,"currentColor")}\n\nSegue nossa Ordem de Compra ' + l.codigo + ':\n\n' + linhas + '\n\nTotal: R$' + fmt(total) + '\n\nObrigado! ${lc("tag",13,"currentColor")}';
}

function copiarOC3(idx) {
  const entry = window._ocBySup?.[idx];
  if (!entry) return;
  const txt = _montaOCText(entry.sup, entry.itens, _listaAtual);
  navigator.clipboard.writeText(txt).then(() => toast('${lc("clipboard-list",14,"currentColor")} OC copiada!', 'info'));
}

function setSuperCampo(itemId, campo, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (i) { i[campo] = val; saveListas(); }
}

function avancarParaRecebimento() {
  _listaAtual.etapa  = 4;
  _listaAtual.status = 'recebimento';
  saveListas();
  _renderDashCompras();
  _renderEtapa4();
  toast('${lc("package",14,"currentColor")} Avançado para recebimento!');
}

// ══════════════════════════════════════════════════════════════
// ETAPA 4 — RECEBIMENTO
// ══════════════════════════════════════════════════════════════
function _renderEtapa4() {
  const l = _listaAtual;
  const total      = l.itens.length;
  const conferidos = l.itens.filter(i => i.conferido).length;
  const pct        = total > 0 ? Math.round(conferidos/total*100) : 0;

  document.getElementById('comprasContent').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <div>
        <h3 style="font-size:1rem;font-weight:800;margin-bottom:4px">${lc("package",14,"currentColor")} Recebimento · ${l.codigo}</h3>
        <div style="font-size:.72rem;color:var(--muted)">${conferidos} de ${total} itens conferidos</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-outline btn-sm" onclick="_renderEtapa3()">${lc("arrow-left",14)} OC</button>
        <button class="btn btn-primary btn-sm" onclick="concluirLista()" ${conferidos<total?'disabled':''}>${lc("check-circle",14,"#fff")} Concluir lista</button>
      </div>
    </div>
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:.72rem;color:var(--muted)">
        <span>Progresso</span><span>${pct}%</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${pct===100?'var(--green)':'var(--purple)'};border-radius:4px;transition:width .4s"></div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${l.itens.map(i => {
        const sup  = suppliers.find(s => s.id === i.fornecedorId);
        const qtdS = i.qtdAprovada ?? i.qtdSelecionada;
        const qtdR = i.qtdRecebida ?? null;
        const diff = qtdR !== null ? qtdR - qtdS : null;
        const isOk = i.conferido && !i.divergencia;
        return `<div style="border:1.5px solid ${isOk?'var(--green)':i.conferido&&i.divergencia?'var(--yellow)':'var(--border)'};border-radius:var(--r10);background:${isOk?'var(--green-light)':i.conferido&&i.divergencia?'var(--yellow-light)':'var(--surface)'};overflow:hidden">
          <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;flex-wrap:wrap">
            <div style="flex:1;min-width:140px">
              <div style="font-size:.84rem;font-weight:700">${i.nome}</div>
              <div style="font-size:.68rem;color:var(--muted)">${i.tipoCompra==='presencial'?'${lc("shopping-cart",14,"currentColor")} '+i.localCompra:'${lc("building-2",13,"var(--muted)")} '+(sup?.name||'Fornecedor')}</div>
            </div>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
              <div style="text-align:center">
                <div style="font-size:.6rem;color:var(--muted)">Solicitado</div>
                <div style="font-size:.82rem;font-weight:700;font-family:monospace">${fmt(qtdS)} ${i.unidade}</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:.6rem;color:var(--muted)">Recebido</div>
                <input type="number" value="${qtdR??''}" min="0" step="0.001" placeholder="${fmt(qtdS)}"
                  style="width:72px;padding:4px 6px;border:1.5px solid ${diff!==null&&diff<0?'var(--red)':'var(--border)'};border-radius:var(--r6);font-size:.78rem;text-align:center;font-family:monospace"
                  onchange="setQtdRecebida(${i.id},this.value)">
              </div>
              ${diff !== null ? `
                <div style="text-align:center">
                  <div style="font-size:.6rem;color:var(--muted)">Diferença</div>
                  <div style="font-size:.82rem;font-weight:700;font-family:monospace;color:${diff<0?'var(--red)':diff>0?'var(--yellow)':'var(--green)'}">${diff>0?'+':''}${fmt(diff)}</div>
                </div>` : ''}
              <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:.76rem;font-weight:600">
                <input type="checkbox" ${i.conferido?'checked':''} style="accent-color:var(--green);width:16px;height:16px" onchange="marcarConferido(${i.id},this.checked)">
                Conferido
              </label>
            </div>
          </div>
          <div style="padding:0 14px 10px">
            <input type="text" placeholder="Observação de conferência..." value="${i.comentarioConferencia||''}"
              style="width:100%;padding:5px 8px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.72rem"
              onchange="setComentarioConferencia(${i.id},this.value)">
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function setQtdRecebida(itemId, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  const v = parseFloat(val);
  const qtdS = i.qtdAprovada ?? i.qtdSelecionada;
  i.qtdRecebida = !isNaN(v) ? parseFloat(v.toFixed(3)) : null;
  i.divergencia = i.qtdRecebida !== null && Math.abs(i.qtdRecebida - qtdS) > 0.001;
  saveListas();
}

function marcarConferido(itemId, checked) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (!i) return;
  i.conferido = checked;
  if (checked && i.qtdRecebida === null) i.qtdRecebida = i.qtdAprovada ?? i.qtdSelecionada;
  saveListas();
  _renderEtapa4();
}

function setComentarioConferencia(itemId, val) {
  const i = _listaAtual.itens.find(x => x.id === itemId);
  if (i) { i.comentarioConferencia = val; saveListas(); }
}

function concluirLista() {
  if (!_listaAtual) return;
  _listaAtual.itens.forEach(i => {
    if (!i.itemId) return;
    const item = items.find(x => x.id === i.itemId);
    if (!item) return;
    if (i.qtdRecebida !== null) item.qty = parseFloat((item.qty + i.qtdRecebida).toFixed(3));
    if (i.precoUnitFinal) item.cost = i.precoUnitFinal;
  });
  saveI();
  _listaAtual.status        = 'concluida';
  _listaAtual.dataConclusao = new Date().toISOString();
  _listaAtual.valorFinal    = _listaAtual.itens.reduce((s,i) => s+(i.qtdRecebida??0)*(i.precoUnitFinal||i.precoUnitEstimado||0), 0);
  saveListas();
  _listaAtual = getListaAtiva();
  renderDashboard();
  renderComprasModule();
  toast('Lista concluída! Estoque atualizado.');
}

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════
let _timerInterval = null;
function _startTimer(elId, deadline) {
  clearInterval(_timerInterval);
  _timerInterval = setInterval(() => {
    const el = document.getElementById(elId);
    if (!el) { clearInterval(_timerInterval); return; }
    const ms = new Date(deadline) - Date.now();
    if (ms <= 0) { el.textContent = 'Encerrado'; clearInterval(_timerInterval); return; }
    const h = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000), s = Math.floor((ms%60000)/1000);
    el.textContent = `${h}h ${m}m ${s}s`;
  }, 1000);
}

function encerrarListaManual() {
  if (!_listaAtual) return;
  if (!confirm('Encerrar esta lista?')) return;
  _listaAtual.status = 'concluida';
  _listaAtual.dataConclusao = new Date().toISOString();
  saveListas();
  _listaAtual = getListaAtiva();
  renderComprasModule();
  toast('Lista encerrada.');
}

function calcEconomia() {
  return listas.filter(l => l.status==='concluida').reduce((s,l) => s+(l.valorEstimado-l.valorFinal||0), 0);
}
