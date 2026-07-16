const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================================
// CONTEÚDO DO EDITAL PM-MA 2026 (COMPLETO)
// ============================================================
const EDITAL = {
    portugues: `Compreensão e interpretação de textos de gêneros variados. Reconhecimento de tipos e gêneros textuais. Domínio da ortografia oficial. Domínio dos mecanismos de coesão textual: emprego de elementos de referenciação, substituição e repetição, de conectores e de outros elementos de sequenciação textual; emprego de tempos e modos verbais. Domínio da estrutura morfossintática do período: emprego das classes de palavras; relações de coordenação entre orações e entre termos da oração; relações de subordinação entre orações e entre termos da oração; reescrita de textos de diferentes gêneros e níveis de formalidade.`,

    historia_brasil: `A contribuição dos índios e negros para a formação do Brasil; A formação do Brasil Contemporâneo; A República Velha e as estruturas oligárquicas; Economia e Sociedade: o café e estratificação social; A Revolução de 1930; A Era Vargas: política, economia e sociedade; O período democrático (1945 a 1964). A redemocratização do Estado e a constituição de 1946. A política de industrialização do governo JK. A crise do regime democrático. O golpe de 1964. A crise do regime militar e a redemocratização. O Brasil político: nação e território. Organização do Estado Brasileiro. As Constituições.`,

    historia_maranhao: `França equinocial: expedição de Daniel de La Touche. Fundação de São Luís. Batalha de Guaxenduba. Capitães-mores do Maranhão. A invasão holandesa. A expulsão dos holandeses. Estado do Maranhão e Grão-Pará: Revolta de Bequimão (causas e objetivos da revolta); Companhia de Comércio do Maranhão e Grão-Pará. Período do Império: adesão do Maranhão à Independência do Brasil. Causas da não adesão: a batalha do Jenipapo. Balaiada: caracterização e causas do movimento. Período Republicano: adesão do Maranhão à República. Revolução de 1930 no Maranhão. Principais fatos políticos, econômicos e sociais ocorridos no Maranhão, na segunda metade do século XX.`,

    geografia_brasil: `A integração ao processo de internacionalização da economia. O processo de industrialização e suas repercussões na organização do espaço. A rede brasileira de transportes e sua evolução. A estrutura urbana brasileira e as grandes metrópoles. A dinâmica das fronteiras agrícolas e sua expansão para o Centro-Oeste e a Amazônia. A evolução da estrutura fundiária e problemas demográficos. Os movimentos migratórios internos. A população brasileira: distribuição dos efetivos demográficos no território nacional; evolução do crescimento ao longo do século XX; estrutura etária. Recursos naturais: aproveitamento, desperdício e política de conservação de recursos naturais.`,

    geografia_maranhao: `Localização do Estado do Maranhão: superfície; limites; linhas de fronteira; pontos extremos; Áreas de Proteção Ambiental (APA). Parques nacionais. Climas do Maranhão: pluviosidade e temperatura. Geomorfologia: classificação do relevo maranhense: planaltos, planícies e baixadas. Características dos rios maranhenses: bacias dos rios limítrofes: bacia do Parnaíba, do Gurupi e do Tocantins-Araguaia. Bacias dos rios genuinamente maranhenses. Principais formações vegetais: floresta, cerrado e cocais. Geografia da População: população absoluta; densidade demográfica; povoamento; movimentos populacionais. A agricultura maranhense: caracterização e principais produtos agrícolas; caracterização da pecuária. Extrativismo: vegetal, animal e mineral. Parque industrial: indústrias de base e indústrias de transformação. Setor terciário: comércio, telecomunicações, transportes. Malha viária. Portos e aeroportos. A cultura maranhense.`,

    legislacao_geral: `Decreto nº 88.777/1983 (R-200): Regulamento para as Polícias Militares e Corpos de Bombeiros Militares. Estabelece princípios e normas para aplicação do Decreto-Lei nº 667/1969. Conceitos: ordem pública, polícia ostensiva, manutenção da ordem pública, material bélico de PM. Competência do Ministério do Exército no controle e coordenação das PMs. Estrutura e organização: criação de OPMs depende de aprovação do Estado-Maior do Exército. Comandante-Geral: nomeação pelo Governador, escolhido entre oficiais da ativa do último posto. Ensino e instrução orientados pelo Ministério do Exército. Emprego operacional: atividade policial-militar voltada à manutenção da ordem pública.`,

    legislacao_estatuto: `Lei estadual nº 6.513/1995 (Estatuto dos Policiais Militares do Maranhão). Regula a situação, obrigações, direitos, deveres e prerrogativas dos policiais-militares da PMMA. Ingresso: mediante concurso público, com requisitos como idade máxima de 35 anos, altura mínima (1,60m homem; 1,55m mulher), exame toxicológico eliminatório. Hierarquia e disciplina: bases institucionais da PM. Círculos hierárquicos: oficiais (superiores, intermediários, subalternos), praças especiais (Aspirante-a-Oficial, Cadete), praças (Subtenente, Sargentos, Cabos, Soldados). Deveres: dedicação integral, culto aos símbolos nacionais, probidade, disciplina, respeito à hierarquia. Direitos: patente, proventos, estabilidade (praças com 5 anos), porte de arma, assistência jurídica. Promoções: por antiguidade, merecimento, bravura, post mortem. Transferência para reserva remunerada: 35 anos de serviço (30 de atividade militar) para integral. Idade limite: Coronel 67 anos, demais postos 65 anos, praças 65 anos.`,

    lei_organica: `Lei nº 14.751/2023 (Lei Orgânica Nacional das Polícias Militares e Corpos de Bombeiros Militares). Art. 2º: PMs e Bombeiros são instituições militares permanentes, exclusivas e típicas de Estado, forças auxiliares e reserva do Exército. Art. 3º: Princípios: hierarquia, disciplina, proteção dos direitos humanos, legalidade, impessoalidade, publicidade, moralidade, eficiência, razoabilidade, proporcionalidade. Art. 4º: Diretrizes: atendimento permanente ao cidadão, planejamento estratégico, integração com a comunidade, uso racional da força. Art. 5º: Competências das PMs: polícia de preservação da ordem pública, polícia ostensiva, polícia judiciária militar. Art. 6º: Competências dos Bombeiros: prevenção e combate a incêndios, busca e salvamento, defesa civil. Art. 12: Hierarquia: oficiais (Coronel, TC, Major, Capitão, 1º e 2º Tenentes) e praças (Subtenente, Sargentos, Cabos, Soldados). Art. 13: Condições de ingresso: brasileiro, quite com obrigações militares e eleitorais, sem antecedentes, aprovado em concurso, idoneidade moral, aptidão física e psicológica, exame toxicológico, nível superior, sem tatuagens ofensivas. Art. 18: Garantias: uso de títulos hierárquicos, uniformes privativos, documento de identidade militar com porte de arma, prisão em unidade militar, assistência jurídica, seguro de vida. Art. 29: Comandante-Geral: nomeado pelo Governador entre oficiais do último posto do QOEM, com curso de comando e estado-maior.`,

    informatica: `Noções de sistema operacional (ambientes Linux e Windows). Edição de textos, planilhas e apresentações (ambientes Microsoft Office e BrOffice). Redes de computadores: conceitos básicos, ferramentas, aplicativos e procedimentos de Internet e intranet; programas de navegação (Microsoft Internet Explorer, Mozilla Firefox e Google Chrome); programas de correio eletrônico (Outlook Express e Mozilla Thunderbird); sítios de busca e pesquisa na Internet; grupos de discussão; redes sociais; computação na nuvem (cloud computing). Conceitos de organização e de gerenciamento de informações, arquivos, pastas e programas. Segurança da informação: procedimentos de segurança; noções de vírus, worms e pragas virtuais; aplicativos para segurança (antivírus, firewall, anti-spyware etc.); procedimentos de backup; armazenamento de dados na nuvem (cloud storage).`
};

// ============================================================
// MAPEAMENTO DE TÓPICOS
// ============================================================
const mapTopicoEdital = {
    'todos': 'Todos os tópicos do edital da PM-MA',
    'portugues': EDITAL.portugues,
    'historia': EDITAL.historia_maranhao,
    'historia_brasil': EDITAL.historia_brasil,
    'historia_maranhao': EDITAL.historia_maranhao,
    'geografia_brasil': EDITAL.geografia_brasil,
    'geografia_maranhao': EDITAL.geografia_maranhao,
    'legislacao': EDITAL.legislacao_geral + '\n\n' + EDITAL.lei_organica + '\n\n' + EDITAL.legislacao_estatuto,
    'legislacao_geral': EDITAL.legislacao_geral,
    'legislacao_estatuto': EDITAL.legislacao_estatuto,
    'lei_organica': EDITAL.lei_organica,
    'sistema_operacional': EDITAL.informatica,
    'word_writer': EDITAL.informatica,
    'excel_calc': EDITAL.informatica,
    'powerpoint_impress': EDITAL.informatica,
    'internet_intranet': EDITAL.informatica,
    'navegadores': EDITAL.informatica,
    'correio': EDITAL.informatica,
    'busca': EDITAL.informatica,
    'grupos': EDITAL.informatica,
    'redes_sociais': EDITAL.informatica,
    'cloud': EDITAL.informatica,
    'seguranca': EDITAL.informatica
};

const nomesTopicos = {
    'portugues': 'Língua Portuguesa',
    'historia': 'História do Maranhão',
    'historia_brasil': 'História do Brasil',
    'historia_maranhao': 'História do Maranhão',
    'geografia_brasil': 'Geografia do Brasil',
    'geografia_maranhao': 'Geografia do Maranhão',
    'legislacao': 'Legislação (Geral + Estatuto + Lei Orgânica)',
    'legislacao_geral': 'Legislação Geral (R-200)',
    'legislacao_estatuto': 'Estatuto dos PMs (Lei 6.513/1995)',
    'lei_organica': 'Lei Orgânica Nacional (Lei 14.751/2023)',
    'sistema_operacional': 'Sistema Operacional',
    'word_writer': 'Word e Writer',
    'excel_calc': 'Excel e Calc',
    'powerpoint_impress': 'PowerPoint e Impress',
    'internet_intranet': 'Internet e Intranet',
    'navegadores': 'Navegadores',
    'correio': 'Correio Eletrônico',
    'busca': 'Sítios de Busca',
    'grupos': 'Grupos de Discussão',
    'redes_sociais': 'Redes Sociais',
    'cloud': 'Computação em Nuvem',
    'seguranca': 'Segurança da Informação',
    'todos': 'Todos os tópicos'
};

// ============================================================
// ROTA: GERAR QUESTÕES COM DEEPSEEK (GRÁTIS)
// ============================================================
app.post('/api/gerar', async (req, res) => {
    try {
        const { topico, quantidade } = req.body;
        const qtd = parseInt(quantidade) || 10;
        const API_KEY = process.env.OPENROUTER_API_KEY;

        console.log(`📝 Solicitado: ${qtd} questões sobre "${topico}"`);
        console.log(`🔑 OpenRouter API Key: ${API_KEY ? '✅ Sim' : '❌ Não'}`);

        const conteudoEdital = mapTopicoEdital[topico] || mapTopicoEdital['todos'];
        const nomeExibicao = nomesTopicos[topico] || topico;

        // SE NÃO TIVER CHAVE, USA O BANCO LOCAL
        if (!API_KEY) {
            console.log('⚠️ Sem chave. Usando banco local.');
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local'
            });
        }

        // ===== PROMPT =====
        const prompt = `Você é um professor especialista em concursos públicos, com foco na banca CEBRASPE (Certo/Errado).

BASEADO NO EDITAL DA POLÍCIA MILITAR DO MARANHÃO (PMMA 2026), gere ${qtd} questões INÉDITAS no estilo CEBRASPE sobre o seguinte conteúdo:

TÓPICO: ${nomeExibicao}

CONTEÚDO DO EDITAL (use APENAS este conteúdo):
${conteudoEdital}

REGRAS IMPORTANTES:
1. Cada questão deve ser uma assertiva (frase curta de até 200 caracteres)
2. As questões devem ser NOVAS e ORIGINAIS - NUNCA repetir questões conhecidas
3. Cada questão deve ter uma "pegadinha" - uma palavra que torna a frase sutilmente certa ou errada
4. Nível de dificuldade: Médio/Difícil (igual à CEBRASPE)
5. As questões devem ser relevantes para o concurso da Polícia Militar do Maranhão

EXEMPLOS DE PEGADINHA:
- "O porte de arma é permitido para maiores de 21 anos." → ERRADO (é 25 anos)
- "A PM é força auxiliar e reserva do Exército." → CERTO (CF/88)

FORMATO DE RESPOSTA (JSON):
[
    {"c": "${topico}", "s": "assertiva", "a": true/false, "j": "justificativa curta"}
]

Responda APENAS com o JSON, sem texto adicional.`;

        console.log('🔄 Chamando DeepSeek via OpenRouter (grátis)...');

        // ===== CHAMAR DEEPSEEK VIA OPENROUTER (GRÁTIS) =====
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-v4-flash:free', // 🔥 MODELO GRÁTIS!
                messages: [
                    { role: 'system', content: 'Você é um especialista em concursos públicos da banca CEBRASPE. Responda apenas com JSON válido.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Erro na API (${response.status}):`, errorText);
            
            // FALLBACK: usar banco local
            console.log('⚠️ Usando banco local (fallback)');
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local (fallback)',
                erro: `DeepSeek retornou ${response.status}`
            });
        }

        const data = await response.json();
        console.log('✅ Resposta recebida');

        // ===== EXTRAIR O CONTEÚDO =====
        let conteudo = '';
        try {
            conteudo = data.choices[0].message.content;
            console.log('📄 Conteúdo (primeiros 200 chars):', conteudo.substring(0, 200));
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
            const jsonStr = conteudo
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            questoes = JSON.parse(jsonStr);
        } catch (e) {
            console.error('❌ Erro ao parsear JSON:', e.message);
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local (erro json)'
            });
        }

        // ===== VALIDAR =====
        if (!Array.isArray(questoes) || questoes.length === 0) {
            const locais = gerarQuestoesLocais(topico, qtd);
            return res.json({
                success: true,
                questoes: locais,
                total: locais.length,
                origem: 'local (vazio)'
            });
        }

        const questoesValidas = questoes
            .filter(q => q.s && typeof q.s === 'string' && q.s.length > 5)
            .map(q => ({
                c: topico,
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

        console.log(`✅ ${questoesValidas.length} questões geradas com sucesso!`);
        res.json({
            success: true,
            questoes: questoesValidas,
            total: questoesValidas.length,
            origem: 'deepseek'
        });

    } catch (error) {
        console.error('❌ Erro no servidor:', error);
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
// FUNÇÃO: GERAR QUESTÕES LOCAIS (FALLBACK)
// ============================================================
function gerarQuestoesLocais(topico, quantidade) {
    const qtd = Math.min(quantidade, 50);

    const questoesBase = [
        // HISTÓRIA DO MARANHÃO
        { c: "historia_maranhao", s: "A França Equinocial foi uma expedição de Daniel de La Touche ao Maranhão.", a: true, j: "Correto. A França Equinocial tentou colonizar o Maranhão." },
        { c: "historia_maranhao", s: "São Luís foi fundada por portugueses em 1612.", a: false, j: "Errado. Foi fundada pelos franceses em 1612." },
        { c: "historia_maranhao", s: "A Batalha de Guaxenduba ocorreu entre portugueses e franceses no Maranhão.", a: true, j: "Correto. Foi uma batalha decisiva pela posse do Maranhão." },
        { c: "historia_maranhao", s: "A Revolta de Bequimão ocorreu no Estado do Maranhão e Grão-Pará.", a: true, j: "Correto. Foi contra a Companhia de Comércio do Maranhão." },
        { c: "historia_maranhao", s: "A Balaiada foi um movimento popular no Maranhão entre 1838 e 1841.", a: true, j: "Correto. Foi uma das maiores revoltas do período regencial." },
        { c: "historia_maranhao", s: "O Maranhão aderiu imediatamente à Independência do Brasil em 1822.", a: false, j: "Errado. Só aderiu após a Batalha do Jenipapo." },
        // LEGISLAÇÃO
        { c: "legislacao", s: "A segurança pública é dever do Estado, direito e responsabilidade de todos (CF/88).", a: true, j: "Correto. Art. 144 da CF." },
        { c: "legislacao", s: "O porte de arma é permitido para maiores de 21 anos.", a: false, j: "Errado. O Estatuto do Desarmamento exige 25 anos." },
        { c: "legislacao", s: "As PMs são forças auxiliares e reserva do Exército, conforme CF/88.", a: true, j: "Correto. Art. 144, §6º." },
        // LEI ORGÂNICA
        { c: "lei_organica", s: "A Lei 14.751/2023 instituiu a Lei Orgânica Nacional das Polícias Militares.", a: true, j: "Correto. Art. 1º da Lei." },
        { c: "lei_organica", s: "O Comandante-Geral da PM deve ser escolhido entre oficiais do QOEM com curso de comando e estado-maior.", a: true, j: "Correto. Art. 29 da Lei 14.751/2023." },
        // ESTATUTO PMMA
        { c: "legislacao_estatuto", s: "O Estatuto dos PMs do Maranhão é regido pela Lei 6.513/1995.", a: true, j: "Correto." },
        { c: "legislacao_estatuto", s: "A idade máxima para ingresso na PMMA é de 40 anos.", a: false, j: "Errado. Art. 9º: idade máxima de 35 anos." },
        { c: "legislacao_estatuto", s: "A altura mínima para candidatos homens na PMMA é de 1,60m.", a: true, j: "Correto. Art. 9º, inciso VII." },
        // PORTUGUÊS
        { c: "portugues", s: "Na frase 'Os alunos estudaram', o sujeito é simples.", a: true, j: "Correto." },
        { c: "portugues", s: "Em 'Fazem dois anos', o verbo 'fazer' está no plural.", a: false, j: "Errado. 'Faz' é impessoal, fica no singular." },
        // SEGURANÇA
        { c: "seguranca", s: "Vírus e worms são tipos de malware que infectam computadores.", a: true, j: "Correto." },
        { c: "seguranca", s: "Firewall e antivírus realizam exatamente a mesma função.", a: false, j: "Errado. Firewall controla tráfego; antivírus detecta malwares." }
    ];

    let filtradas = questoesBase.filter(q => topico === 'todos' || q.c === topico);

    if (filtradas.length === 0) {
        filtradas = questoesBase.slice(0, 10);
    }

    const resultado = [];
    for (let i = 0; i < Math.min(qtd, filtradas.length); i++) {
        const original = filtradas[i % filtradas.length];
        resultado.push({
            c: topico,
            s: original.s + (i >= filtradas.length ? ` (Variação ${Math.floor(i/filtradas.length)+1})` : ''),
            a: original.a,
            j: original.j
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
        deepseek: process.env.OPENROUTER_API_KEY ? '✅ configurado' : '❌ não configurado',
        versao: 'PM-MA 2026 - Edital Completo'
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 Status: http://localhost:${PORT}/api/status`);
    console.log(`🔑 DeepSeek: ${process.env.OPENROUTER_API_KEY ? '✅ Configurado' : '❌ Não configurado'}`);
    console.log(`📚 Edital PM-MA 2026 carregado!`);
});
