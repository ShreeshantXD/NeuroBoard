const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/auto"; // High-availability Free Vision Model

async function callOpenRouter(messages) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === "your_api_key_here") {
    throw new Error("Missing OPENROUTER_API_KEY. Please set it in backend/.env!");
  }

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
      role: "system",
      content: `Identify all math expressions in the drawing.

IMPORTANT RULES:
- If the symbol 'π' (pi) is detected, treat it as the constant value 3.1416
- If π appears inside an expression, replace it before solving
- Examples:
  π = → answer should be 3.1416
  2π = → answer should be 6.2832
  π + π = → answer should be 6.2832

- Always compute the final numerical result after replacing π

For each expression ending with '=', solve it.

Return a JSON array of objects with:
- "expr": the full expression (e.g., "2π=")
- "ans": the numerical result (e.g., "6.2832")
- "x": horizontal percentage (0 to 100) where answer should be placed
- "y": vertical percentage (0 to 100) aligned with expression
- "angle": angle of the expression in degrees

VERY IMPORTANT:
- Return ONLY valid JSON array
- No markdown, no explanation`
    },
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: {
            url: base64Image,
          },
        },
      ],
    },
  ];

  const result = await callOpenRouter(messages);
  
  try {
    // 1. Cleanup raw AI text heavily
    let cleaned = result.trim();
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // Find outermost JSON structure (array or object)
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');

    // Get the earliest opening character
    let firstIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) firstIdx = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) firstIdx = firstBrace;
    else if (firstBracket !== -1) firstIdx = firstBracket;

    // Get the latest closing character
    let lastIdx = -1;
    if (lastBrace !== -1 && lastBracket !== -1) lastIdx = Math.max(lastBrace, lastBracket);
    else if (lastBrace !== -1) lastIdx = lastBrace;
    else if (lastBracket !== -1) lastIdx = lastBracket;

    if (firstIdx !== -1 && lastIdx !== -1 && lastIdx >= firstIdx) {
      cleaned = cleaned.substring(firstIdx, lastIdx + 1);
    }
    
    console.log("[AI Image response] Raw:", result);
    console.log("[AI Image response] Cleaned:", cleaned);
    
    const parsed = JSON.parse(cleaned);
    
    // Format 1: New Prompt -> Array of { expr, ans, x, y, angle }
    if (Array.isArray(parsed)) {
      return parsed.map(item => ({
        expr: item.expr || item.expression || "",
        ans: item.ans !== undefined ? item.ans : item.result
      })).filter(item => item.ans !== undefined);
    }

    // Format 2: Model returned a single naked object instead of an Array
    if (parsed && !Array.isArray(parsed) && (parsed.ans !== undefined || parsed.result !== undefined)) {
      return [{
        expr: parsed.expr || parsed.expression || "",
        ans: parsed.ans !== undefined ? parsed.ans : parsed.result
      }];
    }
    
    // Format 3: Old Prompt fallback -> { expressions: [ { expression, result } ] }
    if (parsed && Array.isArray(parsed.expressions)) {
      return parsed.expressions.map(item => ({
        expr: item.expression || item.expr || "",
        ans: item.result !== undefined ? item.result : item.ans
      })).filter(item => item.ans !== undefined);
    }
    
    return [];
  } catch (e) {
    console.error("AI JSON parsing failed:", e.message);
    console.error("AI Response was:", result);
    
    // 2. Fallback: naive text parsing if the AI stubbornly returned text
    // We split by lines, extract math-looking parts, normalize, and evaluate safely.
    const fallbackResults = [];
    const lines = result.split('\n');
    
    // Minimal safe evaluator for Node.js backend
    const evaluateMath = (expr) => {
      try {
        // Normalize symbols and implicit multiplication
        let clean = expr
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/–/g, '-')
          .replace(/−/g, '-')
          .replace(/\s+/g, '');
        
        // 2(3) -> 2*(3)
        clean = clean.replace(/(\d)(\()/g, '$1*$2');
        // (2)(3) -> (2)*(3)
        clean = clean.replace(/(\))(\()/g, '$1*$2');
        
        // Only allow math chars safely
        if (/[^0-9+\-*/().]/.test(clean)) return null;
        
        // Safe Function eval
        const val = new Function(`return ${clean}`)();
        return isFinite(val) ? val : null;
      } catch {
        return null;
      }
    };

    for (const line of lines) {
      // Find anything that looks like an expression optionally ending with =
      const match = line.match(/([0-9()+\-*/.,x×÷–−\s]+)=/i) || line.match(/([0-9()+\-*/.,x×÷–−\s]{3,})/i);
      if (match) {
        let rawExpr = match[1].trim();
        if (!rawExpr) continue;
        
        const ans = evaluateMath(rawExpr);
        if (ans !== null && ans !== undefined) {
          fallbackResults.push({
            expr: rawExpr + "=",
            ans: ans
          });
        }
      }
    }
    
    if (fallbackResults.length > 0) {
      console.log("[AI Image response] Recovered using local fallback parser:", fallbackResults);
      return fallbackResults;
    }

    return []; // Safe empty array so frontend doesn't crash
  }
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
