# Implementation Tasks: MySQL Database Support

## Overview

Add MySQL database support to the existing db_query backend application, enabling metadata extraction, query execution, and natural language to SQL generation for MySQL databases, parallel to the existing PostgreSQL implementation.

**Reference Implementation**: `w2/db_query/backend` (PostgreSQL)
**Test Database**: `todo_db` (MySQL, accessible via `mysql -u root todo_db`)

---

## Dependencies

```mermaid
graph TD
    Setup[Phase 1: Setup]
    Foundation[Phase 2: Foundation - Database Type Detection]
    US1[Phase 3: US1 - MySQL Connection Management]
    US2[Phase 4: US2 - MySQL Metadata Extraction]
    US3[Phase 5: US3 - MySQL Query Execution]
    US4[Phase 6: US4 - NL2SQL for MySQL]
    Polish[Phase 7: Polish & Integration]

    Setup --> Foundation
    Foundation --> US1
    Foundation --> US2
    US1 --> US3
    US2 --> US3
    US2 --> US4
    US3 --> Polish
    US4 --> Polish
```

**Story Dependencies**:
- US1 (Connection) can start after Foundation
- US2 (Metadata) can start after Foundation
- US3 (Query) requires US1 + US2
- US4 (NL2SQL) requires US2
- Polish requires US3 + US4

---

## Implementation Strategy

### MVP Scope (User Story 1)
Complete Phase 1, 2, and 3 (US1) to establish MySQL connection capability. This provides the foundational layer for all other features.

### Incremental Delivery
1. **Phase 1-2**: Setup infrastructure and database type detection
2. **Phase 3 (US1)**: MySQL connection management - enables testing connectivity
3. **Phase 4 (US2)**: Metadata extraction - enables schema discovery
4. **Phase 5 (US3)**: Query execution - enables running SQL queries
5. **Phase 6 (US4)**: NL2SQL support - enables natural language queries
6. **Phase 7**: Polish and integration testing

Each phase delivers independently testable functionality.

---

## Phase 1: Setup

**Goal**: Add MySQL client library and update dependencies

**Independent Test**: Successfully install dependencies with MySQL driver

### Tasks

- [X] T001 Add aiomysql dependency to pyproject.toml dependencies list
- [X] T002 Add mysqlclient or PyMySQL to pyproject.toml for MySQL metadata queries
- [X] T003 Run `uv pip install -e .` to install new dependencies and verify installation

---

## Phase 2: Foundation - Database Type Detection

**Goal**: Add database type enum and detection logic to distinguish PostgreSQL from MySQL

**Independent Test**: Create DatabaseConnection with db_type field, verify storage in SQLite

### Tasks

- [X] T004 Add DatabaseType enum (POSTGRESQL, MYSQL) to app/models/database.py
- [X] T005 Add db_type field to DatabaseConnection model in app/models/database.py
- [X] T006 Create database URL parser utility in app/utils/db_parser.py to detect database type from connection URL
- [X] T007 Update database connection API in app/api/v1/databases.py to accept and validate db_type parameter

---

## Phase 3: User Story 1 - MySQL Connection Management

**User Story**: As a developer, I want to establish and test MySQL database connections, so that I can verify connectivity before performing operations.

**Priority**: P1

**Independent Test**:
1. Create MySQL connection via API with `todo_db` credentials
2. Test connection returns success
3. Verify connection stored in SQLite with db_type='mysql'
4. List connections shows MySQL connection

### Tasks

- [X] T008 [P] [US1] Create MySQLConnectionService class in app/services/mysql_connection.py with test_connection method
- [X] T009 [P] [US1] Implement get_connection_pool for aiomysql in app/services/mysql_connection.py
- [X] T010 [P] [US1] Implement close_connection_pool for MySQL in app/services/mysql_connection.py
- [X] T011 [US1] Create connection factory in app/services/connection_factory.py that routes to PostgreSQL or MySQL service based on db_type
- [X] T012 [US1] Update app/api/v1/databases.py POST /databases endpoint to use connection factory
- [X] T013 [US1] Update app/api/v1/databases.py GET /databases/:name/test endpoint to use connection factory

---

## Phase 4: User Story 2 - MySQL Metadata Extraction

**User Story**: As a developer, I want to extract table and column metadata from MySQL databases, so that I can understand the database schema for query generation.

**Priority**: P2

**Independent Test**:
1. Connect to `todo_db` MySQL database
2. Call metadata extraction API
3. Verify response contains tables array with `todos` table
4. Verify `todos` table has correct columns (id, title, completed, created_at, etc.)
5. Verify metadata cached in SQLite

### Tasks

- [X] T014 [P] [US2] Create MySQLMetadataService class in app/services/mysql_metadata.py
- [X] T015 [P] [US2] Implement extract_metadata method to query INFORMATION_SCHEMA for tables in app/services/mysql_metadata.py
- [X] T016 [P] [US2] Implement extract_metadata to query INFORMATION_SCHEMA for columns with data types in app/services/mysql_metadata.py
- [X] T017 [P] [US2] Implement extract_metadata to detect primary keys from INFORMATION_SCHEMA.KEY_COLUMN_USAGE in app/services/mysql_metadata.py
- [X] T018 [P] [US2] Implement extract_metadata to detect unique constraints from INFORMATION_SCHEMA in app/services/mysql_metadata.py
- [X] T019 [P] [US2] Implement row count extraction for MySQL tables in app/services/mysql_metadata.py
- [X] T020 [US2] Update metadata factory in app/services/metadata.py to route to MySQL or PostgreSQL metadata service
- [X] T021 [US2] Update app/api/v1/databases.py GET /databases/:name/metadata endpoint to use metadata factory
- [X] T022 [US2] Ensure metadata caching in app/services/metadata.py works for MySQL metadata

---

## Phase 5: User Story 3 - MySQL Query Execution

**User Story**: As a developer, I want to execute SQL queries against MySQL databases, so that I can retrieve data using standard SQL.

**Priority**: P2

**Independent Test**:
1. Connect to `todo_db`
2. Submit query: `SELECT * FROM todos LIMIT 10`
3. Verify query executes successfully
4. Verify results contain correct columns and data
5. Verify query saved to history with db_type

### Tasks

- [X] T023 [P] [US3] Create MySQLQueryService in app/services/mysql_query.py with execute_query method
- [X] T024 [P] [US3] Implement row fetching and result parsing for aiomysql in app/services/mysql_query.py
- [X] T025 [P] [US3] Implement column metadata extraction from MySQL result sets in app/services/mysql_query.py
- [X] T026 [US3] Update SQL validator in app/services/sql_validator.py to support MySQL syntax (if needed)
- [X] T027 [US3] Create query execution factory in app/services/query.py to route to MySQL or PostgreSQL query service
- [X] T028 [US3] Update app/api/v1/queries.py POST /queries/execute endpoint to use query factory
- [X] T029 [US3] Verify query history in app/services/query.py correctly saves MySQL queries

---

## Phase 6: User Story 4 - Natural Language to SQL for MySQL

**User Story**: As a user, I want to convert natural language questions to MySQL SQL queries, so that I can query databases without knowing SQL syntax.

**Priority**: P2

**Independent Test**:
1. Load metadata for `todo_db`
2. Submit natural language query: "查询所有未完成的待办事项" (Query all incomplete todos)
3. Verify generated SQL uses MySQL syntax
4. Verify SQL includes LIMIT clause
5. Execute generated SQL and verify results

### Tasks

- [X] T030 [P] [US4] Update NaturalLanguageToSQLService._build_prompt in app/services/nl2sql.py to accept db_type parameter
- [X] T031 [P] [US4] Update system prompt in app/services/nl2sql.py to generate MySQL syntax when db_type is MYSQL
- [X] T032 [P] [US4] Update system prompt to handle MySQL-specific features (backticks, LIMIT syntax, AUTO_INCREMENT, etc.)
- [X] T033 [US4] Update generate_sql method in app/services/nl2sql.py to pass db_type from database connection
- [X] T034 [US4] Update app/api/v1/queries.py POST /queries/nl2sql endpoint to fetch db_type and pass to NL2SQL service
- [X] T035 [US4] Test NL2SQL with Chinese and English prompts for MySQL database

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Complete integration, testing, error handling, and documentation

**Independent Test**: Full end-to-end test with MySQL database
1. Create connection
2. Extract metadata
3. Execute manual query
4. Execute NL2SQL query
5. View history
6. All operations succeed

### Tasks

- [X] T036 [P] Add MySQL-specific error handling and error messages across all services
- [X] T037 [P] Update API documentation/OpenAPI schema to indicate MySQL support
- [ ] T038 Add integration tests in tests/integration/test_mysql_integration.py for complete MySQL workflow
- [X] T039 Update README or documentation with MySQL connection string format and examples
- [X] T040 Test connection pool lifecycle (create, reuse, close) for MySQL connections
- [X] T041 Test metadata cache refresh for MySQL databases
- [X] T042 Verify query history shows correct db_type for MySQL queries
- [X] T043 Add error handling for MySQL-specific errors (connection timeout, authentication, etc.)
- [ ] T044 Test with various MySQL versions if possible (MySQL 5.7, 8.0+)
- [ ] T045 Performance test with large result sets from MySQL

---

## Parallel Execution Opportunities

### Phase 1 (Setup)
All tasks are sequential (dependency installation)

### Phase 2 (Foundation)
- T004-T005 can run in parallel (enum and model field)
- T006-T007 depend on T004-T005

### Phase 3 (US1 - Connection)
- T008, T009, T010 are parallelizable (different methods in same file)
- T011-T013 depend on T008-T010

### Phase 4 (US2 - Metadata)
- T014-T019 are parallelizable (different methods/features in MySQLMetadataService)
- T020-T022 depend on T014-T019

### Phase 5 (US3 - Query)
- T023-T025 are parallelizable (different methods in MySQLQueryService)
- T026 is independent and parallelizable
- T027-T029 depend on T023-T026

### Phase 6 (US4 - NL2SQL)
- T030-T032 are parallelizable (different parts of prompt building)
- T033-T035 depend on T030-T032

### Phase 7 (Polish)
- T036, T037, T038, T039 can all run in parallel initially
- T040-T045 can run in parallel after T036-T039

---

## Task Summary

**Total Tasks**: 45
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundation): 4 tasks
- Phase 3 (US1 - Connection): 6 tasks
- Phase 4 (US2 - Metadata): 9 tasks
- Phase 5 (US3 - Query): 7 tasks
- Phase 6 (US4 - NL2SQL): 6 tasks
- Phase 7 (Polish): 10 tasks

**Parallelizable Tasks**: 25 tasks marked with [P]

**Story Task Distribution**:
- US1 (Connection Management): 6 tasks
- US2 (Metadata Extraction): 9 tasks
- US3 (Query Execution): 7 tasks
- US4 (NL2SQL for MySQL): 6 tasks

---

## Notes

### Technical Considerations

1. **MySQL Driver**: Using `aiomysql` for async connection pooling (similar to asyncpg for PostgreSQL)
2. **Metadata Queries**: MySQL uses `INFORMATION_SCHEMA` similar to PostgreSQL but with different column names
3. **SQL Syntax Differences**:
   - MySQL uses backticks for identifiers vs PostgreSQL double quotes
   - MySQL uses `AUTO_INCREMENT` vs PostgreSQL `SERIAL`
   - Different data types (VARCHAR vs character varying)
4. **Connection URL Format**: `mysql://user:password@host:port/database` vs PostgreSQL format

### Testing Strategy

- Unit tests for each service (connection, metadata, query, nl2sql)
- Integration tests with actual `todo_db` MySQL database
- Test both English and Chinese natural language queries
- Test error scenarios (connection failure, invalid SQL, etc.)

### Migration Path

No data migration needed. This is a pure feature addition to support an additional database type. Existing PostgreSQL functionality remains unchanged.
