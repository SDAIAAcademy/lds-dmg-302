# صياغة سياسات البيانات والذكاء الاصطناعي ومعاييرهما: المختبرات

أربعة مختبرات لمقرر أكاديمية سدايا **LDS-DMG-302**، مدة كل منها 75 دقيقة، ومعها العمل التحضيري الموجه وملفات المشروع الختامي. المختبرات صفحات إرشادية بالعربية: الهدف، والملفات، وخطوات بدقائقها، وأسئلة تحقق، وتمرين إضافي ✱، وملاحظات للمدرب. لا يكتب المشارك كودًا ولا يستدعي أي ملف هنا نموذجًا.

كل المختبرات في جهة واحدة: **مركز مِذراة للبحوث الزراعية والإرشاد**، جهة حكومية افتراضية. كل الأسماء والوثائق والملاحظات وطلبات الاستثناء اصطناعية، ومصنفة «عام». والمقتطفات من المراجع الوطنية صياغة المقرر، ويذكر كل مقتطف موضعه في النص الرسمي العربي؛ الحكم للنص الرسمي.

## ما يحتاجه المشارك

- متصفح، وبرنامج جداول، ومحرر نصوص يتتبع التغييرات.
- في المختبر 2.1 مساعد ذكاء اصطناعي عام بخطة مجانية، وفي المختبرين 1.2 و2.2 مرشدًا فقط. المختبر 1.1 دون ذكاء اصطناعي. لا يُدخل في أي مساعد إلا ملفات المختبر.
- اختياري: Node.js 20 أو أحدث لتشغيل أداة المختبر `tools/kit.mjs` (فحص الصياغة، وفحص المصفوفة، وتحويل الكتالوج إلى بنية مستوحاة من OSCAL). كل خطوة فيها بديل بصيغ الجدول.

## نقطة البداية والحل

كل مختبر يبدأ من ملفات جاهزة في `files/` ولا يعتمد على ناتج مختبر آخر.

| المختبر | الصفحة | يبدأ من | الحل المرجعي |
|---|---|---|---|
| العمل التحضيري | `files/prework/guide.html` | `files/case_brief.html`، `files/prework/documents.html`، `files/prework/document_map_template.csv` | `solutions/reference/document_map_key.csv`، `solutions/reference/findings_key.csv` |
| 1.1 | `D1_1_rewrite.html` | `files/d1_1/` (العبارات الخمس عشرة، والقالب، وقائمة التحقق، وقاعدة المصطلحات) | `solutions/reference/rewrite_reference.csv` |
| 1.2 | `D1_2_trace.html` | `files/d1_2/` (المقتطفات، والالتزامات، والكتالوج، وقالب المصفوفة) | `solutions/reference/trace_matrix_reference.csv`، `solutions/reference/orphans_reference.csv`، `solutions/reference/new_requirements_reference.csv` |
| 2.1 | `D2_1_ai_standard.html` | `files/d2_1/` (الهيكل، ومسودة تحاكي ناتج مساعد، وحزمة المصادر، والقالبان) | `solutions/reference/source_check_reference.csv`، `solutions/reference/standard_reference.md` |
| 2.2 | `D2_2_consultation.html` | `files/d2_2/` (المسودة 0.9، وبطاقات الأدوار، وطلبات الاستثناء، والتغيير النظامي، والقوالب) | `solutions/reference/comment_log_reference.csv`، `solutions/reference/exception_register_reference.csv`، `solutions/reference/exception_process_reference.md` |
| المشروع الختامي | `../slides/capstone.html` | `files/capstone/committee_brief.html` | `solutions/reference/capstone_key.md` |

مسودة المختبر 2.1 كتبها المقرر لتحاكي ناتج مساعد، وفيها ثمانية مراجع بعضها مختلق عمدًا. لم يُشغَّل أي نموذج لإنتاجها.

## التحقق من الحلول

```
node labs/solutions/check.mjs          كل المختبرات
node labs/solutions/check.mjs 1.2      جزء واحد (prework أو 1.1 أو 1.2 أو 2.1 أو 2.2 أو capstone)
```

يحتاج Node.js 20 أو أحدث، بلا اعتماديات ولا اتصال. يعيد حساب كل رقم من ملفات المشاركين ويقارنه بالحلول المرجعية وبالأرقام في `solutions/reference/stats.json`.

## إعادة توليد الملفات

```
node labs/_tools/build_files.mjs
```

يكتب `files/` و`solutions/reference/` من `_tools/case.mjs` (الحالة والوثائق والعبارات والالتزامات والكتالوج) و`_tools/case_day2.mjs` (المصادر والمسودات والملاحظات والاستثناءات). الناتج هو نفسه في كل تشغيل. بعد أي تغيير: شغّل `check.mjs`، وراجع الأرقام في الشرائح وصفحات المختبرات.
