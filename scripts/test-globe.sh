#!/bin/bash
# One-shot verification session: start dev server, load page, exercise the
# 3D Earth scene (idle render, marker click → camera focus + info panel),
# capture screenshots and errors. Processes don't survive between tool calls,
# so everything happens in this single session.
cd /home/z/my-project

echo "== starting dev server =="
setsid nohup bun run dev > dev.log 2>&1 < /dev/null &
for i in $(seq 1 30); do
  sleep 1
  code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
  [ "$code" = "200" ] && break
done
echo "server: HTTP $code"

echo "== open page =="
agent-browser close 2>/dev/null
agent-browser set viewport 1440 900
agent-browser open http://localhost:3000 || exit 1
agent-browser wait --load networkidle

echo "== scroll to globe section =="
agent-browser eval "document.getElementById('earth')?.scrollIntoView({behavior:'instant', block:'start'}); 'ok'"
agent-browser wait 3000

echo "== scene diagnostics =="
agent-browser eval "(function(){ const c=document.querySelector('#earth canvas'); if(!c) return 'NO CANVAS'; const g=window.__ofiGlobe; return JSON.stringify({canvas: c.width+'x'+c.height, bridge: !!g, webgl: !!c.getContext('webgl2')||!!c.getContext('webgl')}); })()"

echo "== marker screen coords =="
agent-browser eval "(function(){ const g=window.__ofiGlobe; if(!g) return 'NO BRIDGE'; const obj=g.scene.getObjectByName('marker-glenn'); if(!obj) return 'NO MARKER'; const v=new (obj.position.constructor)(0,0,0); obj.getWorldPosition(v); v.project(g.camera); const c=document.querySelector('#earth canvas'); const r=c.getBoundingClientRect(); const x=Math.round(r.left+(v.x*0.5+0.5)*c.clientWidth); const y=Math.round(r.top+(-v.y*0.5+0.5)*c.clientHeight); window.__markerXY=[x,y]; return 'glenn viewport '+x+','+y+' rect '+Math.round(r.left)+','+Math.round(r.top)+' canvas '+c.clientWidth+'x'+c.clientHeight; })()"

agent-browser wait 500
agent-browser screenshot /tmp/globe-idle.jpg
echo "idle screenshot done"

echo "== click marker =="
XY=$(agent-browser eval "JSON.stringify(window.__markerXY||null)")
echo "XY=$XY"
X=$(echo "$XY" | tr -d '"[]' | cut -d, -f1)
Y=$(echo "$XY" | tr -d '"[]' | cut -d, -f2)
if [ -n "$X" ] && [ "$X" != "null" ]; then
  agent-browser mouse move "$X" "$Y"
  agent-browser wait 400
  agent-browser screenshot /tmp/globe-hover.jpg
  agent-browser mouse down left
  agent-browser mouse up left
  agent-browser wait 2500
  agent-browser screenshot /tmp/globe-selected.jpg
  echo "== info panel present? =="
  agent-browser eval "(function(){ const t=document.body.innerText; return JSON.stringify({panel: t.includes('NASA Glenn Research Center'), role: t.includes('Combustion Integrated Rack'), honest: t.includes('not live telemetry')}); })()"
else
  echo "SKIP click: no coords"
fi

echo "== page errors =="
agent-browser errors
echo "== console errors =="
agent-browser console 2>&1 | rg -i "error" | rg -v "React DevTools|Download" | head -5
echo "== done =="
