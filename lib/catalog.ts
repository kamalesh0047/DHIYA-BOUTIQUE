import type {Design} from './custom-design';
export type Product={id:string;name:string;fabric:string;price:number;image:string;collection:string;photoAuthor?:string;photoSource?:string;customDesign?:Design;priceIsEstimate?:boolean};
export const products:Product[]=[
{id:'heritage',name:'The Heritage Drape',fabric:'Silk',price:6490,image:'/images/saree-cream.jpg',collection:'Silk',photoAuthor:'vivek',photoSource:'https://unsplash.com/photos/kp2gTbDwd8Y'},
{id:'golden-hour',name:'Golden Hour',fabric:'Silk blend',price:4290,image:'/images/saree-festive.jpg',collection:'Festive',photoAuthor:'v3dont',photoSource:'https://unsplash.com/photos/tR84AoeoGfQ'},
{id:'heirloom',name:'An Heirloom Story',fabric:'Silk',price:8990,image:'/images/saree-red.jpg',collection:'Bridal',photoAuthor:'Jenish Ghaadiya',photoSource:'https://unsplash.com/photos/T6F0IrysJjg'},
{id:'everyday',name:'Everyday Poetry',fabric:'Cotton',price:2490,image:'/images/saree-cotton.jpg',collection:'Cotton',photoAuthor:'soumya parthasarathy',photoSource:'https://unsplash.com/photos/eLOLLINm5ZA'},
{id:'woven',name:'Woven in Tradition',fabric:'Silk blend',price:5290,image:'/images/saree-green.jpg',collection:'Regional',photoAuthor:'Simon Reza',photoSource:'https://unsplash.com/photos/ufKbf_1dOho'},
{id:'celebration',name:'A Little Celebration',fabric:'Georgette',price:3290,image:'/images/saree-black.jpg',collection:'Occasion',photoAuthor:'Kolkata Models',photoSource:'https://unsplash.com/photos/e1yMP8sckPw'}];
export const money=(n:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
