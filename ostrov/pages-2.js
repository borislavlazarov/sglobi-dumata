'use strict';
// Страници за оцветяване, комплект 2: замък, сцена, русалка, еднорог.
// Формат: всяка оцветяема област е затворена фигура с class="r" и уникално data-r;
// детайлите (очи, усмивки, гънки) са class="ln" и не се оцветяват.
Capy.registerPages([
{id:'castle', title:'Замък', svg:`<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
<g fill="#fff" stroke="#3B2A4A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<rect class="r" data-r="bg" x="0" y="0" width="800" height="600" stroke="none"/>
<circle class="r" data-r="sun" cx="738" cy="70" r="44"/>
<path class="ln" fill="none" d="M697 111l-10 10M738 126v14M779 111l10 10M697 29l-10-10M682 70h-12"/>
<path class="r" data-r="cloud-left" d="M32 128Q8 128 8 106Q8 84 34 84Q40 58 68 58Q94 58 104 78Q134 70 142 98Q166 100 164 118Q162 128 142 128Z"/>
<path class="r" data-r="cloud-right" d="M488 140Q468 140 468 122Q468 104 490 104Q494 84 518 84Q540 84 548 100Q572 94 578 116Q596 118 594 132Q592 140 576 140Z"/>
<path class="r" data-r="hill-left" d="M-10 520V372Q110 280 290 410V520Z"/>
<path class="r" data-r="hill-right" d="M520 520V410Q680 290 810 366V520Z"/>
<path class="r" data-r="ground" d="M-10 470Q200 448 400 462T810 470V610H-10Z"/>
<path class="r" data-r="path" d="M348 488C350 530 300 548 262 610H572C540 560 456 532 452 488Z"/>
<path class="ln" fill="none" d="M60 540q8-16 16 0M96 548q8-16 16 0M676 560q8-16 16 0M716 548q8-16 16 0M210 572q8-16 16 0M600 520q8-16 16 0"/>
<path class="r" data-r="keep-body" d="M330 165H470V350H330Z"/>
<path class="ln" fill="none" d="M342 200h22M436 200h22M446 262h14M340 262h14M436 232h22"/>
<path class="r" data-r="keep-window" d="M374 290v-42a26 26 0 0 1 52 0v42z"/>
<path class="ln" fill="none" d="M400 222v68M374 256h52"/>
<path class="ln" fill="none" d="M400 62V14"/>
<path class="r" data-r="keep-flag" d="M400 14Q432 26 464 20Q452 38 464 58Q432 62 400 54Z"/>
<path class="r" data-r="keep-roof" d="M308 172L400 60L492 172Q400 194 308 172Z"/>
<path class="ln" fill="none" d="M352 150q16 12 32 0q16 12 32 0q16 12 32 0M376 112q12 10 24 0q12 10 24 0"/>
<path class="r" data-r="wall" d="M230 492V308h34v22h34v-22h34v22h34v-22h34v22h34v-22h34v22h34v-22h34v22h34V492Z"/>
<path class="ln" fill="none" d="M262 372h24M276 386h24M500 372h24M514 386h24M300 470h24M476 470h24"/>
<path class="r" data-r="gate" d="M345 490V412a55 55 0 0 1 110 0V490Z"/>
<path class="ln" fill="none" d="M400 357V490M362 420h76M362 456h76"/>
<circle class="ln" cx="388" cy="438" r="4" fill="#3B2A4A"/>
<circle class="ln" cx="412" cy="438" r="4" fill="#3B2A4A"/>
<path class="r" data-r="wall-window-left" d="M267 452v-36a23 23 0 0 1 46 0v36z"/>
<path class="r" data-r="wall-window-right" d="M487 452v-36a23 23 0 0 1 46 0v36z"/>
<path class="r" data-r="tower-left-body" d="M130 245H250V492H130Z"/>
<path class="ln" fill="none" d="M142 290h24M214 300h24M142 420h24M156 434h24M212 440h24M144 468h20"/>
<path class="r" data-r="tower-left-window" d="M165 392v-42a25 25 0 0 1 50 0v42z"/>
<path class="ln" fill="none" d="M190 325v67M165 358h50"/>
<path class="ln" fill="none" d="M190 120V70"/>
<path class="r" data-r="tower-left-flag" d="M190 70Q222 82 254 76Q242 94 254 114Q222 118 190 110Z"/>
<path class="r" data-r="tower-left-roof" d="M108 252L190 118L272 252Q190 276 108 252Z"/>
<path class="ln" fill="none" d="M146 228q15 12 30 0q15 12 30 0q15 12 30 0M168 184q11 10 22 0q11 10 22 0"/>
<path class="r" data-r="tower-right-body" d="M550 245H670V492H550Z"/>
<path class="ln" fill="none" d="M562 300h24M634 290h24M634 420h24M620 434h24M564 440h24M636 468h20"/>
<path class="r" data-r="tower-right-window" d="M585 392v-42a25 25 0 0 1 50 0v42z"/>
<path class="ln" fill="none" d="M610 325v67M585 358h50"/>
<path class="ln" fill="none" d="M610 120V70"/>
<path class="r" data-r="tower-right-flag" d="M610 70Q642 82 674 76Q662 94 674 114Q642 118 610 110Z"/>
<path class="r" data-r="tower-right-roof" d="M528 252L610 118L692 252Q610 276 528 252Z"/>
<path class="ln" fill="none" d="M566 228q15 12 30 0q15 12 30 0q15 12 30 0M588 184q11 10 22 0q11 10 22 0"/>
<path class="r" data-r="bush-left" d="M40 516Q18 516 20 492Q22 470 46 470Q54 444 82 448Q110 444 116 472Q142 472 142 496Q142 516 120 516Z"/>
<path class="r" data-r="bush-right" d="M680 516Q658 516 660 492Q662 470 686 470Q694 444 722 448Q750 444 756 472Q782 472 782 496Q782 516 760 516Z"/>
</g></svg>`},

{id:'stage', title:'Капи пее', svg:`<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
<g fill="#fff" stroke="#3B2A4A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<rect class="r" data-r="bg" x="0" y="0" width="800" height="600" stroke="none"/>
<path class="r" data-r="beam-left" d="M182 128L232 108L400 470H130Z"/>
<path class="r" data-r="beam-right" d="M618 128L568 108L400 470H670Z"/>
<path class="r" data-r="floor" d="M-10 458H810V610H-10Z"/>
<path class="ln" fill="none" d="M-10 540H810M120 540v60M290 540v60M510 540v60M680 540v60"/>
<path class="r" data-r="curtain-left" d="M-10 -10H108C88 150 112 300 82 474Q40 492 -10 482Z"/>
<path class="ln" fill="none" d="M40 70C30 200 50 330 30 470M76 80C64 200 82 320 62 462"/>
<path class="r" data-r="curtain-right" d="M810 -10H692C712 150 688 300 718 474Q760 492 810 482Z"/>
<path class="ln" fill="none" d="M760 70C770 200 750 330 770 470M724 80C736 200 718 320 738 462"/>
<path class="r" data-r="lamp-left" transform="translate(203 112) rotate(-25)" d="M-20 -30H20L34 22Q0 38 -34 22Z"/>
<path class="r" data-r="lamp-right" transform="translate(597 112) rotate(25)" d="M-20 -30H20L34 22Q0 38 -34 22Z"/>
<path class="r" data-r="curtain-top" d="M-10 -10H810V52Q755 104 700 52Q650 104 600 52Q550 104 500 52Q450 104 400 52Q350 104 300 52Q250 104 200 52Q150 104 100 52Q45 104 -10 52Z"/>
<path class="r" data-r="speaker-box" d="M588 392H702V566H588Z"/>
<circle class="r" data-r="speaker-big" cx="645" cy="508" r="38"/>
<circle class="ln" cx="645" cy="508" r="12" fill="#3B2A4A"/>
<circle class="r" data-r="speaker-small" cx="645" cy="432" r="24"/>
<circle class="ln" cx="645" cy="432" r="6" fill="#3B2A4A"/>
<polygon class="r" data-r="star-1" transform="translate(150 300)" points="0,-40 10.6,-14.6 38,-12.4 17.1,5.6 23.5,32.4 0,18 -23.5,32.4 -17.1,5.6 -38,-12.4 -10.6,-14.6"/>
<polygon class="r" data-r="star-2" transform="translate(590 205) rotate(12) scale(.85)" points="0,-40 10.6,-14.6 38,-12.4 17.1,5.6 23.5,32.4 0,18 -23.5,32.4 -17.1,5.6 -38,-12.4 -10.6,-14.6"/>
<polygon class="r" data-r="star-3" transform="translate(178 408) rotate(-10) scale(.9)" points="0,-40 10.6,-14.6 38,-12.4 17.1,5.6 23.5,32.4 0,18 -23.5,32.4 -17.1,5.6 -38,-12.4 -10.6,-14.6"/>
<path class="r" data-r="note-1" transform="translate(120 150)" d="M32 8L44 8C48 28 70 30 66 58C60 44 52 40 44 38L44 78C44 92 30 98 16 96C4 94 -2 84 2 74C6 64 20 60 32 66Z"/>
<path class="r" data-r="note-2" transform="translate(600 250)" d="M30 20L100 6L100 70C100 84 88 90 76 88C64 86 58 76 62 68C66 58 80 56 88 60L88 32L42 41L42 84C42 98 28 104 16 102C4 100 -2 90 2 82C6 72 20 70 30 74Z"/>
<g transform="translate(0 12)">
<ellipse class="r" data-r="foot-left" cx="352" cy="524" rx="40" ry="24"/>
<ellipse class="r" data-r="foot-right" cx="448" cy="524" rx="40" ry="24"/>
<path class="r" data-r="arm-left" d="M306 352C276 332 250 310 232 290C212 272 186 298 204 320C230 350 264 388 306 404Z"/>
<ellipse class="r" data-r="body" cx="400" cy="420" rx="112" ry="106"/>
<path class="r" data-r="skirt" d="M296 428Q400 398 504 428L542 482Q522 498 502 484Q482 502 461 488Q441 506 420 490Q400 508 380 490Q359 506 339 488Q318 502 298 484Q278 498 258 482Z"/>
<path class="ln" fill="none" d="M330 440l-12 30M370 432l-6 36M430 432l6 36M470 440l12 30"/>
<g transform="translate(392 250) scale(1.12)">
<path class="r" data-r="head" d="M-104 -8 C-106 -56 -76 -80 -34 -80 L56 -76 C98 -74 120 -52 120 -14 L120 18 C120 50 100 68 68 68 L-44 72 C-84 72 -102 44 -104 -8 Z"/>
<ellipse class="r" data-r="ear" cx="-76" cy="-62" rx="22" ry="25" transform="rotate(-25 -76 -62)"/>
<path class="ln" fill="none" d="M-85 -56 Q-82 -76 -67 -72"/>
<path class="r" data-r="snout" d="M70 -52 C100 -54 124 -40 124 -12 L124 20 C124 50 102 68 70 68 C46 68 34 50 34 22 L34 -14 C34 -38 48 -52 70 -52 Z"/>
<ellipse class="ln" cx="108" cy="-28" rx="4.5" ry="6.5" fill="#3B2A4A" stroke="none"/><ellipse class="ln" cx="91" cy="-32" rx="4.5" ry="6.5" fill="#3B2A4A" stroke="none"/>
<path class="ln" fill="#3B2A4A" d="M66 28 Q90 34 112 22 Q112 54 90 56 Q70 54 66 28 Z"/>
<circle class="ln" cx="14" cy="-34" r="11" fill="#3B2A4A" stroke="none"/><circle class="ln" cx="17.6" cy="-38" r="3.7" fill="#fff" stroke="none"/>
<path class="r" data-r="headphones-band" d="M-58 -24 C-62 -58 -56 -86 -44 -100 L-12 -94 C-22 -76 -24 -52 -20 -24 Z"/>
<ellipse class="r" data-r="headphones-cup" cx="-39" cy="2" rx="28" ry="38"/>
<ellipse class="ln" cx="-39" cy="2" rx="13" ry="21" fill="none"/>
<circle class="r" data-r="orange" cx="32" cy="-102" r="25"/>
<path class="ln" fill="none" d="M32 -127v-6M32 -130Q44 -144 58 -136Q48 -124 32 -130Z"/>
</g>
<path class="r" data-r="mic" transform="translate(556 318) rotate(8)" d="M-9 24A26 26 0 1 1 9 24L8 86Q0 93 -8 86Z"/>
<path class="ln" fill="none" transform="translate(556 318) rotate(8)" d="M-24 -2Q0 8 24 -2"/>
<path class="r" data-r="arm-right" d="M508 384C536 362 574 374 570 406C566 438 534 444 510 434Z"/>
</g>
</g></svg>`},

{id:'mermaid', title:'Русалка', svg:`<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
<g fill="#fff" stroke="#3B2A4A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<rect class="r" data-r="bg" x="0" y="0" width="800" height="600" stroke="none"/>
<path class="r" data-r="sand" d="M-10 524Q100 498 200 516T400 522T600 512T810 522V610H-10Z"/>
<path class="r" data-r="seaweed-left" d="M40 540C10 470 72 430 36 360C22 322 50 290 60 268C76 310 102 340 82 400C68 450 112 480 94 540Z"/>
<path class="r" data-r="seaweed-small" d="M98 545C84 500 128 470 108 418C130 440 156 480 142 545Z"/>
<path class="r" data-r="seaweed-right" d="M716 540C686 480 746 440 712 370C698 335 726 300 738 282C752 320 780 350 760 410C746 455 788 490 768 540Z"/>
<path class="r" data-r="rock" d="M150 600C140 520 170 452 240 432C300 414 420 422 480 452C540 482 560 540 560 600Z"/>
<path class="ln" fill="none" d="M420 440q20 4 30 22M190 470q-14 14 -12 34M470 560q16 6 34 0M40 572h14M300 580h14M580 560h14M740 574h14"/>
<path class="r" data-r="shell" d="M622 572Q610 520 662 510Q714 520 702 572Q682 588 662 582Q642 588 622 572Z"/>
<path class="ln" fill="none" d="M662 580V524M644 578L636 532M680 578L688 532"/>
<path class="r" data-r="hair-back" d="M300 76C205 68 178 150 192 225C200 270 165 290 168 335C170 365 150 385 158 420C166 452 215 462 240 432C256 412 246 372 262 330L345 325C350 352 362 388 396 384C436 378 440 340 424 310C408 280 420 262 412 232C404 150 395 82 300 76Z"/>
<path class="r" data-r="fin-left" d="M652 342C608 312 568 262 580 204C626 214 652 256 656 300Z"/>
<path class="r" data-r="fin-right" d="M652 342C656 290 690 220 742 210C748 266 706 318 652 342Z"/>
<path class="ln" fill="none" d="M600 240Q624 270 640 310M722 240Q694 270 672 312"/>
<path class="r" data-r="arm-left" d="M272 258C240 270 220 310 205 355C198 378 228 388 238 366C248 335 262 310 280 295Z"/>
<path class="r" data-r="torso" d="M270 250C262 290 262 330 268 372L352 372C356 330 352 290 338 250Z"/>
<path class="r" data-r="tail" d="M262 362C250 440 290 520 400 545C500 565 620 540 665 420L675 335L630 328C622 400 590 452 520 462C440 472 365 440 356 362Z"/>
<path class="ln" fill="none" d="M300 430q14 16 28 0q14 16 28 0M316 462q14 16 28 0q14 16 28 0q14 16 28 0M356 496q14 16 28 0q14 16 28 0q14 16 28 0M452 510q14 16 28 0q14 16 28 0q14 16 28 0M560 484q14 16 28 0q14 16 28 0M612 420q13 14 26 0"/>
<path class="r" data-r="tail-band" d="M258 352H360L362 392Q350 408 337 394Q324 410 310 394Q296 410 283 394Q270 408 258 392Z"/>
<path class="r" data-r="top" d="M262 292Q262 270 285 272Q300 262 310 275Q322 262 338 272Q358 272 356 295Q352 318 330 318Q318 320 309 310Q298 320 286 318Q264 316 262 292Z"/>
<path class="ln" fill="none" d="M286 312V282M332 312V282"/>
<path class="r" data-r="arm-right" d="M340 262C370 250 400 225 420 195C432 178 458 190 450 212C435 250 400 290 352 300Z"/>
<ellipse class="r" data-r="head" cx="300" cy="175" rx="84" ry="80"/>
<circle class="ln" cx="266" cy="196" r="8" fill="#3B2A4A"/>
<circle class="ln" cx="338" cy="196" r="8" fill="#3B2A4A"/>
<path class="ln" fill="none" d="M288 220Q302 234 316 220"/>
<path class="r" data-r="hair-front" d="M218 172C212 110 258 82 305 86C356 90 390 122 384 178C360 166 345 142 336 120C320 152 270 172 218 172Z"/>
<path class="r" data-r="fish-tail" d="M672 108L730 66Q716 108 730 150Z"/>
<path class="r" data-r="fish-body" d="M540 108C570 62 650 62 690 108C650 154 570 154 540 108Z"/>
<circle class="ln" cx="572" cy="100" r="6" fill="#3B2A4A"/>
<path class="ln" fill="none" d="M550 118Q558 124 566 118M606 80Q622 108 606 136M640 92Q650 108 640 124"/>
<circle class="r" data-r="bubble-1" cx="478" cy="92" r="30"/>
<circle class="r" data-r="bubble-2" cx="120" cy="96" r="34"/>
<circle class="r" data-r="bubble-3" cx="110" cy="210" r="25"/>
<circle class="r" data-r="bubble-4" cx="520" cy="228" r="27"/>
<path class="ln" fill="none" d="M462 82a18 18 0 0 1 12-10M102 84a20 20 0 0 1 14-12M98 204a14 14 0 0 1 9-9M507 221a15 15 0 0 1 10-10"/>
<polygon class="r" data-r="starfish" transform="translate(208 515) rotate(14)" points="0,-44 12,-17 42,-13.6 20,6.5 26,36 0,22 -26,36 -20,6.5 -42,-13.6 -12,-17"/>
<circle class="ln" cx="208" cy="515" r="3" fill="#3B2A4A"/>
</g></svg>`},

{id:'unicorn', title:'Еднорог', svg:`<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
<g fill="#fff" stroke="#3B2A4A" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
<rect class="r" data-r="bg" x="0" y="0" width="800" height="600" stroke="none"/>
<path class="r" data-r="rainbow-1" d="M20 520A380 380 0 0 1 780 520H735A335 335 0 0 0 65 520Z"/>
<path class="r" data-r="rainbow-2" d="M65 520A335 335 0 0 1 735 520H690A290 290 0 0 0 110 520Z"/>
<path class="r" data-r="rainbow-3" d="M110 520A290 290 0 0 1 690 520H645A245 245 0 0 0 155 520Z"/>
<path class="r" data-r="rainbow-4" d="M155 520A245 245 0 0 1 645 520H600A200 200 0 0 0 200 520Z"/>
<path class="r" data-r="grass" d="M-10 532Q400 486 810 532V610H-10Z"/>
<path class="r" data-r="cloud-left" transform="translate(-24 452)" d="M26 92Q0 92 0 64Q0 38 30 38Q36 6 72 6Q102 6 114 30Q150 22 160 56Q188 58 186 80Q184 92 160 92Z"/>
<path class="r" data-r="cloud-right" transform="translate(644 452)" d="M26 92Q0 92 0 64Q0 38 30 38Q36 6 72 6Q102 6 114 30Q150 22 160 56Q188 58 186 80Q184 92 160 92Z"/>
<path class="r" data-r="cloud-top" d="M372 96Q350 96 350 76Q350 56 374 56Q378 34 404 34Q428 34 436 52Q462 46 468 70Q488 72 486 88Q484 96 466 96Z"/>
<polygon class="r" data-r="star-1" transform="translate(76 80) rotate(-8)" points="0,-44 11.7,-16 41.8,-13.6 18.8,6.2 25.9,35.6 0,19.8 -25.9,35.6 -18.8,6.2 -41.8,-13.6 -11.7,-16"/>
<polygon class="r" data-r="star-2" transform="translate(182 130) rotate(10)" points="0,-36 9.5,-13 34,-11 15.4,5 21,29 0,16 -21,29 -15.4,5 -34,-11 -9.5,-13"/>
<polygon class="r" data-r="star-3" transform="translate(690 100) rotate(8)" points="0,-44 11.7,-16 41.8,-13.6 18.8,6.2 25.9,35.6 0,19.8 -25.9,35.6 -18.8,6.2 -41.8,-13.6 -11.7,-16"/>
<path class="ln" fill="none" d="M235 600V560M614 600V560"/>
<path class="r" data-r="flower-1" transform="translate(235 548)" d="M-17.6 -24.3A19 19 0 1 1 17.6 -24.3A19 19 0 1 1 28.5 9.3A19 19 0 1 1 0 30A19 19 0 1 1 -28.5 9.3A19 19 0 1 1 -17.6 -24.3Z"/>
<circle class="r" data-r="flower-1-centre" cx="235" cy="548" r="23"/>
<path class="r" data-r="flower-2" transform="translate(614 556)" d="M-17.6 -24.3A19 19 0 1 1 17.6 -24.3A19 19 0 1 1 28.5 9.3A19 19 0 1 1 0 30A19 19 0 1 1 -28.5 9.3A19 19 0 1 1 -17.6 -24.3Z"/>
<circle class="r" data-r="flower-2-centre" cx="614" cy="556" r="23"/>
<path class="r" data-r="tail-1" d="M555 370C600 330 660 340 680 390C693 425 680 455 698 480C660 482 640 458 640 425C640 400 610 385 560 400Z"/>
<path class="r" data-r="tail-2" d="M555 385C600 375 640 395 640 435C640 460 650 484 670 500C630 506 600 485 598 452C596 430 585 415 558 412Z"/>
<path class="r" data-r="tail-3" d="M552 400C585 405 600 428 598 455C596 480 610 500 628 512C590 520 560 502 556 470Z"/>
<rect class="r" data-r="leg-back-far" x="500" y="440" width="54" height="108" rx="22"/>
<rect class="r" data-r="leg-front-far" x="318" y="440" width="54" height="108" rx="22"/>
<ellipse class="r" data-r="body" cx="432" cy="400" rx="136" ry="100"/>
<rect class="r" data-r="leg-back-near" x="456" y="450" width="54" height="104" rx="22"/>
<rect class="r" data-r="leg-front-near" x="362" y="450" width="54" height="104" rx="22"/>
<path class="ln" fill="none" d="M320 524h50M502 524h50M458 530h50M364 530h50"/>
<path class="r" data-r="mane-1" d="M330 185C400 150 490 195 482 265C478 300 500 325 520 332C478 345 440 320 438 280C436 240 400 225 360 235Z"/>
<path class="r" data-r="mane-2" d="M350 215C400 205 442 235 438 285C435 315 452 338 472 346C432 358 398 335 396 300C394 270 385 255 365 255Z"/>
<path class="r" data-r="mane-3" d="M360 250C395 250 402 280 398 305C395 328 410 348 428 356C392 366 362 345 360 315Z"/>
<path class="r" data-r="horn" d="M250 198L238 80L300 188Z"/>
<path class="ln" fill="none" d="M243 122l22 4M246 152l34 2M249 178l44-4"/>
<path class="r" data-r="ear" d="M316 204C312 166 334 140 352 134C366 160 364 192 348 212Z"/>
<path class="r" data-r="head" d="M250 190C310 170 380 210 380 280C380 340 330 365 270 360C230 372 180 360 172 320C165 285 190 265 205 250C210 220 225 198 250 190Z"/>
<ellipse class="r" data-r="muzzle" cx="218" cy="318" rx="50" ry="40"/>
<circle class="ln" cx="198" cy="306" r="4" fill="#3B2A4A"/>
<circle class="ln" cx="222" cy="302" r="4" fill="#3B2A4A"/>
<path class="ln" fill="none" d="M200 330Q214 342 230 332"/>
<circle class="ln" cx="296" cy="270" r="11" fill="#3B2A4A"/>
<path class="ln" fill="none" d="M306 258l10-8M310 268l12-2"/>
<path class="r" data-r="forelock" d="M312 180C280 186 250 210 244 248C272 244 306 228 332 196Z"/>
</g></svg>`}
]);
