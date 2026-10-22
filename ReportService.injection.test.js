import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReportService } from './ReportService.js';

test('la responsabilité extraite peut être remplacée par injection', () => {
  const faux = { format: stats => `HT=${stats.revenueHT}` };
  const service = new ReportService({ csvFormatter: faux });
  assert.equal(service.generate('2026-09', 'csv'), 'HT=551');
});
