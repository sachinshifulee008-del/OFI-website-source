#!/bin/bash
cd /home/z/my-project
setsid nohup bun run dev > dev.log 2>&1 < /dev/null &
for i in $(seq 1 30); do sleep 1; code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null); [ "$code" = "200" ] && break; done
echo "server: HTTP $code"
agent-browser close 2>/dev/null
agent-browser set viewport 375 812
agent-browser open http://localhost:3000
agent-browser wait --load networkidle

echo "== find overflowing elements (mobile 375) =="
agent-browser eval "(function(){ const out=[]; document.querySelectorAll('body *').forEach(el=>{ const r=el.getBoundingClientRect(); if(r.width>0 && (r.right>window.innerWidth+1 || r.left<-1) && getComputedStyle(el).position!=='fixed'){ out.push(el.tagName+'.'+String(el.className).slice(0,60)+' right='+Math.round(r.right)+' left='+Math.round(r.left)); } }); return JSON.stringify(out.slice(0,12)); })()"

echo "== scroll to earth =="
agent-browser eval "document.getElementById('earth')?.scrollIntoView({behavior:'instant'}); 'ok'"
agent-browser wait 2500

echo "== overflow after scene mounted? =="
agent-browser eval "(function(){ const out=[]; document.querySelectorAll('body *').forEach(el=>{ const r=el.getBoundingClientRect(); if(r.width>0 && (r.right>window.innerWidth+1 || r.left<-1) && getComputedStyle(el).position!=='fixed'){ out.push(el.tagName+'.'+String(el.className).slice(0,60)+' right='+Math.round(r.right)); } }); return JSON.stringify({overflow: document.documentElement.scrollWidth>window.innerWidth, sw: document.documentElement.scrollWidth, list: out.slice(0,12)}); })()"

echo "== zoom via synthetic WheelEvent on canvas =="
agent-browser eval "(function(){ const g=window.__ofiGlobe; if(!g) return 'no bridge'; const before=g.camera.position.length(); const c=document.querySelector('#earth canvas'); c.dispatchEvent(new WheelEvent('wheel',{deltaY:400,bubbles:true,cancelable:true})); return new Promise(res=>setTimeout(()=>res('before='+before.toFixed(2)+' after='+g.camera.position.length().toFixed(2)),700)); })()"
