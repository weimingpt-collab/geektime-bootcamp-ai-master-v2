# OpenCode Conversation Visualizer - Design Document

## Overview

A React-based visualization app for viewing OpenCode LLM conversation logs stored in JSONL format. Users can open a JSONL file and view the conversation turns in an organized, scrollable interface with markdown rendering.

## Data Schema

### JSONL File Structure

Each line in a `.jsonl` file is a JSON object with one of two types:

#### `turn_start` Entry
```typescript
interface TurnStart {
  type: "turn_start"
  timestamp: string              // ISO timestamp
  sessionID: string              // Session identifier
  conversationID: string         // 8-char conversation ID
  turnIndex: number              // Sequential turn number (1-based)
  input: {
    system: string[]             // System prompts array
    messages: MessageWithParts[] // Complete message history
  }
}

interface MessageWithParts {
  info: {
    id: string
    sessionID: string
    role: "user" | "assistant"
    time: { created: number; completed?: number }
    agent?: string
    model?: { providerID: string; modelID: string }
    tools?: Record<string, boolean>
    // ... other metadata
  }
  parts: Part[]
}
```

#### `turn_complete` Entry
```typescript
interface TurnComplete {
  type: "turn_complete"
  timestamp: string
  sessionID: string
  conversationID: string
  turnIndex: number
  output: {
    message: AssistantMessageInfo
    parts: Part[]
  }
}

interface AssistantMessageInfo {
  id: string
  sessionID: string
  role: "assistant"
  time: { created: number; completed?: number }
  agent?: string
  modelID?: string
  providerID?: string
  cost?: number
  tokens?: {
    input: number
    output: number
    reasoning: number
    cache?: { read: number; write: number }
  }
  finish?: "stop" | "tool-calls" | string
  error?: { name: string; data: any }
}
```

#### Part Types
```typescript
type Part =
  | { type: "text"; text: string; time?: { start: number; end: number } }
  | { type: "tool-invocation"; tool: string; input: any; output?: any; state: string }
  | { type: "step-start"; snapshot?: string }
  | { type: "step-finish"; reason: string; cost?: number; tokens?: TokenInfo }
  | { type: "thinking"; text: string }
  // ... other part types
```

## UI Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header: File Selector + Metadata                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Turn 1                                              │   │
│  │  ┌─────────────────────────────────────────────────┐│   │
│  │  │  INPUT (collapsible)                            ││   │
│  │  │  - System Prompts                               ││   │
│  │  │  - Messages (scrollable)                        ││   │
│  │  └─────────────────────────────────────────────────┘│   │
│  │  ┌─────────────────────────────────────────────────┐│   │
│  │  │  OUTPUT                                          ││   │
│  │  │  - Assistant Response (markdown)                ││   │
│  │  │  - Tool Calls (if any)                          ││   │
│  │  │  - Metadata (tokens, cost, timing)              ││   │
│  │  └─────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Turn 2                                              │   │
│  │  ...                                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Header
│   ├── FileSelector (drag & drop + button)
│   └── ConversationMeta (sessionID, conversationID, turnCount)
├── TurnList (scrollable container)
│   └── TurnCard (for each turn)
│       ├── TurnHeader (turnIndex, timestamp, expand/collapse)
│       ├── InputSection (collapsible)
│       │   ├── SystemPromptViewer (accordion)
│       │   └── MessageList (scrollable)
│       │       └── MessageCard
│       │           └── PartRenderer
│       └── OutputSection
│           ├── AssistantResponse (markdown rendered)
│           ├── ToolCallList (if any)
│           └── MetadataBar (tokens, cost, timing)
└── PartRenderer (recursive)
    ├── TextPart (markdown)
    ├── ToolInvocationPart
    ├── ThinkingPart
    └── StepPart
```

### Key UI Features

1. **File Selection**: Drag & drop or file picker for JSONL files
2. **Turn Navigation**: Vertical scroll through turns with sticky headers
3. **Collapsible Sections**: System prompts and inputs can be collapsed
4. **Scrollable Content Areas**: Max-height with overflow scroll for long content
5. **Markdown Rendering**: All text content rendered as markdown
6. **Syntax Highlighting**: Code blocks with syntax highlighting
7. **Metadata Display**: Tokens, cost, timing displayed in compact format
8. **Error Highlighting**: Errors displayed with red styling

## Technical Stack

- **Framework**: React 18+ with TypeScript
- **Build**: Vite
- **Styling**: CSS with design tokens + global styles
- **Markdown**: react-markdown with remark-gfm
- **Syntax Highlighting**: react-syntax-highlighter (Prism)
- **Icons**: lucide-react

## File Structure

```
visualizer/
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── styles/
│   ├── design-token.css      # CSS custom properties
│   └── global.css            # Global styles
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── types/
    │   └── conversation.ts   # TypeScript interfaces
    ├── utils/
    │   └── parser.ts         # JSONL parsing utilities
    └── components/
        ├── Header.tsx
        ├── FileSelector.tsx
        ├── TurnList.tsx
        ├── TurnCard.tsx
        ├── InputSection.tsx
        ├── OutputSection.tsx
        ├── MessageCard.tsx
        ├── PartRenderer.tsx
        ├── MarkdownRenderer.tsx
        └── MetadataBar.tsx
```

## Design Tokens

```css
:root {
  /* Colors */
  --color-bg-primary: #0d1117;
  --color-bg-secondary: #161b22;
  --color-bg-tertiary: #21262d;
  --color-border: #30363d;
  --color-text-primary: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-accent: #58a6ff;
  --color-success: #3fb950;
  --color-warning: #d29922;
  --color-error: #f85149;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  --font-mono: "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
}
```

## Scrolling Behavior

- **Main container**: Full viewport height with vertical scroll
- **Turn cards**: Auto height, no individual scroll
- **Input/Output sections**: Max-height of 400px with overflow-y: auto
- **System prompts**: Collapsed by default, max-height 300px when expanded
- **Code blocks**: Horizontal scroll for long lines

## Responsive Considerations

- Desktop-first design (primary use case)
- Min-width: 768px for full functionality
- Mobile: Simplified single-column layout
