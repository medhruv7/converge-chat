import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserService {
  private readonly userServiceUrl: string;

  constructor() {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3006';
  }

  async findById(id: string): Promise<User> {
    try {
      const response = await axios.get(`${this.userServiceUrl}/users/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw new Error(`Error fetching user: ${error.message}`);
    }
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
