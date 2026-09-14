# OneX — entrega para apresentação e hospedagem

Concluída em 14/09/2026. Implementação R6 pelo Claude, direção de design, revisão independente e preparação de entrega pelo Codex.

## Resultado

**60 testes aprovados, zero falhas, zero testes ignorados, zero retries.** Execução final após os dois retoques, contra o pacote `dist/` servido no caminho `/Onex-landingPage/`. Os arquivos de produção foram comparados byte a byte com o pacote testado: nenhuma diferença.

| Perfil | Resultado |
| --- | --- |
| Chromium 153 | 12 aprovados |
| Firefox 155 | 12 aprovados |
| WebKit 26.6 | 12 aprovados |
| Chrome móvel, perfil Pixel 7 | 12 aprovados |
| WebKit móvel, perfil iPhone 13 | 12 aprovados |

As execuções ocorreram em Windows, em navegadores automatizados. Os perfis móveis são emulados, não aparelhos físicos nem Safari instalado em iPhone.

## Cobertura

- Layout em **62 larguras distintas**, de 320 a 2560 px: matriz principal e varredura intermediária em Chromium. Firefox e WebKit também executaram a matriz principal; perfis móveis incluíram 320, 360, 390, 430, 768 e paisagem 844 × 390. A verificação mede bordas de texto, links, botões e imagens, além da largura do documento; não depende apenas de ocultar a rolagem horizontal.
- Seis tabs com seleção única, painel e CTA correspondentes; setas, Home e End; preservação da seleção ao mudar para mobile e voltar.
- Seis accordions móveis, abertura por toque/clique, fechamento por teclado e botões dentro de 320 px.
- Links diretos para produtos em desktop/mobile; abertura com movimento reduzido sem deslocamento indevido de rolagem/foco.
- Menu mobile, Escape, retorno de foco, navegação para contato.
- Intro natural, pular por Escape, replay natural e interrompido, posição do rodapé e foco restaurados; segunda visita sem repetir a abertura.
- Slogan exato, um H1, seis produtos e conteúdo comercial sem mensagens de demonstração ou sucesso de envio simulado.
- Canais de contato oficiais, telefone, e-mail e contexto de cidade nos links. Não foram enviadas mensagens reais durante os testes.
- Imagens e fontes locais, zero recurso externo necessário à renderização, zero resposta HTTP de erro para recursos locais e zero exceção JavaScript nos cenários de carregamento monitorados.
- Página disponível sem JavaScript; abertura direta por arquivo local com acesso à rede bloqueado. Em WebKit, o bloqueio foi feito por interceptação HTTP, pois seu modo offline em Windows rejeita a navegação por `file://`; Chromium e Firefox usaram o modo offline.
- Auditoria automática Axe de regras WCAG A/AA e WCAG 2.1 AA: nenhuma violação detectada no estado avaliado em cada perfil. Isso não equivale a uma certificação completa de acessibilidade.

## Correções encontradas e verificadas

Foram corrigidos botões largos demais no mobile, contraste do rótulo da equipe, foco indevido na primeira aba ao inicializar, abertura de produto pela URL e quebra pouco equilibrada do slogan no desktop. As notas de pesquisa foram removidas das descrições comerciais e a licença integral da fonte foi incluída.

## Animação e revisão visual

Intro preservada, entrada coordenada do hero, transição e indicador das tabs, microanimações dos produtos, desenho das conexões da seção de proteção e estados de hover/foco. Movimento reduzido mostra os estados finais sem espera. Foram inspecionadas capturas em desktop/mobile e folhas de quadros; gravações em tempo real acompanham o projeto local.

Evidências no workspace original:

- `docs/evidence-r6/`: cenários, capturas por seção, seis produtos e gravações do implementador.
- `docs/final-presentation/`: capturas independentes em 320, 390, 768, 1440 e 1920 px; gravações desktop/mobile; cópia de `test-results.json` da execução final.
- `playwright-report/index.html`: relatório interativo completo.
- `tests/`: testes reproduzíveis, também incluídos no pacote para GitHub.

## Pacotes

- `release/onex-github.zip`: projeto para enviar à raiz do repositório, com fontes, imagens, testes, workflows e guias.
- `release/onex-site.zip`: somente site estático, para abrir localmente ou hospedar.
- `release/SHA256SUMS.txt`: identificação dos arquivos de produção e dos ZIPs.

O workflow de validação roda nos pushes para main. O workflow de publicação é manual, executa os testes e publica somente `dist/`.

## Hospedagem e limites

O repositório indicado foi consultado: `Walter-Maia/Onex-landingPage`, vazio, privado e sem Pages ativado no momento da preparação. **Nenhum push, publicação ou alteração de visibilidade foi feito.** A entrega está pronta para o usuário hospedar seguindo `HOSPEDAGEM.md`.

O workflow foi preparado a partir das ações oficiais; não foi executado no GitHub, pois o projeto ainda não foi enviado. GitHub Pages em repositório privado exige um plano compatível. Endereço esperado após ativação: `https://walter-maia.github.io/Onex-landingPage/`.

Não é possível garantir literalmente todas as resoluções, navegadores ou configurações existentes. Os resultados acima comprovam os cenários executados, com layout fluido e larguras intermediárias. Para a apresentação, mantenha a cópia local disponível. Contato via WhatsApp, telefone e e-mail depende dos aplicativos/canais externos; o site não possui backend de formulário.

## Retoques solicitados em 14/09/2026

- Restaurada a arte anterior com três racks conectados ao X da OneX e pulsos de dados animados.
- Removido o botão visível “Pular intro”. A abertura continua automaticamente e mantém Escape, retorno de foco e movimento reduzido.
- Pulsos conferidos em movimento e pausados quando a arte sai da tela. Capturas e vídeos atualizados em docs/final-presentation/.
