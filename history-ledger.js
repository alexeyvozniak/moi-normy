(()=>{
  'use strict';

  function findEntry(id){return (state.history||[]).find(entry=>String(entry.id)===String(id))||null;}
  function findItem(entry){return entry?.itemId?(state.items||[]).find(item=>String(item.id)===String(entry.itemId))||null:null;}

  function restoreEntry(entry){
    if(!entry)return null;
    const amount=Math.max(0,Number(entry.amount)||0);
    const item=findItem(entry);
    if(item&&amount>0){
      item.debt=window.PraviloDomain?.restoredDebt
        ?window.PraviloDomain.restoredDebt(item.debt,amount)
        :Math.max(0,Number(item.debt)||0)+amount;
    }
    state.history=(state.history||[]).filter(row=>String(row.id)!==String(entry.id));
    return {entry,item,amount};
  }

  function removeHistory(id,{renderUI=true}={}){
    const entry=findEntry(id);if(!entry)return null;
    const result=restoreEntry(entry);
    save();
    if(renderUI)render();
    window.dispatchEvent(new CustomEvent('pravilo:history-restored',{detail:{historyId:entry.id,itemId:entry.itemId||'',amount:result.amount}}));
    return result;
  }

  window.PraviloHistoryLedger=Object.freeze({findEntry,restoreEntry,removeHistory});
})();
