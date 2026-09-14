const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root=path.resolve(__dirname,'..');
const release=path.join(root,'release');
if(path.dirname(release)!==root || path.basename(release)!=='release')throw Error('Invalid release directory');
execFileSync(process.execPath,[path.join(__dirname,'build.cjs')],{stdio:'inherit'});
fs.mkdirSync(release,{recursive:true});
const source=path.join(release,'onex-github');
if(path.dirname(source)!==release)throw Error('Invalid package directory');
fs.rmSync(source,{recursive:true,force:true});fs.mkdirSync(source,{recursive:true});
for(const name of ['index.html','css','js','assets','.nojekyll','.gitignore','.github','package.json','package-lock.json','playwright.config.cjs','tests','scripts','HOSPEDAGEM.md','APRESENTACAO.md','VALIDACAO-APRESENTACAO.md']){
  fs.cpSync(path.join(root,name),path.join(source,name),{recursive:true});
}
for(const name of ['FONTES-R6.md','RESPOSTA-IDENTIDADE-R6.md']){
  const input=path.join(root,'docs',name);
  if(fs.existsSync(input)){fs.mkdirSync(path.join(source,'docs'),{recursive:true});fs.copyFileSync(input,path.join(source,'docs',name));}
}
fs.writeFileSync(path.join(source,'README.md'),`# OneX Data Center\n\nConectamos hoje e protegemos o amanhã.\n\nLanding page estática com seis produtos, navegação responsiva e canais oficiais de contato. Abra index.html diretamente para apresentar offline, ou use npm start.\n\n- [Hospedagem no GitHub Pages](HOSPEDAGEM.md)\n- [Roteiro de apresentação](APRESENTACAO.md)\n- [Validação e limites](VALIDACAO-APRESENTACAO.md)\n\n## Desenvolvimento\n\nNode 22 ou mais recente.\n\n\x60\x60\x60sh\nnpm ci\nnpx playwright install chromium firefox webkit\nnpm run build\nnpm test\n\x60\x60\x60\n\nA publicação usa somente dist/. As fontes e imagens acompanham o projeto; as licenças de fonte estão em assets/. As marcas e fotografias pertencem aos seus titulares.\n`);
for(const [dir,name] of [[source,'onex-github.zip'],[path.join(root,'dist'),'onex-site.zip']]){
  const dest=path.join(release,name);
  fs.rmSync(dest,{force:true});
  execFileSync('powershell.exe',['-NoProfile','-File',path.join(__dirname,'zip.ps1'),'-Source',dir,'-Destination',dest],{stdio:'inherit',windowsHide:true});
}
const hashes=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else hashes.push(`${crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}  ${path.relative(root,p).replaceAll('\\','/')}`);}}
walk(path.join(root,'dist'));
for(const name of ['onex-github.zip','onex-site.zip']){
  const p=path.join(release,name);hashes.push(`${crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}  release/${name}`);
}
fs.writeFileSync(path.join(release,'SHA256SUMS.txt'),hashes.join('\n')+'\n');
console.log('Packages ready: release/onex-github.zip and release/onex-site.zip');
