"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  ShieldCheck,
  Car,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Ban,
  Scale,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { TermsTab } from "@/components/legal/TermsModal";
import { Navbar } from "@/components/layout/Navbar";

export default function TermosPage() {
  const [activeTab, setActiveTab] = useState<TermsTab>("geral");

  return (
    <div className="min-h-screen bg-[#07090d] text-[#f6f8fc] selection:bg-[#c9a227] selection:text-[#07090d]">
      {/* Top Header Glow */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] fixed top-0 left-0 right-0 z-50" />

      {/* Navigation Header Unificada */}
      <Navbar />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Page Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b1930] border border-[#c9a227]/30 text-xs font-bold text-[#c9a227] mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Transparência e Segurança Jurídica</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#f6f8fc] tracking-tight">
            Termos de Uso, Regulamento dos Lounges e Privacidade
          </h1>
          <p className="text-sm text-[#a8b2c3] mt-3">
            Realização e produção oficial por GHVE Eventos e RL Produções para a Sintonia Edição Especial 10 Anos DJ Lipe (Tupaciguara - MG).
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="p-1.5 rounded-2xl bg-[#101116] border border-[#0b1930] mb-8 flex flex-col sm:flex-row gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("geral")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "geral"
                ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_20px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#0b1930]"
            }`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>Termos de Uso & Ingressos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lounges")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "lounges"
                ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_20px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#0b1930]"
            }`}
          >
            <Car className="w-4 h-4 flex-shrink-0" />
            <span>Regulamento Lounges Automotivos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("privacidade")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "privacidade"
                ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_20px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#0b1930]"
            }`}
          >
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>Política de Privacidade (LGPD)</span>
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="rounded-2xl bg-[#101116] border border-[#0b1930] p-6 sm:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.8)] text-sm text-[#a8b2c3] leading-relaxed space-y-8">
          {/* TAB 1: GERAL & INGRESSOS */}
          {activeTab === "geral" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Highlight Box */}
              <div className="p-5 rounded-xl bg-[#0b1930]/60 border border-[#c9a227]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#f5e6b8] font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
                  <span>Avisos Fundamentais de Segurança e Emissão de Ingressos</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-[#101116] border border-[#0b1930]">
                    <span className="text-[#f6f8fc] font-bold block mb-1">
                      🚫 Sem Reembolso / Estorno
                    </span>
                    <p className="text-[#a8b2c3]">
                      Não haverá reembolso, troca ou estorno de valores em caso de desistência ou impossibilidade de comparecimento.
                      <strong className="text-[#f6f8fc]"> O estorno financeiro é exclusivo apenas em caso de cancelamento definitivo do evento</strong> pela produção oficial.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#101116] border border-[#0b1930]">
                    <span className="text-[#f6f8fc] font-bold block mb-1">
                      🔒 Sigilo do QR Code Pessoal
                    </span>
                    <p className="text-[#a8b2c3]">
                      O QR Code do ingresso é pessoal e de validação unitária. 
                      <strong className="text-[#f6f8fc]"> Não nos responsabilizamos caso o usuário divulgue, envie prints ou vaze seu código para terceiros</strong>. O primeiro a passar pelo leitor terá o acesso liberado.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  1. Da Adesão e Validade dos Termos
                </h2>
                <p>
                  Ao acessar a plataforma oficial, criar uma conta, adquirir qualquer modalidade de ingresso ou efetuar pagamentos para a 
                  <strong className="text-[#f6f8fc]"> Sintonia Edição Especial 10 Anos DJ Lipe</strong>, você declara ter lido, compreendido e aceito integralmente 
                  todas as diretrizes, condições e penalidades estipuladas neste instrumento, gerido pelas produtoras oficiais 
                  <strong className="text-[#f6f8fc]"> GHVE Eventos</strong> e <strong className="text-[#f6f8fc]">RL Produções</strong>.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  2. Emissão Nominal e Segurança do Acesso
                </h2>
                <p>
                  Todos os ingressos comercializados nesta plataforma são emitidos de forma nominal, vinculados ao CPF e ao cadastro do titular. 
                  A cada compra confirmada é gerado um <strong>Voucher Digital com QR Code de Alta Segurança</strong>. 
                  Para acessar o evento, é indispensável a apresentação do documento oficial original com foto (RG, CNH ou documento digital oficial) 
                  concomitantemente com o voucher digital na tela do aparelho ou impresso em boa resolução.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  3. Da Exclusiva Responsabilidade pelo QR Code (Vazamentos e Prints)
                </h2>
                <p>
                  O QR Code é pessoal e de utilização estritamente unitária. O sistema de controle de acesso nos portões opera com sincronização 
                  antifraude em tempo real. No momento da leitura ótica, o primeiro portador que apresentar o QR Code terá a entrada liberada no sistema, 
                  sendo <strong>automaticamente bloqueada e invalidada</strong> qualquer tentativa subsequente de entrada com o mesmo código.
                </p>
                <p className="mt-2 text-xs bg-[#07090d] p-3 rounded-xl border border-[#0b1930] text-[#f5e6b8]">
                  ⚠️ <strong>Atenção:</strong> A organização e as produtoras NÃO se responsabilizam por ingressos clonados, revendidos por terceiros não autorizados 
                  ou vazados por descuido, prints em redes sociais ou aplicativos de mensagens por parte do comprador. Guarde seu voucher com zelo e não compartilhe seu código.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  4. Da Política Estrita de Não-Reembolso
                </h2>
                <p>
                  Em razão do planejamento logístico antecipado, contratações artísticas de grande porte e limitação de lotes, os ingressos 
                  adquiridos <strong>NÃO ESTÃO SUJEITOS A REEMBOLSO OU DEVOLUÇÃO</strong>, seja por desistência, motivos pessoais, saúde ou não comparecimento.
                </p>
                <p className="mt-2">
                  A única e exclusiva hipótese de estorno ou reembolso financeiro integral ocorrerá no caso de <strong>cancelamento definitivo do evento</strong> por parte 
                  das produtoras sem reagendamento, caso em que as diretrizes para devolução serão amplamente divulgadas nos canais oficiais.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  5. Normas de Segurança, Revista e Convivência
                </h2>
                <p>
                  O portador do ingresso concorda expressamente em se submeter às revistas de segurança pessoais na portaria. É terminantemente proibido o 
                  ingresso com armas brancas ou de fogo, objetos cortantes ou pontiagudos, substâncias ilícitas, recipientes de vidro, fogos de artifício ou quaisquer 
                  bebidas trazidas do ambiente externo. O descumprimento ensejará a apreensão do item e a retenção do infrator para as autoridades policiais sem direito a reembolso.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: LOUNGES AUTOMOTIVOS */}
          {activeTab === "lounges" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="p-5 rounded-xl bg-gradient-to-r from-[#0b1930] to-[#101116] border border-[#c9a227]/40">
                <div className="flex items-center gap-2 text-[#f5e6b8] font-bold text-sm mb-2">
                  <Car className="w-5 h-5 text-[#c9a227] flex-shrink-0" />
                  <span>Adesão Automática e Ciência no Ato da Compra ou Reserva</span>
                </div>
                <p className="text-xs text-[#a8b2c3] leading-relaxed">
                  A aquisição, reserva ou pagamento de qualquer espaço de <strong className="text-[#f6f8fc]">Lounge Automotivo (Lounge Rosa ou Lounge Azul)</strong> implica 
                  a leitura, ciência e concordância automática, irretratável e incondicional do titular e de seus convidados com a totalidade das cláusulas deste regulamento, 
                  servindo o comprovante de pagamento como aceite formal deste contrato.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#c9a227]" />
                  Cláusula 1ª — Da Estrutura Privativa e Delimitação por Grades
                </h2>
                <p>
                  O presente regulamento disciplina a cessão temporária de espaço privativo delimitado individualmente por gradil de proteção de alta segurança 
                  na área de Lounges da <strong>Sintonia Edição Especial 10 Anos DJ Lipe</strong>, em Tupaciguara - MG. 
                  Cada espaço é dimensionado para acolher exatamente <strong>01 (um) veículo</strong>, garantindo área exclusiva para que o titular e seu grupo desfrutem do show 
                  com total comodidade e segurança. Ao adquirir o Lounge, o Titular assume responsabilidade solidária pela conduta de todos os seus convidados.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#c9a227]" />
                  Cláusula 2ª — Valores, Lotes e Credenciamento de Pulseiras
                </h2>
                <p>
                  Os valores oficiais de comercialização de cada Lounge, bem como o número oficial de pulseiras de acesso individual vinculadas ao veículo 
                  (para o titular e seus acompanhantes), serão <strong className="text-[#f6f8fc]">definidos e confirmados previamente com a organização oficial</strong>. 
                  A quantidade de vagas por ala é rigorosamente restrita (12 vagas no Lounge Rosa e 12 vagas no Lounge Azul), sendo a vaga confirmada apenas mediante quitação.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-red-950/20 border border-red-500/30">
                <h2 className="text-lg font-bold text-red-300 flex items-center gap-2 mb-2">
                  <Ban className="w-5 h-5 text-red-400 flex-shrink-0" />
                  Cláusula 3ª — Da Proibição Absoluta de Bebidas Externas (Tolerância Zero)
                </h2>
                <p className="text-xs text-red-200/90 leading-relaxed">
                  É expressamente proibida a entrada, transporte, guarda ou consumo de <strong>quaisquer bebidas</strong> (alcoólicas ou não alcoólicas, energéticos, 
                  refrigerantes, sucos, águas, gelos, garrafas, latas, galões, caixas térmicas, coolers ou copos térmicos contendo líquidos) trazidas do ambiente externo. 
                  Todo e qualquer consumo de bebidas na área de Lounges deverá ser adquirido <strong>exclusivamente nos bares e pontos de venda oficiais do evento</strong>.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#c9a227]" />
                  Cláusula 4ª — Da Revista Veicular Completa e Acompanhamento Exclusivo do Titular
                </h2>
                <p>
                  Para salvaguardar a segurança de todo o público e atestar o cumprimento das normas contratuais, todos os veículos posicionados na área de Lounges 
                  passarão por revista minuciosa, completa e rigorosa na portaria de triagem, além de estarem sujeitos a fiscalizações a qualquer momento durante o evento.
                </p>
                <p className="mt-2 text-xs">
                  A equipe de segurança especializada inspecionará todo o veículo: porta-malas, interior da cabine, embaixo e atrás dos assentos, porta-luvas, consoles centrais, 
                  painéis laterais, caixas acústicas e módulos de som automotivo, compartimento de estepe e assoalho.
                </p>
                <div className="mt-3 p-4 rounded-lg bg-[#07090d] border border-[#0b1930] text-xs">
                  <strong className="text-[#f5e6b8] block mb-1">
                    ⚠️ Parágrafo Único — Presença Exclusiva do Proprietário do Carro:
                  </strong>
                  Durante o procedimento de vistoria veicular, <strong>apenas e exclusivamente o proprietário/titular do veículo</strong> está autorizado a permanecer ao lado 
                  da equipe de segurança. Todos os demais acompanhantes ou passageiros deverão obrigatoriamente aguardar fora da área de triagem. A inspeção será paralisada 
                  caso haja insistência de terceiros em permanecer próximos ao veículo.
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#0b1930]/60 border border-[#c9a227]/40">
                <h2 className="text-lg font-bold text-[#f5e6b8] flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-[#c9a227]" />
                  Cláusula 5ª — Das Penalidades por Infração: Retirada Imediata e Ausência Total de Estorno
                </h2>
                <p className="text-xs mb-3">
                  Caso seja localizada qualquer bebida não autorizada oculta ou transportada no veículo (seja na vistoria prévia ou durante a realização do evento), 
                  serão aplicadas sumariamente e sem exceção as seguintes medidas:
                </p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-[#c9a227] font-bold">I.</span>
                    <span><strong className="text-[#f6f8fc]">Retirada Imediata do Evento:</strong> O veículo terá sua permanência vetada e será imediatamente retirado das dependências do evento;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c9a227] font-bold">II.</span>
                    <span><strong className="text-[#f6f8fc]">Devolução da Bebida na Saída:</strong> As bebidas localizadas serão entregues de volta ao proprietário exclusivamente no ato da retirada do veículo para fora do perímetro do evento;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#c9a227] font-bold">III.</span>
                    <span><strong className="text-[#f6f8fc]">Retenção Integral e Ausência de Estorno:</strong> Por configurar quebra direta e dolosa de cláusula contratual essencial, <strong className="text-red-400">NÃO HAVERÁ ESTORNO, reembolso, crédito ou restituição de valores</strong> do Lounge ou de suas pulseiras.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#c9a227]" />
                  Cláusula 6ª — Entrega Antecipada, Horários e Imobilidade do Veículo
                </h2>
                <p>
                  A data e o horário limite para entrega, vistoria e posicionamento dos veículos nos Lounges, bem como o horário oficial de abertura e encerramento do evento, 
                  serão <strong className="text-[#f6f8fc]">definidos e comunicados diretamente pela organização</strong>.
                </p>
                <p className="mt-2 text-xs">
                  Durante todo o período da festa, o veículo deverá permanecer rigorosamente estacionado e imóvel dentro do seu espaço cercado por grades. 
                  São terminantemente proibidas manobras, arrancadas, queima de pneus ou qualquer circulação interna de automóveis até a liberação e coordenação final da equipe de produção.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#c9a227]" />
                  Cláusula 7ª — Do Som Automotivo e Conduta Geral
                </h2>
                <p>
                  O acionamento de sistemas de som automotivo na área de Lounges deverá respeitar com estrita fidelidade os horários, volumes e diretrizes estabelecidos pela direção técnica do evento. 
                  É proibido portar no veículo armas, substâncias ilegais, fogos de artifício ou praticar desordem, sob pena de expulsão imediata dos envolvidos sem direito a estorno.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#c9a227]" />
                  Cláusula 8ª — Responsabilidade Civil, Imagem e Foro
                </h2>
                <p className="text-xs">
                  O titular do Lounge responde civil e financeiramente por eventuais danos materiais provocados por si ou por seus convidados às grades, tendas e patrimônio do evento. 
                  A guarda de objetos de valor no interior do carro é de responsabilidade de seu proprietário. 
                  Os participantes cedem gratuitamente o direito de imagem para filmagens e registros do festival às produtoras GHVE Eventos e RL Produções. 
                  Fica eleito o foro da Comarca de Tupaciguara - MG.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: POLÍTICA DE PRIVACIDADE */}
          {activeTab === "privacidade" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="p-5 rounded-xl bg-[#0b1930]/60 border border-[#0b1930]">
                <div className="flex items-center gap-2 text-[#f6f8fc] font-bold text-sm mb-2">
                  <Lock className="w-5 h-5 text-[#c9a227] flex-shrink-0" />
                  <span>Compromisso de Privacidade e Proteção de Dados (LGPD)</span>
                </div>
                <p className="text-xs text-[#a8b2c3] leading-relaxed">
                  A Sintonia respeita a sua privacidade. Esta política descreve como os seus dados pessoais são coletados, utilizados, protegidos 
                  e armazenados de acordo com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  1. Dados Pessoais Coletados
                </h2>
                <p>
                  Para viabilizar a criação de conta, emissão nominal de vouchers antifraude e processamento de pagamentos, coletamos apenas os seguintes dados estritamente necessários:
                </p>
                <ul className="list-disc list-inside mt-2 text-xs space-y-1 pl-2">
                  <li><strong className="text-[#f6f8fc]">Nome Completo:</strong> Para identificação nominal do ingresso;</li>
                  <li><strong className="text-[#f6f8fc]">CPF:</strong> Para atrelar o ingresso ao comprador e impedir fraudes ou duplicidade;</li>
                  <li><strong className="text-[#f6f8fc]">E-mail:</strong> Para login, envio do voucher digital, confirmação de pedido e recuperação de senha;</li>
                  <li><strong className="text-[#f6f8fc]">Telefone (WhatsApp):</strong> Para suporte de atendimento, confirmação de pedidos e avisos urgentes sobre o evento;</li>
                  <li><strong className="text-[#f6f8fc]">Data de Nascimento:</strong> Para conferência da classificação etária do festival.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  2. Armazenamento Seguro e Criptografia
                </h2>
                <p>
                  Suas credenciais são guardadas em infraestrutura em nuvem de nível corporativo (Google Firebase Cloud Firestore e Firebase Authentication). 
                  Senhas são criptografadas de ponta a ponta com o algoritmo seguro SCrypt, sem acesso em texto legível por funcionários ou desenvolvedores. 
                  Regras de segurança no banco de dados impedem que qualquer usuário acesse informações de outros compradores.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  3. Processamento Seguro de Pagamentos
                </h2>
                <p>
                  As transações financeiras (PIX e Cartão de Crédito) são processadas diretamente pelo gateway oficial do <strong>Mercado Pago</strong> com certificação 
                  PCI-DSS de nível internacional. Em nenhum momento dados completos de cartão de crédito são salvos em nosso banco de dados.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#f6f8fc] flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-[#c9a227]" />
                  4. Não Compartilhamento e Direitos do Titular
                </h2>
                <p>
                  Seus dados nunca são vendidos, alugados ou compartilhados com empresas de marketing externas. 
                  Em conformidade com a LGPD, você possui o direito de solicitar a confirmação do tratamento, retificação de dados incorretos ou 
                  exclusão de sua conta após o término da prestação de serviços do evento, mediante contato com nossos canais oficiais de atendimento.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 shadow-[0_0_20px_rgba(201,162,39,0.3)] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para a Página Principal</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
