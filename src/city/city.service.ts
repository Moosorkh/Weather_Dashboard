import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCityDto } from "./dto/city.dto";

@Injectable()
export class CityService {
    constructor(private prisma: PrismaService) {}

    async findAll() {
        return this.prisma.city.findMany({
                orderBy: {
                    updatedAt: "desc",
                },
            });
    }

    async findOne(id: string) {
        return this.prisma.city.findUnique({
          where: { id },
        });
      }
    
      async create(createCityDto: CreateCityDto) {
        const existingCity = await this.prisma.city.findUnique({
          where: { name: createCityDto.name },
        });
    
        if (existingCity) {
          // Update the timestamp if the city already exists
          return this.prisma.city.update({
            where: { id: existingCity.id },
            data: { updatedAt: new Date() },
          });
        }
    
        return this.prisma.city.create({
          data: createCityDto,
        });
      }
    
      async remove(id: string) {
        return this.prisma.city.delete({
          where: { id },
        });
      }
}