const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { studentName, challenges, description } = await req.json();
    if (!studentName || !Array.isArray(challenges) || challenges.length === 0) {
      return new Response(JSON.stringify({ error: "studentName and at least one challenge are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const prompt = `You are an experienced K-10 educational interventionist. Create a personalized, practical intervention plan for a student.

Student: ${studentName}
Learning challenges: ${challenges.join(", ")}
Additional context: ${description || "None provided"}

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "goals": ["3 short, measurable goals as strings"],
  "behaviorism": ["3 concrete behaviorism strategies (rewards, reinforcement, routines)"],
  "cognitive": ["3 cognitive strategies (chunking, scaffolds, metacognition)"],
  "constructivism": ["3 constructivist strategies (hands-on, real-world, peer learning)"]
}

Each strategy should be one clear sentence the teacher can act on tomorrow.`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800, responseMimeType: "application/json" },
        }),
      }
    );

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gemini error:", resp.status, t);
      return new Response(JSON.stringify({ error: "Gemini request failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "{}";
    let plan;
    try { plan = JSON.parse(text); }
    catch {
      // Strip code fences if model added them
      const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
      plan = JSON.parse(cleaned);
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("intervention-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
