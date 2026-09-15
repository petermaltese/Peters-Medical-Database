# Peter’s Medical Notes — Version 15

Cardiology layout preview, built on Version 14.

## Install this small update
1. Extract peter_medical_notes_v15_update.zip.
2. Copy the four files into your existing website repository folder, alongside data.js.
3. Replace matching files. Keep your existing images folder and all other website files.
4. In GitHub Desktop, commit the changes and click Push origin.
5. After GitHub Pages finishes deploying, reload the site. The sidebar should say Version 15.

This is an update package, not a standalone website. It requires the existing V14 files.

## Changes
- Cardiology only: visible Definition above the separate AI high-yield box.
- Seven translucent expandable sections: Epidemiology; Aetiology / Risk Factors;
  Pathophysiology; Clinical Features; Investigations / Diagnosis;
  Treatment / Management; Complications.
- Missing definitions and empty sections display italic “to be added”.
- Existing Word-note wording, tables, nested lists and related images are retained.
- Expand all / Collapse all controls; search results open their containing section.
- Other systems keep their existing layout. No new medical information was added.
- Sidebar and cache-busting URLs use Version 15.

## Verification
All 39 cardiology topic routes retain exactly the same original block text and unique
anchors. Expand/collapse and search reveal checks pass. All 373 topic routes and
153 image placements pass existing structural checks. Light/dark styles and mobile
rules are included; this environment did not provide a visual browser preview.

The referenced AI content has the same partial coverage as Version 14; this update
reorganises your notes and does not expand the external summaries.
