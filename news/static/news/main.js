document.addEventListener('DOMContentLoaded', () => {
    getTheme();

    if (document.querySelector('.grid')) {
        waitImages();
    }

    const themeButton = document.querySelector('#theme-switcher');
    themeButton.addEventListener('click', event => {
        if (themeButton.innerHTML === 'Light Mode') {
            saveTheme('light');
            switchTheme('light');
        } else if (themeButton.innerHTML === 'Dark Mode') {
            saveTheme('dark');
            switchTheme('dark');
        }
    })

    if (document.querySelector('#chart')) {
        const quote = document.querySelector("#quote-name").innerHTML;
        document.querySelectorAll('.range-button').forEach(async function(element) {
            element.addEventListener('click', (event) => {
                let range = event.currentTarget.innerHTML.toLowerCase();
                let interval = event.currentTarget.id;
                document.querySelector('#range').innerHTML = range;
                document.querySelector('#interval').innerHTML = interval;
                renderGraph(quote, range, interval, true, document.querySelector('#theme-text').innerHTML);
            })
        })

        document.querySelectorAll('#chart-button, #summary-button, #news-button, #about-button').forEach(element => {
            const chartArea = document.querySelector('#chart-area');
            const summaryArea = document.querySelector('#summary-section');
            const newsArea = document.querySelector('#news-section');
            const aboutArea = document.querySelector('#about-section');
            element.addEventListener('click', (event) => {
                if (event.currentTarget.id === 'chart-button') {
                    summaryArea.style.display = 'none';
                    newsArea.style.display = 'none';
                    aboutArea.style.display = 'none';
                    chartArea.style.display = 'block';
                } else if (event.currentTarget.id === 'summary-button') {
                    aboutArea.style.display = 'none';
                    chartArea.style.display = 'none';
                    newsArea.style.display = 'none';
                    summaryArea.style.display = 'flex';
                } else if (event.currentTarget.id === 'about-button') {
                    chartArea.style.display = 'none';
                    summaryArea.style.display = 'none';
                    newsArea.style.display = 'none';
                    aboutArea.style.display = 'flex';
                } else if (event.currentTarget.id === 'news-button') {
                    chartArea.style.display = 'none';
                    summaryArea.style.display = 'none';
                    aboutArea.style.display = 'none';
                    newsArea.style.display = 'block';
                }
            })
        })
        renderGraph(quote, '1d', '1m', false, document.querySelector('#theme-text').innerHTML);
    }

    if (document.querySelector('#pie-chart')) {
        document.querySelectorAll('#assets-button, #transactions-button').forEach(element => {
            const assetsTable = document.querySelector('#assets-table');
            const transactionsTable = document.querySelector('#transactions-table');
            element.addEventListener('click', (event) => {
                if (event.currentTarget.id === 'transactions-button') {
                    assetsTable.style.display = 'none';
                    transactionsTable.style.display = 'inline';
                } else if (event.currentTarget.id === 'assets-button') {
                    transactionsTable.style.display = 'none';
                    assetsTable.style.display = 'inline';
                }
            })
        })
        renderPie();
        transactionHistory();
    }
})

function waitImages() {

    // Wait for images to load before initializing Masonry
    imagesLoaded('.result-img', function() {

        // Arrange news items on index.html using Masonry
        let msnry = new Masonry( '.grid', {
            columnWidth: 200,
            itemSelector: '.grid-item',
            gutter: 15,
            originLeft: false,
            fitWidth: true
        });
    })
}

let timer;
const api = "https://query1.finance.yahoo.com/v8/finance/chart"
function renderGraph(quote, range, interval, update, theme) {
    clearInterval(timer);
    console.log(theme);
    let textColor;
    if (theme === 'dark') {
        textColor = '#a5bfc5';
    } else if (theme === 'light') {
        textColor = '#181870';
    }
    fetch(`${api}/${quote}?range=${range}&interval=${interval}`)
        .then(response => response.json())
        .then(response => {
            const data = response.chart.result[0];

            console.log(response);

            if (data.meta.regularMarketPrice.toFixed(2) < parseFloat(document.querySelector("#currentPrice").innerHTML)) {
                document.querySelector("#currentPrice").style.color = 'red';
            } else if (data.meta.regularMarketPrice.toFixed(2) > parseFloat(document.querySelector("#currentPrice").innerHTML)) {
                document.querySelector("#currentPrice").style.color = 'green';
            }

            document.querySelector("#currentPrice").innerHTML = `${data.meta.regularMarketPrice.toFixed(2)}`;
            document.querySelector('#currency-type').innerHTML = `, currency in ${data.meta.currency}`

            const chartData = data.timestamp.map((timestamp, i) => {
                if (range === '1d') {
                    return {
                        x: new Date(timestamp * 1000).toLocaleTimeString(),
                        close: roundPrice(data.indicators.quote[0].close[i]),
                        open: roundPrice(data.indicators.quote[0].open[i]),
                        volume: data.indicators.quote[0].volume[i]
                    }
                } else if (range === '5d') {
                    return {
                        x: new Date(timestamp * 1000).toLocaleString(),
                        close: roundPrice(data.indicators.quote[0].close[i]),
                        open: roundPrice(data.indicators.quote[0].open[i]),
                        volume: data.indicators.quote[0].volume[i]
                    }
                } else {
                    return {
                        x: new Date(timestamp * 1000).toLocaleDateString(),
                        close: roundPrice(data.indicators.quote[0].close[i]),
                        open: roundPrice(data.indicators.quote[0].open[i]),
                        volume: data.indicators.quote[0].volume[i]
                    }
                }
            });

            for (let i = 0; i < chartData.length; i++) {
                if (chartData[i].close === undefined) {
                    chartData.splice(i,i);
                }
            }

            console.log(chartData);

            let chartColor;
            if (chartData[0].close > chartData[chartData.length - 1].close) {
                chartColor = 'red';
            } else if (chartData[0].close < chartData[chartData.length - 1].close) {
                chartColor = 'green';
            }

            let options = {
                chart: {
                    foreColor: textColor,
                    fontFamily: 'Albert Sans',
                    group: 'main',
                    type: 'area',
                    height: '400',
                    animations: {
                        enabled: true
                    },
                    id: 'priceChart'
                },
                dataLabels: {
                    enabled: false
                },
                title: {
                    text: `${quote} Price in ${data.meta.currency}`,
                    align: 'center'
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        opacityFrom: 0.3,
                        opacityTo: 0,
                        inverseColors: false
                    }},
                series: [{
                    name: `${quote}`,
                    data: chartData.map(row => row.close)
                }],
                xaxis: {
                    categories: chartData.map(row => row.x),
                    type: 'category'
                },
                yaxis: [{
                    title: {
                        text: `${quote} Price`,
                    },
                }],
                zoom: {
                    type: 'x',
                    enabled: true,
                    autoScaleYaxis: true
                },
                colors: [`${chartColor}`]
            };
            let volumeBars = {
                chart: {
                    foreColor: textColor,
                    fontFamily: 'Albert Sans',
                    group: 'main',
                    type: 'bar',
                    id: 'volume',
                    height: '290',
                    animations: {
                        enabled: true
                    }},
                series: [{
                    name: `Volume`,
                    data: chartData.map(row => row.volume)
                }],
                xaxis: {
                    categories: chartData.map(row => row.x),
                    type: 'category'
                },
                yaxis: [{
                    title: {
                        text: `${quote} Volume`
                    }
                }],
                dataLabels: {
                    enabled: false
                },
                zoom: {
                    type: 'x',
                    enabled: true,
                    autoScaleYaxis: true
                },
                title: {
                    text: 'Trading Volume',
                    align: 'center'
                }
            };

            let volumeChart = new ApexCharts(document.querySelector('#volume-chart'), volumeBars);
            let priceChart = new ApexCharts(document.querySelector('#chart'), options);

            if (update === false) {
                volumeChart.render();
                priceChart.render();
            } else if (update === true) {
                ApexCharts.exec('volume', 'updateOptions', {
                    chart: {
                        foreColor: textColor
                    },
                    series: [{
                        data: chartData.map(row => row.volume)
                    }],
                    xaxis: {
                        categories: chartData.map(row => row.x)
                    }
                });
                ApexCharts.exec('priceChart', 'updateOptions', {
                    chart: {
                        foreColor: textColor
                    },
                    series: [{
                        data: chartData.map(row => row.close)
                    }],
                    xaxis: {
                        categories: chartData.map(row => row.x)
                    },
                    colors: [`${chartColor}`]
                    });
            }
        })
    timer = setInterval(renderGraph, 5000, quote, range, interval, true, theme);
}


function renderPie() {
    const username = document.querySelector('#username').innerHTML;
    fetch(`/assets/${username}`)
        .then(response => response.json())
        .then(response => {
            if (response.length === 0) {
                document.querySelectorAll('.dependant').forEach((el) => {
                    el.style.display = 'none';
                })
                document.querySelector('#no-assets').style.display = 'block';
            } else {
                    let pieData = response.map((stock => {
                        return {
                            "symbol": stock.fields.symbol,
                            "amount": stock.fields.amount,
                            "cost": stock.fields.cost
                        }
                    }));
        
                    let pieOptions = {
                        series: pieData.map(row => row.cost),
                        chart: {
                            type: 'pie'
                        },
                        labels: pieData.map(row => row.symbol),
                        responsive: [{
                            breakpoint: 180,
                            options: {
                                chart: {
                                    width: 200
                                },
                                legend: {
                                    position: 'bottom'
                                }
                            }
                        }],
                        fill: {
                            type: 'gradient'
                        }
                    }
        
                    let pieChart = new ApexCharts(document.querySelector('#pie-chart'), pieOptions);
                    pieChart.render();
        
                    const body = document.querySelector('#assets-body');
        
                    let netWorth = 0;
        
                    for (let i = 0; i < pieData.length; i++) {
                        fetch(`${api}/${pieData[i].symbol}`)
                            .then(response => response.json())
                            .then(response => {
                                let currentPrice = response.chart.result[0].meta.regularMarketPrice;
        
                                const tr = document.createElement('tr');
                                body.appendChild(tr);
        
                                const symbolCell = document.createElement('td');
                                const symbolLink = document.createElement('a');
                                const amountCell = document.createElement('td');
                                const costCell = document.createElement('td');
                                const profitCell = document.createElement('td');
        
                                const costBasis = (pieData[i].cost / pieData[i].amount).toFixed(2);
                                const profit = (currentPrice - costBasis).toFixed(2);
                                const percentage = ((profit / costBasis) * 100).toFixed(2);
        
                                netWorth = netWorth + (pieData[i].amount * currentPrice);
        
                                symbolLink.innerHTML = pieData[i].symbol;
                                symbolLink.setAttribute('href', `quotes/${pieData[i].symbol}`);
                                amountCell.innerHTML = pieData[i].amount;
                                costCell.innerHTML = costBasis;
                                profitCell.innerHTML = `${profit} (${percentage}%)`;
                                profitCell.style.fontWeight = 'bold';
        
                                amountCell.classList.add('table-static');
                                costCell.classList.add('table-static');
        
                                if (profit > 0) {
                                    profitCell.style.color = 'green';
                                } else if (profit < 0) {
                                    profitCell.style.color = 'red';
                                }
        
                                tr.appendChild(symbolCell);
                                symbolCell.appendChild(symbolLink);
                                tr.appendChild(amountCell);
                                tr.appendChild(costCell);
                                tr.appendChild(profitCell);
                                document.querySelector('#net-worth').innerHTML = `$${netWorth.toFixed(2)}`;
                            })
                    }
            }

            


        })
}

function transactionHistory() {
    const username = document.querySelector('#username').innerHTML;
    fetch(`/transactions/${username}`)
        .then(response => response.json())
        .then(response => {
            const body = document.querySelector('#transactions-body');
            for (let i = response.length - 1; i >= 0; i--) {
                const tr = document.createElement('tr');
                body.appendChild(tr);

                const symbolCell = document.createElement('td');
                const symbolLink = document.createElement('a');
                const typeCell = document.createElement('td');
                const amountCell = document.createElement('td');
                const priceCell = document.createElement('td');
                const valueCell = document.createElement('td');
                const timeCell = document.createElement('td');

                symbolLink.innerHTML = response[i].fields.symbol;
                symbolLink.setAttribute('href', `quotes/${response[i].fields.symbol}`);
                typeCell.innerHTML = response[i].fields.type;
                amountCell.innerHTML = response[i].fields.amount;
                priceCell.innerHTML = response[i].fields.price;
                valueCell.innerHTML = (response[i].fields.price * response[i].fields.amount).toFixed(2);
                timeCell.innerHTML = response[i].fields.timestamp;

                typeCell.classList.add('table-static');
                amountCell.classList.add('table-static');
                priceCell.classList.add('table-static');
                valueCell.classList.add('table-static');
                timeCell.classList.add('table-static');

                tr.appendChild(symbolCell);
                symbolCell.appendChild(symbolLink);
                tr.appendChild(typeCell);
                tr.appendChild(amountCell);
                tr.appendChild(priceCell);
                tr.appendChild(valueCell);
                tr.appendChild(timeCell);
            }
        })
}

function getTheme() {
    const username = document.querySelector('#username').innerHTML;
    fetch(`/theme/${username}`)
        .then(response => response.json())
        .then(response => {
            if (response.is_dark === true) {
                switchTheme('dark');
            } else if (response.is_dark === false) {
                switchTheme('light');
            }
        })
}

function switchTheme(mode) {
    const themeButton = document.querySelector('#theme-switcher');
    const themeText = document.querySelector('#theme-text');
    if (mode === 'dark') {
        themeButton.innerHTML = 'Light Mode';
        themeText.innerHTML = 'dark';
        document.querySelectorAll('.general-item').forEach(el => {
            el.style.backgroundColor = 'rgba(49,59,65,0.7)';
        })
        document.querySelectorAll('.general-item').forEach(el => {
            el.style.boxShadow = '1px 1px 20px rgb(0,16,16)';
        })
        document.querySelector('body').style.backgroundColor = 'rgb(28,33,35)';
        document.querySelectorAll('.table-static, th, body').forEach(el => {
            el.style.color = '#a5bfc5';
        })
        if (document.querySelector('#chart')) {
            renderGraph(document.querySelector('#quote-name').innerHTML,
                document.querySelector('#range').innerHTML,
                document.querySelector('#interval').innerHTML, true, 'dark');
        }
    } else if (mode === 'light') {
        themeButton.innerHTML = 'Dark Mode';
        themeText.innerHTML = 'light';
        document.querySelectorAll('.general-item').forEach(el => {
            el.style.backgroundColor = '#eff5ff';
        })
        document.querySelectorAll('.general-item').forEach(el => {
            el.style.boxShadow = '1px 1px 20px #186970';
        })
        document.querySelector('body').style.backgroundColor = 'rgba(173, 216, 230, 0.69)';
        document.querySelectorAll('.table-static, th, body').forEach(el => {
            el.style.color = '#181870';
        })
        if (document.querySelector('#chart')) {
            renderGraph(document.querySelector('#quote-name').innerHTML,
                document.querySelector('#range').innerHTML,
                document.querySelector('#interval').innerHTML, true, 'light');
        }
    }
}

function saveTheme(theme) {
    const username = document.querySelector('#username').innerHTML;
    let toggle;
    switch (theme) {
        case 'dark':
            toggle = true;
            break;
        default:
            toggle = false;
            break;
    }
    fetch(`/theme/${username}`, {
        method: 'PUT',
        body: JSON.stringify({
            is_dark: toggle
        })
    })
}

function roundPrice(value) {
    if (value != null) {
        return parseFloat(value.toFixed(2));
    }
}
