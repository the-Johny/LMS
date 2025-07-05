export class CourseController {
  constructor(private courseService: CourseService) {}

  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const createCourseDto: CreateCourseDto = req.body;
      
      // Validate required fields
      if (!createCourseDto.title || !createCourseDto.description || !createCourseDto.instructorId) {
        res.status(400).json({
          success: false,
          message: 'Title, description, and instructorId are required'
        });
        return;
      }

      const course = await this.courseService.createCourse(createCourseDto);
      
      res.status(201).json({
        success: true,
        data: course,
        message: 'Course created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create course',
        error: error.message
      });
    }
  }

  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const queryDto: CourseQueryDto = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        category: req.query.category as Category,
        level: req.query.level as Level,
        search: req.query.search as string,
        instructorId: req.query.instructorId as string,
        isPublished: req.query.isPublished === 'true'
      };

      const result = await this.courseService.findAllCourses(queryDto);
      
      res.status(200).json({
        success: true,
        data: result.courses,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error.message
      });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const course = await this.courseService.findCourseById(id);
      
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: course
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course',
        error: error.message
      });
    }
  }

  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateCourseDto: UpdateCourseDto = req.body;
      
      const course = await this.courseService.updateCourse(id, updateCourseDto);
      
      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: course,
        message: 'Course updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update course',
        error: error.message
      });
    }
  }

  async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.courseService.deleteCourse(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Course not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete course',
        error: error.message
      });
    }
  }

  async getCoursesByInstructor(req: Request, res: Response): Promise<void> {
    try {
      const { instructorId } = req.params;
      const courses = await this.courseService.getCoursesByInstructor(instructorId);
      
      res.status(200).json({
        success: true,
        data: courses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch instructor courses',
        error: error.message
      });
    }
  }
}

export class ModuleController {
  constructor(private moduleService: ModuleService) {}

  async createModule(req: Request, res: Response): Promise<void> {
    try {
      const createModuleDto: CreateModuleDto = req.body;
      
      // Validate required fields
      if (!createModuleDto.title || !createModuleDto.courseId) {
        res.status(400).json({
          success: false,
          message: 'Title and courseId are required'
        });
        return;
      }

      const module = await this.moduleService.createModule(createModuleDto);
      
      res.status(201).json({
        success: true,
        data: module,
        message: 'Module created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create module',
        error: error.message
      });
    }
  }

  async getAllModules(req: Request, res: Response): Promise<void> {
    try {
      const modules = await this.moduleService.findAllModules();
      
      res.status(200).json({
        success: true,
        data: modules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch modules',
        error: error.message
      });
    }
  }

  async getModuleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const module = await this.moduleService.findModuleById(id);
      
      if (!module) {
        res.status(404).json({
          success: false,
          message: 'Module not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: module
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch module',
        error: error.message
      });
    }
  }

  async getModulesByCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const modules = await this.moduleService.findModulesByCourse(courseId);
      
      res.status(200).json({
        success: true,
        data: modules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course modules',
        error: error.message
      });
    }
  }

  async updateModule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateModuleDto: UpdateModuleDto = req.body;
      
      const module = await this.moduleService.updateModule(id, updateModuleDto);
      
      if (!module) {
        res.status(404).json({
          success: false,
          message: 'Module not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: module,
        message: 'Module updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update module',
        error: error.message
      });
    }
  }

  async deleteModule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = await this.moduleService.deleteModule(id);
      
      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Module not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete module',
        error: error.message
      });
    }
  }
}
