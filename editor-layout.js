(()=>{
  'use strict';
  const $=id=>document.getElementById(id);

  function details(id,title,summary){
    let root=$(id);if(root)return root;
    root=document.createElement('details');root.id=id;root.className='editorSection';
    root.innerHTML=`<summary><span><strong>${title}</strong><small>${summary}</small></span><span class="editorSectionArrow">›</span></summary><div class="editorSectionBody"></div>`;
    return root;
  }

  function fieldOf(id){return $(id)?.closest('.field')||null;}
  function removeEmptyContainer(node){if(node&&node.classList?.contains('two')&&!node.children.length)node.remove();}
  function moveField(id,target){const field=fieldOf(id);if(!field||!target)return;const old=field.parentElement;target.appendChild(field);removeEmptyContainer(old);}

  function build(){
    const sheet=$('editorOverlay')?.querySelector('.sheet');
    const actions=sheet?.querySelector('.sheetActions');
    if(!sheet||!actions||$('editorScheduleSection'))return;

    const quick=fieldOf('eQuick');
    const incrementRow=$('eIncrement')?.closest('.two');
    if(quick&&incrementRow){
      const old=quick.parentElement;
      incrementRow.insertAdjacentElement('afterend',quick);
      removeEmptyContainer(old);
      quick.classList.add('editorPrimaryQuick');
      const label=quick.querySelector('label');if(label)label.textContent='Быстро списать';
    }

    const schedule=details('editorScheduleSection','Расписание','когда начисляется норма');
    const modes=details('editorModesSection','Режим занятия','книга, молитва или медитация');
    const stateSection=details('editorStateSection','Состояние','остаток и пауза');
    const image=details('editorImageSection','Образ','иллюстрация карточки');

    [schedule,modes,stateSection,image].forEach(section=>actions.insertAdjacentElement('beforebegin',section));

    moveField('ePeriod',schedule.querySelector('.editorSectionBody'));
    const interval=$('intervalField');if(interval)schedule.querySelector('.editorSectionBody').appendChild(interval);

    const book=$('bookModeBox');if(book)modes.querySelector('.editorSectionBody').appendChild(book);
    const practice=$('practiceTypeField');if(practice)modes.querySelector('.editorSectionBody').appendChild(practice);
    const feature=$('featureSettingsRow');if(feature)modes.querySelector('.editorSectionBody').appendChild(feature);

    moveField('eDebt',stateSection.querySelector('.editorSectionBody'));
    const debtLabel=fieldOf('eDebt')?.querySelector('label');if(debtLabel)debtLabel.textContent='Скорректировать остаток';
    const pause=$('pauseSwitch')?.closest('.toggleRow');if(pause)stateSection.querySelector('.editorSectionBody').appendChild(pause);

    const picker=$('imagePicker')?.closest('.field');if(picker)image.querySelector('.editorSectionBody').appendChild(picker);
    moveField('eImageUrl',image.querySelector('.editorSectionBody'));
    const urlLabel=fieldOf('eImageUrl')?.querySelector('label');if(urlLabel)urlLabel.textContent='Свой URL изображения';

    window.dispatchEvent(new CustomEvent('pravilo:editor-layout-ready'));
  }

  function revealRelevantSection(){
    const item=typeof editId!=='undefined'&&editId?state.items.find(x=>x.id===editId):null;
    const modes=$('editorModesSection'),stateSection=$('editorStateSection'),image=$('editorImageSection'),schedule=$('editorScheduleSection');
    if(modes)modes.open=!!(item?.readingPlan||item?.practiceType);
    if(schedule)schedule.open=false;
    if(stateSection)stateSection.open=!!item?.paused;
    if(image)image.open=false;
  }

  function init(){
    build();
    window.addEventListener('pravilo:editor-open',()=>requestAnimationFrame(()=>{build();revealRelevantSection();}));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
