import { Router, type Request, type Response } from "express";
import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

const router = Router();

// GET Request for city autocomplete suggestions
router.get(
  "/autocomplete",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;

      if (!query || typeof query !== "string" || query.trim().length < 2) {
        res.status(400).json({
          error: "Query must be at least 2 characters long",
        });
        return;
      }

      const suggestions = await WeatherService.getCityAutocomplete(
        query.trim()
      );
      res.status(200).json(suggestions);
    } catch (error: any) {
      console.error("Error fetching autocomplete suggestions:", error);
      res.status(500).json({
        error: "Failed to fetch city suggestions",
        message: error.message,
      });
    }
  }
);

// POST Request with city name to retrieve weather data
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const cityName = req.body.cityName;

    // Validate city name
    if (
      !cityName ||
      typeof cityName !== "string" ||
      cityName.trim().length === 0
    ) {
      res.status(400).json({
        error: "City name is required and must be a valid string",
      });
      return;
    }

    // Validate city name format (letters, spaces, hyphens only)
    const cityNameRegex = /^[a-zA-Z\s\-]+$/;
    if (!cityNameRegex.test(cityName.trim())) {
      res.status(400).json({
        error: "City name can only contain letters, spaces, and hyphens",
      });
      return;
    }

    const trimmedCityName = cityName.trim();
    const sessionId = req.session.id;

    // GET weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(trimmedCityName);

    if (!weatherData) {
      res.status(404).json({
        error: "Weather data not found for the specified city",
      });
      return;
    }

    // Save city to session-specific search history
    await HistoryService.addCity(sessionId, trimmedCityName);

    res.status(200).json(weatherData);
  } catch (error: any) {
    console.error("Error in weather route:", error);
    res.status(500).json({
      error: "Failed to fetch weather data",
      message: error.message || "Internal server error",
    });
  }
});

// GET search history for current session
router.get("/history", async (req: Request, res: Response) => {
  try {
    const sessionId = req.session.id;
    const history = await HistoryService.getCities(sessionId);
    res.status(200).json(history);
  } catch (error: any) {
    console.error("Error retrieving search history:", error);
    res.status(500).json({
      error: "Failed to retrieve search history",
      message: error.message || "Internal server error",
    });
  }
});

// DELETE city from search history
router.delete(
  "/history/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const sessionId = req.session.id;

      if (!id) {
        res.status(400).json({ error: "City ID is required" });
        return;
      }

      await HistoryService.removeCity(sessionId, id);
      res.status(200).json({
        success: true,
        message: `City with ID ${id} deleted from history`,
      });
    } catch (error: any) {
      console.error("Error deleting city from history:", error);
      res.status(500).json({
        error: "Failed to delete city from history",
        message: error.message || "Internal server error",
      });
    }
  }
);

export default router;
