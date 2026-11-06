'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const m = require('./model.js');

test('calendar parsing rejects invalid and normalized dates', () => {
  for (const input of ['2026-02-29', '2026-13-01', '2026-06-31', '2026-1-1', '', null]) assert.throws(() => m.day(input));
  assert.equal(m.addDays('2024-02-28', 1), '2024-02-29');
});
test('UTC day arithmetic is stable across DST and year boundaries', () => {
  assert.equal(m.addDays('2026-03-28', 2), '2026-03-30');
  assert.equal(m.addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(m.addDays('2026-01-01', -1), '2025-12-31');
  assert.throws(() => m.addDays('2026-01-01', .5));
});
test('fixtures are synthetic, valid, unique, and independent copies', () => {
  const items = m.bookings('normal');
  items.forEach(item => { m.validate(item); assert.match(item.id, /^DEMO-\d{2}$/); });
  assert.equal(new Set(items.map(item => item.id)).size, items.length);
  items[0].start = '1900-01-01';
  assert.equal(m.bookings('normal')[0].start, '2026-05-30');
});
test('typical data has no conflicts; touching endpoints are available', () => {
  const items = m.bookings('normal');
  assert.equal(m.conflicts(items).size, 0);
  assert.equal(m.overlaps(items[0], items[1]), false);
});
test('overlap scenario marks both sides and only the same resource', () => {
  const items = m.bookings('overlap');
  assert.deepEqual([...m.conflicts(items)].sort(), ['DEMO-01', 'DEMO-02', 'DEMO-06']);
  assert.equal(m.overlaps(items[0], items[2]), false);
});
test('bars are clipped at both ends without mutating full dates', () => {
  const rows = m.visible(m.bookings('normal'), '2026-06-01', 14);
  assert.equal(rows.length, 4);
  assert.deepEqual([rows[0].offset, rows[0].width, rows[0].start], [0, 4, '2026-05-30']);
  assert.deepEqual([rows[3].offset, rows[3].width, rows[3].end], [9, 5, '2026-06-18']);
});
test('a larger window reveals later bookings', () => {
  assert.equal(m.visible(m.bookings('normal'), '2026-06-01', 28).length, 5);
});
test('window boundaries exclude bookings ending at start or starting at end', () => {
  const items = m.bookings('normal');
  assert.equal(m.visible([items[0]], '2026-06-05', 1).length, 0);
  assert.equal(m.visible([items[1]], '2026-06-01', 4).length, 0);
});
test('resource filters and empty windows are deterministic', () => {
  assert.equal(m.visible(m.bookings('normal'), '2026-06-01', 14, 'Cloud sculpture').length, 2);
  assert.deepEqual(m.visible(m.bookings('normal'), '2027-01-01', 14), []);
  assert.deepEqual(m.bookings('empty'), []);
  assert.equal(m.conflicts([]).size, 0);
});
test('invalid input fails clearly', () => {
  assert.throws(() => m.bookings('real'));
  assert.throws(() => m.visible([], '2026-06-01', 0));
  assert.throws(() => m.visible([], '2026-06-01', 1.5));
  assert.throws(() => m.visible([], '2026-06-01', 14, 'unknown'));
  assert.throws(() => m.validate({ id: 'x', resource: m.resources[0], start: '2026-06-02', end: '2026-06-02' }));
  assert.throws(() => m.validate({ id: 'x', resource: 'unknown', start: '2026-06-01', end: '2026-06-02' }));
});
test('every rendered interval fits the window over many offsets', () => {
  for (let offset = -30; offset <= 30; offset += 1) {
    for (const span of [1, 14, 28]) {
      for (const row of m.visible(m.bookings('overlap'), m.addDays('2026-06-01', offset), span)) {
        assert.ok(row.offset >= 0 && row.width > 0 && row.offset + row.width <= span);
      }
    }
  }
});
test('runtime uses only local assets, no network or historical data integration', () => {
  for (const file of ['index.html', 'app.js', 'model.js', 'style.css']) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    assert.doesNotMatch(content, /https?:\/\/|fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|accounts\.db|airtable/i);
  }
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  assert.match(html, /connect-src 'none'/);
  for (const [, asset] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    assert.ok(fs.existsSync(path.join(__dirname, asset)), `missing local asset: ${asset}`);
  }
});
