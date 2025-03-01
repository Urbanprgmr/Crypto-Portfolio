let portfolio = JSON.parse(localStorage.getItem("cryptoPortfolio")) || [];

const cryptoIdMap = {
  gala: "gala",
      btc: "bitcoin",
      eth: "ethereum",
      doge: "dogecoin",
      sol: "solana",
      alpaca: "alpaca-finance",
      dogs: "dogs-2",
      cookie: "cookie",
      render: "render-token",
      pi: "pi-network"
};

async function fetchPrices() {
  const ids = Object.values(cryptoIdMap).join(",");
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
  return response.json();
}

function savePortfolio() {
  localStorage.setItem("cryptoPortfolio", JSON.stringify(portfolio));
}

function addOrUpdateCrypto() {
  const name = document.getElementById("cryptoName").value.toLowerCase();
  const avgPrice = parseFloat(document.getElementById("avgPrice").value);
  const quantity = parseFloat(document.getElementById("quantity").value);

  if (!cryptoIdMap[name]) {
    alert("Crypto not found!");
    return;
  }

  if (editIndex === null) {
    portfolio.push({ name, avgPrice, quantity });
  } else {
    portfolio[editIndex] = { name, avgPrice, quantity };
    editIndex = null;
    document.getElementById("addCryptoButton").style.display = "inline-block";
    document.getElementById("updateCryptoButton").style.display = "none";
  }

  savePortfolio();
  updatePortfolio();
}

function deleteCrypto(index) {
  portfolio.splice(index, 1);
  savePortfolio();
  updatePortfolio();
}

async function updatePortfolio() {
  const prices = await fetchPrices();
  let totalInvestment = 0, totalPortfolioValue = 0, totalProfitLoss = 0;
  const portfolioTableBody = document.querySelector("#portfolioTable tbody");
  const targetsTableBody = document.querySelector("#targetsTable tbody");
  portfolioTableBody.innerHTML = "";
  targetsTableBody.innerHTML = "";

  const multiplier1 = parseFloat(document.getElementById("target1").value);
  const multiplier2 = parseFloat(document.getElementById("target2").value);
  const multiplier3 = parseFloat(document.getElementById("target3").value);

  portfolio.forEach((crypto, index) => {
    const currentPrice = prices[cryptoIdMap[crypto.name]]?.usd || 0;
    const totalCost = crypto.quantity * crypto.avgPrice;
    const totalValue = crypto.quantity * currentPrice;
    const profitLossUSD = totalValue - totalCost;

    totalInvestment += totalCost;
    totalPortfolioValue += totalValue;
    totalProfitLoss += profitLossUSD;

    portfolioTableBody.innerHTML += `
      <tr>
        <td>${crypto.name.toUpperCase()}</td>
        <td>${crypto.quantity}</td>
        <td>$${crypto.avgPrice.toFixed(6)}</td>
        <td>$${totalCost.toFixed(2)}</td>
        <td>$${currentPrice.toFixed(6)}</td>
        <td class="${profitLossUSD >= 0 ? 'profit-positive' : 'profit-negative'}">$${profitLossUSD.toFixed(2)}</td>
        <td>
          <button onclick="editCrypto(${index})">Edit</button>
          <button onclick="deleteCrypto(${index})">Delete</button>
        </td>
      </tr>
    `;

    targetsTableBody.innerHTML += `
      <tr>
        <td>${crypto.name.toUpperCase()}</td>
        <td>$${(crypto.avgPrice * multiplier1).toFixed(6)}</td>
        <td>$${((crypto.avgPrice * multiplier1 - crypto.avgPrice) * crypto.quantity).toFixed(2)}</td>
        <td>$${(crypto.avgPrice * multiplier2).toFixed(6)}</td>
        <td>$${((crypto.avgPrice * multiplier2 - crypto.avgPrice) * crypto.quantity).toFixed(2)}</td>
        <td>$${(crypto.avgPrice * multiplier3).toFixed(6)}</td>
        <td>$${((crypto.avgPrice * multiplier3 - crypto.avgPrice) * crypto.quantity).toFixed(2)}</td>
      </tr>
    `;
  });

  document.getElementById("totalInvestment").textContent = `$${totalInvestment.toFixed(2)}`;
  document.getElementById("totalUsdValue").textContent = `$${totalPortfolioValue.toFixed(2)}`;
  document.getElementById("totalProfitLossUsd").textContent = `$${totalProfitLoss.toFixed(2)}`;
}

document.getElementById("addCryptoButton").addEventListener("click", addOrUpdateCrypto);
document.getElementById("updateCryptoButton").addEventListener("click", addOrUpdateCrypto);
updatePortfolio();
