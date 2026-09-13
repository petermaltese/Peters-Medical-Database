# Peter’s Medical Notes — Version 6

Continues Version 3 with the same system → topic → subtopic hierarchy, existing topic URLs, search, inline links and remembered light/dark setting.

## New in V5
- Subtopic headings and paragraph section labels are bold and underlined.
- Common section labels stored as list items (including Pathophysiology, Epidemiology, Clinical presentation, Investigations and Management) are also bold and underlined.
- Every system has a High yield entry and a sidebar link.
- 46 curated excerpts across all 16 systems, drawn from 468 existing content blocks.
- Each excerpt links directly to its original passage. Lists, supporting bullets and tables remain together.
- High yield pages include an on-page contents menu, including on smaller screens.
- Topic pages place a clearly separate Extra information section below your notes. Each source card names its publisher, gives an AI-written summary, shows the date checked and links to the source. Broader parent-topic context is labelled as such.
- External summaries are not mixed into your notes or High yield pages; search continues to search your notes.
- 44 source records currently cover selected major topics and conditions; topics without a verified dedicated source are explicitly marked as not yet covered.

## Content rule
All medical content is from Disease - As Understood By Peter.docx. The V2/V3 data.js remains byte-for-byte unchanged. Excerpts resolve references to this data at runtime rather than containing separately authored medical text.

Peter has authorised grammar/wording improvements without new medical information. This release retains the original wording of the selected excerpts.

The GMC MLA content map informed editorial topic priorities, especially common/acute presentations and clinical recognition. It is not an official MQ examination ranking. External medical descriptions, diagnostic thresholds and management recommendations were not imported. Sparse systems remain limited to the notes actually present.
Selection reference: https://www.gmc-uk.org/education/medical-licensing-assessment/mla-content-map

## Upload to your existing GitHub website
Extract this ZIP. Upload all seven files into the same folder as the existing index.html, on the existing publishing branch:
index.html, style.css, app.js, data.js, browsing.js, high-yield.js, external-info.js, external-view.js, image-manifest.js, images/, README.md.
Commit the changes. Keep the same website URL. Allow GitHub Pages time to publish, then refresh the website.
Do not upload an enclosing folder or the ZIP itself. No need to delete existing files first.

## Validation
- All 468 selected blocks checked against the uploaded Word document, with only whitespace/Unicode normalisation during comparison.
- Original notes data unchanged, including all 45 table blocks.
- DOM checks passed for all 16 system pages and 16 High yield pages, all 46 full-passage links, paragraph/list subheadings, search and dark theme.
- JavaScript syntax checked.
- Visual browser testing remains outstanding: the browser download was unavailable in this environment. Responsive styles are included, but desktop/iPad/phone layout should be visually checked after publishing.

Original Word-document images are included under images/ and displayed on matching topic pages where their heading could be mapped. The image set is optimised for web display. No MCQ or progress system has been added.
