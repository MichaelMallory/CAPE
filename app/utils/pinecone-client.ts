import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';

// Initialize embeddings
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small', // Newer, cheaper, and faster than ada-002
});

// Helper function to get Pinecone client
function getPineconeClient() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('Missing PINECONE_API_KEY');
  }

  if (!process.env.PINECONE_INDEX) {
    throw new Error('Missing PINECONE_INDEX');
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  return pinecone.index(process.env.PINECONE_INDEX);
}

export interface HeroVector {
  id: string;
  codename: string;
  powers: string[];
  vector: number[];
}

export async function upsertHeroVector(hero: { id: string; codename: string; powers: string[] }) {
  const index = getPineconeClient();
  
  // Create a text representation of the hero's powers
  const powerText = `Hero with powers: ${hero.powers.join(', ')}`;
  
  // Generate embedding for the powers
  const [vector] = await embeddings.embedDocuments([powerText]);
  
  // Upsert to Pinecone
  await index.upsert([{
    id: hero.id,
    values: vector,
    metadata: {
      codename: hero.codename,
      powers: hero.powers,
    },
  }]);
}

export async function findSimilarHeroes(requiredPowers: string[], topK: number = 5) {
  const index = getPineconeClient();
  
  // Create a text representation of the required powers
  const powerText = `Hero with powers: ${requiredPowers.join(', ')}`;
  
  // Generate embedding for the required powers
  const [queryVector] = await embeddings.embedDocuments([powerText]);
  
  // Query Pinecone
  const results = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });
  
  return results.matches?.map(match => ({
    id: match.id,
    score: match.score || 0,
    codename: match.metadata?.codename as string | undefined,
    powers: match.metadata?.powers as string[] | undefined,
  })) || [];
}

// Function to initialize/update all hero vectors
export async function updateAllHeroVectors(heroes: Array<{ id: string; codename: string; powers: string[] }>) {
  // Process in batches to avoid rate limits
  const batchSize = 100;
  for (let i = 0; i < heroes.length; i += batchSize) {
    const batch = heroes.slice(i, i + batchSize);
    await Promise.all(batch.map(hero => upsertHeroVector(hero)));
  }
} 