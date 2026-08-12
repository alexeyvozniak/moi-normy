(()=>{
  'use strict';
  const DB_NAME='pravilo-offline-v1';
  const STORE='backups';
  const STATE_KEY='pravilo_v1';
  const RECORD='latest';
  const $=id=>document.getElementById(id);
  let dbPromise=null;
  let lastSavedAt=0;

  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(!('indexedDB'in window))return reject(new Error('IndexedDB unavailable'));
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB open failed'));
    });
    return dbPromise;
  }
  async function writeBackup(raw){
    if(!raw)return;
    try{
      JSON.parse(raw);const db=await openDb(),savedAt=Date.now();
      await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({id:RECORD,savedAt,raw});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
      lastSavedAt=savedAt;updateStatus();
    }catch(e){}
  }
  async function readBackup(){
    try{const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly'),req=tx.objectStore(STORE).get(RECORD);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});}catch(e){return null;}
  }
  function currentRaw(){try{return localStorage.getItem(STATE_KEY);}catch(e){return null;}}
  function mirrorCurrent(){const raw=currentRaw();if(raw)writeBackup(raw);}
  async function restoreIfPrimaryMissing(){
    if(currentRaw()){mirrorCurrent();return false;}
    const backup=await readBackup();if(!backup?.raw)return false;
    try{JSON.parse(backup.raw);localStorage.setItem(STATE_KEY,backup.raw);sessionStorage.setItem('pravilo_restored_from_offline','1');location.reload();return true;}catch(e){return false;}
  }
  async function requestPersistentStorage(){try{if(!navigator.storage?.persist)return false;const already=await navigator.storage.persisted?.();return already||await navigator.storage.persist();}catch(e){return false;}}
  function showToast(text){let t=$('offlineToast');if(!t){t=document.createElement('div');t.id='offlineToast';t.className='toast';document.body.appendChild(t);}t.textContent=text;t.classList.add('show');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2600);}
  function fmt(ts){if(!ts)return 'ещё не создана';try{return new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(ts));}catch(e){return '';}}
  async function updateStatus(){
    const el=$('offlineStorageStatus');if(!el)return;const persisted=await(navigator.storage?.persisted?.().catch(()=>false)||false),backup=lastSavedAt?{savedAt:lastSavedAt}:await readBackup();
    el.innerHTML=`<strong>${navigator.onLine?'Можно работать без сети':'Сейчас без сети'}</strong><br>Локальная копия: ${fmt(backup?.savedAt)}${persisted?' · хранилище защищено':' · браузер может очистить данные при нехватке места'}`;
  }
  function addSettingsBlock(){
    if($('offlineStoragePanel'))return;const settings=$('settingsOverlay')?.querySelector('.sheet');if(!settings)return;
    const panel=document.createElement('div');panel.id='offlineStoragePanel';panel.className='notesExportPanel';panel.innerHTML=`<div class="notesExportTitle">Офлайн-режим</div><div class="notesExportText" id="offlineStorageStatus">Подготавливаю локальное хранение…</div><button class="button" type="button" id="refreshOfflineBackup">Обновить локальную копию</button>`;settings.appendChild(panel);
    $('refreshOfflineBackup').addEventListener('click',async()=>{mirrorCurrent();await requestPersistentStorage();setTimeout(updateStatus,120);showToast('Локальная копия обновлена');});updateStatus();
  }
  function augmentGuide(){const cards=$('guideFeatureOverlay')?.querySelector('.guideCards');if(!cards||cards.querySelector('[data-offline-guide]'))return;const c=document.createElement('div');c.className='guideCard';c.dataset.offlineGuide='1';c.innerHTML='<div class="guideNum">十一</div><div class="guideTitle">Работа без интернета</div><div class="guideText">После первого полного открытия «Правило» работает офлайн. Изменения сохраняются на устройстве, а состояние дополнительно зеркалируется в локальную резервную копию. Экспорт из настроек остаётся самой надёжной внешней копией.</div>';cards.appendChild(c);}
  async function init(){
    const restored=await restoreIfPrimaryMissing();if(restored)return;
    /* app-core.js сообщает о каждом успешном сохранении; никаких monkey-patch функций больше нет. */
    window.addEventListener('pravilo:state-saved',()=>queueMicrotask(mirrorCurrent));
    mirrorCurrent();requestPersistentStorage().then(()=>updateStatus());addSettingsBlock();
    window.addEventListener('offline',()=>{updateStatus();showToast('Без сети — изменения сохраняются на устройстве');});
    window.addEventListener('online',()=>{updateStatus();showToast('Соединение восстановлено');});
    document.addEventListener('click',e=>{if(e.target.closest?.('#openGuideBtn'))setTimeout(augmentGuide,80);},true);
    if(sessionStorage.getItem('pravilo_restored_from_offline')){sessionStorage.removeItem('pravilo_restored_from_offline');showToast('Данные восстановлены из локальной копии');}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
