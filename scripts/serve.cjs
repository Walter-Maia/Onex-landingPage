const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', process.env.SITE_DIR || '.');
const port = Number(process.env.PORT || 4173);
const prefix = '/Onex-landingPage/';
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2','.json':'application/json'};
http.createServer((req,res)=>{
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (url === '/Onex-landingPage') { res.writeHead(301, {Location:prefix}).end(); return; }
  if (url.startsWith(prefix)) url = url.slice(prefix.length);
  else url = url.replace(/^\/+/, '');
  const target = path.resolve(root, url || 'index.html');
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(/[\\/]/).some(s=>s.startsWith('.') && s!=='.nojekyll')) { res.writeHead(403).end(); return; }
  fs.stat(target, (err, stat)=>{
    if(err || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, {'Content-Type':mime[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(target).pipe(res);
  });
}).listen(port, '127.0.0.1', ()=>console.log(`OneX: http://127.0.0.1:${port}${prefix}`));
