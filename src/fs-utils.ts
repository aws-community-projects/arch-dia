import * as fs from 'fs';

function writeFile (file: string, val: string): void {
  fs.writeFileSync(file, val);
}

function readFile (file: string): string {
  return fs.readFileSync(file, 'utf8');
}

export { writeFile, readFile };
