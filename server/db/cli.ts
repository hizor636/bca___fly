import readline from 'readline';
import { dbManager } from './database.js';
import { cleanDatabase, wipeDatabase } from './seeder.js';

async function main() {
  await dbManager.init();
  cleanDatabase();

  const args = process.argv.slice(2);

  // If query passed via command line argument, e.g. tsx cli.ts "SELECT * FROM users"
  if (args.length > 0) {
    const query = args.join(' ').trim();
    if (query === '.clean' || query === 'clean') {
      const res = wipeDatabase();
      console.log(`✅ Database wiped clean (${res.clearedTables.length} tables truncated).`);
      process.exit(0);
    }
    if (query === '.tables' || query === 'tables') {
      const tables = dbManager.getTableNames();
      console.log('\n📊 Database Tables (' + tables.length + ' total):');
      console.log(tables.map(t => '  • ' + t).join('\n'));
      console.log('');
      process.exit(0);
    }
    if (query === '.stats' || query === 'stats') {
      const stats = dbManager.getStats();
      console.log('\n📈 Database Statistics:');
      console.log(`  • Engine:     ${stats.engine}`);
      console.log(`  • File:       ${stats.dbFilePath}`);
      console.log(`  • File Size:  ${stats.databaseSizeKb} KB`);
      console.log(`  • Tables:     ${stats.tableCount}`);
      console.log(`  • Total Rows: ${stats.totalRows}\n`);
      process.exit(0);
    }
    executeQuery(query);
    process.exit(0);
  }

  // Otherwise launch Interactive SQL Console in Terminal
  console.clear();
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║               BCAFly SQLite Interactive Console                  ║');
  console.log('║       Connected to: server/data/bcafly.sqlite                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');
  console.log('Commands:');
  console.log('  • Type any SQL statement (e.g. SELECT * FROM users LIMIT 5;)');
  console.log('  • .tables        -> List all database tables');
  console.log('  • .schema <table>-> Show columns and structure for a table');
  console.log('  • .stats         -> Show database size, tables, and total rows');
  console.log('  • .clean         -> Nuclear clean / truncate all tables');
  console.log('  • .help          -> Show help');
  console.log('  • .exit or exit  -> Quit the console\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'bcafly-sql> '
  });

  rl.prompt();

  let multilineBuffer = '';

  rl.on('line', (line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      rl.prompt();
      return;
    }

    if (trimmed.toLowerCase() === '.exit' || trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
      console.log('Goodbye!');
      process.exit(0);
    }

    if (trimmed.toLowerCase() === '.clean' || trimmed.toLowerCase() === 'clean') {
      const res = wipeDatabase();
      console.log(`\n✅ Nuclear Clean complete: ${res.clearedTables.length} tables truncated (${res.executionTimeMs}ms).\n`);
      rl.prompt();
      return;
    }

    if (trimmed.toLowerCase() === '.tables') {
      const tables = dbManager.getTableNames();
      console.log('\n📊 Database Tables (' + tables.length + ' total):');
      console.log(tables.map(t => '  • ' + t).join('\n'));
      console.log('');
      rl.prompt();
      return;
    }

    if (trimmed.toLowerCase().startsWith('.schema')) {
      const parts = trimmed.split(/\s+/);
      const tableName = parts[1];
      if (!tableName) {
        console.log('Usage: .schema <table_name>');
      } else {
        try {
          const info = dbManager.getTableInfo(tableName);
          console.log(`\n📋 Schema for "${tableName}" (${info.rowCount} rows):`);
          console.table(info.columns.map(c => ({
            Column: c.name,
            Type: c.type,
            Nullable: c.notnull === 0 ? 'YES' : 'NO',
            PK: c.pk > 0 ? 'YES' : '',
            Default: c.dflt_value || '-'
          })));
        } catch (err: any) {
          console.log(`Error: ${err.message}`);
        }
      }
      rl.prompt();
      return;
    }

    if (trimmed.toLowerCase() === '.stats') {
      const stats = dbManager.getStats();
      console.log('\n📈 Database Statistics:');
      console.log(`  • Engine:     ${stats.engine}`);
      console.log(`  • File:       ${stats.dbFilePath}`);
      console.log(`  • File Size:  ${stats.databaseSizeKb} KB`);
      console.log(`  • Tables:     ${stats.tableCount}`);
      console.log(`  • Total Rows: ${stats.totalRows}\n`);
      rl.prompt();
      return;
    }

    if (trimmed.toLowerCase() === '.help') {
      console.log('\nAvailable Commands:');
      console.log('  SELECT * FROM <table_name> LIMIT 10;');
      console.log('  UPDATE <table_name> SET column = value WHERE condition;');
      console.log('  INSERT INTO <table_name> (cols...) VALUES (vals...);');
      console.log('  DELETE FROM <table_name> WHERE condition;');
      console.log('  .tables');
      console.log('  .schema <table_name>');
      console.log('  .stats');
      console.log('  .clean');
      console.log('  .exit\n');
      rl.prompt();
      return;
    }

    // Accumulate query until semicolon or single line
    multilineBuffer += (multilineBuffer ? ' ' : '') + trimmed;

    if (multilineBuffer.endsWith(';') || !trimmed.includes(' ')) {
      const sqlToExecute = multilineBuffer.replace(/;$/, '');
      multilineBuffer = '';
      executeQuery(sqlToExecute);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\nConsole closed.');
    process.exit(0);
  });
}

function executeQuery(sql: string) {
  const isSelect = /^\s*(SELECT|PRAGMA|EXPLAIN)/i.test(sql);
  const start = performance.now();

  try {
    if (isSelect) {
      const result = dbManager.query(sql);
      const duration = (performance.now() - start).toFixed(2);
      if (result.rows.length === 0) {
        console.log(`\n(0 rows returned in ${duration}ms)\n`);
      } else {
        console.log(`\n--- Results (${result.rows.length} rows, ${duration}ms) ---`);
        console.table(result.rows);
        console.log('');
      }
    } else {
      const res = dbManager.run(sql);
      const duration = (performance.now() - start).toFixed(2);
      console.log(`\n✅ Query executed successfully (${duration}ms). Changes applied to database.\n`);
    }
  } catch (err: any) {
    console.error(`\n❌ Error: ${err.message}\n`);
  }
}

main().catch(console.error);
