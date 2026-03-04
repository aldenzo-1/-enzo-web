// ==================== BISCOITO CLICKER + BARRA DE COMBO (DUPLICA GANHOS) ====================

let cookies = 0;
let totalCookies = 0;
let cps = 0;                    // cookies por segundo
let lastTime = 0;

let cookieScale = 1;
let particles = [];

let comboBar = 0;               // 0 a 100
let comboMax = 100;
let comboDecaySpeed = 0.35;     // desce devagar se parar de clicar
let comboGainPerClick = 7;      // quanto sobe por clique (ajuste se quiser mais rápido/difícil)
let doubleActive = false;
let doubleDuration = 6000;      // 6 segundos de duplicação
let doubleTimer = 0;

let buildings = [
  { nome: "Cursor",     emoji: "🖱️",  custo: 15,   prod: 0.1,  qtd: 0 },
  { nome: "Avó",        emoji: "👵",  custo: 100,  prod: 1,    qtd: 0 },
  { nome: "Fazenda",    emoji: "🌾",  custo: 1100, prod: 8,    qtd: 0 },
  { nome: "Mina",       emoji: "⛏️",  custo: 12000,prod: 47,   qtd: 0 },
  { nome: "Fábrica",    emoji: "🏭",  custo: 130000,prod: 260, qtd: 0 },
  { nome: "Banco",      emoji: "🏦",  custo: 1400000,prod: 1400, qtd: 0 }
];

function setup() {
  createCanvas(900, 600);
  textAlign(CENTER, CENTER);
  textFont('Arial');
  
  // Carrega save
  if (localStorage.getItem('biscoitoSave')) {
    let save = JSON.parse(localStorage.getItem('biscoitoSave'));
    cookies = save.cookies || 0;
    totalCookies = save.totalCookies || 0;
    buildings = save.buildings || buildings;
    comboBar = save.comboBar || 0;
    recalcularCPS();
  }
  
  lastTime = millis();
}

function draw() {
  background(25, 25, 40);

  // Produção automática
  let agora = millis();
  let delta = (agora - lastTime) / 1000;
  let ganho = cps * delta;
  cookies += ganho;
  totalCookies += ganho;
  lastTime = agora;

  // Gerencia a barra de combo
  if (!doubleActive) {
    comboBar = max(0, comboBar - comboDecaySpeed);
    
    if (comboBar >= comboMax) {
      doubleActive = true;
      doubleTimer = millis() + doubleDuration;
      comboBar = comboMax; // barra fica cheia durante o double
    }
  } else {
    // Durante o double: barra cheia e conta tempo
    if (millis() > doubleTimer) {
      doubleActive = false;
      comboBar = 30; // reinicia um pouco pra não zerar de vez
    }
  }

  // ======================= BIG COOKIE =======================
  let cx = width/2 - 180;
  let cy = height/2 - 20;

  push();
  translate(cx, cy);
  scale(cookieScale);
  fill(210, 105, 30);
  ellipse(0, 0, 220, 220);
  fill(139, 69, 19);
  textSize(160);
  text("🍪", 0, 40);
  pop();

  // ======================= STATS =======================
  fill(255);
  textSize(42);
  text(floor(cookies) + " biscoitos", width/2 - 180, 80);

  textSize(24);
  let cpsDisplay = doubleActive ? (cps * 2).toFixed(1) : cps.toFixed(1);
  text("por segundo: " + cpsDisplay, width/2 - 180, 130);

  if (doubleActive) {
    fill(255, 215, 0);
    textSize(36);
    text("x2 GANHOS!", width/2 - 180, 180);
  }

  // ======================= BARRA DE COMBO =======================
  let barX = cx - 110;
  let barY = cy + 140;
  let barWidth = 220;
  let barHeight = 20;

  // Fundo
  fill(60);
  rect(barX, barY, barWidth, barHeight, 10);

  // Preenchimento (verde → amarelo)
  let barFill = map(comboBar, 0, comboMax, 0, barWidth);
  fill(lerpColor(color(100,200,100), color(255,215,0), comboBar/comboMax));
  rect(barX, barY, barFill, barHeight, 10);

  // Texto na barra
  fill(255);
  textSize(18);
  text("COMBO", barX + barWidth/2, barY + barHeight/2 + 2);

  // ======================= LOJA =======================
  fill(255);
  textSize(32);
  text("LOJA", 680, 60);

  for (let i = 0; i < buildings.length; i++) {
    let b = buildings[i];
    let y = 120 + i * 78;

    fill(50, 50, 70);
    rect(520, y, 320, 68, 15);

    fill(255);
    textAlign(LEFT);
    textSize(26);
    text(b.emoji + " " + b.nome + "  (" + b.qtd + ")", 545, y + 32);

    textAlign(RIGHT);
    textSize(20);
    text("custo: " + floor(b.custo), 810, y + 28);
    text("+" + b.prod + "/s", 810, y + 52);
  }

  // Partículas
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    fill(doubleActive ? color(255,215,0, p.life*8) : color(255,255,100, p.life*8));
    textSize(24);
    text(doubleActive ? "+" + (2) : "+1", p.x, p.y);
    p.y -= 1.8;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  if (cookieScale > 1) cookieScale -= 0.08;
}

function mousePressed() {
  let cx = width/2 - 180;
  let cy = height/2 - 20;
  let d = dist(mouseX, mouseY, cx, cy);

  if (d < 120) {
    // Ganho por clique
    let ganhoClique = 1;
    if (doubleActive) ganhoClique *= 2;

    cookies += ganhoClique;
    totalCookies += ganhoClique;

    cookieScale = 1.25;

    // Partícula
    particles.push({ x: mouseX + random(-30,30), y: mouseY - 20, life: 45 });

    // Aumenta a barra
    comboBar = min(comboMax, comboBar + comboGainPerClick);
  }

  // Compra na loja
  for (let i = 0; i < buildings.length; i++) {
    let y = 120 + i * 78;
    if (mouseX > 520 && mouseX < 840 && mouseY > y && mouseY < y + 68) {
      let b = buildings[i];
      if (cookies >= b.custo) {
        cookies -= b.custo;
        b.qtd++;
        b.custo = b.custo * 1.15;
        cps += b.prod;
        cookieScale = 0.85;
      }
    }
  }
}

function keyPressed() {
  if (key === 's' || key === 'S') {
    salvarJogo();
  }
  if (key === 'r' || key === 'R') {
    if (confirm("Resetar todo o progresso?")) {
      localStorage.removeItem('biscoitoSave');
      location.reload();
    }
  }
}

function salvarJogo() {
  let saveData = {
    cookies: cookies,
    totalCookies: totalCookies,
    buildings: buildings,
    comboBar: comboBar
  };
  localStorage.setItem('biscoitoSave', JSON.stringify(saveData));
}

setInterval(salvarJogo, 10000);

function recalcularCPS() {
  cps = 0;
  for (let b of buildings) {
    cps += b.prod * b.qtd;
  }
}