import {env} from 'cloudflare:workers';
import {neon} from '@neondatabase/serverless';
export class DatabaseNotConfigured extends Error{constructor(){super('PostgreSQL is not connected.');this.name='DatabaseNotConfigured'}}
export function getSql(){
 const connection=(env as unknown as {DATABASE_URL?:string}).DATABASE_URL||process.env.DATABASE_URL;
 if(!connection)throw new DatabaseNotConfigured();
 return neon(connection);
}
