import {pgTable,text,integer,jsonb,timestamp,index} from 'drizzle-orm/pg-core';
import type {Product} from '../lib/catalog';
export const demoOrders=pgTable('dhiya_demo_orders',{
 id:text('id').primaryKey(),
 session:text('session').notNull(),
 items:jsonb('items').$type<{product:Product;quantity:number}[]>().notNull(),
 total:integer('total').notNull(),
 createdAt:timestamp('created_at',{withTimezone:true,mode:'string'}).notNull(),
 method:text('method').notNull()
},table=>[index('dhiya_demo_orders_session_created_idx').on(table.session,table.createdAt)]);
