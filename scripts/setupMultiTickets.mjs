import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function setupMultiTickets() {
  const eventId = "j573pbfnx7x9d495wd5wexkj7s7h5sty"; // Multi tickets event ID
  
  try {
    // First enable multi-tier tickets for the event
    console.log("Enabling multi-tier tickets for event...");
    await client.mutation("events:enableMultiTierTickets", { eventId });
    console.log("✅ Multi-tier tickets enabled");

    // Create ticket types
    const ticketTypes = [
      {
        eventId,
        name: "Leader Pass",
        description: "Full access for leaders including workshops and social dancing",
        price: 75.00,
        totalQuantity: 50,
        type: "leader",
        sortOrder: 1,
      },
      {
        eventId,
        name: "Follower Pass", 
        description: "Full access for followers including workshops and social dancing",
        price: 75.00,
        totalQuantity: 50,
        type: "follower",
        sortOrder: 2,
      },
      {
        eventId,
        name: "Refreshment Package",
        description: "Includes meals and drinks throughout the event",
        price: 25.00,
        totalQuantity: 100,
        type: "refreshment",
        sortOrder: 3,
      },
      {
        eventId,
        name: "After Party",
        description: "Access to the exclusive after party",
        price: 15.00,
        totalQuantity: 80,
        type: "afterparty",
        sortOrder: 4,
      }
    ];

    console.log("Creating ticket types...");
    for (const ticketType of ticketTypes) {
      try {
        const result = await client.mutation("ticketTypes:create", ticketType);
        console.log(`✅ Created ticket type: ${ticketType.name}`);
      } catch (error) {
        console.error(`❌ Failed to create ticket type ${ticketType.name}:`, error.message);
      }
    }

    console.log("\n🎉 Multi-ticket setup completed!");
    console.log("You can now visit the event page to see the ticket types.");
    
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
  }
}

setupMultiTickets();
