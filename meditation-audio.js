(()=>{
  'use strict';
  const source='./sounds/prayer-hundred.mp3';
  const mid=new Audio(source),endA=new Audio(source),endB=new Audio(source);
  mid.preload=endA.preload=endB.preload='auto';
  mid.volume=.48;endA.volume=.56;endB.volume=.34;
  let bound=null,lastPhase='',wasCompleted=false;

  function play(a,delay=0){
    setTimeout(()=>{try{a.pause();a.currentTime=0;const p=a.play();if(p?.catch)p.catch(()=>{});}catch(e){}},delay);
  }
  async function prime(a){
    const v=a.volume;
    try{a.volume=0;await a.play();a.pause();a.currentTime=0;}catch(e){}finally{a.volume=v;}
  }
  function primeAll(){prime(mid);prime(endA);prime(endB);}

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

  function observeScreen(){
    const root=document.getElementById('meditationPractice');
    if(!root||root===bound)return;
    bound=root;lastPhase='';wasCompleted=false;
    const phase=document.getElementById('meditationPhase');
    const inspect=()=>{
      const text=phase?.textContent||'';
      if(/вторая часть/i.test(text)&&!/вторая часть/i.test(lastPhase))play(mid);
      lastPhase=text;
      const completed=root.classList.contains('completed');
      if(completed&&!wasCompleted){play(endA);play(endB,720);}
      wasCompleted=completed;
    };
    new MutationObserver(inspect).observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
    inspect();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('.practiceButton')&&/Начать медитацию/.test(e.target.textContent||'')){
      setTimeout(observeScreen,0);return;
    }
    if(e.target.closest?.('#meditationStart')){
      lastPhase='';wasCompleted=false;
      primeAll();
      silenceLegacyBellForSession();
      setTimeout(observeScreen,0);
    }
  },true);

  new MutationObserver(observeScreen).observe(document.documentElement,{subtree:true,childList:true});
})();
