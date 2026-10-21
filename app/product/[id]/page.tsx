import {Shell,ProductPage} from '@/components/dhiya/Store';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Shell><ProductPage id={id}/></Shell>}
