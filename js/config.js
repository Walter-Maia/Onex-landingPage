/* ==========================================================================
   OneX — configuração central
   Cores ficam em css/styles.css (:root). Aqui: tempos da intro, destinos e mensagens de contato.
   ========================================================================== */
window.ONEX = window.ONEX || {};

window.ONEX.config = {
  /* Tempos da intro em milissegundos (storyboard do briefing) */
  intro: {
    dark: 0,          // 0–0,6 s: escuridão, bordas sutis
    volume: 600,      // 0,6–1,6 s: luz rasante revela volume
    glow: 1600,       // 1,6–2,5 s: O, N e E em branco metálico, faixa especular
    circuits: 2500,   // 2,5–3,6 s: trilhas percorrem O → N → E até o hub do X
    xactive: 3600,    // 3,6–4,1 s: ramificações para as quatro partes do X, contorno e face laranja
    done: 4100,       // 4,1–4,6 s: “data center” aparece; marca completa estável para leitura
    leave: 4600,      // 4,6–5,15 s: marca viaja até o logo real do cabeçalho; fundo escuro desaparece à parte
    arrive: 5150,     // chegada nominal (a troca acompanha a chegada efetiva de cada execução)
    end: 5400,        // fim da intro: hero estável, página utilizável
    safety: 6000,     // temporizador de segurança: libera o site mesmo com falha
    /* voo da marca até o cabeçalho */
    flight: {
      ease: 'cubic-bezier(0.32, 0, 0.18, 1)', // aceleração inicial curta, desaceleração final suave
      smallDurFactor: 0.8,  // telas pequenas/paisagem: duração 20 % menor…
      smallPath: 0.72,      // …trajeto parcial (72 % do caminho) e dissolução no lugar
      smallSwap: 220        // duração da troca no trajeto curto
    },
    /* entrada do hero, em ms relativos a `leave` (intervalos sobrepostos à saída; o conteúdo só ganha
       presença quando a marca já reduziu o bastante para liberar sua região) */
    hero: {
      swap: 160,                 // duração da troca marca ↔ logo do cabeçalho
      art: 240, artDur: 260,     // peça do X e sua passagem de luz: 4,84–5,10 s
      title: 320, titleDur: 360, // rótulo e slogan: 4,92–5,28 s
      body: 400, bodyDur: 360,   // descrição e ações: 5,00–5,36 s
      facts: 440, factsDur: 340  // link de exploração: 5,04–5,38 s
    },
    heroSmall: {                 // telas pequenas: trajeto curto (chegada em +440 ms); o título só entra
      swap: 220,                 // depois que a marca começa a dissolver no lugar, para não passar sob ela
      art: 200, artDur: 260,
      title: 440, titleDur: 320,
      body: 480, bodyDur: 300,
      facts: 500, factsDur: 300
    },
    staticHold: 1800,
    storageKey: 'onex-intro-seen'
  },

  /* Destinos oficiais (conferidos em onexdc.com.br em 14/09/2026; ver docs/FONTES-R6.md) */
  links: {
    site: 'https://onexdc.com.br/',
    catalog: 'https://onexdc.com.br/produtos/',
    dedicated: 'https://onexdc.com.br/produtos/servidores-dedicados/',
    virtualization: 'https://onexdc.com.br/produtos/virtualizacao/',
    cloudServer: 'https://onexdc.com.br/produtos/solucoes-em-nuvem/',
    voip: 'https://onexdc.com.br/produtos/telefonia-voip/',
    contactPage: 'https://onexdc.com.br/fale-conosco/',
    nimbus: 'https://nimbus.onexdatacenter.com.br/',
    register: 'https://app.nimbus.onexdatacenter.com.br/',
    blog: 'https://onexdc.com.br/blog/',
    instagram: 'https://www.instagram.com/onexdc/',
    facebook: 'https://www.facebook.com/onexdcenter/',
    linkedin: 'https://www.linkedin.com/company/onex-dc/',
    privacy: 'https://onexdc.com.br/politicas-de-privacidade/',
    phone: 'tel:+553140404888',
    email: 'mailto:contato@onexdatacenter.com.br'
  },

  /* WhatsApp oficial: o visitante revisa e envia a mensagem; a página não envia nada */
  whatsapp: {
    number: '553140404888',
    base: 'https://api.whatsapp.com/send',
    generic: 'Olá! Vim pelo site da OneX e quero conversar sobre infraestrutura para a minha empresa.',
    messages: {
      'onexcloud': 'Olá! Quero conversar sobre o OneXcloud para a minha equipe.',
      'vps': 'Olá! Quero conversar sobre um VPS na OneX.',
      'dedicado': 'Olá! Quero uma proposta de servidor dedicado na OneX.',
      'colocation': 'Olá! Quero conversar sobre colocation do meu equipamento na OneX.',
      'telefonia': 'Olá! Quero conversar sobre telefonia VoIP na OneX.',
      'email': 'Olá! Quero conversar sobre e-mail profissional na OneX.',
      'hospedagem': 'Olá! Quero conversar sobre hospedagem de site na OneX.',
      'smart-hands': 'Olá! Quero saber sobre o serviço de Smart Hands da OneX.',
      'visita-ipatinga': 'Olá! Quero agendar uma visita ao data center da OneX em Ipatinga.',
      'visita-bh': 'Olá! Quero agendar uma visita ao data center da OneX em Belo Horizonte.',
      'outro': 'Olá! Vim pelo site da OneX e quero tirar uma dúvida.'
    },
    labels: {
      'onexcloud': 'OneXcloud',
      'vps': 'VPS',
      'dedicado': 'Servidor dedicado',
      'colocation': 'Colocation',
      'telefonia': 'Telefonia',
      'email': 'Email profissional',
      'hospedagem': 'Hospedagem',
      'smart-hands': 'Smart Hands',
      'visita-ipatinga': 'Visita em Ipatinga',
      'visita-bh': 'Visita em Belo Horizonte',
      'outro': 'Outro assunto'
    }
  }
};
