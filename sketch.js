let font;
let textPoints = [];
let particles = [];
let txt = "小孟";
let fontSize = 150;
let inputBox; // 添加输入框变量

function preload() {
  font = loadFont('/fonts/SourceHanSansSC-VF.ttf'); // 加载字体
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  background(20, 20, 20);
  
  // 简化输入框创建
  inputBox = createInput(txt);
  inputBox.position(20, 20);
  inputBox.style('font-size', '16px');
  inputBox.style('padding', '5px');
  inputBox.input(handleInput); // 添加输入事件处理
  
  generateTextPoints();
}

// 添加文本生成函数
function generateTextPoints() {
  textPoints = [];
  let letters = txt.split('');
  let letterSpacing = fontSize * 1.5;
  let totalWidth = letters.length * letterSpacing;
  let startX = width/2 - totalWidth/2;
  let startY = height/2;

  letters.forEach((letter, i) => {
    let x = startX + i * letterSpacing;
    let points = font.textToPoints(letter, x, startY, fontSize, {
      sampleFactor: 0.08,
      simplifyThreshold: 0
    });
    textPoints = textPoints.concat(points);
  });
  
  // 清空现有粒子
  particles = [];
}

// 添加输入处理函数
function handleInput() {
  txt = this.value();
  generateTextPoints();
}

function isMouseOverInput() {
  let inputBounds = inputBox.elt.getBoundingClientRect();
  return mouseX >= inputBounds.left && 
         mouseX <= inputBounds.right && 
         mouseY >= inputBounds.top && 
         mouseY <= inputBounds.bottom;
}

function draw() {
  background(20, 20, 20, 15); // 降低背景透明度

  if (mouseIsPressed && textPoints.length > 0 && !isMouseOverInput()) {
    let currentText = inputBox.value();
    if (currentText !== txt) {  // 如果文本发生变化
      txt = currentText;
      generateTextPoints();
    }
    
    for (let i = 0; i < 15; i++) { // 增加粒子生成数量
      let pt = random(textPoints);
      particles.push(new TextParticle(pt.x, pt.y));
    }
  }

  // 更新并绘制所有粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) {
      particles.splice(i, 1);
    }
  }
}

class TextParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.originalPos = createVector(x, y); // 保存原始位置
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(0.3, 1.5)); // 降低初始速度
    this.lifespan = 200;
    this.size = random(2, 3); // 减小粒子大小使轮廓更清晰
    this.hue = random(170, 300);
    this.wanderForce = 0.05; // 降低游走力度
  }

  update() {
    // 添加回归原点的力
    let toOrigin = p5.Vector.sub(this.originalPos, this.pos);
    toOrigin.mult(0.05); // 增加回归力度
    this.vel.add(toOrigin);
    
    // 添加随机游走
    let wander = p5.Vector.random2D();
    wander.mult(this.wanderForce);
    this.vel.add(wander);
    
    // 限制速度
    this.vel.limit(3);
    this.pos.add(this.vel);
    this.lifespan -= 1; // 降低消失速度
  }

  show() {
    noStroke();
    fill(this.hue, 80, 80, 80, this.lifespan);
    ellipse(this.pos.x, this.pos.y, this.size * 2);
  }

  isDead() {
    return this.lifespan < 0 || this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height;
  }
}
