// Elements
const screenPin = document.getElementById('screen-pin');
const screenEnvelope = document.getElementById('screen-envelope');
const screenCake = document.getElementById('screen-cake');
const screenMain = document.getElementById('screen-main');
const bgMusic = document.getElementById('bg-music');
const pinDots = document.querySelectorAll('.dot');
const pinDotsContainer = document.querySelector('.pin-dots');

// Modal Elements
const modal = document.getElementById('global-modal');
const modalEmoji = document.getElementById('modal-emoji');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');

const CORRECT_PIN = "010226";
let currentPin = "";

// --- Floating Background Elements ---
function createFloatingElements() {
    const bgContainer = document.getElementById('bg-elements');
    const emojis = ['🌸', '✨', '💖', '🌺'];
    
    for(let i=0; i<15; i++) {
        const el = document.createElement('div');
        el.classList.add('floating-emoji');
        el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        
        el.style.left = Math.random() * 100 + 'vw';
        
        const duration = Math.random() * 10 + 10; // 10s to 20s
        el.style.animationDuration = duration + 's';
        el.style.animationDelay = Math.random() * 10 + 's';
        
        bgContainer.appendChild(el);
    }
}
createFloatingElements();

// --- PIN Logic ---
function updateDots() {
    pinDots.forEach((dot, index) => {
        if (index < currentPin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function pressKey(num) {
    if (currentPin.length < 6) {
        currentPin += num;
        updateDots();
        
        if (currentPin.length === 6) {
            setTimeout(checkPin, 300);
        }
    }
}

function clearPin() {
    currentPin = "";
    updateDots();
}

function backspacePin() {
    if (currentPin.length > 0) {
        currentPin = currentPin.slice(0, -1);
        updateDots();
    }
}

function checkPin() {
    if (currentPin === CORRECT_PIN) {
        // Correct PIN -> Go to Envelope
        screenPin.classList.remove('active');
        screenEnvelope.classList.add('active');
    } else {
        // Wrong PIN
        pinDotsContainer.classList.add('shake');
        setTimeout(() => {
            pinDotsContainer.classList.remove('shake');
            clearPin();
        }, 500);
    }
}

// --- Envelope Logic ---
function openEnvelope() {
    const envelope = document.querySelector('.envelope');
    if(!envelope.classList.contains('open')) {
        envelope.classList.add('open');
        
        // Throw confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Go to cake after 1.5s
        setTimeout(() => {
            screenEnvelope.classList.remove('active');
            screenCake.classList.add('active');
        }, 1500);
    }
}

// --- Cake Logic ---
function blowCandles() {
    const flame = document.getElementById('flame');
    if(!flame.classList.contains('out')) {
        flame.classList.add('out');
        
        // Throw confetti
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
        });

        // Go to main content after 2s
        setTimeout(() => {
            screenCake.classList.remove('active');
            screenMain.classList.add('active');
            
            // Enable scrolling
            document.body.classList.add('scroll-active');
            
            // Play music
            if (bgMusic.paused) {
                bgMusic.volume = 0.5;
                bgMusic.play().catch(e => console.log("Audio play failed."));
            }
        }, 2000);
    }
}

// --- Modal Logic ---
function showModal(emoji, title, text) {
    modalEmoji.innerText = emoji;
    modalTitle.innerText = title;
    modalText.innerText = text;
    modal.classList.add('active');
}

function showCakeModal() {
    showModal('🎂', 'Happy Birthday!', 'The most special Salsa Sabria 🌸');
}

function closeModal() {
    modal.classList.remove('active');
}
