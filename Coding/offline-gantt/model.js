/* Independent teaching example. No imports from the historical application. */
(function (root) {
  'use strict';
  const DAY = 86400000;
  const resources = Object.freeze(['Cloud sculpture', 'Comet display', 'Harbor model']);
  const seed = [
    { id: 'DEMO-01', resource: resources[0], start: '2026-05-30', end: '2026-06-05' },
    { id: 'DEMO-02', resource: resources[0], start: '2026-06-05', end: '2026-06-09' },
    { id: 'DEMO-03', resource: resources[1], start: '2026-06-03', end: '2026-06-08' },
    { id: 'DEMO-04', resource: resources[2], start: '2026-06-10', end: '2026-06-18' },
    { id: 'DEMO-05', resource: resources[1], start: '2026-06-20', end: '2026-06-25' }
  ];
  function day(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('Use a date in YYYY-MM-DD format.');
    }
    const time = Date.parse(value + 'T00:00:00Z');
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) {
      throw new Error('Choose a valid calendar date.');
    }
    return time / DAY;
  }
  function addDays(value, count) {
    if (!Number.isInteger(count)) throw new Error('Day offset must be an integer.');
    return new Date((day(value) + count) * DAY).toISOString().slice(0, 10);
  }
  function validate(booking) {
    if (!booking || !booking.id || !resources.includes(booking.resource)) {
      throw new Error('A booking needs an ID and a known synthetic resource.');
    }
    if (day(booking.end) <= day(booking.start)) throw new Error('End must be after start.');
    return booking;
  }
  function bookings(scenario) {
    if (!['normal', 'overlap', 'empty'].includes(scenario)) throw new Error('Unknown scenario.');
    if (scenario === 'empty') return [];
    const result = seed.map(item => ({ ...item }));
    if (scenario === 'overlap') {
      result.push({ id: 'DEMO-06', resource: resources[0], start: '2026-06-04', end: '2026-06-07' });
    }
    return result;
  }
  function overlaps(a, b) {
    validate(a); validate(b);
    return a.resource === b.resource && day(a.start) < day(b.end) && day(b.start) < day(a.end);
  }
  function conflicts(items) {
    const ids = new Set();
    items.forEach((item, index) => {
      validate(item);
      for (let next = index + 1; next < items.length; next += 1) {
        if (overlaps(item, items[next])) { ids.add(item.id); ids.add(items[next].id); }
      }
    });
    return ids;
  }
  function visible(items, start, span, resource = 'all') {
    const first = day(start);
    if (!Number.isInteger(span) || span < 1) throw new Error('Window must contain whole days.');
    if (resource !== 'all' && !resources.includes(resource)) throw new Error('Unknown resource.');
    return items.filter(item => {
      validate(item);
      return (resource === 'all' || item.resource === resource) &&
        day(item.start) < first + span && day(item.end) > first;
    }).map(item => ({
      ...item,
      offset: Math.max(0, day(item.start) - first),
      width: Math.min(first + span, day(item.end)) - Math.max(first, day(item.start))
    }));
  }
  const api = { resources, day, addDays, validate, bookings, overlaps, conflicts, visible };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GanttDemo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
