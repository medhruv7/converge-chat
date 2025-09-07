import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    // First try to find in local database
    let user = await this.userRepository.findOne({ where: { id } });
    
    if (!user) {
      // If not found locally, try to fetch from user microservice
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3000';
        const response = await axios.get(`${userServiceUrl}/users/${id}`);
        user = response.data;
        
        // Save to local database for future use
        if (user) {
          user = await this.userRepository.save(user);
        }
      } catch (error) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    }
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async validateUser(id: string): Promise<boolean> {
    try {
      await this.findById(id);
      return true;
    } catch {
      return false;
    }
  }
}
