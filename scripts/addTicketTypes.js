// Script to add ticket types to the Multi tickets event
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function addTicketTypes() {
  const eventId = "j573pbfnx7x9d495wd5wexkj7s7h5sty"; // Multi tickets event ID
  
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

  for (const ticketType of ticketTypes) {
    try {
      const result = await client.mutation("ticketTypes:create", ticketType);
      console.log(`Created ticket type: ${ticketType.name}`, result);
    } catch (error) {
      console.error(`Failed to create ticket type ${ticketType.name}:`, error);
    }
  }
}

addTicketTypes().catch(console.error);
