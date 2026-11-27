import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

// Load Firebase public web config (apiKey is used strictly with Identity Toolkit accounts:lookup to verify ID tokens)
let firebaseApiKey = '';
try {
  const cfgPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(cfgPath)) {
    const raw = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
    firebaseApiKey = typeof raw.apiKey === 'string' ? raw.apiKey : '';
  }
} catch (err) {
  console.error('Could not read firebase-applet-config.json:', err);
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function verifyFirebaseBearerToken(authHeader: string | undefined): Promise<{ uid: string; email?: string } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.slice(7).trim();
  if (!idToken || !firebaseApiKey) {
    return null;
  }
  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!resp.ok) return null;
    const data = (await resp.json()) as { users?: Array<{ localId?: string; email?: string }> };
    const user = data.users?.[0];
    if (!user?.localId) return null;
    return { uid: user.localId, email: user.email };
  } catch {
    return null;
  }
}

const SYSTEM_INSTRUCTION = `You are the SENSURY HOME AI Construction Guide — a warm, clear, trustworthy residential building advisor built for first-time home builders and families in Tamil Nadu and across India.
Tagline of SENSURY HOME: "Home is where Mom is."

Core rules you MUST follow in every response:
1. Language & Tone:
   - Explain technical construction terms (like PCC, RCC, M20, TMT Fe550D, FSI, Patta, Chitta, FMB, CMDA, DTCP, curing, centering) in plain, everyday language that someone with zero construction background can understand.
   - If the user asks in Tamil or selects Tamil ('ta'), reply clearly in natural, respectful Tamil (தமிழ்) using simple construction vocabulary (and English technical terms in brackets where helpful). If 'bilingual', explain in clear English with key Tamil terms.
2. Context & Missing Information:
   - Always inspect the provided active project context (location, district, plot dimensions/area, plot approval type, budget, floors, bedrooms, current stage).
   - If critical information is missing for their question (for example: soil type, district/corporation vs panchayat jurisdiction, built-up area, finish grade, or whether plot approval is DTCP/CMDA), explicitly point out what is missing and ask 2-3 concise follow-up questions.
3. Truthfulness & Safety:
   - NEVER invent exact brand prices, fake test reports, fake certificate numbers, or guaranteed contractor rates. Always frame cost numbers as preliminary indicative ranges for Tamil Nadu and explain what factors change them.
   - Highlight potential budget risks (e.g., foundation depth in clayey soil, plinth height near roads/lakes, finishing/interior creep, compound wall & borewell/EB exclusions).
   - For structural design, soil bearing capacity, steel reinforcement sizing, legal title verification, and statutory approvals (CMDA/DTCP/Local Body), ALWAYS clearly recommend consulting a qualified Civil/Structural Engineer, Licensed Architect, or Property Advocate.
4. Structure:
   - Use short scannable headings or numbered steps. Keep answers practical and grounded.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'SENSURY HOME API' });
  });

  // AI Home-Building Assistant chat endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const verifiedUser = await verifyFirebaseBearerToken(req.headers.authorization);
      if (!verifiedUser) {
        return res.status(401).json({ error: 'Please sign in with your verified account to use the AI assistant.' });
      }

      const { message, history, language, projectContext } = req.body as {
        message?: string;
        history?: Array<{ role: string; text: string }>;
        language?: 'en' | 'ta' | 'bilingual';
        projectContext?: Record<string, unknown> | null;
      };

      if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 4000) {
        return res.status(400).json({ error: 'Please provide a valid question under 4000 characters.' });
      }

      const ai = getAiClient();
      const langDirective =
        language === 'ta'
          ? 'Respond primarily in natural Tamil (தமிழ்), keeping essential Indian construction terms clear.'
          : language === 'bilingual'
          ? 'Respond in clear English and include helpful Tamil (தமிழ்) translations for key construction and document terms.'
          : 'Respond in clear, simple English suited for Indian homeowners.';

      const contextBlock = projectContext
        ? `Active User Project Context:\n${JSON.stringify(projectContext, null, 2)}`
        : 'Active User Project Context: None saved yet. Remind the homeowner gently if project details (district, plot area, budget, floors) would make the answer more accurate.';

      const trimmedHistory = Array.isArray(history)
        ? history
            .slice(-10)
            .filter((h) => h && typeof h.text === 'string' && (h.role === 'user' || h.role === 'model'))
            .map((h) => `${h.role === 'user' ? 'Homeowner' : 'SENSURY Guide'}: ${h.text.slice(0, 1500)}`)
            .join('\n\n')
        : '';

      const prompt = `${langDirective}\n\n${contextBlock}\n\n${
        trimmedHistory ? `Recent Conversation:\n${trimmedHistory}\n\n` : ''
      }Current Homeowner Question:\n${message.trim()}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const reply = (response.text ?? '').trim();
      if (!reply) {
        return res.status(502).json({ error: 'The assistant returned an empty response. Please try again.' });
      }

      res.json({ reply });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unexpected server error';
      console.error('AI Chat Error:', errMsg);
      res.status(500).json({ error: errMsg });
    }
  });

  // AI Preliminary Home-Planning Summary endpoint
  app.post('/api/ai/plan-summary', async (req, res) => {
    try {
      const verifiedUser = await verifyFirebaseBearerToken(req.headers.authorization);
      if (!verifiedUser) {
        return res.status(401).json({ error: 'Please sign in to generate an AI planning brief.' });
      }

      const { project } = req.body as { project?: Record<string, unknown> };
      if (!project || typeof project !== 'object') {
        return res.status(400).json({ error: 'Project details are required.' });
      }

      const ai = getAiClient();
      const prompt = `Prepare a preliminary, easy-to-understand home-planning brief for a family in Tamil Nadu based on these inputs:
${JSON.stringify(project, null, 2)}

Include:
1. Plot & Built-up Feasibility Check (mention setbacks & FSI awareness under Tamil Nadu Combined Development and Building Rules, without claiming formal municipal approval).
2. Indicative Budget Reality Check (compare totalBudgetInr against estimated built-up cost and flag common hidden costs: borewell/sump, compound wall, EB/metro water connection, plan approval fees, interior woodwork).
3. Recommended Room & Utility Priorities (ventilation, cross-breeze, kitchen wet/dry separation, rainwater harvesting).
4. Next 3 Immediate Action Steps before hiring or breaking ground.
5. Clear note recommending a licensed Architect and Civil/Structural Engineer to verify soil bearing capacity, setbacks, and structural drawings.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      res.json({ summary: (response.text ?? '').trim() });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unable to generate planning summary.';
      console.error('AI Plan Summary Error:', errMsg);
      res.status(500).json({ error: errMsg });
    }
  });

  // AI Material Explanation endpoint
  app.post('/api/ai/explain-material', async (req, res) => {
    try {
      const verifiedUser = await verifyFirebaseBearerToken(req.headers.authorization);
      if (!verifiedUser) {
        return res.status(401).json({ error: 'Please sign in to request an AI material explanation.' });
      }

      const { materialName, category, question, language } = req.body as {
        materialName?: string;
        category?: string;
        question?: string;
        language?: 'en' | 'ta' | 'bilingual';
      };

      if (!materialName || typeof materialName !== 'string') {
        return res.status(400).json({ error: 'Material name is required.' });
      }

      const ai = getAiClient();
      const langNote = language === 'ta' ? 'Explain in simple Tamil (தமிழ்).' : 'Explain in simple English for a first-time homeowner.';
      const prompt = `${langNote}
Topic: ${materialName} (Category: ${category || 'Construction Material'}).
${question ? `Specific question: ${question.slice(0, 500)}` : 'Explain in simple words: (a) what this material does in a house, (b) how a homeowner can check basic quality on site, (c) common mistakes to avoid, and (d) what to verify with the Civil Engineer.'}
Clearly note that this is general educational guidance and site specifications must follow the structural engineer's drawing.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      res.json({ explanation: (response.text ?? '').trim() });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unable to generate explanation.';
      console.error('AI Material Explain Error:', errMsg);
      res.status(500).json({ error: errMsg });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SENSURY HOME server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SENSURY HOME server:', err);
  process.exit(1);
});
