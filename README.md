# Peter’s Medical Notes — Version 13

## Install
Extract the ZIP, then copy its contents into the existing website repository folder, beside index.html. Replace matching files and merge the images folder. Commit and push with GitHub Desktop. This release includes rebuilt image files, so copy the images folder too. Existing images with old filenames can remain; V13 uses word-v13-* filenames.

The sidebar displays Version 13. Script and stylesheet URLs include v=13 to reduce stale cached assets. Your live URL does not change.

## Changes
- Systems and High-yield are matching native dropdowns. Opening Systems reveals the system names. Selecting a system drills into one hierarchy level at a time. Back returns one level; the selected parent heading also links to its full notes page. ENT remains capitalised.
- Rebuilt image placement from the original Word XML, matching all 373 headings in document order to unique topic IDs. All 153 drawing placements use 151 distinct embedded media files. Images follow their original paragraph or table; images at the start of a heading appear inside that section. Word crop settings are respected.
- Eye Anatomy has exactly five images: two after block 6141 and three after block 6144. Figures render even when a topic is opened directly, without needing a duplicate heading inside its notes panel.
- Four drawings from the document opening, before the first system heading, are available in a separate expandable area at the bottom of Home.
- Images are smaller clickable previews; links open larger files. Generic imported-image captions are removed.
- High yield from AI appears above the notes on all 357 non-system topic pages. It includes AI-selected complete note passages with links to their original sections, and external-source takeaways where dedicated sources are available. The image-only Summary Image heading references its original figure.
- Note-based selections are not independent medical verification. External takeaways are labelled separately, with publisher, resource link and date checked. This is not a comprehensive external clinical summary for every topic, nor an official exam syllabus.
- The existing system-level High-yield pages and Extra information sections remain available. No MCQ/progress system was added.

## Validation
All 373 routes checked with a DOM-based runtime, including image counts, exact anchor positions and order, five figures on the directly opened Eye Anatomy page, source-reference sections, dropdown/drill/back navigation, 16 system High-yield pages, homepage and dark mode. All linked image assets exist and decode. Original data.js is unchanged from V2. Browser download was unavailable, so full visual browser/device testing was not completed.

The source-map audit is included in image-placement-audit.json. Its filenames map to original Word media relationships; it contains no newly authored medical facts.
