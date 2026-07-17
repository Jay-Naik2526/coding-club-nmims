import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { User } from './models/index.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/codingclub';

const createAdmin = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected. MongoDB URI:', mongoUri.replace(/:\/\/[^@]+@/, '://***@')); // mask credentials

    const adminPasswordHash = crypto.createHash('sha256').update('admin123').digest('hex');

    // Upsert — won't delete existing users
    const result = await User.findOneAndUpdate(
      { email: 'admin@codingclub.com' },
      {
        name: 'Jay Naik',
        email: 'admin@codingclub.com',
        department: 'sec',
        year: 3,
        branch: 'Computer Engineering',
        githubHandle: 'jaynaik-dev',
        xp: 0,
        role: 'ADMIN',
        passwordHash: adminPasswordHash,
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin user upserted:', result.email, '| role:', result.role);
    console.log('   passwordHash stored:', result.passwordHash);

    // Verify: re-hash the plain password and compare
    const verify = crypto.createHash('sha256').update('admin123').digest('hex');
    console.log('   Verification match:', verify === result.passwordHash ? '✅ PASS' : '❌ FAIL');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
};

createAdmin();
