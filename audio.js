(()=>{
  'use strict';

  const SETTINGS_KEY='pravilo_audio_v1';
  const DEFINITIONS=Object.freeze({
    prayerTen:Object.freeze({src:'sounds/prayer-ten.mp3',volume:.36}),
    prayerHundred:Object.freeze({src:'sounds/prayer-hundred.mp3',volume:.38,maxDuration:1.4,fadeOut:.16}),
    meditationBell:Object.freeze({src:'sounds/meditation-bell.mp3',volume:.68})
  });

  const buffers=new Map();
  const loading=new Map();
  const htmlPlayers=new Map();
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
    try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch(_){ }
    window.dispatchEvent(new CustomEvent('pravilo:audio-settings',{detail:{...settings}}));
  }

  function getSettings(){return {...settings};}

  function setSettings(next={}){
    settings={
      enabled:typeof next.enabled==='boolean'?next.enabled:settings.enabled,
      volume:next.volume===undefined?settings.volume:clamp(next.volume,.15,1)
    };
    htmlPlayers.forEach((audio,name)=>{const def=DEFINITIONS[name];if(def)audio.volume=effectiveVolume(def);});
    saveSettings();
    return getSettings();
  }

  function effectiveVolume(def){return clamp(def.volume*settings.volume,0,1);}

  function htmlPlayer(name){
    if(htmlPlayers.has(name))return htmlPlayers.get(name);
    const def=DEFINITIONS[name];if(!def)return null;
    try{
      const audio=new Audio(def.src);
      audio.preload='auto';
      audio.playsInline=true;
      audio.volume=effectiveVolume(def);
      htmlPlayers.set(name,audio);
      return audio;
    }catch(_){return null;}
  }

  function warmHtmlPlayers(){
    Object.keys(DEFINITIONS).forEach(name=>{
      const audio=htmlPlayer(name);
      try{audio?.load?.();}catch(_){ }
    });
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
    const def=DEFINITIONS[name],ctx=audioContext();
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

  function preloadBuffers(){Object.keys(DEFINITIONS).forEach(name=>{void decode(name);});}
  function preload(){warmHtmlPlayers();if(context?.state==='running')preloadBuffers();}

  async function unlock(){
    warmHtmlPlayers();
    const ctx=audioContext();
    if(!ctx)return false;
    try{
      if(ctx.state==='suspended')await ctx.resume();
      if(ctx.state==='running')preloadBuffers();
      return ctx.state==='running';
    }catch(_){return false;}
  }

  function directPlay(name,{preview=false}={}){
    const def=DEFINITIONS[name];
    if(!def||(!settings.enabled&&!preview))return Promise.resolve(false);
    const audio=htmlPlayer(name);
    if(!audio)return Promise.resolve(false);

    try{
      clearTimeout(audio._praviloStopTimer);
      audio.pause();
      audio.currentTime=0;
      audio.volume=effectiveVolume(def);
      const started=audio.play();
      if(def.maxDuration){
        audio._praviloStopTimer=setTimeout(()=>{
          try{audio.pause();audio.currentTime=0;}catch(_){ }
        },def.maxDuration*1000);
      }
      if(started&&typeof started.then==='function'){
        return started.then(()=>true).catch(error=>{
          console.warn('[Правило] Звук заблокирован браузером',name,error);
          return false;
        });
      }
      return Promise.resolve(true);
    }catch(error){
      console.warn('[Правило] Не удалось воспроизвести HTMLAudio',name,error);
      return Promise.resolve(false);
    }
  }

  async function playBuffered(name,{preview=false}={}){
    const def=DEFINITIONS[name];
    if(!def||(!settings.enabled&&!preview))return false;
    const ctx=audioContext();
    if(!ctx)return directPlay(name,{preview});

    try{
      if(ctx.state==='suspended')await ctx.resume();
      const buffer=await decode(name);
      if(!buffer)return directPlay(name,{preview});

      const source=ctx.createBufferSource();
      const gain=ctx.createGain();
      const duration=Math.min(buffer.duration,def.maxDuration||buffer.duration);
      const now=ctx.currentTime;
      const volume=effectiveVolume(def);

      gain.gain.setValueAtTime(volume,now);
      if(def.fadeOut&&duration>def.fadeOut){
        gain.gain.setValueAtTime(volume,now+duration-def.fadeOut);
        gain.gain.linearRampToValueAtTime(.0001,now+duration);
      }

      source.buffer=buffer;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(now);
      if(duration<buffer.duration)source.stop(now+duration);
      return true;
    }catch(error){
      console.warn('[Правило] Не удалось воспроизвести WebAudio',name,error);
      return directPlay(name,{preview});
    }
  }

  function play(name,{preview=false,direct=false}={}){
    return direct?directPlay(name,{preview}):playBuffered(name,{preview});
  }

  window.PraviloAudio=Object.freeze({
    play,preload,unlock,getSettings,setSettings,
    names:Object.freeze(Object.keys(DEFINITIONS))
  });

  warmHtmlPlayers();
  const firstGesture=()=>{void unlock();};
  document.addEventListener('pointerdown',firstGesture,{once:true,capture:true,passive:true});
  document.addEventListener('keydown',firstGesture,{once:true,capture:true});
})();
