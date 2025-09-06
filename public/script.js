const chartData = []


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const priceDiv = document.querySelector("#price")

    const options = {
        chart: {
            type: 'candlestick',
        },
        series: [{
            name: 'sales',
            data: []
        }]
    }

    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();

    while (true) {
        await sleep(1000)

        try {

            // get klines
            const resKlines = await fetch("http://localhost:3000/market/klines?asset=1")
            const data = await resKlines.json()
            const candles = data.map(item => {
                return {
                    x: (new Date(item.startTime)).getTime(),
                    y: [item.open, item.high, item.low, item.close]
                }
            }).slice(-200)

            // candles.shift()
            // candles.shift()
            // candles.shift()
            // candles.shift()
            // candles.shift()
            // candles.shift()
            // candles.shift()

            // get orderbook / depth
            const resDepth = await fetch("http://localhost:3000/market/depth?asset=1")
            const depth = await resDepth.json()
            depth.ask.reverse()

            // cari qty terbesar
            let maxAskQty = 0
            for (let i = 0; i < depth.ask.length; i++) {
                if (depth.ask[i].quantity > maxAskQty) {
                    maxAskQty = depth.ask[i].quantity
                }
            }

            let maxBidQty = 0
            for (let i = 0; i < depth.bid.length; i++) {
                if (depth.bid[i].quantity > maxBidQty) {
                    maxBidQty = depth.bid[i].quantity
                }
            }

            // tambah percentage
            depth.ask = depth.ask.map(item => {
                return {
                    price: item.price,
                    quantity: item.quantity,
                    percentage: parseInt((item.quantity / maxAskQty) * 100)
                }
            })

            depth.bid = depth.bid.map(item => {
                return {
                    price: item.price,
                    quantity: item.quantity,
                    percentage: parseInt((item.quantity / maxBidQty) * 100)
                }
            })

            let askText = ""
            for (let i = 0; i < depth.ask.length; i++) {
                askText += `<div class="w-full flex justify-between relative">
                <div class="absolute top-0 left-0 h-full w-[${depth.ask[i].percentage}%] bg-red-400 -z-10"></div>
                <p>${depth.ask[i].price}</p>
                <p>${depth.ask[i].quantity}</p>
            </div>`
            }

            let bidText = ""
            for (let i = 0; i < depth.bid.length; i++) {
                bidText += `<div class="w-full flex justify-between relative">
                <div class="absolute top-0 left-0 h-full w-[${depth.bid[i].percentage}%] bg-green-400 -z-10"></div>
                <p>${depth.bid[i].price}</p>
                <p>${depth.bid[i].quantity}</p>
            </div>`
            }

            document.querySelector("#ask").innerHTML = askText
            document.querySelector("#bid").innerHTML = bidText


            // update price
            priceDiv.innerHTML = `Rp. ${data[data.length - 1].close}`
            if (data[data.length - 1].close > data[data.length - 1].open) {
                priceDiv.classList.remove("text-red-400")
                priceDiv.classList.add("text-green-400")
            } else if (data[data.length - 1].close < data[data.length - 1].open) {
                priceDiv.classList.remove("text-green-400")
                priceDiv.classList.add("text-red-400")
            } else {
                priceDiv.classList.remove("text-green-400")
                priceDiv.classList.remove("text-red-400")
            }

            chart.updateSeries([{
                data: candles
            }], false)
        }
        catch (e) {
            // console.log(e)
        }
    }
}



// function renderChart(data = []) {

//     chart.render();
// }

main()