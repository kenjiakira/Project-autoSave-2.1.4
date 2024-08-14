const axios = require('axios');
const schedule = require('node-schedule');
const { createCanvas } = require('canvas');
const fs = require('fs-extra');
const { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } = require('chart.js');

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

module.exports.config = {
  name: 'btc',
  version: '2.0.0',
  credits: 'Hoàng Ngọc Từ',
  hasPermission: 0,
  description: 'xem chứng khoán bitcoin',
  commandCategory: 'Utility',
  usePrefix: false,
  usages: 'btc\n\nHướng dẫn sử dụng:\n' +
      '1. Gõ lệnh `btc` để xem giá Bitcoin, Ethereum và Dogecoin hiện tại, cũng như biểu đồ giá Bitcoin trong 24 giờ qua.\n' +
      '2. Thông tin sẽ được cập nhật tự động mỗi giờ.',
  cooldowns: 10
};

const formatCurrency = (number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
};

const generateChart = async (chartData) => {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const labels = chartData.map(dataPoint => new Date(dataPoint[0]).toLocaleTimeString());
  const data = chartData.map(dataPoint => dataPoint[1]);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Bitcoin Price (USD)',
        data: data,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
        title: {
          display: true,
          text: 'Bitcoin Price in the Last 24 Hours'
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Price (USD)'
          }
        }
      }
    }
  });

  const buffer = canvas.toBuffer('image/png');
  const path = './module/commands/cache/bitcoin_chart.png';
  await fs.writeFile(path, buffer);
  return path;
};

module.exports.run = async ({ api, event }) => {
  const sendUpdate = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd');
      const prices = response.data;

      const priceBTCUSD = prices.bitcoin.usd;
      const priceETHUSD = prices.ethereum.usd;
      const priceDOGEUSD = prices.dogecoin.usd;

      const exchangeRateResponse = await axios.get('https://openexchangerates.org/api/latest.json?app_id=61633cc8176742a4b1a470d0d93df6df');
      const exchangeRateVND = exchangeRateResponse.data.rates.VND;

      const priceBTCVND = priceBTCUSD * exchangeRateVND;
      const priceETHVND = priceETHUSD * exchangeRateVND;
      const priceDOGEVND = priceDOGEUSD * exchangeRateVND;

      const formattedPriceBTCVND = formatCurrency(priceBTCVND);
      const formattedPriceETHVND = formatCurrency(priceETHVND);
      const formattedPriceDOGEVND = formatCurrency(priceDOGEVND);

      const message = `===SÀN GIAO DỊCH===\n\n1. Giá trị Bitcoin📌 (BTC) hiện tại là:\n1 BTC = ${formattedPriceBTCVND}\n\n2. Giá trị Ethereum💎 (ETH) hiện tại là:\n1 ETH = ${formattedPriceETHVND}\n\n3. Giá trị Dogecoin🐶 (DOGE) hiện tại là:\n1 DOGE = ${formattedPriceDOGEVND}`;

      const chartResponse = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart', {
        params: {
          vs_currency: 'usd',
          days: 1
        }
      });
      const chartData = chartResponse.data.prices;
      const priceChangeBTC24h = ((chartData[chartData.length - 1][1] - chartData[0][1]) / chartData[0][1]) * 100;

      const chartPath = await generateChart(chartData);

      api.sendMessage({
        body: message + `\n\nTỉ lệ thay đổi giá BTC trong 24 giờ gần nhất: ${priceChangeBTC24h.toFixed(2)}%`,
        attachment: fs.createReadStream(chartPath)
      }, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage('Đã xảy ra lỗi khi cập nhật thông tin chứng khoán BTC, Ethereum và Dogecoin.', event.threadID);
    }
  };

  schedule.scheduleJob('0 * * * *', sendUpdate);
  sendUpdate();
};
