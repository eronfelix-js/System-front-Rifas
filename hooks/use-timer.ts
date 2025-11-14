import { useState,useEffect } from "react";

export function useTimer(minutosParaExpirar?: number){
    const [segundos, setSegundos] = useState(
        minutosParaExpirar ? minutosParaExpirar * 60 : 0
    )

      useEffect(() => {
    if (segundos <= 0) return;

    const interval = setInterval(() => {
      setSegundos(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [segundos]);

  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;

  return {
    tempoRestante: `${minutos}:${segs.toString().padStart(2, '0')}`,
    expirado: segundos === 0,
    segundos,
    minutos
  };
}