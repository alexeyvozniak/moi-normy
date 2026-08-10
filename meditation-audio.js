(()=>{
  'use strict';
  function makeSilentContext(){
    const param={value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}};
    const node=()=>({type:'sine',frequency:{...param},gain:{...param},connect(){return this;},start(){},stop(){}});
    return class SilentAudioContext{
      constructor(){this.currentTime=0;this.destination={};}
      resume(){return Promise.resolve();}
      createOscillator(){return node();}
      createGain(){return node();}
    };
  }
  function silenceLegacyBellForSession(){
    const AC=window.AudioContext,WK=window.webkitAudioContext,Silent=makeSilentContext();
    let changedAC=false,changedWK=false;
    try{window.AudioContext=Silent;changedAC=true;}catch(e){}
    try{window.webkitAudioContext=Silent;changedWK=true;}catch(e){}
    setTimeout(()=>{
      try{if(changedAC)window.AudioContext=AC;}catch(e){}
      try{if(changedWK)window.webkitAudioContext=WK;}catch(e){}
    },0);
  }
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#meditationStart'))silenceLegacyBellForSession();
  },true);
})();
