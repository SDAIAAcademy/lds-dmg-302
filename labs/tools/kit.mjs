// Lab kit of LDS-DMG-302. Node 20 or later, no dependencies, no network. Optional: every check it
// makes can also be made by hand or with spreadsheet formulas. Run from the course folder:
//
//   node labs/tools/kit.mjs lint  <requirements.csv>       Lab 1.1: the automatic part of the checklist
//   node labs/tools/kit.mjs trace <matrix.csv>             Lab 1.2: uncovered, partial, orphans, unknown ids
//   node labs/tools/kit.mjs oscal <catalogue.csv> <out.json>   Lab 1.2 stretch: an OSCAL-style catalogue
//
// The lint checks K2 (owner from the table of roles), K3 (no non-binding verb), K4 (a measure),
// K5 (evidence), K6 (no word that defeats audit) and flags a likely second obligation (K1).
// K7 and K8 and the meaning of the sentence are yours to judge.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILES = path.join(HERE, '..', 'files');

export const ROLES = ['المدير العام', 'لجنة إدارة البيانات', 'رئيس مكتب إدارة البيانات', 'مسؤول حماية البيانات الشخصية', 'منسق طلبات أصحاب البيانات', 'مدير أمن المعلومات', 'المستشار القانوني', 'مدير الإرشاد الزراعي', 'مدير المحطات البحثية', 'مدير وحدة الوثائق والمحفوظات', 'مدير تقنية المعلومات', 'مدير الاتصال المؤسسي', 'ممثل بيانات الأعمال', 'مختص بيانات الأعمال', 'مراجع التصنيف', 'مالك نظام الذكاء الاصطناعي', 'كاتب الوثيقة', 'كل موظف'];
export const BANNED = ['بشكل مناسب', 'مناسبة', 'معقولة', 'معقول', 'قدر المستطاع', 'قدر الإمكان', 'في أقرب وقت ممكن', 'أقرب وقت', 'عند الحاجة', 'فورًا', 'دوريًا', 'اللازمة', 'اللازم', 'المعنية', 'ما لم تقتض', 'الموثوقين', 'مع الحذر', 'الحساسة', 'المشروعة', 'المطلوبة'];
const SOFT = ['ينبغي', 'يُفضَّل', 'يفضل', 'يُنصح', 'ينصح', 'يُستحسن', 'نحرص', 'تحرص', 'يُرجى'];
const MODALS = /(يجب|يلتزم|تلتزم|لا يجوز|يُمنع|يمنع)/g;

export function parseCsv(text) {
  text = text.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const rows = []; let row = [], c = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"' && text[i + 1] === '"') { c += '"'; i++; } else if (ch === '"') q = false; else c += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(c); c = ''; }
    else if (ch === '\n') { row.push(c); rows.push(row); row = []; c = ''; }
    else c += ch;
  }
  if (c !== '' || row.length) { row.push(c); rows.push(row); }
  const good = rows.filter(r => r.some(x => x.trim() !== ''));
  if (!good.length) return [];
  const [head, ...body] = good;
  return body.map(r => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}
const load = f => {
  if (!fs.existsSync(f)) { console.log(`لم أجد الملف: ${path.basename(f)}`); process.exit(1); }
  return parseCsv(fs.readFileSync(f, 'utf8'));
};

export function lintRow(r) {
  const s = r.statement || '';
  const issues = [];
  if (!s) return ['فارغ'];
  if (!ROLES.includes(r.owner)) issues.push('K2 المالك ليس من جدول الأدوار');
  if (SOFT.some(w => s.includes(w))) issues.push('K3 فعل غير ملزم');
  if (!r.measure) issues.push('K4 لا مقياس');
  if (!r.evidence) issues.push('K5 لا دليل امتثال');
  const banned = BANNED.filter(w => s.includes(w));
  if (banned.length) issues.push('K6 ' + banned.map(w => '«' + w + '»').join(' '));
  if ((s.match(MODALS) || []).length > 1) issues.push('K1 أكثر من فعل ملزم: تحقق من أنه التزام واحد');
  return issues;
}

export function trace(matrix, catalogue, obligations) {
  const reqIds = new Set(catalogue.map(r => r.req_id));
  const used = new Set();
  const out = { uncovered: [], partial: [], unknown: [], orphans: [], rows: 0 };
  const obIds = new Set(obligations.map(o => o.obligation_id));
  for (const m of matrix) {
    if (!obIds.has(m.obligation_id)) { out.unknown.push(m.obligation_id); continue; }
    const ids = (m.req_ids || '').split(/[\s;،,]+/).filter(Boolean);
    if (ids.length) out.rows++;
    for (const id of ids) { if (reqIds.has(id)) used.add(id); else out.unknown.push(id); }
    if (!ids.length || m.coverage === 'لا تغطية') out.uncovered.push(m.obligation_id);
    else if (m.coverage === 'جزئية') out.partial.push(m.obligation_id);
  }
  for (const o of obligations) if (!matrix.some(m => m.obligation_id === o.obligation_id)) out.uncovered.push(o.obligation_id);
  out.orphans = [...reqIds].filter(id => !used.has(id));
  return out;
}

const uuid = s => { const h = crypto.createHash('sha1').update('lds-dmg-302:' + s).digest('hex'); return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`; };
export function oscal(catalogue, obligations) {
  const groups = [...new Set(catalogue.map(r => r.domain))].map((d, i) => ({
    id: 'g' + (i + 1), title: d,
    controls: catalogue.filter(r => r.domain === d).map(r => ({
      id: r.req_id.toLowerCase(), title: r.title,
      props: [{ name: 'owner', value: r.owner }, { name: 'priority', value: r.priority }, { name: 'evidence', value: r.evidence }],
      links: (r.cited_sources || '').split(/[\s;،,]+/).filter(Boolean).map(s => ({ href: '#' + uuid(s), rel: 'reference', text: s })),
      parts: [{ id: r.req_id.toLowerCase() + '_smt', name: 'statement', prose: r.statement }]
    }))
  }));
  return { catalog: {
    uuid: uuid('catalogue'),
    metadata: { title: 'كتالوج متطلبات مِذراة (تدريبي)', 'last-modified': '2027-02-01T00:00:00Z', version: '0.1', 'oscal-version': '1.2.3' },
    groups,
    'back-matter': { resources: obligations.map(o => ({ uuid: uuid(o.obligation_id), title: o.obligation_id + ' · ' + o.instrument_name, description: o.passage })) }
  } };
}

function main() {
  const [cmd, a, b] = process.argv.slice(2);
  if (cmd === 'lint') {
    const rows = load(a || path.join(FILES, 'd1_1', 'requirements_template.csv'));
    let pass = 0, empty = 0;
    for (const r of rows) {
      const issues = lintRow(r);
      if (issues[0] === 'فارغ') { empty++; continue; }
      if (!issues.length) pass++;
      console.log(`${r.w_id || ''} ${r.req_no || ''}: ${issues.length ? issues.join(' | ') : 'يجتاز الفحص الآلي'}`);
    }
    console.log(`المتطلبات: ${rows.length - empty}، اجتاز الفحص الآلي: ${pass}، فارغ: ${empty}. البندان K7 وK8 والمعنى تحكم عليها أنت.`);
  } else if (cmd === 'trace') {
    const m = load(a || path.join(FILES, 'd1_2', 'trace_matrix_template.csv'));
    const cat = load(path.join(FILES, 'd1_2', 'catalogue.csv'));
    const ob = load(path.join(FILES, 'd1_2', 'obligations.csv'));
    const t = trace(m, cat, ob);
    console.log(`التزامات مربوطة: ${t.rows} من ${ob.length}`);
    console.log(`التزامات مكشوفة: ${t.uncovered.join(' ') || 'لا شيء'}`);
    console.log(`تغطية جزئية: ${t.partial.join(' ') || 'لا شيء'}`);
    console.log(`متطلبات لا مصدر لها في المصفوفة: ${t.orphans.join(' ') || 'لا شيء'}`);
    console.log(`معرّفات غير معروفة: ${t.unknown.join(' ') || 'لا شيء'}`);
  } else if (cmd === 'oscal') {
    const cat = load(a || path.join(FILES, 'd1_2', 'catalogue.csv'));
    const ob = load(path.join(FILES, 'd1_2', 'obligations.csv'));
    const out = b || 'catalogue_oscal.json';
    fs.writeFileSync(out, JSON.stringify(oscal(cat, ob), null, 2) + '\n');
    console.log(`كُتب ${path.basename(out)}: ${cat.length} متطلبًا في مجموعات بحسب المجال، و${ob.length} مرجعًا في الملحق.`);
  } else {
    console.log('الأوامر: lint <ملف المتطلبات> | trace <ملف المصفوفة> | oscal <ملف الكتالوج> <ملف الناتج>');
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
