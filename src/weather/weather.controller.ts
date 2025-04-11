import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CityService } from '../city/city.service';

@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly cityService: CityService,
  ) {}

  @Post()
  async getWeather(@Body() body: { cityName: string }) {
    if (!body.cityName) {
      throw new HttpException('City name is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const weatherData = await this.weatherService.getWeatherForCity(body.cityName);
      
      // Add city to history
      await this.cityService.create({ name: body.cityName });
      
      return weatherData;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching weather data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}