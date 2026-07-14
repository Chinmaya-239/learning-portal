// Seeds the database with sample learning videos.
// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Video = require("./models/Video");

const sampleVideos = [
  {
    title: "Introduction to Algebra",
    description: "A friendly walkthrough of variables, expressions, and equations for beginners.",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600",
    duration: 60,
    subject: "Mathematics",
    instructor: "Dr. Asha Rao",
  },
  {
    title: "Newton's Laws of Motion",
    description: "Understand the three laws that govern motion, with real-world examples.",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600",
    duration: 60,
    subject: "Physics",
    instructor: "Prof. Kevin Shah",
  },
  {
    title: "Cell Structure and Function",
    description: "A tour of the animal and plant cell, organelle by organelle.",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600",
    duration: 60,
    subject: "Biology",
    instructor: "Dr. Meera Nair",
  },
  {
    title: "Introduction to Data Structures",
    description: "Arrays, linked lists, stacks and queues explained from first principles.",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
    duration: 60,
    subject: "Computer Science",
    instructor: "Prof. Ian Cole",
  },
];

(async () => {
  await connectDB();
  await Video.deleteMany({});
  await Video.insertMany(sampleVideos);
  console.log(`Seeded ${sampleVideos.length} videos.`);
  await mongoose.disconnect();
  process.exit(0);
})();
