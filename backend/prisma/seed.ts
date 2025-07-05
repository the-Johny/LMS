/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { PrismaClient, Role } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   // Hash the password (recommended)
//   const password = await bcrypt.hash('instructor123', 10);

//   // Create an instructor user
//   const instructor = await prisma.user.upsert({
//     where: { email: 'instructor@example.com' },
//     update: {},
//     create: {
//       name: 'Test Instructor',
//       email: 'instructor@example.com',
//       password: password,
//       role: Role.INSTRUCTOR,
//       isEmailVerified: true,
//     },
//   });

//   console.log('Seeded instructor:', instructor);
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


  

  import { PrismaClient, Role } from '@prisma/client';
  import * as bcrypt from 'bcrypt';
  
  const prisma = new PrismaClient();
  
  async function main() {
    // Hash the password (recommended)
    const password = await bcrypt.hash('student123', 10);
  
    // Create an student user
    const student = await prisma.user.upsert({
      where: { email: 'briankuruui3768@gmail.com' },
      update: {},
      create: {
        name: 'Brian Kirui',
        email: 'briankuruui3768@gmail.com',
        password: password,
        role: Role.STUDENT,
        isEmailVerified: true,
      },
    });
  
    console.log('Seeded student:', student);
  }
  
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });