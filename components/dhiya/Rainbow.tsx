'use client';
import {useEffect,useMemo,useRef,useState,Suspense,Component,type ReactNode} from 'react';
import Link from 'next/link';
import {Canvas,useFrame,useLoader,useThree,type ThreeEvent} from '@react-three/fiber';
import * as THREE from 'three';
import {WebGPURenderer,MeshBasicNodeMaterial,PointsNodeMaterial} from 'three/webgpu';
import {positionLocal,time,sin,cos,vec3,uv,color,mix,uniform} from 'three/tsl';
import gsap from 'gsap';
import {products} from '@/lib/catalog';

type Phase='orbit'|'spinning'|'revealed';
type SceneProps={selected:number|null;paused:boolean;reduced:boolean;onSelect:(index:number)=>void;onReveal:()=>void};
const descriptions=[
 'A timeless drape. A golden detail. An heirloom feeling, ready for your next chapter.',
 'Warmth, colour, and a little celebration. Find the drape that makes every entrance your own.',
 'For the moments that become memories. Discover a world of bridal inspiration.',
 'Soft textures and unhurried days. There is beauty in the everyday.',
 'A fresh perspective on a familiar tradition. Explore the colours of regional weaves.',
 'Quiet drama. Beautiful detail. Dress for the moment, in your own way.'
];
class Boundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?this.props.fallback:this.props.children}}

function Photo({index,texture,orbit,...props}:{index:number;texture:THREE.Texture;orbit:{current:number}}&SceneProps){
 const group=useRef<THREE.Group>(null!);
 const {invalidate}=useThree();
 const hover=useMemo(()=>uniform(0),[]);
 const material=useMemo(()=>{
  const m=new MeshBasicNodeMaterial({map:texture,side:THREE.DoubleSide,transparent:true});
  const flutter=sin(positionLocal.y.mul(3).add(time.mul(.8))).mul(cos(positionLocal.x.mul(2))).mul(hover.mul(.045).add(props.reduced?0:.018));
  m.positionNode=positionLocal.add(vec3(0,0,flutter));
  return m;
 },[texture,hover,props.reduced]);
 const rim=useMemo(()=>new THREE.MeshBasicMaterial({color:'#c6a370',side:THREE.DoubleSide,transparent:true}),[]);
 const chosen=props.selected===index;
 useEffect(()=>()=>{material.dispose();rim.dispose()},[material,rim]);
 useEffect(()=>{
  if(!chosen)return;
  const object=group.current;
  if(props.reduced){object.position.set(0,.25,2);object.rotation.set(0,0,0);object.scale.setScalar(1.12);props.onReveal();invalidate();return}
  const timeline=gsap.timeline({onUpdate:invalidate,onComplete:()=>{object.rotation.y=0;props.onReveal()}});
  timeline.to(object.position,{x:0,y:.25,z:2,duration:1.25,ease:'power3.inOut'},0)
   .to(object.rotation,{x:0,y:Math.PI*2,z:0,duration:1.4,ease:'power3.inOut'},0)
   .to(object.scale,{x:1.16,y:1.16,z:1.16,duration:1.2,ease:'power2.out'},0)
   .to(hover,{value:2,duration:.6,yoyo:true,repeat:1},0);
  return()=>{timeline.kill()};
 // Selection owns the transform for the entire spin; auto orbit only owns unselected transforms.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[chosen]);
 useFrame((_,delta)=>{
  const object=group.current;if(!object)return;
  const relative=THREE.MathUtils.euclideanModulo(index-orbit.current+3,6)-3;
  const angle=relative*.285;
  const target=new THREE.Vector3(Math.sin(angle)*8.1,Math.cos(angle)*8.1-7.9,-Math.abs(relative)*.17);
  if(!chosen){const damping=1-Math.exp(-delta*5);object.position.lerp(target,damping);object.rotation.z=THREE.MathUtils.damp(object.rotation.z,-angle,5,delta);object.rotation.y=THREE.MathUtils.damp(object.rotation.y,-relative*.05,5,delta);object.scale.lerp(new THREE.Vector3(1,1,1),damping)}
  const edge=1-THREE.MathUtils.smoothstep(Math.abs(relative),2.5,3);
  material.opacity=props.selected===null?edge:chosen?1:.12;
  rim.opacity=material.opacity*.75;
 });
 const select=(event:ThreeEvent<MouseEvent>)=>{event.stopPropagation();if(props.selected===null)props.onSelect(index)};
 const initialRelative=THREE.MathUtils.euclideanModulo(index+3,6)-3;
 const initialAngle=initialRelative*.285;
 return <group ref={group} position={[Math.sin(initialAngle)*8.1,Math.cos(initialAngle)*8.1-7.9,-Math.abs(initialRelative)*.17]} rotation={[0,-initialRelative*.05,-initialAngle]}>
  <mesh position={[0,0,-.015]}><planeGeometry args={[2.11,2.9]}/><primitive object={rim} attach="material"/></mesh>
  <mesh onClick={select} onPointerOver={e=>{e.stopPropagation();if(props.selected===null){document.body.style.cursor='pointer';gsap.to(hover,{value:1,duration:.35,onUpdate:invalidate})}}} onPointerOut={()=>{document.body.style.cursor='';gsap.to(hover,{value:0,duration:.35,onUpdate:invalidate})}}><planeGeometry args={[2.05,2.84,24,32]}/><primitive object={material} attach="material"/></mesh>
 </group>
}

function SilkEffects({reduced}:{reduced:boolean}){
 const ribbon=useRef<THREE.Group>(null!);
 const positions=useMemo(()=>{
  const data=new Float32Array(180*3);
  for(let i=0;i<180;i++){data[i*3]=Math.sin(i*127.1)*8;data[i*3+1]=Math.sin(i*311.7)*5;data[i*3+2]=-2-Math.abs(Math.cos(i*74.7))*4}
  return data;
 },[]);
 const materials=useMemo(()=>{
  const silk=new MeshBasicNodeMaterial({side:THREE.DoubleSide,transparent:true,depthWrite:false});
  silk.colorNode=mix(color('#c9a46c'),color('#7c203d'),sin(uv().x.mul(8).add(time.mul(.4))).mul(.5).add(.5));
  silk.opacityNode=sin(uv().y.mul(Math.PI)).mul(.12);
  silk.positionNode=positionLocal.add(vec3(0,sin(positionLocal.x.mul(.7).add(time.mul(.35))).mul(.65),cos(positionLocal.x.mul(.5).add(time.mul(.4))).mul(.7)));
  const dust=new PointsNodeMaterial({color:'#bd9356',size:.027,transparent:true,opacity:.55,sizeAttenuation:true,depthWrite:false});
  dust.positionNode=positionLocal.add(vec3(sin(positionLocal.y.add(time.mul(.15))),cos(positionLocal.x.add(time.mul(.2))),sin(positionLocal.z.add(time.mul(.1)))).mul(.2));
  return {silk,dust};
 },[]);
 useEffect(()=>()=>{materials.silk.dispose();materials.dust.dispose()},[materials]);
 useFrame(({clock})=>{if(!reduced&&ribbon.current)ribbon.current.rotation.z=Math.sin(clock.elapsedTime*.12)*.12});
 if(reduced)return null;
 return <><group ref={ribbon} position={[0,-1.3,-2]} rotation={[.4,0,-.25]}><mesh><planeGeometry args={[19,2.2,100,12]}/><primitive object={materials.silk} attach="material"/></mesh><mesh position={[0,1.1,-.7]} rotation={[.3,0,.2]}><planeGeometry args={[19,1,100,8]}/><primitive object={materials.silk} attach="material"/></mesh></group><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/></bufferGeometry><primitive object={materials.dust} attach="material"/></points><mesh position={[0,-2.6,-4]} rotation={[.5,.05,-.1]}><torusGeometry args={[5.7,.009,6,150]}/><meshBasicMaterial color="#c3a16d" transparent opacity={.4}/></mesh></>
}

function Photos(props:SceneProps){
 const {viewport}=useThree();
 const orbit=useRef(0);
 const textures=useLoader(THREE.TextureLoader,products.map(p=>p.image));
 useMemo(()=>textures.forEach(t=>{const image=t.image as {width:number;height:number};const aspect=image.width/image.height;const target=2.05/2.84;const rx=Math.min(1,target/aspect),ry=Math.min(1,aspect/target);t.repeat.set(rx,ry);t.offset.set((1-rx)/2,(1-ry)/2);t.colorSpace=THREE.SRGBColorSpace}),[textures]);
 useFrame((state,delta)=>{
  if(document.hidden)return;
  if(!props.paused&&!props.reduced&&props.selected===null)orbit.current+=Math.min(delta,.05)*.19;
  if(!props.reduced&&!props.paused){state.camera.position.x=THREE.MathUtils.damp(state.camera.position.x,state.pointer.x*.25,3,delta);state.camera.position.y=THREE.MathUtils.damp(state.camera.position.y,state.pointer.y*.15,3,delta);state.camera.lookAt(0,0,0)}
 });
 return <group scale={Math.min(1,viewport.width/12.2)}><SilkEffects reduced={props.reduced}/>{products.map((p,i)=><Photo key={p.id} index={i} texture={textures[i]} orbit={orbit} {...props}/>)}</group>
}

function FlatFallback(props:SceneProps){
 const wrapper=useRef<HTMLDivElement>(null);
 const phase=useRef(0);
 useEffect(()=>{
  const root=wrapper.current;if(!root)return;
  const cards=[...root.querySelectorAll<HTMLButtonElement>('.fallback-photo')];
  const tick=()=>{
   if(!props.paused&&!props.reduced&&props.selected===null)phase.current+=Math.min(gsap.ticker.deltaRatio(),3)*.003;
   const width=root.clientWidth;
   cards.forEach((card,i)=>{if(props.selected===i)return;const rel=THREE.MathUtils.euclideanModulo(i-phase.current+3,6)-3;const angle=rel*.285;const scale=width/12.2;gsap.set(card,{x:Math.sin(angle)*8.1*scale,y:(1-Math.cos(angle))*8.1*scale,rotation:-angle*180/Math.PI,rotationY:0,opacity:props.selected===null?1-THREE.MathUtils.smoothstep(Math.abs(rel),2.5,3):.12,zIndex:10-Math.round(Math.abs(rel))})});
  };
  tick();if(!props.paused&&!props.reduced&&props.selected===null)gsap.ticker.add(tick);return()=>gsap.ticker.remove(tick);
 },[props.paused,props.reduced,props.selected]);
 useEffect(()=>{
  if(props.selected===null||!wrapper.current)return;
  const element=wrapper.current.querySelectorAll<HTMLButtonElement>('.fallback-photo')[props.selected];
  const timeline=gsap.timeline({onComplete:props.onReveal});
  timeline.to(element,{x:0,y:0,rotation:0,rotationY:360,scale:1.12,opacity:1,zIndex:30,duration:props.reduced?0:1.4,ease:'power3.inOut'});
  return()=>{timeline.kill();gsap.set(element,{scale:1,rotationY:0})};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[props.selected]);
 return <div ref={wrapper} className="gpu-fallback" aria-label="Animated saree photo gallery">{products.map((p,i)=><button className="fallback-photo" key={p.id} aria-label={'Spin and reveal '+p.name} onClick={()=>props.selected===null&&props.onSelect(i)}><img src={p.image} alt={p.name}/></button>)}</div>
}

export default function Rainbow(){
 const [mounted,setMounted]=useState(false),[gpu,setGpu]=useState(false),[gpuFailed,setGpuFailed]=useState(false),[reduced,setReduced]=useState(false),[paused,setPaused]=useState(false);
 const [selected,setSelected]=useState<number|null>(null),[phase,setPhase]=useState<Phase>('orbit');
 const detail=useRef<HTMLDivElement>(null);
 useEffect(()=>{let alive=true;const mq=matchMedia('(prefers-reduced-motion: reduce)');setReduced(mq.matches);const change=()=>setReduced(mq.matches);mq.addEventListener('change',change);(async()=>{try{const n=navigator as Navigator&{gpu?:{requestAdapter:()=>Promise<unknown>}};const adapter=await n.gpu?.requestAdapter();if(alive)setGpu(!!adapter)}catch{}if(alive)setMounted(true)})();return()=>{alive=false;mq.removeEventListener('change',change);document.body.style.cursor=''}},[]);
 useEffect(()=>{if(phase==='revealed'&&detail.current){const tween=gsap.fromTo(detail.current,{y:reduced?0:22,opacity:0,filter:reduced?'none':'blur(8px)'},{y:0,opacity:1,filter:'blur(0px)',duration:reduced?0:.75,ease:'power3.out'});return()=>{tween.kill()}}},[phase,reduced]);
 const select=(i:number)=>{if(phase!=='orbit')return;setSelected(i);setPhase('spinning')};
 const reveal=()=>setPhase('revealed');
 const close=()=>{setPhase('orbit');setSelected(null);document.body.style.cursor=''};
 const props:SceneProps={selected,paused,reduced,onSelect:select,onReveal:reveal};
 const fallback=<FlatFallback {...props}/>;
 const product=selected===null?null:products[selected];
 return <section className={'rainbow-section immersive-gallery '+phase} aria-label="Automatically moving arched saree gallery">
  <div className="gallery-topline"><span className="eyebrow">THE LIVING COLLECTION</span><button className="motion-toggle" onClick={()=>setPaused(p=>!p)} aria-label={paused?'Resume carousel motion':'Pause carousel motion'} aria-pressed={paused}><span aria-hidden="true">{paused?'▶':'Ⅱ'}</span><span>{paused?'Resume motion':'Pause motion'}</span></button></div>
  <div className="gallery-halo" aria-hidden="true"/>
  <div className="arc-stage">{mounted&&!gpuFailed?<Boundary fallback={fallback}><Suspense fallback={fallback}><Canvas dpr={[1,1.6]} camera={{position:[0,0,12],fov:35}} frameloop={paused||reduced?'demand':'always'} gl={async options=>{let renderer=new WebGPURenderer({canvas:options.canvas as HTMLCanvasElement,alpha:true,antialias:true,forceWebGL:!gpu});try{await renderer.init();return renderer}catch{renderer.dispose();try{renderer=new WebGPURenderer({canvas:options.canvas as HTMLCanvasElement,alpha:true,antialias:true,forceWebGL:true});await renderer.init();return renderer}catch(error){setGpuFailed(true);throw error}}}}><Photos {...props}/></Canvas></Suspense></Boundary>:fallback}</div>
  {phase==='orbit'&&<div className="gallery-invitation"><span className="gallery-line"/><p>Every drape holds a story.</p><span className="eyebrow">TOUCH A PHOTO TO REVEAL IT</span></div>}
  {phase==='spinning'&&<p className="spin-status" role="status">Unfolding your story…</p>}
  {phase==='revealed'&&product&&<div ref={detail} className="gallery-detail" aria-live="polite"><span className="eyebrow">{product.collection} / THE DHIYA EDIT</span><h2>{product.name}</h2><p>{descriptions[selected!]}</p><div><Link className="text-link" href={'/product/'+product.id}>Discover this edit ↗</Link><button className="return-gallery" onClick={close}>Back to the gallery</button></div></div>}
  <div className="gallery-choices" aria-label="Select a photo">{products.map((p,i)=><button disabled={phase!=='orbit'} key={p.id} aria-label={'Spin and reveal '+p.name} onClick={()=>select(i)} className={selected===i?'selected':''}><span className="sr-only">{p.name}</span></button>)}</div>
 </section>
}
