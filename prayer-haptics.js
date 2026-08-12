(()=>{
  'use strict';
  const $=id=>document.getElementById(id);

  function vibrate(pattern){
    if(typeof navigator.vibrate!=='function')return false;
    try{return navigator.vibrate(pattern)!==false;}catch(_){return false;}
  }
  function playCue(name){
    try{void window.PraviloAudio?.play(name,{direct:true});}catch(_){/* vibration + visual cue remain the fallback */}
  }
  function visualCue(kind){
    const root=$('prayerPractice');if(!root)return;
    root.classList.remove('decadeBowCue','centuryBowCue');void root.offsetWidth;
    root.classList.add(kind==='century'?'centuryBowCue':'decadeBowCue');
    clearTimeout(root._beadCueTimer);
    root._beadCueTimer=setTimeout(()=>root.classList.remove('decadeBowCue','centuryBowCue'),kind==='century'?1450:850);
  }
  function onPrayerTap(event){
    const count=Number(event.detail?.sessionCount)||0;
    const cue=window.PraviloDomain?.prayerCue?.(count)||'';
    if(cue==='hundred'){
      playCue('prayerHundred');vibrate(320);visualCue('century');
    }else if(cue==='ten'){
      playCue('prayerTen');vibrate(45);visualCue('decade');
    }
  }
  function onPrayerOpen(){try{void window.PraviloAudio?.unlock?.();}catch(_){}}

  window.addEventListener('pravilo:prayer-tap',onPrayerTap);
  window.addEventListener('pravilo:prayer-open',onPrayerOpen);

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#openGuideBtn'))setTimeout(()=>{
      const cards=$('guideFeatureOverlay')?.querySelector('.guideCards');
      if(!cards||cards.querySelector('[data-haptics-guide]'))return;
      const c=document.createElement('div');c.className='guideCard';c.dataset.hapticsGuide='1';
      c.innerHTML='<div class="guideNum">十</div><div class="guideTitle">Сигналы на 10 и 100</div><div class="guideText">Счёт начинается заново при каждом входе в режим практики. Каждая десятая молитва отмечается мягким звуком, короткой вибрацией и краткой сменой оттенка экрана — поясной поклон. Каждая сотая получает отдельный более глубокий звук, длинную вибрацию и тёплую смену цвета — земной поклон.</div>';
      cards.appendChild(c);
    },80);
  },true);
})();
