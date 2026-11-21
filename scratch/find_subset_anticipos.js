const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// List of units with anticipo from our earlier run:
const units = [
  { u: 'A-801', amt: 339 },
  { u: 'A-602', amt: 12000 },
  { u: 'D-204', amt: 525000 },
  { u: 'D-202', amt: 255225 },
  { u: 'D-603', amt: 5325 },
  { u: 'B-401', amt: 8667 },
  { u: 'A-201', amt: 250000 },
  { u: 'A-501', amt: 5659 },
  { u: 'B-903', amt: 109 },
  { u: 'B-1202', amt: 109 },
  { u: 'C-1001', amt: 21300 },
  { u: 'B-1204', amt: 5325 },
  { u: 'D-302', amt: 111 },
  { u: 'C-401', amt: 86 },
  { u: 'C-601', amt: 244906 },
  { u: 'D-401', amt: 250000 },
  { u: 'A-702', amt: 250000 },
];

// Target sum is 1,066,564
// Let's find which subset sums to 1066564
function findSubset(arr, target) {
  function recurse(idx, currentSum, subset) {
    if (Math.abs(currentSum - target) < 1) return subset;
    if (idx >= arr.length) return null;
    // include
    const withItem = recurse(idx + 1, currentSum + arr[idx].amt, [...subset, arr[idx]]);
    if (withItem) return withItem;
    // exclude
    return recurse(idx + 1, currentSum, subset);
  }
  return recurse(0, 0, []);
}

const found = findSubset(units, 1066564);
console.log('Subset summing to 1,066,564:');
console.table(found);
if (found) {
  const sumFound = found.reduce((s, x) => s + x.amt, 0);
  console.log('Sum found:', sumFound);
  const excluded = units.filter(u => !found.includes(u));
  console.log('Excluded units:');
  console.table(excluded);
  console.log('Sum of excluded:', excluded.reduce((s, x) => s + x.amt, 0));
}
