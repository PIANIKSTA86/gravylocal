const pass = "8cd4dfbf5b0ddad5e99debcd9d30920a232eedbf8dc3bc0173c4d79dfbf627fb";

console.log("Length of user key:", pass.length);
console.log("Old Regex /^[0-9a-f]{64}$/i test:", /^[0-9a-f]{64}$/i.test(pass));
console.log("New Regex /^[0-9a-f]{32,128}$/i test:", /^[0-9a-f]{32,128}$/i.test(pass));
