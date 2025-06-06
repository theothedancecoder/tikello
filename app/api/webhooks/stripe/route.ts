import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import Stripe from "stripe";
import { StripeCheckoutMetaData } from "@/actions/createStripeCheckoutSession";
import { StripeCheckoutMetaDataForTicketType } from "@/actions/createStripeCheckoutSessionForTicketType";
import { StripeCheckoutMetaDataForCart } from "@/actions/createStripeCheckoutSessionForCart";
import { clerkClient } from "@clerk/nextjs/server";
import { sendTicketConfirmationEmail } from "@/lib/email";

// Helper function to send confirmation email
async function sendConfirmationEmail(convex: any, eventId: string, userId: string, ticketId: string, amount: number, currency: string = 'nok') {
  try {
    // Get event and user details
    const [event, user] = await Promise.all([
      convex.query(api.events.getById, { eventId }),
      convex.query(api.users.getUserById, { userId: userId })
    ]);

    if (event && user) {
      await sendTicketConfirmationEmail({
        userEmail: user.email,
        userName: user.name,
        eventName: event.name,
        eventDescription: event.description,
        eventLocation: event.location,
        eventDate: new Date(event.eventDate).toLocaleString(),
        ticketId: ticketId,
        amount: amount,
        currency: event.currency || currency
      });
      console.log("Confirmation email sent successfully");
    }
  } catch (emailError) {
    console.error("Failed to send confirmation email:", emailError);
    // Don't fail the webhook if email fails
  }
}

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
    
    console.log("7. Session details:", {
      id: session.id,
      customer: session.customer,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      metadata: session.metadata
    });

    // Handle test webhook events - check session metadata directly
    if (!session.metadata || Object.keys(session.metadata).length === 0) {
      console.log("Test webhook event received - no metadata present");
      return new Response("Test webhook received successfully", { status: 200 });
    }

    const metadata = session.metadata as StripeCheckoutMetaData;

    // Get Stripe fee breakdown from payment intent
    let stripeFeesData = undefined;
    if (session.payment_intent && typeof session.payment_intent === 'string') {
      try {
        // For Connect accounts, we need to retrieve from the connected account
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent,
          {
            stripeAccount: metadata.stripeConnectId
          }
        );

        if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'string') {
          const charge = await stripe.charges.retrieve(
            paymentIntent.latest_charge,
            {
              stripeAccount: metadata.stripeConnectId
            }
          );

          if (charge.balance_transaction && typeof charge.balance_transaction === 'string') {
            const balanceTransaction = await stripe.balanceTransactions.retrieve(
              charge.balance_transaction,
              {
                stripeAccount: metadata.stripeConnectId
              }
            );

            stripeFeesData = {
              gross: balanceTransaction.amount,
              fee: balanceTransaction.fee,
              net: balanceTransaction.net,
              feeDetails: balanceTransaction.fee_details.map(detail => ({
                type: detail.type,
                amount: detail.amount,
                currency: detail.currency,
              })),
            };
            console.log("Stripe fees data retrieved:", stripeFeesData);
          }
        }
      } catch (feeError) {
        console.error("Failed to retrieve Stripe fee information:", feeError);
        // Continue without fee data if retrieval fails
      }
    }

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
              paymentIntentId: session.id,
              amount: session.amount_total ?? 0,
              stripeFees: stripeFeesData,
            },
            discountCodeId: cartMetadata.discountCodeId,
            buyerInfo: cartMetadata.buyerName ? {
              fullName: cartMetadata.buyerName,
              email: cartMetadata.buyerEmail,
              phone: cartMetadata.buyerPhone,
            } : undefined,
          });
          console.log("Purchase cart tickets mutation completed:", result);

          // Send confirmation email for cart purchase
          await sendConfirmationEmail(
            convex, 
            cartMetadata.eventId, 
            cartMetadata.userId, 
            session.id, 
            session.amount_total ?? 0
          );
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
            stripeFees: stripeFeesData,
          },
        });
        console.log("Purchase ticket type mutation completed:", result);

        // Send confirmation email for ticket type purchase
        await sendConfirmationEmail(
          convex, 
          ticketTypeMetadata.eventId, 
          ticketTypeMetadata.userId, 
          session.id, 
          session.amount_total ?? 0
        );
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
            stripeFees: stripeFeesData,
          },
        });
        console.log("Purchase ticket mutation completed:", result);

        // Send confirmation email
        await sendConfirmationEmail(convex, regularMetadata.eventId, regularMetadata.userId, session.id, session.amount_total ?? 0);
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
