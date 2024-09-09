const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const diffBtn = document.getElementById('difficulty');

let score = 0;
const brickRowCount = 9;
const brickColumnCount = 5;

const ball = {
    x : canvas.width/2,
    y : canvas.height/2,
    size : 9,
    speed : 0,
    dx : 0,
    dy : 0
}

function startGame(){
    const startBtn = document.getElementById('start');
    startBtn.style.display = 'none';
    diffBtn.style.display = 'block';
}

function hideDiff(){
    diffBtn.style.display = 'none';
}

function easyMode(){
    ball.speed = 3.8,
    ball.dx = 4,
    ball.dy = -4,
    hideDiff();
}

function mediumMode(){
    ball.speed = 4.8,
    ball.dx = 5.2,
    ball.dy = -5.2,
    hideDiff();
}

function hardMode(){
    ball.speed = 5.6,
    ball.dx = 5.9,
    ball.dy = -5.9,
    hideDiff();
}


const paddle = {
    x: canvas.width/2 - 40,
    y: canvas.height - 20,
    w : 73,
    h : 9,
    speed : 8,
    dx: 0
}

const brickInfo = {
    w: 65,
    h: 18,
    padding: 9,
    offsetX: 45,
    offsetY: 60,
    visible: true,
    special: false
};

// bricks 
const bricks = [];
for(let i = 0;i<brickRowCount;i++){
    bricks[i] = [];
    for(let j = 0;j<brickColumnCount;j++){
        const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
        const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
        bricks[i][j] = {x,y, ...brickInfo}        
    }
}
let specialBricks = [];

function generateSpecialBricks() {
    for (let i = 0; i < 5; i++) {
        let x, y;
        let validPosition = false;

        while (!validPosition) {
            // gen random positions within canvas bounds
            x = Math.random() * (canvas.width - brickInfo.w);
            y = Math.random() * (canvas.height - brickInfo.h);

            validPosition = true;

            bricks.forEach(column => {
                column.forEach(brick => {
                    if (brick.visible) {
                        if (
                            x < brick.x + brickInfo.w &&
                            x + brickInfo.w > brick.x &&
                            y < brick.y + brickInfo.h &&
                            y + brickInfo.h > brick.y
                        ) {
                            validPosition = false; 
                        }
                    }
                });
            });
        }

        specialBricks.push({ x, y, w: brickInfo.w, h: brickInfo.h, visible: true });
    }
}

generateSpecialBricks();

function drawSpecialBricks() {
    specialBricks.forEach(brick => {
        if (brick.visible) {
            context.fillStyle = '#39FF14'; 
            context.fillRect(brick.x, brick.y, brick.w, brick.h);
        }
    });
}


const ballImage = new Image();
ballImage.src = 'download.png'; 
ballImage.onload = function() {
    drawBall();
};

function drawBall(){
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    ctx.drawImage(ballImage, ball.x - ball.size, ball.y - ball.size, ball.size * 2.5, ball.size * 2.5);
}

function drawPaddle(){
    ctx.beginPath();
    ctx.rect(paddle.x,paddle.y,paddle.w,paddle.h);
    ctx.fillStyle = '#6B5B95';
    ctx.fill();
    ctx.closePath();
}

function drawScore(){
    ctx.font = '20px Arial',
    ctx.fillText(`Score : ${score}`,canvas.width-100,30);
}

function drawBricks() {
    bricks.forEach(column => {
      column.forEach(brick => {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.w, brick.h);
        ctx.fillStyle = brick.visible ? '#6B5B95' : 'transparent';
        ctx.fill();
        ctx.closePath();
      });
    });
  
    specialBricks.forEach(brick => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brick.w, brick.h);
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'; 
      ctx.fill();
      ctx.closePath();
    });
  }
function movePaddle() {
    paddle.x += paddle.dx;

    if(paddle.x + paddle.w > canvas.width){
        paddle.x = canvas.width - paddle.w;
    }

    if(paddle.x < 0){
        paddle.x = 0;
    }
}


function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;

    // wall collision 
    if(ball.x + ball.size > canvas.width || ball.x - ball.size < 0){
        ball.dx*= -1;
    }

    // wall collision 
    if(ball.y + ball.size > canvas.height || ball.y - ball.size < 0){
        ball.dy*= -1;
    }

    // paddle collision
    if(ball.x - ball.size > paddle.x && ball.x + ball.size < paddle.x + paddle.w && ball.y + ball.size > paddle.y){
        ball.dy = -ball.speed;
    }

    // brick collision
    bricks.forEach(column =>{
        column.forEach(brick =>{
            if(brick.visible){
                if(ball.x - ball.size > brick.x &&   //left brick side check
                   ball.x + ball.size < brick.x + brick.w &&  //right brick side check
                   ball.y + ball.size > brick.y &&   // top brick side check
                   ball.y - ball.size < brick.y + brick.h  //bottom brick side
                )
                {
                    ball.dy *= -1;
                    brick.visible = false;
                    
                    increaseScore();
                }
            }
        });
    });

    // bottom wall - Lose
    if(ball.y + ball.size > canvas.height){
        score = 0;
        showAllBricks();
        pauseBall();
        pausePaddle();
        document.querySelector(".lose").style.display = "block";
    }
}


//Draw everything
function draw() {
    //clear canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawBall();
    drawPaddle();
    drawScore();
    drawBricks();
}

function update(){
    movePaddle();
    moveBall();
    draw();

    requestAnimationFrame(update);
}

update();

function keyDown(e){
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
    }
    else if(e.key === 'Left' || e.key === 'ArrowLeft'){
        paddle.dx = -paddle.speed;
    }
}

function keyUp(e){
    if(e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = 0;
    }

}
document.addEventListener('keydown',keyDown);
document.addEventListener('keyup',keyUp);

rulesBtn.addEventListener('click',()=>
rules.classList.add('show'));

closeBtn.addEventListener('click',()=>
rules.classList.remove('show'));