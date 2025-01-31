-- Seed file for test tickets with varying priorities and complexities

-- Insert test tickets
INSERT INTO tickets (
    title,
    description,
    status,
    metadata
)
VALUES
    -- OMEGA Priority (World-ending threats)
    (
        'Interdimensional Invasion in Progress',
        'Multiple rifts are opening across major cities globally, with hostile entities emerging. Early reports indicate advanced weaponry and organized invasion patterns. Estimated planetary threat level: Critical.',
        'NEW',
        jsonb_build_object('expected_priority', 'OMEGA', 'threat_type', 'invasion')
    ),
    (
        'Quantum Singularity Destabilizing Earth''s Core',
        'A quantum anomaly has formed at Earth''s core, causing increasing geological instability worldwide. Preliminary calculations suggest potential planetary collapse within 48 hours.',
        'NEW',
        jsonb_build_object('expected_priority', 'OMEGA', 'threat_type', 'quantum')
    ),
    
    -- ALPHA Priority (City-level threats)
    (
        'Rogue AI Controlling City Infrastructure',
        'An artificial intelligence has taken control of Neo City''s power grid, transportation systems, and communication networks. Threatening to cause widespread chaos if demands aren''t met.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'technological')
    ),
    (
        'Massive Weather Manipulation Event',
        'Unnatural storm system forming over downtown, showing signs of conscious control. Lightning strikes targeting critical infrastructure. Multiple casualties reported.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'weather')
    ),
    
    -- BETA Priority (District-level threats)
    (
        'Toxic Gas Leak in Industrial District',
        'Chemical plant malfunction has released unknown toxic gas. Affecting 3 square miles of industrial zone. Immediate containment and neutralization required.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'chemical')
    ),
    (
        'Gang War Escalating in East Side',
        'Three major criminal organizations engaged in open warfare. Multiple shootouts reported. Civilian casualties likely without intervention.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'criminal')
    ),
    
    -- GAMMA Priority (Local/Minor threats)
    (
        'Bank Robbery in Progress',
        'Armed individuals holding hostages at First National Bank. Standard robbery scenario, but weapons reported. Local police requesting hero support.',
        'NEW',
        jsonb_build_object('expected_priority', 'GAMMA', 'threat_type', 'crime')
    ),
    (
        'Escaped Zoo Animals Downtown',
        'Several dangerous animals have escaped from the city zoo. No casualties yet, but immediate response needed to prevent injuries.',
        'NEW',
        jsonb_build_object('expected_priority', 'GAMMA', 'threat_type', 'animal')
    ),
    (
        'Stolen Bicycle Ring Discovered',
        'Local residents report organized bicycle theft operation. Multiple bikes stolen over past week. Suspect storage location identified.',
        'NEW',
        jsonb_build_object('expected_priority', 'GAMMA', 'threat_type', 'petty-crime')
    ),
    
    -- More varied scenarios
    (
        'Time Anomalies Reported in Business District',
        'Multiple reports of time dilation effects. People experiencing different time flows, causing chaos in financial district operations.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'temporal')
    ),
    (
        'Mass Hysteria Event at Shopping Mall',
        'Unknown cause triggering widespread emotional manipulation. Hundreds affected, displaying extreme behavioral changes.',
        'NEW',
        jsonb_build_object('expected_priority', 'BETA', 'threat_type', 'psychological')
    ),
    (
        'Runaway Self-Replicating Nanobots',
        'Experimental nanobots from research facility showing uncontrolled replication. Currently contained to lab but spreading rapidly.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'technological')
    ),
    (
        'Reality Fabric Tear at Stadium',
        'Physics anomalies reported during major sports event. Laws of physics becoming unstable in localized area.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'reality')
    ),
    (
        'Supervillain Prison Break',
        'Multiple high-threat inmates escaped from maximum security facility. Known powers include energy manipulation and mind control.',
        'NEW',
        jsonb_build_object('expected_priority', 'ALPHA', 'threat_type', 'villain')
    ),
    (
        'Giant Monster Sighting Offshore',
        'Kaiju-class creature detected approaching coastline. Current trajectory suggests city landfall within 6 hours.',
        'NEW',
        jsonb_build_object('expected_priority', 'OMEGA', 'threat_type', 'kaiju')
    ); 