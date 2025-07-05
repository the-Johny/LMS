// src/user/user.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { BulkUpdateUsersDto } from './dto/bulk-update-users.dto';
import { UserWithRelationsDto } from './dto/user-with-relations.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  async findAll(query: UserQueryDto) {
    const { search, role, isEmailVerified, page, limit, sortBy, sortOrder } = query;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    if (isEmailVerified !== undefined) {
      where.isEmailVerified = isEmailVerified;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findOneWithRelations(id: string): Promise<UserWithRelationsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
        coursesCreated: {
          select: {
            id: true,
            title: true,
            isPublished: true,
          }
        },
        enrollments: {
          select: {
            id: true,
            enrolledAt: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        certificates: {
          select: {
            id: true,
            issuedAt: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Calculate stats
    const coursesCreated = {
      count: user.coursesCreated.length,
      published: user.coursesCreated.filter(c => c.isPublished).length,
      unpublished: user.coursesCreated.filter(c => !c.isPublished).length,
    };

    const enrollments = {
      count: user.enrollments.length,
      active: user.enrollments.length, // You might want to add logic for active vs completed
      completed: 0, // Add logic based on your completion criteria
    };

    const certificates = {
      count: user.certificates.length,
      recent: user.certificates.slice(-5), // Last 5 certificates
    };

    const reviews = {
      count: user.reviews.length,
      averageRating: user.reviews.length > 0 
        ? user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length 
        : 0,
    };

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      coursesCreated,
      enrollments,
      certificates,
      reviews,
    };
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email }
      });

      if (emailTaken) {
        throw new ConflictException('Email already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return updatedUser;
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        password: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedNewPassword,
      }
    });

    return { message: 'Password changed successfully' };
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id }
    });

    return { message: 'User deleted successfully' };
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateUsersDto) {
    const { userIds, ...updateData } = bulkUpdateDto;

    const result = await this.prisma.user.updateMany({
      where: {
        id: {
          in: userIds
        }
      },
      data: updateData
    });

    return {
      message: `${result.count} users updated successfully`,
      updatedCount: result.count
    };
  }

  async getUserStats(): Promise<UserStatsDto> {
    const [
      totalUsers,
      totalAdmins,
      totalInstructors,
      totalStudents,
      verifiedUsers,
      recentUsers
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({ where: { role: Role.INSTRUCTOR } }),
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.user.count({ where: { isEmailVerified: true } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    return {
      totalUsers,
      totalAdmins,
      totalInstructors,
      totalStudents,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      recentUsers,
    };
  }

  async getUsersByRole(role: Role) {
    return this.prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async verifyEmail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        isEmailVerified: true,
      }
    });

    return { message: 'Email verified successfully' };
  }

  async deactivateUser(id: string) {
    // This would typically set an isActive flag, but since it's not in your schema,
    // we'll implement it as a soft delete or role change
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // You might want to add an isActive field to your schema
    // For now, we'll return a message
    return { message: 'User deactivation feature requires isActive field in schema' };
  }
}
