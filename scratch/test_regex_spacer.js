const xmlTest = `<InformacionGeneral Version="V1.0" Ambiente="1" CUNE="12345" EncripCUNE ="CUNE-SHA384" />`;
const oldRegex = /CUNE="[^"]*"/g;
const result = xmlTest.replace(oldRegex, 'CUNE=""');
console.log("Original:", xmlTest);
console.log("Result:  ", result);
console.log("Is EncripCUNE intact?", result.includes('EncripCUNE ="CUNE-SHA384"'));
console.log("Is CUNE empty?", result.includes('CUNE=""'));
