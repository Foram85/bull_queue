import { createObjectCsvWriter } from 'csv-writer';
import { mkdirSync, existsSync } from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

export async function generateInvalidCSV(rows: any[]): Promise<string> {
  const fileName = `${uuid()}-invalid-employees.csv`;

  const publicDir = path.join(__dirname, '..', '..', 'public', 'uploads');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const publicPath = path.join(publicDir, fileName);

  const csvWriter = createObjectCsvWriter({
    path: publicPath,
    header: Object.keys(rows[0] || {}).map((key) => ({ id: key, title: key })),
  });

  await csvWriter.writeRecords(rows);

  return `http://localhost:3000/static/uploads/${fileName}`;
}
