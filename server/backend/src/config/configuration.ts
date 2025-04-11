export default () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    database: {
      url: process.env.DATABASE_URL,
    },
    weather: {
      apiKey: process.env.API_KEY,
      baseUrl: process.env.API_BASE_URL,
    },
  });