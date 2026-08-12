(()=>{
  'use strict';

  const DEFINITIONS={
    prayerTen:{src:'sounds/prayer-ten.mp3',volume:.36},
    prayerHundred:{src:'sounds/prayer-hundred.mp3',volume:.72},
    meditationBell:{src:'sounds/meditation-bell.mp3',volume:.68}
  };

  const buffers=new Map();
  const loading=new Map();
  let context=null;

  function audioContext(){
    if(context)return context;
    const AudioContextCtor=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextCtor)return null;
    try{context=new AudioContextCtor();return context;}catch(_){return null;}
  }

  async function decode(name){
    if(buffers.has(name))return buffers.get(name);
    if(loading.has(name))return loading.get(name);
    const def=DEFINITIONS[name];
    const ctx=audioContext();
    if(!def||!ctx)return null;
    const promise=(async()=>{
      try{
        const response=await fetch(def.src,{cache:'force-cache'});
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const raw=await response.arrayBuffer();
        const buffer=await ctx.decodeAudioData(raw.slice(0));
        buffers.set(name,buffer);
        return buffer;
      }catch(error){
        console.warn('[Правило] Не удалось подготовить звук',name,error);
        return null;
      }finally{
        loading.delete(name);
      }
    })();
    loading.set(name,promise);
    return promise;
  }

  function preload(){Object.keys(DEFINITIONS).forEach(name=>{void decode(name);});}

  async function unlock(){
    const ctx=audioContext();
    if(!ctx)return false;
    try{
      if(ctx.state==='suspended')await ctx.resume();
      preload();
      return ctx.state==='running';
    }catch(_){return false;}
  }

  async function htmlFallback(name){
    const def=DEFINITIONS[name];if(!def)return false;
    try{
      const audio=new Audio(def.src);
      audio.preload='auto';audio.volume=def.volume;audio.playsInline=true;
      await audio.play();
      return true;
    }catch(error){
      console.warn('[Правило] Звук заблокирован браузером',name,error);
      return false;
    }
  }

  async function play(name){
    const def=DEFINITIONS[name];if(!def)return false;
    const ctx=audioContext();
    if(!ctx)return htmlFallback(name);
    try{
      if(ctx.state==='suspended')await ctx.resume();
      const buffer=await decode(name);
      if(!buffer)return htmlFallback(name);
      const source=ctx.createBufferSource();
      const gain=ctx.createGain();
      gain.gain.value=def.volume;
      source.buffer=buffer;
      source.connect(gain);gain.connect(ctx.destination);
      source.start(0);
      return true;
    }catch(error){
      console.warn('[Правило] Не удалось воспроизвести звук',name,error);
      return htmlFallback(name);
    }
  }

  window.PraviloAudio=Object.freeze({play,preload,unlock,names:Object.freeze(Object.keys(DEFINITIONS))});

  const firstGesture=()=>{void unlock();};
  document.addEventListener('pointerdown',firstGesture,{once:true,capture:true,passive:true});
  document.addEventListener('keydown',firstGesture,{once:true,capture:true});
  preload();
})();
