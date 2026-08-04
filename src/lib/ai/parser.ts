import { prisma } from "@/lib/db";

interface AIConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface ParsedContent {
  notes: string[];
  tasks: Array<{
    title: string;
    description?: string;
    priority?: "high" | "medium" | "low";
    dueDate?: string;
    tags?: string[];
  }>;
  achievements: Array<{
    title: string;
    result?: string;
    category?: string;
  }>;
}

export async function getAIConfig(userId: string): Promise<AIConfig | null> {
  const settings = await prisma.setting.findMany({
    where: {
      userId,
      key: {
        in: ["ai_api_key", "ai_base_url", "ai_model"],
      },
    },
  });

  const configMap: Record<string, string> = {};
  settings.forEach((s) => {
    configMap[s.key] = s.value;
  });

  if (!configMap.ai_api_key) return null;

  return {
    apiKey: configMap.ai_api_key,
    baseUrl: configMap.ai_base_url || "https://api.openai.com/v1",
    model: configMap.ai_model || "gpt-3.5-turbo",
  };
}

export async function parseContentWithAI(
  userId: string,
  rawContent: string
): Promise<ParsedContent | null> {
  const config = await getAIConfig(userId);
  if (!config) return null;

  const prompt = `
你是一个工作内容解析助手，请将我提供的当日工作内容文本解析为结构化数据，严格按照JSON格式返回，不要返回任何其他内容。

JSON Schema:
{
  "notes": ["string"], // 工作总结、思考、记录类内容
  "tasks": [ // 需要后续跟进/待办的任务
    {
      "title": "string", // 任务标题，简短明确
      "description": "string", // 任务详情
      "priority": "high" | "medium" | "low", // 优先级：高/中/低，根据紧急程度判断
      "dueDate": "YYYY-MM-DD", // 截止日期，没有则不填
      "tags": ["string"] // 标签，自动分类，如：会议/开发/沟通/文档/学习等
    }
  ],
  "achievements": [ // 已经完成的工作成果
    {
      "title": "string", // 成果标题
      "result": "string", // 成果描述
      "category": "string" // 分类：分析报告/项目推进/流程优化/团队协作/技术突破/其他
    }
  ]
}

要求：
1. 严格按照JSON格式返回，不要加任何解释、markdown标记
2. 内容分类要准确，已经完成的放achievements，待办的放tasks，记录类放notes
3. 优先级自动判断，紧急重要的为high，普通的为medium，不重要的为low
4. 标签和分类从提供的选项中选择，不要自定义
5. 如果内容完全不相关，返回 {"notes": [], "tasks": [], "achievements": []}

待解析内容：
${rawContent}
`;

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI parse error:", error);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    };
  } catch (e) {
    console.error("AI parse failed:", e);
    return null;
  }
}
