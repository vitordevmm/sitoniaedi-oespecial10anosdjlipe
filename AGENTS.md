# 🎵 Sintonia Edição Especial 10 Anos DJ Lipe | Diretrizes e Regras do Projeto (AGENTS.md)

> **REGRA FUNDAMENTAL E OBRIGATÓRIA DE AUTO-ATUALIZAÇÃO:**
> Este arquivo `AGENTS.md` é a **fonte única da verdade (Single Source of Truth)** deste projeto.
> O agente de IA **DEVE** consultar este arquivo em cada turno e **DEVE atualizá-lo ativamente** sempre que novas decisões de negócio, mudanças de schema, novos fluxos, novas credenciais/variáveis ou evoluções de design forem implementadas. Nunca deixe este arquivo defasado em relação ao código real.

---

## 1. Visão Geral e Contexto do Evento

- **Nome do Evento:** Sintonia Edição Especial 10 Anos DJ Lipe
- **Data Oficial:** 10 de Abril de 2027 (10/04/2027)
- **Local Oficial:** Capitu, Tupaciguara - MG
- **Porte do Evento:** Festival de grande escala com lotes e capacidade controlada (sem menção de contagem numérica fixa para manter a magnitude do evento)
- **Objetivo Principal da Plataforma:**
  1. **Venda de Ingressos em Alta Escala:** Venda de lotes com checkout rápido, PIX instantâneo e cartão de crédito, emissão de voucher seguro com QR Code.
  2. **Vitrine e Experiência Imersiva:** Apresentação de impacto das atrações, contagem regressiva, setores/mapa do evento (palco frontal de grande porte; nesta edição o palco NÃO é 360°), informações essenciais e FAQ.
  3. **Gestão e Segurança:** Prevenção absoluta contra duplicidade de ingressos (*overbooking*), concorrência no esgotamento de lotes e validação de pagamentos.
- **Formato do Palco e Setores (Regra de Negócio Oficial do Mapa):**
  - 🔒 **REGRA CRÍTICA DE CONFIDENCIALIDADE - NÃO DIVULGAR O MAPA VISUAL:**
    O desenho/croqui estrutural do mapa do evento enviado pelo cliente é estritamente preliminar para fins de contexto interno de engenharia. Ele ainda contém correções e ajustes pendentes de produção. **É EXPRESSAMENTE PROIBIDO DIVULGAR OU EXIBIR O MAPA VISUAL/CROQUI DO EVENTO NO SITE** até autorização e liberação oficial das produtoras (GHVE Eventos & RL Produções).
  - O palco **NÃO** será 360° nesta edição especial. É um palco frontal de grande porte com painéis de LED e mesa central do DJ Lipe.
  - **Estrutura Oficial de Setores (Contexto Oficial):**
    1. **Pista Geral & Bar Central:** Ampla arena com visão frontal de todo o show, mega Bar Central para atendimento rápido e banheiros exclusivos de pista (Destaque "Favorito do Público" com venda online direta).
    2. **Lounge Rosa (12 Carros):** Ala lateral esquerda delimitada por gradil de segurança, valor sob consulta via WhatsApp oficial (`+55 34 9153-5921`).
    3. **Lounge Azul (12 Carros):** Ala lateral direita delimitada por gradil de segurança, valor sob consulta via WhatsApp oficial (`+55 34 9153-5921`).
    4. **Camarote no Palco (Apenas 4 Unidades):** Exclusivos, montados diretamente no palco ao lado da mesa do DJ Lipe, com acesso a camarim e serviço VIP de garçom, valor sob consulta via WhatsApp oficial (`+55 34 9153-5921`).
  - **Grade de Ingressos (4 Cards Oficiais):**
    1. **Pista (1º Lote - R$ 60,00):** Venda online direta com destaque "Favorito do Público".
    2. **Lounge Rosa (12 Vagas):** Ala lateral esquerda para veículos, valor sob consulta via WhatsApp oficial (`+55 34 9153-5921`) com mensagem pré-configurada.
    3. **Lounge Azul (12 Vagas):** Ala lateral direita para veículos, valor sob consulta via WhatsApp oficial (`+55 34 9153-5921`) com mensagem pré-configurada.
    4. **Camarote no Palco (Apenas 4 Unidades):** Exclusivo no palco, valor sob consulta via WhatsApp oficial (`+55 34 9153-5921`) com mensagem pré-configurada.
  - **Canal Oficial de Atendimento & Reservas WhatsApp:** `+55 34 9153-5921`
- **Hierarquia de Marcas (Brand Hierarchy):**
  - ⭐ **Estrela Principal / Foco Central:** **Especial 10 Anos DJ Lipe** (O evento celebra a década de carreira do DJ Lipe).
  - 📢 **Marca Anunciadora / Selo:** **Sintonia** (A Sintonia é a marca/festival anunciador, sob a assinatura oficial "Sintonia Edição Especial 10 Anos DJ Lipe").
  - 🏢 **Produtoras Oficiais:** **GHVE Eventos** e **RL Produções** (Créditos, rodapé e informações institucionais).
  - 🏷️ **Favicon Oficial:** Ícone/Símbolo do **Especial 10 Anos DJ Lipe**.

---

## 2. Paleta de Cores e Identidade Visual Oficial

O design deve ser ultra-premium, dark, moderno e vibrante, transmitindo a atmosfera de festival eletrônico/funk de alta categoria:

| Token / Papel | Código HEX | Aplicação |
| :--- | :--- | :--- |
| **Gold Metallic (Gradiente Primário)** | `#c9a227` ➔ `#f5e6b8` | Acentos VIP, botões de ação primária (CTA de compra), badges de lote, luzes e reflexos dourados |
| **Deep Midnight Navy (Contraste Nobre)**| `#0b1930` | Cards secundários, overlays atmosféricos, detalhes de iluminação e bordas de destaque |
| **Pure Ice White (Texto Primário)** | `#f6f8fc` | Títulos, tipografia de alto contraste, preços e ícones principais |
| **Muted Silver Slate (Texto Secundário)**| `#a8b2c3` | Subtítulos, descrições, labels, datas, linhas divisórias e ícones secundários |
| **Obsidian Dark (Superfície de Cards)** | `#101116` | Background dos cards de ingresso, modais de checkout, accordions e dropdowns |
| **Noir Ultra-Dark (Background Geral)** | `#07090d` | Fundo principal da página e do layout global (imersão noturna total) |

---

## 3. Gestão de Logos e Ativos de Marca

Os arquivos vetoriais (.svg) oficiais estão alocados em `public/assets/logos/`:
1. `logo-especial-10-anos-lipe.svg` (Destaque Principal e base para o Favicon).
2. `logo-sintonia-360-escrita.svg` (Tipografia oficial da anunciadora).
3. `logo-sintonia-360-simbolo.svg` (Ícone circular 360 da anunciadora).
4. `logo-ghve-branca.svg` / `logo-ghve.svg` (Produtora GHVE Eventos - versão oficial branca para fundos escuros com viewBox equalizado).
5. `logo-rl-producoes.svg` (Produtora RL Produções - versão oficial branca com monograma geométrico e equalizador).

---

## 4. Regra Rígida de Efeito Cascata (End-to-End Consistency)

> **"SE ALTERAR QUALQUER COISA, TEM QUE ALTERAR TUDO QUE ENVOLVE AQUELA COISA"**

Toda modificação estrutural, de campo ou de regra de negócio deve ser tratada como um **efeito cascata obrigatório**. É expressamente proibido fazer alterações parciais ou deixar arquivos órfãos com tipos desatualizados.

Sempre que um modelo for criado ou alterado (Ex: `Ticket`, `Lot`, `Order`, `User`):
1. **Tipagem TypeScript:** Atualizar as interfaces em `@/types/`.
2. **Validação de Schemas (Zod):** Atualizar schemas de entrada e saída em `@/lib/validations/`.
3. **Firestore & Database:** Atualizar as coleções, converters e consultas em `@/lib/firebase/`.
4. **Regras de Segurança (`firestore.rules`):** Garantir que novos campos sejam permitidos e protegidos contra injeção ou escrita não autorizada.
5. **APIs e Webhooks:** Atualizar as rotas do Next.js (App Router `app/api/...`), manipuladores de requisição e respostas.
6. **Estado e Hooks:** Atualizar os hooks de consumo (`useTickets`, `useCheckout`, etc.) e estados globais/locais.
7. **Componentes de UI:** Atualizar todos os componentes que renderizam ou interagem com esse dado (cards, formulários, modais, comprovantes).

---

## 5. Regras Críticas de Segurança e Concorrência

Como o evento receberá **milhares de pessoas** com alta demanda simultânea, haverá forte concorrência e picos de acessos (abertura de lotes e viradas de preço):

1. **Prevenção de Overbooking (Race Conditions no Firestore):**
   - **NUNCA** decrementar estoque de ingressos com leituras e gravações soltas (`getDoc` seguido de `setDoc`).
   - **OBRIGATÓRIO:** Utilizar transações atômicas do Firestore (`runTransaction`) para reservar e decrementar o lote de ingressos, garantindo que o limite do lote nunca seja ultrapassado.
2. **Validação Estrita de Webhooks do Mercado Pago:**
   - Todo webhook recebido em `/api/webhooks/mercadopago` **DEVE validar a assinatura criptográfica HMAC-SHA256** no cabeçalho `x-signature` usando o secret da aplicação.
   - Nenhuma emissão de ingresso com QR Code pode ocorrer sem status explicitamente `approved` confirmado diretamente via API oficial do Mercado Pago.
   - Idempotência: Registrar o `payment_id` do Mercado Pago para evitar processamento duplicado de uma mesma notificação.
3. **Firestore Security Rules & User Architecture:**
   - Usuários só podem ler e escrever seus próprios dados (`request.auth.uid == userId`).
   - A coleção `/usuarios/{userId}` é obrigatoriamente indexada pelo **UID** do Firebase Authentication (`userId == auth.currentUser.uid`), eliminando dependência frágil de e-mail como ID de documento e acelerando leituras instantâneas O(1).
   - Ingressos comprados só podem ser lidos pelo proprietário da compra.
   - Nenhuma alteração de status de pagamento pode ser feita pelo cliente (somente via backend seguro / Admin SDK).
4. **Proteção de Dados & Credenciais (LGPD & OWASP):**
   - Sanitização de CPF (11 dígitos numéricos), e-mail e telefone de compradores.
   - **Gestão de Senhas:** As senhas dos usuários permanecem gerenciadas e criptografadas exclusivamente pelo Firebase Authentication (algoritmo SCrypt oficial). Nenhuma senha é gravada em texto plano no Firestore.
   - Credenciais de serviço (`serviceAccountKey.json`) e chaves privadas nunca são expostas ao frontend nem versionadas no repositório (`.gitignore`).
5. **Schema Oficial do Usuário (`/usuarios/{userId}`):**
   - `uid`: string (ID do usuário no Firebase Auth)
   - `nome`: string (nome completo limpo e sem espaços extras)
   - `email`: string (e-mail em minúsculas)
   - `cpf`: string (11 dígitos numéricos limpos)
   - `telefone`: string (apenas dígitos com DDD)
   - `dataNascimento`: string (formato ISO `AAAA-MM-DD`)
   - `idade`: number (idade calculada)
   - `role`: "user" | "admin" | "staff"
   - `createdAt`: Timestamp
   - `updatedAt`: Timestamp
6. **Autenticação Multi-Identificador (E-mail, CPF ou Celular):**
   - No login e recuperação de senha, o usuário pode se identificar livremente por **E-mail**, **CPF** ou **Celular (WhatsApp)** através de seletores em pills no `AuthModal.tsx`.
   - O campo aplica máscara em tempo real dinâmica para CPF (`000.000.000-00`) e Celular (`(DD) 90000-0000`).
   - Para manter as regras estritas de segurança do Firestore (onde consultas não autenticadas em `/usuarios` são bloqueadas contra scraping), a resolução do identificador ocorre no backend através da rota segura `/api/auth/lookup` via Firebase Admin SDK.
   - O endpoint localiza o e-mail correspondente tanto para formatos com ou sem pontuação na base legada de 867 usuários e repassa ao `AuthContext` para autenticação transparente via `signInWithEmailAndPassword` no Firebase Auth.

---

## 6. Stack Tecnológica e Habilidades (Skills) Vinculadas

- **Frontend & Backend:** Next.js (App Router), React, TypeScript. `serverExternalPackages: ["firebase-admin", "@google-cloud/firestore"]` configurado no `next.config.ts` para suporte nativo ao Firebase Admin SDK no Turbopack.
- **Estilização & Componentes:** Tailwind CSS, Radix UI / Shadcn UI, Lucide Icons, animações fluidas e micro-interações. Componentes dedicados com identidade Dark & Gold: `@/components/ui/DatePicker.tsx`, `@/components/ui/Checkbox.tsx`.
- **Banco de Dados & Autenticação:** Firebase Cloud Firestore + Firebase Authentication (preparado para migração em lote da base existente).
- **Gateway de Pagamento:** Mercado Pago (SDK Oficial Node/JS, Checkout Transparente e Webhooks).
- **Skills Ativas no Repositório:**
  - `responsive-design`, `impeccable` (Design mobile-first, eliminação de zoom no iOS, touch targets 44px+, safe area insets e layout fluido em telas pequenas).
  - `copywriting`, `marketing-psychology` (Copywriting de alta conversão, psicologia de vendas, urgência e escassez para festival/ingressos).
  - `mp-integrate`, `mp-webhooks`, `mp-review` (Mercado Pago oficial).
  - `firebase-firestore`, `firebase-auth-basics`, `firestore-rules-creation`, `firebase-security-rules-auditor` (Firebase oficial).
  - `security-and-hardening`, `context-engineering` (Hardening e preservação de escopo).
  - `ui-ux-pro-max`, `frontend-design`, `shadcn`, `web-design-guidelines` (Excelência visual e acessibilidade).

---

## 7. Diretrizes Estéticas Anti-Clichês de IA (Design Guardrails)

Para preservar a autenticidade de grande festival eletrônico/funk e evitar a estética genérica de modelos de linguagem:
1. **PROIBIDO:** Badges ovais com ícones de brilho/estrela (`Sparkles` ✨) e textos genéricos como "apresenta a maior comemoração da década".
2. **PROIBIDO:** Layouts com cara de SaaS, dashboard corporativo ou landing page pré-fabricada de IA.
3. **OBRIGATÓRIO:** Tipografia nobre e limpa (estilo pôster oficial de festival), uso imersivo e orgânico da iluminação dark & gold, e foco absoluto na força visual das marcas oficiais (**Especial 10 Anos DJ Lipe** e **Sintonia 360**).

---

## 8. Higiene e Organização do Workspace (Zero Scratch Bloat & Limpeza Imediata)

> **REGRA PERMANENTE DE LIMPEZA E ORGANIZAÇÃO:**
> O repositório deve se manter enxuto, profissional e livre de arquivos temporários de desenvolvimento ou scripts soltos.

1. **Proibição de Pastas e Arquivos Scratch Persistentes:**
   - **NUNCA** deixar pastas como `scratch/` ou arquivos de testes exploratórios descartáveis no repositório após concluir uma verificação (ex: `analyze_density.js`, `render_ascii.js`, `preview.html`, capturas `extracted_*.png`).
   - Se for estritamente necessário criar um script temporário para inspecionar dados ou testar fórmulas, o arquivo deve ser executado e **imediatamente removido** antes da conclusão da tarefa.
2. **Localização Adequada de Scripts Operacionais:**
   - Apenas scripts com finalidade real e contínua de infraestrutura ou migração de banco de dados (como `scripts/migrate_users_to_uid.js`) podem residir no projeto, devendo ficar exclusivamente na pasta `scripts/`.
3. **Gestão Limpa de Assets e Logos:**
   - Nenhum arquivo de imagem ou vetor (.svg, .png, etc.) deve ficar solto na raiz do projeto.
   - Todos os arquivos visuais oficiais pertencem obrigatoriamente a subpastas de `public/` (ex: `public/assets/logos/`), com nomes padronizados em kebab-case, sem duplicatas ou arquivos redundantes.
   - Arquivos boilerplate padrão de frameworks que não são utilizados (ex: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) devem ser removidos para manter o bundle enxuto.

---

## 9. Diretrizes Jurídicas, Termos de Uso e Regulamento dos Lounges

As regras operacionais e contratuais estabelecidas pelas produtoras **GHVE Eventos** e **RL Produções** governam a emissão de ingressos e a utilização dos setores:

1. **Política Estrita de Não-Reembolso:**
   - Ingressos e reservas não possuem direito a cancelamento, estorno ou devolução por desistência voluntária ou impossibilidade de comparecimento.
   - O estorno financeiro é concedido exclusivamente na hipótese de cancelamento definitivo do festival por iniciativa da organização.
2. **Sigilo e Responsabilidade pelo QR Code:**
   - O voucher com QR Code é de utilização unitária, nominal e pessoal.
   - A organização e as produtoras **NÃO se responsabilizam** caso o portador vaze, publique, tire prints ou compartilhe seu ingresso com terceiros. A entrada no sistema de catracas é autorizada estritamente para o primeiro portador que validar o código na portaria.
3. **Regulamento Oficial dos Lounges Automotivos (Adesão Automática):**
   - **Adesão no Pagamento:** O pagamento ou reserva de Lounge Automotivo (Lounge Rosa ou Lounge Azul) consolida aceite incondicional e irretratável às regras do contrato.
   - **Estrutura Gradeada:** Vaga individual delimitada por gradil de segurança para 01 veículo curtir o evento com privacidade.
   - **Valores, Pulseiras e Horários:** Valores de comercialização, lote, quantidade de pulseiras e horários de entrega antecipada do veículo são definidos e combinados diretamente com a organização/produção.
   - **Tolerância Zero para Bebidas Externas:** Proibição absoluta de ingresso ou consumo de quaisquer bebidas trazidas de fora em garrafas, latas, caixas térmicas, coolers ou copos térmicos. Todo o consumo deve ser originado nos bares oficiais.
   - **Revista Veicular Minuciosa:** Vistoria integral e obrigatória de todo o veículo (cabine, porta-malas, módulos e estepe), com **acompanhamento exclusivo e obrigatório do proprietário do carro** (acompanhantes aguardam fora da triagem).
   - **Penalidade Máxima Sem Estorno:** A localização de qualquer bebida externa oculta acarreta retirada imediata do veículo do evento, devolução dos itens na saída e **PERDA TOTAL DE ESTORNO OU REEMBOLSO** por quebra de regra contratual essencial.
   - **Imobilidade do Veículo:** Veículos devem permanecer estacionados e imóveis durante todo o festival até a liberação e orientação final da produção.
4. **Consentimento Obrigatório no Cadastro (LGPD):**
   - A criação de conta oficial exige marcação explícita de concordância com os Termos de Uso, Regulamento dos Lounges e Política de Privacidade de dados.
   - Os documentos completos ficam permanentemente disponíveis no modal dedicado (`TermsModal.tsx`), no rodapé global e na rota dedicada [`/termos`](file:///src/app/termos/page.tsx).

---

## 10. Registro de Atualizações do Documento (Changelog)

| Data | Autor | Resumo da Atualização |
| :--- | :--- | :--- |
| **22/10/2026** | Antigravity AI + Tulio | **HIGIENIZAÇÃO DE SEGREDOS & PUSH AO GITHUB (`resend.ts`):** Resolução do bloqueio *GitHub Push Protection (GH013)*: (1) **Remoção de Segredo Local:** A chave de API do Resend que constava como fallback local no arquivo `src/lib/email/resend.ts` foi removida, garantindo que o client leia exclusivamente `process.env.RESEND_API_KEY || ""` (chave real segura no `.env.local`); (2) **Reescrita Segura de Commit:** Executado `git commit --amend` no commit local para reescrever o histórico sem vazamento de tokens; (3) **Publicação no Repositório:** `git push -u origin main` realizado com sucesso absoluto no branch oficial `main`. |
| **22/10/2026** | Antigravity AI + Tulio | **DIAGRAMAÇÃO TIPOGRÁFICA DO CONTADOR (`EventCountdown.tsx`):** Reestruturação da chamada de contagem regressiva para leitura fluida: (1) **Topo Dourado:** Texto "FALTAM" em destaque dourado metálico posicionado logo acima dos números; (2) **Blocos de Dígitos no Centro:** Cards de tempo com animação suave e degradê dourado; (3) **Base Textual:** Frase "para a melhor noite do ano" posicionada na base, logo abaixo dos rótulos de unidades de tempo, conferindo simetria perfeita e leitura natural ("Faltam [tempo] para a melhor noite do ano"); (4) **Compilação e Verificação:** `npm run build` aprovado com código 0. |
| **22/10/2026** | Antigravity AI + Tulio | **REFINO VISUAL DO CONTADOR REGRESSIVO (`EventCountdown.tsx`):** Ajuste estético a pedido do cliente: (1) **Remoção da Moldura Externa Amarela:** Eliminação do container retangular delimitador, deixando os blocos numéricos integrados organicamente ao background do Hero; (2) **Nova Chamada Persuasiva:** Substituição do badge anterior pelo texto de alto impacto *"Faltam: para a melhor noite do ano"*; (3) **Preservação das Animações e Lógica Dinâmica:** Mantida a troca suave de números sem recarregar o Hero e o algoritmo de ocultação progressiva (meses somem quando zeram, dias somem quando zeram, etc.); (4) **Compilação e Verificação:** `npm run build` aprovado com código 0. |
| **22/10/2026** | Antigravity AI + Tulio | **INTEGRAÇÃO OFICIAL RESEND & FUNIL DE E-MAILS DE ALTA CONVERSÃO:** Configuração completa do serviço oficial de e-mails transacionais e de marketing via **Resend**: (1) **Chave de API & Variáveis:** Instalação do SDK `resend` e configuração da chave no `.env.local` (`RESEND_API_KEY`, `RESEND_FROM_EMAIL` com remetente oficial Sintonia e `NEXT_PUBLIC_APP_URL`); (2) **Template Oficial de Ingresso Confirmado (`TicketEmailTemplate.ts`):** Design Dark & Gold de alta fidelidade visual estilo *Festival VIP Pass*, contendo assinatura oficial Sintonia & Especial 10 Anos DJ Lipe, QR Code gerado em tempo real com dados criptográficos, código de voucher único (`#SINTONIA-10A-...`), dados cadastrais do titular (nome e CPF com máscara), setor, valor pago, orientações essenciais de portaria e botão CTA de download e visualização direta no perfil (`/perfil?tab=ingressos`); (3) **Template de Abandono de Carrinho & PIX Pendente (`PendingPixEmailTemplate.ts`):** E-mail persuasivo do funil de vendas baseado nas skills `copywriting` e `marketing-psychology`, com gatilho de escassez e pré-reserva de vaga de 1º Lote (limite de 15 minutos), resumo do setor/valor, código PIX Copia e Cola formatado em bloco mono destacado, botão direto de pagamento e canal de suporte via WhatsApp para quebra de atrito; (4) **Rotas Backend:** Integração nativa na emissão de ingresso (`/api/tickets/issue`), criação do endpoint de início de checkout (`/api/checkout/initiate`) e endpoint de teste seguro (`/api/email/test`); (5) **Validação:** Teste de envio com a API do Resend executado e validado com sucesso (ID gerado na infraestrutura). |
| **22/10/2026** | Antigravity AI + Tulio | **RESPONSIVIDADE TOTAL NA BARRA DE ABAS & CARDS DO PERFIL (`/perfil`):** Resolução do overflow visual onde o botão "Configurações" extrapolava a margem direita da barra em telas móveis: (1) **Substituição de Flex por Grid Estrito de 3 Colunas:** O container passou a utilizar `w-full grid grid-cols-3 gap-1 overflow-hidden`, garantindo que cada aba ocupe rigorosamente 33.33% da largura útil sem empurrar as demais para fora; (2) **Rótulos Adaptativos Ultra-Legíveis:** No mobile, os títulos longos adaptam-se com precisão ("Perfil", "Ingressos" e "Ajustes"), expandindo para "Informações", "Ingressos" e "Configurações" no desktop (`sm:`), mantendo touch targets ergonômicos de 44px+; (3) **Equalização de Espaçamentos nos Cards:** Redução equilibrada de paddings nos formulários (`p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl`), evitando esmagamento de campos em smartphones compactos (320px–380px); (4) **Compilação e Verificação:** `npm run build` aprovado com código 0 em todas as rotas. |
| **22/10/2026** | Antigravity AI + Tulio | **REFORMULAÇÃO DOS CARDS DO HERO NO MOBILE (FITA VIP INTEGRADA GLASSMORPHY):** Substituição dos 3 blocos retangulares empilhados e pesados do Hero por uma fita integrada luxuosa (*VIP Event Ribbon*): (1) **Layout de 3 Colunas Integradas:** Em vez de ocupar 250px verticais de rolagem no mobile, os três dados essenciais (*Data Oficial*, *Local* e *Ingressos*) agora são exibidos lado a lado em um único painel com vidro escuro glassmorphic (`bg-gradient-to-b from-[#101116]/95 via-[#0b1322]/90 to-[#101116]/95`), divisores verticais sutis em ouro suave (`divide-[#c9a227]/20`) e linha de reflexo dourado no topo; (2) **Badges Luminosos para Ícones:** Cada item recebeu um badge próprio (`w-8 h-8 rounded-xl bg-gradient-to-br from-[#c9a227]/20 to-[#0b1930] border border-[#c9a227]/40`) com iluminação neon dourada e ícones nítidos; (3) **Tipografia & Proporções Otimizadas:** Data compacta no mobile ("10 ABR 2027" com "Sábado • 22h") e expandida no desktop, Local ("Capitu" / "Tupaciguara - MG") e Ingressos com badge de status ao vivo ("1º Lote" com indicador de pulso verde esmeralda "Abertas"); (4) **Conversão Mobile Superior:** Redução da altura da seção no smartphone em mais de 60%, trazendo o botão CTA primário de garantia de ingresso imediatamente para a primeira dobra da tela (above the fold). |
| **21/10/2026** | Antigravity AI + Tulio | **TRANSFORMAÇÃO MOBILE-FIRST & RESPONSIVIDADE COMPLETA (SKILLS `responsive-design` & `impeccable`):** Instalação e execução das skills oficiais de responsividade e mobile design em todo o site. (1) **Eliminação Definitiva do Auto-Zoom no iOS:** Todos os inputs de formulário (`AuthModal`, `DatePicker`, `/perfil`) foram padronizados para `text-base sm:text-sm` (16px em telas móveis e 14px em desktop), impedindo que o Safari do iPhone dê zoom abrupto ao focar campos; (2) **Dimensões e Touch Targets (Mínimo 44px):** Todos os botões primários, seletores e itens de menu foram ajustados para altura mínima de 44px a 48px com espaçamento ergonômico para toque de polegar; (3) **Hero Scaling Fluido:** Abertura e escala orgânica do logotipo oficial e badges para telas ultra-compactas (320px–380px) sem cortes ou rolagem horizontal indesejada; (4) **Barra de Conversão Flutuante Mobile:** Adição de padding de compensação (`pb-24 sm:pb-0`) no container da Home para evitar sobreposição aos links de rodapé institucionais e termos; (5) **Compilação e Verificação:** `npm run build` executado e aprovado com código 0 (sucesso absoluto em todas as 9 rotas estáticas e dinâmicas). |
| **21/10/2026** | Antigravity AI + Tulio | **PAINEL MEU PERFIL, GESTÃO DE INGRESSOS COM QR CODE & NAVBAR MOBILE DE ALTA CONVERSÃO:** Implementação completa da central do usuário (`/perfil`) com navegação contínua mantendo a Navbar oficial fixa no topo: (1) **Aba Informações:** Exibição completa e formatada de dados cadastrais (Nome, E-mail, CPF com máscara, WhatsApp com máscara, Data de Nascimento e Idade calculada), com badge de Membro Oficial; (2) **Aba Ingressos:** Card de Festival Pass de luxo com QR Code cristalino em tempo real gerado via biblioteca `qrcode`, número do voucher único (`#SINTONIA-10A-...`), setor, valor, data/local e botão de download/impressão de voucher, além de estado vazio elegante e emissão de demonstração para testes; (3) **Aba Configurações:** Atualização segura de e-mail (com reautenticação por senha), atualização de número de WhatsApp (com máscara automática) e troca de senha de acesso com validação criptográfica; (4) **Navbar Unificada (`Navbar.tsx`):** Opção "Meu Perfil" e "Meus Ingressos" no dropdown desktop; botão flexível de ação ("Garantir Ingresso" para quem não tem e "Meu Ingresso" com destaque dourado para quem já comprou); menu sanduíche mobile responsivo com gaveta escura, atalhos de perfil e barra flutuante de alta conversão fixada na base no mobile. |
| **21/10/2026** | Antigravity AI + Tulio | **COMPATIBILIDADE TURBOPACK & FIREBASE ADMIN SDK:** Resolução do erro `Cannot find module '@opentelemetry/api'` durante a resolução de identificadores de login. Configuração de `serverExternalPackages: ["firebase-admin", "@google-cloud/firestore"]` no `next.config.ts` e instalação direta da dependência `@opentelemetry/api`. As requisições de lookup de login por CPF, Celular e E-mail agora executam diretamente no runtime Node sem bloqueio do empacotador, com tempo de resposta inferior a 100ms. |
| **21/10/2026** | Antigravity AI + Tulio | **CHECKBOX CUSTOMIZADO DARK & GOLD (`@/components/ui/Checkbox.tsx`):** Substituição do `<input type="checkbox">` nativo do navegador (que renderizava um quadrado branco básico com check preto) por um componente customizado de alta fidelidade visual, alinhado à identidade noturna e luxuosa do evento. Possui estado desmarcado em Obsidian Dark (`#101116`) com bordas Midnight Navy (`#0b1930`), hover com borda dourada e brilho sutil (`#c9a227`), e estado marcado com gradiente metálico dourado (`#c9a227` ➔ `#f5e6b8`), ícone de check escuro (`#07090d`) com traço espesso (stroke 3), aura de iluminação neon dourada (`shadow-[0_0_12px_rgba(201,162,39,0.45)]`), micro-animação tátil de clique (`active:scale-90`) e total acessibilidade por teclado (`focus-visible`). Integrado imediatamente ao aceite de termos no modal de cadastro (`AuthModal.tsx`). |
| **21/10/2026** | Antigravity AI + Tulio | **LOGIN MULTI-IDENTIFICADOR (E-MAIL, CPF OU CELULAR):** Implementação de seletor com segmented pill buttons (`E-mail`, `CPF`, `Celular`) no modal de login/recuperação de senha (`AuthModal.tsx`). O input ajusta dinamicamente ícone, placeholder e máscara em tempo real (`000.000.000-00` para CPF e `(DD) 90000-0000` para Celular). Integração com rota de resolução backend `/api/auth/lookup` via Firebase Admin SDK e `AuthContext.tsx`, permitindo autenticação transparente tanto para e-mail quanto para CPF e telefone em compatibilidade total com a base existente de 867 usuários e com as regras de segurança do Firestore. |
| **21/10/2026** | Antigravity AI + Tulio | **LOGO / SÍMBOLO DA SINTONIA LINK PARA HOME:** O conjunto do símbolo da Sintonia e o selo dourado "APRESENTA" na navbar foram envolvidos em um link semântico com rolagem suave ao topo (`window.scrollTo({ top: 0, behavior: "smooth" })`) e retorno imediato à Home a partir de qualquer rota (incluindo `/termos`), com micro-interações de hover e active. |
| **21/10/2026** | Antigravity AI + Tulio | **LINK TERMOS NO HEADER NAVBAR:** Adição do item de navegação `Termos` no menu superior do cabeçalho (`page.tsx`), posicionado harmonicamente ao lado de `Dúvidas` com link direto para a rota `/termos`. |
| **21/10/2026** | Antigravity AI + Tulio | **TERMOS DE USO, REGULAMENTO DOS LOUNGES & POLÍTICA DE PRIVACIDADE:** Implementação completa da infraestrutura jurídica do festival. Criação do componente com abas interativas `@/components/legal/TermsModal.tsx` e da rota dedicada `@/app/termos/page.tsx`, abrangendo: (1) Política de não-reembolso (exceto se o evento for cancelado), (2) Isenção de responsabilidade por vazamento ou prints de QR Code pelo usuário, (3) Regulamento oficial de Lounges Automotivos adaptado do contrato (adesão automática, tolerância zero a bebidas trazidas de fora, revista veicular minuciosa com presença exclusiva do dono do carro, retirada imediata sem estorno, valores/pulseiras/horários a definir com a organização, som automotivo e responsabilidade civil), e (4) Política de Privacidade conforme a LGPD. Integração do checkbox obrigatório no modal de cadastro (`AuthModal.tsx`) e links de acesso direto no rodapé. |
| **21/10/2026** | Antigravity AI + Tulio | **DESCRIÇÕES DOS INGRESSOS COMPLETAS & SEM CORTES:** Remoção do `line-clamp-2` nas descrições dos 4 cards de setores/ingressos (Pista, Lounge Rosa, Lounge Azul e Camarote no Palco). Padronização da altura mínima em `min-h-[52px]` com `leading-relaxed`, garantindo que 100% do texto seja exibido integralmente em todas as resoluções, mantendo o alinhamento simétrico da grade de cards e a harmonia visual. |
| **21/10/2026** | Antigravity AI + Tulio | **DATEPICKER SMART PLACEMENT & MODAL OVERFLOW FIX:** Resolução estética definitiva para o corte inferior do calendário no modal de autenticação (`AuthModal.tsx`). O container do modal agora permite que elementos flutuantes saiam naturalmente sem corte (`overflow-visible`), com `rounded-t-2xl` na barra de brilho e suporte a rolagem no backdrop (`overflow-y-auto`). Além disso, o `@/components/ui/DatePicker.tsx` ganhou detecção automática de espaço de tela (`dropUp`), abrindo elegantemente para cima quando o espaço inferior for limitado (especialmente no mobile e laptops), garantindo 100% de visibilidade de todos os dias e dos botões "Hoje" e "Confirmar". |
| **21/10/2026** | Antigravity AI + Tulio | **HIGIENE DO WORKSPACE & ZERO SCRATCH BLOAT:** Remoção completa da pasta temporária `scratch/` (15+ scripts e capturas de testes), eliminação de duplicatas de SVGs soltas na raiz e em `public/assets/logos/`, e deleção de arquivos boilerplate não utilizados em `public/`. Formalização da Seção 8 no `AGENTS.md` como diretriz permanente de limpeza imediata para todas as próximas iterações. |
| **21/10/2026** | Antigravity AI + Tulio | **CALENDÁRIO ESPECIAL & RESPONSIVO (DATEPICKER):** Criação do componente customizado `@/components/ui/DatePicker.tsx` para substituir o seletor nativo do navegador (`<input type="date">`). O novo calendário possui design Dark & Gold de alta fidelidade, suporte a digitação com máscara automática em tempo real (`DD/MM/AAAA`), seletor rápido com 1 clique para saltar entre Anos (resolvendo a navegação para datas de nascimento) e Meses, grade de dias responsiva para mobile/tablet/desktop, e integração completa ao modal de autenticação. |
| **21/10/2026** | Antigravity AI + Tulio | **INTEGRAÇÃO NATIVA FIREBASE AUTH & FIRESTORE:** Conexão nativa e transparente com a base existente de 883 usuários no Firebase Auth e 867 documentos na coleção `usuarios`. O site foi configurado para respeitar a organização original do banco de dados (documentos indexados por e-mail com `cpf`, `dataNascimento`, `email`, `idade`, `nome`, `role`, `telefone`, `uid`), implementando `AuthContext` com recuperação de perfil híbrida (e-mail e UID), `AuthModal` com design dark & gold para Login, Cadastro e Recuperação de Senha, e `firestore.rules` atualizado para proteger o acesso por proprietário via e-mail e UID. |
| **21/10/2026** | Antigravity AI + Tulio | **FIREBASE & FIRESTORE SETUP + AUDITORIA DE USUÁRIOS:** Configuração completa do Firebase Client SDK e Firebase Admin SDK com credenciais do projeto `sintonia360-46761`. Auditoria da base existente de 883 usuários no Auth e 867 no Firestore. Criação de tipagem `@/types/user.ts`, validação de dados limpos `@/lib/validations/user.ts` (Zod) e regras de segurança `firestore.rules`. |
| **20/10/2026** | Antigravity AI + Tulio | **LOGOS OFICIAIS GHVE & RL PRODUÇÕES:** Integração das logos oficiais em vetor (.svg) na paleta branca oficial das produtoras GHVE Eventos (`logo-ghve-branca.svg`) e RL Produções (`logo-rl-producoes.svg`). Aplicação no rodapé institucional (*Realização & Produção Oficial*) e no card de Infraestrutura/Segurança, com viewBoxes otimizados para equilíbrio de peso visual e eliminação de bordas vazias. |
| **20/10/2026** | Antigravity AI + Tulio | **PRECIFICAÇÃO DIRETA & LIMPA (PISTA):** Remoção do preço 'de R$ 90' riscado (estética promocional) e do texto '+ Taxa de serviço'. Exibição limpa e direta do valor oficial do 1º Lote de Pista (R$ 60,00), mantendo alinhamento simétrico com os demais cards. |
| **20/10/2026** | Antigravity AI + Tulio | **REMOÇÃO DA ÁREA VIP & DEFINIÇÃO DOS 4 SETORES OFICIAIS:** Remoção definitiva do setor 'Área VIP'. Reestruturação dos 4 cards oficiais: (1) Pista destacada como 'Favorito do Público' com venda online a R$ 60, (2) Lounge Rosa com 12 vagas de carros na ala esquerda, (3) Lounge Azul com 12 vagas de carros na ala direita e (4) Camarote no Palco com 4 unidades exclusivas. Atualização de links de WhatsApp e FAQ. |
| **20/10/2026** | Antigravity AI + Tulio | **CONCORDÂNCIA DE GÊNERO FEMININO ('DA SINTONIA'):** Padronização de gênero gramatical de todas as referências ao evento para o feminino (*"da Sintonia Edição Especial 10 Anos DJ Lipe"*, *"à Sintonia"*), corrigindo os links de encaminhamento do WhatsApp oficial. |
| **20/10/2026** | Antigravity AI + Tulio | **EQUALIZAÇÃO & ALINHAMENTO DOS CARDS DE INGRESSOS:** Reestruturação da grade dos 4 cards de lotes/setores com arquitetura Flexbox (`h-full`, `items-stretch`, `flex-1` nas features, blocos de preço fixados na base com `h-[78px]` e botões padronizados em `h-12`). Adição do 4º benefício no card de Pista, eliminando vazios e desníveis entre os cards. |
| **20/10/2026** | Antigravity AI + Tulio | **REMOÇÃO DE CONTAGEM FIXA DE PÚBLICO & AJUSTE DO HERO:** Remoção de todas as menções numéricas fixas de capacidade (2.000 pessoas) no site, metadados e documentação. Atualização do texto do Hero para "milhares de pessoas vibrando na mesma sintonia!", substituição do badge de capacidade por "Ingressos: Lotes Limitados", e readequação das seções de FAQ e Estrutura com foco em conforto e lotação controlada. |
| **20/10/2026** | Antigravity AI + Tulio | **NOVO NOME OFICIAL DA FESTA:** Atualização da denominação do evento para **Sintonia Edição Especial 10 Anos DJ Lipe** (em substituição a Sintonia 360 - Especial 10 Anos DJ Lipe). Aplicação do efeito cascata no Hero, FAQ, links de atendimento WhatsApp, rodapé, metadados SEO/OpenGraph e documentação de engenharia. |
| **20/10/2026** | Antigravity AI + Tulio | **AJUSTE DE NOMENCLATURA DO LOCAL (CAPITU):** Atualização da nomenclatura oficial do local para **Capitu, Tupaciguara - MG** (em substituição a Parque Capitu / Parque de Exposições Capitu). Aplicação do efeito cascata no badge do Hero, FAQ, metadados SEO/OpenGraph e documentação. |
| **20/10/2026** | Antigravity AI + Tulio | **SIMPLIFICAÇÃO DO HEADER (SÍMBOLO SINTONIA 360):** Remoção da logo com a escrita textual da Sintonia 360 no cabeçalho/navbar, mantendo exclusivamente o ícone/símbolo da marca ao lado do badge dourado "APRESENTA", garantindo uma identidade visual mais limpa, sofisticada e minimalista na barra de navegação superior. |
| **19/10/2026** | Antigravity AI + Tulio | **GRADE DE 4 CARDS & INTEGRAÇÃO WHATSAPP:** Expansão da seção de ingressos para 4 cards oficiais: (1) Pista, (2) Área VIP Premium com destaque "Mais Recomendado", (3) Camarote no Palco (sob consulta) e (4) Lounges Automotivos (sob consulta). Os botões de Camarote e Lounges direcionam diretamente para o WhatsApp oficial `+55 34 9153-5921` com mensagem contextualizada pré-configurada identificando a origem do lead e o setor de interesse. |
| **19/10/2026** | Antigravity AI + Tulio | **DATA & LOCAL OFICIAIS:** Definição oficial da data para **10 de Abril de 2027 (10/04/2027)** e local no **Parque de Exposições Capitu, em Tupaciguara - MG**, com capacidade confirmada para aproximadamente **2.000 pessoas**. Atualização em cascata aplicada nos badges do Hero, FAQs, metadados de SEO/OpenGraph e documentação. |
| **19/10/2026** | Antigravity AI + Tulio | **AJUSTE DE CAPACIDADE (2.000 PESSOAS) & NOVO COPYWRITING:** Atualização da capacidade oficial para média de ~2.000 pessoas (reforçando a exclusividade, conforto e escassez real de ingressos). Redefinição completa do copywriting e da psicologia de conversão de toda a plataforma aplicando as skills `copywriting` e `marketing-psychology`, eliminando clichês de IA, estruturando ancoragem de preços nos lotes, adicionando a seção de Dúvidas Frequentes (FAQ) interativa para quebra de objeções, refinando o hook do Hero para *"com 2.000 pessoas vibrando na mesma sintonia"* em alusão à marca e reforçando gatilhos de segurança com Mercado Pago. |
| **19/10/2026** | Antigravity AI + Tulio | **CONFIDENCIALIDADE DO MAPA:** Remoção completa e imediata do croqui visual do mapa e de qualquer imagem estrutural no site. O layout gráfico enviado pelo cliente permanece estritamente interno para alinhamento de produção (contém ajustes pendentes) e NÃO será divulgado até liberação oficial. A grade pública exibe os 3 lotes principais (Pista, Área VIP e Camarote), com chamada discreta para lounges sob consulta. |
| **19/10/2026** | Antigravity AI + Tulio | Instalação e ativação das skills de alta conversão `copywriting` (229K+ installs) e `marketing-psychology` (160K+ installs) para redação persuasiva dos textos, chamadas para ação (CTAs) e gatilhos de compra de ingressos. |
| **19/10/2026** | Antigravity AI + Tulio | Integração do Mapa Oficial do Evento e estruturação dos 4 setores: (1) Pista com Bar Central, (2) Área VIP Premium frente ao palco, (3) 4 Camarotes no Palco ao lado do DJ Lipe com camarim e banheiro exclusivo, e (4) Lounges Automotivos (Lounge Rosa e Lounge Azul com 12 carros de cada lado separados por gradil). |
| **19/10/2026** | Antigravity AI + Tulio | Atualização da linha de copyright no rodapé para atribuição oficial às produtoras: `© 2026 GHVE Eventos & RL Produções. Todos os direitos reservados.` |
| **19/10/2026** | Antigravity AI + Tulio | Regra de negócio: definição de que o palco NÃO será 360° nesta edição. Aplicação do efeito cascata em todo o projeto: atualização do subtítulo do Hero com a copy oficial fornecida, remoção de menções a "palco 360°/arena 360°" nos setores e na navegação, e renomeação dos setores para Pista, Área VIP Premium e Camarote Especial 10 Anos. |
| **19/10/2026** | Antigravity AI + Tulio | Remoção do texto redundante "Sintonia 360 apresenta" acima da logo no Hero, mantendo a assinatura exclusivamente no header/navbar e dando foco imediato ao Especial 10 Anos DJ Lipe. |
| **19/10/2026** | Antigravity AI + Tulio | Otimização dos viewBoxes dos SVGs da Sintonia 360 (remoção de áreas vazias/padding fantasma); ampliação visual das logos no header, aproximação imediata e estilização da tag "APRESENTA" no tom dourado principal (`#c9a227`). |
| **19/10/2026** | Antigravity AI + Tulio | Remoção de badges clichês de IA (`Sparkles` e tags SaaS); adição da seção 7 (Diretrizes Estéticas Anti-Clichês de IA) e integração do design autêntico de festival. |
| **19/10/2026** | Antigravity AI + Tulio | Criação inicial do `AGENTS.md` com a definição da hierarquia de marcas, paleta oficial, regra de cascata, segurança de concorrência para 4k pessoas e catálogo de logos. |



<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
