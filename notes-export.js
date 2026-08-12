(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  function kind(entry){if(entry.note?.kind==='meditation')return 'Медитация';if(entry.note?.kind==='reading')return 'Чтение';const item=state.items.find(x=>x.id===entry.itemId);return item?.practiceType==='meditation'||/медит|созерц/i.test(entry.item||'')?'Медитация':'Чтение';}
  function exportNotes(){
    const rows=state.history.filter(h=>h.note&&(h.note.title||h.note.body)).slice().reverse();
    if(!rows.length){window.praviloNotice?.({kicker:'Заметки',title:'Пока нечего выгружать',message:'Заметки чтения и медитации появятся здесь после сохранения.'});return false;}
    const out=['# Заметки «Правила»','',`Экспорт: ${new Intl.DateTimeFormat('ru-RU',{dateStyle:'long'}).format(new Date())}`,''];
    for(const h of rows){const date=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(h.ts)),label=kind(h);out.push(`## ${date} · ${label}`);if(h.item)out.push(`**${label==='Чтение'?'Книга / действие':'Действие'}:** ${h.item}`);if(h.amount)out.push(`**Выполнено:** ${h.amount} ${h.unit||''}`.trim());if(h.note.title)out.push(`**${label==='Медитация'?'Тема':'Тема / глава'}:** ${h.note.title}`);out.push('');if(h.note.body)out.push(h.note.body,'');out.push('---','');}
    const blob=new Blob(['\ufeff'+out.join('\n')],{type:'text/markdown;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`pravilo-zametki-${today()}.md`;document.body.appendChild(a);a.click();const url=a.href;a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
  }
  function ensureLegacyPanel(){
    if($('notesExportPanel'))return;const settings=$('settingsOverlay')?.querySelector('.sheet');if(!settings)return;
    const panel=document.createElement('div');panel.id='notesExportPanel';panel.className='notesExportPanel settingsHubSource';panel.innerHTML=`<div class="notesExportTitle">Заметки чтения и медитации</div><div class="notesExportText">Выгрузить сохранённые заметки в один Markdown-файл.</div><button class="button" type="button" id="exportNotesBtn">Выгрузить заметки</button>`;settings.appendChild(panel);$('exportNotesBtn').addEventListener('click',exportNotes);
  }
  window.praviloExportNotes=exportNotes;
  function init(){ensureLegacyPanel();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
