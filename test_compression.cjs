const zlib = require('zlib');

// Mock data based on the Superbowl Box Tracker app
const generateState = (numPools) => {
    const pools = [];
    for (let i = 0; i < numPools; i++) {
        pools.push({
            id: Date.now().toString() + i,
            pairs: [
                { a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) },
                { a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) }
            ],
            notes: `Pool ${i + 1} - Quarter 1: $50, Quarter 2: $100, Quarter 3: $50, Final: $200. Good luck to everyone involved!`
        });
    }

    return {
        teams: { teamA: "Kansas City Chiefs", teamB: "Philadelphia Eagles" },
        score: { teamA: 24, teamB: 14 },
        pools
    };
};

const testCompression = (numPools) => {
    const state = generateState(numPools);
    const jsonString = JSON.stringify(state);
    const compressed = zlib.deflateSync(jsonString);
    const base64 = compressed.toString('base64');
    // URL safe replacements usually needed but length is similar

    console.log(`--- ${numPools} Pools ---`);
    console.log(`Raw JSON Info: ${jsonString.length} chars`);
    console.log(`Compressed + Base64: ${base64.length} chars`);
    console.log(`Ratio: ${(base64.length / jsonString.length * 100).toFixed(1)}%`);
};

testCompression(1);
testCompression(10);
testCompression(50);
