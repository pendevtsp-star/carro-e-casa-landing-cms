# Painel Executivo de Métricas

## Objetivo

Transformar `/admin/metricas` em uma tela executiva para a cliente entender rapidamente o desempenho da landing, sem perder os detalhes técnicos já existentes.

O primeiro uso da tela deve responder em menos de 30 segundos:

- Quantas pessoas chegaram.
- Quantas demonstraram interesse.
- Qual canal trouxe mais visitas.
- Qual botão gerou mais ação.
- O que merece atenção no período.

## Usuário Principal

Sócios e administradores da Carro & Casa que precisam acompanhar a landing com linguagem simples, sem depender de leitura técnica de eventos.

Usuário secundário: desenvolvedor/operador que precisa auditar eventos, campanhas UTM e exportar CSV.

## Escopo

Incluído:

- Reorganizar a tela `/admin/metricas`.
- Criar primeiro fold executivo com cards principais.
- Criar bloco de leitura rápida com insights automáticos.
- Separar visualmente resumo executivo de análise detalhada.
- Manter filtros, CSV, UTM, origem, páginas, dispositivos, timeline e eventos recentes.
- Preservar permissões atuais de `viewMetrics`.

Fora do escopo:

- Integração GA4.
- Novos modelos de banco.
- Alertas por WhatsApp/e-mail.
- Metas editáveis ou comparação financeira.
- Dashboard público sem login.

## Arquitetura

Não haverá nova rota nem nova tabela.

A rota existente `/admin/metricas` continua como fonte única da experiência de métricas. A página deve ser reorganizada em seções, usando os dados já consultados de `AnalyticsEvent`.

Componentes sugeridos:

- `ExecutiveMetricCard`: card compacto para número, rótulo, contexto e estado.
- `InsightList`: lista de frases interpretadas com base nos dados do período.
- `MetricsDetailSection`: agrupamento visual para preservar blocos técnicos abaixo do resumo.

Esses componentes podem ficar no próprio arquivo inicialmente se forem pequenos. Se a página crescer demais, extrair para `src/components/admin/metrics-*`.

## Layout

### Primeiro Fold

Topo:

- Título: `Desempenho da landing`.
- Descrição curta: foco em acessos, interesse e canais.
- Seletor rápido de período: Hoje, 7 dias, 30 dias, Este mês.
- Botão `Exportar CSV` discreto, alinhado à direita em desktop e full-width quando necessário no mobile.

Cards executivos:

- `Pessoas chegaram`: visitantes únicos estimados, com fallback para acessos.
- `Demonstraram interesse`: ações de contato ou interações.
- `Taxa WhatsApp`: cliques WhatsApp por acessos.
- `Melhor canal`: principal origem de tráfego.

Os cards devem ser mais densos e profissionais que cards de landing: raio moderado, pouco espaço vazio, tipografia clara e estados discretos.

### Leitura Rápida

Bloco logo abaixo dos cards, com 3 a 5 frases automáticas.

Exemplos:

- `Instagram foi o canal com mais acessos no período.`
- `WhatsApp foi a principal ação de contato.`
- `A página /empresas recebeu interesse relevante.`
- `Não há dados suficientes para comparar canais neste período.`

As frases devem ser úteis mesmo quando há poucos dados. Quando faltar informação, o texto deve orientar sem parecer erro.

### Análise Detalhada

Abaixo do resumo executivo, manter:

- gráfico/timeline de acessos vs interações;
- origem/canal;
- botões mais clicados;
- páginas mais acessadas;
- dispositivos;
- eventos recentes;
- gerador de links UTM;
- filtros avançados.

Esses blocos devem ficar sob um título como `Análise detalhada`, para deixar claro que são uma camada técnica.

## Dados e Regras

Usar os cálculos atuais como base:

- `pageViews`: eventos `page_view`.
- `visitors`: visitantes únicos por `visitorId`.
- `interactions`: eventos diferentes de `page_view`.
- `contactClicks`: `click_whatsapp`, `click_email`, `click_maps`.
- `conversionRate`: `whatsappClicks / pageViews`.
- `topSource`: origem com mais `page_view`.
- `topCta`: CTA com mais cliques.
- `topPage`: página com mais `page_view`.

Insights devem ser derivados desses valores, sem IA externa e sem chamadas de rede.

Comparação com período anterior pode continuar limitada a acessos por enquanto. Se a lógica já existir, ela deve aparecer de forma simples, por exemplo: `Acessos acima do período anterior`.

## Estados Vazios

Quando não houver eventos:

- Mostrar cards com zero.
- Leitura rápida deve explicar: `Ainda não há dados suficientes para leitura do período.`
- Manter filtros e gerador UTM disponíveis.
- Não esconder a tela.

Quando houver poucos dados:

- Não forçar conclusões.
- Usar textos como `Dados iniciais` ou `Acompanhe por mais alguns dias para comparar canais.`

## Responsividade

Desktop:

- Cards executivos em quatro colunas.
- Leitura rápida em faixa horizontal ou painel logo abaixo.
- Detalhes em grids de duas ou três colunas conforme o bloco.

Mobile:

- Cards em uma coluna ou duas colunas quando couber.
- Filtros rápidos com wrap natural.
- CSV e filtros avançados sem overflow.
- Tabelas/listas com quebra de texto segura.

## Acessibilidade

- Usar headings em ordem lógica.
- Cards com texto suficiente, não depender só de cor.
- Contraste mínimo de 4.5:1 para textos pequenos.
- Links e botões com foco visível.
- Números acompanhados de rótulo claro.

## Testes e Verificação

Verificação local:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

Verificação manual:

- `/admin/metricas` desktop.
- `/admin/metricas` mobile.
- Filtros rápidos.
- Filtro personalizado.
- Exportar CSV.
- Estado com poucos dados.
- Acesso protegido por login.

## Critérios de Aceite

- A primeira dobra da tela comunica o desempenho sem exigir leitura técnica.
- A cliente consegue entender acessos, interesse, melhor canal e botão principal.
- Os detalhes técnicos continuam disponíveis.
- A página permanece responsiva.
- Não há alteração no modelo de dados.
- Não há nova dependência externa.
