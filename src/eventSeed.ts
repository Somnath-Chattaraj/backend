const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const events = [
  {
    name: "Taylor Swift Eras Tour - New York",
    liveAt: "2025-12-15T19:30:00Z",
    artistName: "Taylor Swift",
    concertName: "The Eras Tour",
    description: {
      venue: {
        name: "Madison Square Garden",
        location: "New York, NY",
        capacity: 20000
      },
      date: "2025-12-15T19:30:00Z",
      duration: "3 hours",
      image: "https://hips.hearstapps.com/hmg-prod/images/taylor-swift-performs-onstage-during-the-taylor-swift-the-news-photo-1681860356.jpg",
      openingAct: "HAIM",
      ticketTypes: [
        { type: "General Admission", price: 120, available: 15000 },
        { type: "VIP Package", price: 350, available: 2000 }
      ],
      ageRestriction: "All ages",
      additionalInfo: "No professional cameras allowed. Merchandise available on-site."
    }
  },
  {
    name: "The Weeknd - After Hours Tour - Los Angeles",
    liveAt: "2025-01-22T20:00:00Z",
    artistName: "The Weeknd",
    concertName: "After Hours Tour",
    description: {
      venue: {
        name: "Staples Center",
        location: "Los Angeles, CA",
        capacity: 21000
      },
      date: "2025-01-22T20:00:00Z",
      duration: "2.5 hours",
      image: "https://wallpapercat.com/w/full/3/3/d/193483-2560x1600-desktop-hd-the-weeknd-background.jpg",
      openingAct: "Doja Cat",
      ticketTypes: [
        { type: "General Admission", price: 100, available: 18000 },
        { type: "VIP Experience", price: 400, available: 1500 }
      ],
      ageRestriction: "18+",
      additionalInfo: "Strobe lights and smoke effects in use."
    }
  },
  {
    name: "Billie Eilish - Happier Than Ever Tour - Chicago",
    liveAt: "2025-02-10T19:30:00Z",
    artistName: "Billie Eilish",
    concertName: "Happier Than Ever Tour",
    description: {
      venue: {
        name: "United Center",
        location: "Chicago, IL",
        capacity: 23000
      },
      date: "2025-02-10T19:30:00Z",
      duration: "2 hours",
      image: "https://www.billboard.com/wp-content/uploads/2023/08/Billie-Eilish-paris-2023-a-billboard-1548.jpg",
      openingAct: "Finneas",
      ticketTypes: [
        { type: "General Admission", price: 95, available: 20000 },
        { type: "VIP Package", price: 280, available: 1800 }
      ],
      ageRestriction: "All ages",
      additionalInfo: "Merchandise booth available."
    }
  },
  {
    name: "Kendrick Lamar - The Big Steppers Tour - Boston",
    liveAt: "2025-03-05T20:00:00Z",
    artistName: "Kendrick Lamar",
    concertName: "The Big Steppers Tour",
    description: {
      venue: {
        name: "TD Garden",
        location: "Boston, MA",
        capacity: 19000
      },
      date: "2025-03-05T20:00:00Z",
      duration: "2.5 hours",
      image: "https://media.gq.com/photos/65fda114b208611ae82cb8f5/4:3/pass/GettyImages-1685949453.jpg",
      openingAct: "Baby Keem",
      ticketTypes: [
        { type: "General Admission", price: 110, available: 16000 },
        { type: "VIP Lounge", price: 320, available: 1200 }
      ],
      ageRestriction: "16+",
      additionalInfo: "Explicit content warning."
    }
  },
  {
    name: "Dua Lipa - Future Nostalgia Tour - London",
    liveAt: "2025-04-12T19:30:00Z",
    artistName: "Dua Lipa",
    concertName: "Future Nostalgia Tour",
    description: {
      venue: {
        name: "O2 Arena",
        location: "London, UK",
        capacity: 20000
      },
      date: "2025-04-12T19:30:00Z",
      duration: "2 hours",
      image: "https://wallpapercave.com/wp/wp2088741.jpg",
      openingAct: "Rina Sawayama",
      ticketTypes: [
        { type: "General Admission", price: 85, available: 18000 },
        { type: "VIP Dance Floor", price: 300, available: 1500 }
      ],
      ageRestriction: "All ages",
      additionalInfo: "Confetti and pyrotechnics used in show."
    }
  }
];

async function main() {
    await prisma.event.createMany({ data: events.map(event => ({
        name: event.name,
        liveAt: event.liveAt,
        artistName: event.artistName,
        concertName: event.concertName,
        description: event.description
      })), skipDuplicates: true });
  
  console.log("Concerts seeded successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
