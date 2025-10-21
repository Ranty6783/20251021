/*
2023/01/01
#genuary1 "Perfect loop / Infinite loop / endless GIFs"
@senbaku
*/

let mover = [];
let num;
let rnum;
let points;
let count = 3;
let w;

function setup() {
    rnum = random(100)
    // 全螢幕設定
    let sizes = min(windowWidth, windowHeight);
    createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    w = min(windowWidth, windowHeight) / count;
    let radius = w / 2;
    points = 4;
    num = 360 / points;

	for (let i = 0; i < 360; i += num) {
		for (let j = 0; j < points; j++) {
			let ex = radius * sin(i * j);
			let ey = radius * cos(i * j);
			let ex2 = radius * sin(i * (j + 1));
			let ey2 = radius * cos(i * (j + 1));
			mover[j] = new Mover(ex, ey, ex2, ey2, radius, j);
		}
	}
	//rain texture	
	pg = createGraphics(width, height);
	pg.noFill();
	for (let i = 0; i < 3000; i++) {
		let x = random(width);
		let y = random(height);
		let n = noise(x * 0.01, y * 0.01) * width * 0.01;
		pg.stroke(100);
		pg.line(x, y, x, y + n);
	}

}

function draw() {
    background(51);
    image(pg,0,0);
    randomSeed(rnum);
    tile();

    // 顯示選單（滑鼠靠近左上方時）
    if (mouseX < 120 && mouseY < 120) {
        showMenu();
    }
}

// 顯示選單
function showMenu() {
    push();
    fill(30, 180);
    noStroke();
    rect(0, 0, menuW, height);

    textSize(20);
    textAlign(LEFT, TOP);
    for (let i = 0; i < menuItems.length; i++) {
        let y1 = menuY + i * menuH;
        let y2 = y1 + menuH;
        // 滑鼠在這個選單項目上時，背景變灰色
        if (mouseX > menuX && mouseX < menuX + menuW && mouseY > y1 && mouseY < y2) {
            fill(180, 180, 180, 180);
            rect(menuX - 5, y1, menuW - 10, menuH, 5);
            fill(30); // 文字顏色變深
        } else {
            fill(255);
        }
        text(menuItems[i], menuX, y1);
    }
    pop();
}

// 新增選單項目座標與高度
const menuX = 25;
const menuY = 25;
const menuW = 200;
const menuH = 30;
const menuItems = ["爆炸圓形", "爆炸圓形的講義", "關閉作品"];
const menuLinks = [
    "https://ranty6783.github.io/20251014_score/",
    "https://hackmd.io/@ySsZ9ROATrOTOSjBWMVqHQ/ryFxt_khee",
    "" // 作品三暫無連結
];

// 新增滑鼠點擊偵測
let currentWork = 1; // 1:作品一, 2:作品二, 3:作品三

function mousePressed() {
    // 只要在選單寬度範圍內就可點選
    if (mouseX < menuW) {
        for (let i = 0; i < menuItems.length; i++) {
            let y1 = menuY + i * menuH;
            let y2 = y1 + menuH;
            if (mouseX > menuX && mouseX < menuX + menuW && mouseY > y1 && mouseY < y2) {
                console.log("你點選了：" + menuItems[i]);
                // 顯示對應網站
                if (menuLinks[i]) {
                    showIframe(menuLinks[i]);
                } else {
                    hideIframe();
                }
            }
        }
    }
}

function tile() {
    // 讓 i, j 從 0 開始，直到畫布邊界（包含邊界）
    for (let i = 0; i <= width / w; i++) {
        for (let j = 0; j <= height / w; j++) {
            shape(i * w, j * w, w * 0.5);
        }
    }
}

function shape(x, y) {
    push();
    translate(x, y);
    for (let j = 0; j < points; j++) {
        // 作品二：所有排都顯示鬼魂
        mover[j].show(false);
        mover[j].update();
        mover[j].check();
    }
    pop();
}

class Mover {
    constructor(x, y, nx, ny, r, j) {
        this.radius = r; 
        this.x = x;
        this.y = y;
        this.nx = nx;
        this.ny = ny;
        this.pos1 = createVector(this.x, this.y);
        this.pos2 = createVector(this.nx, this.ny);
        this.vel = createVector(0.1, 0); 
        this.vel.mult(0.01);
        this.acc = createVector(0, 0); 
        this.acc.setMag(0.01);
        this.j = j;
    }
    update() {
        // 作品二：移動方式反過來（加速度方向反向）
        if (currentWork === 2) {
            this.acc = p5.Vector.sub(this.pos1, this.pos2); // 反向
        } else {
            this.acc = p5.Vector.sub(this.pos2, this.pos1); // 正常
        }
        this.d = int(dist(this.pos2.x, this.pos2.y, this.pos1.x, this.pos1.y));
        let length = map(this.d, 0, this.radius, 0, 10, true);
        this.vel.add(this.acc);
        this.vel.limit(length / 50);
        this.pos1.add(this.vel);
    }
    show(isTopRow) {
        noStroke();
        let eyecol = color('#594f4f');
        let ghostsize = this.radius * 1.5;
        let ghostcol;
        if (currentWork === 3) {
            ghostcol = color(255, 0, 0); // 作品三：紅色
        } else if (currentWork === 2) {
            // 作品二：顏色漸層反過來（黑→白）
            ghostcol = color(map(this.pos1.y, -this.radius, this.radius, 255, 51));
        } else {
            // 作品一：正常漸層（白→黑）
            ghostcol = color(map(this.pos1.y, -this.radius, this.radius, 51, 255));
        }
        // 顯示鬼魂
        if (currentWork !== 2 || isTopRow) { // 這行可移除，讓所有鬼魂都顯示
            if (this.j == 0) {
                ghost(this.pos1.x, this.pos1.y, ghostsize, ghostcol);
                fill(eyecol);
                ellipse(this.pos1.x - ghostsize * 0.13, this.pos1.y - ghostsize * 0.1, ghostsize * 0.04);
            }
            if (this.j == 1) {
                ghost(this.pos1.x, this.pos1.y, ghostsize, ghostcol);
                fill(eyecol)
                ellipse(this.pos1.x + ghostsize * 0.13, this.pos1.y - ghostsize * 0.1, ghostsize * 0.04);
            }
            if (this.j == 2) {
                ghost(this.pos1.x, this.pos1.y, ghostsize, ghostcol);
                fill(eyecol)
                ellipse(this.pos1.x + ghostsize * 0.13, this.pos1.y - ghostsize * 0.1, ghostsize * 0.04);
                ellipse(this.pos1.x, this.pos1.y - ghostsize * 0.1, ghostsize * 0.04);
            }
            if (this.j == 3) {
                ghost(this.pos1.x, this.pos1.y, ghostsize, ghostcol);
                fill(eyecol)
                ellipse(this.pos1.x - ghostsize * 0.13, this.pos1.y - ghostsize * 0.1, ghostsize * 0.04);
                ellipse(this.pos1.x, this.pos1.y - ghostsize * 0.1, ghostsize * 0.04);
            }
        }
    }
    check() {
        let distance = this.pos1.dist(this.pos2);
        if (distance < 1) {
            this.pos1.x = this.x;
            this.pos1.y = this.y;
        }
    }
}


function ghost(x, y, w, ghostcol) {
	let size = 5;
	let hW = w / size;
	let hH = w / (size - 1);
	let susonum = 3
	noStroke();
	push();
	//oscillation------

	translate(x, y);
	push();
	fill(ghostcol);
	beginShape();
	vertex(hW, 0);
	bezierVertex(hW * 1.1, -hH * 1.35, -hW * 1.1, -hH * 1.35, -hW, 0);
	vertex(-hW, hH);
	for (let i = -hW; i < hW + 1; i += 1) {
		let y = hH + hH / 10 * sin(i * susonum * 360/ (hW * 2) - 90);
		vertex(i, y);
	}
	vertex(hW, 0);
	endShape();
	pop();
	pop();
}

let myIframe = null;

function showIframe(url) {
    if (!myIframe) {
        myIframe = createElement('iframe');
        myIframe.style('position', 'absolute');
        myIframe.style('left', `${windowWidth * 0.1}px`);
        myIframe.style('top', '0px');
        myIframe.style('width', `${windowWidth * 0.8}px`);
        myIframe.style('height', `${windowHeight}px`);
        myIframe.style('border', 'none');
        myIframe.style('z-index', '10');
        myIframe.parent(document.body);
    }
    myIframe.attribute('src', url);
    myIframe.show();
}

function hideIframe() {
    if (myIframe) {
        myIframe.hide();
    }
}

// 顯示/隱藏 p5 畫布
function hideP5Canvas() {
    let cnv = document.querySelector('canvas');
    if (cnv) cnv.style.display = 'none';
}
function showP5Canvas() {
    let cnv = document.querySelector('canvas');
    if (cnv) cnv.style.display = '';
}