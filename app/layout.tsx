import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'DHIYA — Sarees, made personal',description:'Explore saree collections and create your own design at DHIYA boutique.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
