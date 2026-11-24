// Writes every participant file under labs/files/ and every reference answer under
// labs/solutions/reference/ from case.mjs and case_day2.mjs. Deterministic: the same bytes on
// every run. Node 20 or later, no dependencies, no network.
//
//     node labs/_tools/build_files.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from './case.mjs';
import * as D from './case_day2.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILES = path.join(HERE, '..', 'files');
const REF = path.join(HERE, '..', 'solutions', 'reference');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function write(base, rel, text) {
  const p = path.join(base, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text.replace(/\r\n/g, '\n'));
}
const cell = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = (head, rows) => '﻿' + [head, ...rows].map(r => r.map(cell).join(',')).join('\n') + '\n';

const STYLE = `body{font-family:"IBM Plex Sans Arabic","Segoe UI",Tahoma,sans-serif;max-width:52rem;margin:0 auto;padding:1rem;line-height:1.85;color:#1e2a36;background:#fbfaf7}
.bar{font-size:.85rem;background:#eef2f4;border:1px solid #d5dde2;border-radius:.4rem;padding:.4rem .8rem}
h1{font-size:1.4rem;line-height:1.5;margin:.8rem 0}h2{font-size:1.12rem;margin:1.4rem 0 .3rem}h3{font-size:1rem;margin:1rem 0 .2rem}
.card{border:1px solid #cfd8dc;border-radius:.4rem;padding:.6rem .9rem;margin:.8rem 0;background:#fff}
.meta{font-size:.88rem;color:#3d4a56;margin:.2rem 0 .5rem;padding:0;list-style:none}.meta li{display:inline-block;margin-inline-end:1rem}
.src{font-size:.85rem;color:#5b6773}
table{border-collapse:collapse;width:100%;font-size:.93rem}td,th{border:1px solid #cfd8dc;padding:.35rem .5rem;text-align:start;vertical-align:top}th{background:#eef2f4}
.ltr{direction:ltr;unicode-bidi:isolate;overflow-wrap:anywhere}
.warn{border:1px solid #b45309;background:#fff7ed;padding:.4rem .7rem;border-radius:.3rem}
ol.cl{padding-inline-start:1.4rem}ol.cl li{margin:.25rem 0}`;
const BAR = `<div class="bar">ملف تدريبي · ${esc(C.ORG)} جهة افتراضية، وكل وثائقها اصطناعية كتبها المقرر · نسخة تدريبية مصنفة «عام» · المقرر LDS-DMG-302</div>`;
const page = (title, body) => `<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title><style>${STYLE}</style></head>
<body>
${BAR}
<h1>${esc(title)}</h1>
${body}
</body>
</html>
`;
const ltr = s => `<span class="ltr">${esc(s)}</span>`;

// ---------------------------------------------------------------- the case brief and pre-work
const typesRows = Object.entries(C.TYPES).map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(v.what)}</td><td>${esc(v.approver)}</td><td>كل ${v.review} شهرًا</td></tr>`).join('\n');
write(FILES, 'case_brief.html', page(`${C.ORG}: الحالة`, `
<p>${esc(C.ORG)} جهة حكومية افتراضية في منطقة لا يُذكر اسمها. لها محطات بحثية، وعيادة نباتية، وبنك بذور، وخدمات إرشاد زراعي للمزارعين المسجلين في سجل المزارعين، ونحو 900 موظف.</p>
<p>كتبت وحدات مختلفة وثائق حوكمة البيانات على مدى ست سنوات، فتراكمت اثنتا عشرة وثيقة بأنواع وصيغ متفاوتة. يراجع مكتب إدارة البيانات المجموعة كلها في ${esc(C.REVIEW_DATE)}، ويريد أن يستبدل بالتعميم القديم عن أدوات الذكاء الاصطناعي التوليدي معيارًا يُطرح للتشاور ويُعرض على لجنة إدارة البيانات.</p>
<h2>الأشخاص</h2>
<div class="card"><b>رهام الثميري</b>، رئيس مكتب إدارة البيانات، مالكة مجموعة الوثائق ومعيار الذكاء الاصطناعي.</div>
<div class="card"><b>فارس الهجاني</b>، المستشار القانوني.</div>
<div class="card"><b>عبير الضويحي</b>، مدير أمن المعلومات.</div>
<div class="card"><b>مهند السليمي</b>، مدير الإرشاد الزراعي.</div>
<p>وبقية الأدوار بأسمائها الوظيفية: المدير العام، ولجنة إدارة البيانات (يرأسها نائب المدير العام)، ومسؤول حماية البيانات الشخصية، وممثل الموظفين في لجنة التشاور.</p>
<h2>هيكل الوثائق ومسارات الاعتماد (قاعدة المركز)</h2>
<p>يُحدد نوع الوثيقة بمحتواها لا بعنوانها. هذه قاعدة المركز في الحالة، لا نص وطني.</p>
<table><tr><th>النوع</th><th>ما تحتويه</th><th>من يعتمدها</th><th>المراجعة</th></tr>
${typesRows}</table>
<h2>ضبط الوثيقة</h2>
<p>لكل وثيقة: رمز، وعنوان، ونوع، ومالك (دور قائم لا وحدة ملغاة)، ورقم إصدار، ومن اعتمدها وتاريخ الاعتماد، وتاريخ المراجعة التالية. وثيقة بلا واحد منها لا يُعرف من يحاسَب عليها ولا أي نسخة هي النافذة.</p>
<h2>الأدوار التي يجوز أن تملك متطلبًا</h2>
<p>${C.ROLES.map(esc).join('، ')}.</p>
`));

const docCard = d => {
  const meta = [['الرمز', d.id], ['النوع المعلن', d.declared], ['المالك', d.owner || 'غير مذكور'], ['الإصدار', d.version || 'غير مذكور'], ['اعتمدها', d.approver], ['تاريخ الاعتماد', d.approved], ['المراجعة التالية', d.review || 'غير مذكورة']];
  return `<div class="card" id="${d.id}">
<h2>${esc(d.id)} · ${esc(d.title)}</h2>
<ul class="meta">${meta.map(([k, v]) => `<li><b>${esc(k)}:</b> ${esc(v)}</li>`).join('')}</ul>
${d.note ? `<p class="src">${esc(d.note)}</p>` : ''}
<ol class="cl">${d.clauses.map(c => `<li>${esc(c.t)}${c.w ? ` <span class="src">(${ltr(c.w)})</span>` : ''}</li>`).join('')}</ol>
</div>`;
};
write(FILES, 'prework/documents.html', page('الوثائق الاثنتا عشرة', `
<p>هذه مجموعة وثائق حوكمة البيانات في ${esc(C.ORG)} كما وجدها مكتب إدارة البيانات. العبارات الموسومة من ${ltr('W-01')} إلى ${ltr('W-15')} هي العبارات الضعيفة التي تعيد صياغتها في المختبر 1.1.</p>
${C.DOCS.map(docCard).join('\n')}
`));
write(FILES, 'prework/document_map_template.csv', csv(['doc_id', 'title', 'declared_type', 'type_by_content', 'owner_ok', 'version_ok', 'review_ok', 'approval_route_ok', 'findings'], C.DOCS.map(d => [d.id, d.title, d.declared, '', '', '', '', '', ''])));
write(FILES, 'prework/guide.html', page('العمل التحضيري: خريطة الوثائق', `
<div class="card"><b>ستون دقيقة قبل اليوم الأول، دون ذكاء اصطناعي.</b> تخرج بخريطة لوثائق مِذراة الاثنتي عشرة، وهي دليل الناتج الأول وجزء من المختبرات المقيَّمة (5 من 100).</div>
<h2>الخطوات</h2>
<ol class="cl">
<li><b>اقرأ الحالة (10 دقائق).</b> ${ltr('case_brief.html')}: الأشخاص، وأنواع الوثائق الأربعة ومسارات اعتمادها، وحقول ضبط الوثيقة.</li>
<li><b>املأ الخريطة (40 دقيقة).</b> في ${ltr('document_map_template.csv')}، لكل وثيقة من ${ltr('documents.html')}: نوعها بمحتواها، وهل المالك والإصدار وتاريخ المراجعة (مقارنة بـ ${ltr(C.REVIEW_DATE)}) ومسار الاعتماد سليمة (نعم أو لا)، وما وجدته في عمود findings: فجوة أو تعارض مع وثيقة أخرى، بجملة لكل منها.</li>
<li><b>اختر ثلاث ملاحظات تأتي بها (10 دقائق).</b> أهم ثلاث ملاحظات في رأيك، ولماذا تؤثر في التدقيق.</li>
</ol>
<p class="src">«مختلطة» نوع مقبول في عمود type_by_content حين تجمع الوثيقة نوعين، فاكتب النوعين.</p>
`));

// ---------------------------------------------------------------- Lab 1.1
const weakRows = C.WEAK.map(w => { const d = C.DOCS.find(x => x.id === w.doc); const c = d.clauses.find(x => x.w === w.id); return [w.id, w.doc, d.title, c.t]; });
write(FILES, 'd1_1/weak_statements.csv', csv(['w_id', 'doc_id', 'doc_title', 'statement'], weakRows));
write(FILES, 'd1_1/requirements_template.csv', csv(['w_id', 'req_no', 'statement', 'owner', 'measure', 'evidence', 'source'], C.WEAK.map(w => [w.id, '1', '', '', '', '', w.doc])));
write(FILES, 'd1_1/term_base.csv', csv(['ar', 'en', 'avoid'], C.TERMS));
write(FILES, 'd1_1/drafting_checklist.html', page('قائمة التحقق للصياغة', `
<p>كل متطلب يجتاز البنود الثمانية. هذه القائمة قاعدة المركز في الحالة.</p>
<ol class="cl">${C.CHECKLIST.map(k => `<li><b>${ltr(k.id)}</b> ${esc(k.text)}</li>`).join('')}</ol>
<h2>الألفاظ التي تُفشل التدقيق (${ltr('K6')})</h2>
<p>${C.BANNED.map(b => '«' + esc(b) + '»').join('، ')}.</p>
<p class="src">لماذا تُفشل التدقيق: لا يستطيع مدققان أن يتفقا على أن «مدة معقولة» قد احتُرمت أو خولفت.</p>
<h2>صيغ الإلزام</h2>
<table><tr><th>القوة</th><th>الصيغة</th></tr>
<tr><td>إلزام</td><td>يجب أن، يلتزم، أو فعل مضارع بفاعل محدد: «يصنف ممثل بيانات الأعمال …»</td></tr>
<tr><td>منع</td><td>لا يجوز، لا يُدخل، لا ينشر</td></tr>
<tr><td>إجازة</td><td>يجوز (للاستثناء المحدد فقط)</td></tr>
<tr><td>توصية</td><td>يُوصى، ينبغي: في الإرشاد وحده</td></tr></table>
`));

// ---------------------------------------------------------------- Lab 1.2
const obligations = C.INSTRUMENTS.flatMap(i => i.items.map(([id, where, actor, text]) => [id, i.code, i.name, where, actor, text]));
write(FILES, 'd1_2/obligations.csv', csv(['obligation_id', 'instrument', 'instrument_name', 'passage', 'actor', 'obligation'], obligations));
write(FILES, 'd1_2/instruments.html', page('ثلاثة مراجع: مقتطفات بصياغة المقرر', `
<div class="warn">هذه صياغة مختصرة كتبها المقرر لمقاطع قُرئت في النص الرسمي العربي، وليست نص المرجع. المرجع في كل سطر يدلك على المادة أو البند لتقرأه بنفسك من صفحة الأنظمة والسياسات في سدايا.</div>
${C.INSTRUMENTS.map(i => `<h2>${esc(i.code)} · ${esc(i.name)}</h2><p class="src">${esc(i.note)}</p>
${i.items.map(([id, where, actor, text]) => `<div class="card"><b>${ltr(id)}</b> · <span class="src">${esc(where)}</span><br><b>${esc(actor)}:</b> ${esc(text)}</div>`).join('\n')}`).join('\n')}
`));
write(FILES, 'd1_2/catalogue.csv', csv(['req_id', 'domain', 'title', 'statement', 'owner', 'evidence', 'priority', 'cited_sources'], C.CATALOGUE));
write(FILES, 'd1_2/trace_matrix_template.csv', csv(['obligation_id', 'req_ids', 'coverage', 'note'], obligations.map(o => [o[0], '', '', ''])));

// ---------------------------------------------------------------- Lab 2.1
write(FILES, 'd2_1/standard_skeleton.md', D.SKELETON);
write(FILES, 'd2_1/assistant_draft.md', D.ASSISTANT_DRAFT);
write(FILES, 'd2_1/source_check_log_template.csv', csv(['ref_id', 'cited_as', 'source_checked', 'verdict', 'what_i_did'], D.REFS.map(r => [r.id, r.cited, '', '', ''])));
write(FILES, 'd2_1/standard_trace_template.csv', csv(['req_id', 'statement', 'source', 'guideline_text_or_centre_rule'], []));
write(FILES, 'd2_1/source_pack.html', page('حزمة المصادر لمعيار الذكاء الاصطناعي', `
<p>كل مرجع في مسودتك يُفحص هنا أولًا، ثم في النص الرسمي إن احتجت. ما بين علامتي التنصيص منقول بلفظه من النص الرسمي العربي؛ وما سواه صياغة المقرر.</p>
${D.SOURCES.map(s => `<div class="card"><b>${ltr(s.id)}</b> · <span class="src">${esc(s.ref)}</span><br>${s.quote ? '«' + esc(s.says) + '»' : esc(s.says)}</div>`).join('\n')}
<h2>الفئات الثلاث للأدوات في المعيار</h2>
${D.CATEGORIES.map(([k, v]) => `<div class="card"><b>الفئة (${esc(k)})</b>: ${esc(v)}</div>`).join('\n')}
<h2>العناوين الرسمية</h2>
<p class="src">صفحة الأنظمة والسياسات في سدايا: ${ltr('https://sdaia.gov.sa/ar/SDAIA/about/Pages/RegulationsAndPolicies.aspx')}</p>
`));
write(FILES, 'd2_1/drafting_brief.html', page('موجز الصياغة: معيار الذكاء الاصطناعي التوليدي', `
<p>طلبت رهام الثميري مسودة للأقسام من 3 إلى 5 من المعيار ${ltr('STD-AI-01')} تحل محل التعميم ${ltr('DOC-11')}. المسودة تُطرح للتشاور، ثم تُعرض على لجنة إدارة البيانات.</p>
<h2>ما يجب أن تحققه المسودة</h2>
<ol class="cl">
<li>القسم 3: قاعدة الأدوات بحسب تصنيف البيانات، بنص الإرشادات الوطنية (${ltr('S-1')} و${ltr('S-2')}) دون تخفيف، منسوبًا إليها، ثم قواعد المركز مميزة بعبارة «قاعدة المركز».</li>
<li>القسم 4: الاستخدامات المحظورة، ومنها قرارات المزارعين والتوصيات بالمبيدات والجرعات.</li>
<li>القسم 5: الإشراف البشري والتحقق من المخرجات، بمالك ودليل.</li>
<li>كل متطلب يجتاز قائمة التحقق للصياغة، وكل مرجع يُفحص ويُسجل في سجل التحقق.</li>
</ol>
<h2>المساعد</h2>
<p>الذكاء الاصطناعي هنا كامل: يجوز أن تصوغ مع أي مساعد معتمد لك. لا تُدخل فيه إلا ملفات هذا المختبر، وهي اصطناعية ومصنفة «عام». ومن لا يستخدم مساعدًا يبدأ من ${ltr('assistant_draft.md')}، وهي مسودة كتبها المقرر لتحاكي ناتج مساعد.</p>
`));

// ---------------------------------------------------------------- Lab 2.2
const v09 = `# معيار استخدام أدوات الذكاء الاصطناعي التوليدي (STD-AI-01)

مسودة للتشاور، الإصدار 0.9. المالك: رئيس مكتب إدارة البيانات. يعتمده: لجنة إدارة البيانات.

${[...new Set(D.V09.map(r => r[0]))].map(sec => `## القسم ${sec}\n\n` + D.V09.filter(r => r[0] === sec).map(r => `- **${r[1]}** ${r[2]} *(المصدر: ${r[3]})*`).join('\n')).join('\n\n')}
`;
write(FILES, 'd2_2/standard_v0_9.md', v09);
const roles = [...new Set(D.COMMENTS.map(c => c.role))];
write(FILES, 'd2_2/role_cards.html', page('بطاقات الأدوار: جولة التشاور', `
<p>في مجموعة من أربعة، يأخذ كل مشارك بطاقة دور ويقدم ملاحظاتها الثلاث كما هي، ويدافع عنها. ويقود نقاش كل بطاقة مشارك آخر بالتناوب، بصفته ممثل مكتب إدارة البيانات.</p>
${roles.map(r => `<h2>${esc(r)}</h2>${D.COMMENTS.filter(c => c.role === r).map(c => `<div class="card"><b>${ltr(c.id)}</b> · على ${ltr(c.on)} · <span class="src">${esc(c.by)}</span><br>${esc(c.text)}</div>`).join('\n')}`).join('\n')}
`));
write(FILES, 'd2_2/comment_log_template.csv', csv(['comment_id', 'role', 'on', 'disposition', 'reason', 'text_change', 'reply_sent'], D.COMMENTS.map(c => [c.id, c.role, c.on, '', '', '', ''])));
write(FILES, 'd2_2/exception_requests.html', page('ثلاثة طلبات استثناء', D.EXCEPTIONS.map(x => `<div class="card"><h2>${esc(x.id)}</h2><ul class="meta"><li><b>مقدم الطلب:</b> ${esc(x.by)}</li><li><b>المتطلب:</b> ${esc(x.req)}</li></ul><p><b>الطلب:</b> ${esc(x.ask)}</p><p><b>السبب:</b> ${esc(x.why)}</p></div>`).join('\n')));
write(FILES, 'd2_2/regulatory_change.html', page('تغيير نظامي وصل اليوم', `
<div class="warn">${esc(D.CHANGE.title)}. كتبه المقرر للتدريب، ولا يمثل أي نص نافذ.</div>
<div class="card">${esc(D.CHANGE.text)}</div>
<p>المطلوب: ما الذي يُراجَع في المعيار، وأي استثناء في سجلك يتغير، ولماذا.</p>
`));
write(FILES, 'd2_2/exception_process_template.md', `# عملية الاستثناءات في معيار STD-AI-01

## 1. ما يجوز استثناؤه
(أي متطلبات؟ وما الذي لا يُستثنى أبدًا؟)

## 2. معايير القبول
(متى يُقبل الطلب؟)

## 3. المدة
(أقصى مدة، والتجديد)

## 4. الضوابط التعويضية
(ما الذي يحل محل المتطلب أثناء الاستثناء؟)

## 5. الأدوار وفصل المهام
(من يطلب، ومن يقيّم، ومن يعتمد، ومن يتابع)

## 6. موجبات المراجعة
(ما الذي يعيد فتح استثناء قائم قبل انتهائه؟)

## 7. السجل
(الحقول، ومن يحدّثه)
`);
write(FILES, 'd2_2/exception_register_template.csv', csv(['exception_id', 'requester', 'requirement', 'decision', 'reason', 'compensating_controls', 'expiry_days', 'review_triggers', 'assessor', 'approver', 'status_after_change'], D.EXCEPTIONS.map(x => [x.id, x.by, x.req, '', '', '', '', '', '', '', ''])));

// ---------------------------------------------------------------- capstone
write(FILES, 'capstone/committee_brief.html', page('اللجنة الصورية: ما تأتي به وكيف تجري', `
<h2>ما تسلمه قبل اللجنة</h2>
<ol class="cl">
<li>المعيار ${ltr('STD-AI-01')} في نسخته المنقحة، مع سجل الإصدارات وتتبع التغييرات.</li>
<li>مصفوفة تتبع المعيار: لكل متطلب مصدره، نص الإرشادات أو مبدأ أو مادة أو قاعدة المركز.</li>
<li>سجل الملاحظات بقراراته وردوده.</li>
<li>سجل الاستثناءات وسجل التحقق من المصادر.</li>
</ol>
<p>عمل فردي في مجلد مشترك، رابطه يُسلَّم قبل بدء اللجنة.</p>
<h2>كيف تجري</h2>
<p>لكل مشارك خمس عشرة دقيقة: أربع لعرض المعيار وما تغير بعد التشاور، وثماني دقائق تعترض فيها اللجنة على متطلبين وتطلب تعديل أحدهما أمامها، وثلاث للتبديل والتقدير. تختار اللجنة المتطلبين في الجلسة.</p>
<h2>التعديل المباشر</h2>
<p>تعدّل النص في ملفك أمام اللجنة وتتبع التغييرات ظاهر، وتحدّث سطر المصفوفة وسجل الإصدارات. الذكاء الاصطناعي غير مستخدم في التعديل المباشر.</p>
`));

// ---------------------------------------------------------------- reference answers (trainer)
write(REF, 'document_map_key.csv', csv(['doc_id', 'declared_type', 'type_by_content', 'owner_ok', 'version_ok', 'review_ok', 'approval_route_ok', 'findings'], C.DOCS.map(d => {
  const k = C.MAP_KEY[d.id];
  const ownerOk = d.owner && !k.findings.includes('F-04') ? 'نعم' : 'لا';
  const versionOk = d.version ? 'نعم' : 'لا';
  const reviewOk = d.review && d.review >= C.REVIEW_DATE ? 'نعم' : 'لا';
  const routeOk = (k.findings.includes('F-07') || k.findings.includes('F-08') || d.declared === 'تعميم') ? 'لا' : 'نعم';
  return [d.id, d.declared, k.actual, ownerOk, versionOk, reviewOk, routeOk, k.findings.join(' ')];
})));
write(REF, 'findings_key.csv', csv(['finding_id', 'kind', 'documents', 'finding'], C.FINDINGS.map(f => [f.id, f.kind, f.docs, f.text])));
write(REF, 'rewrite_reference.csv', csv(['w_id', 'req_no', 'statement', 'owner', 'measure', 'evidence', 'source', 'defects_of_original'], C.WEAK.flatMap(w => w.ref.map((r, i) => [w.id, String(i + 1), r[0], r[1], r[2], r[3], w.doc, w.defects.join(' ')]))));
write(REF, 'trace_matrix_reference.csv', csv(['obligation_id', 'req_ids', 'coverage', 'note'], obligations.map(o => {
  const [reqs, cov] = C.MATRIX_KEY[o[0]];
  const note = o[0] === 'A-2' ? 'R-02 لا يذكر وسيلة الجمع والمعالجة والحفظ والإتلاف ولا الحقوق وكيفية ممارستها' : o[0] === 'A-6' ? 'R-05 يذكر A-5 في الكتالوج خطأً؛ الصحيح A-6' : cov === 'لا تغطية' ? 'مكشوف: يُكتب متطلب جديد' : '';
  return [o[0], reqs.join(' '), cov, note];
})));
write(REF, 'orphans_reference.csv', csv(['req_id', 'finding'], Object.entries(C.ORPHAN_KEY)));
write(REF, 'new_requirements_reference.csv', csv(['obligation_id', 'new_requirement'], Object.entries(C.NEW_REQS)));
write(REF, 'source_check_reference.csv', csv(['ref_id', 'cited_as', 'source_checked', 'verdict', 'why', 'fix'], D.REFS.map(r => [r.id, r.cited, (r.why.match(/S-\d+/g) || ['حزمة المصادر وصفحة الأنظمة والسياسات']).join(' '), r.verdict, r.why, r.fix])));
write(REF, 'comment_log_reference.csv', csv(['comment_id', 'role', 'on', 'disposition', 'reason_and_text_change'], D.COMMENTS.map(c => [c.id, c.role, c.on, c.disp, c.resp])));
write(REF, 'exception_register_reference.csv', csv(['exception_id', 'requester', 'requirement', 'decision', 'reason', 'compensating_controls', 'expiry_days', 'review_triggers', 'assessor', 'approver', 'status_after_change'], D.EXCEPTIONS.map(x => {
  const after = x.id === 'X-02' ? 'معلّق حتى يدرج المدير العام الأداة بعد تقييمها، أو يُلغى' : x.id === 'X-03' ? 'قائم إن كانت الأداة مدرجة في القائمة المعتمدة' : 'لا يتغير';
  return [x.id, x.by, x.req, x.decision, x.reason, x.controls, String(x.days), x.triggers, x.assessor, x.approver, after];
})));
write(REF, 'exception_process_reference.md', `# عملية الاستثناءات: المرجع

1. **ما يجوز استثناؤه:** قواعد المركز وحدها. لا يُستثنى نص وطني (AI-01 وAI-02 بحكم الإرشادات) ولا نص يصير خارجيًا بعد تغيير نظامي. وقاعدة المركز التي تنفذ نصًا وطنيًا (AI-05 وAI-06 وAI-07 تنفيذًا لـ S-6) يُستثنى منها ما يزيد على ذلك النص فقط: يبقى الإشراف البشري على القرار الذي لا يمكن تداركه.
2. **معايير القبول:** حاجة عمل موثقة؛ لا بديل ممتثل في المدة؛ خطر مقدّر ومقبول؛ ضوابط تعويضية تحل محل المتطلب.
3. **المدة:** تسعون يومًا على الأكثر، ويُجدد مرة واحدة بقرار جديد؛ لا استثناء مفتوح المدة.
4. **الضوابط التعويضية:** تُكتب لكل استثناء ويُسمى من يتحقق منها.
5. **الأدوار وفصل المهام:** يطلب صاحب الحاجة؛ يقيّم رئيس مكتب إدارة البيانات أو مدير أمن المعلومات (من لم يطلب)؛ تعتمد لجنة إدارة البيانات؛ يتابع مسؤول الامتثال. لا يعتمد من طلب، ولا من قيّم.
6. **موجبات المراجعة:** انتهاء المدة؛ حادثة؛ تغير في الأداة أو شروطها؛ تغيير نظامي يمس المتطلب؛ زوال الحاجة.
7. **السجل:** المعرّف، ومقدم الطلب، والمتطلب، والقرار وسببه، والضوابط، والمدة، والموجبات، والمقيّم، والمعتمد، والحالة؛ يحدّثه مكتب إدارة البيانات خلال خمسة أيام عمل من كل قرار.

الأرقام (تسعون يومًا، خمسة أيام عمل) قواعد المركز في الحالة.
`);
write(REF, 'standard_reference.md', `# معيار STD-AI-01: الأقسام 3 إلى 5 بعد التحقق (المرجع)

صحح المسودة المرفقة بحذف المراجع المختلقة الثلاثة (REF-1 وREF-3 وREF-8)، وتصحيح المنسوب خطأ (REF-2) والمناقض للمصدر (REF-4). النص بعد التصحيح:

${D.V09.filter(r => ['3', '4', '5'].includes(r[0])).map(r => `- **${r[1]}** ${r[2]} *(المصدر: ${r[3]})*`).join('\n')}

ملاحظات المدرب: AI-01 وAI-02 حكم الإرشادات دون زيادة ولا نقص، وأي متطلب أشد منه يُوسم «قاعدة المركز». الفئة (ج) تخضع لـ AI-01 وAI-02 كغيرها. المسودة التشاورية في المختبر 2.2 تبدأ من هذا النص مع الأقسام الأخرى.
`);
const stats = {
  documents: C.DOCS.length, findings: C.FINDINGS.length, weak_statements: C.WEAK.length,
  reference_requirements: C.WEAK.reduce((n, w) => n + w.ref.length, 0),
  obligations: obligations.length, catalogue: C.CATALOGUE.length,
  covered_full: Object.values(C.MATRIX_KEY).filter(v => v[1] === 'كاملة').length,
  covered_partial: Object.values(C.MATRIX_KEY).filter(v => v[1] === 'جزئية').length,
  uncovered: Object.values(C.MATRIX_KEY).filter(v => v[1] === 'لا تغطية').length,
  orphans: Object.keys(C.ORPHAN_KEY).length,
  wrong_citations: 1,
  references_in_draft: D.REFS.length,
  references_correct: D.REFS.filter(r => r.verdict === 'صحيح').length,
  references_invented: D.REFS.filter(r => r.verdict === 'مختلق').length,
  references_misrepresented: D.REFS.filter(r => r.verdict === 'منسوب خطأ' || r.verdict === 'يناقض المصدر').length,
  comments: D.COMMENTS.length,
  accepted: D.COMMENTS.filter(c => c.disp === 'قبول').length,
  accepted_with_change: D.COMMENTS.filter(c => c.disp === 'قبول مع تعديل').length,
  rejected: D.COMMENTS.filter(c => c.disp === 'رفض').length,
  exceptions: D.EXCEPTIONS.length
};
write(REF, 'stats.json', JSON.stringify(stats, null, 2) + '\n');

write(REF, 'capstone_key.md', `# اللجنة الصورية: بنك الاعتراضات (للمقيّمين وحدهم)

تختار اللجنة لكل مشارك متطلبين من معياره، ويُفضل أن يكون أحدهما من قاعدة المركز والآخر من نص وطني، وألا يأخذ مشاركان متتاليان المتطلبين نفسيهما. يُطلب تعديل أحد المتطلبين أمام اللجنة.

| المتطلب | الاعتراض | ما يحتويه دفاع جيد |
|---|---|---|
${D.CHALLENGES.map(c => `| ${c[0]} | ${c[1]} | ${c[2]} |`).join('\n')}

## طلبات التعديل المباشر (اختر واحدًا)

1. «اجعل AI-07 يسمح بتنبيهات الطقس دون اعتماد المهندس.» الجواب الجيد: يقصرها على قالب من نص التنبؤ الرسمي، ويضيف عينة مراجعة ومالكًا، ويحدّث المصفوفة (قاعدة المركز) وسجل الإصدارات.
2. «أضف مدة لـ AI-11 تتوافق مع جدول الاحتفاظ.» الجواب الجيد: مدة واحدة يحيل فيها إلى جدول الاحتفاظ، ومالك، ودليل.
3. «اجعل AI-10 قابلًا للاختبار.» الجواب الجيد: يعرّف المخرج الرسمي، ويسمي موضع الإفصاح، ويحدد عينة المراجعة.

## ما يُخصم

- متطلب معدَّل فيه التزامان أو لفظ يُفشل التدقيق.
- نسبة قاعدة المركز إلى الإرشادات الوطنية.
- تعديل لا يُحدَّث له سطر المصفوفة أو سجل الإصدارات.
- مالك يعتمد ما طلبه أو ما قيّمه (فصل المهام).
`);
console.log('files written:', JSON.stringify(stats));
