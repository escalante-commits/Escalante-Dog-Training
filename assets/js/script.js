
const menu = document.querySelector('.menu');
const links = document.querySelector('.links');

if (menu && links) {
  menu.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(isOpen));
  });
}

function keyFor(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function prettyDate(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Block the current week and all dates less than 7 days from today.
function earliestBookingDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAhead = new Date(today);
  sevenDaysAhead.setDate(today.getDate() + 7);

  const nextMonday = new Date(today);
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
  nextMonday.setDate(today.getDate() + daysUntilMonday);

  return sevenDaysAhead > nextMonday ? sevenDaysAhead : nextMonday;
}

// Appointment start times.
function getAvailableTimes(date) {
  const day = date.getDay();

  if (day === 0 || day === 6) {
    return ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
  }

  return ['7:00 AM', '8:00 AM', '9:00 AM', '5:00 PM', '6:00 PM', '7:00 PM'];
}

function buildCalendar() {
  const calendar = document.querySelector('#bookingCalendar');
  const timeSlots = document.querySelector('#timeSlots');
  const selectedDateLabel = document.querySelector('#selectedDateLabel');
  const preferredField = document.querySelector('#preferred');
  const monthLabel = document.querySelector('#calendarMonthLabel');
  const previousButton = document.querySelector('#prevMonth');
  const nextButton = document.querySelector('#nextMonth');

  if (!calendar || !timeSlots || !selectedDateLabel || !monthLabel) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let year = today.getFullYear();
  let month = today.getMonth();
  let selectedDate = null;
  let selectedTime = null;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function renderCalendar() {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const earliest = earliestBookingDate();

    monthLabel.textContent = firstDay.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    calendar.innerHTML = dayNames
      .map(day => `<div class="cal-dayname">${day}</div>`)
      .join('');

    for (let i = 0; i < firstDay.getDay(); i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-date calendar-empty';
      empty.setAttribute('aria-hidden', 'true');
      calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = keyFor(date);
      const available = date >= earliest;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cal-date';
      button.textContent = day;
      button.disabled = !available;
      button.setAttribute(
        'aria-label',
        prettyDate(dateKey) + (available ? ', available to request' : ', unavailable')
      );

      if (!available) button.classList.add('disabled');

      if (selectedDate === dateKey) {
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
      } else {
        button.setAttribute('aria-pressed', 'false');
      }

      if (available) {
        button.addEventListener('click', () => chooseDate(dateKey));
      }

      calendar.appendChild(button);
    }

    previousButton.disabled =
      year === today.getFullYear() && month <= today.getMonth();
  }

  function chooseDate(dateKey) {
    selectedDate = dateKey;
    selectedTime = null;

    selectedDateLabel.textContent = prettyDate(dateKey);
    timeSlots.innerHTML = '';

    if (preferredField) preferredField.value = '';

    const [selectedYear, selectedMonth, selectedDay] = dateKey.split('-').map(Number);
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);

    getAvailableTimes(date).forEach(time => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slot';
      button.textContent = time;
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        selectedTime = time;

        timeSlots.querySelectorAll('.slot').forEach(slot => {
          slot.classList.remove('active');
          slot.setAttribute('aria-pressed', 'false');
        });

        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');

        if (preferredField) {
          preferredField.value = `${prettyDate(selectedDate)} at ${selectedTime}`;
        }
      });

      timeSlots.appendChild(button);
    });

    renderCalendar();
  }

  previousButton.addEventListener('click', () => {
    if (previousButton.disabled) return;

    month--;

    if (month < 0) {
      month = 11;
      year--;
    }

    renderCalendar();
  });

  nextButton.addEventListener('click', () => {
    month++;

    if (month > 11) {
      month = 0;
      year++;
    }

    renderCalendar();
  });

  renderCalendar();
}

buildCalendar();

// Enforce new-client and existing-client service rules.
const clientStatus = document.querySelector('#clientStatus');
const serviceRequested = document.querySelector('#serviceRequested');
const serviceRule = document.querySelector('#serviceRule');

function applyClientRules() {
  if (!clientStatus || !serviceRequested) return;

  const isNewClient = clientStatus.value.startsWith('No');
  const isExistingClient = clientStatus.value.startsWith('Yes');

  const evaluation = 'Free 20-minute consultation/evaluation';
  const careServices = [
    'Daycare - Existing Clients Only',
    'Boarding - Existing Clients Only'
  ];

  Array.from(serviceRequested.options).forEach(option => {
    option.disabled = false;

    if (isNewClient && option.value !== evaluation) {
      option.disabled = true;
    }

    if (careServices.includes(option.value) && !isExistingClient) {
      option.disabled = true;
    }
  });

  if (isNewClient) {
    serviceRequested.value = evaluation;

    if (serviceRule) {
      serviceRule.textContent =
        'New clients must start with the free 20-minute consultation/evaluation. Other services can be discussed during that appointment.';
    }
  } else if (isExistingClient) {
    if (serviceRule) {
      serviceRule.textContent =
        'Existing training clients may request eligible services directly. Daycare and boarding are care services, not training sessions.';
    }
  } else {
    serviceRequested.value = evaluation;

    if (serviceRule) {
      serviceRule.textContent =
        'Choose whether you are a new or existing client to see which services you can request.';
    }
  }
}

if (clientStatus) {
  clientStatus.addEventListener('change', applyClientRules);
}

if (serviceRequested) {
  serviceRequested.addEventListener('change', applyClientRules);
}

applyClientRules();

// Open an email draft with the completed request.
const bookingForm = document.querySelector('#bookingForm');

if (bookingForm) {
  bookingForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!bookingForm.reportValidity()) return;

    const preferredField = document.querySelector('#preferred');

    if (!preferredField || !preferredField.value) {
      alert('Please select an available date and time from the calendar.');
      return;
    }

    const formData = new FormData(bookingForm);
    const subject = encodeURIComponent('Training Request - Escalante Dog Training');

    const body = Array.from(formData.entries())
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');

    const mailto =
      `mailto:escalantedogtraining@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  });
}
