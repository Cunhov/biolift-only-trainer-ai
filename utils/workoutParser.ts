export interface ParsedExercise {
    name: string;
    muscles: string;
    sets: number;
    reps: string;
    rest: number;
    tempo?: string;
    notes?: string;
    improvise?: string[];
    videoUrl?: string;
}

export interface WorkoutDay {
    title: string;
    exercises: ParsedExercise[];
}

export const parseWorkoutMarkdown = (markdown: string): WorkoutDay[] => {
    const days: WorkoutDay[] = [];
    const lines = markdown.split('\n');

    let currentDay: WorkoutDay | null = null;
    let currentExercise: Partial<ParsedExercise> | null = null;
    let capturingNotes = false;
    let capturingImprovise = false;

    const saveCurrentExercise = () => {
        if (currentExercise && currentExercise.name && currentDay) {
            currentDay.exercises.push(currentExercise as ParsedExercise);
            currentExercise = null;
        }
    };

    const saveCurrentDay = () => {
        saveCurrentExercise();
        if (currentDay) {
            days.push(currentDay);
            currentDay = null;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect Start of Day
        if (line.includes('## 🗓️ DIA:') || line.includes('## Dia')) {
            saveCurrentDay();
            const titleMatch = line.replace(/## 🗓️ DIA:|## Dia/, '').trim();
            currentDay = {
                title: titleMatch || 'Dia de Treino',
                exercises: []
            };
            continue;
        }

        // Detect Start of Exercise
        if (line.includes('### 💪 EXERCÍCIO') || line.match(/^### \d+\./)) {
            saveCurrentExercise();

            // Ensure we have a day context (create default if missing)
            if (!currentDay) {
                currentDay = { title: 'Treino', exercises: [] };
            }

            const nameMatch = line.match(/EXERCÍCIO \d+: (.+)/) || line.match(/\d+\. (.+)/);
            currentExercise = {
                name: nameMatch ? nameMatch[1].trim() : 'Exercício',
                notes: '',
                improvise: []
            };
            capturingNotes = false;
            capturingImprovise = false;
            continue;
        }

        if (!currentExercise) continue;

        // Parse Fields
        if (line.includes('🎯 Músculos Trabalhados:') || line.includes('**Músculo:**')) {
            currentExercise.muscles = line.replace(/\*\*.*:\*\*/, '').trim();
        } else if (line.includes('📊 Séries:') || line.includes('**Séries x Reps:**')) {
            // Format 1: **📊 Séries:** X | **Repetições:** Y | **Descanso:** Zs
            // Format 2: **Séries x Reps:** 3 x 12

            if (line.includes('|')) {
                const setsMatch = line.match(/Séries:\*\* (\d+)/);
                const repsMatch = line.match(/Repetições:\*\* ([^|]+)/);
                const restMatch = line.match(/Descanso:\*\* (\d+)s?/);

                if (setsMatch) currentExercise.sets = parseInt(setsMatch[1]);
                if (repsMatch) currentExercise.reps = repsMatch[1].trim();
                if (restMatch) currentExercise.rest = parseInt(restMatch[1]);
            } else {
                const parts = line.split(':');
                if (parts[1]) {
                    const val = parts[1].trim();
                    // Try to parse "3 x 12"
                    const xSplit = val.toLowerCase().split('x');
                    if (xSplit.length >= 2) {
                        currentExercise.sets = parseInt(xSplit[0]);
                        currentExercise.reps = xSplit[1].trim();
                    }
                }
            }
        } else if (line.includes('⏱️ Descanso:') || line.includes('**Descanso:**')) {
            const restMatch = line.match(/(\d+)s?/);
            if (restMatch) currentExercise.rest = parseInt(restMatch[1]);
        } else if (line.includes('⏱️ Tempo de Execução:')) {
            currentExercise.tempo = line.replace(/\*\*.*:\*\*/, '').trim();
        } else if (line.includes('📝 Técnica & Observações:') || line.includes('**Obs:**')) {
            capturingNotes = true;
            capturingImprovise = false;
            if (line.includes('**Obs:**')) {
                currentExercise.notes = line.replace('**Obs:**', '').trim();
            }
        } else if (line.includes('🏠 Improvise (sem equipamento):')) {
            capturingNotes = false;
            capturingImprovise = true;
        } else if (line.includes('🎥 Vídeo:') || line.includes('**Vídeo:**')) {
            currentExercise.videoUrl = line.replace(/\*\*.*:\*\*/, '').trim();
            capturingNotes = false;
            capturingImprovise = false;
        } else if (line.startsWith('---') || line.startsWith('## ')) {
            saveCurrentExercise();
            capturingNotes = false;
            capturingImprovise = false;
        } else if (line.startsWith('*') || line.startsWith('•') || line.startsWith('-')) {
            // List items
            const content = line.replace(/^[*•-]\s*/, '').trim();
            if (capturingNotes) {
                currentExercise.notes = (currentExercise.notes ? currentExercise.notes + '\n' : '') + content;
            } else if (capturingImprovise) {
                currentExercise.improvise?.push(content);
            }
        }
    }

    saveCurrentDay();

    return days;
};
