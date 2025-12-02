import { UserInput } from '../types';

interface DayStructure {
  dia: string;
  tipo: string;
  grupos: string[];
  prioridade: string;
  sugestao_duracao: number;
}

interface StructureOutput {
  dias: DayStructure[];
  observacoes: string[];
}

export function generateWeeklyStructure(input: UserInput): StructureOutput {
  const { split, dias, duracao_por_sessao, objetivo } = input;
  const structure: DayStructure[] = [];
  const observacoes: string[] = [];

  // Define priority based on objective
  let priority = "volume/hipertrofia";
  if (objetivo === "força") priority = "carga/intensidade";
  if (objetivo === "resistência" || objetivo === "condicionamento") priority = "densidade/metabólico";
  if (objetivo === "perda de gordura") priority = "gasto calórico/circuito";

  // Helper to get day name safely
  const getDay = (index: number) => dias[index % dias.length] || `Dia Extra ${index + 1}`;

  // Logic to generate structure based on Split
  if (split === "Fullbody") {
    // Standard Fullbody logic: Alternate focus slightly to manage fatigue
    dias.forEach((dia, index) => {
      let focus = ["Peito", "Costas", "Pernas", "Ombros", "Braços", "Core"];
      let type = "Fullbody Geral";
      
      if (dias.length === 3) {
        if (index === 0) type = "Fullbody (Foco Empurrar/Anterior)";
        if (index === 1) type = "Fullbody (Foco Puxar/Posterior)";
        if (index === 2) type = "Fullbody (Foco Pernas/Core)";
      }

      structure.push({
        dia: dia,
        tipo: type,
        grupos: focus,
        prioridade: priority,
        sugestao_duracao: duracao_por_sessao
      });
    });

  } else if (split === "Upper/Lower") {
    // Pattern: Upper A, Lower A, Upper B, Lower B
    dias.forEach((dia, index) => {
      const isUpper = index % 2 === 0;
      structure.push({
        dia: dia,
        tipo: isUpper ? `Upper Body ${index < 2 ? 'A' : 'B'}` : `Lower Body ${index < 2 ? 'A' : 'B'}`,
        grupos: isUpper 
          ? ["Peito", "Costas", "Ombros", "Bíceps", "Tríceps"] 
          : ["Quadríceps", "Posterior", "Glúteos", "Panturrilha", "Core"],
        prioridade: priority,
        sugestao_duracao: duracao_por_sessao
      });
    });

  } else if (split === "Push/Pull") {
    // Pattern: Push, Pull, Push, Pull... (Legs integrated usually in Push/Pull or omitted if explicit PPL not chosen)
    // Assuming Push (Squat pattern) / Pull (Hinge pattern) for full body coverage or pure upper
    // Let's assume a Push+Quads / Pull+Hams split for simplicity unless specified otherwise
    dias.forEach((dia, index) => {
      const isPush = index % 2 === 0;
      structure.push({
        dia: dia,
        tipo: isPush ? "Push (Empurrar + Agachamento)" : "Pull (Puxar + Hinge)",
        grupos: isPush
          ? ["Peito", "Ombros", "Tríceps", "Quadríceps", "Panturrilha"]
          : ["Costas", "Bíceps", "Posterior de Coxa", "Glúteos", "Core"],
        prioridade: priority,
        sugestao_duracao: duracao_por_sessao
      });
    });

  } else if (split === "PPL") {
    // Pattern: Push, Pull, Legs, Repeat
    const cycle = ["Push", "Pull", "Legs"];
    dias.forEach((dia, index) => {
      const type = cycle[index % 3];
      let grupos: string[] = [];
      
      if (type === "Push") grupos = ["Peito", "Ombros", "Tríceps"];
      if (type === "Pull") grupos = ["Costas", "Bíceps", "Trapézio", "Posterior de Ombro"];
      if (type === "Legs") grupos = ["Quadríceps", "Posterior", "Glúteos", "Panturrilha"];

      structure.push({
        dia: dia,
        tipo: type,
        grupos: grupos,
        prioridade: priority,
        sugestao_duracao: duracao_por_sessao
      });
    });
  }

  // Fallback if structure empty
  if (structure.length === 0) {
    observacoes.push("Não foi possível gerar a estrutura automaticamente com os parâmetros fornecidos. Gerado Fullbody padrão.");
     dias.forEach((dia) => {
      structure.push({
        dia: dia,
        tipo: "Fullbody",
        grupos: ["Corpo Todo"],
        prioridade: priority,
        sugestao_duracao: duracao_por_sessao
      });
    });
  }

  return {
    dias: structure,
    observacoes: observacoes
  };
}