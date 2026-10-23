"use client";

import React, { useState } from "react";
import {
  FileText,
  Printer,
  Download,
  AlertTriangle,
  User,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from "lucide-react";

interface MinorAuthorizationContractProps {
  minorName: string;
  minorCpf: string;
  minorBirthDate: string;
  minorAge: number;
  minAgeRequired: number;
}

export function MinorAuthorizationContract({
  minorName,
  minorCpf,
  minorBirthDate,
  minorAge,
  minAgeRequired,
}: MinorAuthorizationContractProps) {
  // Estados para preenchimento dos dados do responsável e acompanhante antes da impressão
  const [guardianName, setGuardianName] = useState("");
  const [guardianRg, setGuardianRg] = useState("");
  const [guardianCpf, setGuardianCpf] = useState("");
  const [guardianKinship, setGuardianKinship] = useState("Pai/Mãe");
  const [guardianPhone, setGuardianPhone] = useState("");

  const [companionName, setCompanionName] = useState("");
  const [companionRg, setCompanionRg] = useState("");
  const [companionCpf, setCompanionCpf] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateRaw: string) => {
    if (!dateRaw) return "___/___/______";
    try {
      const [y, m, d] = dateRaw.split("T")[0].split("-");
      if (y && m && d) return `${d}/${m}/${y}`;
      return dateRaw;
    } catch {
      return dateRaw;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta de Obrigatoriedade Legal */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 shadow-[0_4px_20px_rgba(251,191,36,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#f5e6b8] tracking-tight">
              Termo Obrigatório de Entrada para Menores de {minAgeRequired} Anos
            </h4>
            <p className="text-xs text-[#a8b2c3] mt-0.5 leading-relaxed">
              Como você possui <strong>{minorAge} anos</strong>, a entrada no festival é permitida exclusivamente na companhia de um adulto civilmente capaz e com este termo assinado pelo seu responsável legal, acompanhado de cópia de documento com foto.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:brightness-110 shadow-[0_0_15px_rgba(201,162,39,0.3)] transition-all active:scale-95 whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Salvar PDF</span>
        </button>
      </div>

      {/* Formulário Opcional de Pré-Preenchimento */}
      <div className="p-5 rounded-2xl bg-[#101116] border border-[#0b1930] shadow-xl space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-[#0b1930] pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#f5e6b8] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#c9a227]" />
            <span>Preencher Dados para Sair Digitado na Folha (Opcional):</span>
          </h4>
          <span className="text-[10px] text-[#a8b2c3]/60 italic">
            Ou se preferir, imprima e preencha à mão
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Dados do Responsável */}
          <div className="space-y-3 p-3.5 rounded-xl bg-[#07090d] border border-[#0b1930]">
            <p className="font-bold text-[#c9a227] uppercase tracking-wider text-[10px]">
              1. Dados do Responsável Legal (Pai, Mãe ou Tutor):
            </p>
            <input
              type="text"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              placeholder="Nome Completo do Responsável"
              className="w-full px-3 py-2 rounded-lg bg-[#101116] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={guardianRg}
                onChange={(e) => setGuardianRg(e.target.value)}
                placeholder="RG do Responsável"
                className="w-full px-3 py-2 rounded-lg bg-[#101116] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
              />
              <input
                type="text"
                value={guardianCpf}
                onChange={(e) => setGuardianCpf(e.target.value)}
                placeholder="CPF do Responsável"
                className="w-full px-3 py-2 rounded-lg bg-[#101116] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={guardianKinship}
                onChange={(e) => setGuardianKinship(e.target.value)}
                placeholder="Parentesco (Pai/Mãe)"
                className="w-full px-3 py-2 rounded-lg bg-[#101116] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
              />
              <input
                type="text"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="Telefone com DDD"
                className="w-full px-3 py-2 rounded-lg bg-[#101116] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
              />
            </div>
          </div>

          {/* Dados do Acompanhante */}
          <div className="space-y-3 p-3.5 rounded-xl bg-[#07090d] border border-[#0b1930]">
            <p className="font-bold text-[#c9a227] uppercase tracking-wider text-[10px]">
              2. Dados do Acompanhante Maior de Idade (18+):
            </p>
            <input
              type="text"
              value={companionName}
              onChange={(e) => setCompanionName(e.target.value)}
              placeholder="Nome Completo do Acompanhante Maior"
              className="w-full px-3 py-2 rounded-lg bg-[#101116] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={companionRg}
                onChange={(e) => setCompanionRg(e.target.value)}
                placeholder="RG do Acompanhante"
                className="w-full px-3 py-2 rounded-lg bg-[#101116] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
              />
              <input
                type="text"
                value={companionCpf}
                onChange={(e) => setCompanionCpf(e.target.value)}
                placeholder="CPF do Acompanhante"
                className="w-full px-3 py-2 rounded-lg bg-[#101116] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
              />
            </div>
            <p className="text-[10px] text-[#a8b2c3]/60 italic pt-1">
              * O acompanhante deve permanecer no evento junto com o menor durante toda a permanência.
            </p>
          </div>
        </div>
      </div>

      {/* DOCUMENTO CONTRATUAL OFICIAL (OTIMIZADO PARA IMPRESSÃO EM FOLHA A4) */}
      <div
        id="minor-contract-document"
        className="p-8 sm:p-12 rounded-2xl bg-white text-black font-serif shadow-2xl space-y-6 print:p-0 print:shadow-none print:m-0 print:border-none"
      >
        {/* Cabeçalho Oficial do Evento */}
        <div className="text-center border-b-2 border-black pb-4 space-y-1">
          <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">
            TERMO DE AUTORIZAÇÃO DE ENTRADA E PERMANÊNCIA DE MENOR DE IDADE
          </h2>
          <p className="text-xs sm:text-sm font-bold uppercase text-neutral-800">
            SINTONIA EDIÇÃO ESPECIAL 10 ANOS DJ LIPE
          </p>
          <p className="text-[11px] text-neutral-600">
            Data Oficial: 10 de Abril de 2027 • Local: Capitu, Tupaciguara - MG
          </p>
          <p className="text-[10px] italic text-neutral-500">
            (Em conformidade com a Lei nº 8.069/90 — Estatuto da Criança e do Adolescente e Portaria da Vara da Infância e Juventude)
          </p>
        </div>

        {/* Corpo do Contrato */}
        <div className="text-xs sm:text-sm leading-relaxed text-justify space-y-4">
          <p>
            Eu, <strong>{guardianName || "__________________________________________________"}</strong>, portador(a) da Cédula de Identidade RG nº <strong>{guardianRg || "_______________"}</strong> e inscrito(a) no CPF/MF sob o nº <strong>{guardianCpf || "_______________"}</strong>, telefone de contato <strong>{guardianPhone || "(____) ____________"}</strong>, na condição de <strong>{guardianKinship || "Pai / Mãe / Responsável Legal"}</strong> do(a) adolescente:
          </p>

          {/* Dados do Menor */}
          <div className="p-3 bg-neutral-100 rounded border border-neutral-300 space-y-1 text-xs">
            <p>
              <strong>Nome do(a) Menor:</strong> {minorName || "Não informado"}
            </p>
            <p>
              <strong>Data de Nascimento:</strong> {formatDate(minorBirthDate)} &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Idade na Data do Festival:</strong> {minorAge} anos
            </p>
            <p>
              <strong>CPF do(a) Menor:</strong> {minorCpf || "Não informado"}
            </p>
          </div>

          <p>
            Por meio deste instrumento particular, <strong>AUTORIZO</strong> o(a) referido(a) menor a ingressar e permanecer no festival <strong>SINTONIA EDIÇÃO ESPECIAL 10 ANOS DJ LIPE</strong>, a realizar-se no dia 10 de Abril de 2027 no Capitu, em Tupaciguara - MG, sob a guarda e acompanhamento integral e contínuo do(a) adulto(a) civilmente capaz:
          </p>

          <p>
            Nome do(a) Acompanhante Maior: <strong>{companionName || "__________________________________________________"}</strong>, portador(a) do RG nº <strong>{companionRg || "_______________"}</strong> e CPF nº <strong>{companionCpf || "_______________"}</strong>.
          </p>

          <p>
            Declaro estar plenamente ciente das regras do festival, da tolerância zero para o consumo e comercialização de bebidas alcoólicas a menores de 18 anos nos termos do art. 243 da Lei nº 8.069/90, isentando os organizadores e as produtoras GHVE Eventos e RL Produções de responsabilidade civil decorrente de atos praticados pelo(a) menor em desacordo com as instruções de segurança e o regulamento do festival.
          </p>
        </div>

        {/* Local e Data */}
        <div className="pt-4 text-xs text-right">
          <p>
            Tupaciguara - MG, ______ de ___________________ de 2027.
          </p>
        </div>

        {/* Linhas de Assinaturas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 text-center text-xs">
          <div className="space-y-1">
            <div className="border-t border-black w-3/4 mx-auto pt-1" />
            <p className="font-bold">{guardianName || "Assinatura do Pai / Mãe / Responsável Legal"}</p>
            <p className="text-[10px] text-neutral-600">(Anexar cópia de documento oficial com foto do responsável)</p>
          </div>

          <div className="space-y-1">
            <div className="border-t border-black w-3/4 mx-auto pt-1" />
            <p className="font-bold">{companionName || "Assinatura do Acompanhante Maior de Idade"}</p>
            <p className="text-[10px] text-neutral-600">(Apresentar documento original com foto na portaria)</p>
          </div>
        </div>

        {/* Rodapé de Instrução de Portaria */}
        <div className="border-t border-neutral-300 pt-3 text-[10px] text-neutral-500 text-center space-y-0.5">
          <p className="font-bold uppercase text-neutral-700">
            INSTRUÇÃO OBRIGATÓRIA PARA A ENTRADA NA CATRACA DO CAPITU:
          </p>
          <p>
            1. Entregar este documento impresso e assinado na triagem da portaria.
          </p>
          <p>
            2. Apresentar documento de identidade oficial com foto original do menor e do acompanhante.
          </p>
        </div>
      </div>

      {/* Estilos dedicados para impressão limpa da folha */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #minor-contract-document,
          #minor-contract-document * {
            visibility: visible !important;
          }
          #minor-contract-document {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
