
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Initialize Firebase Admin
const serviceAccountPath = path.resolve('../biolift-trainer-ai-12345-firebase-adminsdk-fbsvc-794d9fea3e.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const EXERCISES_CSV = `Nome,Video URL,Musculo Principal,Musculos Secundarios,Padrao de Movimento,Equipamentos,Nivel Minimo,Tipo,Dicas de Execucao
Como fazer FLEXÃO,https://www.youtube.com/watch?v=ENdtHMIWcoo,Peito,"Triceps, Ombros",Empurrar Horizontal,Nenhum,Iniciante,Composto,"Corpo reto, Cotovelos 45 graus, Amplitude total"
Como fazer BARRA FIXA,https://www.youtube.com/watch?v=N6RzI2Smo8k,Costas,"Biceps, Antebraço",Puxar Vertical,Barra Fixa,Intermediário,Composto,"Queixo acima da barra, Controle na descida, Ativar dorsais"
Como fazer ENCOLHIMENTO,https://www.youtube.com/watch?v=-D_3TEHhSJQ,Trapézio,Ombros,Puxar Vertical,Halteres,Iniciante,Isolado,"Elevar ombros para orelhas, Sem girar, Pausa no topo"
Como fazer DIPS,https://www.youtube.com/watch?v=ZMiUBEx1Koo,Triceps,"Peito, Ombros",Empurrar Vertical,Paralelas,Intermediário,Composto,"Tronco levemente à frente, Descer até 90 graus, Cotovelos fechados"
Como fazer FLEXÃO NÓRDICA,https://www.youtube.com/watch?v=cCQHVlum0ys,Posterior,Glúteos,Isolamento,Nenhum,Avançado,Isolado,"Controlar a descida ao máximo, Quadril estável"
Como fazer ELEVAÇÃO DE QUADRIL,https://www.youtube.com/watch?v=pXRSV41ohWA,Glúteos,Posterior,Isolamento,Nenhum,Iniciante,Isolado,"Apertar glúteos no topo, Pés firmes, Lombar neutra"
Como fazer FLEXÃO PLANTAR,https://www.youtube.com/watch?v=h530xEH1Uj8,Panturrilha,,Isolamento,Nenhum,Iniciante,Isolado,"Amplitude máxima, Pausa no topo e base"
Como fazer HIPEREXTENSÃO,https://www.youtube.com/watch?v=rX-9ESFdON4,Lombar,"Glúteos, Posterior",Isolamento,Banco Romano,Iniciante,Isolado,"Não hiperextender demais, Movimento controlado"
Como fazer AFUNDO BÚLGARO,https://www.youtube.com/watch?v=MivNNy0hdNk,Quadríceps,Glúteos,Agachamento,Halteres / Banco,Intermediário,Composto,"Peito aberto, Joelho não passa muito o pé, Equilíbrio"
Como fazer STEP UP,https://www.youtube.com/watch?v=-TzGk9jvaw0,Quadríceps,Glúteos,Agachamento,Caixa / Banco,Iniciante,Composto,"Força na perna de cima, Não dar impulso com a de baixo"
Como fazer LEVANTAMENTO TERRA,https://www.youtube.com/watch?v=5tkOd-rgYr8,Costas,"Posterior, Glúteos, Lombar",Levantamento,Barra Olímpica,Intermediário,Composto,"Barra colada na canela, Peito aberto, Lombar neutra"
Como fazer REMADA,https://www.youtube.com/watch?v=2mW0COBJwuY,Costas,"Biceps, Trapézio",Puxar Horizontal,Máquina,Iniciante,Composto,"Puxar cotovelos para trás, Contrair costas"
Como fazer AGACHAMENTO LIVRE,https://www.youtube.com/watch?v=trSbYfnvZgM,Quadríceps,"Glúteos, Adutores",Agachamento,Barra / Halter,Iniciante,Composto,"Peso no calcanhar, Joelhos para fora, Descer fundo"
Como fazer DESENVOLVIMENTO MILITAR,https://www.youtube.com/watch?v=Oz5N8Ll2WB4,Ombros,"Triceps, Abdomen",Empurrar Vertical,Barra Olímpica,Intermediário,Composto,"Corpo rígido, Barra rente ao rosto, Travar no topo"
Como fazer cadeira flexora pendurado,https://www.youtube.com/watch?v=j2StLepoqjc,Posterior,Panturrilha,Isolamento,Máquina Flexora,Iniciante,Isolado,"Ajustar bem o banco, Movimento completo"
Como fazer agachamento,https://www.youtube.com/watch?v=x5mieqUSUvw,Quadríceps,Glúteos,Agachamento,Nenhum,Iniciante,Composto,"Coluna neutra, Abdômen ativo, Pés largura ombros"
Como fazer DIPS,https://www.youtube.com/watch?v=ziHDQEF5zAk,Triceps,Ombros,Empurrar Vertical,Paralelas,Intermediário,Composto,"Foco no triceps, Cotovelos para trás"
Como fazer afundo búlgaro,https://www.youtube.com/watch?v=QCn9Jja-eiY,Quadríceps,Glúteos,Agachamento,Halteres,Intermediário,Composto,"Controle excêntrico, Foco na perna frontal"
Como fazer cadeira abdutora,https://www.youtube.com/watch?v=R3XKX0TM2og,Glúteos,Quadríceps,Isolamento,Máquina Abdutora,Iniciante,Isolado,"Segurar 1s na abertura, Não bater pesos"
Como fazer flexão militar,https://www.youtube.com/watch?v=Uuevqg0q3qE,Peito,Triceps,Empurrar Horizontal,Nenhum,Intermediário,Composto,"Cotovelos raspando costelas, Foco no triceps"
Como fazer barra supinada aberta,https://www.youtube.com/watch?v=Zgeoqwj_Pvc,Costas,Biceps,Puxar Vertical,Barra Fixa,Avançado,Composto,"Pegada larga palmas para você, Ativação dorsal"
Como fazer barra pronada fechada,https://www.youtube.com/watch?v=_CDQPKpykyQ,Costas,"Biceps, Antebraço",Puxar Vertical,Barra Fixa,Intermediário,Composto,"Mãos próximas, Cotovelos para frente"
Como fazer flexão aberta,https://www.youtube.com/watch?v=iR7iUCaGLDc,Peito,Ombros,Empurrar Horizontal,Nenhum,Iniciante,Composto,"Mãos largas, Foco no peitoral"
Como fazer barra pronada aberta,https://www.youtube.com/watch?v=iSm-5gmD1J0,Costas,Ombros,Puxar Vertical,Barra Fixa,Avançado,Composto,"Pegada bem larga, Foco no V das costas"
Como fazer barra supinada fechada,https://www.youtube.com/watch?v=Nc_reEWAJdU,Biceps,Costas,Puxar Vertical,Barra Fixa,Intermediário,Composto,"Foco total no biceps, Queixo acima da barra"
Como fazer flexão diamante,https://www.youtube.com/watch?v=Ov9HwlVDk_I,Triceps,Peito,Empurrar Horizontal,Nenhum,Intermediário,Composto,"Mãos em formato de diamante, Foco triceps"
Como fazer hiperextensão no chão,https://www.youtube.com/watch?v=okkZNCzHD4U,Lombar,Glúteos,Isolamento,Nenhum,Iniciante,Isolado,"Elevar peito e pernas, Segurar no topo"
Como fazer pistol squat,https://www.youtube.com/watch?v=uaCFPHi3Z0E,Quadríceps,Abdomen,Agachamento,Nenhum,Avançado,Composto,"Equilíbrio em uma perna, Calcanhar no chão"
Como fazer flexão pike,https://www.youtube.com/watch?v=yaNuYnPVPTs,Ombros,Triceps,Empurrar Vertical,Nenhum,Intermediário,Composto,"Quadril alto, Cabeça vai à frente das mãos"
Como fazer hiperextensão,https://www.youtube.com/watch?v=ob6u_SHpVc4,Lombar,Glúteos,Isolamento,Banco Romano,Iniciante,Isolado,"Movimento pelo quadril, Não pela coluna"
Como fazer flexora com slider,https://www.youtube.com/watch?v=zeFohbq1sik,Posterior,"Glúteos, Abdomen",Isolamento,Sliders,Intermediário,Isolado,"Quadril alto o tempo todo, Puxar com calcanhar"
Como fazer elevação lateral,https://www.youtube.com/watch?v=ZYcK9KU-Eck,Ombros,,Isolamento,Halteres,Iniciante,Isolado,"Braços levemente à frente, Não subir acima do ombro"
Como fazer remada pronada aberta,https://www.youtube.com/watch?v=_GF48UMt1TY,Costas,"Ombros, Trapézio",Puxar Horizontal,Barra Olímpica,Intermediário,Composto,"Pegada larga, Cotovelos a 90 graus"
Como fazer elevação de quadril,https://www.youtube.com/watch?v=dPbu0Hi0aHo,Glúteos,Posterior,Isolamento,Nenhum,Iniciante,Isolado,"Pés largura do quadril, Contrair forte topo"
Como fazer remada supinada aberta,https://www.youtube.com/watch?v=-3nakVjVrCo,Costas,Biceps,Puxar Horizontal,Barra Olímpica,Intermediário,Composto,"Palmas para frente, Foco dorsal baixa"
Como fazer flexão nórdica,https://www.youtube.com/watch?v=0IGF3ChRhlM,Posterior,Glúteos,Isolamento,Nenhum,Avançado,Isolado,"Pés presos, Excêntrica lenta"
Como fazer mergulho no banco,https://www.youtube.com/watch?v=G5fwyLwdRAs,Triceps,Ombros,Empurrar Vertical,Banco,Iniciante,Composto,"Costas rente ao banco, Cotovelos fechados"
Como fazer dorso flexão,https://www.youtube.com/watch?v=M8wd1-19_k8,Panturrilha,,Isolamento,Parede,Iniciante,Isolado,"Ponta do pé para cima, Fortalece canela"
Como fazer step up,https://www.youtube.com/watch?v=MnPoGM6C-Yo,Quadríceps,Glúteos,Agachamento,Caixa,Iniciante,Composto,"Alinhamento do joelho, Sem impulso"
Como fazer flexão plantar,https://www.youtube.com/watch?v=9LzFuHTdRCc,Panturrilha,,Isolamento,Degrau,Iniciante,Isolado,"Alongar bem a panturrilha na base"
Como fazer remada pronada fechada,https://www.youtube.com/watch?v=NXmotBdAIQ8,Costas,Biceps,Puxar Horizontal,Barra Olímpica,Intermediário,Composto,"Puxar no umbigo, Cotovelos fechados"
Como fazer mesa flexora pendurado,https://www.youtube.com/watch?v=Nuu2sQoGG5Q,Posterior,Panturrilha,Isolamento,Máquina Flexora,Iniciante,Isolado,"Quadril colado no banco, Foco no posterior"
`;

async function seed() {
    console.log('--- STARTING SEED ---');

    // 1. Delete all existing exercises
    const exercisesRef = db.collection('exercises');
    const snapshot = await exercisesRef.get();

    if (snapshot.size === 0) {
        console.log('No existing exercises to delete.');
    } else {
        console.log(`Deleting ${snapshot.size} exercises...`);
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('Deletion complete.');
    }

    // 2. Parse CSV
    const records = parse(EXERCISES_CSV, {
        columns: true,
        skip_empty_lines: true
    });

    // 3. Insert new exercises
    console.log(`Inserting ${records.length} new exercises...`);

    let count = 0;
    // Use sequential writes or small batches to avoid rate limits if list grows
    for (const record of records) {
        // Clean up the name (remove "Como fazer ")
        const rawName = record['Nome'] || '';
        const cleanName = rawName.replace(/^Como fazer /i, '').trim();

        const exerciseData = {
            nome: cleanName,
            video_url: record['Video URL'],
            musculo_principal: record['Musculo Principal'],
            musculos_secundarios: record['Musculos Secundarios'],
            padrao_movimento: record['Padrao de Movimento'],
            equipamentos: record['Equipamentos'],
            nivel_minimo: record['Nivel Minimo'],
            tipo: record['Tipo'],
            dicas: record['Dicas de Execucao'],
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await exercisesRef.add(exerciseData);
        count++;
        process.stdout.write('.');
    }

    console.log(`\n\nSuccessfully added ${count} exercises.`);
    console.log('--- SEED COMPLETE ---');
}

seed().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
