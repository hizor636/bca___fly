import { Router, Request, Response } from 'express';
import { dbManager } from '../../database/database.js';
import { seedDatabase, wipeDatabase } from '../../database/seeder.js';

export const dbStudioRouter = Router();

// 1. Database Stats & Health
dbStudioRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await dbManager.getStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Full Schema Introspection
dbStudioRouter.get('/schema', async (req: Request, res: Response) => {
  try {
    const tables = await dbManager.getAllTablesInfo();
    res.json({ success: true, data: { tables } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Raw SQL Query Console
dbStudioRouter.post('/query', async (req: Request, res: Response) => {
  const { sql, params } = req.body;
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid SQL string is required in body.sql' });
  }

  const trimmed = sql.trim();
  try {
    // If it's a SELECT, PRAGMA, EXPLAIN, or WITH query, execute as query returning rows
    const isSelectLike = /^(SELECT|PRAGMA|EXPLAIN|WITH)\b/i.test(trimmed);

    if (isSelectLike) {
      const result = await dbManager.query(trimmed, params || []);
      res.json({
        success: true,
        type: 'SELECT',
        columns: result.columns,
        rows: result.rows,
        rowCount: result.rowCount,
        executionTimeMs: result.executionTimeMs
      });
    } else {
      // Multiple statements or DDL / DML
      if (trimmed.includes(';')) {
        const start = performance.now();
        await dbManager.exec(trimmed);
        const executionTimeMs = Number((performance.now() - start).toFixed(2));
        res.json({
          success: true,
          type: 'EXEC_MULTI',
          message: 'Statements executed successfully',
          executionTimeMs
        });
      } else {
        const result = await dbManager.run(trimmed, params || []);
        res.json({
          success: true,
          type: 'RUN',
          changes: result.changes,
          executionTimeMs: result.executionTimeMs,
          message: 'Query executed successfully'
        });
      }
    }
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// 4. Generic Table Explorer Data with pagination & search
dbStudioRouter.get('/tables/:table', async (req: Request, res: Response) => {
  const table = String(req.params.table);
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
  const search = (req.query.search as string) || '';
  const sortBy = (req.query.sortBy as string) || '';
  const sortDir = (req.query.sortDir as string)?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const validTables = await dbManager.getTableNames();
  if (!validTables.includes(table)) {
    return res.status(404).json({ success: false, error: `Table "${table}" does not exist in database` });
  }

  try {
    const tableInfo = await dbManager.getTableInfo(table);
    let whereClause = '';
    const queryParams: any[] = [];

    if (search.trim()) {
      const textCols = tableInfo.columns.filter(c => c.type.toUpperCase().includes('CHAR') || c.type.toUpperCase().includes('TEXT') || c.type === '');
      if (textCols.length > 0) {
        const clauses = textCols.map(c => `"${c.name}" LIKE ?`);
        whereClause = `WHERE ${clauses.join(' OR ')}`;
        textCols.forEach(() => queryParams.push(`%${search.trim()}%`));
      }
    }

    const countSql = `SELECT COUNT(*) as count FROM "${table}" ${whereClause}`;
    const totalFiltered = (await dbManager.query(countSql, queryParams)).rows[0]?.count || 0;

    let orderClause = '';
    if (sortBy && tableInfo.columns.some(c => c.name === sortBy)) {
      orderClause = `ORDER BY "${sortBy}" ${sortDir}`;
    } else if (tableInfo.primaryKeys.length > 0) {
      orderClause = `ORDER BY "${tableInfo.primaryKeys[0]}" ${sortDir}`;
    }

    const offset = (page - 1) * limit;
    const dataSql = `SELECT * FROM "${table}" ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    const dataRes = await dbManager.query(dataSql, [...queryParams, limit, offset]);

    res.json({
      success: true,
      data: {
        table,
        tableInfo,
        rows: dataRes.rows,
        columns: tableInfo.columns,
        pagination: {
          page,
          limit,
          total: totalFiltered,
          totalPages: Math.ceil(totalFiltered / limit)
        },
        executionTimeMs: dataRes.executionTimeMs
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Insert Record into Table
dbStudioRouter.post('/tables/:table', async (req: Request, res: Response) => {
  const table = String(req.params.table);
  const record = req.body;

  const validTables = await dbManager.getTableNames();
  if (!validTables.includes(table)) {
    return res.status(404).json({ success: false, error: `Table "${table}" not found` });
  }

  try {
    const keys = Object.keys(record);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: 'No field values provided' });
    }

    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`;
    const values = keys.map(k => {
      const v = record[k];
      return (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v;
    });

    const result = await dbManager.run(sql, values);
    res.json({ success: true, message: `Record inserted into ${table}`, changes: result.changes });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 6. Update Record in Table by ID
dbStudioRouter.put('/tables/:table/:id', async (req: Request, res: Response) => {
  const table = String(req.params.table);
  const id = String(req.params.id);
  const updates = req.body;

  const validTables = await dbManager.getTableNames();
  if (!validTables.includes(table)) {
    return res.status(404).json({ success: false, error: `Table "${table}" not found` });
  }

  try {
    const tableInfo = await dbManager.getTableInfo(table);
    const pk = tableInfo.primaryKeys[0] || 'id';

    const keys = Object.keys(updates).filter(k => k !== pk);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    const setClauses = keys.map(k => `"${k}" = ?`).join(', ');
    const sql = `UPDATE "${table}" SET ${setClauses} WHERE "${pk}" = ?`;
    const values = keys.map(k => {
      const v = updates[k];
      return (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v;
    });
    values.push(id);

    const result = await dbManager.run(sql, values);
    res.json({ success: true, message: `Record updated in ${table}`, changes: result.changes });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 7. Delete Record from Table
dbStudioRouter.delete('/tables/:table/:id', async (req: Request, res: Response) => {
  const table = String(req.params.table);
  const id = String(req.params.id);
  const validTables = await dbManager.getTableNames();
  if (!validTables.includes(table)) {
    return res.status(404).json({ success: false, error: `Table "${table}" not found` });
  }

  try {
    const tableInfo = await dbManager.getTableInfo(table);
    const pk = tableInfo.primaryKeys[0] || 'id';
    const sql = `DELETE FROM "${table}" WHERE "${pk}" = ?`;
    const result = await dbManager.run(sql, [id]);
    res.json({ success: true, message: `Record deleted from ${table}`, changes: result.changes });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 8. Export Database (JSON or SQL Dump)
dbStudioRouter.get('/export', async (req: Request, res: Response) => {
  const format = (req.query.format as string) || 'json';
  try {
    if (format === 'sql') {
      const sqlDump = await dbManager.exportDatabaseAsSql();
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', 'attachment; filename="bcafly_backup.sql"');
      return res.send(sqlDump);
    } else {
      const jsonData = await dbManager.exportDatabaseAsJson();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="bcafly_backup.json"');
      return res.json({
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        tables: jsonData
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Import / Restore Database
dbStudioRouter.post('/import', async (req: Request, res: Response) => {
  const { format, data, sql } = req.body;
  try {
    if (format === 'sql' && sql) {
      await dbManager.importDatabaseFromSql(sql);
      res.json({ success: true, message: 'Database restored successfully from SQL dump' });
    } else if (data && data.tables) {
      await dbManager.importDatabaseFromJson(data.tables);
      res.json({ success: true, message: 'Database restored successfully from JSON backup' });
    } else {
      res.status(400).json({ success: false, error: 'Invalid import payload. Expected { format: "sql", sql } or { data: { tables } }' });
    }
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 10. Nuclear Clean Database (Empty all tables)
dbStudioRouter.post('/clean', async (req: Request, res: Response) => {
  try {
    const result = await wipeDatabase();
    res.json({
      success: true,
      message: `Database wiped completely clean (${result.clearedTables.length} tables truncated)`,
      clearedTables: result.clearedTables,
      executionTimeMs: result.executionTimeMs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Reset / Clean Database
dbStudioRouter.post('/reset', async (req: Request, res: Response) => {
  const { mode } = req.body || {};
  try {
    if (mode === 'seed') {
      await seedDatabase(true);
      res.json({ success: true, message: 'Database re-seeded successfully with demo state' });
    } else {
      const result = await wipeDatabase();
      res.json({
        success: true,
        message: `Database cleaned to pristine empty state (${result.clearedTables.length} tables truncated)`,
        clearedTables: result.clearedTables
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
