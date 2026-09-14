# OneX Data Center

Conectamos hoje e protegemos o amanhã.

Landing page estática com seis produtos, navegação responsiva e canais oficiais de contato. Abra index.html diretamente para apresentar offline, ou use npm start.

- [Hospedagem no GitHub Pages](HOSPEDAGEM.md)
- [Roteiro de apresentação](APRESENTACAO.md)
- [Validação e limites](VALIDACAO-APRESENTACAO.md)

## Desenvolvimento

Node 22 ou mais recente.

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build
npm test
```

A publicação usa somente dist/. As fontes e imagens acompanham o projeto; as licenças de fonte estão em assets/. As marcas e fotografias pertencem aos seus titulares.
