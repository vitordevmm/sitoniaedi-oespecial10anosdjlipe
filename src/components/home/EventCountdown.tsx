"use client";

import { useEffect, useState, useMemo } from "react";

// Data Oficial do Evento: 10 de Abril de 2027 às 22:30 (Horário de Brasília UTC-3)
const TARGET_DATE_STRING = "2027-04-10T22:30:00-03:00";

interface TimeLeft {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
}

function calculateTimeLeft(target: Date, now: Date): TimeLeft {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return {
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isFinished: true,
    };
  }

  // Cálculo preciso de meses inteiros de calendário
  let months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  const tempDate = new Date(now);
  tempDate.setMonth(tempDate.getMonth() + months);

  // Se passou da data exata ao adicionar os meses, recua 1 mês
  if (tempDate > target) {
    months--;
    tempDate.setTime(now.getTime());
    tempDate.setMonth(tempDate.getMonth() + months);
  }

  const remainingMs = target.getTime() - tempDate.getTime();
  const totalSeconds = Math.floor(remainingMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    isFinished: false,
  };
}

export function EventCountdown() {
  const [mounted, setMounted] = useState(false);
  const targetDate = useMemo(() => new Date(TARGET_DATE_STRING), []);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: false,
  });

  useEffect(() => {
    setMounted(true);
    // Atualização imediata
    setTimeLeft(calculateTimeLeft(targetDate, new Date()));

    // Timer preciso a cada 1 segundo (isolado neste componente para não re-renderizar o Hero)
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate, new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // SSR skeleton gracioso no padrão Dark & Gold
  if (!mounted) {
    return (
      <div className="w-full max-w-xl mx-auto my-6 sm:my-8 px-2 sm:px-4 text-center animate-pulse">
        <div className="h-4 w-52 bg-[#c9a227]/20 rounded mx-auto mb-4" />
        <div className="flex justify-center gap-1.5 sm:gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-12 sm:w-16 h-14 sm:h-20 bg-[#101116] rounded-xl sm:rounded-2xl border border-[#0b1930]" />
          ))}
        </div>
      </div>
    );
  }

  if (timeLeft.isFinished) {
    return (
      <div className="w-full max-w-2xl mx-auto my-8 p-6 rounded-3xl bg-gradient-to-r from-[#101116] via-[#0b1930] to-[#101116] border border-[#c9a227] text-center shadow-[0_0_35px_rgba(201,162,39,0.35)] animate-in fade-in duration-500">
        <span className="text-xs uppercase font-extrabold tracking-widest text-[#f5e6b8] block mb-1">
          A Grande Noite Começou
        </span>
        <h3 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] bg-clip-text text-transparent">
          SINTONIA ESPECIAL 10 ANOS NO AR!
        </h3>
      </div>
    );
  }

  // Regra de Exibição Dinâmica (Smart Unit Hiding):
  // 1. Se months > 0: exibe Meses, Dias, Horas, Minutos, Segundos
  // 2. Se months === 0: mês some, exibe Dias, Horas, Minutos, Segundos
  // 3. Se months === 0 && days === 0: dia some, exibe Horas, Minutos, Segundos
  // 4. Se months === 0 && days === 0 && hours === 0: hora some, exibe Minutos, Segundos
  const showMonths = timeLeft.months > 0;
  const showDays = showMonths || timeLeft.days > 0;
  const showHours = showDays || timeLeft.hours > 0;
  const showMinutes = showHours || timeLeft.minutes > 0;

  const units = [
    ...(showMonths ? [{ value: timeLeft.months, label: timeLeft.months === 1 ? "Mês" : "Meses", id: "m" }] : []),
    ...(showDays ? [{ value: timeLeft.days, label: timeLeft.days === 1 ? "Dia" : "Dias", id: "d" }] : []),
    ...(showHours ? [{ value: timeLeft.hours, label: "Horas", id: "h" }] : []),
    ...(showMinutes ? [{ value: timeLeft.minutes, label: "Minutos", id: "min" }] : []),
    { value: timeLeft.seconds, label: "Segundos", id: "s" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto my-6 sm:my-8 px-2 sm:px-4">
      {/* Texto Superior: "FALTAM" */}
      <div className="text-center mb-2.5 sm:mb-3">
        <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#f5e6b8] drop-shadow-[0_2px_10px_rgba(201,162,39,0.3)] select-none">
          FALTAM
        </p>
      </div>

      {/* Grade Flexível de Unidades de Tempo com Animação Suave */}
      <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3.5 md:gap-4">
        {units.map((unit, index) => {
          const formatted = String(unit.value).padStart(2, "0");
          const isLast = index === units.length - 1;

          return (
            <div key={unit.id} className="flex items-center">
              {/* Card de Cada Dígito */}
              <div className="flex flex-col items-center">
                <div className="relative min-w-[50px] xs:min-w-[58px] sm:min-w-[76px] md:min-w-[88px] h-[54px] xs:h-[62px] sm:h-[76px] md:h-[86px] rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#101116] via-[#0d1424] to-[#07090d] border border-[#c9a227]/30 shadow-[0_8px_25px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(245,230,184,0.15)] flex items-center justify-center p-1 sm:p-2 overflow-hidden">
                  {/* Linha interna superior sutil */}
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#f5e6b8]/40 to-transparent" />

                  {/* Número com Degradê Dourado e Animação Suave */}
                  <span
                    key={`${unit.id}-${formatted}`}
                    className="font-mono text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-b from-[#ffffff] via-[#f5e6b8] to-[#c9a227] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(201,162,39,0.35)] animate-in fade-in zoom-in-95 duration-300 select-none tabular-nums"
                  >
                    {formatted}
                  </span>
                </div>

                {/* Rótulo da Unidade */}
                <span className="mt-1.5 sm:mt-2 text-[8px] xs:text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#a8b2c3] text-center select-none">
                  {unit.label}
                </span>
              </div>

              {/* Divisor com Dois Pontos Pulsantes */}
              {!isLast && (
                <span className="text-[#c9a227]/70 text-base xs:text-lg sm:text-2xl font-black mx-0.5 xs:mx-1 sm:mx-1.5 self-center pb-4 sm:pb-5 select-none animate-pulse">
                  :
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Texto Inferior: "para a melhor noite do ano" */}
      <div className="text-center mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm md:text-base font-medium text-[#a8b2c3] tracking-wide">
          para a <strong className="text-[#f6f8fc] font-semibold">melhor noite do ano</strong>
        </p>
      </div>
    </div>
  );
}
