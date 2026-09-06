import pg from 'pg';
import { SCHEMA_SQL } from './schema.js';

// PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://bcafly_admin@localhost:5434/bcafly',
});

export interface QueryResult {
  columns: string[];
  values: any[][];
  rows: Record<string, any>[];
  rowCount: number;
  executionTimeMs: number;
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface TableInfo {
  name: string;
  rowCount: number;
  columns: ColumnInfo[];
  primaryKeys: string[];
  foreignKeys: {
    id: number;
    seq: number;
    table: string;
    from: string;
    to: string;
    on_update: string;
    on_delete: string;
  }[];
}

/**
 * Convert SQLite-style `?` placeholders to PostgreSQL `$1, $2, ...` placeholders.
 * Handles quoted strings and double-quoted identifiers to avoid replacing `?` inside them.
 */
function convertPlaceholders(sql: string): string {
  let idx = 0;
  let result = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const prev = i > 0 ? sql[i - 1] : '';

    if (ch === "'" && !inDoubleQuote && prev !== '\\') {
      inSingleQuote = !inSingleQuote;
      result += ch;
    } else if (ch === '"' && !inSingleQuote && prev !== '\\') {
      inDoubleQuote = !inDoubleQuote;
      result += ch;
    } else if (ch === '?' && !inSingleQuote && !inDoubleQuote) {
      idx++;
      result += `$${idx}`;
    } else {
      result += ch;
    }
  }

  return result;
}

/**
 * Convert SQLite-specific SQL syntax to PostgreSQL equivalents.
 */
function convertSqlDialect(sql: string): string {
  let converted = sql;

  // INSERT OR IGNORE → INSERT ... ON CONFLICT DO NOTHING
  converted = converted.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
  // We'll append ON CONFLICT DO NOTHING for these

  // INSERT OR REPLACE → INSERT ... ON CONFLICT ... DO UPDATE (simplified to upsert via DELETE+INSERT)
  // For simplicity, convert to INSERT with ON CONFLICT DO NOTHING when it's an IGNORE
  // For REPLACE, we'll handle it differently

  return converted;
}

/**
 * Sanitize params: convert undefined → null, booleans to integers for compat
 */
function sanitizeParams(params: any[]): any[] {
  return params.map(p => {
    if (p === undefined) return null;
    return p;
  });
}

class DatabaseManager {
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Test connection
      const client = await pool.connect();
      console.log('[Database] Connected to PostgreSQL');

      // Apply schema
      await client.query(SCHEMA_SQL);
      console.log('[Database] Schema applied successfully');
      client.release();

      this.initialized = true;
    } catch (err) {
      console.error('[Database] Failed to initialize:', err);
      throw err;
    }
  }

  /**
   * Execute a SELECT-like query, returning rows.
   */
  public async query(sql: string, params: any[] = []): Promise<QueryResult> {
    const start = performance.now();
    try {
      const sanitized = sanitizeParams(params);
      const pgSql = convertPlaceholders(sql);
      const result = await pool.query(pgSql, sanitized);
      const executionTimeMs = Number((performance.now() - start).toFixed(2));

      const columns = result.fields.map(f => f.name);
      const rows = result.rows;
      const values = rows.map(r => columns.map(col => r[col]));

      return {
        columns,
        values,
        rows,
        rowCount: rows.length,
        executionTimeMs
      };
    } catch (err: any) {
      const executionTimeMs = Number((performance.now() - start).toFixed(2));
      const msg = err?.message || String(err);
      console.error(`[Database Query Error] ${msg} in SQL: ${sql}`);
      throw new Error(`SQL Error: ${msg} (${executionTimeMs}ms)`);
    }
  }

  /**
   * Execute a DML statement (INSERT, UPDATE, DELETE).
   */
  public async run(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid: number; executionTimeMs: number }> {
    const start = performance.now();
    try {
      const sanitized = sanitizeParams(params);
      let pgSql = convertPlaceholders(sql);

      // Handle INSERT OR IGNORE
      if (/INSERT\s+OR\s+IGNORE/i.test(sql)) {
        pgSql = pgSql.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
        // Append ON CONFLICT DO NOTHING if not already present
        if (!/ON\s+CONFLICT/i.test(pgSql)) {
          pgSql = pgSql.replace(/\)\s*$/, ') ON CONFLICT DO NOTHING');
          // Handle case where VALUES(...) is the last thing
          if (!/ON\s+CONFLICT/i.test(pgSql)) {
            pgSql += ' ON CONFLICT DO NOTHING';
          }
        }
      }

      // Handle INSERT OR REPLACE — convert to upsert
      if (/INSERT\s+OR\s+REPLACE/i.test(sql)) {
        pgSql = pgSql.replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, 'INSERT INTO');
        // For OR REPLACE, we need to determine the primary key
        // Simple approach: use ON CONFLICT (id) DO UPDATE for tables with 'id' PK
        const tableMatch = pgSql.match(/INSERT\s+INTO\s+"?(\w+)"?\s*\(/i);
        if (tableMatch) {
          const cols = pgSql.match(/\(([^)]+)\)\s*VALUES/i);
          if (cols) {
            const colList = cols[1].split(',').map(c => c.trim().replace(/"/g, ''));
            const setClauses = colList.filter(c => c !== 'id').map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');
            if (setClauses) {
              pgSql += ` ON CONFLICT (id) DO UPDATE SET ${setClauses}`;
            } else {
              pgSql += ' ON CONFLICT DO NOTHING';
            }
          }
        }
      }

      const result = await pool.query(pgSql, sanitized);
      const executionTimeMs = Number((performance.now() - start).toFixed(2));

      return {
        changes: result.rowCount || 0,
        lastInsertRowid: 0,
        executionTimeMs
      };
    } catch (err: any) {
      const executionTimeMs = Number((performance.now() - start).toFixed(2));
      const msg = err?.message || String(err);
      console.error(`[Database Run Error] ${msg} in SQL: ${sql}`);
      throw new Error(`SQL Execution Error: ${msg}`);
    }
  }

  /**
   * Execute raw SQL (potentially multiple statements).
   */
  public async exec(sql: string): Promise<{ executionTimeMs: number }> {
    const start = performance.now();
    try {
      let pgSql = sql;
      // Handle INSERT OR IGNORE in exec
      pgSql = pgSql.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
      // Handle INSERT OR REPLACE in exec
      pgSql = pgSql.replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, 'INSERT INTO');

      await pool.query(pgSql);
      const executionTimeMs = Number((performance.now() - start).toFixed(2));
      return { executionTimeMs };
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error(`[Database Exec Error] ${msg}`);
      throw new Error(`SQL Execution Error: ${msg}`);
    }
  }

  /**
   * No-op for PostgreSQL — auto-committed.
   */
  public persist(): void {
    // PostgreSQL auto-commits, no manual persist needed
  }

  /**
   * No-op for PostgreSQL.
   */
  public schedulePersist(): void {
    // No-op
  }

  /**
   * Get all table names from the public schema.
   */
  public async getTableNames(): Promise<string[]> {
    const result = await pool.query(
      `SELECT table_name AS name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name ASC`
    );
    return result.rows.map(r => r.name);
  }

  /**
   * Get detailed info about a specific table.
   */
  public async getTableInfo(tableName: string): Promise<TableInfo> {
    // Column info
    const colResult = await pool.query(
      `SELECT ordinal_position AS cid, column_name AS name, data_type AS type,
              CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END AS notnull,
              column_default AS dflt_value,
              0 AS pk
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
      [tableName]
    );

    // Primary key info
    const pkResult = await pool.query(
      `SELECT kcu.column_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'`,
      [tableName]
    );
    const pkColumns = new Set(pkResult.rows.map(r => r.column_name));

    const columns: ColumnInfo[] = colResult.rows.map((r, i) => ({
      cid: r.cid,
      name: r.name,
      type: r.type,
      notnull: r.notnull,
      dflt_value: r.dflt_value,
      pk: pkColumns.has(r.name) ? 1 : 0
    }));

    const primaryKeys = columns.filter(c => c.pk > 0).map(c => c.name);

    // Row count
    const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const rowCount = parseInt(countResult.rows[0]?.count || '0', 10);

    // Foreign keys
    const fkResult = await pool.query(
      `SELECT
         0 AS id, 0 AS seq,
         ccu.table_name AS "table",
         kcu.column_name AS "from",
         ccu.column_name AS "to",
         'NO ACTION' AS on_update,
         'NO ACTION' AS on_delete
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
       JOIN information_schema.constraint_column_usage ccu
         ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
       WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY'`,
      [tableName]
    );

    return {
      name: tableName,
      rowCount,
      columns,
      primaryKeys,
      foreignKeys: fkResult.rows as any[]
    };
  }

  /**
   * Get info for all tables.
   */
  public async getAllTablesInfo(): Promise<TableInfo[]> {
    const tableNames = await this.getTableNames();
    const results: TableInfo[] = [];
    for (const name of tableNames) {
      results.push(await this.getTableInfo(name));
    }
    return results;
  }

  /**
   * Get database statistics.
   */
  public async getStats(): Promise<{
    databaseSizeKb: number;
    tableCount: number;
    totalRows: number;
    dbFilePath: string;
    engine: string;
    tables: { name: string; rows: number }[];
  }> {
    const tables = await this.getAllTablesInfo();
    let totalRows = 0;
    tables.forEach(t => { totalRows += t.rowCount; });

    // Get database size
    let databaseSizeKb = 0;
    try {
      const sizeResult = await pool.query(`SELECT pg_database_size(current_database()) as size`);
      databaseSizeKb = Number((parseInt(sizeResult.rows[0]?.size || '0', 10) / 1024).toFixed(2));
    } catch {
      // Ignore if we can't get size
    }

    return {
      databaseSizeKb,
      tableCount: tables.length,
      totalRows,
      dbFilePath: process.env.DATABASE_URL || 'postgresql://bcafly_admin@localhost:5434/bcafly',
      engine: 'PostgreSQL 18',
      tables: tables.map(t => ({ name: t.name, rows: t.rowCount }))
    };
  }

  /**
   * Export entire database as JSON.
   */
  public async exportDatabaseAsJson(): Promise<Record<string, any[]>> {
    const tables = await this.getTableNames();
    const result: Record<string, any[]> = {};
    for (const table of tables) {
      const res = await this.query(`SELECT * FROM "${table}"`);
      result[table] = res.rows;
    }
    return result;
  }

  /**
   * Export database as SQL dump.
   */
  public async exportDatabaseAsSql(): Promise<string> {
    const tables = await this.getTableNames();
    let sqlDump = `-- BCAFly Database SQL Dump\n-- Generated on: ${new Date().toISOString()}\n\n`;
    sqlDump += SCHEMA_SQL + '\n\n';

    for (const table of tables) {
      const res = await this.query(`SELECT * FROM "${table}"`);
      if (res.rows.length === 0) continue;

      sqlDump += `-- Dumping data for table ${table}\n`;
      for (const row of res.rows) {
        const keys = Object.keys(row);
        const values = keys.map(k => {
          const v = row[k];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return v;
          return `'${String(v).replace(/'/g, "''")}'`;
        });
        sqlDump += `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
      }
      sqlDump += '\n';
    }

    return sqlDump;
  }

  /**
   * Import database from JSON.
   */
  public async importDatabaseFromJson(data: Record<string, any[]>): Promise<void> {
    const tables = Object.keys(data);
    const validTables = await this.getTableNames();

    // Disable FK checks
    await pool.query('SET session_replication_role = replica');

    for (const table of tables) {
      if (!validTables.includes(table)) continue;
      await pool.query(`DELETE FROM "${table}"`);
      const rows = data[table];
      if (!Array.isArray(rows) || rows.length === 0) continue;

      for (const row of rows) {
        const keys = Object.keys(row);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`;
        const values = keys.map(k => {
          const val = row[k];
          return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
        });
        await pool.query(sql, values);
      }
    }

    // Re-enable FK checks
    await pool.query('SET session_replication_role = DEFAULT');
  }

  /**
   * Import database from raw SQL.
   */
  public async importDatabaseFromSql(sql: string): Promise<void> {
    let pgSql = sql;
    pgSql = pgSql.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
    pgSql = pgSql.replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, 'INSERT INTO');
    await pool.query(pgSql);
  }

  /**
   * Wipe all data from all tables.
   */
  public async wipeAllTables(): Promise<{ clearedTables: string[]; executionTimeMs: number }> {
    const start = performance.now();

    // Disable FK checks
    await pool.query('SET session_replication_role = replica');

    const tables = await this.getTableNames();
    for (const table of tables) {
      await pool.query(`DELETE FROM "${table}"`);
    }

    // Re-enable FK checks
    await pool.query('SET session_replication_role = DEFAULT');

    const executionTimeMs = Number((performance.now() - start).toFixed(2));
    console.log(`[DatabaseManager] Nuclear clean complete: ${tables.length} tables truncated (${executionTimeMs}ms).`);

    return {
      clearedTables: tables,
      executionTimeMs
    };
  }

  /**
   * Get the raw pool for advanced usage.
   */
  public getPool(): pg.Pool {
    return pool;
  }
}

export const dbManager = new DatabaseManager();
