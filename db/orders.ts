import {getSql} from './index';
import type {Product} from '../lib/catalog';
export type DemoOrder={id:string;items:{product:Product;quantity:number}[];total:number;createdAt:string;status:'simulated_success';storage:'postgresql'|'browser'};
export async function saveOrder(order:DemoOrder,session:string,method:string){
 const sql=getSql();
 await sql.query('INSERT INTO dhiya_demo_orders (id,session,items,total,created_at,method) VALUES ($1,$2,$3::jsonb,$4,$5::timestamptz,$6)',[order.id,session,JSON.stringify(order.items),order.total,order.createdAt,method]);
}
export async function listOrders(session:string):Promise<DemoOrder[]>{
 const sql=getSql();
 const rows=await sql.query('SELECT id, items, total, created_at FROM dhiya_demo_orders WHERE session = $1 ORDER BY created_at DESC LIMIT 50',[session]);
 return rows.map(r=>({id:String(r.id),items:typeof r.items==='string'?JSON.parse(r.items):r.items,total:Number(r.total),createdAt:new Date(r.created_at).toISOString(),status:'simulated_success',storage:'postgresql'}));
}
