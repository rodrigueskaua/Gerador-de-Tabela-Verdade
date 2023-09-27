let currentPreposition = "";
const regex = /[PQR]/g;
const parenRegex = /\(([^)]+)\)/g;

const visualToLogical = {
  '∧': '&&',
  '∨': '||',
  '⊕': '!=='
};

function insertCharacter(char) {
  currentPreposition += char;
  updatePrepositionOnPage();
  calculateTruthTable();
}

function removeCharacter() {
  currentPreposition = currentPreposition.slice(0, -1);
  updatePrepositionOnPage();
  calculateTruthTable();
}

function calculatePreposition(preposition, values) {
  const prepositionWithLogical = preposition.replace(/[∧∨⊕]/g, match => visualToLogical[match]);
    
    const prepositionWithValues = prepositionWithLogical.replace(parenRegex, match => {
    const subPrep = match.slice(1, -1); 
    return calculatePreposition(subPrep, values) ? 'true' : 'false';
  });
  
  return eval(prepositionWithValues.replace(regex, match => values[match]));
}
function generateTableRow(values, preposition, result) {
  const columns = Object.values(values).map(value => `<td>${value ? 'V' : 'F'}</td>`);  
  const subPrepositions = preposition.match(parenRegex);
  
  if (subPrepositions) {
    for (const subPrep of subPrepositions) {
      const subResult = calculatePreposition(subPrep.slice(1, -1), values);
      columns.push(`<td>${subResult ? 'V' : 'F'}</td>`);
    }
  };
  columns.push(`<td>${result ? 'V' : 'F'}</td>`);

  return `<tr>${columns.join('')}</tr>`;
}

function generateTruthTable(preposition) {
  const variablesSet = new Set(preposition.match(regex) || []);
  const variables = Array.from(variablesSet);
  const combinations = [];

  let header = generateTableHeader(variables, preposition);
    
  for (let i = 0; i < Math.pow(2, variables.length); i++) {
    const variableValues = calculateVariableValues(i, variables.length);
    const result = calculatePreposition(preposition, variableValues);
    const row = generateTableRow(variableValues, preposition, result);
    combinations.push(row);
  }

  return `
    <table>
      ${header}
      ${combinations.join('')}
    </table>`;
}

function calculateVariableValues(index, numberOfVariables) {
  const values = {};
  for (let i = 0; i < numberOfVariables; i++) {
    const variable = String.fromCharCode(80 + i);
    values[variable] = Boolean(index % 2 === 0);
    index = Math.floor(index / 2);
  }
  return values;
}

function generateTableHeader(variables, preposition) {
  const variableColumns = variables.map(variable => `<th>${variable}</th>`);
  
  const subPrepositions = preposition.match(parenRegex);
  if (subPrepositions) {
    for (const subPreposition of subPrepositions) {
      const subPrep = subPreposition.slice(1, -1);
      variableColumns.push(`<th>${subPrep}</th>`);
    }
  }
  variableColumns.push(`<th>${preposition}</th>`);

  return `<tr>${variableColumns.join('')}</tr>`;
}

function isValidPreposition(preposition) {
  const regex = /^(\(?[PQR]+[∧∨⊕]\(?.*\)?)+[PQR]+\)?$/;

  return regex.test(preposition);
}

function calculateTruthTable() {
  const prepositionRead = currentPreposition;
  if (!prepositionRead) {
    document.getElementById('truth-table').innerHTML = '';
    return;
  }

  if (!isValidPreposition(prepositionRead)) {
    return;
  }

  try {
    const truthTable = generateTruthTable(prepositionRead);
    document.getElementById('truth-table').innerHTML = truthTable;
  } catch (error) {
    if (!(error instanceof ReferenceError) && !(error instanceof SyntaxError)) {
      console.error(error);
    }
  }
}

function updatePrepositionOnPage() {
  document.getElementById('expression').textContent = currentPreposition;
}

