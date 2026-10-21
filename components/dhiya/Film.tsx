'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {Observer} from 'gsap/Observer';

type Phase='idle'|'playing'|'done'|'error';
export default function Film({children}:{children:ReactNode}){
 const video=useRef<HTMLVideoElement>(null);
 const root=useRef<HTMLElement>(null);
 const progress=useRef<HTMLDivElement>(null);
 const startPlayback=useRef<()=>void>(()=>{});
 const observerRef=useRef<ReturnType<typeof ScrollTrigger.observe>|null>(null);
 const [phase,setPhase]=useState<Phase>('idle');
 const [error,setError]=useState('');
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger,Observer);
  let alive=true,started=false;
  const element=video.current;
  function start(){
   if(started||!alive||!element)return;
   started=true;setError('');setPhase('playing');element.muted=true;element.currentTime=0;
   element.play().catch(()=>{if(alive){started=false;setPhase('error');setError('The film could not play. Please tap to retry.')}});
  }
  startPlayback.current=start;
  const observer=ScrollTrigger.observe({target:root.current!,type:'wheel,touch',tolerance:8,preventDefault:true,allowClicks:true,ignore:'a,button,input',onUp:start,onDown:start});observerRef.current=observer;
  const key=(event:KeyboardEvent)=>{
   if((event.target as HTMLElement).closest('a,button,input,select,textarea'))return;
   if(['ArrowUp','ArrowDown','PageUp','PageDown',' '].includes(event.key)){event.preventDefault();start()}
  };
  function ended(){if(alive){setPhase('done');observer.disable();if(progress.current)progress.current.style.transform='scaleX(1)'}}
  function failure(){if(alive){started=false;setPhase('error');setError('The film is unavailable. Retry playback or continue to the boutique.')}}
  function timeUpdate(){if(element&&progress.current&&element.duration){progress.current.style.transform=`scaleX(${Math.min(1,element.currentTime/element.duration)})`}}
  element?.addEventListener('ended',ended);element?.addEventListener('error',failure);element?.addEventListener('timeupdate',timeUpdate);
  window.addEventListener('keydown',key);
  return()=>{alive=false;observer.kill();observerRef.current=null;element?.pause();element?.removeEventListener('ended',ended);element?.removeEventListener('error',failure);element?.removeEventListener('timeupdate',timeUpdate);window.removeEventListener('keydown',key);delete document.documentElement.dataset.dhiyaStage};
 },[]);
 useEffect(()=>{
  document.documentElement.dataset.dhiyaStage=phase;
  if(!root.current)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const context=gsap.context(()=>{
   if(phase==='idle'&&!reduced){gsap.fromTo('.film-intro .intro-line',{y:48,opacity:0,filter:'blur(12px)'},{y:0,opacity:1,filter:'blur(0px)',duration:1.3,stagger:.16,ease:'power3.out'});gsap.to('.film-cue-symbol',{y:-7,duration:1.2,repeat:-1,yoyo:true,ease:'sine.inOut'})}
   if(phase==='done'){
    observerRef.current?.disable();
    gsap.fromTo('.boutique-reveal',{opacity:0},{opacity:1,duration:reduced?0:1.2,ease:'power2.out'});
    gsap.fromTo('.reveal-line',{y:reduced?0:40,opacity:0,filter:reduced?'none':'blur(12px)'},{y:0,opacity:1,filter:'blur(0px)',duration:reduced?0:1.15,stagger:reduced?0:.13,delay:reduced?0:.2,ease:'power3.out'});
   }
  },root);
  return()=>context.revert();
 },[phase]);
 return <section ref={root} className={'fixed-experience film-hero '+phase} aria-label="DHIYA immersive boutique">
  <video ref={video} muted playsInline preload="auto" poster="/media/poster.jpg" src="/media/film.mp4" aria-label="DHIYA saree film"/>
  <div className="film-shade"/><div className="film-grain" aria-hidden="true"/>
  {phase==='idle'&&<div className="film-intro"><span className="eyebrow intro-line">A DHIYA EXPERIENCE</span><h1 className="intro-line">Every saree.<br/><em>A story of you.</em></h1><p className="intro-line">Woven with tradition. Imagined by you.</p><button className="film-cue intro-line" onClick={()=>startPlayback.current()} aria-label="Play the full DHIYA film"><span className="film-cue-symbol" aria-hidden="true">↑</span><span>SCROLL UP TO BEGIN</span><small>or tap to play</small></button></div>}
  {phase==='playing'&&<div className="film-playing" role="status"><span className="film-playing-dot"/>A little story, unfolding.</div>}
  {phase==='error'&&<div className="film-error-panel"><span className="eyebrow">THE DHIYA FILM</span><h2>Let’s try that again.</h2><p role="alert">{error}</p><button className="btn light" onClick={()=>{video.current?.load();startPlayback.current()}}>Retry film</button><button className="text-link" onClick={()=>setPhase('done')}>Continue without playback</button></div>}
  {phase==='done'&&<div className="boutique-reveal"><div className="stage-copy"><span className="eyebrow reveal-line">TRADITION, MADE PERSONAL</span><h1 className="reveal-line">Find your<br/><em>beautiful.</em></h1><p className="reveal-line">A world of sarees.<br/>An expression that’s entirely yours.</p><div className="hero-actions reveal-line"><Link className="btn" href="/collections">Explore sarees <span>↗</span></Link><Link className="studio-link" href="/customize">Create your own <span>↗</span></Link></div><span className="stage-note reveal-line">SILK · COTTON · REGIONAL WEAVES</span></div><div className="stage-gallery">{children}</div><div className="stage-bottom"><span>A THREAD OF TRADITION. A TOUCH OF YOU.</span><Link href="/about">Discover DHIYA ↗</Link></div></div>}
  {phase!=='done'&&<><span className="film-caption">DHIYA BOUTIQUE · THE SAREE FILM</span><div className="film-progress" aria-hidden="true"><div ref={progress}/></div></>}
 </section>
}
