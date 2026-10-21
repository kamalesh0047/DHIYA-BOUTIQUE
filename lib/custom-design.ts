import type {Product} from './catalog';
export type Design={fabric:string;body:string;border:string;width:string;pallu:string;motif:string;blouse:string};
const options={fabric:['Kanchipuram silk','Cotton','Soft silk','Georgette','Organza','Banarasi silk'],width:['Slim','Wide','Statement'],pallu:['Traditional zari','Striped','Contrast floral','Minimal'],motif:['Floral','Paisley','Geometric','None'],blouse:['Matching','Contrast','Plain']};
const palette:Record<string,string>={'#6b2037':'Maroon','#c37e8e':'Rose','#23634f':'Emerald','#25467b':'Royal blue','#eee2c9':'Ivory','#6c4388':'Purple','#c79b36':'Mustard','#29232a':'Black'};
export function validDesign(value:unknown):value is Design{if(!value||typeof value!=='object')return false;const d=value as Design;return Object.entries(options).every(([key,values])=>values.includes(d[key as keyof Design]))&&Object.hasOwn(palette,d.body)&&Object.hasOwn(palette,d.border)}
export const colourName=(hex:string)=>palette[hex]||hex;
export const customIdValid=(id:unknown):id is string=>typeof id==='string'&&/^custom-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);
export function validThumbnail(value:unknown):value is string{if(typeof value!=='string'||value.length>300000||!/^data:image\/webp;base64,[A-Za-z0-9+/]+=*$/.test(value))return false;try{const decoded=atob(value.slice(value.indexOf(',')+1));return decoded.startsWith('RIFF')&&decoded.slice(8,12)==='WEBP'}catch{return false}}
export function designPreview(d:Design){
 const w=d.width==='Slim'?22:d.width==='Wide'?45:70;
 const motif=d.motif==='Floral'?'<ellipse cx="32" cy="27" rx="6" ry="12"/><ellipse cx="32" cy="27" rx="12" ry="6"/><circle cx="32" cy="27" r="3"/>':d.motif==='Paisley'?'<path d="M32 12Q58 35 32 43Q15 35 32 12ZM32 23Q42 35 32 36"/>':d.motif==='Geometric'?'<path d="M32 12L47 27 32 42 17 27Z"/>':'';
 const lines=d.pallu==='Minimal'?'':[333,345,357,375,390].map(y=>`<path d="M0 ${y}H400" stroke="${d.body}" stroke-width="${d.pallu==='Striped'?4:1.5}"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 550"><rect width="500" height="550" fill="#f0e9df"/><defs><pattern id="motifs" width="65" height="65" patternUnits="userSpaceOnUse"><g fill="none" stroke="${d.border}" stroke-width="1.2">${motif}</g></pattern><linearGradient id="silk"><stop stop-color="black" stop-opacity=".2"/><stop offset=".4" stop-color="white" stop-opacity=".15"/><stop offset="1" stop-color="black" stop-opacity=".1"/></linearGradient></defs><g transform="translate(50,55) rotate(-4 200 220)"><rect width="400" height="420" fill="${d.body}"/><rect width="400" height="420" fill="url(#motifs)"/><rect width="${w}" height="420" fill="${d.border}"/><rect x="${400-w}" width="${w}" height="420" fill="${d.border}"/><rect y="320" width="400" height="100" fill="${d.border}" opacity="${d.pallu==='Minimal'?.25:.8}"/>${lines}<rect width="400" height="420" fill="url(#silk)"/></g><text x="250" y="530" text-anchor="middle" fill="#786962" font-size="10" letter-spacing="3">DHIYA · DESIGN STUDY</text></svg>`;
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
export function customProduct(d:Design,id:string,thumbnail?:string):Product{
 if(!validDesign(d)||!customIdValid(id)||thumbnail!==undefined&&!validThumbnail(thumbnail))throw new Error('Invalid saved design.');
 // Illustrative catalogue-aligned estimates for the explicitly simulated checkout.
 const prices:Record<string,number>={'Kanchipuram silk':6490,'Cotton':2490,'Soft silk':4290,'Georgette':3290,'Organza':4290,'Banarasi silk':6490};
 return {id,name:'Your custom saree',fabric:d.fabric,price:prices[d.fabric],image:thumbnail||designPreview(d),collection:'Custom design',customDesign:{...d},priceIsEstimate:true};
}
