#!/bin/bash
# Final checks: drag-rotate, zoom, deselect, mobile viewport, overflow.
cd /home/z/my-project
setsid nohup bun run dev > dev.log 2>&1 < /dev/null &
for i in $(seq 1 30); do sleep 1; code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null); [ "$code" = "200" ] && break; done
echo "server: HTTP $code"

agent-browser close 2>/dev/null
agent-browser set viewport 1440 900
agent-browser open http://localhost:3000
agent-browser wait --load networkidle
agent-browser eval "document.getElementById('earth')?.scrollIntoView({behavior:'instant'}); 'ok'"
agent-browser wait 2500

echo "== camera distance before drag/zoom =="
agent-browser eval "(function(){ const g=window.__ofiGlobe; return 'dist='+g.camera.position.length().toFixed(2); })()"

echo "== drag rotate (mouse down/move/up) =="
agent-browser mouse move 700 500
agent-browser mouse down left
agent-browser mouse move 950 480
agent-browser mouse up left
agent-browser wait 800
agent-browser eval "(function(){ const g=window.__ofiGlobe; const c=document.querySelector('#earth canvas').getBoundingClientRect(); const v=new (g.camera.position.clone().constructor)(); return 'cam after drag: ' + g.camera.position.toArray().map(n=>n.toFixed(2)).join(','); })()"

echo "== zoom out (wheel) =="
agent-browser mouse move 700 500
agent-browser mouse wheel 600
agent-browser wait 800
agent-browser eval "(function(){ const g=window.__ofiGlobe; return 'dist after wheel='+g.camera.position.length().toFixed(2); })()"

echo "== click empty space deselects =="
agent-browser eval "(function(){ document.body.dataset.test='pending'; const c=document.querySelector('#earth canvas').getBoundingClientRect(); window.__deselectProbe=[Math.round(c.right-60), Math.round(c.top+80)]; return JSON.stringify(window.__deselectProbe); })()"
P=$(agent-browser eval "JSON.stringify(window.__deselectProbe)")
PX=$(echo "$P" | tr -d '"[]' | cut -d, -f1); PY=$(echo "$P" | tr -d '"[]' | cut -d, -f2)
agent-browser mouse move "$PX" "$PY"
agent-browser mouse down left
agent-browser mouse up left
agent-browser wait 600
echo "deselect done"

echo "== page errors =="
agent-browser errors

echo "== mobile =="
agent-browser set viewport 375 812
agent-browser wait 800
agent-browser eval "document.getElementById('earth')?.scrollIntoView({behavior:'instant'}); 'ok'"
agent-browser wait 2000
agent-browser screenshot /tmp/globe-mobile.jpg
agent-browser eval "document.documentElement.scrollWidth <= window.innerWidth ? 'NO H-OVERFLOW' : 'H-OVERFLOW'"
agent-browser errors
echo "== done =="
