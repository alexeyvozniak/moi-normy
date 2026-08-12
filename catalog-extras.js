(()=>{
  'use strict';
  function init(){
    const extra=[
      {id:'prayer_icons_jp',name:'Молитва перед иконами',src:'images/prayer_icons.webp',tags:'молитва · иконы · тишина'},
      {id:'prayer_prostration_jp',name:'Земной поклон',src:'images/prayer_prostration.webp',tags:'молитва · земной поклон'},
      {id:'prayer_bow_jp',name:'Поясной поклон',src:'images/prayer_bow.webp',tags:'молитва · поясной поклон'}
    ];
    for(const item of extra)if(!assets.some(x=>x.src===item.src))assets.push(item);
    renderCatalog();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
