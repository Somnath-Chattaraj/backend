import { PrismaClient } from "@prisma/client";
// import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  try {
    //  User events
    // --------------------------------------------------------------------------------------------
    // console.log("Seeding users...");

    // const users = Array.from({ length: 50 }, () => ({
    //   username: faker.internet.userName() + Math.floor(Math.random() * 1000),
    // }));

    // await prisma.user.createMany({ data: users, skipDuplicates: true });

    // const userIds = await prisma.user.findMany({ select: { id: true } });
    // const userIdArray = userIds.map(user => user.id);
    // console.log("User IDs:", userIdArray);
    // --------------------------------------------------------------------------------------------
    console.log("Seeding events...");

    const events = [
      {
        name: "Taylor Swift Eras Tour - London",
        liveAt: new Date("2025-04-15T19:30:00Z"),
        artistName: "Taylor Swift",
        concertName: "The Eras Tour",
        description: {
          venue: {
            name: "Wembley Stadium",
            location: "London, UK",
            capacity: 90000,
          },
          date: "2025-04-15T19:30:00Z",
          duration: "3 hours",
          openingAct: "Paramore",
          ticketTypes: [
            { type: "General Admission", price: 80, available: 60000 },
            { type: "VIP Package", price: 250, available: 5000 },
          ],
          ageRestriction: "All ages",
          additionalInfo:
            "No professional cameras allowed. Merchandise available on-site.",
        },
      },
      {
        name: "Coldplay Music of the Spheres - Paris",
        liveAt: new Date("2025-06-10T20:00:00Z"),
        artistName: "Coldplay",
        concertName: "Music of the Spheres World Tour",
        description: {
          venue: {
            name: "Stade de France",
            location: "Paris, France",
            capacity: 81000,
          },
          date: "2025-06-10T20:00:00Z",
          duration: "2.5 hours",
          openingAct: "H.E.R.",
          ticketTypes: [
            { type: "Standard", price: 70, available: 50000 },
            { type: "VIP", price: 300, available: 7000 },
          ],
          ageRestriction: "All ages",
          additionalInfo:
            "Sustainable merchandise available. LED wristbands provided.",
        },
      },
      {
        name: "BTS World Tour - New York",
        liveAt: new Date("2025-07-22T19:00:00Z"),
        artistName: "BTS",
        concertName: "Yet to Come World Tour",
        description: {
          venue: {
            name: "Madison Square Garden",
            location: "New York, USA",
            capacity: 20000,
          },
          date: "2025-07-22T19:00:00Z",
          duration: "3 hours",
          openingAct: "TXT",
          ticketTypes: [
            { type: "General Admission", price: 100, available: 12000 },
            { type: "VIP Soundcheck", price: 450, available: 1000 },
          ],
          ageRestriction: "13+",
          additionalInfo:
            "Light sticks available for purchase. Fan meet-and-greet for VIP.",
        },
      },
    ];

    await prisma.event.createMany({
      data: events.map((event) => ({
        name: event.name,
        liveAt: event.liveAt,
        artistName: event.artistName,
        concertName: event.concertName,
        description: event.description,
      })),
      skipDuplicates: true,
    });

    console.log("Seeding completed!");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
