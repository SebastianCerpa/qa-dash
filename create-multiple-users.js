const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Lista de usuarios de prueba para crear
const testUsers = [
  {
    name: 'Sebastian Cerpa',
    email: 'sebastian.cerpa@ridepanda.com',
    role: 'Admin',
    password: 'Ride..0106.'
  },
  {
    name: 'Christian Parra',
    email: 'christian@ridepanda.com',
    role: 'Developer',
    password: 'parrita.tester'
  },
];

async function createMultipleUsers() {
  const prisma = new PrismaClient();

  try {
    // Connect to the database
    await prisma.$connect();
    console.log('Database connection successful!');
    console.log('Creating test users...');
    console.log('='.repeat(50));

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.users.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`❌ User already exists: ${userData.email}`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create new user
        const newUser = await prisma.users.create({
          data: {
            name: userData.name,
            email: userData.email,
            role: userData.role,
            password_hash: hashedPassword,
            status: 'active'
          }
        });

        console.log(`✅ User created: ${newUser.name} (${newUser.email}) - Role: ${newUser.role}`);
      } catch (userError) {
        console.error(`❌ Error creating user ${userData.email}:`, userError.message);
      }
    }

    console.log('='.repeat(50));
    console.log('✅ User creation process completed!');

    // Show all users in database
    const allUsers = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });

    console.log('\n📋 Current users in database:');
    console.table(allUsers);

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para crear un solo usuario personalizado
async function createSingleUser(name, email, role, password) {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`❌ User already exists: ${email}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        role,
        password_hash: hashedPassword,
        status: 'active'
      }
    });

    console.log('✅ User created successfully:', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
  // Crear múltiples usuarios predefinidos
  createMultipleUsers();
} else if (args.length === 4) {
  // Crear un usuario personalizado
  const [name, email, role, password] = args;
  console.log(`Creating custom user: ${name} (${email})`);
  createSingleUser(name, email, role, password);
} else {
  console.log('\n📖 Usage:');
  console.log('  node create-multiple-users.js                                    # Create predefined test users');
  console.log('  node create-multiple-users.js "Name" "email@domain.com" "Role" "password"  # Create custom user');
  console.log('\n📝 Available roles: Admin, QA Lead, QA Tester, Developer');
  console.log('\n💡 Examples:');
  console.log('  node create-multiple-users.js "John Doe" "john@ridepanda.com" "QA Tester" "MyPass123!"');
}