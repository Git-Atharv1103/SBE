import mongoose from "mongoose";

export async function GET() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    return Response.json({
      success: true,
      message: "MongoDB connected successfully",
      database: mongoose.connection.name,
    });
  } catch (error) {
    console.error("MongoDB Error:", error);

    return Response.json(
      {
        success: false,
        message: "MongoDB connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
