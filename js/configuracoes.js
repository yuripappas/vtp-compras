/**
 * VTP Compras — Vai Ter Pizza!
 * configuracoes.js — Módulo de Configurações
 */

function renderConfiguracoes() {
  const cfg = getConfig();
  document.getElementById('cfgEmpresa').value    = cfg.empresa    || 'Vai Ter Pizza!';
  document.getElementById('cfgResponsavel').value = cfg.responsavel || '';
  document.getElementById('cfgWhatsapp').value   = cfg.whatsapp   || '';
  document.getElementById('cfgCodLoja').value    = cfg.codLoja    || '';
  document.getElementById('cfgPctCrit').value    = cfg.pctCrit    || '40';
}

function saveConfiguracoes() {
  const cfg = {
    empresa:     document.getElementById('cfgEmpresa').value.trim(),
    responsavel: document.getElementById('cfgResponsavel').value.trim(),
    whatsapp:    document.getElementById('cfgWhatsapp').value.replace(/\D/g, ''),
    codLoja:     document.getElementById('cfgCodLoja').value.trim(),
    pctCrit:     document.getElementById('cfgPctCrit').value || '40',
  };
  localStorage.setItem('vtp_config', JSON.stringify(cfg));
  // Atualiza nome na sidebar
  if (cfg.responsavel) {
    const el = document.getElementById('sbUserName');
    if (el) el.textContent = cfg.responsavel;
  }
  toast('${lc("check-circle",14,"var(--green)")} Configurações salvas!');
}

function getConfig() {
  return JSON.parse(localStorage.getItem('vtp_config') || '{}');
}

/** Retorna o WhatsApp da empresa configurado */
function getEmpresaWhatsapp() {
  return getConfig().whatsapp || '';
}
