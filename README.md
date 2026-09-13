# Peter's Medical Notes — Version 3

This is a static website built from **Disease - As Understood By Peter.docx**.

## Source rule
The website uses only information in the uploaded notes. No external medical information was added or used to correct the notes.

## Version 3 focus
- Proper hierarchy from the Word document headings
- Clickable systems, topics and subtopics
- Topic pages that display the notes beneath each heading
- Breadcrumb links and previous/next topic navigation
- "On this page" navigation for nested headings
- Related-topic links when another heading is explicitly mentioned in the notes
- Global search that opens the exact topic/block containing the result
- Tables and list nesting preserved
- Light/dark mode toggle that remembers your choice

Embedded images from the Word document are **not included yet**. This version deliberately focuses on the text/topic navigation first.

## Open locally
Unzip the folder and double-click `index.html`.

## Host it
The folder is a static site, so it can be uploaded directly to Netlify or hosted with GitHub Pages.

## Browsing update
- Expandable system/topic/subtopic sidebar with current topic highlighted.
- Live search, system filter, title-first ranking, match-centred excerpts and Show more results.
- Ctrl/Cmd+K focuses search.
- Inline links match complete, unique topic titles already in the notes. No medical synonyms or inferred relationships are introduced.
- On-this-page navigation is available on smaller screens.
- Existing V2 data.js is byte-for-byte unchanged; original routes and theme preference key retained.

## Validation and limitations
JavaScript syntax and unchanged data checked. All 45 original table blocks retained. Browser visual/interaction testing could not run in the build environment because no browser executable was available. Embedded Word images remain excluded, as in V2.

## Update an existing host
Extract this ZIP and upload all six website files, including browsing.js, to the existing website folder. Keep the same hosting project and address. No MCQ or progress system has been added.
