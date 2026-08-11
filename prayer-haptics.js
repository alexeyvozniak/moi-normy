(()=>{
  'use strict';
  let activePrayerId=null;
  let beforeDebt=null;
  const $=id=>document.getElementById(id);

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
  function visualCue(kind){
    const root=$('prayerPractice');if(!root)return;
    root.classList.remove('decadeBowCue','centuryBowCue');void root.offsetWidth;
    root.classList.add(kind==='century'?'centuryBowCue':'decadeBowCue');
    clearTimeout(root._beadCueTimer);
    root._beadCueTimer=setTimeout(()=>root.classList.remove('decadeBowCue','centuryBowCue'),kind==='century'?1450:850);
  }
  function milestone(item){
    item.prayerBeadCount=Math.max(0,Number(item.prayerBeadCount)||0)+1;
    const n=item.prayerBeadCount;
    if(n%100===0){
      vibrate(320);visualCue('century');
    }else if(n%10===0){
      vibrate(45);visualCue('decade');
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
      c.innerHTML='<div class="guideNum">十</div><div class="guideTitle">Сигналы на 10 и 100</div><div class="guideText">Каждая десятая молитва отмечается короткой вибрацией и краткой сменой оттенка экрана — поясной поклон. Каждая сотая даёт более длинную вибрацию и более заметную тёплую смену цвета — земной поклон.</div>';
      cards.appendChild(c);
    },80);
  },true);
})();
