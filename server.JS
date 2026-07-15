const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/gerar', async (req, res) => {
    try {
        const { topico, quantidade } = req.body;
        const qtd = parseInt(quantidade) || 20;

        const prompt = `Gere ${qtd} questões INÉDITAS no estilo CEBRASPE (Certo/Errado) sobre "${topico}".
        
        Cada questão deve ter uma "pegadinha" - uma palavra que torna a frase certa ou errada.
        
        Responda APENAS com JSON:
        [
            {"c": "topico", "s": "assertiva", "a": true/false, "j": "justificativa"}
        ]`;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                max_tokens: 4000
            })
        });

        const data = await response.json();
        const conteudo = data.choices[0].message.content;
        const questoes = JSON.parse(conteudo.replace(/```json/g, '').replace(/```/g, '').trim());

        res.json({ success: true, questoes: questoes });

    } catch (error) {
        res.json({ success: false, erro: error.message });
    }
});

app.get('/api/status', (req, res) => {
    res.json({ status: 'online' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});