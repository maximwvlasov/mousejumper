// Получаем элементы игры
const mouse = document.getElementById('mouse');
const gameContainer = document.getElementById('game-container');
const scoreElement = document.getElementById('score');

let mousePosition = { x: window.innerWidth / 2 - 25, y: window.innerHeight / 2 };
let velocityY = 0;
let isJumping = false;
let score = 0;
const gravity = 0.5;
const jumpStrength = -10;
const moveSpeed = 5; // Скорость движения влево/вправо

// Обновляем счёт на экране
function updateScore() {
    scoreElement.textContent = `Монеты: ${score}`;
}

// Функция для создания платформ
function createPlatform() {
    const platform = document.createElement('div');
    platform.className = 'platform';
    platform.style.left = Math.random() * (gameContainer.offsetWidth - 80) + 'px';
    platform.style.top = Math.random() * gameContainer.offsetHeight + 'px';
    gameContainer.appendChild(platform);

    if (Math.random() < 0.2) {
        const bottle = document.createElement('div');
        bottle.className = 'bottle';
        bottle.style.left = platform.style.left;
        bottle.style.top = (parseFloat(platform.style.top) - 40) + 'px';
        gameContainer.appendChild(bottle);
    }
}

// Создаём несколько платформ при старте
for (let i = 0; i < 5; i++) {
    createPlatform();
}

// Функция для создания монет
function createCoin() {
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.left = Math.random() * (gameContainer.offsetWidth - 20) + 'px';
    coin.style.top = Math.random() * gameContainer.offsetHeight + 'px';
    gameContainer.appendChild(coin);
}

// Создаём несколько монет при старте
for (let i = 0; i < 3; i++) {
    createCoin();
}

// Движение мыши влево/вправо
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' && mousePosition.x > 0) {
        mousePosition.x -= moveSpeed; // Движение влево
    } else if (e.code === 'ArrowRight' && mousePosition.x < gameContainer.offsetWidth - 50) {
        mousePosition.x += moveSpeed; // Движение вправо
    } else if (e.code === 'Space' && !isJumping) {
        velocityY = jumpStrength;
        isJumping = true;
        score += 10;
        updateScore();
    }
});

// Движение на смартфонах (свайпы или клики)
let touchStartX = 0;
gameContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});
gameContainer.addEventListener('touchmove', (e) => {
    const touchEndX = e.touches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (deltaX > 20 && mousePosition.x < gameContainer.offsetWidth - 50) { // Свайп вправо
        mousePosition.x += moveSpeed;
    } else if (deltaX < -20 && mousePosition.x > 0) { // Свайп влево
        mousePosition.x -= moveSpeed;
    }
    touchStartX = touchEndX;
});

gameContainer.addEventListener('click', () => {
    if (!isJumping) {
        velocityY = jumpStrength;
        isJumping = true;
        score += 10;
        updateScore();
    }
});

// Основной игровой цикл
function gameLoop() {
    velocityY += gravity;
    mousePosition.y += velocityY;

    if (mousePosition.y > gameContainer.offsetHeight - 50) {
        mousePosition.y = gameContainer.offsetHeight - 50;
        velocityY = 0;
        isJumping = false;
    }

    mouse.style.left = mousePosition.x + 'px';
    mouse.style.top = mousePosition.y + 'px';

    const platforms = document.querySelectorAll('.platform');
    platforms.forEach(platform => {
        const platformRect = platform.getBoundingClientRect();
        const mouseRect = mouse.getBoundingClientRect();

        if (
            mouseRect.bottom > platformRect.top &&
            mouseRect.top < platformRect.bottom &&
            mouseRect.right > platformRect.left &&
            mouseRect.left < platformRect.right &&
            velocityY > 0
        ) {
            mousePosition.y = platformRect.top - 50;
            velocityY = 0;
            isJumping = false;
        }
    });

    const coins = document.querySelectorAll('.coin');
    coins.forEach(coin => {
        const coinRect = coin.getBoundingClientRect();
        const mouseRect = mouse.getBoundingClientRect();

        if (
            mouseRect.bottom > coinRect.top &&
            mouseRect.top < coinRect.bottom &&
            mouseRect.right > coinRect.left &&
            mouseRect.left < coinRect.right
        ) {
            coin.remove();
            score += 10;
            updateScore();
            createCoin();
        }
    });

    const bottles = document.querySelectorAll('.bottle');
    bottles.forEach(bottle => {
        const bottleRect = bottle.getBoundingClientRect();
        const mouseRect = mouse.getBoundingClientRect();

        if (
            mouseRect.bottom > bottleRect.top &&
            mouseRect.top < bottleRect.bottom &&
            mouseRect.right > bottleRect.left &&
            mouseRect.left < bottleRect.right
        ) {
            bottle.remove();
            score += 100;
            updateScore();
        }
    });

    [platforms, coins, bottles].forEach(elements => {
        elements.forEach(element => {
            let elementY = parseFloat(element.style.top || 0);
            elementY -= 2;
            element.style.top = elementY + 'px';

            if (elementY < -50) {
                elementY = gameContainer.offsetHeight + Math.random() * 200;
                element.style.left = Math.random() * (gameContainer.offsetWidth - (element.className === 'platform' ? 80 : 20)) + 'px';
                if (element.className === 'platform' && Math.random() < 0.2) {
                    const newBottle = document.createElement('div');
                    newBottle.className = 'bottle';
                    newBottle.style.left = element.style.left;
                    newBottle.style.top = (elementY - 40) + 'px';
                    gameContainer.appendChild(newBottle);
                }
            }
            element.style.top = elementY + 'px';
        });
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();

// Интеграция с Telegram (простая)
const telegramToken = '8084285430:AAH6CNsOHiAO24Aw3vL5CCrU9XJzYCRrVdw';
let telegramUserId = null;

// Проверяем, открыта ли игра в Telegram
if (window.Telegram && window.Telegram.WebApp) {
    const webApp = window.Telegram.WebApp;
    webApp.ready(); // Инициализируем WebApp
    telegramUserId = webApp.initDataUnsafe.user?.id; // Получаем ID пользователя

    // Пример: отправка счёта в чат (можно расширить)
    function sendScoreToTelegram() {
        if (telegramUserId) {
            fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramUserId,
                    text: `Твой счёт в игре: ${score} монет!`
                })
            });
        }
    }

    // Отправляем счёт при достижении определённого значения или завершении игры
    if (score >= 100) {
        sendScoreToTelegram();
    }
}
