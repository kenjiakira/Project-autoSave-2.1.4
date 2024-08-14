const axios = require('axios');

module.exports.config = {
    name: "stock",
    version: "1.0.0",
    hasPermission: 0,
    credits: "HNT",
    description: "Cung cấp thông tin về cổ phiếu.",
    commandCategory: "Tài chính",
    usePrefix: true,
    usages: `
    *Cung cấp thông tin cổ phiếu:*

    1. Tra cứu thông tin cổ phiếu:
       - Cú pháp \`.stock [ký hiệu cổ phiếu]\`
       - Hướng dẫn Thay thế \`[ký hiệu cổ phiếu]\` bằng ký hiệu của cổ phiếu bạn muốn tra cứu. Ví dụ: \`.stock AAPL\` để xem thông tin cổ phiếu của Apple Inc. (AAPL).

    2. Gợi ý ký hiệu cổ phiếu phổ biến:
       - Apple Inc. AAPL
       - Microsoft Corporation MSFT
       - Google (Alphabet Inc.) GOOGL
       - Amazon.com Inc. AMZN
       - Tesla Inc. TSLA
       - Meta Platforms Inc. (Facebook) META
       - NVIDIA Corporation NVDA
       - Netflix Inc. NFLX
       - IBM Corporation IBM
       - Intel Corporation INTC

    *Chú ý*: Ký hiệu cổ phiếu có thể thay đổi và các công ty có thể được niêm yết với nhiều ký hiệu khác nhau trên các sàn giao dịch khác nhau.
    `,
    cooldowns: 5,
    dependencies: {}
};

const apiKey = 'cql2tu9r01qn7frrckn0cql2tu9r01qn7frrckng';

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
        const suggestions = `
        Để tra cứu thông tin cổ phiếu, bạn cần cung cấp ký hiệu cổ phiếu. Ví dụ: !stock AAPL để xem thông tin về Apple Inc.

        Gợi ý các ký hiệu cổ phiếu phổ biến:
        - Apple Inc. AAPL
        - Microsoft Corporation MSFT
        - Google (Alphabet Inc.) GOOGL
        - Amazon.com Inc. AMZN
        - Tesla Inc. TSLA
        - Meta Platforms Inc. (Facebook) META
        - NVIDIA Corporation NVDA
        - Netflix Inc. NFLX
        - IBM Corporation IBM
        - Intel Corporation INTC

        *Chú ý*: Ký hiệu cổ phiếu có thể thay đổi và các công ty có thể được niêm yết với nhiều ký hiệu khác nhau trên các sàn giao dịch khác nhau.
        `;
        return api.sendMessage(suggestions, threadID, messageID);
    }

    const symbol = args[0].toUpperCase();

    try {
        const response = await axios.get('https://finnhub.io/api/v1/quote', {
            params: {
                symbol: symbol,
                token: apiKey
            }
        });

        const data = response.data;

        if (!data) {
            return api.sendMessage("Không có dữ liệu cổ phiếu cho ký hiệu này. Vui lòng kiểm tra lại ký hiệu cổ phiếu.", threadID, messageID);
        }

        const { c: currentPrice, h: highPrice, l: lowPrice, o: openPrice, pc: previousClosePrice } = data;

        const message = `Thông tin cổ phiếu ${symbol}:\n` +
                        `📈 Giá mở cửa: ${openPrice} USD\n` +
                        `📈 Giá cao nhất: ${highPrice} USD\n` +
                        `📉 Giá thấp nhất: ${lowPrice} USD\n` +
                        `💵 Giá hiện tại: ${currentPrice} USD\n` +
                        `💵 Giá đóng cửa trước đó: ${previousClosePrice} USD`;

        api.sendMessage(message, threadID, messageID);
    } catch (error) {
        console.error(error);
        api.sendMessage("Không thể lấy thông tin cổ phiếu. Vui lòng thử lại sau.", threadID, messageID);
    }
};
