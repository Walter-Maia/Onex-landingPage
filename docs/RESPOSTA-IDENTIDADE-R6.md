# Resposta ao briefing de identidade — rodada 6

Referência: `docs/BRIEFING-IDENTIDADE-R6.md`, mais as revisões enviadas durante a rodada (notas de pesquisa na UI,
CTA de produto em 320/390, contraste do rótulo na seção clara, foco na inicialização do explorador, produto por âncora,
quebra do H1 em 1440, licença da fonte). Mapa de fontes: `docs/FONTES-R6.md`. Evidências: `docs/evidence-r6/`
(gravações reais, folhas de quadros, capturas por rolagem real, `results-r6.json` com todas as sondas).
Nada foi publicado nem enviado ao GitHub.

Método: Chrome headless por CDP (puppeteer-core), servidor local, scrollbar clássica nas sondas de geometria.
Sem erros ou avisos de console em nenhuma execução.

## O que mudou

### Identidade e conteúdo
- **H1 exato:** “Conectamos hoje e protegemos o amanhã”, único `h1`, em três linhas de 901 a 1920 px (59 px em 1440),
  sem “hoje” isolado e sem overflow em 1024 (`h1probe`: 3 linhas em 901/1024/1200/1366/1440/1920). Mobile mantido.
- Subtítulo, rótulo e ações conforme o briefing: “Conheça nossas soluções”, “Fale com a OneX” e o link
  “Onde seus dados vão estar?” para a infraestrutura.
- **Seis produtos, nomes e ordem exatos:** OneXcloud, VPS, Servidor dedicado, Colocation, Telefonia, Email profissional,
  cada um com frase de entrada, descrição, recursos publicados e ação de conversa. Hospedagem e Smart Hands como serviços
  complementares com ação real. Menu, rodapé, FAQ, chips de contato e mensagens de WhatsApp atualizados.
- Especificações transcritas das páginas oficiais (OneXcloud 1 TB / 1 usuário / 5 GB / backup incluso; VPS 2 vCPU /
  4 GB / 120 GB / transferência ilimitada / 12 meses / Windows sob consulta; e-mail com antispam, antivírus, 10 GB, SSL,
  POP3/IMAP; colocation com espaço em rack, energia redundante, refrigeração, conectividade). Servidor dedicado sem tabela
  de planos; telefonia com explicação corrigida e planos em consulta; VPS sem backup listado como incluso.
- Notas de pesquisa retiradas da interface (ficam em `FONTES-R6.md`); na UI restam apenas “Configurações adicionais sob
  consulta” (OneXcloud), “Outras configurações sob consulta” (VPS), “Condições e configurações em proposta personalizada”
  (dedicado) e “Planos e abrangência das chamadas são definidos em consulta” (telefonia).
- Sem uptime, Tier, certificações, contadores ou depoimentos sintéticos (`uptimeMentions: 0`, `tierMentions: 0`,
  um único `blockquote`, atribuído a Guilherme Cruz, CEO da ForDoctor Contabilidade).
- Foto oficial da equipe em `assets/photos/` (original e recorte 4:5 que preserva os rostos), `width/height`, `loading="lazy"`,
  alt sem identificar pessoas. A imagem “Sobre01” não foi usada (evento esportivo, não infraestrutura).
- Zero referências a demonstração, prévia ou protótipo na interface (`demoRefs: 0`); nenhum formulário local
  (`formElements: 0`); nenhuma mensagem de sucesso simulada (`successMessages: 0`).

### Composição e curiosidade
- Ordem: hero → explorador → proteção e continuidade → infraestrutura → equipe e história → dúvidas → contato.
- **Explorador:** índice à esquerda com papel de `tablist` e detalhe à direita no desktop; accordions `<details>` no mobile
  e sem JavaScript (OneXcloud aberto). Teclado: setas, Home, End, com laço; `aria-selected`, `aria-controls`, `tabpanel`.
  Marcador acompanha a seleção em 220 ms; painel entra com crossfade e 8 px; cada produto tem microssequência própria
  (arquivos que se alinham, módulos que se organizam, passagem de luz, unidades que encaixam, ligação que se completa,
  etiqueta do domínio). Âncoras `#produto-…` abrem o produto certo na carga e em `hashchange`; a inicialização não foca
  nem rola (`loadScroll: scrollY 0, activeEl BODY`).
- **Proteção e continuidade:** três camadas em texto, com “Com: …” apontando os produtos que oferecem cada recurso; a arte
  desenha as relações uma vez ao entrar na tela (600–900 ms) e termina.
- **Infraestrutura:** cidades em composição tipográfica com endereços e “Agendar visita em Ipatinga / em Belo Horizonte”
  (mensagens distintas), fatos da estrutura e a geometria do X; a figura de racks e sua legenda foram retiradas.
- **Equipe e história:** seção clara com a foto, história resumida, três pontos publicados e o depoimento curto.
- Hero com peça abstrata autoral: duas superfícies com espessura recortadas pela diagonal, uma conexão que atravessa o
  limite e chega ao X, e uma única passagem de luz ao entrar (sem grade, rótulos ou pulsos infinitos).

### Contato real
- Ação principal “Conversar no WhatsApp” abre `api.whatsapp.com/send?phone=553140404888&text=…` com mensagem preparada
  pelo assunto escolhido (chips de rádio) e, nos produtos e cidades, pelo botão correspondente. Mensagens codificadas com
  `encodeURIComponent`, já prontas no HTML para funcionar sem JavaScript. Telefone, e-mail e formulário oficial como
  alternativas. Nenhum envio é feito pela página e nenhuma confirmação é simulada.

### Motion por componente
Hero (entrada em blocos + passagem de luz única), explorador (marcador 220 ms, painel 8 px, arte própria), proteção
(relações desenhadas uma vez), botões/links (160 ms, seta 3 px), FAQ (abertura suave, chevron), equipe/cidades (entrada
simples). Com `prefers-reduced-motion` tudo aparece no estado final de imediato; animações pausam fora da viewport e em
aba oculta; conteúdo visível por padrão em falha de script.

### Hospedagem
Fonte Montserrat local (`assets/fonts/montserrat-latin.woff2`, OFL em `OFL.txt` e `NOTICE.txt`), sem chamadas externas de
CSS ou fontes; todos os caminhos relativos (`absolutePaths: []`), compatíveis com `/Onex-landingPage/`.

## Verificações executadas (`results-r6.json`)

- Conteúdo: título, H1 único e exato, seis nomes e ordem, complementares, zero demo, zero formulário, fonte local carregada.
- Explorador: clique, setas, Home/End, laço, marcador, `is-entering`, papéis ARIA; toque no mobile abre accordion com arte;
  hash `#produto-email` na carga → e-mail aberto e selecionado; `hashchange` → telefonia; mobile `#produto-colocation`.
- Proteção: `is-drawn` só ao entrar (dashoffset 260 → 0), placas visíveis.
- Contato: chip “Colocation” → texto correto; “Visita em Belo Horizonte” → mensagem de BH; host `api.whatsapp.com`.
- Capturas por rolagem real: 20/20 blocos revelados pelo observador, 0 armados, imagens carregadas (desktop e mobile).
- Geometria com scrollbar (320, 390, 768, 1024, 1440, 844 × 390): nenhum elemento além da área útil; alvos ≥ 44 px.
- Menu ativo: Soluções/Infraestrutura/Sobre/Contato; Proteção e Dúvidas limpam o estado.
- Regressões R5: replay do rodapé (posição e foco), âncora `#infraestrutura` com título logo abaixo do cabeçalho,
  movimento reduzido (página direta, tabs trocam de imediato, replay estático inline), sem scripts (accordions,
  links de WhatsApp prontos, navegação visível), `main.js` bloqueado (nada oculto).
- Gravações reais: `intro-capture-1440.gif`, `intro-capture-390.gif`, `explorer-switch-1440.gif`,
  `protect-enter-1440.gif`, com folhas de quadros por tempo; capturas `product-1…6-*.png`, `nojs-1440-solucoes.png`,
  `desktop-1440-full.png`, `mobile-390-full.png` e telas por seção.

## Limitações

- Validação em Chrome headless; a rodada cruzada em Chromium, Firefox e WebKit fica com o Codex.
- As microssequências das artes rodam a cada seleção; em movimento reduzido aparecem prontas.
- Textos comerciais seguem sujeitos à validação da OneX; vetor oficial da marca e fotografia das instalações pendentes.
