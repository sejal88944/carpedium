import mongoose from 'mongoose'

declare global {
  // Cached mongoose connection promise (shared across hot reloads).
  var _mongooseConn: Promise<typeof mongoose> | undefined
}

const MONGODB_URI = process.env.MONGODB_URI

export async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not set — admin runs in stub mode')
  }
  if (mongoose.connection.readyState >= 1) return mongoose
  if (!global._mongooseConn) {
    global._mongooseConn = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }
  return global._mongooseConn
}

export function isMongoConfigured() {
  return Boolean(MONGODB_URI)
}
