# Mapa de conteúdo e fontes — rodada 6

Todas as fontes são páginas oficiais da OneX, consultadas em 14/09/2026 (pelo Codex, no briefing, e novamente
pelo implementador durante a rodada). Cada item da landing indica de onde veio e como foi tratado.

| Conteúdo na landing | Fonte oficial | Tratamento |
| --- | --- | --- |
| Slogan “Conectamos hoje e protegemos o amanhã” (H1) | Pedido de Walter, via briefing R6 | Usado exatamente; único H1 |
| Rótulo “OneX Data Center”, subtítulo do hero | Briefing R6 (texto proposto) | Usado como proposto |
| Infraestrutura própria em Ipatinga e Belo Horizonte; visitas agendadas; suporte 24/7 | https://onexdc.com.br/ (home) e FAQ da home | Reescrito; “24 horas, 7 dias, feriados incluídos” vem da FAQ |
| OneXcloud: arquivos, calendários e contatos; LGPD; 1 TB compartilhado; 1 usuário de e-mail corporativo; até 5 GB para o site; backup incluso | Home (“A nuvem que você sabe onde fica”) | Especificações transcritas como publicadas |
| OneXcloud = Switch Cloud ONEX, baseada em Nextcloud | https://onexdc.com.br/produtos/ | Mencionado como nome do catálogo; não se aplicaram condições de cloud server ao OneXcloud |
| VPS Linux: 2 vCPU, 4 GB RAM, 120 GB, transferência ilimitada, contrato 12 meses, Windows sob consulta | Home | Transcrito; explicação de virtualização vem de /produtos/virtualizacao/ |
| Backup automatizado com retenção configurável (servidores em nuvem) | https://onexdc.com.br/produtos/solucoes-em-nuvem/ | Citado na camada “Dados e cópias” e na nota do VPS, sempre “definido em contrato” |
| Servidor dedicado: hardware/capacidade configuráveis, recursos exclusivos, controle do ambiente, segurança física e digital, suporte | https://onexdc.com.br/produtos/servidores-dedicados/ | Sem tabela de planos (a página oficial mistura vCPU e área dedicada); “proposta personalizada” |
| Colocation: espaço em rack, energia redundante, refrigeração, conectividade; controle total de hardware e software; hardware exclusivo | Home (descrição e FAQ “recursos compartilhados”) | Reescrito |
| Telefonia: chamadas pela internet, mobilidade, integração com PABX, terminais IP | https://onexdc.com.br/produtos/telefonia-voip/ | Explicação corrigida (a internet conecta PABX e ramais); sem promessa de chamadas ilimitadas; planos em consulta |
| Email profissional: domínio próprio, antispam e antivírus, 10 GB por usuário, SSL, POP3 e IMAP, suporte proativo | Home | Transcrito |
| Hospedagem: IP dedicado, estrutura monitorada 24/7, suporte técnico | https://onexdc.com.br/produtos/ | Serviço complementar, com ação real |
| Smart Hands: instalação de hardware, reconfiguração, verificação física sob demanda | https://onexdc.com.br/produtos/ | Serviço complementar, com ação real |
| Contratos a partir de 12 meses | FAQ da home | FAQ e fatos da infraestrutura |
| Visita presencial para manutenção ou inspeção | FAQ da home | FAQ e colocation |
| História: empresas do Vale do Aço e da Grande BH precisavam de infraestrutura profissional sem depender de SP/RJ | Home (bloco “sobre”) | Reescrito em voz própria |
| “Engenheiro na linha. Na primeira ligação.” / “Uma equipe. Um contrato. Uma nota fiscal.” / “Você pode ver seu servidor.” | Home (taglines) | Reescritos nos pontos da seção de equipe |
| Depoimento: “Depois que trouxemos nosso servidor para a OneX Data Centers, nós ganhamos em vazão e expansão.” — Guilherme Cruz, CEO, ForDoctor Contabilidade | Home | Trecho curto, atribuído, único depoimento |
| Foto da equipe | https://onexdc.com.br/wp-content/uploads/2024/11/Sobre02-1-768x1138.webp (`docs/source-r6/onex-equipe.webp`) | Copiada para `assets/photos/onex-equipe.webp`; recorte 4:5 em `onex-equipe-4x5.webp` preservando os rostos; alt sem identificar pessoas |
| `docs/source-r6/onex-infra.webp` | Sobre01-2.webp | **Não usada**: é uma foto de evento esportivo, não de infraestrutura |
| Telefone (31) 4040-4888, WhatsApp 553140404888, contato@onexdatacenter.com.br, endereços | https://onexdc.com.br/fale-conosco/ | Usados como canais reais; formulário oficial linkado |
| Painel Nimbus, cadastro, blog, Instagram, Facebook, LinkedIn, política de privacidade | Home / rodapé oficial | Mantidos |

## Divergências tratadas (não reproduzidas na interface)

- Uptime: a home exibe 99,9 % e páginas internas 99,99 %. A landing não cita percentual; disponibilidade fica “registrada no contrato”.
- Sem selos Tier ou certificações de segurança: não confirmados na home.
- Contadores “0+” do site de origem não foram usados.
- O slogan orienta a identidade; a landing não promete SOC, pentest, EDR, proteção absoluta ou certificações. A seção “Proteção e continuidade” associa cada recurso ao produto que o oferece (antivírus/antispam ao e-mail, backup ao OneXcloud e aos servidores em nuvem, energia/refrigeração à estrutura).
- A página de telefonia mistura termos de virtualização; a explicação foi reescrita.
- A página de servidores dedicados mistura planos em vCPU; nenhum valor foi transformado em tabela de servidor físico.

## Fonte tipográfica

Montserrat (variável, subconjunto latin) hospedada em `assets/fonts/montserrat-latin.woff2`, licença SIL OFL 1.1
(`assets/fonts/NOTICE.txt`). Não há mais dependência do Google Fonts.
