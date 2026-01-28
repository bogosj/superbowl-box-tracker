const LZString = require('lz-string');

const state = {
    teams: { teamA: "TestTeamA", teamB: "TestTeamB" },
    pools: [
        {
            id: "123",
            pairs: [{ a: 1, b: 1 }],
            notes: "Shared Pool Verification"
        }
    ]
};

const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state));
console.log(compressed);
