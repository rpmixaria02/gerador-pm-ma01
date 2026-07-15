const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================================
// ROTA: GERAR QUESTÕES
// ============================================================
app.post('/api/gerar', async (req, res) => {
    try {
        const { topico, quantidade } = req.body;
        const qtd = parseInt(quantidade) || 20;
        const API_KEY = process.env.DEEPSEEK_API_KEY;

        // VERIFICAR SE A CHAVE EXISTE
        if (!API_KEY) {
            return res.json({
                success: false,
                erro: 'Chave API do DeepSeek não configurada'
            });
        }

        console.log(`📝 Gerando ${qtd} questões sobre "${topico}"...`);

        const prompt = `Você é um professor de concurso público, especialista em questões estilo CEBRASPE (Certo/Errado).

Gere ${qtd} questões INÉDITAS sobre "${topico}".

REQUISITOS:
1. Cada questão deve ser uma assertiva (frase curta de até 200 caracteres)
2. Deve ter uma "pegadinha" - uma palavra que torna a frase certa ou errada
3. Nível médio/difícil (igual à CEBRASPE)

FORMATO DE RESPOSTA (JSON PURO):
[
    {"c": "topico", "s": "assertiva", "a": true/false, "j": "justificativa curta"}
]

Responda APENAS com o JSON, sem texto adicional.`;

        // ===== CHAMAR DEEPSEEK =====
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'Você é um especialista em concursos. Responda apenas com JSON válido.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 4000
            })
        });

        // VERIFICAR SE A RESPOSTA É OK
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na API:', response.status, errorText);
            return res.json({
                success: false,
                erro: `API DeepSeek retornou erro ${response.status}`
            });
        }

        const data = await response.json();
        console.log('✅ Resposta da API recebida');

        // EXTRAIR O CONTEÚDO
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('❌ Formato inesperado:', JSON.stringify(data));
            return res.json({
                success: false,
                erro: 'Formato de resposta inesperado da API'
            });
        }

        const conteudo = data.choices[0].message.content;
        console.log('📄 Conteúdo:', conteudo.substring(0, 200) + '...');

        // LIMPAR E PARSEAR O JSON
        let questoes = [];
        try {
            const jsonStr = conteudo
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            questoes = JSON.parse(jsonStr);
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e.message);
            return res.json({
                success: false,
                erro: 'Erro ao processar a resposta da IA'
            });
        }

        // VALIDAR AS QUESTÕES
        if (!Array.isArray(questoes) || questoes.length === 0) {
            return res.json({
                success: false,
                erro: 'Nenhuma questão válida gerada'
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
            return res.json({
                success: false,
                erro: 'As questões geradas não são válidas'
            });
        }

        console.log(`✅ ${questoesValidas.length} questões geradas com sucesso!`);
        res.json({
            success: true,
            questoes: questoesValidas,
            total: questoesValidas.length,
            origem: 'ia'
        });

    } catch (error) {
        console.error('❌ Erro no servidor:', error);
        res.json({
            success: false,
            erro: error.message || 'Erro interno do servidor'
        });
    }
});

// ============================================================
// ROTA: STATUS
// ============================================================
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        deepseek: process.env.DEEPSEEK_API_KEY ? 'configurado' : 'não configurado'
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Status: http://localhost:${PORT}/api/status`);
});
