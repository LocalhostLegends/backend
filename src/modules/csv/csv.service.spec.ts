import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { Readable, Writable } from 'stream';
import { CsvService } from './csv.service';

describe('CsvService', () => {
  let service: CsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvService],
    }).compile();

    service = module.get<CsvService>(CsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should stream CSV data correctly', async () => {
    let output = '';
    const mockResponse = new Writable({
      write(chunk, encoding, callback) {
        output += chunk.toString();
        callback();
      },
    }) as any;

    mockResponse.setHeader = jest.fn();
    mockResponse.headersSent = false;

    const columns = [
      { header: 'ID', key: 'id' },
      { header: 'Name', key: 'name' },
    ];

    const data = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane "Quotes" Doe' },
    ];

    await service.streamCsv(mockResponse, 'test', columns, data);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="test.csv"',
    );

    expect(output).toContain('"ID","Name"\n');
    expect(output).toContain('"1","John Doe"\n');
    expect(output).toContain('"2","Jane ""Quotes"" Doe"\n');
  });

  it('should handle readable stream as data source', async () => {
    let output = '';
    const mockResponse = new Writable({
      write(chunk, encoding, callback) {
        output += chunk.toString();
        callback();
      },
    }) as any;

    mockResponse.setHeader = jest.fn();

    const columns = [{ header: 'Value', key: 'val' }];
    const dataStream = Readable.from([{ val: 'A' }, { val: 'B' }]);

    await service.streamCsv(mockResponse, 'test-stream', columns, dataStream);

    expect(output).toContain('"Value"\n');
    expect(output).toContain('"A"\n');
    expect(output).toContain('"B"\n');
  });
});
