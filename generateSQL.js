// const fs = require('fs');
// const path = require('path');

// const dataDir = path.join(__dirname, 'map_data');
// const outputFile = path.join(__dirname, 'database_seed.sql');

// let sqlOutput = `
// -- ==========================================
// -- VIT CAMPUS MAP DATABASE SEED FILE
// -- Auto-generated from JSON data
// -- ==========================================

// DROP TABLE IF EXISTS map_edges CASCADE;
// DROP TABLE IF EXISTS map_nodes CASCADE;

// CREATE TABLE map_nodes (
//     id VARCHAR(50) PRIMARY KEY,
//     floor VARCHAR(10),
//     building VARCHAR(10),
//     name VARCHAR(100),
//     type VARCHAR(50),
//     zone VARCHAR(50),
//     pos_x FLOAT,
//     pos_y FLOAT
// );

// CREATE TABLE map_edges (
//     id SERIAL PRIMARY KEY,
//     source_node VARCHAR(50) REFERENCES map_nodes(id) ON DELETE CASCADE,
//     target_node VARCHAR(50) REFERENCES map_nodes(id) ON DELETE CASCADE,
//     weight FLOAT DEFAULT 1.0
// );

// -- ==========================================
// -- INSERTING NODES
// -- ==========================================
// INSERT INTO map_nodes (id, floor, building, name, type, zone, pos_x, pos_y) VALUES
// `;

// let nodeValues = [];
// let edgeValues = [];

// // Helper function to ensure IDs are globally unique (e.g., turns "301" into "PRP_301")
// function getUniqueId(building, id) {
//     // If the ID already has the building prefix (like 'sjt_lift_1'), keep it as is
//     if (id.toLowerCase().startsWith(building.toLowerCase())) {
//         return id;
//     }
//     return `${building}_${id}`;
// }

// const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

// files.forEach(file => {
//     const rawData = fs.readFileSync(path.join(dataDir, file));
//     const floorData = JSON.parse(rawData);
    
//     const building = floorData.building;
//     const floor = floorData.floor;

//     floorData.nodes.forEach(node => {
//         const safeName = node.name.replace(/'/g, "''");
        
//         // 1. Get the unique ID for the node
//         const uniqueNodeId = getUniqueId(building, node.id);
        
//         nodeValues.push(`('${uniqueNodeId}', '${floor}', '${building}', '${safeName}', '${node.type}', '${node.zone}', ${node.coordinates.x}, ${node.coordinates.y})`);

//         // 2. Ensure the connected targets also use the unique ID
//         if (node.connectedTo && node.connectedTo.length > 0) {
//             node.connectedTo.forEach(target => {
//                 const uniqueTargetId = getUniqueId(building, target);
//                 edgeValues.push(`('${uniqueNodeId}', '${uniqueTargetId}')`);
//             });
//         }
//     });
// });

// sqlOutput += nodeValues.join(',\n') + ';\n\n';

// sqlOutput += `
// -- ==========================================
// -- INSERTING EDGES (CONNECTIONS)
// -- ==========================================
// INSERT INTO map_edges (source_node, target_node) VALUES
// `;
// sqlOutput += edgeValues.join(',\n') + ';\n';

// fs.writeFileSync(outputFile, sqlOutput);
// console.log(`✅ Success! Generated ${nodeValues.length} Nodes and ${edgeValues.length} Edges.`);
// console.log(`📁 File saved as: ${outputFile}`);


// const fs = require('fs');
// const path = require('path');

// const dataDir = path.join(__dirname, 'map_data');
// const outputFile = path.join(__dirname, 'database_seed.sql');

// let sqlOutput = `
// -- ==========================================
// -- VIT CAMPUS MAP DATABASE SEED FILE
// -- Auto-generated from JSON data
// -- ==========================================

// DROP TABLE IF EXISTS map_edges CASCADE;
// DROP TABLE IF EXISTS map_nodes CASCADE;

// CREATE TABLE map_nodes (
//     id VARCHAR(50) PRIMARY KEY,
//     floor VARCHAR(10),
//     building VARCHAR(10),
//     name VARCHAR(100),
//     type VARCHAR(50),
//     zone VARCHAR(50),
//     pos_x FLOAT,
//     pos_y FLOAT
// );

// CREATE TABLE map_edges (
//     id SERIAL PRIMARY KEY,
//     source_node VARCHAR(50) REFERENCES map_nodes(id) ON DELETE CASCADE,
//     target_node VARCHAR(50) REFERENCES map_nodes(id) ON DELETE CASCADE,
//     weight FLOAT DEFAULT 1.0
// );

// -- ==========================================
// -- INSERTING NODES
// -- ==========================================
// INSERT INTO map_nodes (id, floor, building, name, type, zone, pos_x, pos_y) VALUES
// `;

// let nodeValues = [];
// let edgeValues = [];
// let validNodeIds = new Set(); // This will memorize all existing rooms
// let missingRooms = []; // This will track our mistakes

// function getUniqueId(building, id) {
//     if (id.toLowerCase().startsWith(building.toLowerCase())) return id;
//     return `${building}_${id}`;
// }

// const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

// // ==========================================
// // PASS 1: Memorize every room that actually exists
// // ==========================================
// files.forEach(file => {
//     const rawData = fs.readFileSync(path.join(dataDir, file));
//     const floorData = JSON.parse(rawData);
//     const building = floorData.building;
    
//     floorData.nodes.forEach(node => {
//         validNodeIds.add(getUniqueId(building, node.id));
//     });
// });

// // ==========================================
// // PASS 2: Generate the SQL safely
// // ==========================================
// files.forEach(file => {
//     const rawData = fs.readFileSync(path.join(dataDir, file));
//     const floorData = JSON.parse(rawData);
//     const building = floorData.building;
//     const floor = floorData.floor;

//     floorData.nodes.forEach(node => {
//         const safeName = node.name.replace(/'/g, "''");
//         const uniqueNodeId = getUniqueId(building, node.id);
        
//         // Add the Node
// // Smart Coordinate Extractor: Tries the new format first, then falls back to the old format
//         const x = node.pos_x !== undefined ? node.pos_x : node.coordinates.x;
//         const y = node.pos_y !== undefined ? node.pos_y : node.coordinates.y;

//         nodeValues.push(`('${uniqueNodeId}', '${floor}', '${building}', '${safeName}', '${node.type}', '${node.zone}', ${x}, ${y})`);
//         // Add the Edges (SAFELY)
//         if (node.connectedTo && node.connectedTo.length > 0) {
//             node.connectedTo.forEach(target => {
//                 const uniqueTargetId = getUniqueId(building, target);
                
//                 // CRITICAL CHECK: Does the target room actually exist?
//                 if (validNodeIds.has(uniqueTargetId)) {
//                     edgeValues.push(`('${uniqueNodeId}', '${uniqueTargetId}')`);
//                 } else {
//                     // Log the error for us to fix later, but don't break the SQL!
//                     missingRooms.push(`Warning: ${uniqueNodeId} tried to connect to ${uniqueTargetId}, but it doesn't exist.`);
//                 }
//             });
//         }
//     });
// });

// sqlOutput += nodeValues.join(',\n') + ';\n\n';
// sqlOutput += `
// -- ==========================================
// -- INSERTING EDGES (CONNECTIONS)
// -- ==========================================
// INSERT INTO map_edges (source_node, target_node) VALUES
// `;
// sqlOutput += edgeValues.join(',\n') + ';\n';

// fs.writeFileSync(outputFile, sqlOutput);

// console.log(`✅ Success! Generated ${nodeValues.length} Nodes and ${edgeValues.length} Edges.`);
// console.log(`📁 File saved as: ${outputFile}\n`);

// // Print our "To-Do" list of missing rooms
// if (missingRooms.length > 0) {
//     console.log(`⚠️  FOUND ${missingRooms.length} MISSING ROOMS. The SQL will still run, but you should fix these in your JSON later:`);
//     missingRooms.forEach(msg => console.log("   - " + msg));
// }

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'map_data');
const outputFile = path.join(__dirname, 'database_seed.sql');

let sqlOutput = `
-- ==========================================
-- VIT CAMPUS MAP DATABASE SEED FILE
-- Auto-generated from JSON data
-- ==========================================
`;

let nodeValues = [];
let edgeValues = [];
let validNodeIds = new Set(); // This will memorize all existing rooms
let missingRooms = []; // This will track our mistakes

function getUniqueId(building, id) {
    if (id.toLowerCase().startsWith(building.toLowerCase())) return id;
    return `${building}_${id}`;
}

// 1. Find the files safely
if (!fs.existsSync(dataDir)) {
    console.error(`❌ ERROR: Could not find the folder '${dataDir}'. Please create a 'map_data' folder and put your JSONs inside!`);
    process.exit(1);
}

const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

// ==========================================
// PASS 1: Memorize every room that actually exists
// ==========================================
files.forEach(file => {
    const rawData = fs.readFileSync(path.join(dataDir, file));
    const data = JSON.parse(rawData);
    const defaultBuilding = data.building || 'UNKNOWN';
    
    if (data.nodes) {
        data.nodes.forEach(node => {
            validNodeIds.add(getUniqueId(node.building || defaultBuilding, node.id));
        });
    }
});

// ==========================================
// PASS 2: Generate the SQL safely
// ==========================================
files.forEach(file => {
    const rawData = fs.readFileSync(path.join(dataDir, file));
    const data = JSON.parse(rawData);
    
    // Fallbacks just in case the JSON is structured slightly differently
    const defaultBuilding = data.building || 'UNKNOWN';
    const defaultFloor = data.floor || 'G';

    // A. PROCESS NODES
    if (data.nodes) {
        data.nodes.forEach(node => {
            const safeName = node.name ? node.name.replace(/'/g, "''") : 'Unnamed';
            const building = node.building || defaultBuilding;
            const floor = node.floor || defaultFloor;
            const uniqueNodeId = getUniqueId(building, node.id);
            const type = node.type || 'Room';
            const zone = node.zone || 'General';
            
            // SMART COORDINATE EXTRACTOR: Safely handles old vs new formats
            const x = node.pos_x !== undefined ? node.pos_x : (node.coordinates ? node.coordinates.x : 0);
            const y = node.pos_y !== undefined ? node.pos_y : (node.coordinates ? node.coordinates.y : 0);

            nodeValues.push(`('${uniqueNodeId}', '${floor}', '${building}', '${safeName}', '${type}', '${zone}', ${x}, ${y})`);
            
            // B. PROCESS OLD-FORMAT EDGES (Inside the node: node.connectedTo)
            if (node.connectedTo && node.connectedTo.length > 0) {
                node.connectedTo.forEach(target => {
                    const uniqueTargetId = getUniqueId(building, target);
                    if (validNodeIds.has(uniqueTargetId)) {
                        edgeValues.push(`('${uniqueNodeId}', '${uniqueTargetId}')`);
                    } else {
                        missingRooms.push(`Warning (Old Format): ${uniqueNodeId} tried to connect to ${uniqueTargetId}, but it doesn't exist.`);
                    }
                });
            }
        });
    }

    // C. PROCESS NEW-FORMAT EDGES (Standalone array: data.edges)
    if (data.edges) {
        data.edges.forEach(edge => {
            const uniqueSourceId = getUniqueId(defaultBuilding, edge.source_node);
            const uniqueTargetId = getUniqueId(defaultBuilding, edge.target_node);

            if (validNodeIds.has(uniqueSourceId) && validNodeIds.has(uniqueTargetId)) {
                edgeValues.push(`('${uniqueSourceId}', '${uniqueTargetId}')`);
            } else {
                missingRooms.push(`Warning (New Format): Edge from ${uniqueSourceId} to ${uniqueTargetId} failed because one of the rooms is missing.`);
            }
        });
    }
});

// ==========================================
// SQL CONSTRUCTION (With ON CONFLICT armor)
// ==========================================
if (nodeValues.length > 0) {
    sqlOutput += `\nINSERT INTO map_nodes (id, floor, building, name, type, zone, pos_x, pos_y) VALUES \n`;
    sqlOutput += nodeValues.join(',\n');
    sqlOutput += `\nON CONFLICT (id) DO UPDATE SET 
      floor = EXCLUDED.floor, 
      building = EXCLUDED.building, 
      name = EXCLUDED.name, 
      type = EXCLUDED.type, 
      zone = EXCLUDED.zone, 
      pos_x = EXCLUDED.pos_x, 
      pos_y = EXCLUDED.pos_y;\n\n`;
}

if (edgeValues.length > 0) {
    sqlOutput += `\nINSERT INTO map_edges (source_node, target_node) VALUES \n`;
    sqlOutput += edgeValues.join(',\n');
    sqlOutput += `\nON CONFLICT DO NOTHING;\n`;
}

// Write the file
fs.writeFileSync(outputFile, sqlOutput);

console.log(`✅ Success! Generated ${nodeValues.length} Nodes and ${edgeValues.length} Edges.`);
console.log(`📁 File saved as: ${outputFile}\n`);

if (missingRooms.length > 0) {
    console.log(`⚠️  FOUND ${missingRooms.length} MISSING ROOMS. The SQL will still run, but check these:`);
    missingRooms.forEach(msg => console.log("   - " + msg));
}