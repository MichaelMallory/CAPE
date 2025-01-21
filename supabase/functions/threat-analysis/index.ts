import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

interface ThreatAnalysisRequest {
  location: {
    lat: number;
    lng: number;
  };
  incidentType: string;
  threatLevel: 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
  description: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get request data
    const { location, incidentType, threatLevel, description }: ThreatAnalysisRequest = await req.json();

    // Analyze threat pattern
    const threatAnalysis = {
      timestamp: new Date().toISOString(),
      location,
      incidentType,
      threatLevel,
      description,
      riskScore: calculateRiskScore(threatLevel),
      recommendedResponse: generateResponse(threatLevel, incidentType),
      nearbyResources: await findNearbyResources(supabaseClient, location),
    };

    // Store analysis in database
    const { data, error } = await supabaseClient
      .from('threat_analyses')
      .insert(threatAnalysis)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      },
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

// Helper functions
function calculateRiskScore(threatLevel: string): number {
  const scores = {
    'OMEGA': 100,
    'ALPHA': 75,
    'BETA': 50,
    'GAMMA': 25,
  };
  return scores[threatLevel] || 0;
}

function generateResponse(threatLevel: string, incidentType: string): string {
  // Implement response generation logic based on threat level and type
  return `Priority ${threatLevel} response required for ${incidentType} incident.`;
}

async function findNearbyResources(supabase: any, location: { lat: number; lng: number }) {
  // Query nearby heroes and equipment using PostGIS
  const { data } = await supabase
    .rpc('find_nearby_resources', {
      lat: location.lat,
      lng: location.lng,
      radius: 10000 // 10km radius
    });
  
  return data || [];
} 