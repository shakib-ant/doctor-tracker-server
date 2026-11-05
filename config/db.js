import dns from 'dns';
import mongoose from 'mongoose';
import colors from 'colors';

// Custom DNS fallback only for local
if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // ignore
  }
}

let cached = globalThis.mongooseConn;
if (!cached) {
  cached = globalThis.mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = (
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL ||
    ''
  ).trim();

  if (!mongoUri) {
    console.error('MONGO_URI is not defined in environment variables');
    throw new Error('MONGO_URI environment variable is missing');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };
    cached.promise = mongoose.connect(mongoUri, opts).then((m) => {
      console.log(colors.cyan.underline(`MongoDB Connected: ${m.connection.host}`));
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error.message);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }

  return cached.conn;
}

if (!process.env.VERCEL) {
  process.on('SIGTERM', async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to SIGTERM');
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });
}

export default connectDB;
