import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { Readable, Transform } from 'stream';

export interface CsvColumn<T = any> {
  header: string;
  key: string;
  transform?: (value: unknown, item: T) => string;
}

@Injectable()
export class CsvService {
  /**
   * Streams data to a CSV response.
   * @param res Express response object
   * @param filename Desired filename (without extension)
   * @param columns Column definitions
   * @param data Array or Readable stream of objects
   */
  async streamCsv<T>(
    res: Response,
    filename: string,
    columns: CsvColumn<T>[],
    data: T[] | Readable | AsyncIterable<T>,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);

    // Write CSV header
    const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');
    res.write(headerRow + '\n');

    const csvTransform = new Transform({
      objectMode: true,
      transform(item: T, _encoding, callback) {
        try {
          const row = columns.map((col) => {
            const itemObj = item as Record<string, unknown>;
            let value = itemObj[col.key];
            if (col.transform) {
              value = col.transform(value, item);
            }
            if (value === null || value === undefined) {
              value = '';
            }
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
          });
          callback(null, row.join(',') + '\n');
        } catch (err) {
          callback(err as Error);
        }
      },
    });

    csvTransform.pipe(res);

    if (Array.isArray(data)) {
      for (const item of data) {
        csvTransform.write(item);
      }
      csvTransform.end();
    } else if (data instanceof Readable) {
      data.pipe(csvTransform);
    } else {
      // Handle AsyncIterable
      try {
        for await (const item of data) {
          csvTransform.write(item);
        }
        csvTransform.end();
      } catch (err) {
        csvTransform.emit('error', err);
      }
    }

    return new Promise((resolve, reject) => {
      res.on('finish', resolve);
      res.on('error', reject);
      csvTransform.on('error', (err) => {
        if (!res.headersSent) {
          reject(err);
        } else {
          // Headers already sent, we can't do much but end the response
          res.end();
          resolve();
        }
      });
    });
  }
}
