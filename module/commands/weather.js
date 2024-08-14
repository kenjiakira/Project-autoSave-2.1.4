const axios = require('axios');
const translate = require('translate-google');

module.exports.config = {
  name: "weather",
  version: "1.0.2",
  hasPermission: 0,
  credits: "Akira",
  description: "Tra cứu thông tin thời tiết ",
  usePrefix: true,
  commandCategory: "utilities",
  usages: "weather [tên thành phố]",
  cooldowns: 5,
  dependencies: {}
};

const apiKey = "1230a8fdc6457603234c68ead5f3f967";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

async function getWeather(cityName) {
  const params = {
    q: cityName,
    appid: apiKey,
    units: "metric"
  };

  try {
    const response = await axios.get(apiUrl, { params });
    return response.data;
  } catch (error) {
    throw new Error("Không tìm thấy thông tin thời tiết cho thành phố/khu vực này.");
  }
}

module.exports.run = async function({ api, event, args }) {
  const cityName = args.join(" ");
  if (!cityName) return api.sendMessage("Bạn chưa nhập tên thành phố/khu vực cần tra cứu thời tiết.", event.threadID);

  try {
    let translatedCityName = cityName;
    if (!/^[a-zA-Z\s]+$/.test(cityName)) { 
      try {
        translatedCityName = await translate(cityName, { to: "en" });
        // Kiểm tra nếu dịch trả về đối tượng thay vì chuỗi
        if (typeof translatedCityName === 'object' && translatedCityName.text) {
          translatedCityName = translatedCityName.text;
        }
      } catch (error) {
        return api.sendMessage("Có lỗi xảy ra khi dịch tên thành phố. Vui lòng kiểm tra lại.", event.threadID);
      }
    }

    // Kiểm tra xem translatedCityName có phải là chuỗi không
    if (typeof translatedCityName !== 'string') {
      return api.sendMessage("Tên thành phố không thể dịch được. Vui lòng kiểm tra lại.", event.threadID);
    }

    const weatherData = await getWeather(translatedCityName);

    if (!weatherData || !weatherData.weather || !weatherData.main || !weatherData.wind) {
      return api.sendMessage("Không thể lấy dữ liệu thời tiết. Vui lòng thử lại sau.", event.threadID);
    }

    const weatherDescription = weatherData.weather[0]?.description || "Không có mô tả";
    const temp = weatherData.main?.temp || "Không có dữ liệu";
    const tempMin = weatherData.main?.temp_min || "Không có dữ liệu";
    const tempMax = weatherData.main?.temp_max || "Không có dữ liệu";
    const humidity = weatherData.main?.humidity || "Không có dữ liệu";
    const windSpeed = weatherData.wind?.speed || "Không có dữ liệu";

    const message = `Thời tiết tại ${weatherData.name}:\n🌤️ Mô tả: ${weatherDescription}\n🌡️ Nhiệt độ: ${temp}°C\n🔽 Nhiệt độ tối thiểu: ${tempMin}°C\n🔼 Nhiệt độ tối đa: ${tempMax}°C\n💧 Độ ẩm: ${humidity}%\n💨 Tốc độ gió: ${windSpeed} m/s`;

    api.sendMessage(message, event.threadID);
  } catch (error) {
    api.sendMessage("Có lỗi xảy ra khi lấy thông tin thời tiết. Vui lòng thử lại sau.", event.threadID);
  }
};
