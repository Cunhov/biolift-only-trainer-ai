import fs from 'fs';
import path from 'path';

export interface Exercise {
    nome: string;
    grupos_musculares: string[];
    equipamentos: string[];
    improvise: string[];
    youtube_url: string;
}

class ExerciseDatabaseService {
    private database: Exercise[] | null = null;
    private dbPath: string;

    constructor() {
        this.dbPath = path.join(__dirname, '../../data/exercises.json');
    }

    loadDatabase(): Exercise[] {
        if (this.database) {
            return this.database;
        }

        try {
            const data = fs.readFileSync(this.dbPath, 'utf-8');
            this.database = JSON.parse(data);
            return this.database!;
        } catch (error) {
            console.error('Error loading exercise database:', error);
            return [];
        }
    }

    reloadDatabase(): void {
        this.database = null;
        this.loadDatabase();
    }

    getAllExercises(): Exercise[] {
        return this.loadDatabase();
    }

    filterByEquipment(availableEquipment: string[]): Exercise[] {
        const exercises = this.getAllExercises();

        // Normalize equipment names for comparison
        const normalizedAvailable = availableEquipment.map(eq => eq.toLowerCase().trim());

        return exercises.filter(exercise => {
            // Check if any of the exercise's equipment matches available equipment
            return exercise.equipamentos.some(requiredEq =>
                normalizedAvailable.some(availEq => {
                    const reqLower = requiredEq.toLowerCase();
                    return availEq.includes(reqLower) || reqLower.includes(availEq) || reqLower.includes('peso corporal');
                })
            );
        });
    }

    getExercisesForPrompt(availableEquipment: string[], includeImprovise: boolean = true): string {
        let exercises = this.filterByEquipment(availableEquipment);

        // If no equipment or very limited, include all bodyweight exercises
        if (availableEquipment.length === 0 || availableEquipment.some(eq => eq.toLowerCase().includes('peso corporal'))) {
            const bodyweightExercises = this.getAllExercises().filter(ex =>
                ex.equipamentos.some(eq => eq.toLowerCase().includes('peso corporal'))
            );
            exercises = [...new Set([...exercises, ...bodyweightExercises])];
        }

        // Group by muscle groups for better organization
        const byMuscle: { [key: string]: Exercise[] } = {};
        exercises.forEach(ex => {
            const primaryMuscle = ex.grupos_musculares[0] || 'Outros';
            if (!byMuscle[primaryMuscle]) {
                byMuscle[primaryMuscle] = [];
            }
            byMuscle[primaryMuscle].push(ex);
        });

        // Format for AI prompt
        let prompt = "EXERCÍCIOS DISPONÍVEIS (use APENAS estes exercícios):\n\n";

        Object.keys(byMuscle).forEach(muscle => {
            prompt += `${muscle}:\n`;
            byMuscle[muscle].forEach(ex => {
                prompt += `- ${ex.nome}\n`;
                prompt += `  Músculos: ${ex.grupos_musculares.join(', ')}\n`;
                prompt += `  Equipamentos: ${ex.equipamentos.join(', ')}\n`;

                if (includeImprovise && ex.improvise.length > 0) {
                    prompt += `  Improvise: ${ex.improvise.join(' | ')}\n`;
                }

                if (ex.youtube_url) {
                    prompt += `  Vídeo: ${ex.youtube_url}\n`;
                }
                prompt += '\n';
            });
        });

        if (includeImprovise) {
            prompt += "\nIMPORTANTE: Quando o aluno não tiver o equipamento ideal, sugira as opções de 'Improvise' para cada exercício.\n";
            prompt += "Inclua essas alternativas improvisadas nas observações do treino para ajudar o aluno a treinar em casa ou sem equipamento.\n";
        }

        return prompt;
    }
}

export const exerciseDB = new ExerciseDatabaseService();
