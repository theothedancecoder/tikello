import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import Stripe from "stripe";
import { StripeCheckoutMetaData } from "@/actions/createStripeCheckoutSession";
import { StripeCheckoutMetaDataForTicketType } from "@/actions/createStripeCheckoutSessionForTicketType";
import { StripeCheckoutMetaDataForCart } from "@/actions/createStripeCheckoutSessionForCart";


export async function POST(req: Request) {
  console.log("Webhook received");

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  console.log("Webhook signature:", signature ? "Present" : "Missing");

  let event: Stripe.Event;

  try {
    console.log("Attempting to construct webhook event");
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("Webhook event constructed successfully:", event.type);
  } catch (err) {
    console.error("Webhook construction failed:", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  const convex = getConvexClient();

  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed");
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata as StripeCheckoutMetaData;
    console.log("Session metadata:", metadata);
    console.log("Convex client:", convex);

    try {
      // Check if this is a cart purchase
      if ('cartItems' in metadata) {
        console.log("Processing cart purchase");
        const cartMetadata = metadata as StripeCheckoutMetaDataForCart;
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
          
          const result = await convex.mutation(api.events.purchaseCartTickets, {
            eventId: cartMetadata.eventId,
            userId: cartMetadata.userId,
            cartItems: cartItems,
            paymentInfo: {
              paymentIntentId: session.payment_intent as string,
              amount: session.amount_total ?? 0,
            },
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
        const result = await convex.mutation(api.events.purchaseTicketType, {
          eventId: ticketTypeMetadata.eventId,
          userId: ticketTypeMetadata.userId,
          ticketTypeId: ticketTypeMetadata.ticketTypeId,
          paymentInfo: {
            paymentIntentId: session.payment_intent as string,
            amount: session.amount_total ?? 0,
          },
        });
        console.log("Purchase ticket type mutation completed:", result);
      } else {
        // Handle regular ticket purchase
        const regularMetadata = metadata as StripeCheckoutMetaData;
        const result = await convex.mutation(api.events.purchaseTicket, {
          eventId: regularMetadata.eventId,
          userId: regularMetadata.userId,
          waitingListId: regularMetadata.waitingListId,
          paymentInfo: {
            paymentIntentId: session.payment_intent as string,
            amount: session.amount_total ?? 0,
          },
        });
        console.log("Purchase ticket mutation completed:", result);
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}