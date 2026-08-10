(()=>{
  'use strict';
  const KEY='pravilo_v1';
  const $=id=>document.getElementById(id);
  let currentEditId=null;

  const readState=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {items:[]}}};
  const writeState=s=>localStorage.setItem(KEY,JSON.stringify(s));

  function ensureTypeField(){
    if($('practiceTypeField'))return;
    const theme=$('eTheme');
    if(!theme)return;
    const field=document.createElement('div');
    field.className='field';field.id='practiceTypeField';
    field.innerHTML=`<label>Специальный режим</label><select id="practiceType"><option value="">Нет</option><option value="prayer">Молитва · счётчик по касанию</option><option value="meditation">Медитация · таймер 15 + 15 минут</option></select><div class="smallText" style="margin-top:6px">Режим принадлежит этой активности. Можно удалить стандартную карточку и назначить режим любой новой.</div>`;
    theme.closest('.field')?.insertAdjacentElement('afterend',field);
  }

  function inferredType(item){
    if(!item)return '';
    if(item.practiceType==='prayer'||item.practiceType==='meditation')return item.practiceType;
    if(item.id==='prayers'||item.theme==='jesus'||/иисус|молитв|четк|чётк/i.test(`${item.name||''} ${item.unit||''}`))return 'prayer';
    if(item.id==='meditation'||item.theme==='contemplation'||/медит|созерц|тишин/i.test(`${item.name||''} ${item.unit||''}`))return 'meditation';
    return '';
  }

  function fill(id){
    ensureTypeField();currentEditId=id||null;
    const s=readState(),item=id?(s.items||[]).find(x=>x.id===id):null;
    if($('practiceType'))$('practiceType').value=inferredType(item);
  }

  function hookEditor(){
    ensureTypeField();
    const original=window.openEditor;
    if(typeof original==='function'&&!original.__practiceTypeWrapped){
      const wrapped=function(id=null){currentEditId=id||null;original(id);setTimeout(()=>fill(id),0);};
      wrapped.__practiceTypeWrapped=true;window.openEditor=wrapped;
    }
    const saveBtn=$('saveTask');
    if(!saveBtn||saveBtn.dataset.practiceTypeHook)return;
    saveBtn.dataset.practiceTypeHook='1';
    saveBtn.addEventListener('click',()=>{
      ensureTypeField();
      const chosen=$('practiceType')?.value||'';
      const before=readState(),idsBefore=new Set((before.items||[]).map(x=>x.id));
      const editing=currentEditId;
      setTimeout(()=>{
        const after=readState();
        let item=editing?(after.items||[]).find(x=>x.id===editing):null;
        if(!item)item=(after.items||[]).find(x=>!idsBefore.has(x.id));
        if(!item)return;
        if(chosen)item.practiceType=chosen;else delete item.practiceType;
        writeState(after);
        try{window.render?.()}catch(e){}
      },80);
    },true);
  }

  function migrateDefaults(){
    const s=readState();let changed=false;
    for(const item of s.items||[]){
      if(item.practiceType)continue;
      const t=inferredType(item);if(t){item.practiceType=t;changed=true;}
    }
    if(changed)writeState(s);
  }

  function init(){migrateDefaults();hookEditor();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
