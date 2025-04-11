import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { CityModule } from '../city/city.module';

@Module({
  imports: [CityModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}