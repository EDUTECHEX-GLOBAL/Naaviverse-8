// seeds/seed_generated_programs.js
/**
 * Seed script: generate a single program + description for each university
 * - Adds result to each document under `generatedProgram` field
 * - Skips docs that already have generatedProgram (idempotent-ish)
 *
 * Usage:
 *   node seeds/seed_generated_programs.js
 *
 * IMPORTANT:
 * - Ensure OPENAI_API_KEY and DATABASE_URI are in your .env
 * - Be aware of API usage/cost
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Universities = require('../models/universities.model'); // adjust path if needed
const { default: OpenAI } = require('openai'); // depends on your openai package version

const DATABASE_URI = process.env.DATABASE_URI || process.env.DATABASE_URL;
if (!DATABASE_URI) {
  console.error('Missing DATABASE_URI in .env');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in .env');
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateProgramSafe(universityName) {
  const prompt = `
Generate ONE realistic academic program for the university "${universityName}".
Return a JSON object only (no markdown fences), with exactly two keys:
{
  "program": "Program name",
  "description": "One to two sentence marketing-friendly description."
}
If uncertain, return a generic fallback program.
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const raw = response.choices?.[0]?.message?.content || '';
    const cleaned = String(raw).trim()
      .replace(/```(json)?/gi, '')
      .replace(/^`+|`+$/g, '')
      .trim();

    // try parse directly
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // fallback: extract first JSON object
      const first = cleaned.indexOf('{');
      const last = cleaned.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        const substr = cleaned.substring(first, last + 1);
        try {
          return JSON.parse(substr);
        } catch (e2) { /* continue to regex fallback */ }
      }

      // fallback: regex extraction
      const progMatch = cleaned.match(/"program"\s*:\s*"([^"]+)"|program\s*:\s*"([^"]+)"/i);
      const descMatch = cleaned.match(/"description"\s*:\s*"([^"]+)"|description\s*:\s*"([^"]+)"/i);
      const program = progMatch ? (progMatch[1] || progMatch[2]) : null;
      const description = descMatch ? (descMatch[1] || descMatch[2]) : null;

      return {
        program: program || 'Program Not Available',
        description: description || 'Program description unavailable.',
      };
    }
  } catch (err) {
    console.error('AI error:', err?.message || err);
    return {
      program: 'Program Not Available',
      description: 'AI generation failed.',
    };
  }
}

async function main() {
  try {
    await mongoose.connect(DATABASE_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Select docs you want to update. Customize filter as needed:
    // e.g. { country: "United States" } or all docs.
    const filter = {}; // empty = all
    const universities = await Universities.find(filter).lean();

    console.log(`Found ${universities.length} universities. Starting generation...`);

    let count = 0;
    for (const uni of universities) {
      // skip if already has generatedProgram
      if (uni.generatedProgram && uni.generatedProgram.program) {
        console.log(`Skipping (already generated): ${uni.name}`);
        continue;
      }

      console.log(`Generating for: ${uni.name}`);
      const ai = await generateProgramSafe(uni.name);
      const payload = {
        generatedProgram: {
          program: ai.program || 'Program Not Available',
          description: ai.description || 'No description available',
          generatedAt: new Date(),
        },
      };

      try {
        await Universities.updateOne({ _id: uni._id }, { $set: payload });
        console.log(`Saved generated program for: ${uni.name}`);
        count++;
      } catch (err) {
        console.error(`DB update error for ${uni.name}:`, err.message || err);
      }

      // wait to avoid rate limits / cost spikes (tweak as needed)
      await wait(1000);
    }

    console.log(`✅ Done. Generated/updated ${count} universities.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeder error:', err);
    process.exit(1);
  }
}

main();
