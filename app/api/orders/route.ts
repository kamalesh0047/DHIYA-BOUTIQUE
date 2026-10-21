import {products,type Product} from '@/lib/catalog';
import {customProduct,validDesign,customIdValid,validThumbnail} from '@/lib/custom-design';
import {saveOrder,listOrders,type DemoOrder} from '@/db/orders';
import {DatabaseNotConfigured} from '@/db';
function session(req:Request){return req.headers.get('cookie')?.match(/(?:^|;\s*)dhiya_session=([a-f0-9-]{36})(?:;|$)/)?.[1]}
const noCache={'Cache-Control':'no-store'};
export async function GET(req:Request){const sid=session(req);if(!sid)return Response.json([],{headers:noCache});try{return Response.json(await listOrders(sid),{headers:noCache})}catch(e){if(e instanceof DatabaseNotConfigured)return Response.json([],{headers:{...noCache,'X-DHIYA-Order-Storage':'browser'}});return Response.json({error:'Online demo order history is temporarily unavailable.'},{status:503,headers:noCache})}}
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Invalid request origin.'},{status:403});
 let body:{items:{id:string;quantity:number;design?:unknown;thumbnail?:unknown}[];method:string};
 try{body=await req.json() as typeof body}catch{return Response.json({error:'Invalid order.'},{status:400})}
 if(!body||!Array.isArray(body.items)||!body.items.length||body.items.length>20||!['UPI','Card','Net banking'].includes(body.method))return Response.json({error:'Invalid order.'},{status:400});
 const ids=new Set<string>();const items=[];
 for(const item of body.items){let product:Product|undefined=products.find(p=>p.id===item?.id);if(!product&&customIdValid(item?.id)){if(!validDesign(item.design)||(item.thumbnail!==undefined&&!validThumbnail(item.thumbnail)))return Response.json({error:'Your custom design is invalid. Please save it again.'},{status:400});product=customProduct(item.design,item.id,item.thumbnail as string|undefined)}if(!product||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>10||ids.has(item.id))return Response.json({error:'Your bag contains invalid items.'},{status:400});ids.add(item.id);items.push({product,quantity:item.quantity})}
 const sid=session(req)||crypto.randomUUID();
 const order:DemoOrder={id:'DEMO-'+crypto.randomUUID().slice(0,12).toUpperCase(),items,total:items.reduce((s,l)=>s+l.product.price*l.quantity,0),createdAt:new Date().toISOString(),status:'simulated_success',storage:'postgresql'};
 try{await saveOrder(order,sid,body.method)}catch(e){if(e instanceof DatabaseNotConfigured){order.storage='browser'}else{return Response.json({error:'Unable to save the demo order. Please try again.'},{status:503,headers:noCache})}}
 return Response.json(order,{headers:{...noCache,'Set-Cookie':`dhiya_session=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`}});
}
