(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  let startTopic='';

  function prepareStart(){
    const input=$('meditationTopic');if(!input)return;
    input.placeholder='Можно назвать тему сейчас или оставить пустой';
    const label=input.closest('.meditationTopic')?.querySelector('label');
    if(label)label.textContent='Тема медитации — необязательно';
  }

  function ensureEndTopic(){
    const fields=$('meditationNoteFields');if(!fields||$('meditationFinalTopic'))return;
    const wrap=document.createElement('div');wrap.className='featureField';
    wrap.innerHTML='<label>Название / тема медитации</label><input id="meditationFinalTopic" placeholder="Можно назвать её теперь, если тема прояснилась в конце">';
    fields.insertBefore(wrap,fields.firstChild);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#meditationStart')){
      startTopic=($('meditationTopic')?.value||'').trim();
    }
    if(e.target.closest?.('#meditationAddNote')){
      ensureEndTopic();
      setTimeout(()=>{
        const final=$('meditationFinalTopic');
        if(final&&!final.value)final.value=startTopic||($('meditationTopic')?.value||'').trim();
        final?.focus();
      },0);
    }
    if(e.target.closest?.('#meditationDoneClose')){
      const final=($('meditationFinalTopic')?.value||'').trim();
      const initial=($('meditationTopic')?.value||startTopic||'').trim();
      const chosen=final||initial;
      if(chosen&&$('meditationTopic'))$('meditationTopic').value=chosen;
      const body=$('meditationNoteBody');
      if(body&&chosen&&!body.value.includes(`Тема: ${chosen}`))body.value=`Тема: ${chosen}${body.value.trim()?`\n\n${body.value.trim()}`:''}`;
    }
  },true);

  function init(){prepareStart();ensureEndTopic();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,50),{once:true});else setTimeout(init,50);
  new MutationObserver(()=>{prepareStart();ensureEndTopic();}).observe(document.documentElement,{childList:true,subtree:true});
})();
