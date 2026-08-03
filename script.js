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
let selectedSongSrc = 'song.mp3';

function selectSong(element, songSrc) {
    document.querySelectorAll('.song-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');
    selectedSongSrc = songSrc;
}

function openEnvelopeFromMusic() {
    // Save chosen song
    bgMusic.src = selectedSongSrc; // Update the audio source
    bgMusic.load();
    
    document.getElementById('screen-music').classList.remove('active');
    document.getElementById('screen-envelope').classList.add('active');
}

// --- Photobooth Logic ---
let stream = null;
let photos = [];
let captureCount = 0;

async function openPhotobooth() {
    const modal = document.getElementById('photobooth-modal');
    modal.classList.add('active');
    
    // Reset
    document.getElementById('pb-instruction').innerText = "Get ready!";
    document.getElementById('pb-canvas').style.display = 'none';
    document.getElementById('pb-video').style.display = 'block';
    document.getElementById('pb-frame').style.display = 'block';
    document.getElementById('btn-capture').classList.remove('hidden');
    document.getElementById('btn-retake').classList.add('hidden');
    document.getElementById('btn-save').classList.add('hidden');
    
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        const video = document.getElementById('pb-video');
        video.srcObject = stream;
    } catch (err) {
        alert("Gagal mengakses kamera! Pastikan Anda membukanya lewat koneksi aman (HTTPS).");
    }
}

function closePhotobooth() {
    document.getElementById('photobooth-modal').classList.remove('active');
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

async function startPhotoboothSequence() {
    document.getElementById('btn-capture').classList.add('hidden');
    document.getElementById('btn-retake').classList.add('hidden');
    document.getElementById('btn-save').classList.add('hidden');
    
    document.getElementById('pb-instruction').innerText = "Get ready!";
    await countdown(3);
    
    document.getElementById('pb-instruction').innerText = "Generating your photo...";
    setTimeout(captureSinglePhoto, 500);
}

function countdown(seconds) {
    return new Promise(resolve => {
        const cdElement = document.getElementById('pb-countdown');
        cdElement.classList.remove('hidden');
        let counter = seconds;
        cdElement.innerText = counter;
        
        const interval = setInterval(() => {
            counter--;
            if (counter > 0) {
                cdElement.innerText = counter;
            } else {
                clearInterval(interval);
                cdElement.classList.add('hidden');
                // flash effect
                const video = document.getElementById('pb-video');
                video.style.opacity = '0';
                setTimeout(() => video.style.opacity = '1', 100);
                resolve();
            }
        }, 1000);
    });
}

function captureSinglePhoto() {
    const video = document.getElementById('pb-video');
    const canvas = document.getElementById('pb-canvas');
    const frame = document.getElementById('pb-frame');
    
    // Set canvas size to match the frame image aspect ratio (1080x1920 is standard for 9:16)
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    
    // 1. Draw video (mirrored and object-fit cover equivalent)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    
    const videoAspect = video.videoWidth / video.videoHeight;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawW, drawH, drawX, drawY;
    if (videoAspect > canvasAspect) {
        drawH = canvas.height;
        drawW = canvas.height * videoAspect;
        drawX = (canvas.width - drawW) / 2;
        drawY = 0;
    } else {
        drawW = canvas.width;
        drawH = canvas.width / videoAspect;
        drawX = 0;
        drawY = (canvas.height - drawH) / 2;
    }
    
    ctx.drawImage(video, drawX, drawY, drawW, drawH);
    ctx.restore();
    
    // 2. Draw frame on top
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    
    // UI changes
    video.style.display = 'none';
    frame.style.display = 'none';
    canvas.style.display = 'block';
    
    document.getElementById('pb-instruction').innerText = "Looking good! ✨";
    document.getElementById('btn-capture').classList.add('hidden');
    document.getElementById('btn-retake').classList.remove('hidden');
    document.getElementById('btn-save').classList.remove('hidden');
}

function retakePhoto() {
    document.getElementById('pb-video').style.display = 'block';
    document.getElementById('pb-frame').style.display = 'block';
    document.getElementById('pb-canvas').style.display = 'none';
    document.getElementById('pb-instruction').innerText = "Get ready!";
    
    document.getElementById('btn-capture').classList.remove('hidden');
    document.getElementById('btn-retake').classList.add('hidden');
    document.getElementById('btn-save').classList.add('hidden');
}

function savePhoto() {
    const canvas = document.getElementById('pb-canvas');
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'Photobooth-Salsa.jpg';
    a.click();
}
