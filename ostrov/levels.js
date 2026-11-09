/* ===== Нива на острова: всяко ниво = 6 рунда от различни активности =====
   diff 1..5 е общата трудност на нивото; page = картинката за оцветяване, която нивото отключва. */
'use strict';
(function(){
const R=(...acts)=>acts.map(a=>({act:a}));
Capy.LEVELS=[
 {diff:1,page:'capy-orange',  rounds:R('read','abc','math','memory','spell','dance')},
 {diff:1,page:'princess',     rounds:R('read','case','abc','odd','math','calm')},
 {diff:2,page:'island',       rounds:R('read','abc','spell','math','memory','dance')},
 {diff:2,page:'squishy',      rounds:R('read','case','abc','math','odd','calm')},
 {diff:2,page:'castle',       rounds:R('spell','abc','read','math','dance','memory')},
 {diff:3,page:'stage',        rounds:R('read','case','abc','math','calm','odd')},
 {diff:3,page:'mermaid',      rounds:R('read','spell','abc','math','memory','dance')},
 {diff:3,page:'unicorn',      rounds:R('read','abc','case','math','odd','calm')},
 {diff:4,page:'turtle',       rounds:R('read','spell','abc','math','dance','memory')},
 {diff:4,page:'dancer',       rounds:R('read','abc','spell','math','calm','odd')},
 {diff:5,page:'icecream',     rounds:R('read','spell','abc','math','memory','dance')},
 {diff:5,page:'princess-capy',rounds:R('read','spell','abc','math','odd','calm')}
];
})();
