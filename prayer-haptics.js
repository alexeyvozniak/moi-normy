(()=>{
  'use strict';
  let activePrayerId=null;
  let beforeDebt=null;
  let audioCtx=null;
  const $=id=>document.getElementById(id);

  function findPrayerFromButton(button){
    const card=button.closest('.task');
    if(!card)return null;
    const cards=[...document.querySelectorAll('#cards .task')];
    const idx=cards.indexOf(card);
    return idx>=0?(state.items||[])[idx]:null;
  }

  function supportsVibration(){return typeof navigator.vibrate==='function';}
  function vibrate(pattern){
    if(!supportsVibration())return false;
    try{return navigator.vibrate(pattern)!==false;}catch(e){return false;}
  }

  function soundCue(kind){
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      audioCtx.resume?.();
      const now=audioCtx.currentTime;
      if(kind==='ten'){
        const o=audioCtx.createOscillator(),g=audioCtx.createGain();
        o.type='sine';o.frequency.value=430;
        g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.045,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+.10);
        o.connect(g);g.connect(audioCtx.destination);o.start(now);o.stop(now+.11);
      }else{
        [0,.16].forEach((delay,k)=>{
          const o=audioCtx.createOscillator(),g=audioCtx.createGain();
          o.type='sine';o.frequency.value=k?230:285;
          g.gain.setValueAtTime(.0001,now+delay);g.gain.exponentialRampToValueAtTime(.07,now+delay+.015);g.gain.exponentialRampToValueAtTime(.0001,now+delay+.34);
          o.connect(g);g.connect(audioCtx.destination);o.start(now+delay);o.stop(now+delay+.36);
        });
      }
    }catch(e){}
  }

  function visualCenturyCue(){
    const root=$('prayerPractice');if(!root)return;
    root.classList.remove('centuryBowCue');void root.offsetWidth;root.classList.add('centuryBowCue');
    clearTimeout(root._centuryCueTimer);root._centuryCueTimer=setTimeout(()=>root.classList.remove('centuryBowCue'),1450);
  }

  function milestone(item){
    item.prayerBeadCount=Math.max(0,Number(item.prayerBeadCount)||0)+1;
    const n=item.prayerBeadCount;
    if(n%100===0){
      const felt=vibrate(320);
      if(!felt)soundCue('hundred');
      visualCenturyCue();
    }else if(n%10===0){
      const felt=vibrate(45);
      if(!felt)soundCue('ten');
    }
    if(Number(item.debt)<=0)item.prayerBeadCount=0;
    save();
  }

  document.addEventListener('click',e=>{
    const practiceButton=e.target.closest?.('.practiceButton');
    if(practiceButton&&/Режим практики/.test(practiceButton.textContent||'')){
      const item=findPrayerFromButton(practiceButton);if(item)activePrayerId=item.id;
      return;
    }
    const root=e.target.closest?.('#prayerPractice');
    if(root&&!e.target.closest?.('.practiceExit')&&activePrayerId){
      const item=(state.items||[]).find(x=>x.id===activePrayerId);
      beforeDebt=item?Number(item.debt):null;
    }
  },true);

  document.addEventListener('click',e=>{
    const root=e.target.closest?.('#prayerPractice');
    if(!root||e.target.closest?.('.practiceExit')||!activePrayerId||beforeDebt===null)return;
    const item=(state.items||[]).find(x=>x.id===activePrayerId);
    const after=item?Number(item.debt):null;
    if(item&&Number.isFinite(after)&&after===beforeDebt-1)milestone(item);
    beforeDebt=null;
  },false);

  document.addEventListener('click',e=>{
    if(e.target.closest?.('.practiceExit')){activePrayerId=null;beforeDebt=null;}
    if(e.target.closest?.('#openGuideBtn'))setTimeout(()=>{
      const cards=$('guideFeatureOverlay')?.querySelector('.guideCards');
      if(!cards||cards.querySelector('[data-haptics-guide]'))return;
      const c=document.createElement('div');c.className='guideCard';c.dataset.hapticsGuide='1';
      c.innerHTML='<div class="guideNum">十</div><div class="guideTitle">Сигналы на 10 и 100</div><div class="guideText">В режиме Иисусовой молитвы каждая десятая молитва даёт короткий тактильный сигнал — время поясного поклона. Каждая сотая даёт длинный сигнал и кратко меняет цвет экрана — время земного поклона. Если браузер не умеет вибрировать, используется тихий звуковой сигнал.</div>';
      cards.appendChild(c);
    },80);
  },true);
})();
