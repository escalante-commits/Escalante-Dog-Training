/* =========================================
   MOBILE NAVIGATION
========================================= */

const menu = document.querySelector('.menu');
const links = document.querySelector('.links');

if (menu && links) {
  menu.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(isOpen));
  });
}


/* =========================================
   DATE HELPERS
========================================= */

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

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/*
  Block the current week and require at least seven
  days' notice. The current week is Sunday–Saturday.
*/
function earliestBookingDate() {
  const today = startOfToday();

  const sevenDaysAhead = new Date(today);
  sevenDaysAhead.setDate(today.getDate() + 7);

  const nextMonday = new Date(today);
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
  nextMonday.setDate(today.getDate() + daysUntilMonday);

  return sevenDaysAhead > nextMonday
    ? sevenDaysAhead
    : nextMonday;
}

function isBookableDate(date) {
  const candidate = new Date(date);
  candidate.setHours(0, 0, 0, 0);

  return candidate >= earliestBookingDate();
}


/* =========================================
   AVAILABLE APPOINTMENT TIMES
========================================= */

function getAvailableTimes(date) {
  const day = date.getDay();

  // Saturday and Sunday: 8 AM–12 PM
  if (day === 0 || day === 6) {
    return [
      '8:00 AM',
      '9:00 AM',
      '10:00 AM',
      '11:00 AM',
      '12:00 PM'
    ];
  }

  // Monday–Friday: 7–9 AM and 5–7 PM
  return [
    '7:00 AM',
    '8:00 AM',
    '9:00 AM',
    '5:00 PM',
    '6:00 PM',
    '7:00 PM'
  ];
}


/* =========================================
   BOOKING CALENDAR
========================================= */

// Keep the selected appointment accessible to form validation.
let selectedBookingDate = null;
let selectedBookingTime = null;


/*
  Scroll to the Evaluation Request form after
  a visitor selects an appointment time.
*/
function scrollToEvaluationRequest() {
  const explicitSection = document.querySelector('#evaluation-request');
  const bookingForm = document.querySelector('#bookingForm');

  const evaluationHeading = Array.from(
    document.querySelectorAll('h1, h2, h3, h4')
  ).find(heading =>
    heading.textContent.trim().toLowerCase().includes('evaluation request')
  );

  const target =
    explicitSection ||
    (evaluationHeading &&
      (evaluationHeading.closest('section') || evaluationHeading)) ||
    (bookingForm &&
      (bookingForm.closest('section') || bookingForm));

  if (!target) return;

  window.setTimeout(() => {
    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      90;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth'
    });
  }, 150);
}


function buildCalendar() {
  const calendar = document.querySelector('#bookingCalendar');
  const timeSlots = document.querySelector('#timeSlots');
  const selectedDateLabel = document.querySelector('#selectedDateLabel');
  const preferredField = document.querySelector('#preferred');
  const monthLabel = document.querySelector('#calendarMonthLabel');
  const previousButton = document.querySelector('#prevMonth');
  const nextButton = document.querySelector('#nextMonth');

  // This script is also loaded on pages without a calendar.
  if (
    !calendar ||
    !timeSlots ||
    !selectedDateLabel ||
    !preferredField ||
    !monthLabel ||
    !previousButton ||
    !nextButton
  ) {
    return;
  }

  const today = startOfToday();

  let year = today.getFullYear();
  let month = today.getMonth();

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function renderCalendar() {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthLabel.textContent = firstDay.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    calendar.innerHTML = '';

    dayNames.forEach(day => {
      const heading = document.createElement('div');
      heading.className = 'cal-dayname';
      heading.textContent = day;
      calendar.appendChild(heading);
    });

    // Empty cells before the first day of the month.
    for (let i = 0; i < firstDay.getDay(); i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-date calendar-empty';
      empty.setAttribute('aria-hidden', 'true');
      calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = keyFor(date);
      const available = isBookableDate(date);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cal-date';
      button.textContent = String(day);
      button.disabled = !available;

      button.setAttribute(
        'aria-label',
        `${prettyDate(dateKey)}${available ? ', available to request' : ', unavailable'}`
      );

      button.setAttribute(
        'aria-pressed',
        String(selectedBookingDate === dateKey)
      );

      if (!available) {
        button.classList.add('disabled');
      }

      if (selectedBookingDate === dateKey) {
        button.classList.add('active');
      }

      if (available) {
        button.addEventListener('click', () => {
          chooseDate(dateKey);
        });
      }

      calendar.appendChild(button);
    }

    // Do not allow navigation to a month before the current month.
    previousButton.disabled =
      year === today.getFullYear() && month <= today.getMonth();
  }


  function chooseDate(dateKey) {
    const [selectedYear, selectedMonth, selectedDay] =
      dateKey.split('-').map(Number);

    const date = new Date(
      selectedYear,
      selectedMonth - 1,
      selectedDay
    );

    // Recheck the date when it is selected.
    if (!isBookableDate(date)) {
      clearAppointment();
      renderCalendar();
      return;
    }

    selectedBookingDate = dateKey;
    selectedBookingTime = null;

    selectedDateLabel.textContent = prettyDate(dateKey);
    timeSlots.innerHTML = '';
    preferredField.value = '';

    getAvailableTimes(date).forEach(time => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slot';
      button.textContent = time;
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        // Recheck availability in case the page has been left open.
        if (!isBookableDate(date)) {
          alert(
            'That date is no longer available to request. Please choose another date.'
          );

          clearAppointment();
          renderCalendar();
          return;
        }

        selectedBookingTime = time;

        timeSlots.querySelectorAll('.slot').forEach(slot => {
          slot.classList.remove('active');
          slot.setAttribute('aria-pressed', 'false');
        });

        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');

        preferredField.value =
          `${prettyDate(selectedBookingDate)} at ${selectedBookingTime}`;

        // Automatically show the Evaluation Request form.
        scrollToEvaluationRequest();
      });

      timeSlots.appendChild(button);
    });

    renderCalendar();
  }


  function clearAppointment() {
    selectedBookingDate = null;
    selectedBookingTime = null;

    preferredField.value = '';
    timeSlots.innerHTML = '';
    selectedDateLabel.textContent =
      'Select an available date to see times';
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


/* =========================================
   CLIENT AND SERVICE RESTRICTIONS
========================================= */

const clientStatus = document.querySelector('#clientStatus');
const serviceRequested = document.querySelector('#serviceRequested');
const serviceRule = document.querySelector('#serviceRule');

const EVALUATION_SERVICE =
  'Free 20-minute consultation/evaluation';

const CARE_SERVICES = [
  'Daycare - Existing Clients Only',
  'Boarding - Existing Clients Only'
];


function applyClientRules() {
  if (!clientStatus || !serviceRequested) return;

  const isNewClient = clientStatus.value.startsWith('No');
  const isExistingClient = clientStatus.value.startsWith('Yes');

  Array.from(serviceRequested.options).forEach(option => {
    option.disabled = false;

    // New clients must request the free evaluation first.
    if (isNewClient && option.value !== EVALUATION_SERVICE) {
      option.disabled = true;
    }

    // Daycare and boarding are only for existing training clients.
    if (CARE_SERVICES.includes(option.value) && !isExistingClient) {
      option.disabled = true;
    }
  });

  if (isNewClient) {
    serviceRequested.value = EVALUATION_SERVICE;

    if (serviceRule) {
      serviceRule.textContent =
        'New clients must start with the free 20-minute consultation/evaluation. Other services can be discussed during that appointment.';
    }
  } else if (isExistingClient) {
    if (
      CARE_SERVICES.includes(serviceRequested.value) ||
      serviceRequested.value
    ) {
      if (serviceRule) {
        serviceRule.textContent =
          'Existing training clients may request eligible services directly. Daycare and boarding are care services, not training sessions.';
      }
    }
  } else {
    serviceRequested.value = EVALUATION_SERVICE;

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


/* =========================================
   APPOINTMENT VALIDATION
========================================= */

function selectedAppointmentIsValid() {
  const preferredField = document.querySelector('#preferred');

  if (
    !preferredField ||
    !preferredField.value ||
    !selectedBookingDate ||
    !selectedBookingTime
  ) {
    return false;
  }

  const [year, month, day] =
    selectedBookingDate.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  if (!isBookableDate(date)) return false;

  if (!getAvailableTimes(date).includes(selectedBookingTime)) {
    return false;
  }

  const expectedValue =
    `${prettyDate(selectedBookingDate)} at ${selectedBookingTime}`;

  return preferredField.value === expectedValue;
}


/* =========================================
   EMAIL REQUEST FORM
========================================= */

const bookingForm = document.querySelector('#bookingForm');

if (bookingForm) {
  bookingForm.addEventListener('submit', event => {
    event.preventDefault();

    if (!bookingForm.reportValidity()) return;

    if (!selectedAppointmentIsValid()) {
      alert('Please select an available date and time from the calendar.');
      return;
    }

    const isNewClient =
      clientStatus && clientStatus.value.startsWith('No');

    const isExistingClient =
      clientStatus && clientStatus.value.startsWith('Yes');

    const requestedService =
      serviceRequested ? serviceRequested.value : '';

    if (!clientStatus || (!isNewClient && !isExistingClient)) {
      alert(
        'Please indicate whether you are a new or existing training client.'
      );
      return;
    }

    if (
      isNewClient &&
      requestedService !== EVALUATION_SERVICE
    ) {
      alert('New clients must request the free evaluation first.');
      return;
    }

    if (
      CARE_SERVICES.includes(requestedService) &&
      !isExistingClient
    ) {
      alert(
        'Daycare and boarding are available only to existing training clients.'
      );
      return;
    }

    const formData = new FormData(bookingForm);

    const subject = encodeURIComponent(
      'Training Request - Escalante Dog Training'
    );

    const body = Array.from(formData.entries())
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');

    const mailto =
      `mailto:escalantedogtraining@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;

    // Opens the visitor's configured email app; does not send automatically.
    window.location.href = mailto;
  });
}
