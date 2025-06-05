// Test script to simulate free ticket purchase
const eventId = "j57099geds3cc8f32h6vmhf1yh7h7b24"; // Free event ID
const userId = "user_test123"; // Test user ID

// Simulate the purchaseFreeTickets action
const testData = {
  eventId: eventId,
  userId: userId,
  cartItems: [
    {
      ticketTypeId: "test_ticket_type_id",
      quantity: 1,
      price: 0
    }
  ],
  buyerInfo: {
    fullName: "Test User",
    email: "test@example.com",
    phone: "+1234567890"
  }
};

console.log("Test data for free ticket purchase:", JSON.stringify(testData, null, 2));
console.log("Free session ID would be:", `free_${Date.now()}_${userId}`);
