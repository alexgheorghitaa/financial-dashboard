import "server-only";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a sharp, supportive personal-finance coach who writes one short DAILY tip for a single account in a budgeting app.

You receive three blocks:
- SNAPSHOT: the user's real, current numbers. This is the ONLY source of truth — never invent or contradict a number.
- MEMORY: a compact running summary of previous days (advice given, the user's trajectory). May be empty on day one.
- PREVIOUS_TIP: yesterday's tip text. May be empty.

Write today's tip in 3 to 4 short, complete sentences, each ending with a period. Open with the single most important observation grounded in the SNAPSHOT numbers, then give one or two concrete, realistic actions that reference the user's actual categories and amounts. Build on MEMORY and do NOT repeat PREVIOUS_TIP; acknowledge visible progress or slippage. Be warm, direct and honest. If the data is sparse or the account is empty, encourage them and say exactly what to start tracking. Plain text only: no markdown, no bullet symbols, no quotes.

Then write an updated MEMORY: fold today into the previous memory, keep it UNDER 60 words, and drop the least useful old detail so it never grows unbounded. MEMORY is for narrative continuity only.

Format your ENTIRE response exactly like this, with each label on its own line and nothing before or after:
TIP: <today's tip>
MEMORY: <updated memory>`;

export async function generateDailyTip(input: {
  snapshot: string;
  memory: string;
  previousTip: string;
}): Promise<{ tip: string; memory: string }> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set in .env.");

  const userContent =
    `SNAPSHOT:\n${input.snapshot}\n\n` +
    `MEMORY:\n${input.memory || "(none yet — this is the first tip)"}\n\n` +
    `PREVIOUS_TIP:\n${input.previousTip || "(none yet)"}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.55,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
      signal: controller.signal,
    });
  } catch (e) {
    throw new Error(e instanceof Error && e.name === "AbortError" ? "Groq timed out." : "Could not reach Groq.");
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq error ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const content: string | undefined = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response.");

  const tip = (content.match(/TIP:\s*([\s\S]*?)\s*MEMORY:/i)?.[1] ?? content.replace(/MEMORY:[\s\S]*$/i, "")).trim();
  const memory = content.match(/MEMORY:\s*([\s\S]*)$/i)?.[1]?.trim() ?? "";
  if (!tip) throw new Error("Groq returned no tip.");
  return { tip, memory };
}
