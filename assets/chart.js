/* ============ 轻量 Chart 渲染：纯 SVG，无外部依赖 ============ */
(function(global){
  const NS='http://www.w3.org/2000/svg';
  function el(name,attrs={},parent){
    const e=document.createElementNS(NS,name);
    for(const k in attrs) e.setAttribute(k, attrs[k]);
    if(parent) parent.appendChild(e);
    return e;
  }

  // 柱状/折线组合图
  function barLineChart(container, data){
    // data: {labels:[], bars:[{name,values,color}], lines:[{name,values,color}], yUnit:''}
    const rect = container.getBoundingClientRect();
    const W = rect.width || 600, H = rect.height || 260;
    const padL=44,padR=30,padT=20,padB=34;
    const iw = W-padL-padR, ih = H-padT-padB;
    container.innerHTML='';
    const svg = el('svg',{viewBox:`0 0 ${W} ${H}`,width:'100%',height:'100%'},container);

    // 合并所有 y 值求最大
    let maxV = 0;
    (data.bars||[]).forEach(s=> s.values.forEach(v=> maxV = Math.max(maxV,v)));
    (data.lines||[]).forEach(s=> s.values.forEach(v=> maxV = Math.max(maxV,v)));
    maxV = maxV === 0 ? 1 : maxV*1.15;

    // 坐标
    const n = data.labels.length;
    const bandW = iw / n;

    // 网格+y轴
    const ticks = 4;
    for(let i=0;i<=ticks;i++){
      const y = padT + ih*(1 - i/ticks);
      const v = (maxV*i/ticks);
      el('line',{x1:padL,y1:y,x2:W-padR,y2:y,stroke:'rgba(120,180,255,.08)','stroke-width':1},svg);
      const t = el('text',{x:padL-8,y:y+4,'text-anchor':'end',fill:'#6b7e99','font-size':10},svg);
      t.textContent = fmt(v) + (data.yUnit||'');
    }

    // x轴标签
    data.labels.forEach((lb,i)=>{
      const x = padL + bandW*(i+.5);
      const t = el('text',{x,y:H-padB+18,'text-anchor':'middle',fill:'#a9bcd6','font-size':11},svg);
      t.textContent = lb;
    });

    // 柱
    const barSeries = data.bars || [];
    const groupW = bandW*0.6;
    const eachW = groupW / Math.max(barSeries.length,1);
    barSeries.forEach((s,si)=>{
      s.values.forEach((v,i)=>{
        const h = ih * (v / maxV);
        const x = padL + bandW*i + (bandW-groupW)/2 + eachW*si;
        const y = padT + ih - h;
        const grad = `grad-${si}`;
        if(si === 0 && i === 0){
          const defs = el('defs',{},svg);
          barSeries.forEach((ss,ssi)=>{
            const lg = el('linearGradient',{id:`grad-${ssi}`,x1:0,y1:0,x2:0,y2:1},defs);
            el('stop',{offset:'0%','stop-color':ss.color||'#22e3d6','stop-opacity':.9},lg);
            el('stop',{offset:'100%','stop-color':ss.color||'#3f8cff','stop-opacity':.3},lg);
          });
        }
        el('rect',{x,y,width:eachW-2,height:h,rx:2,fill:`url(#${grad})`},svg);
      });
    });

    // 折线
    (data.lines||[]).forEach((s)=>{
      const pts = s.values.map((v,i)=>{
        const x = padL + bandW*(i+.5);
        const y = padT + ih*(1 - v/maxV);
        return [x,y];
      });
      const d = pts.map((p,i)=> (i===0?'M':'L')+p[0]+','+p[1]).join(' ');
      el('path',{d,fill:'none',stroke:s.color||'#ffb648','stroke-width':2},svg);
      pts.forEach(p=>{
        el('circle',{cx:p[0],cy:p[1],r:3,fill:s.color||'#ffb648'},svg);
      });
    });
  }

  // 环形图
  function donutChart(container, data){
    // data: {items:[{name,value,color}], center:'标题'}
    const rect = container.getBoundingClientRect();
    const W = rect.width || 400, H = rect.height || 260;
    container.innerHTML='';
    const svg = el('svg',{viewBox:`0 0 ${W} ${H}`,width:'100%',height:'100%'},container);
    const cx = W/2 - 60, cy = H/2, R = Math.min(W,H)/2 - 30, r = R*0.62;
    const total = data.items.reduce((s,x)=> s+x.value, 0) || 1;
    let acc = -Math.PI/2;
    data.items.forEach(it=>{
      const ang = (it.value/total) * Math.PI * 2;
      const a0 = acc, a1 = acc+ang;
      const large = ang > Math.PI ? 1 : 0;
      const xo0 = cx + R*Math.cos(a0), yo0 = cy + R*Math.sin(a0);
      const xo1 = cx + R*Math.cos(a1), yo1 = cy + R*Math.sin(a1);
      const xi0 = cx + r*Math.cos(a0), yi0 = cy + r*Math.sin(a0);
      const xi1 = cx + r*Math.cos(a1), yi1 = cy + r*Math.sin(a1);
      const d = [
        `M ${xo0} ${yo0}`,
        `A ${R} ${R} 0 ${large} 1 ${xo1} ${yo1}`,
        `L ${xi1} ${yi1}`,
        `A ${r} ${r} 0 ${large} 0 ${xi0} ${yi0}`,
        'Z'
      ].join(' ');
      el('path',{d,fill:it.color},svg);
      acc = a1;
    });
    // 中心文字
    const cT = el('text',{x:cx,y:cy-4,'text-anchor':'middle',fill:'#eaf2ff','font-size':14},svg);
    cT.textContent = data.center || '';
    const cV = el('text',{x:cx,y:cy+18,'text-anchor':'middle',fill:'#6b7e99','font-size':11},svg);
    cV.textContent = data.centerSub || '';

    // 图例
    const lx = cx + R + 20;
    data.items.forEach((it,i)=>{
      const ly = cy - (data.items.length*20)/2 + i*22;
      el('rect',{x:lx,y:ly-8,width:10,height:10,rx:2,fill:it.color},svg);
      const t = el('text',{x:lx+18,y:ly+1,fill:'#a9bcd6','font-size':12},svg);
      t.textContent = `${it.name}  ${it.value}${it.unit||''}`;
    });
  }

  function fmt(v){
    if(v>=10000) return (v/10000).toFixed(1)+'w';
    if(v>=1000) return (v/1000).toFixed(1)+'k';
    if(v%1===0) return v.toFixed(0);
    return v.toFixed(1);
  }

  global.SWChart = { barLineChart, donutChart };
})(window);
