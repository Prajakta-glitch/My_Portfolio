document.addEventListener("DOMContentLoaded", function () {

  // ---------------- ELEMENTS ----------------
  const ball = document.getElementById("ball");
  const navbar = document.querySelector(".navbar");
  const robotContainer = document.getElementById("robot-container");
  const eye1 = document.getElementById("eye1");
  const eye2 = document.getElementById("eye2");
  const robot = document.getElementById("robot");
  const intro = document.getElementById("intro");
  const home = document.getElementById("home");
  const cursor = document.getElementById("cursor");
  const exploreBtn = document.getElementById("exploreBtn");
  const terminal = document.getElementById("terminal");
  const terminalText = document.getElementById("terminal-text");

  // ---------------- VARIABLES ----------------
  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let tx = cx;
  let ty = cy;
  let running = false;

  navbar.classList.add("hidden");

  // ---------------- BALL BOUNCE ----------------
  function bounceBall(times){
    let count = 0;
    function bounce(){
      if(count >= times){
        ball.style.display = "none";
        showRobot();
        return;
      }
      ball.style.transition = "bottom 0.3s ease-out";
      ball.style.bottom = "150px";
      setTimeout(()=>{
        ball.style.transition = "bottom 0.3s ease-in";
        ball.style.bottom = "50px";
      },300);
      count++;
      setTimeout(bounce,600);
    }
    bounce();
  }

  // ---------------- SHOW ROBOT ----------------
  function showRobot(){
    robotContainer.style.display="block";
    setTimeout(()=>{
      robotContainer.style.top="0";
      cursor.style.display="block";
      eye1.classList.add("blink");
      eye2.classList.add("blink");
      startRobotEyes();
    },50);
  }

  // ---------------- RANDOM TARGET ----------------
  function newTarget(){
    const rect = robot.getBoundingClientRect();
    const margin = 40;
    do{
      tx = Math.random() * window.innerWidth;
      ty = Math.random() * window.innerHeight;
    }while(
      tx > rect.left - margin &&
      tx < rect.right + margin &&
      ty > rect.top - margin &&
      ty < rect.bottom + margin
    );
  }

  // ---------------- MOVE ROBOT EYES ----------------
  function moveEyes(x,y){
    const rect = robot.getBoundingClientRect();
    const centerX = rect.left + rect.width/2;
    const centerY = rect.top + rect.height/2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const maxMove = Math.min(distance/20,15);
    const angle = Math.atan2(dy,dx);
    const moveX = Math.cos(angle)*maxMove;
    const moveY = Math.sin(angle)*maxMove;
    eye1.setAttribute("transform",`translate(${moveX},${moveY})`);
    eye2.setAttribute("transform",`translate(${moveX},${moveY})`);
  }

  // ---------------- CURSOR ANIMATION ----------------
  function animate(){
    if(!running) return;
    cx += (tx - cx)*0.02;
    cy += (ty - cy)*0.02;
    cursor.style.left = cx + "px";
    cursor.style.top = cy + "px";
    moveEyes(cx,cy);
    requestAnimationFrame(animate);
  }

  // ---------------- ROBOT INTRO ----------------
  function startRobotEyes(){
    running = true;
    animate();
    const randomMove = setInterval(newTarget,700);
    setTimeout(()=>{
      clearInterval(randomMove);
      tx = 40;
      ty = window.innerHeight/2;
      const checkArrival = setInterval(()=>{
        if(Math.abs(cx-tx)<20 && Math.abs(cy-ty)<20){
          clearInterval(checkArrival);
          running=false;
          cursor.style.display="none";
          intro.style.transition="transform 1s ease";
          intro.style.transform="translateX(-100%)";
          home.style.transform="translateX(0%)";
          navbar.classList.remove("hidden");
        }
      },20);
    },3000);
  }

  // ---------------- START INTRO ----------------
  bounceBall(3);

  // ---------------- TERMINAL SKILLS ----------------
  exploreBtn.addEventListener("click",function(){
    navbar.classList.add("hidden");
    terminal.style.display="flex";
    terminalText.innerHTML="";
    const lines=[
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
    let lineIndex=0;
    function typeLine(){
      if(lineIndex < lines.length){
        let line = lines[lineIndex];
        let charIndex=0;
        let typing = setInterval(()=>{
          terminalText.innerHTML += line.charAt(charIndex);
          charIndex++;
          if(charIndex>=line.length){
            clearInterval(typing);
            terminalText.innerHTML += "<br>";
            lineIndex++;
            setTimeout(typeLine,400);
          }
        },40);
      } else {
        setTimeout(()=>{
          terminal.style.display="none";
          navbar.classList.remove("hidden");
        },1500);
      }
    }
    typeLine();
  });

  // ---------------- MATRIX RAIN ----------------
  const aboutLink=document.querySelector('a[href="#about"]');
  const aboutSection=document.getElementById("about");
  aboutLink.addEventListener("click",function(e){
    e.preventDefault();
    home.style.transform="translateX(-100%)";
    aboutSection.style.transform="translateX(0%)";
    startMatrix();
  });

  function startMatrix(){
    const canvas=document.getElementById("matrixCanvas");
    const ctx=canvas.getContext("2d");
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    const letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*";
    const matrix=letters.split("");
    const fontSize=16;
    const columns=canvas.width/fontSize;
    const drops=[];
    for(let x=0;x<columns;x++) drops[x]=1;
    let matrixRunning=true;
    function draw(){
      if(!matrixRunning) return;
      ctx.fillStyle="rgba(0,0,0,0.05)";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle="#00aaff";
      ctx.font=fontSize+"px monospace";
      for(let i=0;i<drops.length;i++){
        const text=matrix[Math.floor(Math.random()*matrix.length)];
        ctx.fillText(text,i*fontSize,drops[i]*fontSize);
        if(drops[i]*fontSize>canvas.height && Math.random()>0.975) drops[i]=0;
        drops[i]++;
      }
    }
    const interval=setInterval(draw,35);
    setTimeout(()=>{
      matrixRunning=false;
      clearInterval(interval);
      document.getElementById("aboutTerminal").style.opacity=1;
    },2000);
  }

  // ---------------- HOME NAV ----------------
  const homeLink=document.querySelector('a[href="#home"]');
  homeLink.addEventListener("click",function(e){
    e.preventDefault();
    home.style.transform="translateX(0%)";
    aboutSection.style.transform="translateX(100%)";
    history.replaceState(null, null, " ");
  });

});