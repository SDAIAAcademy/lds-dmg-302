// Runs the reference solution of every lab against the participants' files and prints PASS or the
// first difference. Node 20 or later, no dependencies, no network, writes nothing outside the
// system's temporary folder (the OSCAL file of the stretch, deleted at the end).
//
//     node labs/solutions/check.mjs                 every lab
//     node labs/solutions/check.mjs prework 1.2     some of them (prework, 1.1, 1.2, 2.1, 2.2, capstone)
//
// Recomputed from the files, not from the generator: the document map from documents.html; the
// defects of the weak statements and the lint of the reference rewrite with the lab kit; the
// matrix, the orphans, the wrong citation and the OSCAL catalogue with the lab kit; the verdict of
// every reference of the assistant draft against the source pack; the comment log, the exception
// register and segregation of duties. No lab calls a model.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { parseCsv, lintRow, trace, oscal, BANNED } from '../tools/kit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILES = path.join(HERE, '..', 'files');
const REF = path.join(HERE, 'reference');
const only = process.argv.slice(2);
const read = (base, rel) => fs.readFileSync(path.join(base, rel), 'utf8').replace(/^﻿/, '');
const table = (base, rel) => parseCsv(read(base, rel));
const stats = JSON.parse(read(REF, 'stats.json'));
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

let failed = 0;
function lab(id, fn) {
  if (only.length && !only.includes(id)) return;
  try { const out = fn(); console.log(`${id}: ${out}\nPASS ${id}`); }
  catch (e) { failed++; console.log(`FAIL ${id}: ${e.message}`); }
}

lab('prework', () => {
  const html = read(FILES, 'prework/documents.html');
  const brief = read(FILES, 'prework/guide.html');
  const reviewDate = brief.match(/(\d{4}-\d{2}-\d{2})/)[1];
  const cards = [...html.matchAll(/<div class="card" id="(DOC-\d\d)">([\s\S]*?)<\/div>/g)];
  assert.equal(cards.length, 12, 'twelve documents');
  const key = table(REF, 'document_map_key.csv');
  const meta = (body, k) => { const m = body.match(new RegExp('<b>' + k + ':</b> ([^<]*)')); return m ? decode(m[1]).trim() : ''; };
  let overdue = 0, noVersion = 0, noOwner = 0;
  for (const [, id, body] of cards) {
    const k = key.find(x => x.doc_id === id);
    const review = meta(body, 'المراجعة التالية');
    const reviewOk = /^\d{4}-\d{2}-\d{2}$/.test(review) && review >= reviewDate ? 'نعم' : 'لا';
    assert.equal(k.review_ok, reviewOk, id + ' review');
    const versionOk = meta(body, 'الإصدار') === 'غير مذكور' ? 'لا' : 'نعم';
    assert.equal(k.version_ok, versionOk, id + ' version');
    if (reviewOk === 'لا') overdue++;
    if (versionOk === 'لا') noVersion++;
    if (k.owner_ok === 'لا') noOwner++;
    assert.equal(k.declared_type, meta(body, 'النوع المعلن'), id + ' declared type');
  }
  const findings = table(REF, 'findings_key.csv');
  assert.equal(findings.length, stats.findings);
  const used = new Set(key.flatMap(k => k.findings.split(' ').filter(Boolean)));
  for (const f of findings) assert.ok(used.has(f.finding_id), f.finding_id + ' used in the map');
  const typeChanged = key.filter(k => k.declared_type !== k.type_by_content).length;
  return `12 documents; review date passed or missing ${overdue}; no version ${noVersion}; no valid owner ${noOwner}; type differs from the declared ${typeChanged}; findings ${findings.length}`;
});

lab('1.1', () => {
  const weak = table(FILES, 'd1_1/weak_statements.csv');
  assert.equal(weak.length, 15);
  const ref = table(REF, 'rewrite_reference.csv');
  // every original's K6 defect is found by the kit, and no original without it has a banned word
  for (const w of weak) {
    const defects = ref.find(r => r.w_id === w.w_id).defects_of_original.split(' ');
    const banned = BANNED.some(b => w.statement.includes(b));
    assert.equal(banned, defects.includes('K6'), w.w_id + ' K6');
    assert.ok(lintRow({ statement: w.statement, owner: '', measure: '', evidence: '' }).length > 0, w.w_id + ' original passes');
  }
  // the reference rewrite passes the automatic part of the checklist
  for (const r of ref) assert.deepEqual(lintRow(r), [], r.w_id + '.' + r.req_no + ': ' + lintRow(r).join(' | '));
  for (const w of weak) assert.ok(ref.some(r => r.w_id === w.w_id), w.w_id + ' rewritten');
  assert.equal(ref.length, stats.reference_requirements);
  // the template lints without crashing
  const tpl = table(FILES, 'd1_1/requirements_template.csv');
  assert.ok(tpl.every(r => lintRow(r)[0] === 'فارغ'));
  const split = ref.filter(r => r.req_no === '2').length;
  return `15 statements rewritten as ${ref.length} requirements (${split} statements split); every reference row passes the kit's lint`;
});

lab('1.2', () => {
  const ob = table(FILES, 'd1_2/obligations.csv');
  const cat = table(FILES, 'd1_2/catalogue.csv');
  const m = table(REF, 'trace_matrix_reference.csv');
  assert.equal(ob.length, stats.obligations); assert.equal(cat.length, stats.catalogue);
  const t = trace(m, cat, ob);
  assert.deepEqual(t.uncovered, ['A-7', 'B-6', 'C-4']);
  assert.deepEqual(t.partial, ['A-2']);
  assert.deepEqual(t.orphans, ['R-18', 'R-19', 'R-20']);
  assert.deepEqual(t.unknown, []);
  assert.equal(t.uncovered.length, stats.uncovered); assert.equal(t.orphans.length, stats.orphans);
  // the citations the office wrote differ from the reference matrix in exactly one requirement
  const refOf = id => m.filter(r => r.req_ids.split(' ').includes(id)).map(r => r.obligation_id).sort().join(' ');
  const wrong = cat.filter(r => r.cited_sources && r.cited_sources.split(' ').sort().join(' ') !== refOf(r.req_id) && !(refOf(r.req_id).includes(r.cited_sources)));
  assert.deepEqual(wrong.map(r => r.req_id), ['R-05']);
  // a participant who trusts the cited sources sees A-6 uncovered
  const naive = ob.map(o => ({ obligation_id: o.obligation_id, req_ids: cat.filter(r => r.cited_sources.split(' ').includes(o.obligation_id)).map(r => r.req_id).join(' '), coverage: '' }));
  const tn = trace(naive, cat, ob);
  assert.ok(tn.uncovered.includes('A-6'));
  // the template does not crash the kit
  const tt = trace(table(FILES, 'd1_2/trace_matrix_template.csv'), cat, ob);
  assert.equal(tt.uncovered.length, 19);
  // new requirements carry no word that defeats audit
  for (const r of table(REF, 'new_requirements_reference.csv')) assert.ok(!BANNED.some(b => r.new_requirement.includes(b)), r.obligation_id);
  // the OSCAL-style catalogue: every link resolves to a resource of the back matter
  const o = oscal(cat, ob).catalog;
  const res = new Set(o['back-matter'].resources.map(r => r.uuid));
  const controls = o.groups.flatMap(g => g.controls);
  assert.equal(controls.length, 20);
  for (const c of controls) for (const l of c.links) assert.ok(res.has(l.href.slice(1)), c.id);
  const tmp = path.join(os.tmpdir(), 'lds-dmg-302-oscal-check.json');
  fs.writeFileSync(tmp, JSON.stringify({ catalog: o }));
  assert.equal(JSON.parse(fs.readFileSync(tmp, 'utf8')).catalog.groups.length, o.groups.length);
  fs.unlinkSync(tmp);
  return `19 obligations, 20 requirements: ${stats.covered_full} full, ${t.partial.length} partial (${t.partial}), uncovered ${t.uncovered.join(' ')}, orphans ${t.orphans.join(' ')}; one wrong citation (R-05) that makes A-6 look uncovered; OSCAL-style catalogue with ${controls.length} controls in ${o.groups.length} groups`;
});

lab('2.1', () => {
  const draft = read(FILES, 'd2_1/assistant_draft.md');
  const pack = decode(read(FILES, 'd2_1/source_pack.html'));
  const log = table(REF, 'source_check_reference.csv');
  assert.equal(log.length, stats.references_in_draft);
  for (const r of log) assert.equal((draft.match(new RegExp('\\[' + r.ref_id + '\\]', 'g')) || []).length, 1, r.ref_id + ' once in the draft');
  // the facts behind the verdicts are in the pack
  assert.ok(pack.includes('ثلاث وأربعون مادة'), 'article count in the pack');
  assert.ok(!pack.includes('P120'), 'no P120 in the pack');
  assert.ok(pack.includes('من DG.1 إلى DG.8'), 'DG range in the pack');
  assert.ok(pack.includes('مقيد فأعلى') && pack.includes('بيانات «عامة»'), 'guideline words in the pack');
  assert.ok(!pack.includes('مهما كانت استضافة'), 'the misattributed words are not in the pack');
  const v = k => log.filter(r => r.verdict === k).length;
  assert.equal(v('صحيح'), stats.references_correct); assert.equal(v('مختلق'), stats.references_invented);
  assert.equal(v('منسوب خطأ') + v('يناقض المصدر'), stats.references_misrepresented);
  // the reference text keeps the guideline's words and labels the Centre's own rules
  const std = read(REF, 'standard_reference.md');
  assert.ok(std.includes('نص الإرشادات (S-1)') && std.includes('نص الإرشادات (S-2)') && std.includes('قاعدة المركز'));
  return `8 references: ${v('صحيح')} correct, ${v('مختلق')} invented, ${v('منسوب خطأ')} misattributed, ${v('يناقض المصدر')} contradicts its source`;
});

lab('2.2', () => {
  const v09 = read(FILES, 'd2_2/standard_v0_9.md');
  const log = table(REF, 'comment_log_reference.csv');
  const cards = decode(read(FILES, 'd2_2/role_cards.html'));
  assert.equal(log.length, 12);
  for (const c of log) {
    assert.ok(cards.includes(c.comment_id), c.comment_id + ' on a card');
    for (const id of c.on.match(/AI-\d\d/g) || []) assert.ok(v09.includes('**' + id + '**'), c.comment_id + ' refers to ' + id);
    assert.ok(c.reason_and_text_change.length > 20, c.comment_id + ' has a reason');
  }
  const count = d => log.filter(c => c.disposition === d).length;
  assert.equal(count('قبول'), stats.accepted); assert.equal(count('قبول مع تعديل'), stats.accepted_with_change); assert.equal(count('رفض'), stats.rejected);
  const reg = table(REF, 'exception_register_reference.csv');
  const reqs = decode(read(FILES, 'd2_2/exception_requests.html'));
  assert.equal(reg.length, 3);
  for (const x of reg) {
    assert.ok(reqs.includes(x.exception_id) && reqs.includes(x.requester), x.exception_id + ' in the requests');
    assert.ok(x.approver !== x.requester && x.assessor !== x.requester && x.assessor !== x.approver, x.exception_id + ' segregation of duties');
    const days = Number(x.expiry_days);
    if (x.decision.startsWith('قبول')) { assert.ok(days > 0 && days <= 90, x.exception_id + ' expires within 90 days'); assert.ok(x.review_triggers && x.compensating_controls, x.exception_id + ' triggers and controls'); }
    // a requirement that is the guideline's text is never excepted
    for (const id of x.requirement.match(/AI-\d\d/g)) {
      const line = v09.split('\n').find(l => l.includes('**' + id + '**'));
      if (line.includes('نص الإرشادات')) assert.equal(x.decision, 'رفض', x.exception_id + ' excepts national text');
    }
  }
  const change = decode(read(FILES, 'd2_2/regulatory_change.html'));
  assert.ok(change.includes('قائمة يعتمدها رئيس الجهة'));
  const x2 = reg.find(x => x.exception_id === 'X-02');
  assert.ok(x2.requirement.includes('AI-04') && x2.status_after_change.startsWith('معلّق'), 'X-02 changes after the circular');
  return `12 comments: ${count('قبول')} accepted, ${count('قبول مع تعديل')} accepted with change, ${count('رفض')} rejected; exceptions ${reg.map(x => x.exception_id + ' ' + x.decision + (Number(x.expiry_days) ? ' ' + x.expiry_days + ' days' : '')).join('; ')}; X-02 suspended by the circular`;
});

lab('capstone', () => {
  const key = read(REF, 'capstone_key.md');
  const v09 = read(FILES, 'd2_2/standard_v0_9.md');
  const ids = [...key.matchAll(/^\| (AI-\d\d) \|/gm)].map(m => m[1]);
  assert.ok(ids.length >= 8);
  for (const id of ids) assert.ok(v09.includes('**' + id + '**'), id + ' exists in the standard');
  return `${ids.length} committee challenges, each on a requirement of the consultation draft`;
});

if (failed) { console.log(`${failed} failed`); process.exit(1); }
console.log('all checks passed');
