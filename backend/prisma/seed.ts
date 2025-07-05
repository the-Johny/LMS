/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();


async function main() {
  // Hash the password (recommended)
  const password = await bcrypt.hash('instructor123', 10);

  // Create an instructor user
  const instructor = await prisma.user.upsert({
    where: { email: 'kimutaibrian922@gmail.com' },
    update: {},
    create: {
      name: 'Test Instructor',
      email: 'kimutaibrian922@gmail.com',
      password: password,
      role: Role.INSTRUCTOR,
      isEmailVerified: true,
    },
  });

  console.log('Seeded instructor:', instructor);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// import { PrismaClient, Role } from '@prisma/client';
//   import * as bcrypt from 'bcrypt';
  
//   const prisma = new PrismaClient();
  
//   async function main() {
//     // Hash the password (recommended)
//     const password = await bcrypt.hash('admin123', 10);
  
//     // Create an admin user
//     const admin = await prisma.user.upsert({
//       where: { email: 'itsbrian2025@gmail.com' },
//       update: {},
//       create: {
//         name: 'Brian Its',
//         email: 'itsbrian2025@gmail.com',
//         password: password,
//         role: Role.ADMIN,
//         isEmailVerified: true,
//       },
//     });
  
//     console.log('Seeded admin:', admin);
//   }
  
//   main()
//     .catch((e) => {
//       console.error(e);
//       process.exit(1);
//     })
//     .finally(async () => {
//       await prisma.$disconnect();
//     });

  

  // import { PrismaClient, Role } from '@prisma/client';
  // import * as bcrypt from 'bcrypt';
  
  // const prisma = new PrismaClient();
  
  // async function main() {
  //   // Hash the password (recommended)
  //   const password = await bcrypt.hash('admin123', 10);
  
  //   // Create an admin user
  //   const admin = await prisma.user.upsert({
  //     where: { email: 'itsbrian2025@gmail.com' },
  //     update: {},
  //     create: {
  //       name: 'Brian Kirui',
  //       email: 'itsbrian2025@gmail.com',
  //       password: password,
  //       role: Role.ADMIN,
  //       isEmailVerified: true,
  //     },
  //   });
  
  //   console.log('Seeded admin:', admin);
  // }
  
  // main()
  //   .catch((e) => {
  //     console.error(e);
  //     process.exit(1);
  //   })
  //   .finally(async () => {
  //     await prisma.$disconnect();
  //   });