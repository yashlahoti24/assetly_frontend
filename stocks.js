const API_KEY = '04WF81VS40NKR97';

async function getStockData() {
    const symbol = document.getElementById('symbol').value.trim().toUpperCase();
    const timeframe = document.getElementById('timeframe').value;

    if (!symbol) return alert("Enter a stock symbol.");

    const weeklyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${API_KEY}`;
    const monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${API_KEY}`;

    try {
        const [weeklyRes, monthlyRes] = await Promise.all([
            fetch(weeklyUrl),
            fetch(monthlyUrl)
        ]);
        const weeklyData = await weeklyRes.json();
        const monthlyData = await monthlyRes.json();

        if (weeklyData.Note || monthlyData.Note || !weeklyData["Weekly Time Series"]) {
            document.getElementById('stock-data').innerText = "API limit hit or invalid symbol.";
            return;
        }

        const weeklyPrices = extractData(weeklyData["Weekly Time Series"], 10);
        const monthlyPrices = extractData(monthlyData["Monthly Time Series"], 10);
        const yearlyPrices = calculateYearly(monthlyData["Monthly Time Series"]);

        displayStockData({ weeklyPrices, monthlyPrices, yearlyPrices }, timeframe);
        plotChart({ weeklyPrices, monthlyPrices, yearlyPrices }, timeframe);

    } catch (err) {
        console.error(err);
        document.getElementById('stock-data').innerText = "Error fetching data.";
    }
}

function extractData(data, count) {
    return Object.entries(data).slice(0, count).map(([date, val]) => ({
        date,
        price: val["4. close"]
    })).reverse();
}

function calculateYearly(data) {
    const entries = Object.entries(data).slice(0, 120); // 10 years
    const years = [];
    for (let i = 0; i < entries.length; i += 12) {
        const year = new Date(entries[i][0]).getFullYear();
        const avg = entries.slice(i, i + 12).reduce((sum, [_, val]) => sum + parseFloat(val["4. close"]), 0) / 12;
        years.push({ year, price: avg.toFixed(2) });
    }
    return years.reverse();
}

function displayStockData(data, timeframe) {
    let html = "<h4 class='mb-3'>Stock Data</h4>";
    if (timeframe === 'weekly') {
        html += "<h5>Weekly</h5>";
        data.weeklyPrices.forEach(i => html += `<p>${i.date}: $${i.price}</p>`);
    } else if (timeframe === 'monthly') {
        html += "<h5>Monthly</h5>";
        data.monthlyPrices.forEach(i => html += `<p>${i.date}: $${i.price}</p>`);
    } else {
        html += "<h5>Yearly Avg</h5>";
        data.yearlyPrices.forEach(i => html += `<p>${i.year}: $${i.price}</p>`);
    }
    document.getElementById('stock-data').innerHTML = html;
}

function plotChart(data, timeframe) {
    const ctx = document.getElementById('stockChart').getContext('2d');

    if (window.stockChart instanceof Chart) {
        window.stockChart.destroy();
    }

    let labels = [], prices = [];

    if (timeframe === 'weekly') {
        labels = data.weeklyPrices.map(i => i.date);
        prices = data.weeklyPrices.map(i => i.price);
    } else if (timeframe === 'monthly') {
        labels = data.monthlyPrices.map(i => i.date);
        prices = data.monthlyPrices.map(i => i.price);
    } else {
        labels = data.yearlyPrices.map(i => i.year);
        prices = data.yearlyPrices.map(i => i.price);
    }

    window.stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Stock Price`,
                data: prices,
                borderColor: 'blue',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price ($)'
                    }
                }
            }
        }
    });
}
