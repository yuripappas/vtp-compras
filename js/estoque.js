/**
 * VTP Compras — Vai Ter Pizza!
 * estoque.js — Módulo de Estoque
 */

let _estFiltro = { search: '', cat: '', status: 'all' };

// ══════════════════════════════════════════════════════════════
// RENDER PRINCIPAL
// ══════════════════════════════════════════════════════════════
function renderEstoque() {
  const insumos = items.filter(i => !i.isProd);
  const cats    = [...new Set(insumos.map(i => i.cat))].sort();

  const catEl = document.getElementById('estCatFil');
  if (catEl) {
    const cur = catEl.value;
    catEl.innerHTML = '<option value="">Todas categorias</option>' +
      cats.map(c => `<option value="${c}" ${c===cur?'selected':''}>${c}</option>`).join('');
  }

  _renderEstKpis(insumos);
  _renderFiltrosBtns();
  _renderEstoqueTabela(insumos);
  _renderCarrinhoSumario();
  updatePrepBadge();
}

// ── KPIs ────────────────────────────────────────────────────
function _renderEstKpis(insumos) {
  const crit = insumos.filter(i => gst(i) === 'crit').length;
  const warn = insumos.filter(i => gst(i) === 'warn').length;
  const ok   = insumos.filter(i => gst(i) === 'ok').length;

  const el = document.getElementById('estKpis');
  if (!el) return;
  el.innerHTML = `
    ${_kpi(crit, 'Críticos',  'var(--red)',    'crit', 'alert-circle')}
    ${_kpi(warn, 'Baixo',     'var(--yellow)', 'warn', 'alert-triangle')}
    ${_kpi(ok,   'OK',        'var(--green)',  'ok',   'check-circle')}`;
}

function _kpi(val, label, cor, filtro, icon) {
  const active = _estFiltro.status === filtro;
  return `
    <div class="kpi" onclick="setEstFiltro('${filtro}')"
      style="cursor:pointer;border-color:${active ? cor : 'var(--border)'};background:${active ? cor+'11' : 'var(--surface)'}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        ${lc(icon, 16, active ? cor : 'var(--muted)')}
        <div class="kpi-v" style="color:${cor};font-size:1.4rem">${val}</div>
      </div>
      <div class="kpi-l">${label}</div>
    </div>`;
}

// ── Filtros ──────────────────────────────────────────────────
function _renderFiltrosBtns() {
  const el = document.getElementById('estFiltrosBtns');
  if (!el) return;
  const st = _estFiltro.status;
  const btns = [
    { id:'all',  label:'Todos',           icon:'package',        cls:'' },
    { id:'crit', label:'Críticos',        icon:'alert-circle',   cls:'f-red' },
    { id:'warn', label:'Baixos',          icon:'alert-triangle', cls:'f-yellow' },
    { id:'ok',   label:'OK',              icon:'check-circle',   cls:'f-green' },
    { id:'need', label:'Com necessidade', icon:'arrow-up',       cls:'' },
  ];
  el.innerHTML = btns.map(b =>
    `<button class="filter-btn ${b.cls} ${st===b.id?'active':''}" onclick="setEstFiltro('${b.id}')">
      ${lc(b.icon, 12, 'currentColor')} ${b.label}
    </button>`
  ).join('');
}

// ── Tabela ───────────────────────────────────────────────────
function _renderEstoqueTabela(insumos) {
  const q   = _estFiltro.search.toLowerCase();
  const cat = _estFiltro.cat;
  const st  = _estFiltro.status;

  let filt = insumos.filter(i => {
    if (cat && i.cat !== cat) return false;
    if (q && !i.name.toLowerCase().includes(q)) return false;
    if (st === 'crit') return gst(i) === 'crit';
    if (st === 'warn') return gst(i) === 'warn';
    if (st === 'ok')   return gst(i) === 'ok';
    if (st === 'need') return gneed(i) > 0;
    return true;
  }).sort((a,b) => {
    const order = { crit:0, warn:1, ok:2 };
    return (order[gst(a)]||2) - (order[gst(b)]||2) || a.name.localeCompare(b.name);
  });

  const byCat = {};
  filt.forEach(i => {
    if (!byCat[i.cat]) byCat[i.cat] = [];
    byCat[i.cat].push(i);
  });

  const tbody = document.getElementById('estTableBody');
  if (!tbody) return;

  if (!filt.length) {
    tbody.innerHTML = `
      <tr><td colspan="8" style="text-align:center;padding:40px">
        <div class="empty-icon">${lc('package',24,'var(--muted)')}</div>
        <div style="font-size:.82rem;color:var(--muted)">Nenhum item encontrado</div>
      </td></tr>`;
    return;
  }

  const stColors = { crit:'var(--red)', warn:'var(--yellow)', ok:'var(--green)' };
  const stLabels = { crit:'CRÍTICO',    warn:'BAIXO',          ok:'OK' };
  const rowBg    = { crit:'#FFF1F1',    warn:'#FFFBEB',        ok:'var(--surface)' };

  tbody.innerHTML = Object.entries(byCat).map(([cat, catItems]) => {
    const catRow = `
      <tr>
        <td colspan="8" style="padding:8px 16px 5px;background:var(--surface2);border-top:2px solid var(--border);border-bottom:1px solid var(--border)">
          <span style="font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--purple)">${cat}</span>
        </td>
      </tr>`;

    const itemRows = catItems.map(i => {
      const s      = gst(i);
      const need   = gneed(i);
      const pct    = i.ideal > 0 ? Math.min(100, Math.round(i.qty / i.ideal * 100)) : 0;
      const inCart = _carrinho.find(c => c.itemId === i.id);
      const bg     = rowBg[s] || 'var(--surface)';

      return `
        <tr id="est-row-${i.id}" style="background:${bg};border-bottom:1px solid var(--border)">

          <!-- Nome -->
          <td style="padding:10px 14px;min-width:180px">
            <div style="font-size:.82rem;font-weight:600;color:var(--text)">${i.name}</div>
            ${i.brands?.length ? `<div style="font-size:.63rem;color:var(--muted);margin-top:1px">${i.brands.slice(0,2).join(' · ')}</div>` : ''}
            ${i.code ? `<div style="font-size:.6rem;color:var(--border2);margin-top:1px;font-family:monospace">#${i.code}</div>` : ''}
          </td>

          <!-- Un -->
          <td class="c" style="font-size:.75rem;color:var(--muted);width:50px">${i.unit}</td>

          <!-- Qtd atual -->
          <td class="c" style="width:90px">
            <input type="number" value="${i.qty}" min="0" step="0.001"
              style="width:72px;padding:5px 7px;border:1.5px solid var(--border);border-radius:var(--r6);font-size:.8rem;font-family:monospace;text-align:center;background:var(--surface);color:var(--text)"
              onchange="onQty(${i.id}, this)" oninput="onQty(${i.id}, this)">
          </td>

          <!-- Mín -->
          <td class="c" style="font-size:.74rem;color:var(--muted);width:60px">${fmt(i.min)}</td>

          <!-- Ideal -->
          <td class="c" style="font-size:.74rem;color:var(--muted);width:60px">${fmt(i.ideal)}</td>

          <!-- Barra -->
          <td style="width:120px;padding:8px 12px">
            <div style="display:flex;align-items:center;gap:7px">
              <div style="flex:1;height:5px;background:var(--border);border-radius:3px;overflow:hidden">
                <div style="height:100%;width:${pct}%;background:${stColors[s]};border-radius:3px;transition:width .3s"></div>
              </div>
              <span style="font-size:.64rem;color:${stColors[s]};font-weight:700;min-width:32px;text-align:right">${pct}%</span>
            </div>
          </td>

          <!-- Status -->
          <td class="c" style="width:80px">
            <span class="chip chip-${s==='crit'?'red':s==='warn'?'yellow':'green'}">
              ${lc(s==='crit'?'alert-circle':s==='warn'?'alert-triangle':'check-circle', 10, 'currentColor')}
              ${stLabels[s]}
            </span>
          </td>

          <!-- Comprar -->
          <td style="width:190px;padding:8px 14px;text-align:right">
            ${inCart ? `
              <div style="display:inline-flex;align-items:center;gap:4px;background:var(--purple-xlight);border:1.5px solid var(--purple-light);border-radius:var(--r8);padding:4px 8px">
                <button onclick="ajustarCarrinho(${i.id}, -1)"
                  style="width:22px;height:22px;border-radius:50%;border:none;background:var(--purple);color:#fff;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0">−</button>
                <input type="number" value="${inCart.qty}" min="0.001" step="0.001"
                  style="width:52px;border:none;background:transparent;font-size:.82rem;font-weight:800;text-align:center;color:var(--purple);font-family:monospace"
                  onchange="setCarrinhoQty(${i.id}, this.value)">
                <span style="font-size:.65rem;color:var(--purple);font-weight:600">${i.unit}</span>
                <button onclick="ajustarCarrinho(${i.id}, 1)"
                  style="width:22px;height:22px;border-radius:50%;border:none;background:var(--purple);color:#fff;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0">+</button>
                <button onclick="removerCarrinho(${i.id})"
                  style="width:22px;height:22px;border-radius:50%;border:none;background:var(--red-light);color:var(--red);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  ${lc('x', 12, 'var(--red)')}
                </button>
              </div>
            ` : `
              <div style="display:inline-flex;align-items:center;gap:8px">
                <div style="text-align:right">
                  <div style="font-size:1rem;font-weight:800;color:var(--purple);font-family:monospace;line-height:1">${fmt(need > 0 ? need : 0)}</div>
                  <div style="font-size:.6rem;color:var(--muted)">${i.unit} sugerido</div>
                </div>
                <button onclick="addCarrinho(${i.id})" title="Adicionar ao carrinho"
                  style="width:32px;height:32px;border-radius:50%;border:none;background:var(--purple);color:#fff;font-size:1.3rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px rgba(107,33,212,.25);transition:transform .15s"
                  onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">+</button>
              </div>
            `}
          </td>
        </tr>`;
    }).join('');

    return catRow + itemRows;
  }).join('');

  // Badge sidebar
  const badge = document.getElementById('badge-estoque');
  const critCount = insumos.filter(i => gst(i) === 'crit').length;
  if (badge) {
    badge.textContent  = critCount || '';
    badge.style.display = critCount > 0 ? 'inline-flex' : 'none';
  }
}

// ── Filtros ──────────────────────────────────────────────────
function setEstFiltro(status) {
  _estFiltro.status = _estFiltro.status === status ? 'all' : status;
  _renderFiltrosBtns();
  _renderEstKpis(items.filter(i => !i.isProd));
  _renderEstoqueTabela(items.filter(i => !i.isProd));
}

function setEstSearch(val) {
  _estFiltro.search = val;
  _renderEstoqueTabela(items.filter(i => !i.isProd));
}

function setEstCat(val) {
  _estFiltro.cat = val;
  _renderEstoqueTabela(items.filter(i => !i.isProd));
}

// ── Edição inline ──────────────────────────────────────────
function onQty(id, inp) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  const v = parseFloat(inp.value);
  if (isNaN(v) || v < 0) return;
  item.qty = parseFloat(v.toFixed(3));
  changedIds.add(id);

  const btn = document.getElementById('saveStockBtn');
  if (btn) btn.style.display = changedIds.size > 0 ? 'inline-flex' : 'none';

  // Atualiza barra inline sem re-render completo
  const row = document.getElementById(`est-row-${id}`);
  if (!row) return;
  const s   = gst(item);
  const pct = item.ideal > 0 ? Math.min(100, Math.round(item.qty / item.ideal * 100)) : 0;
  const stColors = { crit:'var(--red)', warn:'var(--yellow)', ok:'var(--green)' };
  const barEl    = row.querySelector('[style*="height:100%;width:"]');
  if (barEl) { barEl.style.width = pct + '%'; barEl.style.background = stColors[s]; }
}

function saveStock() {
  saveI();
  changedIds.clear();
  const btn = document.getElementById('saveStockBtn');
  if (btn) btn.style.display = 'none';
  toast('Estoque salvo!', 'ok');
  renderDashboard();
}

// ── CARRINHO ─────────────────────────────────────────────────
function addCarrinho(itemId) {
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  if (_carrinho.find(c => c.itemId === itemId)) return;
  const need = gneed(item);
  _carrinho.push({ itemId, qty: parseFloat(need.toFixed(3)), qtdSugerida: need, origem: 'estoque' });
  saveCarrinho();
  _renderEstoqueTabela(items.filter(i => !i.isProd));
  _renderCarrinhoSumario();
}

function removerCarrinho(itemId) {
  _carrinho = _carrinho.filter(c => c.itemId !== itemId);
  saveCarrinho();
  _renderEstoqueTabela(items.filter(i => !i.isProd));
  _renderCarrinhoSumario();
}

function ajustarCarrinho(itemId, delta) {
  const ci   = _carrinho.find(c => c.itemId === itemId);
  const item = items.find(i => i.id === itemId);
  if (!ci || !item) return;
  ci.qty = Math.max(0.001, parseFloat((ci.qty + delta).toFixed(3)));
  saveCarrinho();
  _renderEstoqueTabela(items.filter(i => !i.isProd));
  _renderCarrinhoSumario();
}

function setCarrinhoQty(itemId, val) {
  const ci = _carrinho.find(c => c.itemId === itemId);
  if (!ci) return;
  const v = parseFloat(val);
  if (!isNaN(v) && v > 0) { ci.qty = parseFloat(v.toFixed(3)); saveCarrinho(); }
  _renderCarrinhoSumario();
}

function limparCarrinho() {
  if (!_carrinho.length) return;
  if (!confirm('Limpar o carrinho?')) return;
  _carrinho = [];
  saveCarrinho();
  renderEstoque();
}

function _renderCarrinhoSumario() {
  const el = document.getElementById('carrinhoSumario');
  if (!el) return;

  if (!_carrinho.length) {
    el.innerHTML = `
      <div style="text-align:center;padding:20px 12px">
        ${lc('shopping-cart', 28, 'var(--border2)')}
        <div style="font-size:.78rem;color:var(--muted);margin-top:8px">Carrinho vazio</div>
        <div style="font-size:.68rem;color:var(--muted);margin-top:2px">Adicione itens na tabela</div>
      </div>`;
    return;
  }

  const total = _carrinho.reduce((s, ci) => {
    const item = items.find(i => i.id === ci.itemId);
    return s + ci.qty * (item?.cost || 0);
  }, 0);

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:3px;max-height:260px;overflow-y:auto;margin-bottom:10px">
      ${_carrinho.map(ci => {
        const item = items.find(i => i.id === ci.itemId);
        return `
          <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r6)">
            <div style="flex:1;min-width:0">
              <div style="font-size:.76rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item?.name || '?'}</div>
            </div>
            <div style="font-size:.72rem;font-family:monospace;color:var(--purple);white-space:nowrap;font-weight:700">${fmt(ci.qty)} ${item?.unit}</div>
            <button onclick="removerCarrinho(${ci.itemId})"
              style="background:none;border:none;color:var(--muted);cursor:pointer;padding:2px;flex-shrink:0;display:flex;align-items:center">
              ${lc('x', 13, 'var(--muted)')}
            </button>
          </div>`;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-top:1.5px solid var(--border);margin-bottom:10px">
      <span style="font-size:.73rem;font-weight:600;color:var(--text2)">${_carrinho.length} ${_carrinho.length === 1 ? 'item' : 'itens'}</span>
      <span style="font-size:.9rem;font-weight:800;color:var(--purple)">R$ ${fmt(total)}</span>
    </div>
    <button onclick="gerarListaCompras()"
      style="width:100%;padding:10px;background:var(--purple);color:#fff;border:none;border-radius:var(--r8);font-size:.82rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:background .15s"
      onmouseover="this.style.background='var(--purple2)'" onmouseout="this.style.background='var(--purple)'">
      ${lc('clipboard-list', 15, '#fff')} Gerar Lista de Compras
    </button>
    <button onclick="limparCarrinho()"
      style="width:100%;padding:7px;background:none;color:var(--muted);border:1px solid var(--border);border-radius:var(--r8);font-size:.72rem;cursor:pointer;margin-top:6px;display:flex;align-items:center;justify-content:center;gap:5px">
      ${lc('trash', 12, 'var(--muted)')} Limpar
    </button>`;
}

function gerarListaCompras() {
  if (!_carrinho.length) { toast('Carrinho vazio', 'err'); return; }
  const lista = novaLista(_carrinho);
  _carrinho   = [];
  saveCarrinho();
  toast(`Lista ${lista.codigo} criada!`, 'ok');
  renderEstoque();
  goModule('compras');
}

// ── CSV Import ────────────────────────────────────────────────
function openImportModal() {
  document.getElementById('ovImport').classList.add('open');
}

function handleDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) parseCSV(file);
  document.getElementById('dropzone')?.classList.remove('drag');
}

function handleFile(inp) { if (inp.files[0]) parseCSV(inp.files[0]); }

function parseCSV(file) {
  const reader = new FileReader();
  reader.onload = e => {
    let text = e.target.result.replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { toast('CSV inválido', 'err'); return; }

    const sep  = lines[0].includes(';') ? ';' : ',';
    const norm = s => s.trim().replace(/"/g,'').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const header = lines[0].split(sep).map(norm);
    const col    = (...keys) => header.findIndex(h => keys.some(k => h.includes(norm(k))));

    const nameIdx = col('insumo','nome','produto');
    const codeIdx = col('cod. interno','codigo interno','cod interno','code');
    const qtyIdx  = col('estoque atual','atual','qty');
    const minIdx  = col('estoque minimo','minimo','min');
    const costIdx = col('preco de custo','custo','price');

    if (nameIdx === -1 && codeIdx === -1) {
      toast('CSV não reconhecido — verifique se é o relatório do Cardápio Web', 'err');
      return;
    }

    const parseMoney = v => parseFloat((v||'').replace(/[R$\s]/g,'').replace(',','.')) || 0;
    const parseNum   = v => parseFloat((v||'').replace(',','.'));

    importData = [];
    const naoEncontrados = [];

    lines.slice(1).forEach(line => {
      const cols = line.split(sep).map(c => c.trim().replace(/"/g,''));
      const name = nameIdx >= 0 ? cols[nameIdx]||'' : '';
      const code = codeIdx >= 0 ? cols[codeIdx]||'' : '';
      const qty  = qtyIdx  >= 0 ? parseNum(cols[qtyIdx])  : NaN;
      const min  = minIdx  >= 0 ? parseNum(cols[minIdx])  : NaN;
      const cost = costIdx >= 0 ? parseMoney(cols[costIdx]): 0;

      if (!name && !code) return;
      if (isNaN(qty)) return;

      const item = items.find(i =>
        (code && i.code && i.code.toString() === code.toString()) ||
        (name && i.name.toLowerCase().trim() === name.toLowerCase().trim())
      );

      if (item) {
        importData.push({
          id: item.id, name: item.name,
          oldQty: item.qty, newQty: parseFloat(qty.toFixed(3)),
          oldMin: item.min, newMin: !isNaN(min) ? parseFloat(min.toFixed(3)) : item.min,
          oldCost: item.cost, newCost: cost > 0 ? cost : item.cost,
        });
      } else if (name) {
        naoEncontrados.push(name);
      }
    });

    const prev = document.getElementById('importPreview');
    if (!prev) return;

    if (!importData.length) {
      prev.innerHTML = `
        <div style="background:var(--red-light);border:1px solid #FCA5A5;border-radius:var(--r8);padding:12px;font-size:.78rem;color:var(--red)">
          ${lc('alert-circle', 14, 'var(--red)')}
          Nenhum item encontrado. Certifique-se que os códigos internos estão cadastrados em Cadastros → Insumos.
        </div>
        ${naoEncontrados.length ? `<div style="font-size:.7rem;color:var(--muted);margin-top:8px">${naoEncontrados.length} no CSV: ${naoEncontrados.slice(0,5).join(', ')}...</div>` : ''}`;
      return;
    }

    prev.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:.78rem;font-weight:700;color:var(--green)">${lc('check-circle',14,'var(--green)')} ${importData.length} itens reconhecidos</span>
        ${naoEncontrados.length ? `<span style="font-size:.7rem;color:var(--muted)">${naoEncontrados.length} não encontrados</span>` : ''}
      </div>
      <div style="max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;margin-bottom:12px">
        ${importData.map(d => `
          <div style="padding:8px 11px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r6)">
            <div style="font-size:.76rem;font-weight:600;margin-bottom:3px">${d.name}</div>
            <div style="display:flex;gap:14px;font-family:monospace;font-size:.7rem;color:var(--muted)">
              <span>Qtd: <strong>${d.oldQty}</strong> → <strong style="color:var(--purple)">${d.newQty}</strong></span>
              ${Math.abs(d.newMin - d.oldMin) > 0.001 ? `<span>Mín: ${d.oldMin}→<strong style="color:var(--purple)">${d.newMin}</strong></span>` : ''}
              ${d.newCost !== d.oldCost && d.newCost > 0 ? `<span>Custo: R$${d.oldCost}→<strong style="color:var(--green)">R$${d.newCost}</strong></span>` : ''}
            </div>
          </div>`).join('')}
      </div>
      ${naoEncontrados.length ? `
        <div style="font-size:.68rem;color:var(--muted);background:var(--surface2);border-radius:var(--r6);padding:7px 10px;margin-bottom:10px">
          Não encontrados: ${naoEncontrados.slice(0,8).join(', ')}${naoEncontrados.length>8?'...':''}
        </div>` : ''}
      <button class="btn btn-primary" style="width:100%" onclick="confirmImport()">
        ${lc('check', 14, '#fff')} Confirmar importação
      </button>`;
  };
  reader.readAsText(file, 'UTF-8');
}

function confirmImport() {
  importData.forEach(d => {
    const item = items.find(i => i.id === d.id);
    if (!item) return;
    item.qty  = d.newQty;
    if (d.newMin !== undefined) item.min = d.newMin;
    if (d.newCost > 0)          item.cost = d.newCost;
  });
  saveI();
  closeModal('ovImport');
  toast(`${importData.length} itens atualizados!`, 'ok');
  renderEstoque();
  renderDashboard();
  importData = [];
}

// ── Compat legado ─────────────────────────────────────────────
function goToCompras()        { if (_carrinho.length) gerarListaCompras(); else goModule('compras'); }
function iniciarCompras()     { goModule('compras'); }
function updateEstSelCount()  {}
function selectEstByStatus()  {}
function toggleEstAll()       {}
