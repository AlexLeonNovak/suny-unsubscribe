import Database, { Database as DType } from 'better-sqlite3';
import { DateTime } from 'luxon';

export class Logger {
  private readonly db: DType;
  private readonly tableName: string;
  private readonly sessId: string;

  constructor() {
    this.db = new Database('log.db');
    this.tableName = `log_${DateTime.now().toFormat('yyyy_MM_dd')}`;
    this.sessId = DateTime.local().toFormat('yyyyMMddHHmmss');
    this.init();
  }

  private init() {
    const stmt = this.db.prepare(`CREATE TABLE IF NOT EXISTS ${this.tableName} (
      id INTEGER PRIMARY KEY,
      sessId varchar(16),
      type VARCHAR(8),
      message MEDIUMTEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    stmt.run();
  }

  private insert(type, message) {
    this.db.prepare(`INSERT INTO ${this.tableName} (sessId, type, message) VALUES (?,?,?)`)
      .run(this.sessId, type, message);
  }

  public log(message) {
    this.insert('log', message);
  }

  public error(message) {
    this.insert('error', message);
  }

  public debug(message) {
    this.insert('debug', message);
  }

  public getErrors() {
    this.db.prepare(`SELECT * FROM ${this.tableName} WHERE type = 'error' AND sessId = ${this.sessId}`)
      .all();
  }

}
