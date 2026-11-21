import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
// Only application-owned SQL reaches this compiler; values are always bound.
export function postgresSQL(statement) {
  let i=0;
  if (statement.includes('INSERT INTO activity_progress')) statement = statement.replace(/(?<![.\w])level \+/g, 'activity_progress.level +');
  // App scalar clamps have a numeric first argument. Preserve SQL aggregates
  // such as max(id)/min(id), which have different semantics in PostgreSQL.
  return statement.replace(/'(?:''|[^'])*'|\?|\bAS (accountId|expiresAt|deviceId)\b|\bmax\((?=\s*-?\d+\s*,)|\bmin\((?=\s*-?\d+\s*,)|\bIS NOT \?|\(\? OR/g,
    match => {
      if (match.startsWith("'")) return match;
      if (match === '?') return '$' + ++i;
      if (match === 'IS NOT ?') return 'IS DISTINCT FROM $' + ++i;
      if (match === '(? OR') return `($${++i}::integer <> 0 OR`;
      if (match.startsWith('AS ')) return `AS "${match.slice(3)}"`;
      return match === 'max(' ? 'greatest(' : 'least(';
    }).replace(/WHERE (\$\d+) OR/g, 'WHERE $1::integer <> 0 OR')
      ;
}

export function wrapPostgres(client) {
  return {
    dialect:'postgres',
    exec: statement => client.query(statement.replace('BEGIN IMMEDIATE','BEGIN')),
    prepare(statement) {
      const query = async args => client.query(postgresSQL(statement), args);
      return {
        get: async (...args) => (await query(args)).rows[0],
        all: async (...args) => (await query(args)).rows,
        run: async (...args) => ({changes:(await query(args)).rowCount})
      };
    },
    close: () => client.end?.() ?? client.close()
  };
}

export async function openDatabase(env=process.env) {
  if (!env.COMPASS_DATABASE_URL && !env.COMPASS_PGHOST) {
    if (env.NODE_ENV === 'production') throw new Error('Production requires PostgreSQL.');
    const db = new DatabaseSync(env.COMPASS_DB ?? 'compass.sqlite');
    db.dialect = 'sqlite';
    return db;
  }
  const {default:pg} = await import('pg');
  pg.types.setTypeParser(20, value => {
    const n = Number(value);
    if (!Number.isSafeInteger(n)) throw new Error('Database integer exceeds safe range');
    return n;
  });
  const local = env.COMPASS_PG_INSECURE_LOCAL === '1' && env.NODE_ENV !== 'production';
  if (env.COMPASS_DATABASE_URL && [...new URL(env.COMPASS_DATABASE_URL).searchParams.keys()].some(key=>/^ssl/i.test(key))) {
    throw new Error('Configure TLS using PGSSLROOTCERT, not URL TLS parameters.');
  }
  const config={
    connectionString:env.COMPASS_DATABASE_URL,
    host:env.COMPASS_PGHOST, port:env.COMPASS_PGPORT ? Number(env.COMPASS_PGPORT) : undefined,
    database:env.COMPASS_PGDATABASE, user:env.COMPASS_PGUSER, password:env.COMPASS_PGPASSWORD,
    ssl: local ? false : {rejectUnauthorized:true, ...(env.COMPASS_PGSSLROOTCERT ? {ca:await readFile(env.COMPASS_PGSSLROOTCERT,'utf8')} : {})},
    connectionTimeoutMillis:10000, statement_timeout:15000
  };
  let client,connecting,inTransaction=false,transactionLost=false,closed=false;
  async function connect() {
    if(closed)throw new Error('Database connection is closed');
    if(client)return client;
    if(connecting)return connecting;
    connecting=(async()=>{
      const next=new pg.Client(config);
      next.on('error',()=>{
        if(client===next){client=undefined;if(inTransaction)transactionLost=true;}
        // An idle free-tier connection may be terminated. Reconnect on the next
        // operation, never replay a failed write or silently continue a transaction.
      });
      next.on('end',()=>{if(client===next){client=undefined;if(inTransaction)transactionLost=true;}});
      try{await next.connect();client=next;return next;}catch(error){await next.end().catch(()=>{});throw error;}
    })();
    try{return await connecting;}finally{connecting=undefined;}
  }
  await connect();
  return wrapPostgres({
    async query(statement,args) {
      const command=statement.trim().toUpperCase();
      if(transactionLost) {
        if(command==='ROLLBACK'){transactionLost=false;inTransaction=false;return {rows:[],rowCount:0};}
        throw new Error('Database connection was lost during a transaction; rollback required');
      }
      const current=await connect();
      try{
        const result=await current.query(statement,args);
        if(command==='BEGIN')inTransaction=true;
        if(command==='COMMIT'||command==='ROLLBACK')inTransaction=false;
        return result;
      }catch(error){
        if(command==='ROLLBACK'){inTransaction=false;transactionLost=false;}
        throw error;
      }
    },
    async end(){closed=true;if(connecting)await connecting.catch(()=>{});await client?.end();client=undefined;}
  });
}

