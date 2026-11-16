export const MAX_CSV_BYTES = 100 * 1024;
export const MAX_STUDENTS = 500;
const clean = value => String(value ?? '').trim().normalize('NFC').replace(/\s+/g, ' ');
export const studentKey = row => JSON.stringify([clean(row.name).toLowerCase(), clean(row.grade).toLowerCase()]);

// RFC 4180 quoting, CRLF, UTF-8 BOM and embedded commas/newlines.
export function parseStudentCSV(text, defaultGrade = '') {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_CSV_BYTES) throw Error('Choose a CSV file smaller than 100 KB.');
  text = text.replace(/^\uFEFF/, '');
  const records = []; let row = [], field = '', quoted = false, closed = false;
  const cell = () => { row.push(field); field = ''; closed = false; };
  const line = () => { cell(); if (row.some(value => value.trim())) records.push(row); row = []; if (records.length > MAX_STUDENTS + 1) throw Error('Import up to 500 students at a time.'); };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { quoted = false; closed = true; } }
      else field += c;
    } else if (c === ',') cell();
    else if (c === '\r' || c === '\n') { if (c === '\r' && text[i + 1] === '\n') i++; line(); }
    else if (c === '"') { if (field || closed) throw Error('Invalid CSV quoting. Export the file as CSV and try again.'); quoted = true; }
    else { if (closed && !/\s/.test(c)) throw Error('Unexpected text after a quoted CSV value.'); if (!closed) field += c; }
  }
  if (quoted) throw Error('A quoted CSV value is missing its closing quote.');
  line();
  const headers = (records.shift() ?? []).map(value => clean(value).toLowerCase().replace(/[ _-]/g, ''));
  if (new Set(headers).size !== headers.length) throw Error('CSV column headings must be unique.');
  const find = names => headers.findIndex(h => names.includes(h));
  const name = find(['name', 'studentname', 'fullname']), first = find(['firstname', 'first']), last = find(['lastname', 'last']), grade = find(['grade']);
  if (name < 0 && (first < 0 || last < 0)) throw Error('Include a Name column, or First Name and Last Name columns.');
  if (!records.length) throw Error('The CSV has no students.');
  return records.map((values, index) => {
    if (values.length !== headers.length) throw Error(`CSV row ${index + 2} has the wrong number of columns.`);
    return validateStudent({name: name >= 0 ? values[name] : [values[first], values[last]].join(' '), grade: grade >= 0 && values[grade].trim() ? values[grade] : defaultGrade}, index + 2);
  });
}

export function validateStudent(row, line) {
  const name = typeof row?.name === 'string' ? clean(row.name) : '', grade = typeof row?.grade === 'string' ? clean(row.grade) : '';
  if (!name || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) throw Error(`Row ${line}: enter a name of up to 80 characters.`);
  if (!grade || grade.length > 60 || /[\u0000-\u001f\u007f]/.test(grade)) throw Error(`Row ${line}: supply a Grade column or choose a default grade (up to 60 characters).`);
  return {name, grade};
}

