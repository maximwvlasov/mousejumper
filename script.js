// Получаем элементы игры
const mouse = document.getElementById('mouse');
const gameContainer = document.getElementById('game-container');

// Начальная позиция мыши
let mousePosition = { x: 150, y: 200 }; // Мышь начинается посередине по горизонтали, чуть ниже верха
let velocityY = 0; // Скорость падения/прыжка по вертикали
let isJumping = false; // Флаг, показывающий, прыгает ли мышь
const gravity = 0.5; // Гравитация — сила, которая тянет мышь вниз
const jumpStrength = -10; // Сила прыжка (отрицательная, чтобы прыгать вверх)

// Функция для создания платформ
function createPlatform() {
    const platform = document.createElement('div');
    platform.className = 'platform';
    platform.style.left = Math.random() * (gameContainer.offsetWidth - 80) + 'px'; // Случайная позиция по горизонтали
    platform.style.top = Math.random() * gameContainer.offsetHeight + 'px'; // Случайная позиция по вертикали
    gameContainer.appendChild(platform);
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

// Обработка прыжка (например, по нажатию пробела или клику)
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isJumping) { // Прыжок по пробелу
        velocityY = jumpStrength;
        isJumping = true;
    }
});

// Обработка клика для мобильных устройств или мыши
gameContainer.addEventListener('click', () => {
    if (!isJumping) {
        velocityY = jumpStrength;
        isJumping = true;
    }
});

// Основной игровой цикл (обновляет положение мыши и платформ)
function gameLoop() {
    // Применяем гравитацию
    velocityY += gravity;
    mousePosition.y += velocityY;

    // Ограничиваем мышь снизу, чтобы она не падала за пределы экрана
    if (mousePosition.y > gameContainer.offsetHeight - 50) {
        mousePosition.y = gameContainer.offsetHeight - 50;
        velocityY = 0;
        isJumping = false;
    }

    // Обновляем позицию мыши
    mouse.style.left = mousePosition.x + 'px';
    mouse.style.top = mousePosition.y + 'px';

    // Проверяем столкновения с платформами
    const platforms = document.querySelectorAll('.platform');
    platforms.forEach(platform => {
        const platformRect = platform.getBoundingClientRect();
        const mouseRect = mouse.getBoundingClientRect();

        // Если мышь приземляется на платформу
        if (
            mouseRect.bottom > platformRect.top &&
            mouseRect.top < platformRect.bottom &&
            mouseRect.right > platformRect.left &&
            mouseRect.left < platformRect.right &&
            velocityY > 0 // Мышь идёт вниз
        ) {
            mousePosition.y = platformRect.top - 50; // Ставим мышь на платформу
            velocityY = 0; // Останавливаем падение
            isJumping = false; // Можно прыгать снова
        }
    });

    // Проверяем столкновения с монетами
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
            coin.remove(); // Убираем монету, если мышь её собрала
            createCoin(); // Создаём новую монету в случайном месте
        }
    });

    // Двигаем платформы вверх (создаём эффект подъёма мыши)
    platforms.forEach(platform => {
        let platformY = parseFloat(platform.style.top || 0);
        platformY -= 2; // Скорость движения платформ вверх
        platform.style.top = platformY + 'px';

        // Если платформа уходит за верхний край, создаём её заново внизу
        if (platformY < -20) {
            platformY = gameContainer.offsetHeight + Math.random() * 200;
            platform.style.left = Math.random() * (gameContainer.offsetWidth - 80) + 'px';
        }
        platform.style.top = platformY + 'px';
    });

    // Двигаем монеты вверх (аналогично платформам)
    coins.forEach(coin => {
        let coinY = parseFloat(coin.style.top || 0);
        coinY -= 2;
        coin.style.top = coinY + 'px';

        if (coinY < -20) {
            coinY = gameContainer.offsetHeight + Math.random() * 200;
            coin.style.left = Math.random() * (gameContainer.offsetWidth - 20) + 'px';
        }
        coin.style.top = coinY + 'px';
    });

    // Повторяем игровой цикл
    requestAnimationFrame(gameLoop);
}

// Запускаем игру
gameLoop();