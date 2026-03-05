const ball = document.getElementById("ball");
const navbar=document.querySelector(".navbar");
const robotContainer = document.getElementById("robot-container");
const eye1 = document.getElementById("eye1");
const eye2 = document.getElementById("eye2");
const robot = document.getElementById("robot");
const intro = document.getElementById("intro");
const home = document.getElementById("home");
const cursor = document.getElementById("cursor");
const body = document.body;

let cx = window.innerWidth / 2;
let cy = window.innerHeight / 2;
let tx = cx;
let ty = cy;
let running = false;
navbar.classList.add("hidden");

// --- Ball bounce ---
function bounceBall(times) {
  let count = 0;
  function bounce() {
    if (count >= times) {
      ball.style.display = 'none';
      showRobot();
      return;
    }
    ball.style.transition = "bottom 0.3s ease-out";
    ball.style.bottom = "150px";
    setTimeout(() => {
      ball.style.transition = "bottom 0.3s ease-in";
      ball.style.bottom = "50px";
    }, 300);
    count++;
    setTimeout(bounce, 600);
  }
  bounce();
}

// --- Show robot from bottom ---
function showRobot() {
  robotContainer.style.display = "block";
  setTimeout(() => {
    robotContainer.style.top = "0"; // slide from bottom
    cursor.style.display = "block";
    startRobotEyes();
  }, 50);
}

// --- Automatic cursor target for eyes ---
function newTarget() {
  const rect = robot.getBoundingClientRect();
  const margin = 40;
  do {
    tx = Math.random() * window.innerWidth;
    ty = Math.random() * window.innerHeight;
  } while (
    tx > rect.left - margin &&
    tx < rect.right + margin &&
    ty > rect.top - margin &&
    ty < rect.bottom + margin
  );
}

// --- Move eyes ---
function moveEyes(x, y) {
  const rect = robot.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx*dx + dy*dy);
  const maxMove = Math.min(distance/20, 15);
  const angle = Math.atan2(dy, dx);
  const moveX = Math.cos(angle) * maxMove;
  const moveY = Math.sin(angle) * maxMove;
  eye1.setAttribute("transform", `translate(${moveX}, ${moveY})`);
  eye2.setAttribute("transform", `translate(${moveX}, ${moveY})`);
}

// --- Animate cursor ---
function animate() {
  if (!running) return;
  cx += (tx - cx) * 0.02;
  cy += (ty - cy) * 0.02;
  cursor.style.left = cx + "px";
  cursor.style.top = cy + "px";
  moveEyes(cx, cy);
  requestAnimationFrame(animate);
}

// --- Robot eyes animation and cursor move left before home ---
function startRobotEyes() {
  running = true;
  animate();
  const randomMove = setInterval(newTarget, 700);

  setTimeout(() => {
    clearInterval(randomMove);
    
    tx=40;
    ty=window.innerHeight/2;

    const checkArrival=setInterval(() => {
      if (Math.abs(cx-tx)<20 && Math.abs(cy-ty)<20) {
        clearInterval(checkArrival);

        setTimeout(() => {
          running = false;
          cursor.style.display = "none";
          intro.style.transform="translateX(100%)";
          home.style.transform="translateX(0%)";
          intro.style.transition= "transform 1s ease";
          navbar.classList.remove("hidden");

        },0);
      }
    }, 20);
  }, 3000);
}

// --- Start ---
bounceBall(3);

document.addEventListener("DOMContentLoaded", function () {

const exploreBtn = document.getElementById("exploreBtn");
const terminal = document.getElementById("terminal");
const terminalText = document.getElementById("terminal-text");

exploreBtn.addEventListener("click", function () {

  navbar.classList.add("hidden");
terminal.style.display = "flex";
terminalText.innerHTML = "";   

const lines = [

"Booting PrajaktaOS...",
"Loading portfolio modules...",
"Connecting to skill database...",
"Authorizing user...",
"ACCESS GRANTED",
"",
"> show skills",
"",
"HTML",
"CSS",
"JavaScript",
"Python",
"DSA with C",
"MySQL",
"Arduino",
"Problem Solving",
"",
"Returning to home..."

];

let lineIndex = 0;

function typeLine() {

if (lineIndex < lines.length) {

let line = lines[lineIndex];
let charIndex = 0;

let typing = setInterval(() => {

terminalText.innerHTML += line.charAt(charIndex);

charIndex++;

if (charIndex >= line.length) {

clearInterval(typing);

terminalText.innerHTML += "<br>";

lineIndex++;

setTimeout(typeLine, 400);

}

}, 40);

}
else {

setTimeout(() => {

terminal.style.display = "none";
navbar.classList.remove("hidden");

window.scrollTo({
top: 0,
behavior: "smooth"
});

}, 1500);

}

}

typeLine();

});

});