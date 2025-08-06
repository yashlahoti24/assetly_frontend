let investments = [];
let user = { name: 'John Doe', email: 'john@email.com' };
let charts = {};

document.addEventListener('DOMContentLoaded', function () {
    setupCharts();
    loadProfile();
});

function setupCharts() {
    charts.investment = new Chart(document.getElementById('investmentChart').getContext('2d'), {
        type: 'pie',
        data: { labels: ['Stocks', 'Gold'], datasets: [{ data: [0, 0], backgroundColor: ['#0d6efd', '#ffc107'] }] },
        options: { responsive: false }
    });
    charts.sector = new Chart(document.getElementById('sectorChart').getContext('2d'), {
        type: 'pie', data: { labels: [], datasets: [{ data: [], backgroundColor: ['#198754', '#dc3545', '#fd7e14', '#6f42c1'] }] },
        options: { responsive: false }
    });
    charts.budget = new Chart(document.getElementById('budgetChart').getContext('2d'), {
        type: 'bar', data: { labels: ['Left', 'Spent'], datasets: [{ data: [3000, 1500], backgroundColor: ['#198754', '#dc3545'] }] },
        options: { responsive: false, indexAxis: 'y' }
    });
    charts.retirement = new Chart(document.getElementById('retirementChart').getContext('2d'), {
        type: 'doughnut', data: { labels: ['Saved', 'Goal'], datasets: [{ data: [65, 35], backgroundColor: ['#198754', '#e9ecef'] }] },
        options: { responsive: false }
    });
}

// Show Add Investment
function showAddForm() { document.getElementById('addInvestmentForm').style.display = 'flex'; }
function closeForm() { document.getElementById('addInvestmentForm').style.display = 'none'; clearForm(); }
function toggleType() {
    const isStock = document.getElementById('stockRadio').checked;
    document.getElementById('stockFields').style.display = isStock ? 'block' : 'none';
    document.getElementById('goldFields').style.display = isStock ? 'none' : 'block';
}
function calculateStock() {
    const qty = parseFloat(document.getElementById('stockQty').value) || 0;
    const price = parseFloat(document.getElementById('stockPrice').value) || 0;
    document.getElementById('stockAmount').value = (qty * price).toFixed(2);
}
function calculateGold() {
    const price = parseFloat(document.getElementById('goldPrice').value) || 0;
    const weight = parseFloat(document.getElementById('goldWeight').value) || 0;
    document.getElementById('goldAmount').value = (price * weight).toFixed(2);
}
function addInvestment() {
    const isStock = document.getElementById('stockRadio').checked;
    if (isStock) {
        const symbol = document.getElementById('stockSymbol').value.trim();
        const name = document.getElementById('stockName').value.trim();
        const qty = parseFloat(document.getElementById('stockQty').value);
        const price = parseFloat(document.getElementById('stockPrice').value);
        const sector = document.getElementById('stockSector').value;
        const amount = parseFloat(document.getElementById('stockAmount').value);
        if (!symbol || !name || !qty || !price || !sector) { alert('Please fill all fields'); return; }
        investments.push({ type: 'Stock', name: `${name} (${symbol})`, amount: amount, sector: sector });
    } else {
        const price = parseFloat(document.getElementById('goldPrice').value);
        const weight = parseFloat(document.getElementById('goldWeight').value);
        const amount = parseFloat(document.getElementById('goldAmount').value);
        if (!price || !weight) { alert('Please fill all fields'); return; }
        investments.push({ type: 'Gold', name: `Gold (${weight} oz)`, amount: amount, sector: 'Commodities' });
    }
    updateEverything();
    closeForm();
    alert('Investment added successfully!');
}
function updateEverything() { updateTable(); updateCharts(); updateNetWorth(); }
function updateTable() {
    const tbody = document.getElementById('investmentList');
    tbody.innerHTML = '';
    investments.forEach(inv => {
        tbody.innerHTML += `<tr>
            <td><span class="badge bg-primary">${inv.type}</span></td>
            <td>${inv.name}</td>
            <td>$${inv.amount.toLocaleString()}</td>
        </tr>`;
    });
    document.getElementById('investmentTable').style.display = investments.length > 0 ? 'block' : 'none';
}
function updateCharts() {
    const stocks = investments.filter(inv => inv.type === 'Stock').length;
    const gold = investments.filter(inv => inv.type === 'Gold').length;
    charts.investment.data.datasets[0].data = [stocks, gold];
    charts.investment.update();
    const sectors = {};
    investments.forEach(inv => { if (inv.sector && inv.sector !== 'Commodities') { sectors[inv.sector] = (sectors[inv.sector] || 0) + 1; } });
    charts.sector.data.labels = Object.keys(sectors);
    charts.sector.data.datasets[0].data = Object.values(sectors);
    charts.sector.update();
}
function updateNetWorth() {
    const total = investments.reduce((sum, inv) => sum + inv.amount, 0);
    document.getElementById('netWorth').textContent = `$${(1000000 + total).toLocaleString()}`;
}
function clearForm() {
    document.getElementById('stockSymbol').value = '';
    document.getElementById('stockName').value = '';
    document.getElementById('stockQty').value = '';
    document.getElementById('stockPrice').value = '';
    document.getElementById('stockSector').value = '';
    document.getElementById('stockAmount').value = '';
    document.getElementById('goldPrice').value = '';
    document.getElementById('goldWeight').value = '';
    document.getElementById('goldAmount').value = '';
    document.getElementById('stockRadio').checked = true;
    toggleType();
}

// Profile
function loadProfile() {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
}
function showProfileForm() {
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editProfileForm').style.display = 'flex';
}
function closeProfileForm() {
    document.getElementById('editProfileForm').style.display = 'none';
}
function updateProfile() {
    user.name = document.getElementById('editName').value.trim() || user.name;
    user.email = document.getElementById('editEmail').value.trim() || user.email;
    loadProfile();
    closeProfileForm();
    alert('Profile updated!');
}



// ..............Getting News from Backend................

async function pageloaded() {
    const news = await fetch('http://localhost:8081/news/')
    // console.log(news);

    if (!news.ok)
        console.log("Error fetching from backend");

    let newsData = await news.json();
    let articles = newsData.articles
    let newsParent = document.getElementById("parentNews")
    console.log(articles);

    articles.forEach((article) => {
        let newsDiv = `<div class="col">
                  <div class="card">
                    <img src="${article.urlToImage}" class="card-img-top" alt="...">
                    <div class="card-body">
                      <h4 class="card-title font-weight-bold">${article.title}</h4>
                      <p class="card-text">${article.content}</p>
                      <a href="${article.url}" target="_blank" class="card-link">Read More..</a>
                    </div>
                  </div>
                </div>`
        newsParent.innerHTML += newsDiv
    })


}
