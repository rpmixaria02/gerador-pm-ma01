const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================================
// BANCO LOCAL DE QUESTÕES (FALLBACK)
// ============================================================
const QUESTAO_LOCAL = [
    { c: "historia", s: "O Maranhão foi colonizado por portugueses e franceses.", a: true,
        j: "Correto. O Maranhão teve colonização francesa e portuguesa." },
    { c: "historia", s: "São Luís foi fundada por portugueses em 1612.", a: false,
        j: "Errado. Foi fundada pelos franceses em 1612." },
    { c: "historia", s: "A 'Balaiada' foi uma revolta popular no Maranhão entre 1838 e 1841.", a: true,
        j: "Correto. A Balaiada foi uma das maiores revoltas do período regencial." },
    { c: "legislacao", s: "A segurança pública é dever do Estado, direito e responsabilidade de todos (CF/88).", a: true,
        j: "Correto. Art. 144 da Constituição Federal." },
    { c: "legislacao", s: "O porte de arma é permitido para maiores de 21 anos.", a: false,
        j: "Errado. O Estatuto do Desarmamento exige 25 anos." },
    { c: "portugues", s: "Na frase 'Os alunos estudaram para a prova', o sujeito é simples.", a: true,
        j: "Correto. 'Os alunos' é o sujeito simples." },
    { c: "portugues", s: "Em 'Fazem dois anos que não o vejo', o verbo 'fazer' está corretamente flexionado no plural.",
        a: false, j: "Errado. O verbo 'fazer' indicando tempo decorrido é impessoal: 'Faz dois anos'." },
    { c: "seguranca", s: "Vírus e worms são tipos de malware que podem infectar computadores.", a: true,
        j: "Correto. Vírus e worms são pragas virtuais." },
    { c: "seguranca", s: "Firewall e antivírus realizam exatamente a mesma função de proteção.", a: false,
        j: "Errado. Firewall controla tráfego de rede; antivírus detecta malwares." },
    { c: "cloud", s: "Computação em nuvem permite acesso sob demanda a recursos computacionais pela internet.",
        a: true, j: "Correto. Essa é a definição de cloud computing." },
    { c: "cloud", s: "A computação em nuvem elimina totalmente a necessidade de conexão com a internet.", a: false,
        j: "Errado. O acesso a recursos em nuvem depende de conexão com a internet." }
];

// ============================================================
// ROTA: GERAR QUESTÕES (COM GEMINI)
// ============================================================
app.post('/api/gerar', async (req, res) => {
    try {
        const { topico, quantidade } = req.body;
        const qtd = parseInt(quantidade) || 10;
        const API_KEY = process.env.GEMINI_API_KEY;

        console.log(`📝 Solicitado: ${qtd} questões sobre "${topico}"`);
        console.log(`🔑 Gemini API Key configurada: ${API_KEY ? '✅ Sim' : '❌ Não'}`);

        // SE NÃO TIVER CHAVE, USA O BANCO LOCAL
        if (!API_KEY) {
            console.log('⚠️ Sem chave Gemini. Usando banco local.');
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local'
            });
        }

        // ===== PROMPT PARA O GEMINI =====
        const prompt = `Você é um professor de concurso público, especialista em questões estilo CEBRASPE (Certo/Errado).

Gere ${qtd} questões INÉDITAS sobre "${topico}".

REQUISITOS:
1. Cada questão deve ser uma assertiva (frase curta de até 200 caracteres)
2. Deve ter uma "pegadinha" - uma palavra que torna a frase certa ou errada
3. Nível médio/difícil (igual à CEBRASPE)
4. As questões devem ser NOVAS e ORIGINAIS - NUNCA repetir questões conhecidas
5. Inclua questões fáceis, médias e difíceis
6. As assertivas devem ser baseadas na legislação e doutrina corretas

FORMATO DE RESPOSTA (JSON PURO):
[
    {"c": "topico", "s": "assertiva", "a": true/false, "j": "justificativa curta"}
]

Responda APENAS com o JSON, sem texto adicional.`;

        console.log('🔄 Chamando Google Gemini API...');

        // ===== CHAMAR O GEMINI =====
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        // VERIFICAR SE A RESPOSTA É OK
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Erro na API Gemini (${response.status}):`, errorText);
            
            // FALLBACK: usar banco local
            console.log('⚠️ Usando banco local (fallback)');
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local (fallback)',
                erro: `Gemini retornou ${response.status}`
            });
        }

        const data = await response.json();
        console.log('✅ Resposta da Gemini recebida');

        // ===== EXTRAIR O CONTEÚDO =====
        let conteudo = '';
        try {
            // Estrutura da resposta do Gemini
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                conteudo = data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Formato inesperado da resposta');
            }
            console.log('📄 Conteúdo recebido (primeiros 200 chars):', conteudo.substring(0, 200));
        } catch (e) {
            console.error('❌ Erro ao extrair conteúdo:', e);
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local (erro parse)'
            });
        }

        // ===== LIMPAR E PARSEAR O JSON =====
        let questoes = [];
        try {
            // Remover markdown e espaços extras
            const jsonStr = conteudo
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            questoes = JSON.parse(jsonStr);
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e.message);
            // FALLBACK: banco local
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local (erro json)'
            });
        }

        // ===== VALIDAR AS QUESTÕES =====
        if (!Array.isArray(questoes) || questoes.length === 0) {
            console.log('⚠️ Nenhuma questão gerada. Usando banco local.');
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local (vazio)'
            });
        }

        // GARANTIR QUE CADA QUESTÃO TEM OS CAMPOS OBRIGATÓRIOS
        const questoesValidas = questoes
            .filter(q => q.s && typeof q.s === 'string' && q.s.length > 5)
            .map(q => ({
                c: q.c || topico || 'geral',
                s: q.s,
                a: typeof q.a === 'boolean' ? q.a : true,
                j: q.j || 'Justificativa não fornecida.'
            }));

        if (questoesValidas.length === 0) {
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local (invalidas)'
            });
        }

        console.log(`✅ ${questoesValidas.length} questões geradas com sucesso pelo Gemini!`);
        res.json({
            success: true,
            questoes: questoesValidas,
            total: questoesValidas.length,
            origem: 'gemini'
        });

    } catch (error) {
        console.error('❌ Erro no servidor:', error);
        
        // FALLBACK: banco local
        const topico = req.body.topico || 'geral';
        const qtd = parseInt(req.body.quantidade) || 10;
        const locais = gerarQuestoesLocais(topico, qtd);
        
        res.json({
            success: true,
            questoes: locais,
            total: locais.length,
            origem: 'local (erro)',
            erro: error.message
        });
    }
});

// ============================================================
// FUNÇÃO: GERAR QUESTÕES LOCAIS
// ============================================================
function gerarQuestoesLocais(topico, quantidade) {
    const qtd = Math.min(quantidade, 30);
    
    let filtradas = QUESTAO_LOCAL.filter(q => topico === 'todos' || q.c === topico);
    
    if (filtradas.length === 0) {
        filtradas = QUESTAO_LOCAL.slice(0, 10);
    }
    
    const resultado = [];
    for (let i = 0; i < qtd; i++) {
        const original = filtradas[i % filtradas.length];
        resultado.push({
            c: original.c,
            s: original.s + (i >= filtradas.length ? ` (Variação ${Math.floor(i/filtradas.length)+1})` : ''),
            a: original.a,
            j: original.j,
            id: i + 1,
            answered: false,
            correct: null
        });
    }
    
    return resultado;
}

// ============================================================
// ROTA: STATUS
// ============================================================
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        gemini: process.env.GEMINI_API_KEY ? '✅ configurado' : '❌ não configurado',
        local_questoes: QUESTAO_LOCAL.length
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Status: http://localhost:${PORT}/api/status`);
    console.log(`🔑 Gemini: ${process.env.GEMINI_API_KEY ? '✅ Configurado' : '❌ Não configurado'}`);
});
