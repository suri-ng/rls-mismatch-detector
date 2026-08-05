# Frontend Architecture & Functional Structure: Security Analysis Web App

## 1. Tech Stack & Preferences
* **Framework:** React + Next.js
* **Styling/UI:** Custom internal Design System (assume standard functional components exist).
* **API Integration Strategy:** 
  * Because the security analysis pipeline is a long-running task, a single blocking REST `POST` is not recommended. 
  * **Primary Pattern (Polling):** Use a REST `POST` to upload files/schemas and trigger the run. The backend should return a `job_id`. The frontend will then use a REST `GET` on an interval (polling) to check the `job_id` status until it completes. 
  * **Alternative (SSE):** If the backend supports it, use Server-Sent Events (SSE) to stream the pipeline status stages directly to the client.

## 2. Page Structure & High-Level Layout
The application operates as a single-page workspace (IDE-style layout), preventing the user from losing context between input configuration and analysis results.
* **Layout Model:** Split-pane or Sidebar + Main Content + Overlay Drawer.
* **Header Bar:** Global branding, global pipeline status, and primary "Run Check" action.
* **Left Sidebar (Input Pane):** Configuration, file uploads, and preset selection.
* **Main Content Area (Results Pane):** Data grid/list of the analysis output.
* **Right Overlay / Drawer (Detail View):** Slides in when a specific result row is clicked to show deep-dive comparison.

## 3. Component Hierarchy
* `WorkspaceApp` (Root)
  * `GlobalHeader`
    * `AppTitle`
    * `PipelineStatusIndicator` (Idle | Reading Files | Analyzing | Reconciling)
    * `RunCheckButton` (Primary action)
  * `MainWorkspace` (Flex container)
    * `InputSidebar` (Left panel)
      * `PresetSelector` (Dropdown mapping to backend test cases)
      * `FileUploaderGroup` (Active if "Custom" preset is selected)
        * `SchemaDropzone` (Accepts `.sql` / schema files)
        * `AppCodeDropzone` (Accepts source code files)
    * `ResultsDashboard` (Center panel)
      * `EmptyState` (Shown before first run)
      * `LoadingState` (Skeleton loaders or terminal-style log output during run)
      * `AnalysisSummary` (Counters for Mismatches, Matches, Unknowns, Critical Severities)
      * `ResultsDataGrid` (Sortable/Filterable table)
        * `ResultRow` (Iterated per table + operation)
          * `TableIdentifier` & `OperationType`
          * `StatusBadge` & `SeverityBadge`
    * `ResultDetailDrawer` (Right-side slide-out pane, triggered by `ResultRow` click)
      * `DrawerHeader` (Table + Operation title, Status, Close button)
      * `ExplanationPanel` (Human-readable text of why they differ)
      * `ReconciliationComparison`
        * `AccessClaimCard` (What the app assumes, with code snippet)
        * `EnforcementClaimCard` (What DB enforces, with SQL RLS snippet)

## 4. User Flow
1. **Initialization:** The user loads the app. The `ResultsDashboard` shows an empty state.
2. **Configuration:** The user selects a test case preset or uploads custom `.sql` and app files.
3. **Execution:** The user clicks `RunCheckButton`. The UI disables inputs and begins polling the API, updating the `PipelineStatusIndicator`.
4. **Result Rendering:** The backend resolves with the JSON array of models. The `ResultsDataGrid` populates.
5. **Triage & Deep Dive:** The user clicks a specific `ResultRow`. The `ResultDetailDrawer` opens, displaying the mismatch explanation and comparing the parsed app logic vs. the database RLS policy.