let coins = 0;
let coinMultiplier = 1;
let autoMiner = 0;
let coinHistory = [];

const coinsEl = document.getElementById('coins');
const btcPriceEl = document.getElementById('btcPrice');
const coinValueEl = document.getElementById('coinValue');
const mineBtn = document.getElementById('mineBtn');
const upgradeBtns = document.querySelectorAll('.upgradeBtn');

// Chart.js setup
const ctx = document.getElementById('coinChart').getContext('2d');
const coinChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Coins Over Time',
            data: [],
            borderColor: '#00ff9d',
            backgroundColor: 'rgba(0,255,157,0.2)',
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: { beginAtZero:true }
        },
        plugins: { legend: { display:false } }
    }
});

// Mine button
mineBtn.addEventListener('click', () => {
  coins += coinMultiplier;
  addToChart();
  updateDisplay();
});

// Upgrades
upgradeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cost = parseFloat(btn.getAttribute('data-cost'));
    const multiplier = parseFloat(btn.getAttribute('data-multiplier'));

    if(coins >= cost){
      coins -= cost;
      if(btn.textContent.includes("Pickaxe")){
        coinMultiplier *= multiplier;
        btn.setAttribute('data-cost', Math.ceil(cost*2));
        btn.textContent = `Upgrade Pickaxe (Cost: ${Math.ceil(cost*2)})`;
      } else {
        autoMiner += multiplier;
        btn.setAttribute('data-cost', Math.ceil(cost*3));
        btn.textContent = `Buy Auto-Miner (Cost: ${Math.ceil(cost*3)})`;
      }
      updateDisplay();
    } else {
      alert("Not enough coins!");
    }
  });
});

// Auto miner interval
setInterval(() => {
  coins += autoMiner;
  addToChart();
  updateDisplay();
}, 1000);

// Update display
function updateDisplay(){
  coinsEl.textContent = coins.toFixed(2);
  coinValueEl.textContent = (coins * btcPrice).toFixed(2);
}

// BTC price
let btcPrice = 0;
async function updateBTCPrice(){
  try{
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
    const data = await res.json();
    btcPrice = data.bitcoin.usd;
    btcPriceEl.textContent = btcPrice;
    updateDisplay();
  }catch(e){ console.error(e);}
}

updateBTCPrice();
setInterval(updateBTCPrice, 60000);

// Chart update
function addToChart(){
  const now = new Date().toLocaleTimeString();
  coinHistory.push(coins.toFixed(2));
  coinChart.data.labels.push(now);
  coinChart.data.datasets[0].data.push(coins.toFixed(2));

  // Keep only last 20 points
  if(coinChart.data.labels.length > 20){
    coinChart.data.labels.shift();
    coinChart.data.datasets[0].data.shift();
  }
  coinChart.update();
}
