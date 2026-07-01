## PROJECTS

### Distributed File Fragmentor – [github.com/ahmadmdabit/DistributedFileFragmentor](https://github.com/ahmadmdabit/DistributedFileFragmentor)

- **Technologies:** .NET 9, Clean Architecture, SOLID Principles, CQRS, EF Core 9, System.CommandLine, Resilience Patterns
- Architected a distributed file storage system using .NET 9, Clean Architecture and SOLID Principles to fragment large files, distribute them across multiple storage providers (FileSystem, Database), and verify integrity with SHA-256.
- Implemented a CQRS pattern with a source-generated Mediator and engineered a robust batch processing system with isolated DbContext scopes to handle parallel operations safely and efficiently.
- Integrated advanced resilience patterns, including exponential backoff retries and circuit breakers, and implemented security measures against path traversal and symlink attacks.

### SystemProcesses – [github.com/ahmadmdabit/SystemProcesses](https://github.com/ahmadmdabit/SystemProcesses)

- **Technologies:** .NET, WPF, MVVM, Windows API, Zero‑Allocation Patterns, Thread‑Safe Data Structures
- Designed and implemented a high‑performance Windows system monitor and task manager providing hierarchical process views and real‑time resource metrics (CPU, memory, I/O, storage).
- Optimized performance with zero‑allocation pathways and thread‑safe data structures, reducing GC overhead and ensuring responsive UI under heavy system load.
- Integrated tray enhancements and storage statistics modules for holistic monitoring and quick access to system metrics.
- Developed advanced management tools (process termination, elevation, inspection) with safeguards to maintain system stability and compliance.
- Architected a modular, maintainable desktop solution using .NET WPF and MVVM, aligned with enterprise‑grade development practices and open‑sourced under MIT license.

### Meeting System - [github.com/ahmadmdabit/MeetingSystem](https://github.com/ahmadmdabit/MeetingSystem)

- **Technologies:** .NET 9, Angular 20+, Clean Architecture, SOLID Principles, Docker, MinIO, Hangfire, Testcontainers, RxJS
- Architected a full-stack, containerized meeting management system using .NET 9 Clean Architecture and SOLID Principles for the backend and Angular 20+ Standalone Components for the frontend.
- Implemented a complete DevOps environment using Docker Compose, integrating services like MinIO for object storage and Hangfire for background job processing.
- Developed a reactive frontend with RxJS, managing component state declaratively to create a responsive and predictable user experience.
- Established a robust testing strategy for the backend using Testcontainers to run integration tests against a real SQL Server instance, ensuring high reliability.

### Semantic Tool Router – [github.com/ahmadmdabit/semantic-tool-router](https://github.com/ahmadmdabit/semantic-tool-router)

- **Technologies:** TypeScript, Node.js, Commander.js, Ollama Embeddings, JSONL Vector Store, Mermaid/CLI tooling, Vitest
- Architected a semantic tool-routing CLI that solves the “fat agent” tool-catalog problem by indexing tools offline and injecting only the top-K relevant schemas at runtime via just-in-time context injection.
- Implemented a multi-signal retrieval pipeline combining dense cosine similarity, structural intent detection, and keyword-overlap scoring with Reciprocal-Rank Fusion to improve routing accuracy and reduce token bloat.
- Designed a polarity-aware vector store that stores positive and negative embeddings per tool, supports model/dimension validation, threshold-based confidence filtering, and JSONL persistence for fast local routing workflows.
- Built a data-driven intent layer that compiles tool-specific triggers and boosts at runtime, with builtin verb baselines and longest-match disambiguation to avoid hardcoded tool-name routing.

### Linguistics (High-Performance Arabic NLP Library) - [github.com/ahmadmdabit/Linguistics](https://github.com/ahmadmdabit/Linguistics)

- **Technologies:** C#, .NET 10, SOLID Principles, NLP, Span<T>, stackalloc, Morphological Analysis, Stemming, NUnit
- Authored a zero-allocation Arabic Natural Language Processing (NLP) library in C# supporting .NET 6 to 10 with zero external dependencies.
- Engineered performance-critical hot paths using `Span<T>`, `stackalloc`, and integer-packed lookup tables to achieve high throughput for search indexing workloads.
- Implemented advanced diacritic removal and regex-free text sanitization algorithms, improving execution speed compared to standard Regex-based engines.

### App User Data Scanner (High-Performance Directory Crawler) - [github.com/ahmadmdabit/AppUserDataScanner](https://github.com/ahmadmdabit/AppUserDataScanner)

- **Technologies:** C#, .NET 10, NativeAOT, System.Threading.Channels, Producer-Consumer, ZLogger
- Developed a multi-threaded system directory scanner using .NET 10 and NativeAOT for rapid Chromium and Electron profile identification.
- Architected a non-blocking producer-consumer pipeline using `System.Threading.Channels` and `Parallel.ForEachAsync` to traverse folder structures with low resource overhead.
- Optimized path parsing to minimize heap footprint by leveraging `ReadOnlySpan<char>`, `FrozenDictionary`, and object pooling for zero-allocation hot paths.

### Data Import/Export Viewer (WPF Tabular Data Application) - [github.com/ahmadmdabit/DataTablesApp](https://github.com/ahmadmdabit/DataTablesApp)

- **Technologies:** C#, .NET 10, WPF, MVVM, IAsyncEnumerable, DataGrid Virtualization, OpenXML, YamlDotNet, Result Pattern
- Built a WPF desktop data viewer supporting streaming import and export operations across CSV, JSON, XLSX, XML, and YAML formats.
- Implemented memory-efficient data streaming using `IAsyncEnumerable<T>`, OpenXmlReader, and zero-allocation span-based CSV line parsing.
- Designed a clean, decoupled MVVM architecture using CommunityToolkit.Mvvm, featuring virtualized DataGrid elements for smooth rendering of large-scale tabular datasets.

### Personal Website & AI Chat Assistant (RAG) - [github.com/ahmadmdabit/ahmadmdabit.github.io](https://github.com/ahmadmdabit/ahmadmdabit.github.io)

- **Technologies:** SOLID Principles, Atomic Design, React 19, TypeScript, Material-UI (MUI) v7, React Router v7, puter.js, MiniSearch, CSP, GitHub Pages
- Designed and built a dynamic, responsive portfolio website as a data-driven React 19 and TypeScript single-page application (SPA) featuring Atomic Design methodology and React Router v7 navigation.
- Engineered a client-side, production-grade Retrieval-Augmented Generation (RAG) system utilizing `MiniSearch` to build a bilingual full-text search index across structured resume and FAQ documents.
- Developed a conversational AI assistant integration using `puter.js`, implementing streaming, tool-calling pipelines, lazy PII hydration for data privacy, and real-time token telemetry tracking.
- Implemented a non-blocking context compaction queue (`queueMicrotask`) with exponential backoff retries to dynamically summarize conversation histories, avoiding token threshold overflows.
- Hardened client-side security by implementing strict Content Security Policy (CSP) headers, hardened `DOMPurify` sanitizer controls to block XSS vectors, and ensured W3C ARIA accessibility compliance.

### Architectly (AI-Powered Document Generator) - [github.com/ahmadmdabit/architectly](https://github.com/ahmadmdabit/architectly)

- **Technologies:** SOLID Principles, TypeScript, Vite, Puter.js, i18next, IndexedDB, Signal-Based Reactivity, SCSS, WCAG 2.1 AA
- Developed a client-side, AI-powered BRD/PRD document generator built entirely on strict TypeScript, SCSS, and Vite, featuring 100% offline-first execution.
- Engineered a custom, SolidJS-style reactive state management system using lightweight signal primitives (`signal`, `computed`, `effect`) to coordinate application view updates.
- Implemented client-side persistence using IndexedDB (up to 100 documents with FIFO eviction) and localStorage, integrated with Puter.js AI endpoints gated by AbortControllers.
- Designed an accessible UI complying with WCAG 2.1 AA standards, incorporating focus traps, keyboard navigation, and multi-language support (EN/TR/AR) with dynamic RTL rendering.

### MCP CLI (Model Context Protocol Client) - [github.com/ahmadmdabit/mcp-cli](https://github.com/ahmadmdabit/mcp-cli)

- **Technologies:** TypeScript, @modelcontextprotocol/sdk, Bun, Commander.js, Unix Domain Sockets, Windows Named Pipes, GitHub Actions
- Authored a lightweight, type-safe command-line interface (CLI) for Model Context Protocol (MCP) servers using TypeScript and the official `@modelcontextprotocol/sdk`.
- Designed a stateful background daemon mode utilizing platform-specific sockets (Unix Domain Sockets and Windows Named Pipes) to persist active sessions across CLI invocations.
- Engineered client-side policy guards (tool allowlists/denylists, resource access validation, and payload size restriction) alongside JSONPath filtering (`--select`) for response processing.
- Established a multi-platform release pipeline using Bun compiler and GitHub Actions to automate cross-compilation, signing, and integrity verification (SHA-256) for Windows, macOS, and Linux binaries.

### Aided - [github.com/ahmadmdabit/aided](https://github.com/ahmadmdabit/aided)

- **Technologies:** SOLID Principles, JavaScript, TypeScript, Fine-Grained Reactivity, Web Workers, Vitest, TestCafe, Web Security (XSS)
- Authored and published a minimal, zero-dependency JavaScript library (5.92kb) for building reactive user interfaces without a Virtual DOM, leveraging an ownership graph for automatic memory cleanup.
- Engineered an asynchronous longest increasing subsequence (LIS) algorithm using **Web Workers** for non-blocking DOM reconciliation, alongside a high-performance, headless list virtualizer (`VirtualFor`).
- Hardened library security with proactive XSS mitigations, implementing URL protocol blocking (e.g., rejecting `javascript:` on sensitive attributes), automatic event-handler binding validation, and strict tag-name validation.
- Integrated a zero-overhead performance profiler, scheduler error isolation, and `createResource` cancellation utilizing `AbortSignal` API hooks.
- Established a comprehensive testing infrastructure incorporating automated Vitest unit tests and **TestCafe** end-to-end (E2E) browser testing implementing the Page Object Model.

### RepoAIfy - [github.com/ahmadmdabit/RepoAIfy](https://github.com/ahmadmdabit/RepoAIfy)

- **Technologies:** C#, .NET 9, WPF, MVVM, .NET Class Library, .NET CLI, JSON, Git, Markdown
- Architected and developed a dual-interface .NET 9 solution (WPF & CLI) to analyze and document large codebases, using the MVVM pattern to ensure a clean separation of concerns.
- Implemented a dynamic, real-time file filtering system with an interactive tree view and cancellable tasks for a responsive and seamless user experience.
- Engineered an automated output chunking feature to split large code analyses into manageable Markdown files, optimizing them for AI model consumption and review.

### AI Utils Extension - [github.com/ahmadmdabit/ai-utils-extension](https://github.com/ahmadmdabit/ai-utils-extension)

- **Technologies:** React 19, TypeScript, Tailwind CSS, Vite, Vitest, Chrome Manifest V3, Google Gemini AI
- Developed a Chrome extension featuring a multi-step AI pipeline using Google's Gemini AI to perform complex operations on browser tabs, including summarization, translation, and custom data extraction.
- Engineered a modern, responsive user interface with React 19 and Tailwind CSS, featuring real-time task status updates and the ability to synthesize data from multiple tabs into a single output.
- Established a professional, scalable development environment with a strict testing framework (Vitest, React Testing Library) and automated code quality checks using ESLint, Prettier, and Husky git hooks.

### e-store - [github.com/ahmadmdabit/e-store](https://github.com/ahmadmdabit/e-store)

- **Technologies:** .NET 6, ASP.NET Core, RESTful API, N-Tier Architecture, JWT, Entity Framework Core, SQL Server, MVC
- Architected a full-stack e-commerce application on .NET 6, implementing a scalable N-Tier design to cleanly separate the Data Access (DAL), Business Logic (BLL), and API layers.
- Implemented a secure RESTful backend API featuring JWT-based authentication to protect user data and manage application access, fully documented with Swagger.
- Developed a complete user-facing application using ASP.NET Core MVC and Razor Views, integrating core e-commerce features like a product catalog, shopping cart, and order processing.

### NotificationSystem - [github.com/ahmadmdabit/NotificationSystem](https://github.com/ahmadmdabit/NotificationSystem)

- **Technologies:** .NET Core, Microservices Architecture, Ocelot API Gateway, Dapper, SQL Server, RESTful API
- Designed and implemented a distributed system using a microservices architecture, separating user and notification functionalities into independent, scalable services.
- Configured an API Gateway using Ocelot to provide a single, unified entry point, centralizing request routing and simplifying service discovery for the frontend.
- Built a high-performance data access layer using the Dapper ORM for direct SQL query execution, ensuring efficient communication between services and the database.

### SinavOlusturma (Exam Management System) - [github.com/ahmadmdabit/SinavOlusturma](https://github.com/ahmadmdabit/SinavOlusturma)

- **Technologies:** .NET Core, ASP.NET Core, N-Tier Architecture, RESTful API, JWT, Dapper, SQLite, HtmlAgilityPack
- Developed a full-stack exam management system using a clean N-Tier architecture to logically separate the API backend, business logic, and data access layers.
- Implemented a secure, role-based authentication system with JWT to provide distinct permissions and application views for Admin and standard User roles.
- Integrated a web scraping module using HtmlAgilityPack to dynamically extract and import content for exam creation, demonstrating practical data extraction skills.

### Exchange (Real-time Exchange Rate Tracker) - [github.com/ahmadmdabit/Exchange](https://github.com/ahmadmdabit/Exchange)

- **Technologies:** .NET Core, ASP.NET Core, WebSockets, Redis, Vue.js, MySQL, JWT, RESTful API
- Engineered a real-time data pipeline using WebSockets to stream live currency updates from a .NET Core backend to a responsive Vue.js client.
- Implemented Redis for high-performance in-memory caching, dramatically reducing database load and enabling high-frequency, low-latency data updates.
- Developed a multi-component system including a secure RESTful API with JWT authentication and a separate background service to simulate market data fluctuations.

### Market (Customer Management System) - [github.com/ahmadmdabit/market](https://github.com/ahmadmdabit/market)

- **Technologies:** .NET Core, Angular 11, TypeScript, N-Tier Architecture, NHibernate, SQL Server, RESTful API, ag-Grid
- Developed a full-stack customer management application using a clean N-Tier architecture, leveraging the NHibernate ORM for robust, object-oriented data access.
- Built a feature-rich and responsive single-page application (SPA) with Angular 11 for comprehensive data management, including interactive data grids with ag-Grid.
- Designed and implemented a clean RESTful API to serve as the communication layer between the Angular frontend and the .NET backend, ensuring seamless CRUD operations.

### SevenZipRunner – [github.com/ahmadmdabit/SevenZipRunner](https://github.com/ahmadmdabit/SevenZipRunner)

- **Technologies:** .NET 6–10, C#, Dependency Injection, Options Pattern, Async Process Execution, Platform-Aware Runtime Logic
- Built a lightweight .NET library for invoking 7‑Zip from managed code, with support for both compression and extraction through a simple async API.
- Designed platform-aware executable resolution and profile adjustment logic that selects the correct 7‑Zip binary for Windows/Linux and x86/x64, while automatically tuning compression settings to avoid 32-bit memory issues.
- Implemented named compression profiles such as `Balanced`, `Fastest`, `MaxCompression`, and `LogArchiving`, enabling configurable compression level, thread count, and process priority per workload.
- Added structured error handling with a custom `SevenZipException` that surfaces exit code, stderr, and the exact arguments used for failed 7‑Zip operations.

### MCP Hub Web Interface – [github.com/ahmadmdabit/mcp-hub-web-interface](https://github.com/ahmadmdabit/mcp-hub-web-interface)

- **Technologies:** Node.js, Koa.js, vanilla JavaScript, CSS3, HTML5, MCP Protocol, node-fetch
- Built a zero-build, production-ready web dashboard for monitoring and managing MCP Hub servers, providing real-time server status, capability counts, uptime tracking, and management actions through a Spotify-inspired UI.
- Implemented a transparent Koa-based API forwarder that proxies `/api/servers/*` requests to MCP Hub on port 3000, preserving query strings and returning graceful 502 errors when the backend is unreachable.
- Developed inline capability execution for tools, resources, and prompts with dynamic form generation from JSON schemas, dual modal workflows, and execution statistics tracking per server and system-wide.
- Designed a secure client-side interface with XSS-safe rendering via `escapeHtml()`, responsive card-based layouts, and CSS variables architecture for scalable theming and consistent styling.
