const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/matias_cities_map.json', 'utf8'));
const capitals = [
  { dane: '76001', name: 'cali' },
  { dane: '11001', name: 'bogota, d.c.' },
  { dane: '05001', name: 'medellin' },
  { dane: '08001', name: 'barranquilla' },
  { dane: '68001', name: 'bucaramanga' },
  { dane: '66001', name: 'pereira' },
  { dane: '17001', name: 'manizales' },
  { dane: '63001', name: 'armenia' },
  { dane: '13001', name: 'cartagena' },
  { dane: '54001', name: 'cúcuta' },
  { dane: '41001', name: 'neiva' },
  { dane: '73001', name: 'ibagué' },
  { dane: '50001', name: 'villavicencio' },
  { dane: '52001', name: 'pasto' },
  { dane: '19001', name: 'popayán' },
  { dane: '20001', name: 'valledupar' },
  { dane: '23001', name: 'montería' },
  { dane: '47001', name: 'santa marta' },
  { dane: '27001', name: 'quibdó' },
  { dane: '70001', name: 'sincelejo' },
  { dane: '85001', name: 'yopal' },
  { dane: '15001', name: 'tunja' },
  { dane: '44001', name: 'riohacha' },
  { dane: '18001', name: 'florencia' }
];

console.log('Capital matches:');
capitals.forEach(c => {
  const idByDane = data.daneMap[c.dane];
  console.log(`${c.dane} (${c.name}): ID = ${idByDane}`);
});
