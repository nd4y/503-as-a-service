(function(){
  'use strict';
  var body=document.body;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)');
  var art=document.querySelector('.hero-art');
  var cta=document.querySelector('.cta');
  var toggle=document.querySelector('#motion-toggle');
  var paused=false;
  try{paused=localStorage.getItem('saas503_motion')==='paused'}catch(e){}
  var frame=0,targetX=0,targetY=0,currentX=0,currentY=0,artVisible=true;
  var viewportHeight=window.innerHeight,artRect,ctaRect,pageHeight;
  var lastTick=0;
  function enabled(){return !paused&&!reduce.matches&&!document.hidden}
  function measure(){viewportHeight=window.innerHeight;artRect=art.getBoundingClientRect();ctaRect=cta.getBoundingClientRect();pageHeight=document.documentElement.scrollHeight-viewportHeight}
  function resetScene(){targetX=targetY=currentX=currentY=0;['--scene-rx','--scene-ry','--back-x','--back-y','--object-x','--object-y','--front-x','--front-y','--scroll-drift'].forEach(function(name){art.style.removeProperty(name)});cta.style.removeProperty('--cta-drift')}
  function render(now){
    frame=0;
    if(!enabled()||!artVisible){lastTick=0;return}
    var dt=lastTick?Math.min(50,now-lastTick):16;lastTick=now;
    var blend=1-Math.exp(-dt/140);
    currentX+=(targetX-currentX)*blend;currentY+=(targetY-currentY)*blend;
    art.style.setProperty('--scene-rx',(-currentY*3).toFixed(3)+'deg');
    art.style.setProperty('--scene-ry',(currentX*4).toFixed(3)+'deg');
    [['back',-8],['object',10],['front',18]].forEach(function(layer){art.style.setProperty('--'+layer[0]+'-x',(currentX*layer[1]).toFixed(2)+'px');art.style.setProperty('--'+layer[0]+'-y',(currentY*layer[1]).toFixed(2)+'px')});
    if(Math.abs(targetX-currentX)+Math.abs(targetY-currentY)>.001){frame=requestAnimationFrame(render)}else{lastTick=0}
  }
  function requestRender(){if(!frame&&enabled()&&artVisible)frame=requestAnimationFrame(render)}
  art.addEventListener('pointermove',function(e){if(!enabled()||!fine.matches||e.pointerType==='touch')return;targetX=Math.max(-.5,Math.min(.5,(e.clientX-artRect.left)/artRect.width-.5));targetY=Math.max(-.5,Math.min(.5,(e.clientY-artRect.top)/artRect.height-.5));requestRender()},{passive:true});
  art.addEventListener('pointerleave',function(){targetX=targetY=0;requestRender()});
  var scrollFrame=0;
  function scrollState(){scrollFrame=0;measure();body.classList.toggle('has-scrolled',window.scrollY>20);document.documentElement.style.setProperty('--page-progress',pageHeight>0?Math.min(1,window.scrollY/pageHeight):0);if(enabled()){art.style.setProperty('--scroll-drift',(-Math.min(1,window.scrollY/viewportHeight)*24).toFixed(2)+'px');var progress=(viewportHeight/2-ctaRect.top-ctaRect.height/2)/viewportHeight;cta.style.setProperty('--cta-drift',(Math.max(-1,Math.min(1,progress))*18).toFixed(2)+'px')}}
  function queueScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollState)}
  window.addEventListener('scroll',queueScroll,{passive:true});window.addEventListener('resize',queueScroll,{passive:true});
  if('ResizeObserver' in window){new ResizeObserver(queueScroll).observe(document.body)}
  document.fonts.ready.then(queueScroll);
  // Choreograph groups independently; the existing text remains the semantic source.
  [['.metrics .metric',100],['.steps .step',80],['.plans .plan',110],['.faq-grid details',60]].forEach(function(group){document.querySelectorAll(group[0]).forEach(function(el,i){el.classList.add('motion-item');el.style.setProperty('--reveal-delay',(i*group[1])+'ms')})});
  document.querySelectorAll('.bars .bar').forEach(function(bar,i){bar.style.setProperty('--bar-order',i%90)});
  document.querySelectorAll('.bars').forEach(function(bars){bars.addEventListener('animationend',function(e){if(e.target===bars.lastElementChild)bars.classList.add('drawn')})});
  var targets=document.querySelectorAll('.reveal,.motion-item,.bars');
  if('IntersectionObserver' in window){
    body.classList.add('js-on');
    var reveal=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('visible');reveal.unobserve(entry.target)}})},{threshold:.08});
    targets.forEach(function(el){reveal.observe(el)});
    var activity=new IntersectionObserver(function(entries){entries.forEach(function(entry){entry.target.classList.toggle('is-offscreen',!entry.isIntersecting);if(entry.target===art){artVisible=entry.isIntersecting;if(!artVisible){if(frame)cancelAnimationFrame(frame);frame=0;lastTick=0}else{measure();requestRender()}}})},{rootMargin:'100px'});
    document.querySelectorAll('.hero-atmosphere,.hero-art,.marquee,.dark,.cta').forEach(function(el){activity.observe(el)});
  }else{targets.forEach(function(el){el.classList.add('visible')})}
  document.querySelectorAll('.plan,.terminal,.calculator').forEach(function(surface){surface.addEventListener('pointermove',function(e){if(!enabled()||!fine.matches)return;var rect=surface.getBoundingClientRect();surface.style.setProperty('--light-x',(e.clientX-rect.left)+'px');surface.style.setProperty('--light-y',(e.clientY-rect.top)+'px')},{passive:true});surface.addEventListener('pointerleave',function(){surface.style.removeProperty('--light-x');surface.style.removeProperty('--light-y')})});
  document.querySelectorAll('input[type=range]').forEach(function(input){function fill(){input.style.setProperty('--range-fill',((Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min))*100)+'%')}input.addEventListener('input',fill);fill()});
  var terminal=document.querySelector('.terminal');
  new MutationObserver(function(){var busy=document.querySelector('#send').disabled;terminal.classList.toggle('is-requesting',busy);if(!busy&&enabled()){terminal.classList.remove('response-arrived');requestAnimationFrame(function(){terminal.classList.add('response-arrived')})}}).observe(document.querySelector('#send'),{attributes:true,attributeFilter:['disabled']});
  document.querySelectorAll('#budget,#failures').forEach(function(input){input.addEventListener('input',function(){var output=document.querySelector('#saving');if(enabled()&&output.animate){output.getAnimations().forEach(function(a){a.cancel()});output.animate([{opacity:.55,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.22,1,.36,1)'})}})});
  function applyPreference(){body.classList.toggle('motion-paused',paused||reduce.matches);body.classList.toggle('motion-suspended',document.hidden);toggle.textContent=paused||reduce.matches?'Анимации: выкл.':'Анимации: вкл.';toggle.setAttribute('aria-pressed',String(paused||reduce.matches));toggle.disabled=reduce.matches;toggle.title=reduce.matches?'Сокращённое движение включено в системе':'Приостановить или включить движение';if(!enabled()){var output=document.querySelector('#saving');if(output.getAnimations)output.getAnimations().forEach(function(a){a.cancel()});if(frame)cancelAnimationFrame(frame);frame=0;lastTick=0;resetScene()}else{measure();queueScroll();requestRender()}}
  toggle.addEventListener('click',function(){paused=!paused;try{localStorage.setItem('saas503_motion',paused?'paused':'active')}catch(e){}applyPreference()});
  reduce.addEventListener('change',applyPreference);fine.addEventListener('change',function(){targetX=targetY=0;requestRender()});document.addEventListener('visibilitychange',applyPreference);
  measure();applyPreference();scrollState();
})();
