//RECUPERO DATI//
function saveMemoryWithDate() {
    const memories = getData("memories") || [];
    const newMemory = {
        text: document.getElementById("memory-text-input").value,
        img: document.getElementById("memory-preview-img").src || null,
        audio: document.getElementById("memory-preview-audio").src || null,
        date: new Date().toISOString()
    };
    memories.push(newMemory);
    saveData("memories", memories);
    renderMemorySection();
}

function getMemories() {
    return getData("memories") || [];
}

function renderMemorySection() {
    const memories = getMemories();
    const memoryText = document.getElementById("memory-text");
    const memoryImg = document.getElementById("memory-img");
    const memoryAudio = document.getElementById("memory-audio");

    if (memories.length > 0) {
        const last = memories[memories.length - 1];
        memoryText.innerText = last.text || "";
        memoryImg.src = last.img || "";
        memoryAudio.src = last.audio || "";
        memoryImg.style.display = last.img ? "block" : "none";
        memoryAudio.style.display = last.audio ? "block" : "none";
    } else {
        memoryText.innerText = "";
        memoryImg.style.display = "none";
        memoryAudio.style.display = "none";
    }
}



// ---------- LOGIN ----------
let currentPassword = null;
let flipInterval, heartInterval;


function saveData(section, data) {
    const allUsers = JSON.parse(localStorage.getItem("loveDashboardUsers")) || {};
    allUsers[currentPassword] = allUsers[currentPassword] || {};
    allUsers[currentPassword][section] = data;
    localStorage.setItem("loveDashboardUsers", JSON.stringify(allUsers));
}

function getData(section) {
    const allUsers = JSON.parse(localStorage.getItem("loveDashboardUsers")) || {};
    return allUsers[currentPassword]?.[section] || null;
}

// Resetta tutte le sezioni della home per un nuovo utente
function resetAllSections() {
    // Daily Message
    document.getElementById("daily-message-text").innerText = '';
    const heartsContainer = document.getElementById('hearts-container');
    heartsContainer.innerHTML = '';
    if (heartInterval) clearInterval(heartInterval);

    // Mood / Specchio delle Emozioni
    document.getElementById("mood-note").value = '';
    document.getElementById("mood-history").innerHTML = '';

    // Oracle
    document.getElementById("oracle-text").innerText = '';
    document.getElementById("oracle-history").innerHTML = '';

    // Photobooth
    resetPhotobooth();

    // Messaggi speciali
    document.querySelector(".special-messages").innerHTML = '';

    // Timeline / Calendario memorie
    resetMemorySection();
}

// Resetta il calendario / flip clock del tempo insieme
function resetRelationshipSection() {
    // Resetta flip clock interno
    const sectionClock = document.getElementById("section-flip-clock");
    sectionClock.innerHTML = ''; // pulisce display

    // Resetta calendario
    document.getElementById("rel-calendar-grid").innerHTML = '';
    document.getElementById("relationship-start-text").innerText = '';

    // Qui puoi anche impostare la data iniziale come oggi, oppure farla scegliere all’utente
}

// ---------- LOGIN / REGISTRAZIONE / LOGOUT ----------
function checkAuthOnLoad() {
    const savedPassword = localStorage.getItem("currentUserPassword");
    const allUsers = JSON.parse(localStorage.getItem("loveDashboardUsers")) || {};

    if (savedPassword && allUsers[savedPassword]) {
        // Utente già registrato e loggato → entra in home
        currentPassword = savedPassword;

        document.getElementById("login").style.display = "none";
        document.getElementById("login-section").style.display = "none";
        document.getElementById("register-section").style.display = "none";

        enterHome();
    } else {
        // Nessun utente loggato → mostra login e registrazione
        document.getElementById("login").style.display = "block";
        document.getElementById("login-section").style.display = "block";
        document.getElementById("register-section").style.display = "block";
    }
}

// REGISTRAZIONE
function register() {
    const pw = document.getElementById("reg-password").value.trim();
    if (!pw) return alert("Inserisci una password valida!");

    const allUsers = JSON.parse(localStorage.getItem("loveDashboardUsers")) || {};
    if (allUsers[pw]) return alert("Password già registrata! Usa Accedi.");

    // Inizializza dati vuoti per il nuovo utente
    allUsers[pw] = {};
    localStorage.setItem("loveDashboardUsers", JSON.stringify(allUsers));

    currentPassword = pw;
    localStorage.setItem("currentUserPassword", pw);

    document.getElementById("login").style.display = "none";
    document.getElementById("login-section").style.display = "none";
    document.getElementById("register-section").style.display = "none";

    // Utente nuovo → enterHome con isNewUser = true
    enterHome();
}
// LOGIN
function login() {
    const pw = document.getElementById("password").value.trim();
    const allUsers = JSON.parse(localStorage.getItem("loveDashboardUsers")) || {};

    if (allUsers[pw]) {
        currentPassword = pw;
        localStorage.setItem("currentUserPassword", pw);

        document.getElementById("login").style.display = "none";
        document.getElementById("login-section").style.display = "none";
        document.getElementById("register-section").style.display = "none";
        document.getElementById("flip-clock").style.display = "flex";

        // Utente esistente → enterHome con isNewUser = false
        enterHome();
        registerDeviceForNotifications();
    } else {
        alert("Password errata o non registrata!");
    }
}


// LOGOUT
function logout() {
    localStorage.removeItem("currentUserPassword");
    currentPassword = null;

    // Nascondi home e sezioni interne
    document.getElementById("intro").style.display = "none";
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById('flip-clock').style.display = 'none';

    // Mostra blocchi login/registrazione
    document.getElementById("login").style.display = "block";
    document.getElementById("login-section").style.display = "block";
    document.getElementById("register-section").style.display = "block";

    // Nascondi pulsante logout
    document.getElementById("logout-btn").style.display = "none";

    // Ferma eventuali animazioni
    if (heartInterval) clearInterval(heartInterval);
}

document.addEventListener("DOMContentLoaded", checkAuthOnLoad);


function enterHome() {
    document.getElementById('intro').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'inline-block';

    // Recupera dati relazione
    let relationshipData = getData("relationship") || {};
    let startDate = relationshipData.startDate;

    // Se nuovo utente, chiedi subito la data
    if (!startDate) {
        startDate = prompt("Inserisci la data di inizio della vostra relazione (AAAA-MM-GG):", new Date().toISOString().split("T")[0]);
        if (!startDate) startDate = new Date().toISOString().split("T")[0];
        saveData("relationship", { startDate });
    }

    // Avvia subito l’orologio
    startFlipClock(startDate);

    // Avvia le altre funzioni
    renderCalendar();
    showDailyMessage();
    renderOracleHistory();

    // MOSTRA IL WIDGET DEI SENTIMENTI
    loadLastMoodWidget();
}



// ---------- NAVIGAZIONE SEZIONI ----------
function goHome() {
    resetMemorySection();
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById('intro').style.display = 'block';
    resetPhotobooth();
}

function showSection(id) {
    document.getElementById('intro').style.display = 'none';
    document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = 'block';
    if (id === 'relationship-section') renderRelCalendar();
    if (id === 'random-memories-section' || id === 'memory-section') renderMemoryCalendar();
    if (id === 'photobooth-section') initPhotobooth();
    loadLastMoodWidget();
}

// ---------- FLIP CLOCK ----------
let startDate = localStorage.getItem('startDate') ? new Date(localStorage.getItem('startDate')) : null;

function setStartDate() {
    const val = document.getElementById('start-date').value;
    if (val) {
        startDate = new Date(val);
        localStorage.setItem('startDate', val);
        if (id === 'random-memories-section') renderMemoryCalendar();
    }
    startFlipClock();
}

function startFlipClock(startDate) {
    const container = document.getElementById('flip-clock');
    clearInterval(flipInterval);

    function update() {
        const now = new Date();
        const diff = now - new Date(startDate);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        container.innerHTML = `
            <div class="flip-digit"><span>${days}d</span></div>
            <div class="flip-digit"><span>${hours}h</span></div>
            <div class="flip-digit"><span>${minutes}m</span></div>
            <div class="flip-digit"><span>${seconds}s</span></div>
        `;
    }

    update();
    flipInterval = setInterval(update, 1000);
}

let relCurrentMonth = new Date().getMonth();
let relCurrentYear = new Date().getFullYear();

function renderRelCalendar() {
    const grid = document.getElementById('rel-calendar-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const monthLabel = document.getElementById('rel-month-label');
    const monthNames = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];
    monthLabel.innerText = `${monthNames[relCurrentMonth]} ${relCurrentYear}`;

    const firstDay = new Date(relCurrentYear, relCurrentMonth, 1).getDay();
    const daysInMonth = new Date(relCurrentYear, relCurrentMonth + 1, 0).getDate();

    // giorni vuoti iniziali
    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));

    for (let d = 1; d <= daysInMonth; d++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'rel-day';

        const dateStr = `${relCurrentYear}-${String(relCurrentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isStart = localStorage.getItem('startDate') === dateStr;
        if (isStart) dayDiv.classList.add('start-day');

        dayDiv.innerText = d;
        dayDiv.onclick = () => setStartDateFromCalendar(dateStr);
        grid.appendChild(dayDiv);
    }

    // aggiorna testo sotto il calendario
    updateStartText();
}

function setStartDateFromCalendar(dateStr) {
    startDate = new Date(dateStr);
    localStorage.setItem('startDate', dateStr);
    renderRelCalendar();
    startFlipClock();
    updateStartText();
}

function updateStartText() {
    const textEl = document.getElementById('relationship-start-text');
    const savedDate = localStorage.getItem('startDate');
    if (savedDate) {
        const date = new Date(savedDate);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formatted = date.toLocaleDateString('it-IT', options);
        textEl.innerHTML = `💖 La nostra storia è iniziata il <strong>${formatted}</strong>`;
    } else {
        textEl.innerText = 'Scegli il giorno in cui tutto è cominciato 💕';
    }
}

function prevRelMonth() {
    relCurrentMonth--;
    if (relCurrentMonth < 0) {
        relCurrentMonth = 11;
        relCurrentYear--;
    }
    renderRelCalendar();
}

function nextRelMonth() {
    relCurrentMonth++;
    if (relCurrentMonth > 11) {
        relCurrentMonth = 0;
        relCurrentYear++;
    }
    renderRelCalendar();
}

// ---------- MESSAGGIO DEL GIORNO ----------
const dailyMessages = [
    "Ogni giorno accanto a te è un piccolo pezzo di paradiso 💖",
    "Tu sei la mia certezza in un mondo che cambia 🌍",
    "Il tuo sorriso è la mia alba preferita ☀️",
    "Con te anche il silenzio diventa musica 🎶",
    "Vorrei fermare il tempo ogni volta che ti guardo ⏳",
    "Il tuo abbraccio è la mia casa 🏡",
    "Mi basta un tuo sguardo per sentirmi al sicuro 💫",
    "Il nostro amore è scritto tra le stelle 🌌",
    "Ti penso, e il mondo diventa più bello 🌷",
    "Amarti è la mia poesia preferita 📖",
    "Con te, anche un giorno qualunque diventa speciale 🌞",
    "La tua voce è la mia melodia preferita 🎵",
    "Il tuo nome è inciso nel mio cuore ❤️",
    "Ogni battito è un pensiero per te 💓",
    "Vorrei vivere mille vite solo per amarti in ognuna 🌹",
    "Quando mi sorridi, il tempo si ferma ✨",
    "Tu sei il mio oggi, il mio domani e tutto ciò che voglio 💍",
    "Le tue mani sanno parlarmi più di mille parole 🤲",
    "Sei la mia stella nella notte più buia 🌙",
    "Con te ogni sogno diventa realtà 🌈",
    "Non serve un motivo per amarti, mi basta che tu esista 💞",
    "Tu rendi magico anche il lunedì 💐",
    "Sei la mia costante in un mondo variabile 🔮",
    "Il tuo amore è la mia forza ogni giorno ⚡",
    "Ogni tuo gesto è una carezza per l’anima 🌸",
    "Amarti è come respirare: naturale, vitale, necessario 💭",
    "Le parole non bastano, ma il mio cuore sì 💕",
    "Con te ho imparato il vero significato di 'noi' 🤍",
    "La tua risata è la mia melodia del cuore 🎼",
    "Quando penso a te, sorrido senza motivo 😊",
    "Sei la parte più bella dei miei giorni 🌻",
    "Tu sei il mio equilibrio perfetto ⚖️",
    "Non so dove finisco io e dove inizi tu 💫",
    "Il tempo vola quando sei qui 🕊️",
    "Tu sei la mia definizione di felicità 💛",
    "Ogni giorno con te è un nuovo inizio 🌅",
    "Sei la ragione per cui credo nell’amore 💗",
    "Il mondo si ferma quando mi abbracci 🤍",
    "Sei la mia calma dopo la tempesta 🌧️",
    "Con te anche la distanza profuma di presenza 💌",
    "Il mio cuore ti riconoscerebbe in mezzo a mille anime 💓",
    "Sei la mia luna nelle notti senza stelle 🌙",
    "Mi basta sapere che ci sei 💫",
    "Ti scelgo ogni giorno, senza pensarci 💞",
    "Tu sei il mio pensiero preferito 🌸",
    "Ogni tuo bacio racconta una storia diversa 💋",
    "Sei il mio porto sicuro ⚓",
    "Con te, ogni battito ha senso ❤️",
    "Vorrei che il tempo con te non finisse mai 🕰️",
    "Sei la mia dolce abitudine 💕",
    "La tua felicità è la mia missione 💎",
    "Amarti è la mia forma di libertà 🕊️",
    "Sei luce anche nei miei giorni più grigi ☁️",
    "Il tuo sorriso illumina le mie notti ✨",
    "Tu sei la mia poesia quotidiana 🖋️",
    "Con te, ogni momento è perfetto 🌸",
    "Non serve molto: mi basta te ❤️",
    "Ogni giorno ti amo un po’ di più 🌷",
    "Sei la mia domenica anche di lunedì 💫",
    "Con te la vita profuma di sogni 🌹",
    "Tu sei la mia persona 🥰",
    "La mia giornata inizia quando vedo il tuo sorriso ☀️",
    "Amarti è la mia avventura preferita 🌍",
    "Tu sei il mio miracolo quotidiano ✨",
    "Il mio cuore batte al ritmo del tuo 💗",
    "Sei il mio pensiero del buongiorno e della buonanotte 🌙",
    "Ti penso, e il mondo torna a sorridere 🌼",
    "Sei la parte più bella della mia storia 📖",
    "Vorrei dirti mille cose, ma ti amo le racchiude tutte 💘",
    "Con te mi sento a casa, ovunque 💞",
    "Sei la mia certezza in un mare di forse 🌊",
    "Ogni giorno è più dolce sapendo che ci sei 🍯",
    "Tu sei il mio orizzonte preferito 🌅",
    "Sei il mio punto fermo nel caos 🌪️",
    "Ogni tuo abbraccio mi ripara dal mondo 🤍",
    "Con te il tempo ha un sapore diverso 💕",
    "Sei la mia parte migliore 💫",
    "Non esiste posto più bello che tra le tue braccia 💓",
    "Tu rendi straordinario anche l’ordinario 🌸",
    "Sei la mia storia preferita da raccontare 📜",
    "Il mio cuore ti sceglie anche nei sogni 🌙",
    "Amarti è semplice come respirare 💖",
    "Sei la mia eternità racchiusa in un attimo ⏳",
    "Ogni tuo sguardo è una promessa 💞",
    "Sei la mia dolce follia 🌺",
    "Il mio mondo comincia dove finisce il tuo sorriso 💫",
    "Sei la risposta che non sapevo di cercare 💗",
    "Con te la vita ha trovato il suo ritmo 🎶",
    "Ti amo non per come sei, ma per come mi fai essere 💓",
    "Ogni giorno mi innamoro di nuovo di te 💋",
    "Sei il mio per sempre preferito 💍",
    "Ti amo come si amano le cose che non finiscono mai 💖",
    "Con te, ogni giorno è San Valentino 💌",
    "Sei la mia destinazione in ogni viaggio 🚀",
    "Amarti è il mio modo di vivere 🌷",
    "La mia felicità ha il tuo nome 💞",
    "Tu sei il mio perché 💫"
];
function showDailyMessage() {
    const today = new Date().toISOString().split("T")[0]; // es. 2025-11-13
    const storedData = JSON.parse(localStorage.getItem("dailyMessageData")) || {};

    let msg;
    if (storedData.date === today && storedData.message) {
        msg = storedData.message;
    } else {
        msg = dailyMessages[Math.floor(Math.random() * dailyMessages.length)];
        localStorage.setItem("dailyMessageData", JSON.stringify({ date: today, message: msg }));
    }

    const el = document.getElementById("daily-message-text");
    el.innerText = ''; // reset
    typeWriter(el, msg, 0);
    startHearts();
}

// ---------- HEARTS ANIMATION ----------
function startHearts() {
    const container = document.getElementById('hearts-container');
    if (heartInterval) clearInterval(heartInterval);
    heartInterval = setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerText = '❤️';
        heart.style.left = Math.random() * 90 + '%';
        container.appendChild(heart);
        setTimeout(() => container.removeChild(heart), 5000);
    }, 500);
}

function typeWriter(element, text, index) {
    if (index < text.length) {
        const span = document.createElement('span');
        span.textContent = text.charAt(index);
        span.style.opacity = 0;
        span.style.transition = 'opacity 0.3s ease'; // fade dolce
        element.appendChild(span);

        // attiviamo la transizione con un leggero timeout
        setTimeout(() => {
            span.style.opacity = 1;
        }, 50);

        setTimeout(() => typeWriter(element, text, index + 1), 50); // prossima lettera
    }
}

// ---------- LINEA DEL TEMPO ----------
let memoriesRaw = localStorage.getItem('memories');
let memories = {};

if (memoriesRaw) {
    try {
        const parsed = JSON.parse(memoriesRaw);
        // Se era un array (vecchio formato), convertiamo in oggetto per data
        if (Array.isArray(parsed)) {
            parsed.forEach(m => {
                if (!memories[m.date]) memories[m.date] = [];
                memories[m.date].push({ text: m.text, img: m.img, audio: m.audio || null });
            });
            localStorage.setItem('memories', JSON.stringify(memories));
        } else {
            memories = parsed; // già oggetto
        }
    } catch (e) {
        console.error("Errore parsing memories:", e);
    }
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentMemoryIndex = 0;

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const monthLabel = document.getElementById('month-label');
    const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    monthLabel.innerText = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div'); empty.className = 'empty'; grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dayDiv = document.createElement('div'); dayDiv.className = 'calendar-day';
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayMemories = memories[dateStr] || [];

        if (dayMemories.length > 0) {
            dayDiv.style.backgroundImage = `url('${dayMemories[0].img}')`;
            dayDiv.style.backgroundSize = 'cover';
            dayDiv.style.backgroundPosition = 'center';
        } else { dayDiv.style.backgroundImage = 'none'; dayDiv.style.backgroundColor = '#fff'; }

        const span = document.createElement('span'); span.innerText = d; span.className = 'day-number';
        dayDiv.appendChild(span);
        dayDiv.onclick = () => openOverlayDay(dateStr);

        grid.appendChild(dayDiv);
    }
}

function prevMonth() { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } renderCalendar(); }
function nextMonth() { currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; } renderCalendar(); }

// ---------- OVERLAY MEMORIE ----------
function openOverlayDay(dateStr) {
    const overlay = document.getElementById('timeline-overlay');
    overlay.style.display = 'flex';
    const container = document.getElementById('add-memory-container');
    container.dataset.date = dateStr;
    container.querySelector('#new-img-input').value = '';
    container.querySelector('#new-text-input').value = '';
    document.getElementById('image-preview').style.display = 'none';

    const dayMemories = memories[dateStr] || [];
    if (dayMemories.length > 0) {
        currentMemoryIndex = 0;
        showMemoryInOverlay(dateStr, currentMemoryIndex);
        document.getElementById('remove-memory-btn').style.display = 'inline-block';
        document.getElementById('prev-memory-btn').style.display = dayMemories.length > 1 ? 'inline-block' : 'none';
        document.getElementById('next-memory-btn').style.display = dayMemories.length > 1 ? 'inline-block' : 'none';
    } else {
        document.getElementById('overlay-img').src = '';
        document.getElementById('overlay-text').innerText = 'Nessun ricordo. Puoi aggiungerne uno!';
        document.getElementById('overlay-audio').style.display = 'none';
        document.getElementById('remove-memory-btn').style.display = 'none';
        document.getElementById('prev-memory-btn').style.display = 'none';
        document.getElementById('next-memory-btn').style.display = 'none';
    }

    container.style.display = 'block';
}

function showMemoryInOverlay(dateStr, index) {
    const dayMemories = memories[dateStr];
    if (!dayMemories || dayMemories.length === 0) return;

    const mem = dayMemories[index];
    document.getElementById('overlay-img').src = mem.img || '';
    document.getElementById('overlay-text').innerText = mem.text || '';

    const audioEl = document.getElementById('overlay-audio');
    if (mem.audio) { audioEl.src = mem.audio; audioEl.style.display = 'block'; }
    else { audioEl.style.display = 'none'; audioEl.src = ''; }

    document.getElementById('prev-memory-btn').style.display = dayMemories.length > 1 ? 'inline-block' : 'none';
    document.getElementById('next-memory-btn').style.display = dayMemories.length > 1 ? 'inline-block' : 'none';
}

function closeOverlay() { document.getElementById('timeline-overlay').style.display = 'none'; }

function addMemoryFromCalendar() {
    const imgFile = document.getElementById('new-img-input').files[0];
    const text = document.getElementById('new-text-input').value.trim();
    const dateStr = document.getElementById('add-memory-container').dataset.date;

    if (!imgFile || !text) {
        alert("Inserisci immagine e testo!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        if (!memories[dateStr]) memories[dateStr] = [];
        memories[dateStr].push({ text, img: e.target.result, audio: null });
        localStorage.setItem('memories', JSON.stringify(memories));
        renderCalendar();
        openOverlayDay(dateStr); // ricarica overlay con nuova immagine
    };
    reader.readAsDataURL(imgFile);
}

function removeMemory() {
    const dateStr = document.getElementById('add-memory-container').dataset.date;
    const dayMemories = memories[dateStr];
    if (!dayMemories || dayMemories.length === 0) return;

    if (confirm("Sei sicuro di voler rimuovere questo ricordo?")) {
        dayMemories.splice(currentMemoryIndex, 1);
        if (dayMemories.length === 0) delete memories[dateStr];
        localStorage.setItem('memories', JSON.stringify(memories));
        renderCalendar();

        if (dayMemories.length > 0) {
            currentMemoryIndex = Math.max(0, currentMemoryIndex - 1);
            showMemoryInOverlay(dateStr, currentMemoryIndex);
        } else {
            openOverlayDay(dateStr); // torna alla vista "vuota"
        }
    }

}

function prevMemory() {
    const dateStr = document.getElementById('add-memory-container').dataset.date;
    const dayMemories = memories[dateStr];
    if (!dayMemories || dayMemories.length <= 1) return;

    currentMemoryIndex = (currentMemoryIndex - 1 + dayMemories.length) % dayMemories.length;
    showMemoryInOverlay(dateStr, currentMemoryIndex);
}

function nextMemory() {
    const dateStr = document.getElementById('add-memory-container').dataset.date;
    const dayMemories = memories[dateStr];
    if (!dayMemories || dayMemories.length <= 1) return;

    currentMemoryIndex = (currentMemoryIndex + 1) % dayMemories.length;
    showMemoryInOverlay(dateStr, currentMemoryIndex);
}

function previewImage(event, imgId, audioId, wrapperId, inputId) {
    const file = event.target.files[0];
    const img = document.getElementById(imgId);
    const audio = audioId ? document.getElementById(audioId) : null;
    const wrapper = document.getElementById(wrapperId);
    const input = document.getElementById(inputId);

    if (!file) {
        img.src = '';
        img.style.display = 'none';
        if (audio) {
            audio.src = '';
            audio.style.display = 'none';
        }
        wrapper.style.display = 'none';
        input.value = '';
        return;
    }

    wrapper.style.display = 'flex';

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
            img.src = e.target.result;
            img.style.display = 'block';
            if (audio) audio.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/') && audio) {
        const reader = new FileReader();
        reader.onload = e => {
            audio.src = e.target.result;
            audio.style.display = 'block';
            img.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function removePreview(type) {
    const previewWrapper = document.getElementById('memory-preview');
    const img = document.getElementById('memory-preview-img');
    const audio = document.getElementById('memory-preview-audio');
    const removeImgBtn = document.getElementById('remove-img-preview');
    const removeAudioBtn = document.getElementById('remove-audio-preview');

    if (type === 'img') {
        img.src = '';
        img.style.display = 'none';
        document.getElementById('memory-img-input').value = '';
        removeImgBtn.style.display = 'none';
    } else if (type === 'audio') {
        audio.src = '';
        audio.style.display = 'none';
        document.getElementById('memory-audio-input').value = '';
        removeAudioBtn.style.display = 'none';
    }

    // Se entrambi spariscono, nascondi tutto il wrapper e ridai larghezza piena al calendario
    if (!img.src && !audio.src) {
        previewWrapper.classList.add('hidden');
        document.querySelector('.memory-calendar-wrapper').style.flex = '1 1 100%';
    } else {
        previewWrapper.classList.remove('hidden');
        document.querySelector('.memory-calendar-wrapper').style.flex = '1';
    }
}
// ---------- RICORDI CASUALI ----------
let memCurrentMonth = new Date().getMonth();
let memCurrentYear = new Date().getFullYear();
let selectedMemoryDate = null;


function renderMemoryCalendar() {
    const grid = document.getElementById("mem-calendar-grid");
    const label = document.getElementById("mem-month-label");
    const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    label.innerText = `${months[memCurrentMonth]} ${memCurrentYear}`;

    grid.innerHTML = "";
    const firstDay = (new Date(memCurrentYear, memCurrentMonth, 1).getDay() + 6) % 7;
    const days = new Date(memCurrentYear, memCurrentMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement("div"));

    for (let d = 1; d <= days; d++) {
        const cell = document.createElement("div");
        cell.innerText = d;
        const ds = `${memCurrentYear}-${String(memCurrentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        if (selectedMemoryDate === ds) cell.classList.add("mem-selected-day");

        cell.onclick = () => {
            selectedMemoryDate = ds;
            renderMemoryCalendar();
        };

        grid.appendChild(cell);
    }
}

function saveMemoryWithDate() {
    if (!selectedMemoryDate) {
        alert("Seleziona una data!");
        return;
    }

    const text = document.getElementById("memory-text-input").value.trim();
    const imgFile = document.getElementById("memory-img-input").files[0];
    const audioFile = document.getElementById("memory-audio-input").files[0];

    if (!text || !imgFile) {
        alert("Inserisci almeno testo e immagine!");
        return;
    }

    const readerImg = new FileReader();
    readerImg.onload = e => {
        const imgData = e.target.result;

        if (audioFile) {
            const readerAudio = new FileReader();
            readerAudio.onload = ev => saveMemory(text, imgData, ev.target.result, selectedMemoryDate);
            readerAudio.readAsDataURL(audioFile);
        } else {
            saveMemory(text, imgData, null, selectedMemoryDate);
        }
    };
    readerImg.readAsDataURL(imgFile);
}

function prevMemMonth() {
    memCurrentMonth--;
    if (memCurrentMonth < 0) { memCurrentMonth = 11; memCurrentYear--; }
    renderMemoryCalendar();
}

function nextMemMonth() {
    memCurrentMonth++;
    if (memCurrentMonth > 11) { memCurrentMonth = 0; memCurrentYear++; }
    renderMemoryCalendar();
}

function addMemory() {
    if (!selectedMemoryDate) { alert("Seleziona una data!"); return; }
    const text = document.getElementById("memory-text-input").value;
    const imgFile = document.getElementById("memory-img-input").files[0];
    const audioFile = document.getElementById("memory-audio-input").files[0];
    if (!text || !imgFile) { alert("Inserisci almeno testo e immagine!"); return; }

    const readerImg = new FileReader();
    readerImg.onload = e => {
        const imgData = e.target.result;
        if (audioFile) {
            const readerAudio = new FileReader();
            readerAudio.onload = ev => saveMemory(text, imgData, ev.target.result, selectedMemoryDate);
            readerAudio.readAsDataURL(audioFile);
        } else saveMemory(text, imgData, null, selectedMemoryDate);
    };
    readerImg.readAsDataURL(imgFile);
}

function saveMemory(text, imgData, audioData, dateStr) {
    if (!memories[dateStr]) memories[dateStr] = [];
    memories[dateStr].push({ text, img: imgData, audio: audioData });
    localStorage.setItem("memories", JSON.stringify(memories));
    renderCalendar();
    showRandomMemory(dateStr);
}

function showRandomMemory(dateStr = null) {
    const area = document.querySelector('.memory-card');
    if (!area) return;
    const allMemories = Object.values(memories).flat();
    if (allMemories.length === 0) {
        area.querySelector('#memory-text').innerText = 'Nessun ricordo disponibile!';
        area.querySelector('#memory-img').src = '';
        area.querySelector('#memory-audio').style.display = 'none';
        return;
    }
    let mem;
    if (dateStr && memories[dateStr]) mem = memories[dateStr].slice(-1)[0];
    else mem = allMemories[Math.floor(Math.random() * allMemories.length)];

    area.querySelector('#memory-text').innerText = mem.text;
    area.querySelector('#memory-img').src = mem.img;
    const audio = area.querySelector('#memory-audio');
    if (mem.audio) { audio.src = mem.audio; audio.style.display = 'block'; }
    else { audio.style.display = 'none'; audio.src = ''; }
}

function previewMemoryFile(event, type) {
    const wrapper = document.getElementById('memory-preview');
    const img = document.getElementById('memory-preview-img');
    const audio = document.getElementById('memory-preview-audio');
    const calendar = document.getElementById('mem-calendar-grid');
    const input = event.target;

    // Se uno degli elementi non esiste, esce subito (sicurezza)
    if (!wrapper || !calendar || !input) return;
    if (!img || !audio) return;

    // Pulisce wrapper da contenuti precedenti
    img.src = '';
    img.style.display = 'none';
    audio.src = '';
    audio.style.display = 'none';

    // Rimuove eventuale "X" precedente
    const existingClose = wrapper.querySelector('.close-btn');
    if (existingClose) existingClose.remove();

    const file = input.files[0];
    if (!file) {
        wrapper.style.display = 'none';
        calendar.style.width = ''; // ripristina dimensione originale
        input.value = '';
        return;
    }

    wrapper.style.display = 'flex';
    wrapper.style.position = 'relative';
    calendar.style.width = '50%'; // riduce larghezza calendario quando c'è anteprima

    // Crea bottone "X" per rimuovere file
    const closeBtn = document.createElement('div');
    closeBtn.innerText = '✖';
    closeBtn.className = 'close-btn';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '5px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '18px';
    closeBtn.onclick = () => {
        img.src = '';
        img.style.display = 'none';
        audio.src = '';
        audio.style.display = 'none';
        wrapper.style.display = 'none';
        calendar.style.width = '';
        input.value = '';
        closeBtn.remove();
    };
    wrapper.appendChild(closeBtn);

    // Carica file
    const reader = new FileReader();
    reader.onload = e => {
        if (type === 'image') {
            img.src = e.target.result;
            img.style.display = 'block';
            audio.style.display = 'none';
        } else if (type === 'audio') {
            audio.src = e.target.result;
            audio.style.display = 'block';
            img.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

// Salva lo stile originale del calendario al caricamento della pagina
const memCalendarWrapper = document.getElementById("mem-calendar-grid");
const computedStyle = getComputedStyle(memCalendarWrapper);

let memCalendarOriginalStyle = {
    width: computedStyle.width,
    display: computedStyle.display,
    flex: computedStyle.flex
};

function resetMemorySection() {
    // Reset testo
    const textInput = document.getElementById("memory-text-input");
    if (textInput) textInput.value = "";

    // Reset input file
    const imgInput = document.getElementById("memory-img-input");
    const audioInput = document.getElementById("memory-audio-input");
    if (imgInput) imgInput.value = "";
    if (audioInput) audioInput.value = "";

    // Nascondi preview e rimuovi eventuali "X"
    const previewWrapper = document.getElementById("memory-preview");
    if (previewWrapper) {
        previewWrapper.style.display = "none";

        const imgPreview = document.getElementById("memory-preview-img");
        if (imgPreview) {
            imgPreview.src = "";
            imgPreview.style.display = "none";
        }

        const audioPreview = document.getElementById("memory-preview-audio");
        if (audioPreview) {
            audioPreview.src = "";
            audioPreview.style.display = "none";
        }

        const removeBtns = previewWrapper.querySelectorAll(".remove-btn");
        removeBtns.forEach(btn => btn.remove());
    }

    // Ripristina dimensioni calendario usando le dimensioni calcolate
    if (memCalendarWrapper) {
        memCalendarWrapper.style.width = "100%";
    }

    // Deseleziona eventuale data selezionata
    selectedMemoryDate = null;

    // Ricarica calendario
    renderMemoryCalendar();
}


// ---------- SPECCHIO DEI SENTIMENTI ----------
let selectedMood = null;
let moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];

/* Selezione emozione */
document.addEventListener("click", e => {
    if (!e.target.classList.contains("emotion-card")) return;

    document.querySelectorAll(".emotion-card").forEach(card =>
        card.classList.remove("active", "pop-anim")
    );

    e.target.classList.add("active");
    void e.target.offsetWidth; // reset trick
    e.target.classList.add("pop-anim");

    selectedMood = {
        type: e.target.dataset.mood,
        emoji: e.target.innerText.split(" ")[0],
        color: e.target.dataset.color
    };
});

/* Salvataggio */
function saveMood() {
    const note = document.getElementById("mood-note").value.trim();
    if (!selectedMood) return alert("Seleziona un'emozione!");
    if (!note) return alert("Scrivi una nota!");

    const entry = {
        emoji: selectedMood.emoji,
        note,
        date: new Date().toLocaleString(),
        color: selectedMood.color
    };

    moodHistory.unshift(entry);
    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));
    localStorage.setItem("lastMood", JSON.stringify(entry)); // Salva ultimo mood

    updateMoodHistory();
    updateWidget(entry);

    document.getElementById("mood-note").value = "";
}

function clearAllMoods() {
    if (!confirm("Sei sicuro di voler cancellare tutti i sentimenti?")) return;

    // Svuota lo storico e localStorage
    moodHistory = [];
    localStorage.removeItem("moodHistory");
    localStorage.removeItem("lastMood"); // rimuove anche il salvataggio del widget

    // Aggiorna storico
    updateMoodHistory();

    // Nascondi widget
    const widget = document.getElementById("mood-widget");
    widget.style.display = "none";
}

/* Aggiorna storico */
function updateMoodHistory() {
    const container = document.getElementById("mood-history");
    container.innerHTML = moodHistory
        .map(m => `
            <div class="mood-entry" style="border-left: 6px solid ${m.color};">
                ${m.emoji} <strong>${m.date}</strong><br>${m.note}
            </div>
        `)
        .join("");
}
updateMoodHistory();

/* Widget update */
function updateWidget(entry) {
    const widget = document.getElementById("mood-widget");
    const emojiSpan = document.getElementById("mood-widget-emoji");
    const textSpan = document.getElementById("mood-widget-text");

    emojiSpan.innerText = entry.emoji;
    textSpan.innerText = entry.note;

    // Manteniamo il colore dell'emozione
    widget.style.background = `${selectedMood.color}dd`;
    widget.style.backdropFilter = "blur(6px)";
    widget.style.border = `1px solid ${selectedMood.color}70`;
    widget.style.boxShadow = `0 0 15px ${selectedMood.color}90`;

    // Mostra widget
    widget.style.display = "flex";

    // Salva nello storage per persistenza
    localStorage.setItem("lastMood", JSON.stringify(entry));

    // Animazione pop
    widget.classList.remove("widget-pulse");
    void widget.offsetWidth; // reset trick
    widget.classList.add("widget-pulse");
}

function loadLastMoodWidget() {
    const widget = document.getElementById("mood-widget");
    if (!widget) return;

    const lastMood = localStorage.getItem("lastMood");

    if (!lastMood) {
        widget.style.display = "flex"; // Mostriamo anche senza entry
        document.getElementById("mood-widget-emoji").innerText = "💖";
        document.getElementById("mood-widget-text").innerText = "Come ti senti oggi?";
        widget.style.background = "#ffffff44"; // colore neutro
        widget.style.border = "1px solid #ffffff50";
        widget.style.boxShadow = "0 0 10px #00000033";
        return;
    }

    const entry = JSON.parse(lastMood);
    const emojiSpan = document.getElementById("mood-widget-emoji");
    const textSpan = document.getElementById("mood-widget-text");

    emojiSpan.innerText = entry.emoji;
    textSpan.innerText = entry.note;

    widget.style.background = `${entry.color}dd`;
    widget.style.backdropFilter = "blur(6px)";
    widget.style.border = `1px solid ${entry.color}70`;
    widget.style.boxShadow = `0 0 15px ${entry.color}90`;

    widget.style.display = "flex"; // Importantissimo: sempre visibile
    widget.classList.remove("widget-pulse");
    void widget.offsetWidth;
    widget.classList.add("widget-pulse");
}

document.addEventListener("DOMContentLoaded", () => {
    loadLastMoodWidget();
});

/* Animazione notifica opzione B */
function sendMoodNotification() {
    const box = document.getElementById("mood-notification");

    box.classList.add("show");
    setTimeout(() => {
        box.classList.remove("show");
    }, 2600);
}

// ---------- ORACOLO ----------
let selectedOracleTheme = "love";
let selectedOracleColor = "#ff4d6d";
let oracleHistory = JSON.parse(localStorage.getItem("oracleHistory")) || [];

const oracleMessages = {
    love: [
        "L'amore ti sorprenderà oggi!",
        "Il cuore guiderà le tue azioni.",
        "Una dolce sorpresa ti attende.",
        "Abbraccia chi ami senza esitazione.",
        "Oggi è il giorno perfetto per dichiarare i tuoi sentimenti.",
        "Il tuo amore crescerà inaspettatamente.",
        "Una parola gentile aprirà il cuore di qualcuno.",
        "Non temere di mostrare vulnerabilità.",
        "I piccoli gesti creano grandi emozioni.",
        "Una connessione profonda ti attende.",
        "La passione illuminerà la tua giornata.",
        "Un messaggio inatteso porterà gioia.",
        "Ascolta il cuore, non la testa.",
        "Oggi fiorirà un sentimento speciale.",
        "Il tuo sorriso conquisterà chi ti sta vicino.",
        "Lascia andare i timori: l'amore è qui.",
        "La complicità con chi ami si rafforzerà.",
        "Un incontro emozionante è vicino.",
        "La gentilezza nutre l'amore.",
        "Una sorpresa romantica ti farà battere il cuore.",
        "Mostra gratitudine a chi ami.",
        "Un piccolo gesto sarà ricordato per sempre.",
        "Oggi il destino favorisce i cuori sinceri.",
        "La passione prenderà il sopravvento.",
        "Una lettera o un messaggio cambierà la giornata.",
        "Non sottovalutare il potere di un abbraccio.",
        "Le emozioni sincere creano magia.",
        "Un sentimento nascosto verrà alla luce.",
        "La tua presenza sarà fonte di gioia.",
        "Oggi l'amore troverà nuove strade.",
        "Sii audace nel dimostrare affetto.",
        "Un gesto romantico farà la differenza.",
        "Chi ami apprezzerà la tua sincerità.",
        "La complicità crescerà tra voi.",
        "Un pensiero d'amore porterà luce.",
        "Oggi sarai fonte di ispirazione romantica.",
        "Non rimandare le parole importanti.",
        "Il cuore saprà guidarti.",
        "Piccoli atti d'amore avranno grande impatto.",
        "Una sorpresa farà battere forte il cuore.",
        "Ascolta le emozioni, non i dubbi.",
        "L'amore è vicino, apri gli occhi.",
        "Oggi nascerà un ricordo speciale.",
        "Un incontro inatteso porterà gioia.",
        "La passione sarà un faro nella giornata.",
        "Esprimi gratitudine a chi ami.",
        "Un gesto semplice cambierà tutto.",
        "Lascia che il cuore parli.",
        "L'amore vero si riconosce nei dettagli.",
        "Un messaggio dolce cambierà la prospettiva.",
        "Sii presente, l'amore apprezza.",
        "La tua sincerità creerà legami forti.",
        "Oggi una scintilla accenderà emozioni.",
        "Non temere di seguire il cuore.",
        "Un gesto inatteso sorprenderà chi ami.",
        "La passione illuminerà la relazione.",
        "Un abbraccio sincero porterà calore.",
        "Mostra apprezzamento, sarà ricambiato.",
        "Oggi il cuore avrà ragione.",
        "Un piccolo gesto d'amore sarà memorabile.",
        "Sii chiaro nei tuoi sentimenti.",
        "La magia nasce dall'autenticità.",
        "Un messaggio affettuoso cambierà la giornata.",
        "Chi ami sentirà la tua vicinanza.",
        "Un sentimento nascosto si manifesterà.",
        "La complicità renderà speciale la giornata.",
        "Oggi il cuore troverà pace.",
        "Un sorriso conquisterà chi ti è vicino.",
        "Non aspettare per esprimere amore.",
        "La sincerità crea legami indissolubili.",
        "Un piccolo regalo porterà gioia.",
        "Oggi la passione sarà intensa.",
        "Ascolta le parole del cuore.",
        "Un messaggio inatteso porterà emozioni.",
        "L'amore vero trova sempre una via.",
        "Sii aperto alle nuove emozioni.",
        "La gentilezza rafforza i legami.",
        "Oggi nascerà un ricordo romantico.",
        "Un gesto semplice emozionerà profondamente.",
        "Non temere di mostrare sentimenti.",
        "La complicità crea magia.",
        "Oggi le emozioni guideranno le tue azioni.",
        "Un incontro speciale illuminerà la giornata.",
        "Il cuore saprà indicare la giusta strada.",
        "Un messaggio dolce sorprenderà chi ami.",
        "Sii audace nel mostrare affetto.",
        "La passione porterà energia positiva.",
        "Oggi l'amore si manifesterà chiaramente.",
        "Un piccolo gesto cambierà tutto.",
        "Lascia che le emozioni guidino le tue scelte.",
        "Chi ami sentirà la tua presenza.",
        "Oggi un ricordo romantico nascerà.",
        "Un abbraccio sincero cambierà la giornata.",
        "La sincerità sarà la chiave.",
        "Un gesto d'amore sorprenderà tutti.",
        "Oggi il cuore prenderà il sopravvento.",
        "Ascolta le emozioni vere."
    ],
    peace: [
        "Respira e trova serenità.",
        "La calma è la chiave per affrontare tutto.",
        "Oggi è perfetto per meditare e rilassarsi.",
        "Lascia andare ciò che non puoi controllare.",
        "Un momento di silenzio porterà chiarezza.",
        "La pazienza sarà premiata.",
        "Cerca armonia nei piccoli dettagli.",
        "Oggi è ideale per ritrovare equilibrio.",
        "Ascolta il tuo respiro, trova pace.",
        "Rallenta, il mondo può aspettare.",
        "Un gesto gentile porterà serenità.",
        "La calma genera forza interiore.",
        "Oggi evita conflitti inutili.",
        "Il silenzio ha un valore profondo.",
        "Concentrati sul presente, non sul passato.",
        "Un pensiero positivo cambia la giornata.",
        "Lascia che la mente si liberi.",
        "La pazienza porta saggezza.",
        "Cerca armonia nei rapporti.",
        "Oggi coltiva la gratitudine.",
        "Respira profondamente, senti la calma.",
        "Un momento di meditazione rinfresca la mente.",
        "Evita stress inutili.",
        "La serenità nasce dall'accettazione.",
        "Oggi sii gentile con te stesso.",
        "Trova equilibrio tra mente e cuore.",
        "Lascia scorrere le preoccupazioni.",
        "Un sorriso porta pace a chi ti circonda.",
        "Ritrova armonia in gesti semplici.",
        "Oggi ascolta la natura.",
        "La calma è una forma di coraggio.",
        "Evita giudizi frettolosi.",
        "Un pensiero positivo porta chiarezza.",
        "Rallenta e goditi il momento.",
        "Oggi la serenità guiderà le tue azioni.",
        "Respira, tutto è sotto controllo.",
        "Lascia andare ciò che appesantisce.",
        "Il silenzio rivela risposte profonde.",
        "Oggi è un giorno di pace interiore.",
        "Sii gentile con gli altri e con te stesso.",
        "Concentrati su ciò che conta davvero.",
        "Ritrova calma nei gesti quotidiani.",
        "La pazienza trasforma le difficoltà.",
        "Oggi scegli la serenità.",
        "Evita conflitti inutili.",
        "La calma porta chiarezza mentale.",
        "Sii presente nel qui e ora.",
        "Rallenta e lascia andare l'ansia.",
        "Coltiva gratitudine e armonia.",
        "Oggi la mente sarà limpida.",
        "Un momento di meditazione porterà pace.",
        "Sii gentile con te stesso.",
        "Ritrova equilibrio interiore.",
        "La calma genera forza.",
        "Oggi ascolta il silenzio.",
        "Evita preoccupazioni superflue.",
        "Respira profondamente e rilassati.",
        "Un gesto gentile crea armonia.",
        "Sii paziente con il mondo.",
        "La serenità è contagiosa.",
        "Oggi lascia andare ciò che appesantisce.",
        "Rallenta e osserva.",
        "Trova pace nei dettagli quotidiani.",
        "La calma porta chiarezza.",
        "Oggi scegli di essere sereno.",
        "Sii presente nei piccoli gesti.",
        "Un pensiero positivo porta equilibrio.",
        "Lascia fluire ciò che non puoi cambiare.",
        "La pazienza genera saggezza.",
        "Ritrova armonia dentro e fuori di te.",
        "Oggi la serenità guiderà ogni passo.",
        "Evita stress inutili.",
        "Respira e lascia andare la tensione.",
        "Un momento di calma rinfresca l'anima.",
        "Sii gentile e compassionevole.",
        "Rallenta e ascolta il tuo cuore.",
        "La calma porta chiarezza interiore.",
        "Oggi scegli l'equilibrio.",
        "Lascia che il silenzio parli.",
        "Respira profondamente e rilassati.",
        "Coltiva gratitudine e armonia interiore.",
        "Sii paziente con te stesso.",
        "Oggi osserva con calma ciò che ti circonda.",
        "Ritrova equilibrio e serenità.",
        "La calma trasforma la prospettiva.",
        "Un gesto gentile porta pace.",
        "Sii presente e respira.",
        "Oggi scegli la tranquillità.",
        "Lascia scorrere le preoccupazioni.",
        "Rallenta e trova armonia.",
        "Respira e senti la calma interiore.",
        "Oggi lascia andare ciò che pesa.",
        "Sii gentile con te stesso e con gli altri.",
        "La pace nasce dall'accettazione.",
        "Ritrova equilibrio nella giornata."
    ],
    motivation: [
        "Puoi superare qualsiasi ostacolo!",
        "Oggi è il giorno giusto per iniziare qualcosa di nuovo.",
        "Il successo arriva a chi non si arrende.",
        "Non smettere mai di credere in te stesso.",
        "Ogni passo avanti è un progresso.",
        "Le sfide sono opportunità mascherate.",
        "Oggi puoi trasformare i tuoi sogni in realtà.",
        "Non temere di fallire, serve esperienza.",
        "Sii audace e coraggioso oggi.",
        "Ogni piccolo gesto conta.",
        "La perseveranza porta risultati.",
        "Oggi hai il potere di cambiare la tua giornata.",
        "Credi nelle tue capacità.",
        "Ogni difficoltà è un insegnamento.",
        "Il coraggio genera opportunità.",
        "Sii determinato e costante.",
        "Oggi puoi fare la differenza.",
        "Non arrenderti mai davanti agli ostacoli.",
        "Ogni azione positiva crea energia.",
        "La motivazione nasce dentro di te.",
        "Oggi affronta tutto con grinta.",
        "Sii persistente e fiducioso.",
        "Ogni fallimento insegna qualcosa.",
        "Il futuro appartiene a chi osa.",
        "Oggi puoi sorprendere te stesso.",
        "La disciplina porta libertà.",
        "Sii costante e vedrai risultati.",
        "Ogni giorno è un'opportunità.",
        "Oggi scegli di essere produttivo.",
        "Non temere le sfide, affrontale.",
        "Ogni passo conta nel cammino.",
        "La fiducia in te stesso è la chiave.",
        "Oggi costruisci il tuo successo.",
        "Non lasciare che la paura ti blocchi.",
        "Ogni esperienza è preziosa.",
        "Sii intraprendente e determinato.",
        "Oggi il tuo impegno farà la differenza.",
        "Ogni azione positiva si accumula.",
        "Sii resiliente davanti alle difficoltà.",
        "Oggi puoi superare limiti precedenti.",
        "La motivazione ti guiderà.",
        "Ogni sforzo porta risultati.",
        "Oggi agisci con coraggio.",
        "Non aspettare il momento perfetto.",
        "Ogni giorno è un nuovo inizio.",
        "Sii audace nelle tue scelte.",
        "Oggi affronta tutto con energia.",
        "La costanza premia sempre.",
        "Ogni obiettivo è raggiungibile.",
        "Sii determinato e proattivo.",
        "Oggi trasforma le idee in azione.",
        "Non perdere fiducia in te stesso.",
        "Ogni ostacolo è superabile.",
        "Sii forte e concentrato.",
        "Oggi scegli di avanzare.",
        "Ogni azione conta per il futuro.",
        "Sii paziente e costante.",
        "Oggi la tua motivazione brillerà.",
        "Non lasciare che dubbi fermino l’azione.",
        "Ogni passo avanti è un successo.",
        "Sii audace e perseverante.",
        "Oggi puoi raggiungere nuovi traguardi.",
        "Ogni sfida rende più forte.",
        "Sii creativo e intraprendente.",
        "Oggi scegli la determinazione.",
        "Ogni piccolo progresso è importante.",
        "Sii positivo e fiducioso.",
        "Oggi affronta ogni compito con energia.",
        "Ogni azione giusta porta frutto.",
        "Sii tenace e concentrato.",
        "Oggi puoi realizzare obiettivi concreti.",
        "Non smettere mai di provare.",
        "Ogni giorno porta nuove possibilità.",
        "Sii coraggioso nelle tue scelte.",
        "Oggi supera ogni barriera mentale.",
        "Ogni sforzo è un passo verso il successo.",
        "Sii disciplinato e motivato.",
        "Oggi la tua energia sarà contagiosa.",
        "Non arrenderti davanti alle difficoltà.",
        "Ogni azione giusta crea opportunità.",
        "Sii determinato e positivo.",
        "Oggi costruisci il tuo cammino.",
        "Ogni traguardo è raggiungibile.",
        "Sii perseverante e fiducioso.",
        "Oggi trasforma le idee in risultati.",
        "Ogni sfida è un’opportunità mascherata.",
        "Sii audace e concentrato.",
        "Oggi agisci con grinta.",
        "Ogni passo avanti conta."
    ],
    fun: [
        "Sorridi, la giornata porterà gioia!",
        "Un momento divertente ti sorprenderà.",
        "Non dimenticare di ridere oggi!",
        "Oggi trova il lato positivo in tutto.",
        "La leggerezza porta serenità.",
        "Un piccolo scherzo farà sorridere qualcuno.",
        "Ridi insieme a chi ami.",
        "La gioia si moltiplica condividendola.",
        "Oggi dedicati a un hobby che ami.",
        "Il buonumore contagia chi ti circonda.",
        "Un sorriso può cambiare la giornata.",
        "Oggi sorprendi qualcuno con allegria.",
        "La leggerezza è una medicina per l’anima.",
        "Ridi anche delle piccole cose.",
        "Oggi lascia spazio alla creatività.",
        "Il divertimento è un diritto quotidiano.",
        "Condividi risate con chi ti sta vicino.",
        "Oggi la felicità si trova nei dettagli.",
        "Ridi senza motivo.",
        "Un piccolo gioco porta gioia.",
        "Oggi sorridi a un estraneo.",
        "La leggerezza rende tutto più semplice.",
        "Ridi dei piccoli contrattempi.",
        "Oggi ascolta musica che ti fa ridere.",
        "La gioia nasce dai piccoli gesti.",
        "Ridi con gli amici.",
        "Oggi trova humor anche nelle difficoltà.",
        "Un momento giocoso rinfresca la mente.",
        "Ridi senza pensare al tempo.",
        "Oggi sorprendi qualcuno con allegria.",
        "La leggerezza rende la giornata speciale.",
        "Ridi di cuore, non trattenerti.",
        "Oggi fai qualcosa che ti fa ridere.",
        "Un sorriso cambia l’energia dell’ambiente.",
        "Ridi anche delle piccole imperfezioni.",
        "Oggi divertiti senza colpa.",
        "La gioia è contagiosa, condividila.",
        "Ridi mentre fai le cose quotidiane.",
        "Oggi trova momenti di allegria inattesi.",
        "Un piccolo gesto giocoso porta felicità.",
        "Ridi insieme alla natura.",
        "Oggi dedica tempo al gioco.",
        "La leggerezza crea magia nella giornata.",
        "Ridi di te stesso.",
        "Oggi sorprendi qualcuno con un sorriso.",
        "Il buonumore è una scelta quotidiana.",
        "Ridi e lascia andare tensioni.",
        "Oggi trova umorismo nelle sfide.",
        "Un momento divertente rende la giornata migliore.",
        "Ridi con leggerezza e serenità.",
        "Oggi gioca e rilassati.",
        "La felicità si trova nelle piccole cose.",
        "Ridi con chi ti circonda.",
        "Oggi fai sorridere qualcuno.",
        "La leggerezza apre nuove prospettive.",
        "Ridi e lascia andare lo stress.",
        "Oggi trova gioia inaspettata.",
        "Un piccolo momento di allegria cambia la giornata.",
        "Ridi e condividi felicità.",
        "Oggi rendi speciale un momento semplice.",
        "Il buonumore guida la giornata.",
        "Ridi senza motivo apparente.",
        "Oggi trova felicità anche nelle sfide.",
        "Un sorriso può cambiare l’umore degli altri.",
        "Ridi con entusiasmo.",
        "Oggi celebra piccole vittorie.",
        "La leggerezza rende tutto più bello.",
        "Ridi e goditi il momento.",
        "Oggi sorprendi te stesso con gioia.",
        "Un momento divertente illuminerà la giornata.",
        "Ridi di cuore e sinceramente.",
        "Oggi trova umorismo nelle piccole cose.",
        "La felicità nasce dal divertimento.",
        "Ridi e porta leggerezza agli altri.",
        "Oggi dedica tempo alla gioia pura.",
        "Un sorriso inatteso porta magia.",
        "Ridi con spontaneità.",
        "Oggi trova piacere nelle piccole cose.",
        "La leggerezza è energia positiva.",
        "Ridi e diffondi buonumore.",
        "Oggi rendi speciale ogni momento."
    ]
};

/* Selezione tema */
document.querySelectorAll(".oracle-theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".oracle-theme-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        selectedOracleTheme = btn.dataset.theme;
        selectedOracleColor = btn.dataset.color;

        const anim = document.getElementById("oracle-animation");
        anim.style.background = `radial-gradient(circle, ${selectedOracleColor} 0%, #ffffff30 100%)`;
        anim.querySelector(".oracle-glow").style.boxShadow = `0 0 20px ${selectedOracleColor}, 0 0 40px ${selectedOracleColor}70, 0 0 60px ${selectedOracleColor}50`;
    });
});

/* Chiedi all'oracolo */
document.getElementById("ask-oracle-btn").addEventListener("click", () => {
    const anim = document.getElementById("oracle-animation");
    const textEl = document.getElementById("oracle-text");

    // Reset testo e mostra sfera
    textEl.classList.remove("show");
    textEl.innerText = "";
    anim.style.display = "block";
    anim.style.background = `radial-gradient(circle, ${selectedOracleColor} 0%, #ffffff30 100%)`;
    anim.querySelector(".oracle-glow").style.boxShadow = `0 0 20px ${selectedOracleColor}, 0 0 40px ${selectedOracleColor}70, 0 0 60px ${selectedOracleColor}50`;

    setTimeout(() => {
        anim.style.display = "none";

        // Messaggio casuale dal tema
        const messages = oracleMessages[selectedOracleTheme];
        const msg = messages[Math.floor(Math.random() * messages.length)];

        // Mostra testo con animazione
        textEl.style.color = selectedOracleColor;
        textEl.innerText = msg;
        void textEl.offsetWidth; // reflow
        setTimeout(() => textEl.classList.add("show"), 50);

        // Salva nello storico
        oracleHistory.unshift({ theme: selectedOracleTheme, text: msg, date: new Date().toLocaleString(), color: selectedOracleColor });
        if (oracleHistory.length > 50) oracleHistory.pop();
        localStorage.setItem("oracleHistory", JSON.stringify(oracleHistory));

        renderOracleHistory();
    }, 2000);
});

/* Funzione tipo “typeWriter” */


/* Storico */
function renderOracleHistory() {
    const container = document.getElementById("oracle-history");
    container.innerHTML = `
        ${oracleHistory.map(h => `
            <div class="mood-entry" style="border-left: 6px solid ${h.color};">
                ${h.text} <br><strong>${h.date}</strong>
            </div>
        `).join("")}
    `;
}

/* Cancella tutto lo storico */
function clearOracleHistory() {
    if (!confirm("Sei sicuro di voler cancellare tutto lo storico dell'Oracolo?")) return;
    oracleHistory = [];
    localStorage.removeItem("oracleHistory");
    renderOracleHistory();
}

// ---------- PHOTOBOOTH ----------
let photoboothShots = [];
let shotIndex = 0;
const totalShots = 3;

const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot-canvas");
const countdownEl = document.getElementById("countdown");
const previewContainer = document.getElementById("preview-container");
const startBtn = document.getElementById("start-photobooth-btn");
const downloadBtn = document.getElementById("download-btn");

// Accesso webcam
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
    } catch (err) {
        alert("Impossibile accedere alla webcam.");
        console.error(err);
    }
}

// Countdown e scatto
function takeShot() {
    if (shotIndex >= totalShots) {
        createFinalImage();
        return;
    }

    let count = 3;
    countdownEl.innerText = count;
    const interval = setInterval(() => {
        count--;
        countdownEl.innerText = count > 0 ? count : "📸";
        if (count === 0) {
            clearInterval(interval);
            countdownEl.innerText = "📸";
            countdownEl.style.transform = "scale(1.5)";
            setTimeout(() => countdownEl.style.transform = "scale(1)", 300);
            snapPhoto();
            shotIndex++;
            setTimeout(takeShot, 800);
        }
    }, 1000);
}

function snapPhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL("image/png");
    photoboothShots.push(imgData);

    // Mostra anteprima
    const imgEl = document.createElement("img");
    imgEl.src = imgData;
    previewContainer.appendChild(imgEl);
}

// Composizione finale in verticale
function createFinalImage() {
    const width = video.videoWidth;
    const border = 20; // bordo bianco tra le foto
    const height = video.videoHeight * totalShots + border * (totalShots + 1);

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Sfondo bianco per tutto il canvas (bordo esterno)
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    photoboothShots.forEach((shot, i) => {
        const img = new Image();
        img.src = shot;
        img.onload = () => {
            // Calcola y in base all'indice e al bordo
            const y = border + i * (video.videoHeight + border);
            ctx.drawImage(img, 0, y, width, video.videoHeight);

            if (i === photoboothShots.length - 1) {
                // Mostra risultato finale
                const finalImg = new Image();
                finalImg.src = canvas.toDataURL("image/png");
                finalImg.style.width = "300px";
                finalImg.style.display = "block";
                finalImg.style.margin = "0 auto"; // centratura
                previewContainer.innerHTML = "";
                previewContainer.appendChild(finalImg);
                downloadBtn.style.display = "inline-block";
            }
        };
    });
}

// Download immagine
downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "photobooth.png";
    link.click();
    // reset
    previewContainer.innerHTML = "";
    downloadBtn.style.display = "none";
});

// Avvia photobooth
startBtn.addEventListener("click", () => {
    photoboothShots = [];
    shotIndex = 0;
    previewContainer.innerHTML = "";
    downloadBtn.style.display = "none";
    takeShot();
});

// Start camera all’entrata nella sezione
function initPhotobooth() {
    startBtn.disabled = false; // assicurati che il pulsante start sia attivo
    startCamera();
}

function resetPhotobooth() {
    // Stop stream della webcam
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }

    // Reset canvas e anteprima
    canvas.width = canvas.height = 0;
    previewContainer.innerHTML = "";
    countdownEl.innerText = "";

    // Reset pulsante e variabili
    startBtn.disabled = false;
    downloadBtn.style.display = "none";
    photoboothShots = [];
    shotIndex = 0;
}
// ---------- MESSAGGI SPECIALI ----------
let specials = JSON.parse(localStorage.getItem('specials')) || [];
function addSpecialMessage() {
    const val = document.getElementById('special-input').value.trim();
    if (!val) return;
    specials.push(val);
    localStorage.setItem('specials', JSON.stringify(specials));
    document.getElementById('special-input').value = '';
    renderSpecials();
}
function renderSpecials() {
    const container = document.querySelector('.special-messages');
    container.innerHTML = '';
    specials.forEach(msg => { const p = document.createElement('p'); p.innerText = msg; container.appendChild(p); });
}
renderSpecials();
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("mood-widget").style.display = "none";
});

function resetAllData() {
    // Rimuove tutti i dati degli utenti
    localStorage.removeItem("loveDashboardUsers");
    localStorage.removeItem("currentUserPassword");

    // Nasconde tutte le sezioni
    document.getElementById("intro").style.display = "none";
    document.querySelectorAll(".section").forEach(s => s.style.display = "none");

    // Mostra login e registrazione
    document.getElementById("login").style.display = "block";
    document.getElementById("login-section").style.display = "block";
    document.getElementById("register-section").style.display = "block";

    // Nasconde pulsante logout se presente
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.style.display = "none";

    alert("Tutti i dati sono stati resettati. Puoi registrare un nuovo utente!");
}

