# Repository Guidelines

## Project Structure

This single-page graphic designer portfolio uses React, strict TypeScript,
Vite, and plain CSS. `index.html` is the Vite entry point; `src/main.tsx`
mounts `src/App.tsx` and imports local Inter fonts. Shared design variables
live in `src/styles/tokens.css`; global styles live in `src/styles/global.css`.
Build output belongs in `dist/`. Hero, the RAT DOT intro, and its gallery
with local images are implemented; ABOUT and subsequent project sections
are pending. Shared layouts live in `src/components/ProjectIntro/`
and `src/components/ProjectGallery/`, with typed data in `src/data/`
and `src/types/`.

## Figma Fidelity and Content

Match the supplied Figma design as closely as possible: spacing, dimensions,
typography, colors, image crops, and static effects. Inspect relevant layers
and screenshots before implementing each section. Do not invent missing text,
elements, interactions, or animations. Flag copied placeholder content and
request clarification instead of creating replacements.

## Components and Styling

Build reusable React components for repeated layouts and store content in
typed data. Keep TypeScript strict; avoid `any` and unchecked assertions.
Use PascalCase component filenames, camelCase functions and variables,
two-space indentation, single quotes in TypeScript, and semicolons.

Use ordinary CSS with CSS Grid and Flexbox. Reserve absolute positioning
for overlapping artwork that requires it. Reuse CSS variables. Build
responsive layouts with readable type, preserved image proportions, and no
horizontal overflow. Explicitly identify mobile design assumptions when
Figma provides no mobile reference.

## Assets and Dependencies

Store images locally, preferably in `src/assets/`; use `public/` for stable
public paths. Never use temporary Figma URLs in the final site. Preserve
original artwork and intended cropping. Inter is self-hosted through
`@fontsource-variable/inter`. Do not add dependencies without explaining their
purpose and why existing tools are insufficient.

## Commands and Verification

- `npm ci`: install locked dependencies.
- `npm run dev`: start Vite locally.
- `npm run typecheck`: check application and configuration types.
- `npm run build`: check types and build to `dist/`.
- `npm run preview`: serve the production build locally.

Run `npm run build` after changes. Check visual changes against Figma at
desktop and mobile widths. No test runner is configured; introduce tests when
behavior warrants them. Keep commits focused with imperative subjects.
Pull requests should describe changes and validation results, link relevant
issues, and include screenshots for visual changes. Exclude build output and
local secrets from version control.
