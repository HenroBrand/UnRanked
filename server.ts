import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared server-side Gemini client with required User-Agent
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

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// 1. Generate standard or high-thinking game round
app.post('/api/generate-round', async (req, res) => {
  try {
    const { category, customPrompt, highThinking, avoidItems = [] } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API is not configured on the server.' });
    }

    const modelName = highThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash';
    const config: any = {
      systemInstruction: `You are the creative brain behind the party game "UnRanked: Order of Chaos".
You create absurd, funny, deeply relatable or scandalous ranking dilemmas where friends must secretly rank 4 items from 1 (best/most acceptable) to 4 (worst/absolute crime).
Rules:
1. Exactly four distinct items labeled A, B, C, D.
2. Each item must be concise (title 2-4 words, description 1 sentence).
3. The items must be reasonably comparable in absurdity/severity so players will genuinely disagree.
4. Scale labels: rank_1 (most acceptable) and rank_4 (least acceptable).
5. A witty 1-2 sentence host introduction commentary.
6. Icon suggestion for each item: a single vibrant emoji.
7. Return strictly valid JSON conforming to the schema.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          prompt: { type: Type.STRING },
          scale_labels: {
            type: Type.OBJECT,
            properties: {
              rank_1: { type: Type.STRING },
              rank_4: { type: Type.STRING },
            },
            required: ['rank_1', 'rank_4'],
          },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                icon_suggestion: { type: Type.STRING },
              },
              required: ['id', 'title', 'description', 'icon_suggestion'],
            },
          },
          host_commentary: { type: Type.STRING },
        },
        required: ['category', 'prompt', 'scale_labels', 'items', 'host_commentary'],
      },
    };

    if (highThinking) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const userPrompt = `Generate a fresh 4-item round for Category: "${category || 'Everyday Food Crimes'}".
${customPrompt ? `Specific theme note: ${customPrompt}` : ''}
${avoidItems.length > 0 ? `Avoid repeating previous concepts: ${avoidItems.join(', ')}` : ''}
Make it funny, nuanced, and provocative without any offensive or NSFW content.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config,
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.items || parsed.items.length !== 4) {
      throw new Error('Model did not return exactly 4 items.');
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating round:', error);
    res.status(500).json({ error: error.message || 'Failed to generate round' });
  }
});

// 2. Google Search Grounded Round (Uses gemini-3.5-flash with googleSearch tool)
app.post('/api/search-grounded-round', async (req, res) => {
  try {
    const { queryTopic } = req.body;
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured.' });
    }

    const promptText = `Find current real-world trends, modern debates, viral food trends, workplace controversies, or recent internet events related to "${queryTopic || 'modern tech habits'}".
Based on accurate search findings, construct a funny 4-item party game round for "UnRanked".
Format strictly as JSON with:
{
  "category": "Current Trends & Controversies",
  "prompt": "Rank these real modern situations from most tolerable to absolute criminal behavior",
  "scale_labels": { "rank_1": "1. Totally Fine", "rank_4": "4. Social Crime" },
  "items": [
    {"id": "A", "title": "...", "description": "...", "icon_suggestion": "..."},
    {"id": "B", "title": "...", "description": "...", "icon_suggestion": "..."},
    {"id": "C", "title": "...", "description": "...", "icon_suggestion": "..."},
    {"id": "D", "title": "...", "description": "...", "icon_suggestion": "..."}
  ],
  "host_commentary": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

    res.json(parsed);
  } catch (error: any) {
    console.error('Error with search grounded round:', error);
    res.status(500).json({ error: error.message || 'Failed search grounding' });
  }
});

// 3. Low-Latency Host Roasts & Commentary (Using gemini-3.1-flash-lite)
app.post('/api/host-roast', async (req, res) => {
  try {
    const { scenario, playerRankings, category } = req.body;
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured.' });
    }

    const prompt = `You are "Archibald Sprocket", the eccentric, dramatic AI host of the party game "UnRanked".
You just witnessed the secret rankings of players for category "${category}".
Here are the revealed rankings:
${JSON.stringify(playerRankings, null, 2)}
Scenario: "${scenario}"

Deliver exactly 1-2 punchy, hilarious, playful sentences roasting the most shocking disagreement or someone's unhinged rank 1 or rank 4 choice.
Never be mean or hateful. Be witty and eccentric like a British television game-show host.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'You are a comically serious game show host who gives fast, punchy 1-2 sentence roasts.',
      },
    });

    res.json({ roast: response.text?.trim() || 'A truly alarming display of human decision making.' });
  } catch (error: any) {
    console.error('Error generating roast:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Multi-turn Chat with AI Host (Maintaining conversation history)
app.post('/api/chat-host', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured.' });
    }

    const formattedContents = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: `You are Archibald Sprocket, the flamboyant, witty game show host of "UnRanked: Order of Chaos".
You wear a velvet coat, have an obsession with petty debates (is cereal soup? is a thumb a finger?), and referee player arguments with pompous humor and mock-philosophical authority.
Keep responses concise (2-4 sentences max), charismatic, and funny.`,
      },
    });

    res.json({ reply: response.text?.trim() || 'The chaos demands contemplation!' });
  } catch (error: any) {
    console.error('Error in host chat:', error);
    res.status(500).json({ error: error.message });
  }
});



// 6. Generate Music using Lyria (lyria-3-clip-preview for 30s clips, lyria-3-pro-preview for tracks)
app.post('/api/generate-music', async (req, res) => {
  try {
    const { prompt = 'Upbeat playful quirky party game show intro theme with slide whistle and brass', fullTrack = false } = req.body;
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured.' });
    }

    const modelName = fullTrack ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';
    const response = await ai.models.generateContentStream({
      model: modelName,
      contents: prompt,
    });

    let audioBase64 = '';
    let mimeType = 'audio/wav';

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
      }
    }

    if (!audioBase64) {
      return res.status(500).json({ error: 'No audio data received from music model.' });
    }

    res.json({ audioBase64, mimeType });
  } catch (error: any) {
    console.error('Music generation error:', error);
    res.status(500).json({ error: error.message || 'Music generation failed' });
  }
});

// 7. Generate High-Quality Images (gemini-3-pro-image-preview with aspect ratio & 1K/2K/4K)
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      imageSize = '1K',
    } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API not configured.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `Surreal indie game illustrated party card, warm paper grain, ink outlines, playful quirky aesthetic: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any,
        },
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image generated in model response.' });
    }

    res.json({ imageUrl });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: error.message || 'Image generation failed' });
  }
});

// Client-side Vite integration in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`UnRanked game server running on http://localhost:${PORT}`);
  });
}

startServer();
