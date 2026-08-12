(()=>{
  'use strict';

  const SETTINGS_KEY='pravilo_audio_v1';
  const DEFINITIONS={
    prayerTen:{src:'sounds/prayer-ten.mp3',volume:.36},
    prayerHundred:{src:'sounds/prayer-hundred.mp3',volume:.38,maxDuration:1.4,fadeOut:.16},
    meditationBell:{src:'sounds/meditation-bell.mp3',volume:.68}
  };

  const buffers=new Map();
  const loading=new Map();
  let context=null;
  let settings=loadSettings();

  function clamp(value,min,max){return Math.min(max,Math.max(min,Number(value)||0));}
  function loadSettings(){
    try{
      const raw=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');
      return {enabled:raw.enabled!==false,volume:clamp(raw.volume??1,.15,1)};
    }catch(_){return {enabled:true,volume:1};}
  }
  function saveSettings(){
    try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch(_){}
    window.dispatchEvent(new CustomEvent('pravilo:audio-settings',{detail:{...settings}}));
  }
  function getSettings(){return {...settings};}
  function setSettings(next={}){
    settings={enabled:typeof next.enabled==='boolean'?next.enabled:settings.enabled,volume:next.volume===undefined?settings.volume:clamp(next.volume,.15,1)};
    saveSettings();return getSettings();
  }

  function audioContext(){
    if(context)return context;
    const AudioContextCtor=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextCtor)return null;
    try{context=new AudioContextCtor();return context;}catch(_){return null;}
  }

  async function decode(name){
    if(buffers.has(name))return buffers.get(name);
    if(loading.has(name))return loading.get(name);
    const def=DEFINITIONS[name],ctx=audioContext();if(!def||!ctx)return null;
    const promise=(async()=>{
      try{
        const response=await fetch(def.src,{cache:'force-cache'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
        const raw=await response.arrayBuffer(),buffer=await ctx.decodeAudioData(raw.slice(0));buffers.set(name,buffer);return buffer;
      }catch(error){console.warn('[Правило] Не удалось подготовить звук',name,error);return null;}
      finally{loading.delete(name);}
    })();
    loading.set(name,promise);return promise;
  }

  function preload(){Object.keys(DEFINITIONS).forEach(name=>{void decode(name);});}
  async function unlock(){const ctx=audioContext();if(!ctx)return false;try{if(ctx.state==='suspended')await ctx.resume();preload();return ctx.state==='running';}catch(_){return false;}}
  function effectiveVolume(def){return def.volume*settings.volume;}

  async function htmlFallback(name,{preview=false}={}){
    const def=DEFINITIONS[name];if(!def||(!settings.enabled&&!preview))return false;
    try{
      const audio=new Audio(def.src);audio.preload='auto';audio.volume=effectiveVolume(def);audio.playsInline=true;
      const started=audio.play();
      if(started&&typeof started.then==='function')await started;
      if(def.maxDuration)setTimeout(()=>{try{audio.pause();audio.currentTime=0;}catch(_){}},def.maxDuration*1000);
      return true;
    }catch(error){console.warn('[Правило] Звук заблокирован браузером',name,error);return false;}
  }

  async function play(name,{preview=false,direct=false}={}){
    const def=DEFINITIONS[name];if(!def||(!settings.enabled&&!preview))return false;

    // На iOS короткие сигналы, вызванные непосредственно нажатием,
    // надёжнее запускать через HTMLAudio до любого await.
    if(direct)return htmlFallback(name,{preview});

    const ctx=audioContext();if(!ctx)return htmlFallback(name,{preview});
    try{
      if(ctx.state==='suspended')await ctx.resume();
      const buffer=await decode(name);if(!buffer)return htmlFallback(name,{preview});
      const source=ctx.createBufferSource(),gain=ctx.createGain();
      const duration=Math.min(buffer.duration,def.maxDuration||buffer.duration),now=ctx.currentTime,volume=effectiveVolume(def);
      gain.gain.setValueAtTime(volume,now);
      if(def.fadeOut&&duration>def.fadeOut){gain.gain.setValueAtTime(volume,now+duration-def.fadeOut);gain.gain.linearRampToValueAtTime(.0001,now+duration);}
      source.buffer=buffer;source.connect(gain);gain.connect(ctx.destination);source.start(now);if(duration<buffer.duration)source.stop(now+duration);return true;
    }catch(error){console.warn('[Правило] Не удалось воспроизвести звук',name,error);return htmlFallback(name,{preview});}
  }

  window.PraviloAudio=Object.freeze({play,preload,unlock,getSettings,setSettings,names:Object.freeze(Object.keys(DEFINITIONS))});
  const firstGesture=()=>{void unlock();};
  document.addEventListener('pointerdown',firstGesture,{once:true,capture:true,passive:true});
  document.addEventListener('keydown',firstGesture,{once:true,capture:true});
})();
