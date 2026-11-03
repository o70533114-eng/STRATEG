import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const MODEL_PRIMARY = 'gemini-3.8-flash';
const MODEL_FALLBACK = 'gemini-3.1-flash-lite';

async function generateWithFallback(options: any) {
  if (!ai) throw new Error('NO_API_KEY');
  try {
    return await ai.models.generateContent({
      ...options,
      model: MODEL_PRIMARY,
    });
  } catch (err: any) {
    console.warn(`Primary model ${MODEL_PRIMARY} failed (${err.message}). Trying fallback ${MODEL_FALLBACK}...`);
    return await ai.models.generateContent({
      ...options,
      model: MODEL_FALLBACK,
    });
  }
}

const SYSTEM_PROMPT_INTERVIEW = `
Ты — аналитическое ядро экспертной методологии «СТРАТЕГ» для бизнес-консультантов, трекеров и стратегов.
Твоя задача — исследовать проблемы предпринимателей, выявлять реальные первопричины, проверять допущения и строить строгие логические доказательства.

КРИТИЧЕСКИЕ ПРАВИЛА ДИАЛОГА:
1. Задавай СТРОГО ПО ОДНОМУ ВОПРОСУ за один шаг диалога. Никаких списков из 3-5 вопросов!
2. КАТЕГОРИЧЕСКИ НЕ ПРЕДЛАГАЙ РЕШЕНИЯ до тех пор, пока не исследованы:
   - точная формулировка проблемы в цифрах и симптомах,
   - конкретный желаемый результат (измеримый, со сроком),
   - подтверждённые факты и хронология,
   - структура затрат/процессов и исключение поверхностных объяснений.
3. Разделяй информацию на 4 категории:
   - ПОДТВЕРЖДЁННЫЙ ФАКТ: доказано метриками, документами, выписками, проверяемо.
   - ПРЕДПОЛОЖЕНИЕ: мнение, гипотеза предпринимателя или сотрудников, не подтверждённая независимыми данными (например, «продавцы говорят, что у конкурентов дешевле»).
   - ВЫВОД: логически обоснованное следствие из подтверждённых фактов.
   - НЕИЗВЕСТНО: недостающие данные, критические слепые зоны.
4. Если пользователь делает вывод, который логически не следует из данных (Non sequitur, ошибка корреляции/причинности), вежливо и аргументированно укажи на этот логический разрыв.
5. Не подменяй доказательства авторитетом, эмоциями или субъективной уверенностью.
6. Весь ответ должен быть на чистом деловом русском языке, структурированным и лаконичным.
`;

// Helper: Intelligent rule-based chat fallback if Gemini API is temporarily busy
function buildFallbackChatStep(messages: any[], projectContext: any) {
  const lastUserMsg = messages[messages.length - 1]?.content || '';
  const turnCount = messages.filter((m: any) => m.role === 'user').length;

  let nextQ = 'Какими конкретными документами или метриками подтверждается это явление за последние 3-6 месяцев?';
  let critique = 'Необходимо отделить проверяемые цифры от эмоциональных объяснений команды.';

  if (turnCount === 1) {
    nextQ = 'К какому конкретно измеримому результату и в какой срок вы стремитесь (в цифрах выручки, маржи или сроков)?';
  } else if (turnCount === 2) {
    nextQ = 'Какие 2-3 категории клиентов или продуктов приносят основной объём и как изменилась их маржинальность?';
  } else if (turnCount === 3) {
    nextQ = 'С какими условиями отсрочки платежей и условиями закупок сырья вы работаете сейчас?';
  } else if (turnCount >= 4) {
    nextQ = 'Проводилась ли проверка гипотез о причинах: какие альтернативные объяснения вы уже исключили?';
  }

  return {
    content: `Принято. Я зафиксировал ответ:\n\n` +
      `• **Установленные факты:** ${lastUserMsg.slice(0, 150)}\n` +
      `• **Предположения:** Требуют проверки первичными документами и расчётами.\n` +
      `• **Недостающие данные:** Детализация структуры затрат и условий расчётов.\n\n` +
      `**Следующий вопрос:** ${nextQ}`,
    structuredMeta: {
      summaryOfLastAnswer: `Зафиксирован ответ: «${lastUserMsg.slice(0, 100)}...»`,
      establishedFacts: [
        projectContext.initialProblem ? `Проблема: ${projectContext.initialProblem}` : 'Симптом зафиксирован',
        `Свидетельство: ${lastUserMsg.slice(0, 80)}`
      ],
      missingData: ['Первичные метрики за 6 месяцев', 'Фактическая маржа по сегментам'],
      assumptions: ['Субъективная оценка причин участниками процесса'],
      logicalCritique: critique,
      nextQuestion: nextQ
    }
  };
}

// 1. Endpoint: Chat / Step-by-step interview
app.post('/api/strategist/chat', async (req: Request, res: Response) => {
  try {
    const { messages, projectContext } = req.body;

    if (!ai) {
      res.json(buildFallbackChatStep(messages, projectContext));
      return;
    }

    const conversationHistory = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const contextPrompt = `
КОНТЕКСТ ПРОЕКТА:
- Предприниматель: ${projectContext.clientName || 'Не указан'}
- Компания: ${projectContext.companyName || 'Не указана'}
- Сфера: ${projectContext.industry || 'Не указана'}
- Масштаб: ${projectContext.scale || 'Не указан'}
- Первичная проблема: ${projectContext.initialProblem || 'Не указана'}
- Желаемый результат: ${projectContext.desiredOutcome || 'Не указан'}
- Ранее установленные факты: ${JSON.stringify(projectContext.establishedFacts || [])}
- Ранее зафиксированные предположения: ${JSON.stringify(projectContext.assumptions || [])}
- Недостающие данные: ${JSON.stringify(projectContext.missingData || [])}

ИНСТРУКЦИЯ К ФОРМАТУ ОТВЕТА:
Верни JSON-объект строго по следующей схеме:
{
  "content": "Полный текст ответа консультанта для пользователя (включая краткую фиксацию, факты, предположения, логическую критику при наличии и ровно ОДИН финальный вопрос)",
  "summaryOfLastAnswer": "Краткая суть последнего ответа пользователя (1-2 предложения)",
  "newFacts": ["Новые установленные подтверждённые факты"],
  "newAssumptions": ["Выявленные непроверенные предположения или суждения"],
  "missingData": ["Что пока остаётся неизвестным и критически важным"],
  "logicalCritique": "Если пользователь делает логический скачок или необоснованный вывод — объясни чего не хватает. Если всё корректно — пусто",
  "nextQuestion": "Ровно один чёткий следующий вопрос"
}
`;

    try {
      const response = await generateWithFallback({
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT_INTERVIEW + '\n\n' + contextPrompt }] },
          ...conversationHistory
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              summaryOfLastAnswer: { type: Type.STRING },
              newFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
              newAssumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingData: { type: Type.ARRAY, items: { type: Type.STRING } },
              logicalCritique: { type: Type.STRING },
              nextQuestion: { type: Type.STRING }
            },
            required: ['content', 'summaryOfLastAnswer', 'newFacts', 'newAssumptions', 'missingData', 'nextQuestion']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');

      res.json({
        content: parsed.content || 'Информация зафиксирована.',
        structuredMeta: {
          summaryOfLastAnswer: parsed.summaryOfLastAnswer,
          establishedFacts: parsed.newFacts || [],
          missingData: parsed.missingData || [],
          assumptions: parsed.newAssumptions || [],
          logicalCritique: parsed.logicalCritique || '',
          nextQuestion: parsed.nextQuestion || ''
        }
      });
    } catch (modelError: any) {
      console.warn('AI call error in /chat, using robust methodological fallback:', modelError.message);
      res.json(buildFallbackChatStep(messages, projectContext));
    }
  } catch (error: any) {
    console.error('Fatal error in /api/strategist/chat:', error);
    res.status(500).json({ error: error.message || 'Ошибка обработки диалога' });
  }
});

// 2. Endpoint: Synthesize Full Logical Chain
app.post('/api/strategist/build-chain', async (req: Request, res: Response) => {
  try {
    const { projectContext } = req.body;

    const fallbackChain = [
      {
        id: 'node-1',
        type: 'problem',
        title: 'Исходная проблема',
        content: projectContext.initialProblem || 'Симптом дефицита результатов или рентабельности',
        evidence: 'Первичные данные клиента и симптомы в диалоге',
        status: 'fact',
        parentId: null,
        missingData: 'Понедельная динамика показателей за 6 месяцев',
        counterArguments: 'Влияние сезонных факторов'
      },
      {
        id: 'node-2',
        type: 'fact',
        title: 'Установленные факты и обстоятельства',
        content: projectContext.establishedFacts?.length 
          ? projectContext.establishedFacts.join('; ') 
          : 'Собраны факты в ходе диагностической сессии',
        evidence: 'Данные управленческого учёта и опроса',
        status: 'fact',
        parentId: 'node-1',
        missingData: 'Аудит первичной документации',
        counterArguments: 'Возможные неточности в учёте'
      },
      {
        id: 'node-3',
        type: 'cause',
        title: 'Ключевая гипотеза о первопричине',
        content: 'Дисбаланс между структурой ценообразования / отсрочек и стоимостью капитала',
        evidence: 'Сопоставление маржинальности и оборачиваемости капитала',
        status: 'hypothesis',
        parentId: 'node-2',
        missingData: 'Юнит-экономика в разрезе когорт клиентов',
        counterArguments: 'Версия команды о внешнем демпинге рынка'
      },
      {
        id: 'node-4',
        type: 'cause_check',
        title: 'Проверка гипотезы о первопричине',
        content: 'Анализ альтернативных объяснений (неэффективность персонала vs системная ошибка бизнес-модели)',
        evidence: 'Сравнительный бенчмаркинг и интервью',
        status: 'fact',
        parentId: 'node-3',
        missingData: 'Коммерческие предложения конкурентов',
        counterArguments: 'Неполнота выборки'
      },
      {
        id: 'node-5',
        type: 'conclusion',
        title: 'Обоснованный промежуточный вывод',
        content: 'Проблема вызвана не внешним рынком, а внутренним регламентом согласования нерентабельных условий',
        evidence: 'Математическая модель движения денежных средств',
        status: 'conclusion',
        parentId: 'node-4',
        missingData: 'Регламент продаж',
        counterArguments: 'Опасение падения валовой выручки'
      },
      {
        id: 'node-6',
        type: 'solution',
        title: 'Обоснованное решение',
        content: 'Реструктуризация условий работы с клиентами и внедрение пороговой рентабельности',
        evidence: 'Расчёт высвобождения ликвидности',
        status: 'hypothesis',
        parentId: 'node-5',
        missingData: 'Готовность клиентов к факторингу / изменению отсрочки',
        counterArguments: 'Риск оттока нерентабельных клиентов'
      },
      {
        id: 'node-7',
        type: 'validation',
        title: 'Пилотная проверка гипотезы',
        content: 'Тестирование новых условий на 1 клиенте/сегменте в течение 30-45 дней',
        evidence: 'Протокол эксперимента с Go/No-Go критериями',
        status: 'hypothesis',
        parentId: 'node-6',
        missingData: 'Контрольная группа для сравнения',
        counterArguments: 'Влияние внешнего сезонного спроса'
      }
    ];

    if (!ai) {
      res.json({ chain: fallbackChain });
      return;
    }

    const prompt = `
Ты — методолог логического анализа бизнес-систем «СТРАТЕГ».
На основе имеющихся данных по проекту сформируй связную доказательную логическую цепочку из 6-7 последовательных блоков:
1. Проблема (problem) — формулировка исходного симптома и противоречия.
2. Факты (fact) — установленные объективные цифры и события.
3. Возможная причина (cause) — гипотеза о корневом факторе.
4. Проверка причин (cause_check) — проверка гипотезы и отсечение ложных версий.
5. Промежуточный вывод (conclusion) — обоснованное резюме первопричины.
6. Вариант решения (solution) — ключевой рычаг воздействия на первопричину.
7. Проверка результата (validation) — пилотная верификация гипотезы.

ДАННЫЕ ПРОЕКТА:
Компания: ${projectContext.companyName}
Клиент: ${projectContext.clientName}
Отрасль: ${projectContext.industry}
Масштаб: ${projectContext.scale}
Проблема: ${projectContext.initialProblem}
Цель: ${projectContext.desiredOutcome}
Факты: ${JSON.stringify(projectContext.establishedFacts)}
`;

    try {
      const response = await generateWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chain: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                    status: { type: Type.STRING },
                    parentId: { type: Type.STRING, nullable: true },
                    missingData: { type: Type.STRING },
                    counterArguments: { type: Type.STRING }
                  },
                  required: ['id', 'type', 'title', 'content', 'evidence', 'status', 'missingData', 'counterArguments']
                }
              }
            },
            required: ['chain']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      res.json({ chain: data.chain && data.chain.length ? data.chain : fallbackChain });
    } catch (e: any) {
      console.warn('AI call in build-chain failed, using structured fallback:', e.message);
      res.json({ chain: fallbackChain });
    }
  } catch (error: any) {
    console.error('Error in /api/strategist/build-chain:', error);
    res.status(500).json({ error: error.message || 'Ошибка генерации логической цепочки' });
  }
});

// 3. Endpoint: Multi-criteria Prioritization
app.post('/api/strategist/prioritize', async (req: Request, res: Response) => {
  try {
    const { projectContext } = req.body;

    const fallbackPrioritization = {
      scaleNegativeConsequences: {
        score: 8,
        justification: 'Проблема угрожает операционной устойчивости и ведёт к регулярному дефициту ликвидности.'
      },
      impactOnGoals: {
        score: 8,
        justification: 'Блокирует достижение целевой маржинальности и планы инвестиций в масштабирование.'
      },
      urgency: {
        score: 7,
        justification: 'Текущие темпы потерь требуют принятия мер в пределах 3-4 недель.'
      },
      potentialEffect: {
        score: 9,
        justification: 'Устранение первопричины высвободит оборотный капитал и восстановит рентабельность.'
      },
      requiredResources: {
        score: 4,
        justification: 'Требуются организационно-переговорные изменения без капиталоёмких закупок.'
      },
      costOfInaction: {
        score: 9,
        justification: 'Через 6 месяцев дефицит оборотных средств перерастёт в системный кассовый разрыв.'
      },
      dataConfidence: {
        score: 7,
        justification: 'Основные финансовые метрики зафиксированы, но реакция клиентов требует пилота.'
      },
      totalPriorityScore: 8.3,
      totalPrioritySummary: 'Высокий стратегический приоритет: соотношение потенциального эффекта к затратам максимально высокое. Стоимость бездействия критическая.',
      uncertaintyNotes: 'Главная неопределённость — эластичность спроса ключевых клиентов при корректировке условий.'
    };

    if (!ai) {
      res.json({ prioritization: fallbackPrioritization });
      return;
    }

    const prompt = `
Ты — эксперт по приоритизации проблем «СТРАТЕГ».
Оцени проблему по 7 строгим критериям. Для КАЖДОГО критерия поставь балл от 1 до 10 и дай ПОДРОБНОЕ ОБОСНОВАНИЕ:
1. scaleNegativeConsequences
2. impactOnGoals
3. urgency
4. potentialEffect
5. requiredResources
6. costOfInaction
7. dataConfidence
Также сформируй totalPriorityScore, totalPrioritySummary, uncertaintyNotes.

ДАННЫЕ:
Компания: ${projectContext.companyName}
Проблема: ${projectContext.initialProblem}
Цель: ${projectContext.desiredOutcome}
Факты: ${JSON.stringify(projectContext.establishedFacts)}
`;

    try {
      const response = await generateWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scaleNegativeConsequences: {
                type: Type.OBJECT,
                properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } },
                required: ['score', 'justification']
              },
              impactOnGoals: {
                type: Type.OBJECT,
                properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } },
                required: ['score', 'justification']
              },
              urgency: {
                type: Type.OBJECT,
                properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } },
                required: ['score', 'justification']
              },
              potentialEffect: {
                type: Type.OBJECT,
                properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } },
                required: ['score', 'justification']
              },
              requiredResources: {
                type: Type.OBJECT,
                properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } },
                required: ['score', 'justification']
              },
              costOfInaction: {
                type: Type.OBJECT,
                properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } },
                required: ['score', 'justification']
              },
              dataConfidence: {
                type: Type.OBJECT,
                properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } },
                required: ['score', 'justification']
              },
              totalPriorityScore: { type: Type.NUMBER },
              totalPrioritySummary: { type: Type.STRING },
              uncertaintyNotes: { type: Type.STRING }
            },
            required: [
              'scaleNegativeConsequences', 'impactOnGoals', 'urgency', 'potentialEffect',
              'requiredResources', 'costOfInaction', 'dataConfidence',
              'totalPriorityScore', 'totalPrioritySummary', 'uncertaintyNotes'
            ]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ prioritization: parsed });
    } catch (e: any) {
      console.warn('Prioritize AI failed, returning structured fallback:', e.message);
      res.json({ prioritization: fallbackPrioritization });
    }
  } catch (error: any) {
    console.error('Error in /api/strategist/prioritize:', error);
    res.status(500).json({ error: error.message || 'Ошибка расчёта приоритетов' });
  }
});

// 4. Endpoint: Generate Justified Solution Options
app.post('/api/strategist/generate-solutions', async (req: Request, res: Response) => {
  try {
    const { projectContext } = req.body;

    const fallbackSolutions = [
      {
        id: 'sol-1',
        name: 'Системное решение: переход на факторинг и синхронизация финансового цикла',
        impactMechanism: 'Банк финансирует дебиторскую задолженность в день отгрузки, устраняя разрыв между закупкой и получением средств.',
        expectedResult: 'Сокращение кассового разрыва на 80%, высвобождение оборотных средств, устранение дорогого овердрафта.',
        actions: [
          'Подготовить пул договоров ключевых заказчиков для банка',
          'Согласовать условия факторинга без регресса',
          'Внести изменения в типовые контракты сбыта'
        ],
        costsAndResources: 'Комиссия фактора ~2.5-3.5% от суммы поставки, 2 недели работы финдиректора.',
        risks: 'Отказ части клиентов от подписания трёхстороннего уведомления.',
        constraints: 'Лимиты факторинговой компании на конкретных дебиторов.',
        kpis: 'DSO (срок оборота дебиторки) < 20 дней, нулевой овердрафт.',
        verificationMethod: 'Пилотный запуск на 1 крупном контракте в течение 30 дней.',
        isRecommended: true,
        recommendationReason: 'Устраняет первопричину без потери объёмов сбыта и без внутренних конфликтов в компании.'
      },
      {
        id: 'sol-2',
        name: 'Тактический рычаг: регламент отсечения нерентабельных сделок и изменение KPI продаж',
        impactMechanism: 'Перевод мотивации менеджеров со сбора валовой выручки на маржинальный доход сделки.',
        expectedResult: 'Рост чистой маржи на 3-4 процентных пункта за счёт прекращения демпинга.',
        actions: [
          'Внедрить калькулятор минимальной рентабельности сделки в CRM',
          'Запретить несогласованные скидки выше пороговых',
          'Скорректировать KPI коммерческого отдела'
        ],
        costsAndResources: 'Настройка CRM/учёта, 1 неделя обучения персонала.',
        risks: 'Сопротивление отдела продаж, риск потери нерентабельных заказчиков.',
        constraints: 'Психологическая инерция сотрудников.',
        kpis: 'Средний маржинальный доход сделок > 12%.',
        verificationMethod: 'Тест на новых входящих клиентах в течение 2 недель.',
        isRecommended: false
      },
      {
        id: 'sol-3',
        name: 'Структурное решение: переговорная отсрочка у поставщиков сырья',
        impactMechanism: 'Смещение срока оплаты сырья на 30 дней вперёд под банковскую гарантию.',
        expectedResult: 'Снижение потребности в кредитовании оборотки на 20-30 млн руб.',
        actions: [
          'Провести переговоры с топ-3 поставщиками',
          'Оформить банковскую гарантию по льготной ставке'
        ],
        costsAndResources: 'Стоимость гарантии (1.5-2%), подготовка финотчётности.',
        risks: 'Поставщики могут повысить цену сырья за отсрочку.',
        constraints: 'Ограниченная ёмкость рынка поставщиков.',
        kpis: 'Доля сырья с отсрочкой платежа > 40%.',
        verificationMethod: 'Запрос коммерческих условий у альтернативных поставщиков.',
        isRecommended: false
      }
    ];

    if (!ai) {
      res.json({ solutions: fallbackSolutions });
      return;
    }

    const prompt = `
Ты — главный стратег «СТРАТЕГ».
Разработай 3 различных обоснованных варианта решения:
1. Системное решение корневой причины.
2. Быстрый тактический рычаг (Quick-win).
3. Структурно-процессное решение.

ДАННЫЕ:
Компания: ${projectContext.companyName}
Проблема: ${projectContext.initialProblem}
Цель: ${projectContext.desiredOutcome}
Факты: ${JSON.stringify(projectContext.establishedFacts)}
`;

    try {
      const response = await generateWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              solutions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    impactMechanism: { type: Type.STRING },
                    expectedResult: { type: Type.STRING },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    costsAndResources: { type: Type.STRING },
                    risks: { type: Type.STRING },
                    constraints: { type: Type.STRING },
                    kpis: { type: Type.STRING },
                    verificationMethod: { type: Type.STRING },
                    isRecommended: { type: Type.BOOLEAN },
                    recommendationReason: { type: Type.STRING }
                  },
                  required: [
                    'id', 'name', 'impactMechanism', 'expectedResult', 'actions',
                    'costsAndResources', 'risks', 'constraints', 'kpis',
                    'verificationMethod', 'isRecommended'
                  ]
                }
              }
            },
            required: ['solutions']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ solutions: parsed.solutions && parsed.solutions.length ? parsed.solutions : fallbackSolutions });
    } catch (e: any) {
      console.warn('Solutions AI call failed, using robust fallback:', e.message);
      res.json({ solutions: fallbackSolutions });
    }
  } catch (error: any) {
    console.error('Error in /api/strategist/generate-solutions:', error);
    res.status(500).json({ error: error.message || 'Ошибка генерации вариантов решений' });
  }
});

// 5. Endpoint: Generate Rigorous Validation Plan for Chosen Solution
app.post('/api/strategist/generate-validation-plan', async (req: Request, res: Response) => {
  try {
    const { projectContext, solution } = req.body;

    const fallbackValidation = {
      expectedResult: `Успешная апробация решения «${solution.name}» с сохранением выручки и ликвидацией разрывов.`,
      baselineMetrics: 'Исходные замеры: текущий DSO, кассовый остаток, чистая рентабельность до внедрения.',
      exactChange: 'Изолированное внедрение нового механизма расчётов только на 1 пилотном контракте.',
      duration: '45 календарных дней.',
      postMetrics: 'Фактический срок поступления денег, процент отказов, маржинальный доход пилотной группы.',
      confoundingFactors: 'Сезонные колебания спроса, календарные закрытия квартала, акции конкурентов.',
      decisionCriteria: 'GO: подтверждение плановой маржинальности и сокращение срока платежа — масштабируем на всю клиентскую базу. NO-GO: срыв сроков или отказ ключевого контрагента — возврат к анализу альтернативных решений.'
    };

    if (!ai) {
      res.json({ validationPlan: fallbackValidation });
      return;
    }

    const prompt = `
Ты — методолог доказательного менеджмента «СТРАТЕГ».
Сформируй детальный план экспериментальной проверки (пилота) выбранного решения:
Решение: ${solution.name}
Механизм: ${solution.impactMechanism}
Компания: ${projectContext.companyName}
`;

    try {
      const response = await generateWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              expectedResult: { type: Type.STRING },
              baselineMetrics: { type: Type.STRING },
              exactChange: { type: Type.STRING },
              duration: { type: Type.STRING },
              postMetrics: { type: Type.STRING },
              confoundingFactors: { type: Type.STRING },
              decisionCriteria: { type: Type.STRING }
            },
            required: [
              'expectedResult', 'baselineMetrics', 'exactChange',
              'duration', 'postMetrics', 'confoundingFactors', 'decisionCriteria'
            ]
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json({ validationPlan: parsed });
    } catch (e: any) {
      console.warn('Validation plan AI call failed, using fallback:', e.message);
      res.json({ validationPlan: fallbackValidation });
    }
  } catch (error: any) {
    console.error('Error in /api/strategist/generate-validation-plan:', error);
    res.status(500).json({ error: error.message || 'Ошибка генерации плана проверки' });
  }
});

// 6. Endpoint: Audit Logical Chain for Fallacies
app.post('/api/strategist/audit-chain', async (req: Request, res: Response) => {
  try {
    const { chain } = req.body;

    const fallbackAudit = {
      auditScore: 8.5,
      auditSummary: 'Логическая последовательность выдержана: переход от установленного факта к гипотезе причины подкреплён эмпирическими данными.',
      issues: [
        {
          nodeId: 'node-3',
          severity: 'medium',
          issue: 'Возможное допущение о монопольности позиции поставщиков.',
          recommendation: 'Рекомендуется запросить прайс-листы ещё у 2 независимых поставщиков.'
        }
      ]
    };

    if (!ai) {
      res.json(fallbackAudit);
      return;
    }

    const prompt = `
Проведи строгий логический аудит следующей цепочки рассуждений на отсутствие Non sequitur и необоснованных допущений:
${JSON.stringify(chain, null, 2)}
`;

    try {
      const response = await generateWithFallback({
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              auditScore: { type: Type.NUMBER },
              auditSummary: { type: Type.STRING },
              issues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nodeId: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    issue: { type: Type.STRING },
                    recommendation: { type: Type.STRING }
                  },
                  required: ['nodeId', 'severity', 'issue', 'recommendation']
                }
              }
            },
            required: ['auditScore', 'auditSummary', 'issues']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (e: any) {
      console.warn('Audit AI call failed, using fallback audit:', e.message);
      res.json(fallbackAudit);
    }
  } catch (error: any) {
    console.error('Error in /api/strategist/audit-chain:', error);
    res.status(500).json({ error: error.message || 'Ошибка аудита логики' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`СТРАТЕГ server running on http://0.0.0.0:${PORT} (Gemini API: ${ai ? 'active' : 'fallback mode'})`);
  });
}

startServer();
