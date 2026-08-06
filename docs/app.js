/* legacy shim — loads desk.js */
(function(){
  var s=document.createElement('script');
  s.src='desk.js?v=20260806s';
  s.onerror=function(){console.error('desk.js load failed');};
  document.head.appendChild(s);
})();

