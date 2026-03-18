import mongoose from "mongoose";

const uri = "mongodb+srv://anupg9643_db_user:Anup12345@cluster0.0qat7lh.mongodb.net/campus_placement";

// Minimal schema configuration
const StudentSchema = new mongoose.Schema({
  firstName: String, 
  lastName: String, 
  email: String,
  mobileNo: String,
  username: String,
  course: String,
  role: String,
  isVerified: Boolean,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Successfully Connected to MongoDB Atlas!");
    
    // Check if the dummy already exists, remove it
    await Student.deleteMany({ email: "test@example.com" });

    // Insert dummy document
    await Student.create({
      firstName: "John",
      lastName: "Doe",
      email: "test@example.com",
      mobileNo: "9876543210",
      username: "johndoe",
      course: "Computer Science",
      role: "student",
      isVerified: true
    });

    console.log("✅ Inserted 1 dummy student! The schema fields are now visible in Compass.");
    process.exit(0);
  } catch(error) {
    console.error("❌ Failed:", error.message);
    process.exit(1);
  }
}

seed();
