/* Временна тестова страница (ще се изтрие): голямо цвете. */
'use strict';
(function(){
let pet='';for(let k=0;k<8;k++)pet+=`<ellipse class="r" data-r="petal${k+1}" cx="400" cy="145" rx="36" ry="62" transform="rotate(${k*45} 400 230)"/>`;
let rays='';for(let k=0;k<8;k++){const a=k*Math.PI/4;rays+=`<path class="ln" fill="none" d="M${(130+Math.cos(a)*70).toFixed(0)} ${(110+Math.sin(a)*70).toFixed(0)}L${(130+Math.cos(a)*92).toFixed(0)} ${(110+Math.sin(a)*92).toFixed(0)}"/>`;}
Capy.registerPages([{id:'test-flower',title:'Цвете',svg:`<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><g fill="#fff" stroke="#3B2A4A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<rect class="r" data-r="bg" x="0" y="0" width="800" height="600" stroke="none"/>
<circle class="r" data-r="sun" cx="130" cy="110" r="52"/>${rays}
<path class="r" data-r="cloud" d="M560 120Q550 80 595 78Q615 45 655 65Q700 55 710 100Q745 110 730 140L575 142Q545 145 560 120Z"/>
<path class="r" data-r="hill" d="M0 470Q200 400 400 450T800 440V600H0Z"/>
<path class="r" data-r="stem" d="M388 300L412 300L418 530L382 530Z"/>
<path class="r" data-r="leaf1" d="M386 450Q300 450 270 380Q350 380 386 430Z"/>
<path class="r" data-r="leaf2" d="M414 400Q500 400 530 330Q450 330 414 380Z"/>
${pet}
<circle class="r" data-r="center" cx="400" cy="230" r="52"/>
<circle class="ln" cx="382" cy="222" r="7" fill="#3B2A4A" stroke="none"/><circle class="ln" cx="418" cy="222" r="7" fill="#3B2A4A" stroke="none"/>
<path class="ln" fill="none" d="M380 244Q400 266 420 244"/>
</g></svg>`}]);
})();
