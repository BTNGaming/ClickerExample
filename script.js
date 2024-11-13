let coins = 0;
let cps = 0;
const upgrades = [
    { name: "Coin Magnet", cost: 10, cps: 0.1 },
    { name: "Coin Fountain", cost: 50, cps: 0.5 },
    { name: "Coin Factory", cost: 100, cps: 1 }
];
const ownedUpgrades = {};
let selectedBet = null;

function updateDisplay() {
    document.getElementById('coinCount').textContent = coins.toFixed(1);
    document.getElementById('cps').textContent = cps.toFixed(1);
    renderUpgrades();
}

function handleCoinClick() {
    coins++;
    updateDisplay();
}

function buyUpgrade(upgrade) {
    if (coins >= upgrade.cost) {
        coins -= upgrade.cost;
        cps += upgrade.cps;
        ownedUpgrades[upgrade.name] = (ownedUpgrades[upgrade.name] || 0) + 1;
        updateDisplay();
    }
}

function renderUpgrades() {
    const upgradesList = document.getElementById('upgradesList');
    upgradesList.innerHTML = '';
    upgrades.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.innerHTML = `
            <span>${upgrade.name} (Owned: ${ownedUpgrades[upgrade.name] || 0})</span>
            <button onclick="buyUpgrade(${JSON.stringify(upgrade)})" ${coins < upgrade.cost ? 'disabled' : ''}>
                Buy for ${upgrade.cost} coins
            </button>
        `;
        upgradesList.appendChild(upgradeElement);
    });
}

function spinSlotMachine() {
    if (coins >= 5) {
        coins -= 5;
        updateDisplay();
        document.getElementById('spinButton').disabled = true;
        
        const slots = ['🍒', '🍊', '🍇'];
        const slotElements = document.querySelectorAll('.slot-content');
        slotElements.forEach(el => el.parentNode.classList.add('spinning'));
        
        setTimeout(() => {
            const results = Array.from({length: 3}, () => Math.floor(Math.random() * 3));
            slotElements.forEach((el, index) => {
                el.textContent = slots[results[index]];
                el.parentNode.classList.remove('spinning');
            });
            
            if (results.every(slot => slot === results[0])) {
                const winAmount = 20 * (results[0] + 1);
                coins += winAmount;
                alert(`You won ${winAmount} coins!`);
            }
            
            updateDisplay();
            document.getElementById('spinButton').disabled = false;
        }, 1000);
    }
}

const canvas = document.getElementById('rouletteWheel');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 140;

const colors = ['#B22222', '#000000'];
const numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

function drawRouletteWheel(angle) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw the outer circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();

    // Draw the number segments
    for (let i = 0; i < 37; i++) {
        const arcAngle = (2 * Math.PI) / 37;
        ctx.save();
        ctx.rotate(angle + i * arcAngle);
        ctx.beginPath();
        ctx.arc(0, 0, radius - 5, 0, arcAngle);
        ctx.lineTo(0, 0);
        ctx.fillStyle = i === 0 ? '#008000' : colors[i % 2];
        ctx.fill();

        // Draw the numbers
        ctx.rotate(arcAngle / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(numbers[i].toString(), radius - 10, 0);
        ctx.restore();
    }

    ctx.restore();

    // Draw the stationary arrow on the right side pointing left
    ctx.beginPath();
    ctx.moveTo(canvas.width, centerY);
    ctx.lineTo(canvas.width - 20, centerY - 10);
    ctx.lineTo(canvas.width - 20, centerY + 10);
    ctx.closePath();
    ctx.fillStyle = '#FFD700';
    ctx.fill();
}

function spinRoulette() {
    const betAmount = parseInt(document.getElementById('betAmount').value);
    if (coins >= betAmount && selectedBet !== null) {
        coins -= betAmount;
        updateDisplay();
        document.getElementById('spinRouletteButton').disabled = true;

        let angle = 0;
        const spinAngle = Math.random() * Math.PI * 2 + Math.PI * 4; // At least 2 full rotations
        const duration = 5000; // 5 seconds
        const start = performance.now();

        function animate(time) {
            const elapsed = time - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                angle = easeOutCubic(progress) * spinAngle;
                drawRouletteWheel(-angle);
                requestAnimationFrame(animate);
            } else {
                const finalAngle = spinAngle % (Math.PI * 2);
                drawRouletteWheel(-finalAngle);
                
                const result = numbers[Math.floor((finalAngle / (Math.PI * 2)) * 37)];
                
                let winAmount = 0;
                if (selectedBet === 'red' && result !== 0 && numbers.indexOf(result) % 2 === 1) {
                    winAmount = betAmount * 2;
                } else if (selectedBet === 'black' && result !== 0 && numbers.indexOf(result) % 2 === 0) {
                    winAmount = betAmount * 2;
                } else if (selectedBet === 'green' && result === 0) {
                    winAmount = betAmount * 35;
                }

                if (winAmount > 0) {
                    coins += winAmount;
                    alert(`You won ${winAmount} coins! The number was ${result}.`);
                } else {
                    alert(`You lost. The number was ${result}.`);
                }

                updateDisplay();
                document.getElementById('spinRouletteButton').disabled = false;
            }
        }

        requestAnimationFrame(animate);
    }
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Set up bet options
const betOptions = ['red', 'black', 'green'];
const betOptionsContainer = document.getElementById('betOptions');
betOptions.forEach(option => {
    const button = document.createElement('div');
    button.className = 'bet-option';
    button.textContent = option;
    button.onclick = () => {
        document.querySelectorAll('.bet-option').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedBet = option;
    };
    betOptionsContainer.appendChild(button);
});

// Set up event listeners
document.getElementById('clickButton').addEventListener('click', handleCoinClick);
document.getElementById('spinButton').addEventListener('click', spinSlotMachine);
document.getElementById('spinRouletteButton').addEventListener('click', spinRoulette);

// Initial render
updateDisplay();

// Set up automatic coin generation
setInterval(() => {
    coins += cps / 10;
    updateDisplay();
}, 100);

// Initial draw of the roulette wheel
drawRouletteWheel(0);
