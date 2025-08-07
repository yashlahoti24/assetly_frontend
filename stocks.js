const API_KEY = '04WF81VS40NKR97';

        async function getStockData() {
            const symbol = document.getElementById('symbol').value.trim().toUpperCase();
            if (!symbol) return alert("Enter a stock symbol.");

            const weeklyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${API_KEY}`;
            const monthlyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${API_KEY}`;

            try {
                const weeklyRes = await fetch(weeklyUrl);
                const weeklyData = await weeklyRes.json();
                const monthlyRes = await fetch(monthlyUrl);
                const monthlyData = await monthlyRes.json();

                if (weeklyData.Note || monthlyData.Note || !weeklyData["Weekly Time Series"]) {
                    document.getElementById('stock-data').innerText = "API limit hit or invalid symbol.";
                    return;
                }

                const weeklyPrices = extractData(weeklyData["Weekly Time Series"], 10);
                const monthlyPrices = extractData(monthlyData["Monthly Time Series"], 10);
                const yearlyPrices = calculateYearly(monthlyData["Monthly Time Series"]);

                displayStockData(weeklyPrices, monthlyPrices, yearlyPrices);
                plotChart(weeklyPrices, monthlyPrices, yearlyPrices);

            } catch (err) {
                console.error(err);
                document.getElementById('stock-data').innerText = "Error fetching data.";
            }
        }

        function extractData(data, count) {
            return Object.entries(data).slice(0, count).map(([date, val]) => ({
                date, price: val["4. close"]
            })).reverse();
        }

        function calculateYearly(data) {
            const entries = Object.entries(data).slice(0, 120); // 10 years
            const years = [];
            for (let i = 0; i < entries.length; i += 12) {
                const year = new Date(entries[i][0]).getFullYear();
                const avg = entries.slice(i, i+12).reduce((sum, [_, val]) => sum + parseFloat(val["4. close"]), 0) / 12;
                years.push({ year, price: avg.toFixed(2) });
            }
            return years.reverse();
        }

        function displayStockData(w, m, y) {
            let html = "<h2>Stock Data</h2><h3>Weekly</h3>";
            w.forEach(i => html += `<p>${i.date}: $${i.price}</p>`);
            html += "<h3>Monthly</h3>";
            m.forEach(i => html += `<p>${i.date}: $${i.price}</p>`);
            html += "<h3>Yearly Avg</h3>";
            y.forEach(i => html += `<p>${i.year}: $${i.price}</p>`);
            document.getElementById('stock-data').innerHTML = html;
        }

        function plotChart(w, m, y) {
            const ctx = document.getElementById('stockChart').getContext('2d');
        
            // ✅ Check if it's a valid Chart instance before destroying
            if (window.stockChart instanceof Chart) {
                window.stockChart.destroy();
            }
        
            window.stockChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [...w.map(i => i.date), ...m.map(i => i.date), ...y.map(i => i.year)],
                    datasets: [{
                        label: 'Stock Price',
                        data: [...w, ...m, ...y].map(i => i.price),
                        borderColor: 'blue',
                        borderWidth: 2,
                        fill: false,
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
        