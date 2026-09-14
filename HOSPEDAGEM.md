# Hospedar a OneX no GitHub Pages

Destino: https://github.com/Walter-Maia/Onex-landingPage

O site é estático. A produção usa somente `index.html`, `css/`, `js/`, `assets/` e `.nojekyll`. Node é usado para testes e preparação do pacote; não é necessário no servidor.

## Enviar o projeto

Extraia `onex-github.zip`. Envie o conteúdo da pasta extraída, incluindo `.github/`, à raiz da branch `main` do repositório. Não crie uma pasta adicional acima do `index.html`.

Opção pelo Git, executada dentro da pasta extraída:

```powershell
git init -b main
git add .
git commit -m "Prepare OneX landing page for presentation"
git remote add origin https://github.com/Walter-Maia/Onex-landingPage.git
git push -u origin main
```

Esses comandos pressupõem o repositório remoto vazio, como observado na preparação. Se houver novos commits remotos, clone o repositório e copie o pacote para o clone; não force o push.

## Ativar a hospedagem

1. No repositório, abra **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Abra **Actions → Publish OneX to GitHub Pages → Run workflow**, branch `main`.
4. Aguarde os testes, build e deploy. O job de deploy apresenta o endereço publicado.

Endereço esperado após a primeira publicação: https://walter-maia.github.io/Onex-landingPage/

O envio de código dispara validação, mas a publicação é manual. Rode o workflow de publicação de novo após as atualizações que quiser apresentar online. O workflow publica apenas `dist/`: documentos de trabalho, testes e relatórios não entram no site público.

O repositório estava privado durante a preparação. GitHub Pages em repositório privado exige um plano compatível, como GitHub Pro; no plano gratuito, Pages usa repositório público. Se a opção não estiver disponível, escolha entre um plano compatível ou tornar o repositório público após revisar seu conteúdo. Nenhuma alteração de visibilidade foi feita por este projeto.

Referência: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Reproduzir a validação

Instale Node 22 ou mais recente e execute:

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run build
npm test
npm run test:report
```

Os testes abrem o pacote em `/Onex-landingPage/`, reproduzindo o subdiretório do Pages. Os testes de contato não enviam mensagens reais.

## Preview local

Abra `index.html` diretamente, ou execute `npm start` e acesse http://127.0.0.1:4173/Onex-landingPage/.

Não há backend local de formulário. As ações comerciais encaminham o visitante aos canais oficiais da OneX. Para envio no próprio site, será necessária uma integração adicional real.
