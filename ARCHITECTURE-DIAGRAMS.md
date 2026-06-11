# Architecture Diagrams & Flow Charts

This document contains Mermaid diagrams illustrating the key architectures, data flows, and component relationships in the Ahmet Fatihoglu Portfolio website.

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Client (Browser)"
        UI["React 19 SPA"]
        Router["React Router v7"]
        Theme["MUI Theme + Emotion"]
        I18n["i18next + react-i18next"]
    end

    subgraph "Data Layer"
        I18nData[["i18n JSON Files\nlocales/en, tr/translation.json"]]
        PublicData[["Public Markdown Files\ndata/Resume-*.md\nProjects-*.md\nFAQ-*.md"]]
        Assets[["Static Assets\nimages, fonts, PDFs"]]
    end

    subgraph "AI Chat System"
        ChatPopup["ChatPopup Molecule"]
        MiniSearch[["MiniSearch Index\nBilingual EN + TR"]]
        PuterJS["heyputer/puter.js\nLLM Streaming"]
        DOMPurify["DOMPurify\nHardened Config"]
    end

    subgraph "External Services"
        GitHubPages["GitHub Pages\nDeployment"]
        PuterAPI["Puter.ai Cloud\nLLM Inference"]
    end

    UI --> Router
    UI --> Theme
    UI --> I18n
    I18n --> I18nData
    UI --> PublicData
    UI --> Assets

    ChatPopup --> MiniSearch
    ChatPopup --> PuterJS
    ChatPopup --> DOMPurify
    ChatPopup --> PublicData
    PuterJS --> PuterAPI

    I18nData -.->|Hash-busted loading\nVITE_LOCALE_HASH| UI
    Assets -.->|Hash-busted loading\nVITE_ASSET_HASH| UI

    UI -->|Deploy| GitHubPages
```

---

## 2. Component Hierarchy (Atomic Design)

```mermaid
graph TD
    App["App.tsx\nOutlet + Loading"]
    Router["router.tsx\nRoutes Config"]

    subgraph "Pages"
        HomePage["HomePage.tsx"]
        PrivacyPage["PrivacyPage.tsx"]
        ErrorPage["ErrorPage.tsx"]
    end

    subgraph "Molecules (Composite)"
        ActivityBar["ActivityBar\nNav + PersonPhoto + LangSelector + ChatBtn"]
        ChatPopup["ChatPopup\nRAG Chat Assistant"]
        StatusBar["StatusBar\nPage + Name/Title + StatusIndicator"]
        LanguageSelector["LanguageSelector\nEN/TR Toggle"]
    end

    subgraph "Atoms (Primitive)"
        ActivityButton["ActivityButton"]
        PersonPhoto["PersonPhoto"]
        ChatAssistantIcon["ChatAssistantIcon"]
        StatusIndicator["StatusIndicator"]
        CloseButton["CloseButton"]
        BoldedKeyword["BoldedKeyword"]
        AnimatedBadge["AnimatedBadge"]
        BoldedText["BoldedText"]
        ReplacePlaceholders["ReplacePlaceholders"]
    end

    subgraph "Resume Sections"
        AboutSection["AboutSection"]
        SkillsSection["SkillsSection"]
        ExperienceSection["ExperienceSection"]
        ProjectsSection["ProjectsSection"]
        EducationSection["EducationSection"]
        CertificationsSection["CertificationsSection"]
        LanguagesSection["LanguagesSection"]
        ContactSection["ContactSection"]
    end

    subgraph "Resume Items"
        SummaryContent["SummaryContent"]
        CVDownloadSection["CVDownloadSection"]
        ExperienceItem["ExperienceItem"]
        ProjectCard["ProjectCard"]
        ContactList["ContactList"]
        ContactForm["ContactForm"]
        PrivacyAccordion["PrivacyAccordion"]
        AnimatedBadgeComponent["AnimatedBadgeComponent"]
    end

    %% Relationships
    main.tsx --> App
    App --> Router
    Router --> HomePage
    Router --> PrivacyPage
    Router --> ErrorPage

    HomePage --> ActivityBar
    HomePage --> StatusBar
    HomePage --> ChatPopup
    HomePage --> Outlet

    Outlet --> AboutSection
    Outlet --> SkillsSection
    Outlet --> ExperienceSection
    Outlet --> ProjectsSection
    Outlet --> EducationSection
    Outlet --> CertificationsSection
    Outlet --> LanguagesSection
    Outlet --> ContactSection

    ActivityBar --> PersonPhoto
    ActivityBar --> ActivityButton
    ActivityBar --> LanguageSelector
    ActivityBar --> ChatAssistantIcon

    AboutSection --> SummaryContent
    AboutSection --> CVDownloadSection
    AboutSection --> AnimatedBadgeComponent
    AboutSection --> BoldedKeyword

    ExperienceSection --> ExperienceItem
    ProjectsSection --> ProjectCard
    ContactSection --> ContactList
    ContactSection --> ContactForm
    ContactSection --> PrivacyAccordion

    ChatPopup --> StatusIndicator
    ChatPopup --> CloseButton
    ChatPopup --> MarkdownRenderer["MarkdownRenderer Atom"]
    ChatPopup --> DOMPurify
```

---

## 3. Chat System - RAG Workflow (Complete Flow)

```mermaid
flowchart TD
    Start(["User Opens Chat"])

    Start --> LoadDocs["Load & Index Documents\nloadAndIndexDocuments en + tr\nPromise.all Parallel"]

    LoadDocs --> FetchResume["Fetch Resume EN + TR"]
    LoadDocs --> FetchProjects["Fetch Projects EN + TR"]
    LoadDocs --> FetchFAQ["Fetch FAQ EN + TR"]

    FetchResume --> ChunkResume["Chunk by Headings\n# ## ###"]
    FetchProjects --> ChunkProjects["Chunk by Headings\n# ## ###"]
    FetchFAQ --> ChunkFAQ["Chunk by FAQ Pattern\nQ+A pairs"]

    ChunkResume --> AddToIndex["Add to MiniSearch\nfields: title, text\nstore: title, text, source, locale"]
    ChunkProjects --> AddToIndex
    ChunkFAQ --> AddToIndex

    AddToIndex --> MergeIndex["Merge EN + TR into\nSingle Bilingual Index\nfuzzy: 0.2, title boost: 2x"]
    MergeIndex --> StoreDocs["Store Loaded Docs\nloadedDocumentsRef\nen + tr arrays"]
    StoreDocs --> Ready(["Indexing Complete\nChat Ready"])

    Ready --> UserMsg["User Sends Message"]

    UserMsg --> BuildContext["Build Initial Context\nDeveloper 1: Lazy PII Hydration\nisContactInfoQuery check"]
    BuildContext --> PIICheck{"Contact Info\nRequested?"}
    PIICheck -->|Yes| FullResume["Full Resume\nw/ Email Phone Address"]
    PIICheck -->|No| SanitizedResume["Sanitized Resume\nEMAIL REDACTED\nPHONE REDACTED\nADDRESS REDACTED"]

    FullResume --> InitialCtx["Initial Context:\nRESUME + ALL PROJECTS +\nFAQ Questions List Only"]
    SanitizedResume --> InitialCtx

    InitialCtx --> EmptyGuard{"Content\nLoaded?"}
    EmptyGuard -->|No| NoInfo["Return\nnoRelevantInformationFound"]
    EmptyGuard -->|Yes| CallLLM["Call puter.ai.chat\nStreaming + Tools"]

    CallLLM --> StreamLoop["Stream Response Loop"]
    StreamLoop --> ParseChunk["Parse Stream Chunk"]
    ParseChunk --> CheckType{"Chunk Type?"}

    CheckType -->|text| AppendText["Append to\nassistantText\nUpdate UI"]
    CheckType -->|usage| TrackUsage["Parse Usage\nprompt, completion,\ninput_cache_read"]
    CheckType -->|reasoning| DropReasoning["DROP - Prevent\nCoT Leakage"]
    CheckType -->|tool_use| CaptureTool["Capture expandSearch\nquery and searchType"]

    AppendText --> StreamLoop
    TrackUsage --> StreamLoop
    DropReasoning --> StreamLoop
    CaptureTool --> StreamLoop

    StreamLoop --> StreamEnd{"Stream\nComplete?"}
    StreamEnd -->|No| StreamLoop
    StreamEnd -->|Yes| ToolCheck{"Tool Call\nRequested?"}

    ToolCheck -->|No| PersistMsg["Persist to\napiHistoryRef\nUpdate Token Usage"]
    ToolCheck -->|Yes| ExecTool["Execute expandSearch"]

    ExecTool --> SearchType{"searchType?"}
    SearchType -->|broader| SearchFAQ["searchFAQ\nDedicated FAQ Index\nfuzzy: 0.1, boost: 3x"]
    SearchType -->|crossLocale| SearchCross["performSearch\nOther Locale Only\nfuzzy: 0.3, max: 8"]

    SearchFAQ --> FAQMatch{"FAQ\nMatched?"}
    FAQMatch -->|Yes| FAQResult["Return FAQ Q+A\nChunks"]
    FAQMatch -->|No| GeneralSearch["performSearch\nGeneral MiniSearch\nfuzzy: 0.4, max: 10"]

    SearchCross --> CrossResult["Return Cross-Locale\nResults"]

    FAQResult --> BuildExpanded["Build Expanded Context"]
    GeneralSearch --> BuildExpanded
    CrossResult --> BuildExpanded

    BuildExpanded --> CallLLM2["Second puter.ai.chat\nFollow-up with\nExpanded Context"]
    CallLLM2 --> StreamLoop2["Stream Final Response\nSame parsing logic"]
    StreamLoop2 --> PersistMsg

    PersistMsg --> CompactCheck["checkAndEnqueueCompaction\nREAL token usage:\nprompt + input_cache_read\n> 75% of 131K?"]
    CompactCheck -->|Yes| EnqueueJob["Enqueue Compaction Job\nqueueMicrotask"]
    CompactCheck -->|No| Ready

    EnqueueJob --> CompactionQueue["Compaction Queue\nSequential Processing"]
    CompactionQueue --> CompactProcess["compactHistoryWithLLM\nPrompt: Extract facts\nPreserve specifics\nNo tables, no fabrication"]
    CompactProcess --> CompactSuccess{"Success?"}
    CompactSuccess -->|Yes| UpdateHistory["apiHistoryRef =\nSummary System +\nLast 2 Turns\nReset Token Usage"]
    CompactSuccess -->|No| RetryLogic["Exponential Backoff\n1s, 2s, 4s\nMax 3 Attempts"]
    RetryLogic -->|Retry| CompactionQueue
    RetryLogic -->|Max Retries| FallbackTrunc["Fallback:\nTruncate to\nLast 2 Turns"]

    UpdateHistory --> Ready
    FallbackTrunc --> Ready

    style Start fill:#e1f5fe
    style Ready fill:#c8e6c9
    style NoInfo fill:#ffcdd2
    style DropReasoning fill:#fff3e0
    style EnqueueJob fill:#e8eaf6
    style CompactProcess fill:#e8eaf6
```

---

## 4. Background Conversation Compaction (Developer 2)

```mermaid
sequenceDiagram
    participant User
    participant ChatPopup
    participant Queue as CompactionQueue
    participant LLM as PuterAI
    participant Ref as apiHistoryRef
    participant Token as tokenUsageRef
    participant UI as UsageIndicator

    Note over ChatPopup: After each successful turn
    ChatPopup->>Token: Accumulate prompt + input_cache_read
    ChatPopup->>ChatPopup: checkAndEnqueueCompaction(history)

    alt Tokens > 75% of 131K (~98K)
        ChatPopup->>Queue: Enqueue CompactionJob\n{id, history, resolve, reject, attempt: 0}
        ChatPopup->>ChatPopup: queueMicrotask(processCompactionQueue)

        Note over Queue: Sequential processing\n(one at a time)

        loop Compaction Attempt
            Queue->>UI: setIsHistorySummarizing(true)\nShow HistorySummarizing pill
            Queue->>LLM: puter.ai.chat(summary prompt,\nhistory, AbortSignal)

            alt Success
                LLM-->>Queue: Compacted Summary
                Queue->>Ref: apiHistoryRef = [Summary System] + last 2 turns
                Queue->>Token: Reset tokens\nprompt = 60% compacted\ncache = 40% compacted
                Queue->>UI: setIsHistorySummarizing(false)
            else AbortError (unmount/new msg)
                Queue->>Queue: Abort cleanly\nNo state corruption
            else Failure (network/error)
                Queue->>Queue: attempt++
                alt attempt <= 3
                    Queue->>Queue: Wait 1s * 2^(attempt-1)\nRe-queue via queueMicrotask
                else Max retries
                    Queue->>Ref: Fallback: history.slice(-2)
                    Queue->>UI: setIsHistorySummarizing(false)
                end
            end
        end
    else Tokens <= 75% threshold
        ChatPopup->>ChatPopup: No compaction needed
    end
```

---

## 5. Document Loading & Indexing Pipeline

```mermaid
flowchart LR
    subgraph "Source Files (public/data/)"
        ResumeEN["Resume-EN.md"]
        ResumeTR["Resume-TR.md"]
        ProjectsEN["Projects-EN.md"]
        ProjectsTR["Projects-TR.md"]
        FAQEN["FAQ-EN.md"]
        FAQTR["FAQ-TR.md"]
    end

    subgraph "Loading Phase"
        FetchAll["Promise.all loadAndIndex en + tr"]
        FetchEN["fetch Resume-EN.md\nfetch Projects-EN.md\nfetch FAQ-EN.md"]
        FetchTR["fetch Resume-TR.md\nfetch Projects-TR.md\nfetch FAQ-TR.md"]
    end

    subgraph "Chunking Strategies"
        ChunkStandard["Standard Chunking\nSplit by headings h1-h3\nMin 50 chars"]
        ChunkFAQ["FAQ Chunking\nRegex: N. Question\nCapture Q + full Answer"]
        ExtractFAQ["extractFAQQuestions\nReturns numbered\nquestion list only"]
    end

    subgraph "Indexing"
        MiniSearch1["MiniSearch Instance 1\nlocale: en"]
        MiniSearch2["MiniSearch Instance 2\nlocale: tr"]
        MergeIndex["Merge EN + TR Chunks\nSingle MiniSearch Index\nfields: title, text\nboost: title 2\nfuzzy: 0.2\nprefix: true"]
    end

    subgraph "Runtime Structures"
        SearchIndex["SearchIndex\nminiSearch + documents"]
        LoadedDocs["loadedDocumentsRef\nen + tr arrays"]
    end

    ResumeEN --> FetchEN
    ResumeTR --> FetchTR
    ProjectsEN --> FetchEN
    ProjectsTR --> FetchTR
    FAQEN --> FetchEN
    FAQTR --> FetchTR

    FetchEN --> ChunkStandard
    FetchEN --> ChunkFAQ
    FetchEN --> ExtractFAQ
    FetchTR --> ChunkStandard
    FetchTR --> ChunkFAQ
    FetchTR --> ExtractFAQ

    ChunkStandard --> MiniSearch1
    ChunkFAQ --> MiniSearch1
    ChunkStandard --> MiniSearch2
    ChunkFAQ --> MiniSearch2

    MiniSearch1 --> MergeIndex
    MiniSearch2 --> MergeIndex

    MergeIndex --> SearchIndex
    FetchEN --> LoadedDocs
    FetchTR --> LoadedDocs
```

---

## 6. Resume Rendering Data Flow

```mermaid
flowchart TD
    Build["Build Time"]
    Runtime["Runtime"]

    subgraph "Build Time"
        LocaleJSON["locales/en/translation.json\nlocales/tr/translation.json"]
        Schema["translation.schema.ts\nValidation"]
        HashGen["scripts/hash-locale.mjs\nSHA1 hash to VITE_LOCALE_HASH"]
        ViteBuild["vite build\ntypecheck -> hash -> build"]
    end

    subgraph "Runtime - Initial Load"
        Main["main.tsx import i18n"]
        I18nInit["i18n.init\nHttpBackend + LanguageDetector"]
        LoadLocale["Load locale JSON\nwith VITE_LOCALE_HASH"]
    end

    subgraph "Runtime - Component Render"
        HomePage["HomePage.tsx"]
        Outlet["Outlet to Section Component"]
        Section["Section Component\ne.g. AboutSection"]
        UseTranslation["useTranslation\nreturnObjects: true"]
        TFunc["t('resume.summary')\nreturns typed object"]
        Item["Item Component\ne.g. ProjectCard"]
        Props["Props drilling\ndown hierarchy"]
    end

    LocaleJSON --> Schema
    Schema --> HashGen
    HashGen --> ViteBuild
    ViteBuild --> Main

    Main --> I18nInit
    I18nInit --> LoadLocale
    LoadLocale --> HomePage
    HomePage --> Outlet
    Outlet --> Section
    Section --> UseTranslation
    UseTranslation --> TFunc
    TFunc --> Props
    Props --> Item
```

---

## 7. Routing Structure

```mermaid
graph TD
    Router["createBrowserRouter App Layout"]

    App["App\nOutlet + Loading"]

    Root["path: /\nchildren: HomePage"]

    HomePage["HomePage\nActivityBar + StatusBar +\nPaper + Outlet +\nChatPopup"]

    subgraph "Nested Routes (HomePage children)"
        About["index: true\nAboutSection"]
        Skills["path: skills\nSkillsSection"]
        Experience["path: experience\nExperienceSection"]
        Projects["path: projects\nProjectsSection"]
        Education["path: education\nEducationSection"]
        Certifications["path: certifications\nCertificationsSection"]
        Languages["path: languages\nLanguagesSection"]
        Contact["path: contact\nContactSection"]
    end

    ContactPrivacy["Contact children\npath: empty\nPrivacyPage isPlainText true"]

    Privacy["path: privacy\nPrivacyPage isPlainText false"]
    Error["errorElement\nErrorPage"]

    Router --> App
    App --> Root
    Root --> HomePage
    HomePage --> About
    HomePage --> Skills
    HomePage --> Experience
    HomePage --> Projects
    HomePage --> Education
    HomePage --> Certifications
    HomePage --> Languages
    HomePage --> Contact
    Contact --> ContactPrivacy
    Root --> Privacy
    Root -.->|errors| Error
```

---

## 8. Chat System - ExpandSearch Tool Decision Tree

```mermaid
flowchart TD
    LLMDecision["LLM Evaluates\nInitial Context vs User Question"]

    LLMDecision --> Sufficient{"Resume/Projects\nDirectly Answer?"}

    Sufficient -->|Yes| Answer["Answer Immediately\nHARD STOP"]

    Sufficient -->|No| FAQMatch{"Exact/Near-Exact\nFAQ Question Match?"}

    FAQMatch -->|Yes| CallFAQ["Call expandSearch\nquery: exact FAQ\nsearchType: broader"]

    FAQMatch -->|No| Insufficient{"Insufficient\nContext?"}

    Insufficient -->|Yes| CallBroader["Call expandSearch\nquery: refined\nsearchType: broader"]

    Insufficient -->|No/Partial| StillInsufficient{"Still\nInsufficient?"}

    StillInsufficient -->|Yes| CallCross["Call expandSearch\nquery: refined\nsearchType: crossLocale"]

    StillInsufficient -->|No| CallBroader

    CallFAQ --> ToolResult["Tool Returns\nExpanded Context"]
    CallBroader --> ToolResult
    CallCross --> ToolResult

    ToolResult --> EmptyCheck{"Results\nEmpty?"}

    EmptyCheck -->|Yes| EmptyMsg["State exactly:\nI don't have specific\ninformation about that\nin my available docs"]
    EmptyCheck -->|No| FollowUp["Second LLM Call\nwith Expanded Context\nStream Final Answer"]

    FollowUp --> Answer

    subgraph "Tier 1: Explicit Project/Job Evidence"
        T1["Specific named project\nor job description\nexplicitly mentions X\nCite project/role\nSTOP"]
    end

    subgraph "Tier 2: Skill/FAQ Only"
        T2["X in TECHNICAL SKILLS\nor FAQ titles only\nNOT in project/job desc\nAhmet has X listed\nas a technical skill\nbut no project evidence\nSTOP"]
    end

    subgraph "Tier 3: Not Mentioned"
        T3["X nowhere in docs\nAvailable documents\ndo not explicitly mention X\nCite related evidence only\nSTOP\nNo general architectures"]
    end

    classDef tier1 fill:#c8e6c9
    classDef tier2 fill:#fff3e0
    classDef tier3 fill:#ffcdd2
    class T1 tier1
    class T2 tier2
    class T3 tier3
```

---

## 9. Token Usage Tracking & Compaction Trigger

```mermaid
sequenceDiagram
    participant Stream as PuterJSStream
    participant ChatPopup
    participant TokenRef as TokenUsageRef
    participant Compaction as CheckAndEnqueueCompaction
    participant UI as UsageIndicator

    Note over ChatPopup: Turn starts
    ChatPopup->>Stream: puter.ai.chat(messages, options)

    loop For each chunk
        Stream-->>ChatPopup: chunk received

        alt chunk is usage event
            ChatPopup->>ChatPopup: parseUsageFromChunk
            ChatPopup->>TokenRef: store turnUsage
        else chunk is reasoning
            ChatPopup->>ChatPopup: DROP (prevent CoT leak)
        else chunk is text
            ChatPopup->>ChatPopup: append to assistantText, update UI
        end
    end

    ChatPopup->>TokenRef: accumulate prompt + inputCacheRead

    ChatPopup->>Compaction: checkAndEnqueueCompaction

    Compaction->>TokenRef: read prompt + inputCacheRead
    Compaction->>Compaction: threshold = 131000 * 0.75

    alt prompt + inputCacheRead > threshold
        Compaction->>Compaction: enqueue job via queueMicrotask
    else
        Compaction->>Compaction: no action needed
    end

    UI->>TokenRef: read tokenUsageRef (reactive)
    UI->>UI: calculate percentage
    UI->>UI: set color (green/amber/red)
    UI->>UI: display Prompt | Cache | Total | %

    Note over UI: During compaction:\nShow HistorySummarizing pill\nwith spinner
```

---

## 10. Internationalization Flow

```mermaid
flowchart TD
    Build["Build Phase"]
    Runtime["Runtime Phase"]

    subgraph "Build"
        LocaleFiles["locales/en/translation.json\nlocales/tr/translation.json"]
        SchemaValidation["translation.schema.ts\nZod validation\ntype-safe keys"]
        HashLocale["scripts/hash-locale.mjs\nSHA1 combined content\nto VITE_LOCALE_HASH"]
        ViteConfig["vite.config.ts\ndefine: VITE_LOCALE_HASH"]
    end

    subgraph "Runtime - Init"
        MainImport["main.tsx import i18n/index.ts"]
        I18nConfig["i18n.init\nHttpBackend + LanguageDetector\nload: languageOnly"]
        LoadPath["backend.loadPath\n/locales/lng/translation.json?v=VITE_LOCALE_HASH"]
        DetectLang["LanguageDetector\nnavigator.language to en/tr"]
        Fallback["fallbackLng:\nVITE_LOCALE_DEFAULT"]
    end

    subgraph "Runtime - Usage"
        UseTrans["useTranslation\n{t, i18n}"]
        ReturnObjects["t('key', returnObjects: true)\nreturns typed objects"]
        ChangeLang["i18n.changeLanguage('tr')\nreload locale JSON\nre-render components"]
        ChatLocale["ChatPopup:\ncurrentLocale = i18n.language\nSelects docs per locale"]
    end

    LocaleFiles --> SchemaValidation
    SchemaValidation --> HashLocale
    HashLocale --> ViteConfig
    ViteConfig --> MainImport

    MainImport --> I18nConfig
    I18nConfig --> LoadPath
    LoadPath --> DetectLang
    DetectLang --> Fallback
    Fallback --> UseTrans
    UseTrans --> ReturnObjects
    UseTrans --> ChangeLang
    UseTrans --> ChatLocale
```

---

## 11. Security & Privacy Layers

```mermaid
graph TB
    subgraph "Input Sanitization"
        LazyPII["Lazy PII Hydration\nisContactInfoQuery check\nstripPIIFromResume"]
        FAQFilter["FAQ EXTERNAL Filter\nCommented guard in\nchunkFAQDocument"]
        ToolValidation["Tool Call Validation\nComplete tool_use only\nValidated at stream time"]
    end

    subgraph "Stream Security"
        ReasoningDrop["Reasoning Token Drop\nif part.type === reasoning\ncontinue"]
        AbortControl["AbortController\nCleanup on unmount\nwasAborted flag"]
    end

    subgraph "Output Sanitization"
        DOMPurifyConfig["DOMPurify Hardened\nALLOWED_URI_REGEXP\nFORBID_TAGS: style,iframe,form,script\nFORBID_ATTR: onerror,onload,onclick...\nADD_ATTR: target,rel"]
    end

    subgraph "Data Minimization"
        BilingualIndex["Single Bilingual Index\nNo locale mixing in\nunrelated queries"]
        CrossLocaleOnly["crossLocale searches\nONLY other locale\nNot all locales"]
        FAQOnlyList["Initial Context:\nFAQ Questions ONLY\nAnswers via expandSearch"]
    end

    UserQuery["User Message"] --> LazyPII
    UserQuery --> ToolValidation
    StreamChunks["Puter.js Stream"] --> ReasoningDrop
    StreamChunks --> AbortControl
    LLMResponse["Raw LLM Output"] --> DOMPurifyConfig
    DocumentStore["Document Sources"] --> FAQFilter
    DocumentStore --> BilingualIndex
    SearchLogic --> CrossLocaleOnly
    ContextBuild --> FAQOnlyList
```

---

## 12. Build & Deployment Pipeline

```mermaid
flowchart LR
    Dev["yarn dev\nVite Dev Server\nHMR + TypeScript"]

    TypeCheck["yarn typecheck\ntsc --noEmit"]
    HashLocale["yarn hash:locale\nscripts/hash-locale.mjs\nSHA1 to .env"]
    Build["yarn build\nTypecheck -> Hash -> vite build"]
    Lint["yarn build:lint\neslint + build"]
    Deploy["yarn deploy\ngh-pages -d dist"]

    subgraph "GitHub Pages"
        GHAction["GitHub Pages Deployment\n404.html SPA fallback\nbase: /"]
    end

    Dev --> TypeCheck
    TypeCheck --> HashLocale
    HashLocale --> Build
    Build --> Lint
    Lint --> Deploy
    Deploy --> GHAction

    %% Key outputs
    Build --> Dist["dist/\nindex.html\nassets/\nlocales/\nchunks/"]
    HashLocale --> EnvFile[".env\nVITE_LOCALE_HASH\nVITE_ASSET_HASH"]
```

---

## 13. State Management Overview

```mermaid
graph TD
    subgraph "HomePage State"
        ChatOpen["chatOpen: boolean\ntoggleChat"]
        I18nLang["i18n.language\nfrom i18n instance"]
    end

    subgraph "ChatPopup State (Local)"
        Messages["messages: Message[]\nUI display only"]
        Draft["draft: string\ncontrolled input"]
        IsLoading["isLoading: boolean"]
        IsIndexing["isIndexing: boolean"]
        SearchIndex["searchIndex: SearchIndex | null\nMiniSearch + documents"]
        BottomRef["bottomRef: HTMLDivElement\nscroll anchor"]
        InputRef["inputRef: HTMLTextAreaElement\nfocus management"]
        ScrollContainer["scrollContainerRef: HTMLDivElement\nscroll listener"]
        AbortController["abortControllerRef: AbortController\nstream cancellation"]
        ApiHistory["apiHistoryRef: ChatMessage[]\nLLM conversation history\nEXCLUDES greeting"]
        LoadedDocs["loadedDocumentsRef: {en, tr}\nFull document content\nper locale for context"]

        subgraph "Compaction Refs (Developer 2)"
            CompQueue["compactionQueueRef: CompactionJob[]\nSequential job queue"]
            IsSummarizing["isHistorySummarizingRef: boolean\nLock for queue processing"]
            CompAbort["compactionAbortControllerRef\nAbort active compaction"]
        end

        TokenUsage["tokenUsageRef: UsageInfo\nAccumulated: prompt, completion,\ninput_cache_read, request..."]
        UserScrolled["isUserScrolledUpRef: boolean\nPause auto-scroll > 80px"]
        DraftRef["draftRef: string\nStable ref for send\nAvoids useCallback recreation"]
    end

    subgraph "Derived/UI State"
        IsSummarizingState["isHistorySummarizing: boolean\nMirror for UsageIndicator"]
        UsagePercent["getUsagePercent\n(prompt + cache) / 131k * 100"]
        UsageColor["getUsageColor\nsafe/warning/danger"]
    end

    ChatOpen --> ChatPopup
    I18nLang --> ChatPopup
    ChatPopup --> Messages
    ChatPopup --> Draft
    ChatPopup --> IsLoading
    ChatPopup --> IsIndexing
    ChatPopup --> SearchIndex
    ChatPopup --> ApiHistory
    ChatPopup --> LoadedDocs
    ChatPopup --> CompQueue
    ChatPopup --> IsSummarizing
    ChatPopup --> CompAbort
    ChatPopup --> TokenUsage
    ChatPopup --> UserScrolled
    ChatPopup --> DraftRef

    TokenUsage --> UsagePercent
    UsagePercent --> UsageColor
    IsSummarizing --> IsSummarizingState
```

---

## 14. Key Design Patterns Summary

| Pattern                 | Implementation                                     | Location                                                    |
| ----------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| **Atomic Design**       | atoms -> molecules -> components/sections -> pages | `src/atoms`, `src/molecules`, `src/components`, `src/pages` |
| **Data-Driven UI**      | i18n JSON -> useTranslation -> props drilling      | `src/i18n`, all Section/Item components                     |
| **Centralized Theming** | MUI createTheme + Emotion CacheProvider            | `src/theme/index.ts`, `main.tsx`                            |
| **Design Token Spec**   | DESIGN.md (Google Design Token Spec v1 alpha)      | `DESIGN.md` -> token references in components               |
| **Memoization**         | React.memo on presentational components            | All atoms, molecules, items, sections                       |
| **Bundle Optimization** | Direct MUI imports (`@mui/material/Button`)        | All component files                                         |
| **Asset Hashing**       | SHA1 hash -> `?v=hash` cache busting               | `scripts/hash-locale.mjs`, `vite.config.ts`                 |
| **Path Aliasing**       | `@/` -> `src/` via `vite-tsconfig-paths`           | `tsconfig.json`, `vite.config.ts`                           |
| **Error Boundaries**    | ErrorBoundary wraps RouterProvider                 | `main.tsx`, `src/components/ErrorBoundary.tsx`              |
| **Responsive Design**   | useMediaQuery(theme.breakpoints.down('md'))        | `StatusBar.tsx`, `ActivityBar.tsx`                          |
| **Accessibility**       | aria-modal, aria-label, Escape key, IME support    | `ChatPopup.tsx`, `ActivityBar.tsx`                          |

---

## 15. Chat System - Component Interaction Detail

```mermaid
graph LR
    subgraph "ChatPopup Internal"
        SendBtn["Send Button\nIconButton + Enter key (IME safe)"]
        Input["TextField\nmultiline, maxRows=3"]
        StopBtn["Stop Button\nIconButton"]
        ScrollArea["Stack ref=scrollContainerRef\nonScroll -> isUserScrolledUpRef"]
        MsgList["Messages.map -> Box + Paper +\nMarkdownRenderer"]
        UsageInd["UsageIndicator\nToken counts, %, Model, Compaction"]
        LoadingIdx["CircularProgress\nisIndexing / isLoading"]
    end

    subgraph "Core Logic (useCallback)"
        Send["send\nBuild context -> Stream -> Tools -> Persist"]
        HandleChange["handleChange\nsetDraft"]
        HandleKeyDown["handleKeyDown\nEnter + !isComposing -> send"]
        HandleStop["handleStop\nabortController.abort"]
        PerformSearch["performSearch\nMiniSearch with locale filter"]
        SearchFAQ["searchFAQ\nDedicated FAQ index"]
        CheckCompact["checkAndEnqueueCompaction\nThreshold -> Queue"]
    end

    subgraph "Refs (Mutable, No Re-render)"
        ApiHistoryRef["apiHistoryRef\nLLM history"]
        LoadedDocsRef["loadedDocumentsRef\nFull docs per locale"]
        CompQueueRef["compactionQueueRef\nJob queue"]
        TokenUsageRef["tokenUsageRef\nReal usage from stream"]
        AbortRef["abortControllerRef\nStream control"]
        DraftRef["draftRef\nStable draft for send"]
        ScrollRefs["scrollContainerRef\nbottomRef\ninputRef"]
    end

    SendBtn --> Send
    Input --> HandleChange
    Input --> HandleKeyDown
    StopBtn --> HandleStop
    ScrollArea --> Send
    MsgList --> Send
    UsageInd --> TokenUsageRef
    UsageInd --> CompQueueRef
    LoadingIdx --> IsIndexing/IsLoading

    Send --> ApiHistoryRef
    Send --> LoadedDocsRef
    Send --> PerformSearch
    Send --> SearchFAQ
    Send --> TokenUsageRef
    Send --> AbortRef
    Send --> DraftRef
    Send --> CheckCompact

    CheckCompact --> CompQueueRef
    CheckCompact --> TokenUsageRef
```
