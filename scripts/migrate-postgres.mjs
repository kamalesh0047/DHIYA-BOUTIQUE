import {fileURLToPath} from 'node:url';
import {neon} from '@neondatabase/serverless';
import {drizzle} from 'drizzle-orm/neon-http';
import {migrate} from 'drizzle-orm/neon-http/migrator';
if(!process.env.DATABASE_URL){console.error('DATABASE_URL is required. Set your PostgreSQL connection string in the server environment.');process.exitCode=1}else{
 try{await migrate(drizzle(neon(process.env.DATABASE_URL)),{migrationsFolder:fileURLToPath(new URL('../db/postgres/migrations',import.meta.url))});console.log('PostgreSQL migrations applied.')}catch{console.error('PostgreSQL migration failed. Check database access and the connection string.');process.exitCode=1}
}
