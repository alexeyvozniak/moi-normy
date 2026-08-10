(()=>{
  'use strict';
  let activePrayerId=null;
  let beforeDebt=null;
  const $=id=>document.getElementById(id);
  const audio={
    ten:new Audio('./sounds/prayer-ten.mp3'),
    hundred:new Audio('./sounds/prayer-hundred.mp3')
  };
  audio.ten.preload='auto';audio.ten.volume=.46;
  audio.hundred.preload='auto';audio.hundred.volume=.62;

  function findPrayerFromButton(button){
    const card=button.closest('.task');
    if(!card)return null;
    const cards=[...document.querySelectorAll('#cards .task')];
    const idx=cards.indexOf(card);
    return idx>=0?(state.items||[])[idx]:null;
  }
  function vibrate(pattern){
    if(typeof navigator.vibrate!=='function')return false;
    try{return navigator.vibrate(pattern)!==false;}catch(e){return false;}
  }
  function soundCue(kind){
    const a=audio[kind];if(!a)return;
    try{a.pause();a.currentTime=0;const p=a.play();if(p?.catch)p.catch(()=>{});}catch(e){}
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
      vibrate(320);soundCue('hundred');visualCenturyCue();
    }else if(n%10===0){
      vibrate(45);soundCue('ten');
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
      c.innerHTML='<div class="guideNum">十</div><div class="guideTitle">Сигналы на 10 и 100</div><div class="guideText">Каждая десятая молитва отмечается коротким лёгким звоном и, где это поддерживается, короткой вибрацией — поясной поклон. Каждая сотая даёт более глубокий звон, длинную вибрацию и краткое изменение цвета экрана — земной поклон.</div>';
      cards.appendChild(c);
    },80);
  },true);
})();
