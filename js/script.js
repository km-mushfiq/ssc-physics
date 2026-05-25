// --- Navigation Logic ---
function navigate(pageId) {
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(pageId).classList.add('active');
    document.getElementById('nav-' + pageId).classList.add('active');
    
    window.scrollTo(0, 0);
}

// --- Simulation Logic ---
let carPos = 0;
let simInterval = null;
let timeElapsed = 0; // সময় ট্র্যাক করার জন্য
let wheelAngle1 = 0; // প্রথম ল্যাবের চাকা ঘোরানোর জন্য
const carElement = document.getElementById('simCar');
const speedSlider = document.getElementById('speedSlider');
const speedDisplay = document.getElementById('speedValue');
const timeDisplay = document.getElementById('timeValue'); // সময় দেখানোর এলিমেন্ট
const distanceDisplay = document.getElementById('distanceValue'); // দূরত্ব দেখানোর এলিমেন্ট
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

speedSlider.addEventListener('input', function() {
    speedDisplay.innerText = this.value;
});

function startSimulation() {
    if (simInterval) return; // ইতিমধ্যে চললে কিছু করবে না

    let speed = parseInt(speedSlider.value);
    
    // বাটন স্ট্যাটাস আপডেট
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    startBtn.style.opacity = '0.6';
    pauseBtn.style.opacity = '1';
    
    // আমরা ধরে নিচ্ছি লুপটি প্রতি ৫০ মিলি-সেকেন্ডে (০.০৫ সেকেন্ড) চলে
    const intervalTime = 50; 
    const timeStep = intervalTime / 1000; // সেকেন্ডে রূপান্তর

    simInterval = setInterval(() => {
        timeElapsed += timeStep;
        carPos += speed; // পিক্সেল হিসেবে অবস্থান পরিবর্তন
        
        // চাকা ঘোরানো (প্রথম ল্যাব)
        wheelAngle1 += speed * 3;
        carElement.querySelectorAll('.wheel').forEach(w => w.style.transform = `rotate(${wheelAngle1}deg)`);

        // দূরত্বের হিসাব (s = vt)
        let distance = speed * timeElapsed;

        // ট্র্যাকের শেষ প্রান্তে পৌঁছালে থামানো
        const trackWidth = document.querySelector('.track').offsetWidth;
        if (carPos >= trackWidth - 60) {
            carPos = trackWidth - 60;
            pauseSimulation(); // শেষে পৌঁছালে নিজে থেকেই পজ হয়ে যাবে
            startBtn.disabled = true; // আবার চালানো যাবে না
            startBtn.style.opacity = '0.6';
        }
        
        carElement.style.left = carPos + 'px';

        // UI তে সময় এবং দূরত্ব আপডেট করা (১ দশমিক স্থান পর্যন্ত)
        timeDisplay.innerText = timeElapsed.toFixed(1);
        distanceDisplay.innerText = distance.toFixed(1);

    }, intervalTime); 
}

function pauseSimulation() {
    clearInterval(simInterval);
    simInterval = null;
    
    // বাটন স্ট্যাটাস আপডেট
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.style.opacity = '1';
    pauseBtn.style.opacity = '0.6';
    
    // যদি ট্র্যাকের শেষ মাথায় না থাকে, তবে টেক্সট পরিবর্তন হবে
    const trackWidth = document.querySelector('.track').offsetWidth;
    if (carPos < trackWidth - 60 && carPos > 0) {
        startBtn.innerText = "আবার চালাও";
    }
}

function resetSimulation() {
    clearInterval(simInterval);
    simInterval = null;
    carPos = 0;
    timeElapsed = 0;
    wheelAngle1 = 0; // চাকা রিসেট
    carElement.style.left = '0px';
    carElement.querySelectorAll('.wheel').forEach(w => w.style.transform = `rotate(0deg)`);
    timeDisplay.innerText = "0.0";
    distanceDisplay.innerText = "0.0";
    
    // বাটন স্ট্যাটাস আপডেট
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.style.opacity = '1';
    pauseBtn.style.opacity = '0.6';
    startBtn.innerText = "গাড়ি চালাও";
}

// --- Acceleration Simulation Logic ---
let accelInterval = null;
let accelTimeElapsed = 0;
let accelCarPos = 0;
let accelWheelAngle = 0; // দ্বিতীয় ল্যাবের চাকা ঘোরানোর জন্য

const initVelSlider = document.getElementById('initVelSlider');
const accelSlider = document.getElementById('accelSlider');
const initVelValue = document.getElementById('initVelValue');
const accelValueDisplay = document.getElementById('accelValue');
const accelCarElement = document.getElementById('accelCar');
const startAccelBtn = document.getElementById('startAccelBtn');
const pauseAccelBtn = document.getElementById('pauseAccelBtn');
const accelWind = document.getElementById('accelWind'); // বাতাসের রেখা

initVelSlider.addEventListener('input', () => initVelValue.innerText = initVelSlider.value);
accelSlider.addEventListener('input', () => {
    accelValueDisplay.innerText = accelSlider.value;
    accelValueDisplay.style.color = accelSlider.value < 0 ? "#e74c3c" : "#27ae60";
});

function startAccelSimulation() {
    if (accelInterval) return;

    let u = parseFloat(initVelSlider.value);
    let a = parseFloat(accelSlider.value);
    
    // যদি আদি বেগ ০ এবং ত্বরণও ০ বা ঋণাত্মক হয়, তবে গাড়ি চলবে না
    if (u === 0 && a <= 0 && accelTimeElapsed === 0) {
        alert("গাড়ি চালানোর জন্য আদি বেগ অথবা ধনাত্মক ত্বরণ থাকতে হবে!");
        return;
    }

    startAccelBtn.disabled = true;
    pauseAccelBtn.disabled = false;
    startAccelBtn.style.opacity = '0.6';
    pauseAccelBtn.style.opacity = '1';

    const intervalTime = 50; 
    const timeStep = intervalTime / 1000; 
    const trackWidth = document.getElementById('accelTrack').offsetWidth;

    accelInterval = setInterval(() => {
        accelTimeElapsed += timeStep;
        
        // সূত্র: v = u + at
        let currentVelocity = u + (a * accelTimeElapsed);
        
        // সূত্র: s = ut + 0.5 * a * t^2
        let distance = (u * accelTimeElapsed) + (0.5 * a * Math.pow(accelTimeElapsed, 2));
        
        // বেগ যদি ০ এর নিচে নেমে যায় (ব্রেক করার ফলে থেমে গেছে)
        if (currentVelocity <= 0) {
            currentVelocity = 0;
            clearInterval(accelInterval);
            accelInterval = null;
            
            startAccelBtn.disabled = true;
            pauseAccelBtn.disabled = true;
            pauseAccelBtn.style.opacity = '0.6';
        }

        // ভিজ্যুয়াল পজিশন আপডেট (গ্রাফিক্যাল স্কেলিং: 1m = 3px)
        accelCarPos = distance * 3;

        // চাকা ঘোরানো এবং গতির ইফেক্ট আপডেট
        accelWheelAngle += currentVelocity * 3; 
        accelCarElement.querySelectorAll('.wheel').forEach(w => w.style.transform = `rotate(${accelWheelAngle}deg)`);
        
        if (currentVelocity > 2) {
            accelWind.style.opacity = Math.min(1, currentVelocity / 15); // বেগ বাড়লে বাতাস দৃশ্যমান হবে
            accelWind.style.width = (20 + currentVelocity * 3) + 'px'; // বেগ বাড়লে বাতাসের রেখা লম্বা হবে
        } else {
            accelWind.style.opacity = 0;
        }

        // ট্র্যাকের শেষ প্রান্তে পৌঁছালে থামানো
        if (accelCarPos >= trackWidth - 60) {
            accelCarPos = trackWidth - 60;
            pauseAccelSimulation(); 
            startAccelBtn.disabled = true;
            startAccelBtn.style.opacity = '0.6';
        }
        
        accelCarElement.style.left = accelCarPos + 'px';

        // UI তে মান আপডেট
        document.getElementById('accelTime').innerText = accelTimeElapsed.toFixed(1);
        document.getElementById('accelVel').innerText = currentVelocity.toFixed(1);
        document.getElementById('accelDist').innerText = distance.toFixed(1);

    }, intervalTime); 
}

function pauseAccelSimulation() {
    clearInterval(accelInterval);
    accelInterval = null;
    
    startAccelBtn.disabled = false;
    pauseAccelBtn.disabled = true;
    startAccelBtn.style.opacity = '1';
    pauseAccelBtn.style.opacity = '0.6';
    
    const trackWidth = document.getElementById('accelTrack').offsetWidth;
    if (accelCarPos < trackWidth - 60 && accelCarPos > 0) {
        startAccelBtn.innerText = "আবার চালাও";
    }
}

function resetAccelSimulation() {
    clearInterval(accelInterval);
    accelInterval = null;
    accelTimeElapsed = 0;
    accelCarPos = 0;
    accelWheelAngle = 0;
    
    accelCarElement.style.left = '0px';
    accelCarElement.querySelectorAll('.wheel').forEach(w => w.style.transform = `rotate(0deg)`);
    accelWind.style.opacity = 0;
    
    document.getElementById('accelTime').innerText = "0.0";
    document.getElementById('accelVel').innerText = "0.0";
    document.getElementById('accelDist').innerText = "0.0";
    
    startAccelBtn.disabled = false;
    startAccelBtn.style.opacity = '1';
    startAccelBtn.innerText = "গাড়ি চালাও";
    
    pauseAccelBtn.disabled = true;
    pauseAccelBtn.style.opacity = '0.6';
}