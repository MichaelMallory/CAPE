import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { LangChainTracer } from 'langchain/callbacks';
import { findSimilarHeroes } from '@/utils/pinecone-client';

export const runtime = 'nodejs';  // Explicitly set to use serverless runtime
export const maxDuration = 60;    // Set max duration to 60 seconds

// Initialize tracer
const tracer = new LangChainTracer({
  projectName: process.env.LANGCHAIN_PROJECT || "cape-hero-assignment"
});

// Initialize OpenAI
const model = new ChatOpenAI({
  modelName: 'gpt-4-turbo-preview',
  temperature: 0,
});

// Priority Assessment Template
const priorityTemplate = PromptTemplate.fromTemplate(`
You are the AI assistant for a superhero support system. Analyze this ticket and determine its priority level.
Consider factors like immediate danger, civilian risk, and scope of threat.

Ticket Title: {title}
Description: {description}

Determine the priority level (OMEGA, ALPHA, BETA, or GAMMA) where:
OMEGA - Global catastrophic threat, extinction-level event, or multiverse crisis
ALPHA - Major city-wide threat, supervillain attack, or mass casualty potential
BETA - Localized incident, property damage, or minor villain activity
GAMMA - Routine patrol, equipment maintenance, or non-emergency support

Return ONLY a valid JSON object with the following structure:
{{
  "level": "PRIORITY_LEVEL",
  "confidence": CONFIDENCE_SCORE_0_TO_1,
  "reasoning": "Brief explanation of priority assessment"
}}
`);

// Objective Generation Template
const objectivesTemplate = PromptTemplate.fromTemplate(`
Based on this support ticket, generate clear mission objectives.
Each objective should be specific, actionable, and measurable.

Ticket Title: {title}
Description: {description}
Priority Level: {priority}

Return ONLY a valid JSON object with the following structure:
{{
  "objectives": [
    {{
      "description": "Clear objective statement",
      "required_powers": ["power1", "power2"],
      "success_criteria": ["criterion1", "criterion2"]
    }}
  ]
}}
`);

// Hero Matching Template
const heroMatchingTemplate = PromptTemplate.fromTemplate(`
Find the most suitable heroes for this mission based on the objectives and required powers.
Heroes don't need to have all powers - rank them based on how well their powers cover the mission needs.
Consider creative ways their powers could be applied to the objectives.

Objectives: {objectives}
Required Powers: {required_powers}

Available Heroes:
{heroes_data}

Return ONLY a valid JSON object with the following structure:
{{
  "hero_matches": [
    {{
      "hero_id": "id",
      "match_score": 0.95,
      "match_reasoning": "Explanation of why this hero is suitable and how their powers can be used creatively",
      "power_coverage": {{
        "direct_matches": ["power1", "power2"],
        "creative_applications": [
          {{
            "hero_power": "power3",
            "can_substitute_for": "required_power",
            "explanation": "How this power can be used creatively"
          }}
        ]
      }}
    }}
  ]
}}
`);

// Helper function to clean model responses
function cleanModelResponse(response: string): string {
  if (!response) {
    throw new Error('Empty response from model');
  }

  // Remove markdown code block syntax if present
  let cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
  
  // If the response starts with a newline, remove it
  cleaned = cleaned.replace(/^\n+/, '');
  
  // If there's any text before the first {, remove it
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace > 0) {
    cleaned = cleaned.slice(firstBrace);
  }
  
  // If there's any text after the last }, remove it
  const lastBrace = cleaned.lastIndexOf('}');
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }

  // Verify we have a valid JSON structure
  if (!cleaned.startsWith('{') || !cleaned.endsWith('}')) {
    throw new Error('Invalid JSON structure in model response');
  }

  return cleaned;
}

interface Hero {
  id: string;
  codename: string;
  powers: string[];
  status: string;
}

interface SimilarHero {
  id: string;
  score: number;
  codename?: string;
  powers?: string[];
}

interface HeroWithScore extends Hero {
  similarity_score: number;
}

export async function POST(request: Request) {
  try {
    console.log('Starting ticket analysis...');
    const { ticketId, title, description } = await request.json();
    console.log('Received request data:', { ticketId, title, description });
    
    // Get Supabase client
    const supabase = createClient(cookies());
    console.log('Supabase client created');

    // Verify environment variables
    const envCheck = {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasPineconeKey: !!process.env.PINECONE_API_KEY,
      hasPineconeIndex: !!process.env.PINECONE_INDEX,
    };
    console.log('Environment variables check:', envCheck);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: true,
        message: 'OpenAI API key is not configured'
      }, { status: 500 });
    }
    if (!process.env.PINECONE_API_KEY) {
      return NextResponse.json({ 
        error: true,
        message: 'Pinecone API key is not configured'
      }, { status: 500 });
    }
    if (!process.env.PINECONE_INDEX) {
      return NextResponse.json({ 
        error: true,
        message: 'Pinecone index is not configured'
      }, { status: 500 });
    }

    // 1. Priority Assessment
    try {
      console.log('Setting up priority assessment chain...');
      const priorityChain = RunnableSequence.from([
        priorityTemplate,
        model,
        new StringOutputParser(),
      ]).withConfig({ 
        tags: ["priority_assessment"],
        callbacks: [tracer]
      });

      console.log('Invoking priority assessment...');
      const priorityResult = await priorityChain.invoke({
        title,
        description,
      });
      console.log('Priority Result (raw):', priorityResult);
      const cleanPriorityResult = cleanModelResponse(priorityResult);
      console.log('Priority Result (cleaned):', cleanPriorityResult);
      
      try {
        console.log('Parsing priority result...');
        const priorityData = JSON.parse(cleanPriorityResult);
        console.log('Priority data parsed successfully:', priorityData);

        // 2. Generate Objectives
        console.log('Setting up objectives chain...');
        const objectivesChain = RunnableSequence.from([
          objectivesTemplate,
          model,
          new StringOutputParser(),
        ]).withConfig({ 
          tags: ["objective_generation"],
          callbacks: [tracer]
        });

        console.log('Invoking objectives generation...');
        const objectivesResult = await objectivesChain.invoke({
          title,
          description,
          priority: priorityData.level,
        });
        console.log('Objectives Result (raw):', objectivesResult);
        const cleanObjectivesResult = cleanModelResponse(objectivesResult);
        console.log('Objectives Result (cleaned):', cleanObjectivesResult);

        try {
          console.log('Parsing objectives result...');
          const objectivesData = JSON.parse(cleanObjectivesResult);
          console.log('Objectives data parsed successfully:', objectivesData);

          // 3. Get available heroes using vector similarity
          const requiredPowers = objectivesData.objectives
            .flatMap((obj: any) => obj.required_powers)
            .filter((power: string, index: number, self: string[]) => self.indexOf(power) === index);

          // Find similar heroes using Pinecone
          const similarHeroes = await findSimilarHeroes(requiredPowers);
          
          // Get full hero details from database for the matched heroes
          let { data: heroes } = await supabase
            .from('profiles')
            .select('id, codename, powers, status')
            .eq('status', 'ACTIVE')
            .eq('role', 'HERO')
            .in('id', similarHeroes.map(h => h.id));

          if (!heroes || heroes.length === 0) {
            // Fallback: If no heroes match, get a small sample of active heroes
            const { data: fallbackHeroes } = await supabase
              .from('profiles')
              .select('id, codename, powers, status')
              .eq('status', 'ACTIVE')
              .eq('role', 'HERO')
              .limit(5);  // Limit to 5 heroes to keep costs down
              
            if (!fallbackHeroes || fallbackHeroes.length === 0) {
              throw new Error('No active heroes found in database');
            }
            
            heroes = fallbackHeroes;
          }

          // Enhance heroes data with similarity scores
          const heroesWithScores: HeroWithScore[] = heroes.map(hero => ({
            ...hero,
            similarity_score: similarHeroes.find(h => h.id === hero.id)?.score || 0
          }));

          console.log('Available Heroes:', heroesWithScores);

          // 4. Match Heroes (now with pre-filtered candidates)
          const heroMatchingChain = RunnableSequence.from([
            heroMatchingTemplate,
            model,
            new StringOutputParser(),
          ]).withConfig({ 
            tags: ["hero_matching"],
            callbacks: [tracer]
          });

          const heroMatchingResult = await heroMatchingChain.invoke({
            objectives: JSON.stringify(objectivesData.objectives),
            required_powers: JSON.stringify(requiredPowers),
            heroes_data: JSON.stringify(heroesWithScores),
          });

          console.log('Hero Matching Result (raw):', heroMatchingResult);
          const cleanHeroMatchingResult = cleanModelResponse(heroMatchingResult);
          console.log('Hero Matching Result (cleaned):', cleanHeroMatchingResult);
          const heroMatches = JSON.parse(cleanHeroMatchingResult);

          // 5. Combine all results
          const analysis = {
            ticket_id: ticketId,
            priority_assessment: priorityData,
            threat_analysis: {
              summary: priorityData.reasoning,
              required_powers: objectivesData.objectives
                .flatMap((obj: any) => obj.required_powers)
                .filter((power: string, index: number, self: string[]) => self.indexOf(power) === index),
              estimated_threat_level: priorityData.confidence
            },
            generated_objectives: objectivesData.objectives,
            hero_matches: heroMatches.hero_matches,
            created_at: new Date().toISOString(),
          };

          // 6. Store analysis in database
          const { error: upsertError } = await supabase
            .from('ai_analyses')
            .upsert([analysis], { onConflict: 'ticket_id' });

          if (upsertError) {
            console.error('Database upsert error:', upsertError);
            throw upsertError;
          }

          return NextResponse.json(analysis);
        } catch (parseError) {
          console.error('Failed to parse objectives result:', parseError);
          console.error('Raw objectives result that failed parsing:', cleanObjectivesResult);
          return NextResponse.json({ 
            error: true,
            message: 'Failed to parse objectives response',
            details: `Invalid objectives format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`
          }, { status: 500 });
        }
      } catch (parseError) {
        console.error('Failed to parse priority result:', parseError);
        console.error('Raw priority result that failed parsing:', cleanPriorityResult);
        return NextResponse.json({ 
          error: true,
          message: 'Failed to parse priority response',
          details: `Invalid priority format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`
        }, { status: 500 });
      }
    } catch (error) {
      console.error('Error in priority/objectives chain:', error);
      return NextResponse.json({ 
        error: true,
        message: 'Chain execution failed',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Top level error in analysis:', error);
    return NextResponse.json({ 
      error: true,
      message: 'Analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 