---
description: Perform deep code review for Python and TypeScript focusing on architecture, design patterns, code quality, and best practices.
handoffs:
  - label: Re-review After Fixes
    agent: general-purpose
    prompt: Re-run the deep code review on the updated code
  - label: Generate Refactoring Plan
    agent: general-purpose
    prompt: Create a detailed refactoring plan based on review findings
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Overview

This command performs a comprehensive, multi-dimensional code review for Python and TypeScript codebases, focusing on:

1. **Architecture & Design** - Best practices, interface design, extensibility
2. **Design Principles** - KISS, DRY, YAGNI, SOLID
3. **Code Quality** - Function complexity, parameter limits, maintainability
4. **Design Patterns** - Appropriate use of Builder and other patterns

Once it finished, it shall create a markdown file under ./specs/ with proper name - e.g. <number>-deep-code-review.md

## Execution Flow

### Phase 1: Discovery & Context Analysis

1. **Parse Target Specification**:
   - Extract file paths, directories, or patterns from `$ARGUMENTS`
   - If empty or ambiguous: Ask user to specify target (file, directory, or glob pattern)
   - Valid inputs:
     - Single file: `src/api/user.py`
     - Multiple files: `src/api/user.py src/models/user.ts`
     - Directory: `src/api/`
     - Glob pattern: `src/**/*.py` or `src/**/*.ts`

2. **Language Detection**:
   - Identify Python files (`.py`, `.pyi`)
   - Identify TypeScript files (`.ts`, `.tsx`)
   - Validate at least one supported file is found
   - If mixed languages: Review each separately with language-specific criteria

3. **Gather Codebase Context**:
   - Read all target files
   - Identify project structure and frameworks (FastAPI, Flask, Django, Express, NestJS, React, etc.)
   - Map dependencies and imports
   - Identify architectural patterns in use (MVC, Hexagonal, Microservices, etc.)

### Phase 2: Multi-Dimensional Analysis

For each target file, perform the following analyses in parallel:

#### 2.1 Architecture & Design Analysis

**Python-Specific Checks**:

- [ ] **Module Structure**: Proper separation of concerns (models, services, controllers, utils)
- [ ] **Type Hints**: Comprehensive use of type annotations (PEP 484)
- [ ] **Async Patterns**: Appropriate use of `async`/`await`, not blocking event loop
- [ ] **Interface Design**: Abstract base classes (ABC) for extensibility
- [ ] **Dependency Injection**: Constructor injection vs global state
- [ ] **Error Handling**: Custom exceptions, proper exception hierarchy
- [ ] **Configuration Management**: Settings patterns (Pydantic, environment variables)

**TypeScript-Specific Checks**:

- [ ] **Type Safety**: Proper use of interfaces, types, generics; avoid `any`
- [ ] **Module Boundaries**: Clear separation between layers (presentation, business, data)
- [ ] **Interface Segregation**: Small, focused interfaces
- [ ] **Dependency Injection**: Constructor injection, IoC containers
- [ ] **Async Patterns**: Proper Promise handling, async/await usage
- [ ] **Error Handling**: Custom error classes, typed error responses
- [ ] **Immutability**: Use of `readonly`, `const`, immutable data structures

**Common Architecture Checks**:

- [ ] **Layer Separation**: Clear boundaries between presentation, business logic, and data layers
- [ ] **Extensibility**: Open for extension, closed for modification (Open/Closed Principle)
- [ ] **Coupling**: Low coupling between modules, high cohesion within modules
- [ ] **Abstraction Levels**: Consistent abstraction at each layer
- [ ] **API Design**: RESTful principles, GraphQL best practices, or appropriate RPC patterns

#### 2.2 KISS Principle Analysis

- [ ] **Simplicity**: Solutions are as simple as possible, but no simpler
- [ ] **Clarity**: Code intent is immediately clear without deep analysis
- [ ] **Avoid Over-Engineering**: No premature abstractions or unnecessary complexity
- [ ] **Straightforward Logic**: Minimal nesting, clear control flow
- [ ] **Readable Names**: Self-documenting variable and function names

**Red Flags**:

- Deeply nested conditionals (>3 levels)
- Complex one-liners that sacrifice readability
- Unnecessary abstractions for simple operations
- Over-use of advanced language features where simple solutions exist

#### 2.3 Code Quality Metrics

**Function Complexity Limits**:

- [ ] **Line Count**: Functions ≤150 lines (CRITICAL threshold)
- [ ] **Parameter Count**: Functions ≤7 parameters (CRITICAL threshold)
- [ ] **Cyclomatic Complexity**: McCabe complexity ≤10 (recommended ≤5)
- [ ] **Nesting Depth**: Maximum 3 levels of nesting
- [ ] **Return Paths**: ≤5 return statements per function

**Quality Principles**:

- [ ] **DRY (Don't Repeat Yourself)**:
  - No code duplication >3 lines
  - Shared logic extracted to reusable functions
  - Constants and magic numbers defined once

- [ ] **YAGNI (You Aren't Gonna Need It)**:
  - No speculative features or unused code
  - No over-generalization for hypothetical future needs
  - Remove dead code and commented-out sections

- [ ] **SOLID Principles**:

  **S - Single Responsibility**:
  - Each class/function has one clear purpose
  - Changes to one requirement affect only one module

  **O - Open/Closed**:
  - Open for extension (inheritance, composition, dependency injection)
  - Closed for modification (stable interfaces)

  **L - Liskov Substitution**:
  - Subtypes are substitutable for base types
  - No surprising behavior in derived classes

  **I - Interface Segregation**:
  - Clients not forced to depend on unused methods
  - Small, focused interfaces over large, monolithic ones

  **D - Dependency Inversion**:
  - Depend on abstractions, not concretions
  - High-level modules independent of low-level details

#### 2.4 Design Pattern Analysis

**Builder Pattern Verification** (when applicable):

- [ ] **Proper Structure**:
  - Separate Builder class from Product class
  - Fluent interface (method chaining with `return self`)
  - Clear construction process

- [ ] **Implementation Quality**:

  ```python
  # Python Example
  class UserBuilder:
      def __init__(self):
          self._user = User()

      def with_name(self, name: str) -> 'UserBuilder':
          self._user.name = name
          return self

      def with_email(self, email: str) -> 'UserBuilder':
          self._user.email = email
          return self

      def build(self) -> User:
          self._validate()
          return self._user
  ```

  ```typescript
  // TypeScript Example
  class UserBuilder {
      private user: Partial<User> = {};

      withName(name: string): this {
          this.user.name = name;
          return this;
      }

      withEmail(email: string): this {
          this.user.email = email;
          return this;
      }

      build(): User {
          this.validate();
          return this.user as User;
      }
  }
  ```

- [ ] **Validation**: Builder validates before construction
- [ ] **Immutability**: Built objects are immutable (optional but recommended)
- [ ] **Type Safety**: TypeScript builders use proper generics and type guards

**Other Pattern Recognition**:

Identify and validate appropriate use of:

- Factory Pattern (object creation)
- Strategy Pattern (algorithm selection)
- Observer Pattern (event handling)
- Repository Pattern (data access)
- Decorator Pattern (behavior extension)
- Singleton Pattern (appropriate use cases only)

**Anti-Pattern Detection**:

- God Objects (classes doing too much)
- Anemic Domain Models (all logic in services, no behavior in models)
- Circular Dependencies
- Premature Optimization
- Golden Hammer (using one pattern for everything)

### Phase 3: Issue Categorization & Scoring

Categorize all findings by:

1. **Severity Levels**:
   - 🔴 **CRITICAL**: Security vulnerabilities, major architectural flaws, violations of hard limits (>150 lines, >7 params)
   - 🟠 **HIGH**: Significant design issues, SOLID violations, poor extensibility
   - 🟡 **MEDIUM**: Code smells, moderate complexity, DRY violations
   - 🔵 **LOW**: Style inconsistencies, minor improvements, suggestions

2. **Category Tags**:
   - `[ARCHITECTURE]` - Design and structure issues
   - `[COMPLEXITY]` - Function/class complexity problems
   - `[PATTERNS]` - Design pattern misuse or opportunities
   - `[PRINCIPLES]` - DRY, KISS, YAGNI, SOLID violations
   - `[EXTENSIBILITY]` - Difficulty in extending functionality
   - `[MAINTAINABILITY]` - Long-term maintenance concerns
   - `[TYPE-SAFETY]` - Type annotation or type checking issues
   - `[PERFORMANCE]` - Potential performance bottlenecks

### Phase 4: Generate Comprehensive Report

Create a structured markdown report in this format:

```markdown
# Deep Code Review Report

**Date**: [YYYY-MM-DD]
**Reviewer**: Claude Code Deep Review
**Target**: [Files/Directories Reviewed]
**Languages**: [Python/TypeScript]

---

## Executive Summary

**Overall Health Score**: [0-100]

| Metric                | Score   | Status   |
|-----------------------|---------|----------|
| Architecture & Design | [0-100] | [✅/⚠️/❌] |
| Code Quality          | [0-100] | [✅/⚠️/❌] |
| Design Principles     | [0-100] | [✅/⚠️/❌] |
| Pattern Usage         | [0-100] | [✅/⚠️/❌] |

**Key Findings**:
- [X] Critical issues found
- [X] High-priority issues
- [X] Medium-priority issues
- [X] Positive highlights

---

## Critical Issues (🔴)

### [CATEGORY] Issue Title - `file.py:line`

**Severity**: CRITICAL

**Problem**:
[Clear description of the issue]

**Code Snippet**:
```python
# Problematic code
```

**Why This Matters**:
[Explanation of impact on architecture, maintainability, or functionality]

**Recommended Solution**:

```python
# Improved code
```

**Design Rationale**:
[Explain the architectural or design principle behind the recommendation]

---

## High-Priority Issues (🟠)

[Same structure as Critical Issues]

---

## Medium-Priority Issues (🟡)

[Same structure as Critical Issues]

---

## Low-Priority Suggestions (🔵)

[Same structure as Critical Issues]

---

## Detailed Metrics

### Function Complexity Analysis

| Function          | File          | Lines | Params | Complexity | Status             |
|-------------------|---------------|-------|--------|------------|--------------------|
| `process_payment` | payment.py:45 | 187   | 8      | 15         | ❌ Exceeds limits   |
| `calculate_total` | order.py:120  | 95    | 4      | 6          | ⚠️ High complexity |
| `validate_user`   | auth.py:30    | 42    | 3      | 3          | ✅ Good             |

### SOLID Principles Compliance

| Principle             | Compliance | Issues Found |
|-----------------------|------------|--------------|
| Single Responsibility | 65%        | 5 violations |
| Open/Closed           | 80%        | 2 violations |
| Liskov Substitution   | 100%       | 0 violations |
| Interface Segregation | 75%        | 3 violations |
| Dependency Inversion  | 60%        | 4 violations |

### Code Duplication Report

| Pattern         | Occurrences | Files              | Refactoring Opportunity |
|-----------------|-------------|--------------------|-------------------------|
| [Similar logic] | 4           | file1.py, file2.py | Extract to `common.py`  |

---

## Architectural Observations

### Current Architecture

[Describe the identified architecture pattern: MVC, Hexagonal, Layered, etc.]

**Strengths**:

- [List architectural strengths]

**Weaknesses**:

- [List architectural weaknesses]

**Recommendations**:

- [High-level architectural improvements]

### Extensibility Assessment

**Current Extensibility**: [Low/Medium/High]

**Analysis**:

- [How easy is it to add new features?]
- [Are there proper extension points?]
- [Is the system open for extension, closed for modification?]

**Improvement Opportunities**:

- [Specific recommendations for better extensibility]

---

## Design Pattern Analysis

### Patterns Found

| Pattern    | Location       | Quality   | Notes                   |
|------------|----------------|-----------|-------------------------|
| Builder    | user.py:45     | Good      | Proper fluent interface |
| Factory    | service.py:120 | Poor      | Missing abstraction     |
| Repository | data.py:30     | Excellent | Clean separation        |

### Pattern Opportunities

- **[Pattern Name]** in `file.py:line`: [Why this pattern would help]

### Anti-Patterns Detected

- **[Anti-Pattern Name]** in `file.py:line`: [Description and remediation]

---

## Positive Highlights ✨

[Call out well-designed code, excellent examples of patterns, good practices]

---

## Actionable Recommendations

### Immediate Actions (Critical)

1. **[Action Item]** - `file.py:line`
   - Impact: [High/Medium/Low]
   - Effort: [Hours/Days]
   - Priority: Critical

### Short-Term Improvements (High Priority)

[Similar structure]

### Long-Term Refactoring (Medium/Low Priority)

[Similar structure]

---

## Conclusion

[Summary of overall code health, main themes in issues, and recommended next steps]

**Recommended Next Steps**:

1. [First step]
2. [Second step]
3. [Third step]

```

### Phase 5: Interactive Follow-Up (Optional)

After presenting the report, offer:

1. **Detailed Explanations**: "Would you like me to elaborate on any specific finding?"
2. **Code Examples**: "Should I provide complete refactored examples for critical issues?"
3. **Prioritization Help**: "Would you like help prioritizing which issues to tackle first?"
4. **Refactoring Plan**: "Should I create a detailed refactoring plan with step-by-step instructions?"

---

## Quality Standards Reference

### Python Best Practices

**Type Safety**:
- Use type hints for all function signatures
- Leverage `typing` module: `List`, `Dict`, `Optional`, `Union`, `Protocol`
- Use `mypy` for static type checking

**Async Patterns**:
- Use `async`/`await` for I/O-bound operations
- Avoid blocking calls in async functions
- Proper exception handling in async contexts

**Error Handling**:
- Custom exception hierarchies
- Specific exception types over generic `Exception`
- Context managers for resource management

**Code Organization**:
- Follow PEP 8 style guide
- Use dataclasses or Pydantic models for data structures
- Dependency injection over global state

### TypeScript Best Practices

**Type Safety**:
- Strict mode enabled (`strict: true` in tsconfig.json)
- Avoid `any`; use `unknown` if type is truly unknown
- Use generics for reusable components
- Discriminated unions for state management

**Code Organization**:
- Barrel exports for clean module interfaces
- Dependency injection (constructor injection preferred)
- Immutability: `readonly`, `Readonly<T>`, `ReadonlyArray<T>`

**Async Patterns**:
- Proper Promise chaining or async/await
- Error handling with try/catch or `.catch()`
- Avoid Promise constructor anti-pattern

### Function Design Principles

**Hard Limits**:
- ≤150 lines per function (break down larger functions)
- ≤7 parameters (use objects/builders for more)
- ≤3 levels of nesting
- ≤10 cyclomatic complexity

**Best Practices**:
- Single responsibility per function
- Pure functions when possible (no side effects)
- Guard clauses to reduce nesting
- Early returns for validation

### Builder Pattern Checklist

- [ ] Separate builder class from product class
- [ ] Fluent interface (method chaining)
- [ ] Validation in `build()` method
- [ ] Type-safe (especially in TypeScript)
- [ ] Clear, descriptive method names (`withX`, `setX`, `addX`)
- [ ] Immutable product after building (recommended)
- [ ] Builder reusability considered

---

## Usage Examples

**Review a single file**:
```

/deep-code-review src/api/user_service.py

```

**Review multiple files**:
```

/deep-code-review src/api/user.py src/models/user.ts

```

**Review entire directory**:
```

/deep-code-review src/services/

```

**Review with glob pattern**:
```

/deep-code-review src/**/*.py

```

**Review mixed Python and TypeScript**:
```

/deep-code-review backend/ frontend/src/

```

---

## Important Notes

- **Non-Destructive**: This command only analyzes code; it does not modify files
- **Language-Specific**: Analysis adapts based on detected language
- **Context-Aware**: Recommendations consider project architecture and frameworks in use
- **Actionable**: Every issue includes clear remediation steps
- **Educational**: Explanations help developers understand *why* changes matter
- **Objective**: Focus on measurable improvements, not subjective style preferences

---

## Limitations

- Does not run static analysis tools (suggest running `mypy`, `pylint`, `eslint`, `tsc` separately)
- Does not execute code or run tests
- Cannot detect runtime performance issues (only potential bottlenecks)
- Cannot validate business logic correctness (only design quality)
