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
    youtubeId: "vDqOoI-4Z6M",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600",
    subject: "Mathematics",
    instructor: "Dr. Asha Rao",
  },
  {
    title: "Newton's Laws of Motion",
    description: "Understand the three laws that govern motion, with real-world examples.",
    youtubeId: "5-ZFOhHQS68",
    thumbnail: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600",
    subject: "Physics",
    instructor: "Prof. Kevin Shah",
  },
  {
    title: "Cell Structure and Function",
    description: "A tour of the animal and plant cell, organelle by organelle.",
    youtubeId: "jsDxw63QqK0",
    thumbnail: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600",
    subject: "Biology",
    instructor: "Dr. Meera Nair",
  },
  {
    title: "Introduction to Data Structures",
    description: "Arrays, linked lists, stacks and queues explained from first principles.",
    youtubeId: "bum_19loj9A",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
    subject: "Computer Science",
    instructor: "Prof. Ian Cole",
  },
  {
    title: "Balancing Chemical Equations",
    description:
      "A step-by-step method for balancing chemical equations, with worked examples covering combustion and synthesis reactions.",
    youtubeId: "TUuABq95BBM",
    thumbnail: "https://images.unsplash.com/photo-1554475900-0a0350e3fc7b?w=600",
    subject: "Chemistry",
    instructor: "Dr. Priya Menon",
  },
  {
    title: "The French Revolution: Causes and Consequences",
    description:
      "An overview of the social, economic, and political pressures that led to the French Revolution, and its lasting impact on modern democracy.",
    youtubeId: "lTTvKwCylFY",
    thumbnail: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600",
    subject: "History",
    instructor: "Prof. Daniel Whitfield",
  },
  {
    title: "Big O Notation Explained",
    description:
      "How to reason about algorithm efficiency using Big O notation, with examples ranging from O(1) to O(n^2).",
    youtubeId: "D6xkbGLQesk",
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600",
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