import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import Stripe from "stripe";
import { StripeCheckoutMetaData } from "@/actions/createStripeCheckoutSession";
import { StripeCheckoutMetaDataForTicketType } from "@/actions/createStripeCheckoutSessionForTicketType";
import { StripeCheckoutMetaDataForCart } from "@/actions/createStripeCheckoutSessionForCart";
import { clerkClient } from "@clerk/nextjs/server";

// Add GET handler for testing
export async function GET() {
  return new Response("Webhook endpoint is working. Use POST for actual webhooks.", { 
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}

export async function POST(req: Request) {
  console.log("=== Webhook Debug Start ===");
  console.log("1. Webhook received at:", new Date().toISOString());

  // Check request method
  if (req.method !== 'POST') {
    console.error("Invalid request method:", req.method);
    return new Response(`Method ${req.method} not allowed`, { status: 405 });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  if (!signature) {
    console.error("No Stripe signature found in headers");
    return new Response("No Stripe signature found", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  console.log("2. Request body length:", body.length);
  console.log("3. Webhook signature present");

  let event: Stripe.Event;

  try {
    console.log("4. Attempting to construct webhook event");
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("5. Webhook event constructed successfully:", {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString()
    });
  } catch (err) {
    console.error("Webhook construction failed:", err);
    if (err instanceof Error) {
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
    }
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  const convex = getConvexClient();

  if (event.type === "checkout.session.completed") {
    console.log("6. Processing checkout.session.completed");
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata as StripeCheckoutMetaData;
    console.log("7. Session details:", {
      id: session.id,
      customer: session.customer,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      metadata: session.metadata
    });

    try {
      // Check if this is a cart purchase
      if ('cartItems' in metadata) {
        console.log("Processing cart purchase");
        const cartMetadata = metadata as unknown as StripeCheckoutMetaDataForCart;
        console.log("Cart metadata:", cartMetadata);
        
        try {
          const cartItems = JSON.parse(cartMetadata.cartItems);
          console.log("Parsed cart items:", cartItems);
          
          // Validate cart items structure
          if (!Array.isArray(cartItems)) {
            throw new Error("Cart items must be an array");
          }
          
          // Ensure each cart item has the required fields
          cartItems.forEach((item, index) => {
            if (!item.ticketTypeId || !item.quantity || !item.price) {
              throw new Error(`Invalid cart item at index ${index}`);
            }
          });
          
          // Log the session details for debugging
          console.log("Session details:", {
            id: session.id,
            payment_intent: session.payment_intent,
            amount_total: session.amount_total,
          });

          const result = await convex.mutation(api.events.purchaseCartTickets, {
            eventId: cartMetadata.eventId,
            userId: cartMetadata.userId,
            cartItems: cartItems,
            paymentInfo: {
              paymentIntentId: session.id, // Use session ID instead of payment intent
              amount: session.amount_total ?? 0,
            },
            discountCodeId: cartMetadata.discountCodeId,
            buyerInfo: cartMetadata.buyerName ? {
              fullName: cartMetadata.buyerName,
              email: cartMetadata.buyerEmail,
              phone: cartMetadata.buyerPhone,
            } : undefined,
          });
          console.log("Purchase cart tickets mutation completed:", result);
        } catch (parseError) {
          console.error("Failed to parse cart items:", parseError);
          console.error("Raw cartItems string:", cartMetadata.cartItems);
          throw new Error(`Failed to parse cart items: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      }
      // Check if this is a single multi-tier ticket purchase
      else if ('ticketTypeId' in metadata) {
        const ticketTypeMetadata = metadata as StripeCheckoutMetaDataForTicketType;
        
        console.log("Processing ticket type purchase with session:", {
          id: session.id,
          amount_total: session.amount_total,
        });

        const result = await convex.mutation(api.events.purchaseTicketType, {
          eventId: ticketTypeMetadata.eventId,
          userId: ticketTypeMetadata.userId,
          ticketTypeId: ticketTypeMetadata.ticketTypeId,
          paymentInfo: {
            paymentIntentId: session.id,
            amount: session.amount_total ?? 0,
          },
        });
        console.log("Purchase ticket type mutation completed:", result);
      } else {
        // Handle regular ticket purchase
        const regularMetadata = metadata as StripeCheckoutMetaData;
        
        console.log("Processing regular ticket purchase with session:", {
          id: session.id,
          amount_total: session.amount_total,
        });

        const result = await convex.mutation(api.events.purchaseTicket, {
          eventId: regularMetadata.eventId,
          userId: regularMetadata.userId,
          waitingListId: regularMetadata.waitingListId,
          paymentInfo: {
            paymentIntentId: session.id,
            amount: session.amount_total ?? 0,
          },
        });
        console.log("Purchase ticket mutation completed:", result);
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  console.log("=== Webhook Debug End ===");
  return new Response(null, { status: 200 });
}
