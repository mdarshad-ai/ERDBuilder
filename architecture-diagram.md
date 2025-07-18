# ER Diagram Builder - System Architecture

## 🏗️ High-Level Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React UI Components]
        Canvas[Interactive Canvas]
        Ribbon[Ribbon Toolbar]
        Modals[Modal Dialogs]
    end
    
    subgraph "Application Layer"
        App[App.tsx - Main Controller]
        DiagramPage[DiagramPage Component]
        DiagramBuilder[DiagramBuilder Component]
        State[State Management]
    end
    
    subgraph "Data Layer"
        LocalStorage[Browser LocalStorage]
        FileSystem[File System Access]
        Export[Export Formats]
    end
    
    subgraph "External Integrations"
        Electron[Electron Runtime]
        Databricks[Databricks SQL]
        Excel[Excel Import/Export]
    end
    
    UI --> App
    Canvas --> DiagramBuilder
    Ribbon --> App
    Modals --> App
    
    App --> State
    DiagramPage --> State
    DiagramBuilder --> State
    
    State --> LocalStorage
    State --> FileSystem
    State --> Export
    
    Electron --> FileSystem
    Databricks --> App
    Excel --> App
```

## 🔧 Component Architecture

```mermaid
graph LR
    subgraph "Core Components"
        App[App.tsx]
        DiagramPage[DiagramPage.tsx]
        DiagramBuilder[DiagramBuilder.tsx]
    end
    
    subgraph "UI Components"
        AddTableModal[AddTableModal]
        IconButton[IconButton]
        ConfigurationPage[ConfigurationPage]
    end
    
    subgraph "Data Models"
        TableConfig[TableConfig]
        RelationshipConfig[RelationshipConfig]
        Group[Group]
        GlobalGroup[GlobalGroup]
    end
    
    App --> DiagramPage
    DiagramPage --> DiagramBuilder
    App --> AddTableModal
    App --> IconButton
    
    DiagramBuilder --> TableConfig
    DiagramBuilder --> RelationshipConfig
    App --> Group
    App --> GlobalGroup
```

## 📊 Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant App
    participant State
    participant Storage
    participant Export
    
    User->>UI: Create/Edit Table
    UI->>App: handleAddTable()
    App->>State: Update tables array
    State->>Storage: Save to localStorage
    
    User->>UI: Create Relationship
    UI->>App: handleAddRelationship()
    App->>State: Update relationships array
    State->>Storage: Save to localStorage
    
    User->>UI: Export Diagram
    UI->>App: handleExportPNG/SQL/Excel()
    App->>Export: Generate file
    Export->>User: Download file
    
    User->>UI: Import Data
    UI->>App: handleImportJSON/Excel/SQL()
    App->>State: Update project data
    State->>Storage: Save to localStorage
```

## 🎯 Feature Architecture

```mermaid
graph TB
    subgraph "Core Features"
        Tables[Table Management]
        Relationships[Relationship Management]
        Layout[Layout Algorithms]
        Export[Export Formats]
    end
    
    subgraph "Advanced Features"
        FocusMode[Focus Mode]
        DataProducts[Data Products]
        StarAlign[Star Alignment]
        MultiProject[Multi-Project Support]
    end
    
    subgraph "Import/Export"
        JSON[JSON Import/Export]
        SQL[SQL Generation]
        Excel[Excel Import/Export]
        PNG[PNG Export]
        Databricks[Databricks SQL]
    end
    
    subgraph "UI/UX"
        Ribbon[Ribbon Toolbar]
        Canvas[Interactive Canvas]
        Modals[Modal Dialogs]
        Responsive[Responsive Design]
    end
    
    Tables --> Layout
    Relationships --> Layout
    Layout --> StarAlign
    Tables --> DataProducts
    Relationships --> DataProducts
    
    Export --> JSON
    Export --> SQL
    Export --> Excel
    Export --> PNG
    Export --> Databricks
    
    UI/UX --> Ribbon
    UI/UX --> Canvas
    UI/UX --> Modals
    UI/UX --> Responsive
```

## 🛠️ Technology Stack

```mermaid
graph LR
    subgraph "Frontend Technologies"
        React[React 18]
        TypeScript[TypeScript]
        CSS[CSS-in-JS]
        HTML5[HTML5 Canvas]
    end
    
    subgraph "Build Tools"
        Webpack[Webpack]
        Babel[Babel]
        ESLint[ESLint]
        TSConfig[TypeScript Config]
    end
    
    subgraph "Desktop Runtime"
        Electron[Electron]
        NodeJS[Node.js APIs]
        FileSystem[File System Access]
    end
    
    subgraph "Data Formats"
        JSON[JSON]
        SQL[SQL]
        Excel[XLSX]
        PNG[PNG]
    end
    
    React --> TypeScript
    TypeScript --> CSS
    CSS --> HTML5
    
    Webpack --> Babel
    Babel --> ESLint
    ESLint --> TSConfig
    
    Electron --> NodeJS
    NodeJS --> FileSystem
    
    JSON --> SQL
    SQL --> Excel
    Excel --> PNG
```

## 🔄 State Management Architecture

```mermaid
graph TB
    subgraph "Global State"
        Projects[Projects Array]
        SelectedProject[Selected Project ID]
        GlobalGroups[Global Groups]
        FocusMode[Focus Mode State]
    end
    
    subgraph "Project State"
        Tables[Tables Array]
        Relationships[Relationships Array]
        Groups[Local Groups]
        TablePositions[Table Positions]
    end
    
    subgraph "UI State"
        ActiveTab[Active Tab]
        GroupMode[Group Mode]
        SelectedTables[Selected Tables]
        ModalStates[Modal States]
    end
    
    subgraph "Data Flow"
        LocalStorage[LocalStorage]
        FileSystem[File System]
        Export[Export Functions]
    end
    
    GlobalState --> ProjectState
    ProjectState --> UIState
    UIState --> DataFlow
    
    LocalStorage --> GlobalState
    FileSystem --> ProjectState
    Export --> DataFlow
```

## 🎨 UI/UX Architecture

```mermaid
graph TB
    subgraph "Ribbon Toolbar"
        Home[Home Section]
        View[View Section]
        DataProducts[Data Products Section]
        ImportExport[Import/Export Section]
    end
    
    subgraph "Canvas Area"
        Tables[Table Nodes]
        Relationships[Relationship Lines]
        Grid[Grid System]
        Zoom[Zoom/Pan Controls]
    end
    
    subgraph "Sidebar/Modals"
        Properties[Properties Panel]
        AddTableModal[Add Table Modal]
        GroupModal[Data Product Modal]
        ImportModal[Import Modal]
    end
    
    subgraph "Interactive Elements"
        DragDrop[Drag & Drop]
        ClickSelect[Click Selection]
        Keyboard[Keyboard Shortcuts]
        ContextMenu[Context Menus]
    end
    
    RibbonToolbar --> CanvasArea
    CanvasArea --> SidebarModals
    SidebarModals --> InteractiveElements
    
    Home --> AddTableModal
    View --> Properties
    DataProducts --> GroupModal
    ImportExport --> ImportModal
```

## 📈 Performance Architecture

```mermaid
graph LR
    subgraph "Optimization Strategies"
        Virtualization[Virtual Scrolling]
        Debouncing[Event Debouncing]
        Memoization[React.memo]
        LazyLoading[Lazy Loading]
    end
    
    subgraph "Rendering Pipeline"
        Canvas[HTML5 Canvas]
        SVG[SVG Elements]
        DOM[DOM Manipulation]
        State[State Updates]
    end
    
    subgraph "Data Management"
        LocalStorage[LocalStorage]
        IndexedDB[IndexedDB]
        FileSystem[File System]
        Memory[In-Memory Cache]
    end
    
    OptimizationStrategies --> RenderingPipeline
    RenderingPipeline --> DataManagement
    
    Virtualization --> Canvas
    Debouncing --> State
    Memoization --> DOM
    LazyLoading --> FileSystem
```

## 🔒 Security Architecture

```mermaid
graph TB
    subgraph "Client-Side Security"
        InputValidation[Input Validation]
        XSSPrevention[XSS Prevention]
        CSRFProtection[CSRF Protection]
        ContentSecurityPolicy[Content Security Policy]
    end
    
    subgraph "Data Security"
        LocalStorage[LocalStorage Encryption]
        FileValidation[File Validation]
        ExportSanitization[Export Sanitization]
        ImportValidation[Import Validation]
    end
    
    subgraph "Electron Security"
        NodeIntegration[Node Integration Control]
        ContextIsolation[Context Isolation]
        Sandboxing[Process Sandboxing]
        Permissions[File Permissions]
    end
    
    ClientSideSecurity --> DataSecurity
    DataSecurity --> ElectronSecurity
    
    InputValidation --> FileValidation
    XSSPrevention --> ExportSanitization
    CSRFProtection --> ImportValidation
    ContentSecurityPolicy --> NodeIntegration
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DevServer[Development Server]
        HotReload[Hot Reload]
        DevTools[Developer Tools]
        Linting[ESLint/TypeScript]
    end
    
    subgraph "Build Process"
        Webpack[Webpack Build]
        Optimization[Code Optimization]
        Bundling[Asset Bundling]
        Minification[Code Minification]
    end
    
    subgraph "Distribution"
        WebBuild[Web Build]
        ElectronBuild[Electron Build]
        Installer[Installer Creation]
        Updates[Auto Updates]
    end
    
    subgraph "Platforms"
        Web[Web Browser]
        Windows[Windows Desktop]
        MacOS[macOS Desktop]
        Linux[Linux Desktop]
    end
    
    Development --> BuildProcess
    BuildProcess --> Distribution
    Distribution --> Platforms
    
    DevServer --> WebBuild
    HotReload --> ElectronBuild
    DevTools --> Installer
    Linting --> Updates
```

---

## 📋 Key Architecture Highlights

### **1. Modular Component Design**
- Clear separation of concerns between UI, business logic, and data layers
- Reusable components with well-defined interfaces
- TypeScript for type safety and better developer experience

### **2. Hybrid Architecture**
- Web-first development with Electron desktop wrapper
- Single codebase for both web and desktop platforms
- Progressive enhancement approach

### **3. State Management**
- React hooks for local state management
- LocalStorage for persistence
- Multi-project support with global state

### **4. Export/Import Capabilities**
- Multiple format support (JSON, SQL, Excel, PNG)
- Databricks SQL integration
- File system access through Electron

### **5. Advanced Features**
- Focus Mode for better diagram navigation
- Data Products for logical grouping
- Star alignment for fact/dimension tables
- Layout algorithms (Force-directed, Grid, Tree)

### **6. Performance Optimizations**
- Canvas-based rendering for large diagrams
- Debounced event handling
- Lazy loading of components
- Efficient state updates

This architecture provides a solid foundation for a professional ER diagram builder with enterprise-grade features while maintaining simplicity and usability. 