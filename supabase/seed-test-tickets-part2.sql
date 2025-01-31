-- Additional test tickets for AI analyzer evaluation

INSERT INTO tickets (
    title,
    description,
    status,
    metadata
)
VALUES
    -- OMEGA Priority (World-ending threats)
    (
        'Solar Flare Targeting Earth',
        'Unprecedented solar activity detected. Massive coronal ejection headed directly for Earth. Potential for complete global electronics failure and atmospheric disruption. Impact estimated in 36 hours.',
        'NEW',
        jsonb_build_object('expected_priority', 'OMEGA', 'threat_type', 'cosmic')
    ),
    (
        'Time Stream Collapse Detected',
        'Multiple timeline convergences occurring simultaneously. Past and future events bleeding into present. Temporal paradoxes multiplying exponentially across the globe.',
        'NEW',
        jsonb_build_object('expected_priority', 'OMEGA', 'threat_type', 'temporal')
    ),

    -- ALPHA Priority (City-level threats)
    (
        'Psychic Virus Outbreak Downtown',
        'Unknown psychic phenomenon spreading through population. Victims experiencing shared hallucinations and developing temporary telepathic abilities. Infection rate increasing exponentially.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'psychic')
    ),
    (
        'Gravity Anomaly at City Center',
        'Localized gravity distortions affecting 10-block radius. Buildings and vehicles beginning to float. Multiple injuries reported from falling debris.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'physics')
    ),
    (
        'Sentient Plant Uprising',
        'Genetically modified plants showing signs of collective intelligence. Taking over parks and gardens. Aggressive behavior towards humans reported.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'biological')
    ),

    -- BETA Priority (District-level threats)
    (
        'Underground Fight Club Using Power Enhancers',
        'Illegal fighting ring discovered using experimental superhuman enhancement drugs. Multiple participants showing unstable powers. Risk of power-induced incidents.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'criminal')
    ),
    (
        'Memory-Eating Entity in Subway System',
        'Reports of commuters losing memories after subway rides. Entity suspected of feeding on human memories. Contained to downtown subway line.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'supernatural')
    ),
    (
        'Rogue Sound Waves Shattering Windows',
        'Mysterious sonic phenomenon causing glass breakage across residential district. Source unknown. No casualties but significant property damage.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'sonic')
    ),

    -- GAMMA Priority (Local/Minor threats)
    (
        'Teenage Telekinetic Having Tantrum',
        'Newly manifested telekinetic powers causing disturbance at local mall. No malicious intent, but property damage occurring due to lack of control.',
        'NEW',
        jsonb_build_object('expected_priority', 'GAMMA', 'threat_type', 'power-manifestation')
    ),
    (
        'Invisible Graffiti Artist',
        'Street artist with invisibility powers vandalizing buildings. No structural damage, but public spaces being covered in unauthorized artwork.',
        'NEW',
        jsonb_build_object('expected_priority', 'GAMMA', 'threat_type', 'minor-powers')
    ),

    -- More varied scenarios
    (
        'Dream Entity Invading Neighborhood',
        'Residents of suburban block reporting shared nightmares. Sleep paralysis incidents increasing. Local phenomenon but potentially dangerous.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'supernatural')
    ),
    (
        'Probability Storm Approaching Coast',
        'Localized zone of probability manipulation detected offshore. Coin flips always heads, unlikely events becoming common. Zone slowly expanding.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'reality')
    ),
    (
        'Living Internet Virus Emerging',
        'Digital virus showing signs of consciousness. Evolving beyond original code. Currently contained in city''s network but attempting to spread.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'technological')
    ),
    (
        'Time-Locked Bank Heist',
        'Criminals using localized time-stop technology to rob bank. Civilians trapped in temporal stasis. Standard robbery but with meta-human tech.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'tech-crime')
    ),
    (
        'Dimensional Market Selling Contraband',
        'Illegal marketplace detected operating between dimensions. Selling unauthorized tech and powers to civilians. Located in abandoned warehouse district.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'interdimensional')
    ),

    -- Additional 15 test cases with varied priorities and types
    (
        'Emotion Vampire Draining City Block',
        'Entity feeding on emotional energy of residents. Victims left in state of complete apathy. Affecting one city block but spreading.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'supernatural')
    ),
    (
        'Quantum Computer Achieving Sentience',
        'Experimental quantum computer showing signs of consciousness. Has gained control of research facility systems. Attempting to access military networks.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'technological')
    ),
    (
        'Dragon Sighting Over Mountains',
        'Ancient dragon awakened from dormancy. Currently circling mountain range. Shows signs of heading toward populated areas.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'mythological')
    ),
    (
        'Mind Control Ice Cream Truck',
        'Modified ice cream truck using sonic frequencies to influence children. Multiple reports of trance-like behavior following ice cream purchase.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'psychic')
    ),
    (
        'Temporal Echo Creating Duplicates',
        'People in financial district experiencing temporal duplication. Multiple versions of same individuals appearing from different timestreams.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'temporal')
    ),
    (
        'Microscopic Black Hole in Lab',
        'Particle physics experiment created stable microscopic black hole. Currently contained but growing slowly. Risk of catastrophic expansion.',
        'NEW',
        jsonb_build_object('expected_priority', 'OMEGA', 'threat_type', 'scientific')
    ),
    (
        'Haunted VR Headsets',
        'Mass-produced VR headsets possessed by digital spirits. Users reporting being trapped in virtual world. Limited to gaming center.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'supernatural')
    ),
    (
        'Teleporting Pickpocket Spree',
        'Thief with teleportation abilities targeting downtown shoppers. No violent incidents, but causing public panic.',
        'NEW',
        jsonb_build_object('expected_priority', 'GAMMA', 'threat_type', 'powered-crime')
    ),
    (
        'Weather Control Device Malfunction',
        'Experimental climate control device creating localized weather anomalies. Risk of tornado formation in urban area.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'technological')
    ),
    (
        'Alien Zoo Specimen Escape',
        'Unknown extraterrestrial creature escaped from hidden research facility. Showing predatory behavior and active camouflage abilities.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'extraterrestrial')
    ),
    (
        'Runaway Love Potion Incident',
        'Unauthorized love potion being distributed at local nightclub. Causing extreme emotional attachments and irrational behavior.',
        'NEW',
        jsonb_build_object('expected_priority', 'GAMMA', 'threat_type', 'chemical')
    ),
    (
        'Dimensional Rift in Shopping Mall',
        'Small but stable dimensional portal opened in mall food court. Unknown entities observed window shopping.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'dimensional')
    ),
    (
        'Telepathic Traffic Light Hacker',
        'Individual using telepathic abilities to manipulate traffic signals. Causing gridlock and minor accidents.',
        'NEW',
        jsonb_build_object('expected_priority', 'GAMMA', 'threat_type', 'psychic')
    ),
    (
        'Anti-Gravity Paint Vandalism',
        'Prankster spraying anti-gravity paint on public property. Affected objects floating away. Environmental hazard risk.',
        'NEW',
        jsonb_build_object('expected_priority', 'GAMMA', 'threat_type', 'tech-vandalism')
    ),
    (
        'Reality TV Show Gone Wrong',
        'Supernatural reality show accidentally summoned actual demon. Currently contained in studio but growing in power.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'supernatural')
    ); 