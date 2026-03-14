document.addEventListener("DOMContentLoaded", function () {

  // ---------------- ELEMENTS ----------------
  const ball = document.getElementById("ball");
  const navbar = document.querySelector(".navbar");
  const robotContainer = document.getElementById("robot-container");
  const eye1 = document.getElementById("eye1");
  const eye2 = document.getElementById("eye2");
  const robot = document.getElementById("robot");
  const intro = document.getElementById("intro");
  const cursor = document.getElementById("cursor");
  const aboutSection = document.getElementById("about");
  const aboutLeft = document.querySelector(".about-left");
  const aboutRight = document.querySelector(".about-right");

  // ---------------- VARIABLES ----------------
  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let tx = cx;
  let ty = cy;
  let running = false;

  document.body.style.overflow = "hidden";
  navbar.classList.add("hidden");

  // ---------------- BALL BOUNCE ----------------
  function bounceBall(times) {
    let count = 0;
    function bounce() {
      if (count >= times) {
        ball.style.display = "none";
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

  // ---------------- SHOW ROBOT ----------------
  function showRobot() {
    robotContainer.style.display = "block";
    setTimeout(() => {
      robotContainer.style.top = "0";
      cursor.style.display = "block";
      startRobotEyes();
    }, 50);
  }

  // ---------------- RANDOM TARGET ----------------
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

  // ---------------- MOVE ROBOT EYES ----------------
  function moveEyes(x, y) {
    const rect = robot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxMove = Math.min(distance / 20, 15);
    const angle = Math.atan2(dy, dx);
    eye1.setAttribute("transform", `translate(${Math.cos(angle)*maxMove},${Math.sin(angle)*maxMove})`);
    eye2.setAttribute("transform", `translate(${Math.cos(angle)*maxMove},${Math.sin(angle)*maxMove})`);
  }

  // ---------------- CURSOR ANIMATION ----------------
  function animate() {
    if (!running) return;
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    cursor.style.left = cx + "px";
    cursor.style.top = cy + "px";
    moveEyes(cx, cy);
    requestAnimationFrame(animate);
  }

  // ---------------- FINISH INTRO ----------------
  function finishIntro() {
    running = false;
    cursor.style.display = "none";
    intro.classList.add("hide");
    setTimeout(() => { intro.style.display = "none"; }, 800);
    navbar.classList.remove("hidden");
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  }

  // ---------------- ROBOT INTRO ----------------
  function startRobotEyes() {
    running = true;
    animate();
    const randomMove = setInterval(newTarget, 700);
    setTimeout(() => {
      clearInterval(randomMove);
      tx = 40;
      ty = window.innerHeight / 2;
      const fallback = setTimeout(() => {
        clearInterval(checkArrival);
        finishIntro();
      }, 3000);
      const checkArrival = setInterval(() => {
        if (Math.abs(cx - tx) < 20 && Math.abs(cy - ty) < 20) {
          clearInterval(checkArrival);
          clearTimeout(fallback);
          finishIntro();
        }
      }, 20);
    }, 3000);
  }

  // ---------------- START ----------------
  bounceBall(3);

  // ---------------- SMOOTH NAV SCROLL ----------------
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").replace("#", "");
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // ---------------- ABOUT SCROLL ANIMATION ----------------
  const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        aboutLeft.classList.add("visible");
        aboutRight.classList.add("visible");
      } else {
        aboutLeft.classList.remove("visible");
        aboutRight.classList.remove("visible");
      }
    });
  }, { threshold: 0.2 });
  aboutObserver.observe(aboutSection);

  // ---------------- THREE.JS WORLD ----------------
  const script3d = document.createElement("script");
  script3d.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
  script3d.onload = initWorld;
  document.head.appendChild(script3d);

  function initWorld() {
    const canvas = document.getElementById("three-canvas");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0f172a, 20, 80);

    const camera = new THREE.PerspectiveCamera(55, canvas.offsetWidth / canvas.offsetHeight, 0.1, 200);
    camera.position.set(0, 14, 28);
    camera.lookAt(0, 0, 0);

    // LIGHTS
    const ambient = new THREE.AmbientLight(0x7c3aed, 1.2);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xddd6fe, 2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const purpleLight = new THREE.PointLight(0xa855f7, 2, 40);
    purpleLight.position.set(-8, 8, 0);
    scene.add(purpleLight);

    // WORLD GROUP
    const world = new THREE.Group();
    scene.add(world);

    // GROUND
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(18, 18, 1.5, 64),
      new THREE.MeshLambertMaterial({ color: 0x2e1065 })
    );
    ground.position.y = -1;
    world.add(ground);

    // HILL
    const hill = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 12, 3, 32),
      new THREE.MeshLambertMaterial({ color: 0x3b0764 })
    );
    hill.position.y = 0.5;
    world.add(hill);

    // MOUNTAINS
    function makeMountain(x, z, h, r, color) {
      const m = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, 6),
        new THREE.MeshLambertMaterial({ color })
      );
      m.position.set(x, h / 2, z);
      world.add(m);
    }
    makeMountain(-6, -10, 7, 3, 0x4c1d95);
    makeMountain(6, -10, 9, 3.5, 0x3b0764);
    makeMountain(12, -4, 6, 2.5, 0x4c1d95);
    makeMountain(-12, -4, 8, 3, 0x3b0764);
    makeMountain(0, -14, 11, 4, 0x2e1065);
    makeMountain(-14, 4, 5, 2, 0x4c1d95);
    makeMountain(14, 4, 7, 2.8, 0x3b0764);

    // TREES
    function makeTree(x, z, scale = 1) {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 1 * scale, 6),
        new THREE.MeshLambertMaterial({ color: 0x1e1b4b })
      );
      trunk.position.y = 0.5 * scale;
      g.add(trunk);
      [[1.8, 1.2], [2.6, 0.9], [3.2, 0.6]].forEach(([py, r]) => {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(r * scale, 1.2 * scale, 6),
          new THREE.MeshLambertMaterial({ color: 0x4c1d95 })
        );
        cone.position.y = py * scale;
        g.add(cone);
      });
      g.position.set(x, 0.3, z);
      world.add(g);
    }
    makeTree(-5, -7, 1.1); makeTree(5, -8, 1.3);
    makeTree(-9, -6, 0.9); makeTree(9, -5, 1.0);
    makeTree(-7, 4, 1.2);  makeTree(7, 5, 0.8);
    makeTree(-4, 8, 1.0);  makeTree(3, 9, 1.1);
    makeTree(-11, 1, 0.7); makeTree(11, 2, 0.9);
    makeTree(0, -11, 1.4); makeTree(-13, -2, 0.8);

    // PROJECT STOP POSITIONS — 120deg apart
    const R = 9;
    const stopAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    function markerPos(i) {
      return {
        x: Math.sin(stopAngles[i]) * R,
        z: Math.cos(stopAngles[i]) * R
      };
    }

    // VAN — project 1
    function makeVan(pos) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.5, 1.5),
        new THREE.MeshLambertMaterial({ color: 0x7c3aed })
      );
      body.position.y = 0.75;
      g.add(body);
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 1.4),
        new THREE.MeshLambertMaterial({ color: 0xa855f7 })
      );
      roof.position.set(-0.3, 1.75, 0);
      g.add(roof);
      [[1.1, 0.8],[1.1,-0.8],[-1.1, 0.8],[-1.1,-0.8]].forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12),
          new THREE.MeshLambertMaterial({ color: 0x1e1b4b })
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.35, wz);
        g.add(wheel);
      });
      g.position.set(pos.x + 2, 0.1, pos.z);
      world.add(g);
    }

    // HOUSE — project 2
    function makeHouse(pos) {
      const g = new THREE.Group();
      const walls = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 2, 2),
        new THREE.MeshLambertMaterial({ color: 0x4c1d95 })
      );
      walls.position.y = 1;
      g.add(walls);
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2, 1.5, 4),
        new THREE.MeshLambertMaterial({ color: 0x7c3aed })
      );
      roof.position.y = 2.75;
      roof.rotation.y = Math.PI / 4;
      g.add(roof);
      g.position.set(pos.x, 0.1, pos.z);
      world.add(g);
    }

    // STAGE — project 3
    function makeStage(pos) {
      const g = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.3, 2),
        new THREE.MeshLambertMaterial({ color: 0x4c1d95 })
      );
      base.position.y = 0.15;
      g.add(base);
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 2.5, 0.15),
        new THREE.MeshLambertMaterial({ color: 0x7c3aed })
      );
      board.position.set(0, 1.6, -0.9);
      g.add(board);
      [-1.7, 1.7].forEach(px => {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 3, 6),
          new THREE.MeshLambertMaterial({ color: 0x1e1b4b })
        );
        pillar.position.set(px, 1.5, -0.9);
        g.add(pillar);
      });
      g.position.set(pos.x, 0.1, pos.z);
      world.add(g);
    }

    makeVan(markerPos(0));
    makeHouse(markerPos(1));
    makeStage(markerPos(2));

    // CYCLIST
    const cyclistRadius = 5;
    const cyclistGroup = new THREE.Group();
    function makeCyclist() {
      const whiteMat  = new THREE.MeshLambertMaterial({ color: 0xddd6fe });
      const purpleMat = new THREE.MeshLambertMaterial({ color: 0x7c3aed });
      const lightMat  = new THREE.MeshLambertMaterial({ color: 0xc4b5fd });
      const skinMat   = new THREE.MeshLambertMaterial({ color: 0xfcd9b0 });
      const darkMat   = new THREE.MeshLambertMaterial({ color: 0x1e1b4b });
      const pinkMat   = new THREE.MeshLambertMaterial({ color: 0xa855f7 });

      // --- WHEELS ---
      [-1, 1].forEach(side => {
        // outer tyre
        const tyre = new THREE.Mesh(
          new THREE.TorusGeometry(0.9, 0.13, 12, 28),
          darkMat
        );
        tyre.rotation.y = Math.PI / 2;
        tyre.position.set(side * 0.25, 0.9, 0);
        cyclistGroup.add(tyre);

        // inner rim
        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(0.9, 0.06, 8, 28),
          whiteMat
        );
        rim.rotation.y = Math.PI / 2;
        rim.position.set(side * 0.25, 0.9, 0);
        cyclistGroup.add(rim);

        // spokes
        for (let s = 0; s < 6; s++) {
          const spoke = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 1.6, 4),
            whiteMat
          );
          spoke.rotation.z = (s / 6) * Math.PI;
          spoke.position.set(side * 0.25, 0.9, 0);
          cyclistGroup.add(spoke);
        }
      });

      // --- BIKE FRAME ---
      // down tube (from head to bottom bracket)
      function addTube(x1, y1, z1, x2, y2, z2, mat, r = 0.07) {
        const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
        const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
        const tube = new THREE.Mesh(
          new THREE.CylinderGeometry(r, r, len, 8),
          mat
        );
        tube.position.set((x1+x2)/2, (y1+y2)/2, (z1+z2)/2);
        tube.quaternion.setFromUnitVectors(
          new THREE.Vector3(0,1,0),
          new THREE.Vector3(dx,dy,dz).normalize()
        );
        cyclistGroup.add(tube);
      }

      // main frame
      addTube( 0.4, 1.8, 0, -0.4, 0.95, 0, purpleMat, 0.07); // seat tube
      addTube(-0.4, 0.95, 0,  0.8, 0.95, 0, purpleMat, 0.07); // bottom tube
      addTube( 0.8, 0.95, 0,  0.4, 1.8,  0, lightMat,  0.06); // down tube
      addTube( 0.4, 1.8,  0,  0.8, 0.95, 0, lightMat,  0.05); // back stay top
      addTube(-0.4, 0.95, 0, -1.0, 0.95, 0, purpleMat, 0.06); // rear stay
      addTube(-1.0, 0.95, 0,  0.4, 1.8,  0, purpleMat, 0.05); // chain stay

      // fork
      addTube(0.8, 0.95, 0, 1.0, 1.7, 0, lightMat, 0.06);
      addTube(1.0, 1.7, 0, 0.9, 0.95, 0, lightMat, 0.05);

      // handlebar stem
      addTube(1.0, 1.7, 0, 1.2, 1.85, 0, purpleMat, 0.06);
      // handlebar
      addTube(1.2, 1.85, -0.25, 1.2, 1.85, 0.25, darkMat, 0.05);

      // seat post
      addTube(0.4, 1.8, 0, 0.3, 2.1, 0, purpleMat, 0.05);
      // saddle
      const saddle = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.08, 0.18),
        darkMat
      );
      saddle.position.set(0.15, 2.15, 0);
      cyclistGroup.add(saddle);

      // pedals
      [-0.15, 0.15].forEach(z => {
        const pedal = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.05, 0.1),
          darkMat
        );
        pedal.position.set(-0.15, 0.9, z);
        cyclistGroup.add(pedal);
      });

      // --- RIDER ---
      // torso — leaning forward
      addTube(0.3, 2.1, 0, 0.95, 2.55, 0, pinkMat, 0.2);

      // upper arms
      addTube(0.95, 2.55, -0.2, 1.2, 2.2, -0.22, pinkMat, 0.1);
      addTube(0.95, 2.55,  0.2, 1.2, 2.2,  0.22, pinkMat, 0.1);

      // forearms
      addTube(1.2, 2.2, -0.22, 1.2, 1.9, -0.25, skinMat, 0.08);
      addTube(1.2, 2.2,  0.22, 1.2, 1.9,  0.25, skinMat, 0.08);

      // upper legs
      addTube(0.3, 2.1, -0.15, -0.1, 1.5, -0.15, pinkMat, 0.14);
      addTube(0.3, 2.1,  0.15, -0.1, 1.5,  0.15, pinkMat, 0.14);

      // lower legs
      addTube(-0.1, 1.5, -0.15, -0.2, 0.95, -0.15, skinMat, 0.1);
      addTube(-0.1, 1.5,  0.15, -0.2, 0.95,  0.15, skinMat, 0.1);

      // shoes
      [-0.15, 0.15].forEach(z => {
        const shoe = new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.12, 0.14),
          darkMat
        );
        shoe.position.set(-0.28, 0.9, z);
        cyclistGroup.add(shoe);
      });

      // neck
      addTube(0.95, 2.55, 0, 1.0, 2.75, 0, skinMat, 0.1);

      // HEAD
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 10, 10),
        skinMat
      );
      head.position.set(1.05, 2.98, 0);
      cyclistGroup.add(head);

      // helmet
      const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 10, 10),
        purpleMat
      );
      helmet.position.set(1.05, 3.05, 0);
      helmet.scale.y = 0.75;
      cyclistGroup.add(helmet);

      // eyes
      [-0.1, 0.1].forEach(z => {
        const eye = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 6, 6),
          whiteMat
        );
        eye.position.set(1.3, 2.98, z);
        cyclistGroup.add(eye);
      });
    }
    makeCyclist();
    world.add(cyclistGroup);

    // PROJECTS DATA
    const projects = [
      {
        number: "01", title: "Animated Portfolio",
        desc: "A fully interactive portfolio with robot intro, smooth scroll and futuristic dark UI.",
        stack: ["HTML", "CSS", "JavaScript"], link: "#"
      },
      {
        number: "02", title: "Bus Management System",
        desc: "Interactive tool to maintain and manage buses, drivers, etc.",
        stack: ["Php", "HTML", "CSS", "JS", "MySQL"], link: "#"
      },
      {
        number: "03", title: "Arduino Smart System",
        desc: "Smart home automation with sensors for temperature, motion detection and remote control.",
        stack: ["Arduino", "C", "Hardware"], link: "#"
      }
    ];

    // POPUP
    const popup = document.getElementById("project-popup");
    function showPopup(i) {
      const p = projects[i];
      document.getElementById("popup-number").textContent = p.number;
      document.getElementById("popup-title").textContent  = p.title;
      document.getElementById("popup-desc").textContent   = p.desc;
      document.getElementById("popup-link").href          = p.link;
      document.getElementById("popup-stack").innerHTML    = p.stack.map(s => `<span>${s}</span>`).join("");
      popup.classList.add("visible");
    }

    // STATE
    let isDragging   = false;
    let prevMouseX   = 0;
    let worldAngle   = 0;
    let cyclistAngle = 0;
    let isSnapping   = false;
    let currentStop  = 0;

    // show project 1 by default
    showPopup(0);

    // find nearest stop to current world angle
    function getNearestStop() {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < 3; i++) {
        let diff = ((-stopAngles[i] - worldAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff < bestDist) { bestDist = diff; best = i; }
      }
      return best;
    }

    // MOUSE
    canvas.addEventListener("mousedown", e => {
      if (isSnapping) return;
      isDragging = true;
      prevMouseX = e.clientX;
      popup.classList.remove("visible");
      document.getElementById("drag-hint").style.opacity = "0";
    });

    window.addEventListener("mousemove", e => {
      if (!isDragging || isSnapping) return;
      const delta = e.clientX - prevMouseX;
      worldAngle += delta * 0.008;
      prevMouseX  = e.clientX;

      // auto stop when next project reaches front
      const nearest = getNearestStop();
      if (nearest !== currentStop) {
        isDragging  = false;
        isSnapping  = true;
        currentStop = nearest;
      }
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging  = false;
      isSnapping  = true;
      currentStop = getNearestStop();
    });

    // TOUCH
    canvas.addEventListener("touchstart", e => {
      if (isSnapping) return;
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
      popup.classList.remove("visible");
    });

    canvas.addEventListener("touchmove", e => {
      if (!isDragging || isSnapping) return;
      const delta = e.touches[0].clientX - prevMouseX;
      worldAngle += delta * 0.008;
      prevMouseX  = e.touches[0].clientX;

      const nearest = getNearestStop();
      if (nearest !== currentStop) {
        isDragging  = false;
        isSnapping  = true;
        currentStop = nearest;
      }
    });

    canvas.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging  = false;
      isSnapping  = true;
      currentStop = getNearestStop();
    });

    // ANIMATE
    function animate3d() {
      requestAnimationFrame(animate3d);

      if (isSnapping) {
        // snap world to target angle
        const targetAngle = -stopAngles[currentStop];
        let diff = targetAngle - worldAngle;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        worldAngle += diff * 0.07;

        // move cyclist toward current stop
        let cDiff = stopAngles[currentStop] - cyclistAngle;
        while (cDiff >  Math.PI) cDiff -= Math.PI * 2;
        while (cDiff < -Math.PI) cDiff += Math.PI * 2;
        cyclistAngle += cDiff * 0.07;

        // spin wheels while moving
        if (Math.abs(cDiff) > 0.02) {
          cyclistGroup.children.forEach(c => {
            if (c.geometry && c.geometry.type === "TorusGeometry") {
              c.rotation.x += 0.12;
            }
          });
        }

        // arrived
        if (Math.abs(diff) < 0.005) {
          worldAngle   = targetAngle;
          cyclistAngle = stopAngles[currentStop];
          isSnapping   = false;
          showPopup(currentStop);
        }
      }

      world.rotation.y = worldAngle;

      // cyclist position on circular path
      cyclistGroup.position.x = Math.sin(cyclistAngle) * cyclistRadius;
      cyclistGroup.position.z = Math.cos(cyclistAngle) * cyclistRadius;
      cyclistGroup.position.y = 0.3;
      cyclistGroup.rotation.y = -cyclistAngle + Math.PI;

      purpleLight.intensity = 1.5 + Math.sin(Date.now() * 0.001) * 0.5;
      renderer.render(scene, camera);
    }
    animate3d();

    // RESIZE
    window.addEventListener("resize", () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
  }

});