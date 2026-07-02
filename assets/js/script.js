const menu=document.querySelector('.menu');const links=document.querySelector('.links');if(menu){menu.addEventListener('click',()=>links.classList.toggle('open'))}

const availability={
  '2026-07-06':['9:00 AM','11:00 AM'],
  '2026-07-08':['10:00 AM','2:00 PM'],
  '2026-07-10':['9:00 AM'],
  '2026-07-11':['8:00 AM','10:00 AM'],
  '2026-07-13':['9:00 AM','12:00 PM'],
  '2026-07-15':['10:00 AM','2:00 PM'],
  '2026-07-17':['9:00 AM'],
  '2026-07-18':['8:00 AM']
};

function prettyDate(key){const [y,m,d]=key.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});}
function buildCalendar(){const cal=document.querySelector('#bookingCalendar');const slots=document.querySelector('#timeSlots');const label=document.querySelector('#selectedDateLabel');const preferred=document.querySelector('#preferred');if(!cal||!slots||!label)return;const month=6;const year=2026;const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];cal.innerHTML=dayNames.map(d=>`<div class="cal-dayname">${d}</div>`).join('');const first=new Date(year,month,1);const last=new Date(year,month+1,0).getDate();for(let i=0;i<first.getDay();i++){cal.insertAdjacentHTML('beforeend','<button class="cal-date disabled" type="button" disabled></button>')}for(let day=1;day<=last;day++){const key=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;const has=availability[key];cal.insertAdjacentHTML('beforeend',`<button class="cal-date ${has?'':'disabled'}" type="button" ${has?'':'disabled'} data-date="${key}">${day}</button>`)}cal.querySelectorAll('.cal-date:not(.disabled)').forEach(btn=>{btn.addEventListener('click',()=>{cal.querySelectorAll('.cal-date').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const date=btn.dataset.date;label.textContent=prettyDate(date);slots.innerHTML=availability[date].map(t=>`<button class="slot" type="button" data-time="${prettyDate(date)} at ${t}">${t}</button>`).join('');slots.querySelectorAll('.slot').forEach(slot=>slot.addEventListener('click',()=>{slots.querySelectorAll('.slot').forEach(s=>s.classList.remove('active'));slot.classList.add('active');if(preferred)preferred.value=slot.dataset.time;}));});});}
buildCalendar();

document.querySelectorAll('.slot').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.slot').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const preferred=document.querySelector('#preferred');if(preferred) preferred.value=btn.dataset.time||btn.textContent.trim();}));
const form=document.querySelector('#bookingForm');if(form){form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);const subject=encodeURIComponent('Training Request - Escalante Dog Training');let body='New training request:%0D%0A%0D%0A';for(const [k,v] of d.entries()){body+=`${k}: ${v}%0D%0A`;}window.location.href=`mailto:escalantedogtraining@gmail.com?subject=${subject}&body=${body}`;});}
