const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const diffBtn = document.getElementById('difficulty');

let score = 0;
const brickRowCount = 6;
const brickColumnCount = 5;
const specialBricks = [];
const specialColors = ['#61f4de', '#65cbe9', '#68b6ef', '#6c8dfa', '#6e78ff']; // Colors for special bricks

const specialMessages = [
    "DEV",
    "CODING",
    "MACHINE LEARNING",
    "DESIGN",
    "HASHTAG"
];

let currentMessage = ""; // To store the message when a special brick is hit

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 9,
    speed: 0,
    dx: 0,
    dy: 0
}

function startGame() {
    const startBtn = document.getElementById('start');
    startBtn.style.display = 'none';
    diffBtn.style.display = 'block';
}

function hideDiff() {
    diffBtn.style.display = 'none';
}

function easyMode() {
    ball.speed = 3.8;
    ball.dx = 4;
    ball.dy = -4;
    hideDiff();
}

// create Paddle Props
const paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    w: 73,
    h: 9,
    speed: 8,
    dx: 0
}

// create Brick Props
const brickInfo = {
    w: 65,
    h: 18,
    padding: 9,
    offsetX: 0,
    offsetY: 60,
    visible: true
}

const totalBrickWidth = brickColumnCount * (brickInfo.w + brickInfo.padding) - brickInfo.padding;
brickInfo.offsetX = (canvas.width - totalBrickWidth) / 2;

const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
    bricks[i] = [];
    for (let j = 0; j < brickColumnCount; j++) {
        const x = j * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
        const y = i * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
        bricks[i][j] = { x, y, ...brickInfo };
    }
}

function displayUniqueText(index) {
    // Hide all special message divs first
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`brick-${i}-message`).style.display = 'none';
    }

    // Show the specific message div for the hit special brick
    const messageDiv = document.getElementById(`brick-${index + 1}-message`);
    messageDiv.style.display = 'block';
    messageDiv.style.opacity = '1'; // Make the message visible

    // Hide the message after 4 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0'; // Fade out
        setTimeout(() => {
            messageDiv.style.display = 'none'; // Hide after fade out
        }, 500); // Allow time for fade-out
    }, 2000); // Display for 4 seconds
}

function assignSpecialBricks() {
    const totalBricks = brickRowCount * brickColumnCount;
    const chosenBricks = new Set();

    while (chosenBricks.size < 5) {
        const randomIndex = Math.floor(Math.random() * totalBricks);
        if (!chosenBricks.has(randomIndex)) {
            chosenBricks.add(randomIndex);
        }
    }

    let count = 0;
    bricks.forEach((column, colIndex) => {
        column.forEach((brick, rowIndex) => {
            const index = colIndex * brickColumnCount + rowIndex;
            if (chosenBricks.has(index)) {
                brick.isSpecial = true;
                brick.color = specialColors[count % specialColors.length];
                count++;
            } else {
                brick.isSpecial = false;
                brick.color = '#6B5B95';
            }
        });
    });
}

const ballImage = new Image();
ballImage.src = 'download.png';
ballImage.onload = function () {
    drawBall();
};

function drawBall() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(ballImage, ball.x - ball.size, ball.y - ball.size, ball.size * 2.5, ball.size * 2.5);
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = '#6B5B95';
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'neon blue'; // Updated font color
    ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
}

function drawBricks() {
    bricks.forEach(column => {
        column.forEach(brick => {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.w, brick.h);
            ctx.fillStyle = brick.visible ? brick.color : 'transparent';
            ctx.fill();
            ctx.closePath();
        });
    });
}

function areBricksLeft() {
    return bricks.some(column => column.some(brick => brick.visible));
}

function areSpecialBricksLeft() {
    return bricks.some(column => column.some(brick => brick.visible && brick.isSpecial));
}

function drawMessage() {
    if (currentMessage) {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'green';
        ctx.fillText(currentMessage, 20, canvas.height - 30); // Display message at the bottom of the canvas
    }
}

function movePaddle() {
    paddle.x += paddle.dx;

    // Wall Detection
    if (paddle.x + paddle.w > canvas.width) {
        paddle.x = canvas.width - paddle.w;
    }

    if (paddle.x < 0) {
        paddle.x = 0;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with walls
    if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
        ball.dx *= -1;
    }

    if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
        ball.dy *= -1;
    }

    // Ball collision with paddle
    if (
        ball.x - ball.size > paddle.x &&
        ball.x + ball.size < paddle.x + paddle.w &&
        ball.y + ball.size > paddle.y
    ) {
        ball.dy = -ball.speed;
    }

    // Ball collision with bricks
    bricks.forEach(column => {
        column.forEach((brick, index) => {
            if (brick.visible) {
                if (
                    ball.x - ball.size > brick.x && // Left brick side check
                    ball.x + ball.size < brick.x + brick.w && // Right brick side check
                    ball.y + ball.size > brick.y && // Top brick side check
                    ball.y - ball.size < brick.y + brick.h // Bottom brick side
                ) {
                    ball.dy *= -1;
                    brick.visible = false;

                    if (brick.isSpecial) {
                        score += 1; // Increase score by 5 for special bricks
                        displayUniqueText(index);
                    } else {
                        score++;
                    }
                    increaseScore();
                }
            }
        });
    });

    // Lose condition
    if (ball.y + ball.size > canvas.height && areBricksLeft()) {
        score = 0;
        showAllBricks();
        pauseBall();
        pausePaddle();
        document.querySelector('.lose').style.display = 'block';
    }
}

function pauseBall() {
    ball.speed = 0;
    ball.dx = 0;
    ball.dy = 0;
}

function pausePaddle() {
    paddle.speed = 0;
    paddle.dx = 0;
}

function increaseScore() {
    if (score % (brickRowCount * brickColumnCount) === 0 && !areSpecialBricksLeft()) {
        showAllBricks();
        document.querySelector(".win").style.display = "block";
        return; // Exit function if game is won
    }
}

function showAllBricks() {
    bricks.forEach(column => {
        column.forEach(brick => {
            brick.visible = true;
        });
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawScore();
    drawBricks();
    drawMessage(); // Draw message if special brick is hit
}

function update() {
    movePaddle();
    moveBall();
    draw();
    requestAnimationFrame(update);
}

update();

// Keyboard and touch event handling
function keyDown(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
    }
    else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = -paddle.speed;
    }
}

function keyUp(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.dx = 0;
    }
}

function handleTouchStart(e) {
    const touch = e.touches[0];
    if (touch.clientX < canvas.width / 2) {
        paddle.dx = -paddle.speed;
    } else {
        paddle.dx = paddle.speed;
    }
}

function handleTouchEnd() {
    paddle.dx = 0;
}

// Event listeners
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);


// Rules and close event handlers
rulesBtn.addEventListener('click', () => rules.classList.add('show'));
closeBtn.addEventListener('click', () => rules.classList.remove('show'));

assignSpecialBricks();
