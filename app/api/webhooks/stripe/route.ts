import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOnboardingEmail, sendDunningEmail, sendCancellationSurvey } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { data: existingEvent } = await supabaseAdmin
    .from("stripe_events")
    .select("id")
    .eq("stripe_event_id", event.id)
    .single();

  if (existingEvent) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  await supabaseAdmin.from("stripe_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    created_at: new Date(event.created * 1000).toISOString(),
  });

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Error handling event ${event.id}: ${err.message}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan || "solo";

  if (!userId) {
    console.error("No user_id in checkout session metadata");
    return;
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: plan,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to update user after checkout:", error);
    return;
  }

  await sendOnboardingEmail(userId, plan);
  console.log(`User ${userId} subscribed to ${plan} plan`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email, plan")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!user) {
    console.error(`No user found for customer ${customerId}`);
    return;
  }

  await supabaseAdmin
    .from("users")
    .update({
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  await supabaseAdmin.from("payments").insert({
    user_id: user.id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: "succeeded",
    period_start: new Date((invoice.period_start || 0) * 1000).toISOString(),
    period_end: new Date((invoice.period_end || 0) * 1000).toISOString(),
  });

  console.log(`Payment succeeded for user ${user.id}: $${invoice.amount_paid / 100}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email, full_name")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!user) {
    console.error(`No user found for customer ${customerId}`);
    return;
  }

  await supabaseAdmin
    .from("users")
    .update({
      subscription_status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  await supabaseAdmin.from("payments").insert({
    user_id: user.id,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: "failed",
  });

  await sendDunningEmail(user.id, user.email, user.full_name);
  console.log(`Payment failed for user ${user.id}. Dunning email sent.`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const newStatus = subscription.status;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!user) return;

  const priceId = subscription.items.data[0]?.price.id;
  let plan = "solo";
  if (priceId === process.env.STRIPE_PRICE_PRO) plan = "pro";
  if (priceId === process.env.STRIPE_PRICE_TEAM) plan = "team";

  const updates: any = {
    plan: plan,
    subscription_status: newStatus,
    cancel_at_period_end: cancelAtPeriodEnd,
    updated_at: new Date().toISOString(),
  };

  if (cancelAtPeriodEnd && subscription.current_period_end) {
    updates.subscription_ends_at = new Date(subscription.current_period_end * 1000).toISOString();
  }

  await supabaseAdmin.from("users").update(updates).eq("id", user.id);
  console.log(`Subscription updated for user ${user.id}: ${plan} / ${newStatus}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("id, email")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!user) return;

  await supabaseAdmin
    .from("users")
    .update({
      plan: "free",
      subscription_status: "cancelled",
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  await sendCancellationSurvey(user.id, user.email);
  console.log(`Subscription cancelled for user ${user.id}`);
}
