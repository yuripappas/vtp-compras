/**
 * VTP Compras — Vai Ter Pizza!
 * cadastros.js — Módulo de Cadastros (Insumos, Fornecedores, Pré-preparo)
 */

// ══════════════════════════════════════════════════════════════
// NAVEGAÇÃO DAS ABAS DE CADASTRO
// ══════════════════════════════════════════════════════════════

function setCadTab(tab) {
  ['insumos', 'fornecedores', 'preparo'].forEach(t => {
    document.getElementById(`cad-${t}`).style.display = t === tab ? 'block' : 'none';
    const btn = document.getElementById(`cad-tab-${t}`);
    if (btn) {
      btn.style.color            = t === tab ? 'var(--purple)' : 'var(--muted)';
      btn.style.borderBottomColor = t === tab ? 'var(--purple)' : 'transparent';
    }
  });
  if (tab === 'insumos')      renderCadInsumos();
  if (tab === 'fornecedores') renderFornecedores();
  if (tab === 'preparo')      renderPreparoGrid();
}

function renderCadastros() {
  setCadTab('insumos');
}

// ══════════════════════════════════════════════════════════════
// CADASTRO DE INSUMOS
// ══════════════════════════════════════════════════════════════

function renderCadInsumos() {
  const q   = document.getElementById('srchCadInsumos')?.value?.toLowerCase() || '';
  const cat = document.getElementById('catCadFil')?.value || '';

  const insumos = items.filter(i => !i.isProd);

  // Popula filtro de categoria
  const cats  = [...new Set(insumos.map(i => i.cat))].sort();
  const catEl = document.getElementById('catCadFil');
  if (catEl) {
    const cur = catEl.value;
    catEl.innerHTML = '<option value="">Todas categorias</option>' +
      cats.map(c => `<option value="${c}"${c === cur ? ' selected' : ''}>${c}</option>`).join('');
    const dl = document.getElementById('catDL');
    if (dl) dl.innerHTML = cats.map(c => `<option value="${c}">`).join('');
  }

  let filt = insumos.filter(i => {
    if (q && !i.name.toLowerCase().includes(q) && !i.cat.toLowerCase().includes(q)) return false;
    if (cat && i.cat !== cat) return false;
    return true;
  }).sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name));

  const el = document.getElementById('cadInsumosGrid');
  if (!filt.length) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📦</div><div style="font-weight:700;margin-bottom:4px">Nenhum insumo cadastrado</div><div>Clique em "+ Novo Insumo" para começar</div></div>`;
    return;
  }

  // Agrupa por categoria
  const bycat = {};
  filt.forEach(i => { if (!bycat[i.cat]) bycat[i.cat] = []; bycat[i.cat].push(i); });

  el.innerHTML = Object.entries(bycat).map(([cat, catItems]) => `
    <div style="margin-bottom:24px">
      <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">${cat} <span style="font-weight:400">(${catItems.length})</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">
        ${catItems.map(item => {
          const b   = (item.brands || []).filter(x => x);
          const sup = suppliers.find(s => s.id === item.supId);
          return `<div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r10);padding:14px;transition:border-color .15s;cursor:pointer" onclick="openEditItem(${item.id})">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px">
              <div>
                <div style="font-size:.84rem;font-weight:700">${item.name}</div>
                <div style="font-size:.67rem;color:var(--muted);margin-top:2px">${item.unit}${item.code ? ' · #' + item.code : ''}</div>
              </div>
              <button class="btn btn-outline btn-xs" onclick="event.stopPropagation();openEditItem(${item.id})">✏️</button>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:.72rem;color:var(--text2)">
              <div style="display:flex;justify-content:space-between">
                <span style="color:var(--muted)">Mínimo</span><span style="font-weight:600">${item.min} ${item.unit}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:var(--muted)">Ideal</span><span style="font-weight:600">${item.ideal} ${item.unit}</span>
              </div>
              <div style="display:flex;justify-content:space-between">
                <span style="color:var(--muted)">Custo ref.</span><span style="font-weight:600;color:var(--purple)">R$ ${fmt(item.cost)}</span>
              </div>
            </div>
            ${sup ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);font-size:.68rem;color:var(--muted)">🏢 ${sup.name}</div>` : ''}
            ${b.length ? `<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:7px">${b[0] ? `<span class="badge b-purple" style="font-size:.58rem">⭐ ${b[0]}</span>` : ''}${b.slice(1).map(x => `<span class="badge b-gray" style="font-size:.58rem">${x}</span>`).join('')}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
}

// ── Modal insumo (sem campo qty — só cadastro) ──
function openItemModal() {
  editItemId = null;
  document.getElementById('itemModalTitle').textContent = 'Novo Insumo';
  document.getElementById('eItemId').value = '';
  ['fName','fCat','fB0','fB1','fB2','fCode'].forEach(id => document.getElementById(id).value = '');
  ['fMin','fIdeal','fCost'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fUnit').value = 'kg';
  populateSupSel(null);
  document.getElementById('delItemBtn').style.display = 'none';
  document.getElementById('ovItem').classList.add('open');
  setTimeout(() => document.getElementById('fName').focus(), 80);
}

function openEditItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  editItemId = id;
  document.getElementById('itemModalTitle').textContent = `✏️ ${item.name}`;
  document.getElementById('fName').value  = item.name;
  document.getElementById('fCat').value   = item.cat;
  document.getElementById('fUnit').value  = item.unit;
  document.getElementById('fMin').value   = item.min;
  document.getElementById('fIdeal').value = item.ideal;
  document.getElementById('fCost').value  = item.cost;
  document.getElementById('fCode').value  = item.code || '';
  const b = item.brands || [];
  document.getElementById('fB0').value = b[0] || '';
  document.getElementById('fB1').value = b[1] || '';
  document.getElementById('fB2').value = b[2] || '';
  populateSupSel(item.supId);
  document.getElementById('delItemBtn').style.display = 'inline-flex';
  document.getElementById('ovItem').classList.add('open');
}

function populateSupSel(selId) {
  document.getElementById('fSupId').innerHTML =
    '<option value="">— Sem fornecedor —</option>' +
    suppliers.map(s => `<option value="${s.id}"${s.id === selId ? ' selected' : ''}>${s.name}</option>`).join('');
}

function saveItem() {
  const name = document.getElementById('fName').value.trim();
  if (!name) { toast('Informe o nome', 'err'); return; }
  const supVal = document.getElementById('fSupId').value;
  const data = {
    name,
    cat:    document.getElementById('fCat').value.trim() || 'Outros',
    unit:   document.getElementById('fUnit').value,
    min:    parseFloat(document.getElementById('fMin').value)   || 0,
    ideal:  parseFloat(document.getElementById('fIdeal').value) || 0,
    cost:   parseFloat(document.getElementById('fCost').value)  || 0,
    code:   document.getElementById('fCode').value.trim(),
    supId:  supVal ? parseInt(supVal) : null,
    brands: [
      document.getElementById('fB0').value.trim(),
      document.getElementById('fB1').value.trim(),
      document.getElementById('fB2').value.trim(),
    ],
    isProd: false,
  };
  if (editItemId) {
    const idx = items.findIndex(i => i.id === editItemId);
    if (idx >= 0) items[idx] = { ...items[idx], ...data };
    toast(`✅ "${name}" atualizado!`);
  } else {
    items.push({ id: nextIid++, qty: 0, ...data });
    toast(`✅ "${name}" adicionado!`);
  }
  saveI();
  closeModal('ovItem');
  renderCadInsumos();
  renderDashboard();
}

function deleteItem() {
  if (!editItemId) return;
  const item = items.find(i => i.id === editItemId);
  if (!item || !confirm(`Excluir "${item.name}"?`)) return;
  items = items.filter(i => i.id !== editItemId);
  saveI();
  closeModal('ovItem');
  renderCadInsumos();
  renderDashboard();
  toast(`🗑 "${item.name}" excluído.`);
}

// ══════════════════════════════════════════════════════════════
// CADASTRO DE PRÉ-PREPARO
// ══════════════════════════════════════════════════════════════

let editPreparoId = null;

function renderPreparoGrid() {
  const prods = items.filter(i => i.isProd);
  const el    = document.getElementById('preparoGrid');

  if (!prods.length) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🍳</div><div style="font-weight:700;margin-bottom:4px">Nenhum preparado cadastrado</div><div>Clique em "+ Novo Preparado" para começar</div></div>`;
    return;
  }

  el.innerHTML = prods.map(item => `
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r12);padding:16px;cursor:pointer;transition:border-color .15s" onclick="openEditPreparo(${item.id})">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div>
          <div style="font-size:.88rem;font-weight:700">${item.name}</div>
          <div style="font-size:.67rem;color:var(--muted);margin-top:2px">Produção Interna · ${item.unit}</div>
        </div>
        <button class="btn btn-outline btn-xs" onclick="event.stopPropagation();openEditPreparo(${item.id})">✏️</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;font-size:.73rem">
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--muted)">Custo produção</span>
          <span style="font-weight:700;color:var(--purple)">R$ ${fmt(item.cost)}/${item.unit}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--muted)">Qtd. mínima</span>
          <span style="font-weight:600">${item.min} ${item.unit}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:var(--muted)">Qtd. ideal</span>
          <span style="font-weight:600">${item.ideal} ${item.unit}</span>
        </div>
        ${item.medPorcao ? `<div style="display:flex;justify-content:space-between">
          <span style="color:var(--muted)">Porção/pizza</span>
          <span style="font-weight:600">${item.medPorcao} kg</span>
        </div>` : ''}
      </div>
      ${item.obs ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:.68rem;color:var(--muted);line-height:1.5">${item.obs}</div>` : ''}
    </div>`).join('');
}

function openPreparoModal() {
  editPreparoId = null;
  document.getElementById('preparoModalTitle').textContent = 'Novo Preparado';
  document.getElementById('ePreparoId').value = '';
  ['fpName','fpCode','fpCost','fpMin','fpIdeal','fpPorcao','fpObs'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fpUnit').value = 'kg';
  document.getElementById('delPreparoBtn').style.display = 'none';
  document.getElementById('ovPreparo').classList.add('open');
  setTimeout(() => document.getElementById('fpName').focus(), 80);
}

function openEditPreparo(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  editPreparoId = id;
  document.getElementById('preparoModalTitle').textContent = `✏️ ${item.name}`;
  document.getElementById('fpName').value   = item.name;
  document.getElementById('fpCode').value   = item.code  || '';
  document.getElementById('fpUnit').value   = item.unit;
  document.getElementById('fpCost').value   = item.cost;
  document.getElementById('fpMin').value    = item.min;
  document.getElementById('fpIdeal').value  = item.ideal;
  document.getElementById('fpPorcao').value = item.medPorcao || '';
  document.getElementById('fpObs').value    = item.obs || '';
  document.getElementById('delPreparoBtn').style.display = 'inline-flex';
  document.getElementById('ovPreparo').classList.add('open');
}

function savePreparo() {
  const name = document.getElementById('fpName').value.trim();
  if (!name) { toast('Informe o nome', 'err'); return; }
  const data = {
    name,
    code:      document.getElementById('fpCode').value.trim(),
    cat:       'Produção Interna',
    unit:      document.getElementById('fpUnit').value,
    cost:      parseFloat(document.getElementById('fpCost').value)   || 0,
    min:       parseFloat(document.getElementById('fpMin').value)    || 0,
    ideal:     parseFloat(document.getElementById('fpIdeal').value)  || 0,
    medPorcao: parseFloat(document.getElementById('fpPorcao').value) || null,
    obs:       document.getElementById('fpObs').value.trim(),
    isProd:    true,
    brands:    [],
    supId:     null,
  };
  if (editPreparoId) {
    const idx = items.findIndex(i => i.id === editPreparoId);
    if (idx >= 0) items[idx] = { ...items[idx], ...data };
    toast(`✅ "${name}" atualizado!`);
  } else {
    items.push({ id: nextIid++, qty: 0, code: '', ...data });
    toast(`✅ "${name}" adicionado!`);
  }
  saveI();
  closeModal('ovPreparo');
  renderPreparoGrid();
  renderDashboard();
}

function deletePreparo() {
  const item = items.find(i => i.id === editPreparoId);
  if (!item || !confirm(`Excluir "${item.name}"?`)) return;
  items = items.filter(i => i.id !== editPreparoId);
  saveI();
  closeModal('ovPreparo');
  renderPreparoGrid();
  renderDashboard();
  toast(`🗑 "${item.name}" excluído.`);
}

// ══════════════════════════════════════════════════════════════
// FORNECEDORES (dentro de Cadastros)
// ══════════════════════════════════════════════════════════════

function renderFornecedores() {
  const q  = document.getElementById('srchCadForn')?.value?.toLowerCase() || '';
  const el = document.getElementById('supGrid');
  if (!el) return;

  let filt = suppliers.filter(s => !q || s.name.toLowerCase().includes(q) || (s.seller || '').toLowerCase().includes(q));

  if (!filt.length) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🏢</div><div style="font-size:.9rem;font-weight:700;margin-bottom:4px">Nenhum fornecedor</div><div>Cadastre seu primeiro fornecedor!</div></div>`;
    return;
  }

  el.innerHTML = filt.map(s => {
    const si = items.filter(i => i.supId === s.id);
    return `<div style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r12);padding:16px;cursor:pointer;transition:border-color .15s" onclick="openEditSup(${s.id})">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div>
          <div style="font-size:.88rem;font-weight:700">${s.name}</div>
          ${s.seller ? `<div style="font-size:.72rem;color:var(--muted);margin-top:2px">👤 ${s.seller}</div>` : ''}
        </div>
        <button class="btn btn-outline btn-xs" onclick="event.stopPropagation();openEditSup(${s.id})">✏️</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:10px">
        ${s.phone ? `<div style="font-size:.74rem;color:var(--text2)">📞 ${s.phone}</div>` : ''}
        ${s.email ? `<div style="font-size:.74rem;color:var(--text2)">✉️ ${s.email}</div>` : ''}
        ${s.cats  ? `<div style="font-size:.72rem;color:var(--muted)">${s.cats}</div>`  : ''}
      </div>
      ${si.length
        ? `<div style="display:flex;flex-wrap:wrap;gap:4px">${si.map(i => `<span class="badge b-purple" style="font-size:.6rem">${i.name}</span>`).join('')}</div>`
        : '<div style="font-size:.71rem;color:var(--muted)">Sem insumos vinculados</div>'}
    </div>`;
  }).join('');
}

function openSupModal() {
  editSupId = null;
  document.getElementById('supModalTitle').textContent = 'Novo Fornecedor';
  ['sfName','sfSeller','sfPhone','sfEmail','sfCats'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('eSupId').value = '';
  document.getElementById('delSupBtn').style.display = 'none';
  renderSupCbx([]);
  document.getElementById('ovSup').classList.add('open');
  setTimeout(() => document.getElementById('sfName').focus(), 80);
}

function openEditSup(id) {
  const s = suppliers.find(x => x.id === id);
  if (!s) return;
  editSupId = id;
  document.getElementById('supModalTitle').textContent = `✏️ ${s.name}`;
  document.getElementById('sfName').value   = s.name   || '';
  document.getElementById('sfSeller').value = s.seller || '';
  document.getElementById('sfPhone').value  = s.phone  || '';
  document.getElementById('sfEmail').value  = s.email  || '';
  document.getElementById('sfCats').value   = s.cats   || '';
  document.getElementById('eSupId').value   = id;
  document.getElementById('delSupBtn').style.display = 'inline-flex';
  renderSupCbx(items.filter(i => i.supId === id).map(i => i.id));
  document.getElementById('ovSup').classList.add('open');
}

function renderSupCbx(linked, searchQ) {
  const q = (searchQ || document.getElementById('sfItemSearch')?.value || '').toLowerCase();
  const filt = [...items]
    .filter(i => !i.isProd)
    .filter(i => !q || i.name.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q))
    .sort((a, b) => a.cat.localeCompare(b.cat) || a.name.localeCompare(b.name));

  const el = document.getElementById('sfItems');
  if (!filt.length) {
    el.innerHTML = `<div style="text-align:center;color:var(--muted);font-size:.75rem;padding:12px">Nenhum insumo encontrado</div>`;
    return;
  }

  // Agrupa por categoria
  const byCat = {};
  filt.forEach(i => { if (!byCat[i.cat]) byCat[i.cat] = []; byCat[i.cat].push(i); });

  el.innerHTML = Object.entries(byCat).map(([cat, catItems]) => `
    <div style="margin-bottom:6px">
      <div style="font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);padding:4px 6px">${cat}</div>
      ${catItems.map(i => `
        <label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:var(--r6);cursor:pointer;font-size:.77rem;background:var(--surface);border:1.5px solid ${linked.includes(i.id) ? 'var(--purple-light)' : 'var(--border)'};margin-bottom:3px;transition:all .1s">
          <input type="checkbox" value="${i.id}" ${linked.includes(i.id) ? 'checked' : ''} style="width:14px;height:14px;accent-color:var(--purple)" onchange="this.closest('label').style.borderColor=this.checked?'var(--purple-light)':'var(--border)';this.closest('label').style.background=this.checked?'var(--purple-xlight)':'var(--surface)'">
          <span style="flex:1">${i.name}</span>
          ${i.code ? `<span style="font-size:.58rem;color:var(--muted);font-family:monospace">#${i.code}</span>` : ''}
        </label>`).join('')}
    </div>`).join('');
}

function filterSupItems() {
  const linked = [...document.querySelectorAll('#sfItems input:checked')].map(c => parseInt(c.value));
  renderSupCbx(linked);
}

function saveSup() {
  const name = document.getElementById('sfName').value.trim();
  if (!name) { toast('Informe o nome', 'err'); return; }
  const checked = [...document.querySelectorAll('#sfItems input:checked')].map(c => parseInt(c.value));
  const data = {
    name,
    seller: document.getElementById('sfSeller').value.trim(),
    phone:  document.getElementById('sfPhone').value.trim(),
    email:  document.getElementById('sfEmail').value.trim(),
    cats:   document.getElementById('sfCats').value.trim(),
  };
  if (editSupId) {
    const idx = suppliers.findIndex(s => s.id === editSupId);
    if (idx >= 0) suppliers[idx] = { ...suppliers[idx], ...data };
    items.forEach(i => { if (i.supId === editSupId) i.supId = null; });
    checked.forEach(iid => { const it = items.find(i => i.id === iid); if (it) it.supId = editSupId; });
    toast(`✅ "${name}" atualizado!`);
  } else {
    const nid = nextSid++;
    suppliers.push({ id: nid, ...data });
    checked.forEach(iid => { const it = items.find(i => i.id === iid); if (it) it.supId = nid; });
    toast(`✅ "${name}" cadastrado!`);
  }
  saveS(); saveI();
  closeModal('ovSup');
  renderFornecedores();
  renderDashboard();
}

function deleteSup() {
  const s = suppliers.find(x => x.id === editSupId);
  if (!s || !confirm(`Excluir "${s.name}"?`)) return;
  suppliers = suppliers.filter(x => x.id !== editSupId);
  items.forEach(i => { if (i.supId === editSupId) i.supId = null; });
  saveS(); saveI();
  closeModal('ovSup');
  renderFornecedores();
  renderDashboard();
  toast(`🗑 "${s.name}" excluído.`);
}
