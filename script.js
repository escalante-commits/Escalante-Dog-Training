const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuToggle?.addEventListener('click', () => {
  nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
});
document.querySelectorAll('.main-nav a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
document.getElementById('year').textContent = new Date().getFullYear();

// Edit your available times here. Format: YYYY-MM-DD: ['time', 'time']
const availability = {
  '2026-07-06': ['9:00 AM', '11:00 AM', '3:00 PM'],
  '2026-07-08': ['10:00 AM', '1:00 PM', '4:00 PM'],
  '2026-07-11': ['9:00 AM', '12:00 PM'],
  '2026-07-13': ['9:00 AM', '11:00 AM', '3:00 PM'],
  '2026-07-15': ['10:00 AM', '1:00 PM', '4:00 PM'],
  '2026-07-18': ['9:00 AM', '12:00 PM'],
  '2026-07-20': ['9:00 AM', '11:00 AM', '3:00 PM'],
  '2026-07-22': ['10:00 AM', '1:00 PM', '4:00 PM'],
  '2026-07-25': ['9:00 AM', '12:00 PM']
};

const calendarGrid = document.getElementById('calendarGrid');
const calendarTitle = document.getElementById('calendarTitle');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const timeSlots = document.getElementById('timeSlots');
const requestedDate = document.getElementById('requestedDate');
const requestedTime = document.getElementById('requestedTime');
let current = new Date(2026, 6, 1);
let selectedButton = null;
let selectedTimeButton = null;

function formatKey(date){
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function renderCalendar(){
  calendarGrid.innerHTML = '';
  const year = current.getFullYear();
  const month = current.getMonth();
  calendarTitle.textContent = current.toLocaleString('default',{month:'long',year:'numeric'});
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  for(let i=0;i<firstDay;i++) calendarGrid.appendChild(document.createElement('span'));
  for(let day=1;day<=daysInMonth;day++){
    const date = new Date(year, month, day);
    const key = formatKey(date);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day';
    btn.textContent = day;
    if(availability[key]) btn.classList.add('available');
    else btn.disabled = true;
    btn.addEventListener('click',()=>selectDate(key, btn));
    calendarGrid.appendChild(btn);
  }
}
function selectDate(key, btn){
  selectedButton?.classList.remove('selected');
  selectedTimeButton = null;
  btn.classList.add('selected');
  selectedButton = btn;
  requestedDate.value = key;
  requestedTime.value = '';
  selectedDateLabel.textContent = new Date(key + 'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  timeSlots.innerHTML = '';
  availability[key].forEach(time=>{
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'time-slot';
    t.textContent = time;
    t.addEventListener('click',()=>{
      selectedTimeButton?.classList.remove('selected');
      t.classList.add('selected');
      selectedTimeButton = t;
      requestedTime.value = time;
    });
    timeSlots.appendChild(t);
  });
}
document.getElementById('prevMonth')?.addEventListener('click',()=>{current.setMonth(current.getMonth()-1);renderCalendar();});
document.getElementById('nextMonth')?.addEventListener('click',()=>{current.setMonth(current.getMonth()+1);renderCalendar();});
renderCalendar();

const form = document.getElementById('bookingForm');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const subject = encodeURIComponent(`Training Request: ${data.dogName || 'New Dog'} - ${data.service}`);
  const body = encodeURIComponent(`Hi Nicole,\n\nI would like to request a dog training appointment.\n\nRequested date: ${data.requestedDate || 'Not selected'}\nRequested time: ${data.requestedTime || 'Not selected'}\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || ''}\n\nService interested in: ${data.service}\n\nDog name: ${data.dogName || ''}\nDog age: ${data.dogAge || ''}\nBreed: ${data.breed || ''}\nSex: ${data.sex || ''}\nFixed: ${data.fixed || ''}\nBite history or human aggression: ${data.biteHistory}\nDog aggression/reactivity: ${data.reactivity || ''}\n\nProblems I am having:\n${data.problems || ''}\n\nI understand Escalante Dog Training uses balanced training methods, including prong collars, and that dogs with human aggression or bite history are not accepted.\n\nThank you!`);
  window.location.href = `mailto:escalantedogtraining@gmail.com?subject=${subject}&body=${body}`;
});
