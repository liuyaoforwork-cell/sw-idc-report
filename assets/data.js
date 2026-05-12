/* ================ 数据驱动渲染：所有页面共用工具 ================ */
(function(global){

  // 读取 JSON 数据（带相对路径自动适配）
  async function loadData(name){
    const base = location.pathname.includes('/pages/') ? '../data/' : 'data/';
    const url = base + name + '.json?t=' + Date.now(); // 防缓存
    try{
      const r = await fetch(url);
      if(!r.ok) throw new Error('HTTP '+r.status);
      return await r.json();
    }catch(e){
      console.error('数据加载失败：', url, e);
      showLoadError(name, e);
      return null;
    }
  }

  function showLoadError(name, e){
    const box = document.createElement('div');
    box.className = 'notice';
    box.style.background = 'rgba(255,90,106,.08)';
    box.style.borderColor = 'rgba(255,90,106,.3)';
    box.style.color = '#ffc2c8';
    box.innerHTML = `<b>数据加载失败：</b>${name}.json — ${e.message}。可能原因：1) 本地直接打开 HTML 浏览器限制 fetch，请用本地服务器；2) data 目录文件缺失。`;
    const ct = document.querySelector('.container');
    if(ct) ct.insertBefore(box, ct.firstChild);
  }

  function htmlEscape(s){
    if(s == null) return '';
    return String(s).replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  // KPI 卡片渲染
  function renderKpi(container, kpiArr){
    container.innerHTML = kpiArr.map(k => `
      <div class="card kpi">
        <div class="kpi-ico">${htmlEscape(k.icon)}</div>
        <div class="label">${htmlEscape(k.label)}</div>
        <div class="value">${htmlEscape(k.value)}<span class="unit">${htmlEscape(k.unit||'')}</span></div>
        <div class="delta ${htmlEscape(k.delta_type||'flat')}">${htmlEscape(k.delta||'')}</div>
      </div>
    `).join('');
  }

  // 通用表格渲染
  function renderTable(container, columns, rows){
    container.innerHTML = `
      <table class="tbl">
        <thead><tr>${columns.map(c=>`<th>${htmlEscape(c.label)}</th>`).join('')}</tr></thead>
        <tbody>
          ${rows.map(r => '<tr>' + columns.map(c=>{
            const v = c.render ? c.render(r) : htmlEscape(r[c.key]);
            return `<td>${v}</td>`;
          }).join('') + '</tr>').join('')}
        </tbody>
      </table>`;
  }

  // 显示更新时间标签
  function renderMeta(meta){
    const el = document.getElementById('updateMeta');
    if(el && meta) el.textContent = `数据更新时间：${meta.updated_at || '—'} · 来源：${meta.data_source || '—'}`;
  }

  global.SWData = { loadData, renderKpi, renderTable, htmlEscape, renderMeta };
})(window);
