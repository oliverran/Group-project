'use strict';
(function () {
  const model = window.GanttDemo;
  const $ = id => document.getElementById(id);
  const initial = () => ({ scenario: 'normal', resource: 'all', span: 14, start: '2026-06-01', selected: null, lesson: 0 });
  let state = initial();
  const lessons = [
    ['Read a booking', 'Click DEMO-01. It starts before the window, so its bar is clipped. Its full dates remain visible in the inspector.'],
    ['Compare the window', 'The 28-day view reveals DEMO-05 later in June. Try Earlier, Later, and the resource filter; they change the view, not the underlying bookings.'],
    ['Find an overlap', 'Three Cloud sculpture bookings now carry a Conflict label. DEMO-01 and DEMO-02 only touch, but the extra DEMO-06 overlaps both.']
  ];
  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  model.resources.forEach(resource => {
    const option = node('option', resource); option.value = resource; $('resource').append(option);
  });
  function select(id, source) {
    state.selected = id; render();
    document.querySelector(`[data-booking="${id}"][data-source="${source}"]`).focus({ preventScroll: true });
  }
  function render() {
    const items = model.bookings(state.scenario);
    const rows = model.visible(items, state.start, state.span, state.resource);
    const conflicts = model.conflicts(items);
    if (!rows.some(item => item.id === state.selected)) state.selected = null;
    for (const key of ['scenario', 'resource', 'span']) $(key).value = String(state[key]);
    $('step-count').textContent = `LESSON ${state.lesson + 1} OF 3`;
    $('lesson-title').textContent = lessons[state.lesson][0];
    $('lesson-text').textContent = lessons[state.lesson][1];
    $('lesson-back').disabled = state.lesson === 0;
    $('lesson-next').disabled = state.lesson === 2;
    $('window-label').textContent = `${state.start} to ${model.addDays(state.start, state.span - 1)} · ${state.span} days`;
    const conflictCount = rows.filter(item => conflicts.has(item.id)).length;
    $('summary').textContent = `${rows.length} visible bookings · ${conflictCount} with conflicts`;
    const chart = $('chart'); chart.replaceChildren(); chart.style.setProperty('--days', state.span);
    const axis = node('div', undefined, 'axis'); axis.append(node('span', 'Resource / day of month'));
    const ticks = node('div', undefined, 'ticks');
    for (let offset = 0; offset < state.span; offset += 1) {
      const date = model.addDays(state.start, offset); const tick = node('span', date.slice(-2)); tick.title = date; ticks.append(tick);
    }
    axis.append(ticks); chart.append(axis);
    const resources = state.resource === 'all' ? model.resources : [state.resource];
    resources.forEach(resource => {
      const row = node('div', undefined, 'resource-row'); row.append(node('div', resource, 'resource-name'));
      const lanes = node('div', undefined, 'lanes'); const matches = rows.filter(item => item.resource === resource);
      if (!matches.length) lanes.append(node('p', 'No bookings in this window', 'lane-empty'));
      matches.forEach(item => {
        const lane = node('div', undefined, 'bar-row');
        const isConflict = conflicts.has(item.id);
        const label = `${item.id}${isConflict ? ' · Conflict' : ''}`;
        const bar = node('button', label, `bar${isConflict ? ' conflict' : ''}`); bar.type = 'button';
        bar.style.left = `${item.offset / state.span * 100}%`; bar.style.width = `${item.width / state.span * 100}%`;
        bar.title = `${label}: ${item.resource}, ${item.start} to ${item.end} (end exclusive)`;
        bar.setAttribute('aria-label', bar.title); bar.setAttribute('aria-pressed', String(state.selected === item.id));
        bar.dataset.booking = item.id; bar.dataset.source = 'chart';
        bar.addEventListener('click', () => select(item.id, 'chart')); lane.append(bar); lanes.append(lane);
      });
      row.append(lanes); chart.append(row);
    });
    const tbody = $('booking-rows'); tbody.replaceChildren();
    rows.forEach(item => {
      const tr = node('tr'); const td = node('td'); const button = node('button', item.id); button.type = 'button';
      button.dataset.booking = item.id; button.dataset.source = 'table';
      button.addEventListener('click', () => select(item.id, 'table')); td.append(button); tr.append(td);
      for (const value of [item.resource, item.start, item.end, conflicts.has(item.id) ? 'Conflict' : 'No conflict']) tr.append(node('td', value));
      tbody.append(tr);
    });
    if (!rows.length) { const tr = node('tr'); const td = node('td', 'No bookings in this window. Try another scenario or Reset demo.'); td.colSpan = 5; tr.append(td); tbody.append(tr); }
    const selected = rows.find(item => item.id === state.selected); const panel = $('selection'); panel.replaceChildren();
    panel.append(node('h3', selected ? `${selected.id} · ${selected.resource}` : 'Inspect a booking'));
    panel.append(node('p', selected ? `${selected.start} to ${selected.end} (end exclusive). ${model.day(selected.end) - model.day(selected.start)} days. ${conflicts.has(selected.id) ? 'Conflict: another booking overlaps this resource.' : 'No conflict for this resource.'}` : 'Select a bar or a booking ID in the table.'));
  }
  function lesson(change) {
    const index = Math.min(2, Math.max(0, state.lesson + change));
    state = initial(); state.lesson = index;
    if (index === 1) state.span = 28;
    if (index === 2) state.scenario = 'overlap';
    render();
  }
  for (const key of ['scenario', 'resource', 'span']) $(key).addEventListener('change', event => {
    state[key] = key === 'span' ? Number(event.target.value) : event.target.value; render();
  });
  $('earlier').addEventListener('click', () => { state.start = model.addDays(state.start, -state.span); render(); });
  $('later').addEventListener('click', () => { state.start = model.addDays(state.start, state.span); render(); });
  $('reset').addEventListener('click', () => { state = initial(); render(); });
  $('lesson-back').addEventListener('click', () => lesson(-1));
  $('lesson-next').addEventListener('click', () => lesson(1));
  render();
})();
