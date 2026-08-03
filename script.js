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
        // Correct PIN -> Go to Music Player
        screenPin.classList.remove('active');
        document.getElementById('screen-music').classList.add('active');
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

// --- Typewriter Logic ---
const typewriterText = "You are the most beautiful part of my life...";
let typeIndex = 0;
function typeWriter() {
    if (typeIndex < typewriterText.length) {
        document.getElementById("typewriter").innerHTML += typewriterText.charAt(typeIndex);
        typeIndex++;
        setTimeout(typeWriter, 100);
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

            // Start typewriter
            setTimeout(typeWriter, 1000);

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

function closeModal(id) {
    document.getElementById(id || 'global-modal').classList.remove('active');
}

function showImageModal(src, caption) {
    const imgModal = document.getElementById('image-modal');
    document.getElementById('modal-img').src = src;
    document.getElementById('modal-img-caption').innerText = caption;
    imgModal.classList.add('active');
}

// --- Music Screen Logic ---
function openEnvelopeFromMusic() {
    document.getElementById('screen-music').classList.remove('active');
    document.getElementById('screen-envelope').classList.add('active');
}

// --- Photobooth Logic ---
let stream = null;

async function openPhotobooth() {
    const modal = document.getElementById('photobooth-modal');
    modal.classList.add('active');
    
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        const video = document.getElementById('pb-video');
        video.srcObject = stream;
    } catch (err) {
        alert("Gagal mengakses kamera! Pastikan Anda membukanya lewat koneksi aman (HTTPS) atau mengizinkan akses kamera.");
    }
}

function closePhotobooth() {
    document.getElementById('photobooth-modal').classList.remove('active');
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    // Reset state
    document.getElementById('pb-canvas').style.display = 'none';
    document.getElementById('pb-video').style.display = 'block';
    document.getElementById('btn-capture').classList.remove('hidden');
    document.getElementById('btn-retake').classList.add('hidden');
    document.getElementById('btn-save').classList.add('hidden');
}

function capturePhoto() {
    const video = document.getElementById('pb-video');
    const canvas = document.getElementById('pb-canvas');
    const frame = document.getElementById('pb-frame');
    
    // Set canvas size to video size or container size
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Draw video (mirrored)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    // Source width/height should match the video aspect ratio to avoid distortion, 
    // but a simple drawImage stretches to fit. For a simple photobooth, this is okay.
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Draw frame on top
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    
    // UI changes
    video.style.display = 'none';
    canvas.style.display = 'block';
    
    document.getElementById('btn-capture').classList.add('hidden');
    document.getElementById('btn-retake').classList.remove('hidden');
    document.getElementById('btn-save').classList.remove('hidden');
}

function retakePhoto() {
    document.getElementById('pb-video').style.display = 'block';
    document.getElementById('pb-canvas').style.display = 'none';
    
    document.getElementById('btn-capture').classList.remove('hidden');
    document.getElementById('btn-retake').classList.add('hidden');
    document.getElementById('btn-save').classList.add('hidden');
}

function savePhoto() {
    const canvas = document.getElementById('pb-canvas');
    const dataUrl = canvas.toDataURL('image/png');
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'Photobooth-Salsa.png';
    a.click();
}
