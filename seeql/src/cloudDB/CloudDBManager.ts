import * as sql from 'mssql';

export interface AzureDBConfig {
  server: string;
  user: string;
  password: string;
  database: string;
  options?: {
    encrypt?: boolean;
    enableArithAbort?: boolean;
  };
}

export class CloudDBManager {
  private config: AzureDBConfig;
  private pool: sql.ConnectionPool | null = null;

  constructor(config: AzureDBConfig) {
    this.config = config;
  }

  public async connect(): Promise<void> {
    try {
      this.pool = await sql.connect({
        server: this.config.server,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        options: {
          encrypt: this.config.options?.encrypt ?? true,
          enableArithAbort: this.config.options?.enableArithAbort ?? true,
        },
      });
      console.log('Connected to Azure SQL database successfully.');
    } catch (error) {
      console.error('Error connecting to Azure SQL database:', error);
      throw error;
    }
  }

  public async executeQuery(query: string): Promise<any> {
    if (!this.pool) {
      throw new Error('No connection pool available. Call connect() first.');
    }
    try {
      const result = await this.pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error executing query on Azure SQL:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}
