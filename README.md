# Ahmet Fatihoglu's Personal Website

## Overview

This is a personal portfolio website for Ahmet Fatihoglu, a Senior Software Developer. The website is a dynamic, data-driven single-page application built with a modern React and TypeScript stack.

## Architecture Overview

### Technology Stack

- **Core Framework**: React 19 with TypeScript
- **Build Tool**: Vite with `vite-tsconfig-paths` for module aliasing.
- **UI Library**: Material-UI (MUI) v7 with Emotion for styling.
- **State Management**: Local component state managed by React Hooks (`useState`).
- **Internationalization**: `i18next` with `react-i18next`.
- **Deployment**: GitHub Pages.

### Main Modules and Responsibilities

The project follows an **Atomic Design** methodology to structure its components:

-   **`src/data`**: Contains the `resumeData.ts` file, which acts as the single source of truth for all content displayed on the page.
-   **`src/types`**: Defines the TypeScript interfaces for the core data structures (e.g., `ResumeData`, `Project`, `Experience`).
-   **`src/atoms`**: The smallest reusable components (e.g., `ActivityButton`, `BoldedText`). They are unaware of their context and contain no business logic.
-   **`src/molecules`**: Compositions of atoms that form more complex components (e.g., `ActivityBar`, `ChatPopup`). They contain minimal business logic.
-   **`src/components/resume`**: Contains the main UI components, separated into `sections` (e.g., `ProjectsSection`) and `items` (e.g., `ProjectCard`), responsible for rendering the resume data.
-   **`src/pages`**: The top-level page component (`HomePage`) responsible for layout, state management, and composing all other components.

## Data Flow

The application follows a **unidirectional data flow**:

1.  All resume content is defined in the `resumeData.ts` object.
2.  The `HomePage` component imports this data.
3.  Based on the active navigation state, `HomePage` selects the relevant slice of data.
4.  The data is passed down as props to the appropriate `Section` component (e.g., `<ProjectsSection projects={resumeData.projects} />`).
5.  The `Section` component then maps over the data and passes individual items as props to `Item` components (e.g., `<ProjectCard />`).

## Design Patterns and Best Practices

-   **Data-Driven UI**: The UI is dynamically generated from a central, structured data source (`resumeData.ts`), making content updates easy and consistent.
-   **Atomic Design**: Components are organized by complexity, promoting reusability and maintainability.
-   **Centralized Theming**: All styling values (colors, fonts) are managed through a single, comprehensive theme object in `App.tsx`.
-   **Performance Optimization**:
    -   **Memoization**: All presentational components are wrapped in `React.memo` to prevent unnecessary re-renders.
    -   **Bundle Size**: All Material-UI components are imported using direct paths (e.g., `import Button from "@mui/material/Button"`) to ensure optimal tree-shaking.
-   **Path Aliasing**: The project is configured to use the `@/` alias for absolute imports, improving readability and maintainability.
-   **Internationalization**: All content is fully internationalized with support for English and Turkish, with language auto-detection based on the user's browser settings.

## License

This project's all rights reserved - see the [LICENSE](LICENSE.txt) file for details.
