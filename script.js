// Elements
const screenPin = document.getElementById('screen-pin');
const screenEnvelope = document.getElementById('screen-envelope');
const screenCake = document.getElementById('screen-cake');
const screenMain = document.getElementById('screen-main');
const screenMusic = document.getElementById('screen-music');
const bgMusic = document.getElementById('bg-music');

// Buat custom confetti instance yang terikat ke canvas statis dan matikan worker (buat hindari bug WebView)
const confettiCanvas = document.getElementById('confetti-canvas');
const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: false
});

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

    for (let i = 0; i < 15; i++) {
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
    if (!envelope.classList.contains('open')) {
        envelope.classList.add('open');

        // Throw confetti
        customConfetti({
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
    if (!flame.classList.contains('out')) {
        flame.classList.add('out');

        // Throw confetti
        customConfetti({
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
    showModal('🎂', 'Happy Birthday!', 'The most special salsa sabria 🌸');
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
    photos = [];
    document.getElementById('pb-instruction').innerText = "Get ready!";
    document.getElementById('pb-canvas').style.display = 'none';
    document.getElementById('pb-video').style.display = 'block';
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

    photos = [];
    document.getElementById('pb-instruction').innerText = "Get ready!";
    await countdown(3);
    takeSnapshot();

    document.getElementById('pb-instruction').innerText = "Processing greenscreen...";
    setTimeout(renderFinalPhotobooth, 300);
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

function takeSnapshot() {
    const video = document.getElementById('pb-video');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');

    // mirror
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    photos.push(tempCanvas.toDataURL('image/png'));
}

function renderFinalPhotobooth() {
    const canvas = document.getElementById('pb-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 1080;
    canvas.height = 1920;

    const userImg = new Image();
    const frameImg = new Image();

    // 1. Load Foto Hasil Cekrek Dulu
    userImg.onload = () => {
        // 2. Load Gambar Frame
        frameImg.onload = () => {
            // --- A. GAMBAR FOTO USER DI PALING BAWAH ---
            // Koordinat area foto kamu di dalam canvas 1080x1920
            const boxX = canvas.width * 0.10;
            const boxY = canvas.height * 0.15;
            const boxW = canvas.width * 0.80;
            const boxH = canvas.height * 0.70;

            // Crop Cover Logic biar foto gak gepeng
            const imgAspect = userImg.width / userImg.height;
            const boxAspect = boxW / boxH;
            let drawW, drawH, drawX, drawY;

            if (imgAspect > boxAspect) {
                drawH = userImg.height;
                drawW = userImg.height * boxAspect;
                drawX = (userImg.width - drawW) / 2;
                drawY = 0;
            } else {
                drawW = userImg.width;
                drawH = userImg.width / boxAspect;
                drawX = 0;
                drawY = (userImg.height - drawH) / 2;
            }

            // Draw Foto User
            ctx.drawImage(userImg, drawX, drawY, drawW, drawH, boxX, boxY, boxW, boxH);

            // --- B. PROSES CHROMA KEY (Hapus Greenscreen dari Frame) ---
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw Frame ke Temp Canvas
            tempCtx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

            // Ambil data semua piksel frame
            const imgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // Loop untuk cek warna hijau dan jadikan transparan
            for (let i = 0; i < data.length; i += 4) {
                const red = data[i];
                const green = data[i + 1];
                const blue = data[i + 2];

                // Deteksi jika dominan warna HIJAU (Chroma Key)
                if (green > 100 && red < 150 && blue < 150 && green > red * 1.2) {
                    data[i + 3] = 0; // Set Alpha/Transparansi jadi 0 (Bening)
                }
            }

            // Masukkan kembali frame yang sudah di-bolongin
            tempCtx.putImageData(imgData, 0, 0);

            // --- C. TIMPA FRAME TRANSPARAN DI ATAS FOTO USER ---
            ctx.drawImage(tempCanvas, 0, 0);

            // Tampilkan Hasil
            document.getElementById('pb-video').style.display = 'none';
            canvas.style.display = 'block';

            document.getElementById('pb-instruction').innerText = "Looking good! ✨";
            document.getElementById('btn-retake').classList.remove('hidden');
            document.getElementById('btn-save').classList.remove('hidden');
        };

        frameImg.src = "images/mentahanframe4.jpg";
    };

    userImg.src = photos[0];
}

function retakePhoto() {
    document.getElementById('pb-video').style.display = 'block';
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
