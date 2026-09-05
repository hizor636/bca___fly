import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SCHEMA_SQL } from './schema.js';

// Resolve directory paths in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'bcafly.sqlite');

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

class DatabaseManager {
  private db: SqlJsDatabase | null = null;
  private SQL: any = null;
  private initialized = false;
  private saveTimeout: NodeJS.Timeout | null = null;

  public async init(): Promise<void> {
    if (this.initialized && this.db) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    this.SQL = await initSqlJs();

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileBuffer = fs.readFileSync(DB_FILE);
        this.db = new this.SQL.Database(fileBuffer);
        console.log(`[Database] Loaded existing database from ${DB_FILE}`);
      } catch (err) {
        console.error('[Database] Corrupt database file, creating fresh instance:', err);
        this.db = new this.SQL.Database();
      }
    } else {
      console.log(`[Database] Initializing fresh database at ${DB_FILE}`);
      this.db = new this.SQL.Database();
    }

    // Apply schema
    if (this.db) {
      this.db.exec(SCHEMA_SQL);
    }
    this.persist();
    this.initialized = true;
  }

  public getRawDb(): SqlJsDatabase {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');
    return this.db;
  }

  public persist(): void {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE, buffer);
    } catch (err) {
      console.error('[Database] Failed to write database to disk:', err);
    }
  }

  public schedulePersist(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persist();
    }, 200);
  }

  private sanitizeParams(params: any[]): any[] {
    return params.map(p => (p === undefined ? null : p));
  }

  public query(sql: string, params: any[] = []): QueryResult {
    if (!this.db) throw new Error('Database not initialized.');

    const start = performance.now();
    try {
      const sanitized = this.sanitizeParams(params);
      const stmt = this.db.prepare(sql);
      if (sanitized.length > 0) {
        stmt.bind(sanitized);
      }

      const rows: Record<string, any>[] = [];
      const columns = stmt.getColumnNames();

      while (stmt.step()) {
        const row = stmt.getAsObject();
        rows.push(row);
      }
      stmt.free();

      const executionTimeMs = Number((performance.now() - start).toFixed(2));
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

  public run(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number; executionTimeMs: number } {
    if (!this.db) throw new Error('Database not initialized.');

    const start = performance.now();
    try {
      const sanitized = this.sanitizeParams(params);
      this.db.run(sql, sanitized);
      const executionTimeMs = Number((performance.now() - start).toFixed(2));
      this.schedulePersist();

      return {
        changes: 1,
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

  public exec(sql: string): { executionTimeMs: number } {
    if (!this.db) throw new Error('Database not initialized.');
    const start = performance.now();
    this.db.exec(sql);
    const executionTimeMs = Number((performance.now() - start).toFixed(2));
    this.schedulePersist();
    return { executionTimeMs };
  }

  public getTableNames(): string[] {
    const res = this.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name ASC");
    return res.rows.map(r => r.name);
  }

  public getTableInfo(tableName: string): TableInfo {
    const colsRes = this.query(`PRAGMA table_info("${tableName}")`);
    const countRes = this.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
    const fkRes = this.query(`PRAGMA foreign_key_list("${tableName}")`);

    const columns: ColumnInfo[] = colsRes.rows.map(r => ({
      cid: r.cid,
      name: r.name,
      type: r.type,
      notnull: r.notnull,
      dflt_value: r.dflt_value,
      pk: r.pk
    }));

    const primaryKeys = columns.filter(c => c.pk > 0).map(c => c.name);

    return {
      name: tableName,
      rowCount: countRes.rows[0]?.count || 0,
      columns,
      primaryKeys,
      foreignKeys: fkRes.rows as any[]
    };
  }

  public getAllTablesInfo(): TableInfo[] {
    const tableNames = this.getTableNames();
    return tableNames.map(name => this.getTableInfo(name));
  }

  public getStats(): {
    databaseSizeKb: number;
    tableCount: number;
    totalRows: number;
    dbFilePath: string;
    engine: string;
    tables: { name: string; rows: number }[];
  } {
    const tables = this.getAllTablesInfo();
    let totalRows = 0;
    tables.forEach(t => { totalRows += t.rowCount; });

    let databaseSizeKb = 0;
    if (fs.existsSync(DB_FILE)) {
      const stats = fs.statSync(DB_FILE);
      databaseSizeKb = Number((stats.size / 1024).toFixed(2));
    }

    return {
      databaseSizeKb,
      tableCount: tables.length,
      totalRows,
      dbFilePath: DB_FILE,
      engine: 'SQLite 3 (via sql.js WASM + File Persistence)',
      tables: tables.map(t => ({ name: t.name, rows: t.rowCount }))
    };
  }

  public exportDatabaseAsJson(): Record<string, any[]> {
    const tables = this.getTableNames();
    const result: Record<string, any[]> = {};
    for (const table of tables) {
      const res = this.query(`SELECT * FROM "${table}"`);
      result[table] = res.rows;
    }
    return result;
  }

  public exportDatabaseAsSql(): string {
    const tables = this.getTableNames();
    let sqlDump = `-- BCAFly Database SQL Dump\n-- Generated on: ${new Date().toISOString()}\n\n`;
    sqlDump += SCHEMA_SQL + '\n\n';

    for (const table of tables) {
      const res = this.query(`SELECT * FROM "${table}"`);
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

  public importDatabaseFromJson(data: Record<string, any[]>): void {
    if (!this.db) throw new Error('Database not initialized.');

    this.db.exec('PRAGMA foreign_keys = OFF;');
    const tables = Object.keys(data);

    for (const table of tables) {
      if (!this.getTableNames().includes(table)) continue;
      this.db.run(`DELETE FROM "${table}"`);
      const rows = data[table];
      if (!Array.isArray(rows) || rows.length === 0) continue;

      for (const row of rows) {
        const keys = Object.keys(row);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`;
        const values = keys.map(k => {
          const val = row[k];
          return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
        });
        this.db.run(sql, values);
      }
    }

    this.db.exec('PRAGMA foreign_keys = ON;');
    this.persist();
  }

  public importDatabaseFromSql(sql: string): void {
    if (!this.db) throw new Error('Database not initialized.');
    this.db.exec(sql);
    this.persist();
  }
}

export const dbManager = new DatabaseManager();
