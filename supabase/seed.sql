-- First create all the auth users for our heroes
WITH hero_users AS (
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  SELECT 
    uuid_generate_v4(),
    lower(replace(codename, ' ', '.') || '@heroes.cape.org'),  -- Create email from codename
    crypt('HeroPass123!', gen_salt('bf')),                     -- Default password
    now(),                                                      -- Email confirmed
    '{"provider":"email","providers":["email"]}'::jsonb,        -- App metadata
    jsonb_build_object(                                         -- User metadata
      'codename', codename,
      'real_name', real_name,
      'role', 'HERO'
    ),
    now(),
    now()
  FROM (VALUES
    ('Reality Weaver', 'Maya Cosmos'),
    ('Probability Prime', 'Lucas Chance'),
    ('Void Dancer', 'Nina Black'),
    ('Quantum Flux', 'David Wave'),
    ('Meme Queen', 'Sarah Viral'),
    ('Dream Walker', 'Morpheus Sleep'),
    ('Bio Sculptor', 'Gene Splice'),
    ('Swarm Lord', 'Buzz Colony'),
    ('Data Stream', 'Binary Flow'),
    ('Nano Queen', 'Grey Goo'),
    ('Plasma Storm', 'Aurora Blaze'),
    ('Zero Point', 'Kelvin Frost'),
    ('Karma Balance', 'Justice Scale'),
    ('Echo Memory', 'Historia Past'),
    ('Emotion Lord', 'Pathos Feel'),
    ('Mind Architect', 'Psyche Build'),
    ('Frequency', 'Sonic Wave'),
    ('Bass Drop', 'Low Frequency'),
    ('Prism Master', 'Roy Rainbow'),
    ('Void Shadow', 'Umbra Dark'),
    ('Chaos Theory', 'Murphy Law'),
    ('Paradox', 'Logic Break'),
    ('Power Prism', 'Alex Mirror'),
    ('Null Field', 'Void Walker'),
    ('Evolution', 'Darwin Prime'),
    ('Power Forge', 'Smith Ability'),
    ('String Theory', 'Vibra Chord'),
    ('Dark Flow', 'Umbra Current'),
    ('Antimatter', 'Nova Void'),
    ('Quark Storm', 'Hadron Flux'),
    ('Higgs Field', 'Mass Master'),
    ('Quantum Lock', 'State Freeze'),
    ('Exotic Matter', 'Strange Substance'),
    ('Dimension Weaver', 'Fold Space'),
    ('Tachyon Burst', 'Faster Light'),
    ('Vacuum State', 'Empty Space'),
    ('Brane Surfer', 'Membrane Rider'),
    ('Force Unifier', 'Unity Field'),
    ('Math Bender', 'Euler Prime'),
    ('Logic Gate', 'Alan Boolean'),
    ('Data Weaver', 'Bit Stream'),
    ('Quantum Coder', 'Q Bit'),
    ('Metaphor', 'Allegory Smith'),
    ('Story Weaver', 'Narrative Flow'),
    ('Butterfly Effect', 'Chaos Wing'),
    ('Random Access', 'Dice Roller'),
    ('Schrödinger', 'Cat State'),
    ('Meta Script', 'Author Prime'),
    ('Babel', 'Lingua Code'),
    ('True Name', 'Word Smith')
  ) AS heroes(codename, real_name)
  RETURNING id, raw_user_meta_data->>'codename' as codename
)
-- Now create the hero profiles linked to the users
INSERT INTO public.profiles (
  id,  -- Use the user id as profile id
  role, 
  codename, 
  real_name, 
  powers, 
  clearance_level, 
  team_affiliations, 
  hero_equipment, 
  status, 
  hero_metadata
)
SELECT 
  u.id,  -- Link to auth.users id
  'HERO',
  h.codename,
  h.real_name,
  h.powers,
  h.clearance_level,
  h.team_affiliations,
  h.hero_equipment,
  'ACTIVE',
  h.hero_metadata
FROM (
  VALUES
    -- Cosmic/Reality Warpers
    ('Reality Weaver', 'Maya Cosmos', 
     ARRAY['reality manipulation', 'dimensional crafting', 'universal awareness', 'cosmic restructuring'],
     5, ARRAY['Reality Corps'], ARRAY['reality anchor', 'dimensional compass'],
     jsonb_build_object('specialty', 'reality threats', 'experience_years', 1000)),
    
    ('Probability Prime', 'Lucas Chance',
     ARRAY['probability manipulation', 'quantum state control', 'timeline splitting', 'luck field generation'],
     5, ARRAY['Quantum Division'], ARRAY['probability calculator', 'quantum stabilizer'],
     jsonb_build_object('specialty', 'probability anomalies', 'experience_years', 15)),

    -- Exotic Energy Manipulators
    ('Void Dancer', 'Nina Black',
     ARRAY['dark energy control', 'gravity manipulation', 'space folding', 'void walking'],
     5, ARRAY['Cosmic Guard'], ARRAY['void compass', 'gravity boots'],
     jsonb_build_object('specialty', 'space-time anomalies', 'experience_years', 20)),

    ('Quantum Flux', 'David Wave',
     ARRAY['quantum superposition', 'wave function collapse', 'quantum tunneling', 'entanglement control'],
     4, ARRAY['Quantum Corps'], ARRAY['quantum computer', 'wave function analyzer'],
     jsonb_build_object('specialty', 'quantum threats', 'experience_years', 8)),

    -- Conceptual Powers
    ('Meme Queen', 'Sarah Viral',
     ARRAY['meme manipulation', 'viral idea control', 'social engineering', 'trend mastery'],
     4, ARRAY['Digital Division'], ARRAY['meme generator', 'trend analyzer'],
     jsonb_build_object('specialty', 'social threats', 'experience_years', 5)),

    ('Dream Walker', 'Morpheus Sleep',
     ARRAY['dream manipulation', 'nightmare projection', 'sleep control', 'subconscious diving'],
     4, ARRAY['Psychic Division'], ARRAY['dream catcher', 'sleep inducer'],
     jsonb_build_object('specialty', 'psychological threats', 'experience_years', 12)),

    -- Biological/Organic
    ('Bio Sculptor', 'Gene Splice',
     ARRAY['biological manipulation', 'organic matter control', 'healing factor', 'disease immunity'],
     4, ARRAY['Bio Corps'], ARRAY['gene splicer', 'organic analyzer'],
     jsonb_build_object('specialty', 'biological threats', 'experience_years', 10)),

    ('Swarm Lord', 'Buzz Colony',
     ARRAY['insect control', 'hive mind', 'micro-organism manipulation', 'collective consciousness'],
     3, ARRAY['Bio Division'], ARRAY['pheromone generator', 'swarm beacon'],
     jsonb_build_object('specialty', 'swarm threats', 'experience_years', 7)),

    -- Technology Masters
    ('Data Stream', 'Binary Flow',
     ARRAY['data manipulation', 'digital existence', 'cyber possession', 'network control'],
     4, ARRAY['Cyber Corps'], ARRAY['quantum processor', 'data crystal'],
     jsonb_build_object('specialty', 'cyber threats', 'experience_years', 6)),

    ('Nano Queen', 'Grey Goo',
     ARRAY['nanite control', 'matter reconstruction', 'technological assimilation', 'self-replication'],
     4, ARRAY['Tech Division'], ARRAY['nanite swarm', 'control hub'],
     jsonb_build_object('specialty', 'technological threats', 'experience_years', 9)),

    -- Elemental Extremes
    ('Plasma Storm', 'Aurora Blaze',
     ARRAY['plasma manipulation', 'solar flare generation', 'fusion control', 'energy absorption'],
     4, ARRAY['Energy Corps'], ARRAY['plasma containment suit', 'fusion regulator'],
     jsonb_build_object('specialty', 'energy threats', 'experience_years', 11)),

    ('Zero Point', 'Kelvin Frost',
     ARRAY['absolute zero generation', 'entropy control', 'heat absorption', 'molecular freezing'],
     4, ARRAY['Cryo Division'], ARRAY['thermal nullifier', 'entropy meter'],
     jsonb_build_object('specialty', 'thermal threats', 'experience_years', 8)),

    -- Abstract Concepts
    ('Karma Balance', 'Justice Scale',
     ARRAY['karma manipulation', 'fate adjustment', 'cosmic justice', 'balance restoration'],
     5, ARRAY['Cosmic Justice'], ARRAY['karma scales', 'fate weaver'],
     jsonb_build_object('specialty', 'karmic imbalances', 'experience_years', 500)),

    ('Echo Memory', 'Historia Past',
     ARRAY['memory manipulation', 'time echoes', 'past viewing', 'experience transfer'],
     4, ARRAY['Temporal Division'], ARRAY['memory crystal', 'temporal lens'],
     jsonb_build_object('specialty', 'historical threats', 'experience_years', 25)),

    -- Emotion/Mind Powers
    ('Emotion Lord', 'Pathos Feel',
     ARRAY['emotion manipulation', 'empathy field', 'mood control', 'feeling projection'],
     3, ARRAY['Psi Corps'], ARRAY['emotion amplifier', 'mood ring'],
     jsonb_build_object('specialty', 'emotional threats', 'experience_years', 15)),

    ('Mind Architect', 'Psyche Build',
     ARRAY['mental construction', 'thought materialization', 'idea manifestation', 'concept creation'],
     4, ARRAY['Psychic Division'], ARRAY['mind forge', 'thought crystallizer'],
     jsonb_build_object('specialty', 'mental threats', 'experience_years', 13)),

    -- Sound/Vibration
    ('Frequency', 'Sonic Wave',
     ARRAY['sound manipulation', 'vibration control', 'resonance matching', 'harmonic destruction'],
     3, ARRAY['Sonic Corps'], ARRAY['sonic amplifier', 'frequency modulator'],
     jsonb_build_object('specialty', 'sonic threats', 'experience_years', 7)),

    ('Bass Drop', 'Low Frequency',
     ARRAY['infrasound generation', 'seismic control', 'resonance manipulation', 'sound nullification'],
     3, ARRAY['Sonic Division'], ARRAY['bass cannon', 'resonance tracker'],
     jsonb_build_object('specialty', 'acoustic threats', 'experience_years', 5)),

    -- Light/Shadow
    ('Prism Master', 'Roy Rainbow',
     ARRAY['light manipulation', 'color control', 'hologram generation', 'photon bending'],
     3, ARRAY['Light Corps'], ARRAY['prism staff', 'spectrum analyzer'],
     jsonb_build_object('specialty', 'light-based threats', 'experience_years', 9)),

    ('Void Shadow', 'Umbra Dark',
     ARRAY['shadow manipulation', 'darkness generation', 'light absorption', 'shadow walking'],
     3, ARRAY['Shadow Division'], ARRAY['shadow cloak', 'darkness generator'],
     jsonb_build_object('specialty', 'darkness-based threats', 'experience_years', 11)),

    -- More heroes with unique powers...
    -- Continue with similar pattern for remaining heroes, each with unique and creative powers
    
    -- Example of continuing the pattern:
    ('Chaos Theory', 'Murphy Law',
     ARRAY['entropy acceleration', 'disorder creation', 'system breakdown', 'randomness control'],
     4, ARRAY['Chaos Division'], ARRAY['entropy meter', 'chaos inducer'],
     jsonb_build_object('specialty', 'order breakdown', 'experience_years', 13)),

    ('Paradox', 'Logic Break',
     ARRAY['paradox manipulation', 'contradiction creation', 'logic distortion', 'impossibility generation'],
     5, ARRAY['Reality Corps'], ARRAY['paradox stabilizer', 'logic analyzer'],
     jsonb_build_object('specialty', 'logical anomalies', 'experience_years', 42)),

    -- Meta Powers
    ('Power Prism', 'Alex Mirror',
     ARRAY['power copying', 'ability absorption', 'power fusion', 'skill mimicry'],
     5, ARRAY['Meta Corps'], ARRAY['power amplifier', 'ability scanner'],
     jsonb_build_object('specialty', 'power-based threats', 'experience_years', 15)),

    ('Null Field', 'Void Walker',
     ARRAY['power nullification', 'ability dampening', 'anti-power field', 'meta cancellation'],
     5, ARRAY['Meta Corps'], ARRAY['nullification generator', 'power dampeners'],
     jsonb_build_object('specialty', 'power neutralization', 'experience_years', 20)),

    ('Evolution', 'Darwin Prime',
     ARRAY['power evolution', 'adaptive abilities', 'threat response', 'situational empowerment'],
     5, ARRAY['Adaptation Division'], ARRAY['evolution catalyst', 'adaptation matrix'],
     jsonb_build_object('specialty', 'evolutionary threats', 'experience_years', 30)),

    ('Power Forge', 'Smith Ability',
     ARRAY['power creation', 'ability crafting', 'power enhancement', 'skill synthesis'],
     5, ARRAY['Meta Corps'], ARRAY['power forge', 'ability crucible'],
     jsonb_build_object('specialty', 'power development', 'experience_years', 25)),

    -- Unique Elements/Forces
    ('String Theory', 'Vibra Chord',
     ARRAY['cosmic string manipulation', 'dimensional resonance', 'reality threading', 'quantum harmonics'],
     5, ARRAY['Quantum Division'], ARRAY['string resonator', 'dimensional tuner'],
     jsonb_build_object('specialty', 'dimensional threats', 'experience_years', 40)),

    ('Dark Flow', 'Umbra Current',
     ARRAY['dark matter control', 'invisible force manipulation', 'mass distortion', 'gravity wells'],
     5, ARRAY['Cosmic Guard'], ARRAY['dark matter sensor', 'mass manipulator'],
     jsonb_build_object('specialty', 'dark matter incidents', 'experience_years', 18)),

    ('Antimatter', 'Nova Void',
     ARRAY['antimatter generation', 'annihilation control', 'energy conversion', 'matter negation'],
     5, ARRAY['Energy Corps'], ARRAY['containment suit', 'matter converter'],
     jsonb_build_object('specialty', 'antimatter threats', 'experience_years', 12)),

    ('Quark Storm', 'Hadron Flux',
     ARRAY['fundamental particle control', 'strong force manipulation', 'weak force control', 'quantum field generation'],
     5, ARRAY['Particle Division'], ARRAY['particle accelerator', 'force modulator'],
     jsonb_build_object('specialty', 'particle anomalies', 'experience_years', 22)),

    ('Higgs Field', 'Mass Master',
     ARRAY['mass manipulation', 'particle interaction', 'field generation', 'force amplification'],
     4, ARRAY['Particle Division'], ARRAY['mass inducer', 'field generator'],
     jsonb_build_object('specialty', 'mass-related threats', 'experience_years', 16)),

    ('Quantum Lock', 'State Freeze',
     ARRAY['quantum state manipulation', 'probability freezing', 'uncertainty control', 'wave function mastery'],
     4, ARRAY['Quantum Division'], ARRAY['quantum stabilizer', 'state lock'],
     jsonb_build_object('specialty', 'quantum anomalies', 'experience_years', 14)),

    ('Exotic Matter', 'Strange Substance',
     ARRAY['exotic matter creation', 'impossible physics', 'strange matter control', 'weird energy manipulation'],
     5, ARRAY['Exotic Division'], ARRAY['matter synthesizer', 'physics breaker'],
     jsonb_build_object('specialty', 'exotic matter threats', 'experience_years', 28)),

    ('Dimension Weaver', 'Fold Space',
     ARRAY['dimensional manipulation', 'space folding', 'reality layering', 'plane shifting'],
     5, ARRAY['Reality Corps'], ARRAY['dimension anchor', 'reality loom'],
     jsonb_build_object('specialty', 'dimensional threats', 'experience_years', 35)),

    ('Tachyon Burst', 'Faster Light',
     ARRAY['FTL particle control', 'causality manipulation', 'time particle mastery', 'light speed breach'],
     5, ARRAY['Temporal Guard'], ARRAY['tachyon collector', 'causality stabilizer'],
     jsonb_build_object('specialty', 'temporal paradoxes', 'experience_years', 19)),

    ('Vacuum State', 'Empty Space',
     ARRAY['vacuum energy control', 'zero point manipulation', 'quantum vacuum mastery', 'void state generation'],
     4, ARRAY['Energy Corps'], ARRAY['vacuum chamber', 'void generator'],
     jsonb_build_object('specialty', 'vacuum fluctuations', 'experience_years', 21)),

    ('Brane Surfer', 'Membrane Rider',
     ARRAY['membrane universe surfing', 'dimensional skating', 'multiverse navigation', 'reality sliding'],
     5, ARRAY['Reality Corps'], ARRAY['brane board', 'dimension compass'],
     jsonb_build_object('specialty', 'multiverse threats', 'experience_years', 45)),

    ('Force Unifier', 'Unity Field',
     ARRAY['fundamental force unification', 'interaction mastery', 'force harmonization', 'grand unified field'],
     5, ARRAY['Force Division'], ARRAY['force harmonizer', 'field unifier'],
     jsonb_build_object('specialty', 'force anomalies', 'experience_years', 50)),

    -- Abstract Mathematics/Logic
    ('Math Bender', 'Euler Prime',
     ARRAY['mathematical law control', 'equation manifestation', 'geometric warping', 'numerical manipulation'],
     5, ARRAY['Logic Corps'], ARRAY['math processor', 'formula manifester'],
     jsonb_build_object('specialty', 'mathematical anomalies', 'experience_years', 33)),

    ('Logic Gate', 'Alan Boolean',
     ARRAY['logical operation control', 'truth manipulation', 'paradox resolution', 'computational manifestation'],
     4, ARRAY['Logic Corps'], ARRAY['logic engine', 'truth analyzer'],
     jsonb_build_object('specialty', 'logical paradoxes', 'experience_years', 27)),

    -- Information/Data
    ('Data Weaver', 'Bit Stream',
     ARRAY['information manipulation', 'data materialization', 'knowledge synthesis', 'pattern recognition'],
     4, ARRAY['Info Corps'], ARRAY['data loom', 'pattern scanner'],
     jsonb_build_object('specialty', 'information threats', 'experience_years', 17)),

    ('Quantum Coder', 'Q Bit',
     ARRAY['quantum information control', 'entanglement programming', 'quantum encryption', 'superposition coding'],
     5, ARRAY['Quantum Division'], ARRAY['quantum keyboard', 'qubit manipulator'],
     jsonb_build_object('specialty', 'quantum data threats', 'experience_years', 23)),

    -- Conceptual Abstractions
    ('Metaphor', 'Allegory Smith',
     ARRAY['concept manifestation', 'metaphor manipulation', 'symbolic reality', 'abstract materialization'],
     4, ARRAY['Concept Corps'], ARRAY['meaning forge', 'symbol projector'],
     jsonb_build_object('specialty', 'conceptual threats', 'experience_years', 31)),

    ('Story Weaver', 'Narrative Flow',
     ARRAY['plot manipulation', 'story manifestation', 'narrative control', 'character development'],
     4, ARRAY['Reality Corps'], ARRAY['plot device', 'story spinner'],
     jsonb_build_object('specialty', 'narrative anomalies', 'experience_years', 24)),

    -- Probability/Chaos
    ('Butterfly Effect', 'Chaos Wing',
     ARRAY['cascade manipulation', 'butterfly effect control', 'chaos amplification', 'ripple mastery'],
     5, ARRAY['Chaos Division'], ARRAY['effect amplifier', 'chaos tracker'],
     jsonb_build_object('specialty', 'cascade events', 'experience_years', 29)),

    ('Random Access', 'Dice Roller',
     ARRAY['probability manipulation', 'chance control', 'outcome selection', 'possibility scanning'],
     4, ARRAY['Probability Corps'], ARRAY['probability die', 'chance selector'],
     jsonb_build_object('specialty', 'probability threats', 'experience_years', 16)),

    -- Existence/Reality
    ('Schrödinger', 'Cat State',
     ARRAY['quantum superposition', 'existence manipulation', 'state control', 'observation mastery'],
     5, ARRAY['Quantum Division'], ARRAY['state box', 'quantum observer'],
     jsonb_build_object('specialty', 'quantum state threats', 'experience_years', 38)),

    ('Meta Script', 'Author Prime',
     ARRAY['reality editing', 'plot armor generation', 'story manipulation', 'narrative causality'],
     5, ARRAY['Reality Corps'], ARRAY['reality pen', 'plot shield'],
     jsonb_build_object('specialty', 'meta-narrative threats', 'experience_years', 44)),

    -- Language/Communication
    ('Babel', 'Lingua Code',
     ARRAY['language manipulation', 'meaning control', 'translation mastery', 'communication manifestation'],
     4, ARRAY['Communication Corps'], ARRAY['universal translator', 'meaning modulator'],
     jsonb_build_object('specialty', 'communication threats', 'experience_years', 26)),

    ('True Name', 'Word Smith',
     ARRAY['name control', 'definition manipulation', 'word power', 'semantic reality'],
     5, ARRAY['Language Division'], ARRAY['name index', 'word forge'],
     jsonb_build_object('specialty', 'linguistic threats', 'experience_years', 32))
  ) AS h(codename, real_name, powers, clearance_level, team_affiliations, hero_equipment, hero_metadata)
JOIN hero_users u ON u.codename = h.codename;

-- Create some support staff users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'support@cape.org', crypt('SupportPass123!', gen_salt('bf')), now(), 
   '{"provider":"email","providers":["email"]}', '{"role":"SUPPORT","codename":"Mission Control","real_name":"Support Staff"}', now(), now());

-- Create support staff profiles
INSERT INTO public.profiles (
  id, 
  role, 
  codename,
  real_name,
  status,
  created_at, 
  updated_at
)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'SUPPORT', 'Mission Control', 'Support Staff', 'ACTIVE', now(), now());
