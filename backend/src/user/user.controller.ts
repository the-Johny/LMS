// src/user/user.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { BulkUpdateUsersDto } from './dto/bulk-update-users.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Role } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';

// Assuming you have these guards implemented
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User with this email already exists' 
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return new UserResponseDto(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully' 
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, enum: Role, description: 'Filter by role' })
  @ApiQuery({ name: 'isEmailVerified', required: false, type: Boolean, description: 'Filter by email verification status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth()
  async findAll(@Query() query: UserQueryDto) {
    const result = await this.userService.findAll(query);
    return {
      ...result,
      users: result.users.map(user => new UserResponseDto(user))
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'User statistics retrieved successfully' 
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth()
  async getUserStats() {
    return this.userService.getUserStats();
  }

  @Get('by-role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({ name: 'role', enum: Role, description: 'User role' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully' 
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth()
  async getUsersByRole(@Param('role') role: Role) {
    const users = await this.userService.getUsersByRole(role);
    return users.map(user => new UserResponseDto(user));
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    type: UserResponseDto 
  })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async getProfile(@Request() req) {
    // Assuming req.user contains the authenticated user info
    const user = await this.userService.findOne(req.user.id);
    return new UserResponseDto(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findOne(id);
    return new UserResponseDto(user);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get user with related data' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User details retrieved successfully' 
  })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async findOneWithRelations(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOneWithRelations(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth()
  async findByEmail(@Param('email') email: string) {
    const user = await this.userService.findByEmail(email);
    return new UserResponseDto(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    type: UserResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email already taken' 
  })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    // Check if user is updating their own profile or is admin
    // if (req.user.id !== id && req.user.role !== Role.ADMIN) {
    //   throw new ForbiddenException('Cannot update other users');
    // }
    
    const user = await this.userService.update(id, updateUserDto);
    return new UserResponseDto(user);
  }

  @Patch(':id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Password changed successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Current password is incorrect' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req
  ) {
    // Check if user is changing their own password
    // if (req.user.id !== id) {
    //   throw new ForbiddenException('Cannot change other users password');
    // }
    
    return this.userService.changePassword(id, changePasswordDto);
  }

  @Patch(':id/verify-email')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth()
  async verifyEmail(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.verifyEmail(id);
  }

  @Patch('bulk-update')
  @ApiOperation({ summary: 'Bulk update users' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users updated successfully' 
  })
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth()
  async bulkUpdate(@Body() bulkUpdateDto: BulkUpdateUsersDto) {
    return this.userService.bulkUpdate(bulkUpdateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ADMIN)
  // @ApiBearerAuth()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}

// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export for use in other modules
})
export class UserModule {}
