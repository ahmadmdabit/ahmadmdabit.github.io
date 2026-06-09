# Ahmet Fatihoglu's Personal Website

[https://ahmadmdabit.github.io/](https://ahmadmdabit.github.io/)

## Overview

This is a personal portfolio website for Ahmet Fatihoglu, a Senior Software Developer and Architect. The website is a dynamic, data-driven single-page application built with a modern React and TypeScript stack. It features an integrated AI chat assistant that answers questions about Ahmet's professional background using document-based retrieval augmented generation (RAG).

## Architecture Overview

### Technology Stack

- **Core Framework**: React 19 with TypeScript
- **Build Tool**: Vite with `vite-tsconfig-paths` for module aliasing
- **UI Library**: Material-UI (MUI) v7 with Emotion for styling
- **Routing**: React Router v7 with nested layouts and SPA navigation
- **State Management**: Local component state managed by React Hooks (`useState`, `useCallback`, `useEffect`)
- **Internationalization**: `i18next` with `react-i18next` and `i18next-browser-languagedetector` (EN/TR)
- **AI Chat**: `@heyputer/puter.js` for LLM inference with streaming and tool-calling support
- **Document Search**: `minisearch` for full-text indexing and retrieval of resume/FAQ/project documents
- **Markdown Rendering**: `marked` with `dompurify` for safe HTML rendering of AI responses
- **Styling**: Custom scrollbar styling via `src/index.css` (cross-browser thin scrollbar)
- **Deployment**: GitHub Pages via `gh-pages`

### Main Modules and Responsibilities

The project follows an **Atomic Design** methodology:

- **`src/data`** — Static data files and content modules:
  - `pagesData.ts` — Page metadata and navigation configuration
  - ~~`resumeData.ts`~~ (removed; content fully centralized in i18n JSON locale files)
  - ~~`Resume_EN_*.md`~~ (removed from `src/assets/`; single-source-of-truth is now `public/data/Resume-EN.md`)
- **`src/types`** — TypeScript interfaces for core data structures (`ResumeData`, `Project`, `Experience`, etc.)
- **`src/atoms`** — Smallest reusable components (e.g., `ActivityButton`, `BoldedKeyword`, `StatusIndicator`, `CloseButton`). Context-unaware, no business logic.
- **`src/molecules`** — Compositions of atoms forming complex components:
  - `ActivityBar` — Navigation sidebar with `NavLink` routing
  - `ChatPopup` — AI-powered chat assistant (see [Chat System](#chat-system) below)
  - `StatusBar` — Bottom status bar showing page name and title, with responsive mobile/tablet support
- **`src/components/resume`** — Main UI components organized into:
  - `sections/` — `AboutSection`, `SkillsSection`, `ExperienceSection`, `EducationSection`, `ContactSection`, `ProjectsSection`, `CertificationsSection`
  - `items/` — `ProjectCard`, `ContactList`, `ContactForm`, `PrivacyAccordion`, `SummaryContent`, `CVDownloadSection`
- **`src/pages`** — Top-level page components (`HomePage`, `PrivacyPage`, `ErrorPage`)
- **`src/i18n`** — Internationalization configuration with locale JSON files (`en/translation.json`, `tr/translation.json`), schema validation, and asset hashing for cache busting
- **`public/data`** — Markdown documents served as data sources for the AI chat:
  - `Resume-EN.md` / `Resume-TR.md` — Structured resume content
  - `Projects-EN.md` / `Projects-TR.md` — Detailed project descriptions
  - `FAQ-EN.md` / `FAQ-TR.md` — 110 interview questions with answers and alternative phrasings (10 per question)
  - `Resume-EN.pdf` / `Resume-TR.pdf` — Downloadable PDF resumes
  - `Resume-EN.txt` / `Resume-TR.txt` — Plain-text resume versions

## Data Flow

### Resume Rendering

1. All resume content is defined in i18n translation JSON files (EN/TR).
2. Components use `useTranslation` with `returnObjects: true` to fetch structured data.
3. Content flows hierarchically: `HomePage` → `Section` components → `Item` components via props.

### Chat System (RAG Workflow)

The chat assistant implements a **Retrieval Augmented Generation** workflow:

1. **Document Loading** — On chat open, `loadAndIndexDocuments()` fetches markdown documents for **both** locales in parallel (`Promise.all`):
   - Resume (EN + TR)
   - Projects (EN + TR)
   - FAQ with 110 questions and alternative phrasings (EN + TR)

2. **Chunking** — Documents are split into searchable chunks:
   - Resume/Projects: split by headings (`##`, `###`)
   - FAQ: one chunk per question-answer pair, including all alternative phrasings

3. **Indexing** — Both locales' chunks are merged into a **single bilingual `MiniSearch` index** with fuzzy matching (0.2), prefix matching, and title boosting (2×). The index is built once on first open and persists for the session lifetime. Each chunk is tagged with its locale (`"en"` or `"tr"`).

4. **Query Flow**:
   - User message → full resume + projects content for the **current locale** provided as initial context
   - FAQ content is **not** included inline — instead, a compact numbered question list is provided, and the LLM is instructed to call `expandSearch` for any matching FAQ question
   - LLM receives system prompt + document context + conversation history via `puter.ai.chat()`
   - If initial context is insufficient, LLM calls `expandSearch` tool (via function calling)
   - `expandSearch` performs relaxed fuzzy search filtered by locale (`"same"`) or across both locales (`"all"`) as fallback
   - Expanded results sent back to LLM for final streaming response

5. **Streaming** — Responses stream in real-time via `puter.ai.chat({ stream: true })` with markdown rendering via `marked` + `DOMPurify`. Each assistant message uses a `MarkdownRenderer` component with async parsing and cancellation support.

6. **Session Persistence** — The chat session (messages, API history, search index) persists across popup close/reopen and locale changes. Only a full page refresh clears the session. The bilingual index ensures seamless locale switching with zero re-indexing.

7. **Features**:
   - Abort controller for stopping generation mid-stream
   - Conversation history management via `apiHistoryRef`
   - Loading/indexing state indicators (spinner during document loading)
   - Bilingual support — user can switch languages mid-conversation; system prompt instructs LLM to respond in the current question's language regardless of history language
   - Input focus management with 220ms delay after popup open

## Design Patterns and Best Practices

- **Data-Driven UI**: Resume content is dynamically generated from centralized i18n translation files, making updates easy and consistent across languages.
- **Atomic Design**: Components organized by complexity, promoting reusability and maintainability.
- **Centralized Theming**: All styling values managed through MUI theme in `App.tsx`.
- **Performance Optimization**:
  - **Memoization**: Presentational components wrapped in `React.memo`
  - **Bundle Size**: Direct-path MUI imports for optimal tree-shaking
  - **Asset Hashing**: Locale and public asset hashes (`VITE_LOCALE_HASH`, `VITE_ASSET_HASH`) for cache invalidation
- **Path Aliasing**: `@/` alias for absolute imports throughout the codebase.
- **Internationalization**: Full EN/TR support with browser language auto-detected locale, hash-busted locale loading, and **bilingual chat index** (both locales indexed in a single `MiniSearch` instance for seamless mid-conversation language switching).
- **Responsive Design**: StatusBar uses `useMediaQuery` to hide page indicators on mobile/tablet.
- **Accessibility**: Chat popup includes `role="dialog"`, `aria-label`, and keyboard navigation support.
- **Security**: AI responses sanitized via `DOMPurify` before rendering; `EXTERNAL`-tagged FAQ entries (placeholders for answers not presented in the resume document) are indexed but can be filtered out via the commented-out guard in `chunkFAQDocument`; `extractFAQQuestions()` safely parses only question titles without exposing answer content in the initial prompt.

## Key Recent Changes

| Date       | Change                      | Description                                                                                                                                                                                                                                                                                       |
| ---------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-05 | **UI Fixes**                | Removed StatusIndicator from StatusBar; removed page name from StatusBar on mobile/tablet via `useMediaQuery`                                                                                                                                                                                     |
| 2026-04-24 | **Resume Update**           | Added Distributed File Fragmentor project (.NET 9, Clean Architecture, CQRS, EF Core 9); removed E-Store project to keep portfolio focused                                                                                                                                                        |
| 2025-12-12 | **Resume Update**           | Added SystemProcesses project (.NET, WPF, MVVM) to translation files                                                                                                                                                                                                                              |
| 2025-10-21 | **Resume Update**           | Added Aided (SolidJS-inspired JS library) and Meeting System (.NET 9, Angular 20+, Docker) projects; refreshed skills list; removed older Sinav Oluşturma project                                                                                                                                 |
| 2025-09-30 | **Resume & Error Boundary** | Updated resume content with new Architect title and skill reorganization; added Exchange and Market projects; added phone number to contact info; added `ErrorBoundary` component for graceful error handling; bumped package version to 1.0.0                                                    |
| 2025-09-19 | **Deployment Fixes**        | Added `404.html` for GitHub Pages SPA fallback; set `base: '/'` and `sourcemap: false` in Vite config; moved `ThemeProvider` and `CssBaseline` to `main.tsx`; enhanced `PrivacyPage` layout                                                                                                       |
| 2025-09-18 | **AI Chat Integration**     | `ChatPopup.tsx` completely rewritten with Puter.js LLM streaming, MiniSearch bilingual merged index (both locales in single index), FAQ question list with expandSearch-on-demand, markdown rendering via `marked` + `DOMPurify`, abort controls, and session persistence across locale changes   |
| 2025-09-18 | **i18n & Routing**          | Migrated from state-based navigation to declarative React Router v7 routes; resume sections now fetch data directly from i18n translations via `returnObjects: true`; standardized env vars (`VITE_ASSET_HASH`, `VITE_LOCALE_HASH`)                                                               |
| 2025-09-18 | **Component Refactoring**   | Extracted AboutSection into `SummaryContent`, `AnimatedBadgeComponent`, `CVDownloadSection`; extracted ContactSection into `ContactList`, `ContactForm`, `PrivacyAccordion`; reduced AboutSection from ~180 to ~60 lines and ContactSection from ~185 to ~20 lines                                |
| 2025-09-17 | **Asset Hashing**           | Added `scripts/hash-locale.mjs` using SHA1 for combined locale + public asset hashes; dynamic `?v=hash` cache busting for images, PDFs, favicons, and locale JSON files                                                                                                                           |
| 2025-09-17 | **Certification Badge**     | Added Microsoft certification badge to AboutSection with i18n support; extended i18n schema                                                                                                                                                                                                       |
| 2025-09-16 | **Project Scaffold**        | Initial React + Vite + TypeScript setup; Atomic Design component structure; i18n with EN/TR support; resume sections (About, Skills, Experience, Education, Contact, Certifications, Languages); ActivityBar navigation; StatusBar; ChatPopup placeholder; public assets (images, favicons, PDFs) |

## Build & Deployment

```bash
# Development
yarn dev

# Type checking
yarn typecheck

# Build (typecheck → hash locales → vite build)
yarn build

# Lint + build
yarn build:lint

# Deploy to GitHub Pages
yarn deploy    # runs predeploy (build:lint) then gh-pages -d dist
```

## License

This project's all rights reserved — see the [LICENSE](LICENSE.txt) file for details.
