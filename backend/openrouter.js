const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

async function callOpenRouter(messages) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function solveMath(expression) {
  const messages = [
    {
      role: "system",
      content:
        "You are a math solver. Solve the given math expression and return ONLY the final numerical answer. No explanation, no steps, just the number.",
    },
    {
      role: "user",
      content: `Solve: ${expression}`,
    },
  ];

  return callOpenRouter(messages);
}

async function solveImageMath(base64Image) {
  const messages = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Identify the math expression in this drawing, solve it, and return ONLY the numerical answer. No other text.",
        },
        {
          type: "image_url",
          image_url: {
            url: base64Image,
          },
        },
      ],
    },
  ];

  return callOpenRouter(messages);
}

async function getTopicSuggestions(topic) {
  const messages = [
    {
      role: "system",
      content: `You are an educational diagram assistant. Given a topic, suggest exactly 3 educational diagrams that would help students understand the topic. Return ONLY a JSON array of 3 objects, each with "title" and "description" fields. No markdown, no code fences, just the raw JSON array.`,
    },
    {
      role: "user",
      content: `Topic: ${topic}`,
    },
  ];

  const raw = await callOpenRouter(messages);

  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned);
}

module.exports = { solveMath, getTopicSuggestions, solveImageMath };
