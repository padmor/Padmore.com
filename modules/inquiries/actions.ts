"use server";
import { z } from "zod";
import { serverDb } from "@/db/connection";
import { collaborationRequestDetails, inquiries, newsletterSubscribers, projectRequestDetails } from "@/db/schema/schema";
import { clientIp, consumeRateLimit, type RateLimit } from "@/lib/security/rate-limit";
import { recordEngagementEvent } from "@/modules/analytics/engagement";

export type PublicFormState = { error?: string; sent?: boolean };

const PUBLIC_FORM_LIMIT: RateLimit = { name: "public-form", maxHits: 10, windowSeconds: 600 };
const BUSY = "Too many messages from your connection. Please try again in a few minutes.";
const FAILED = "That couldn't be sent. Please try again.";

const name = z.string().trim().min(1, "Add your name.").max(200);
const email = z.email("Enter a valid email address.").trim().max(320);
const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalLink = z.union([z.literal(""), z.url({ protocol: /^https?$/, error: "Enter a full link starting with https://" }).max(2048)]).optional();

const contactSchema = z.object({
  name,
  email,
  subject: optionalText(300),
  message: z.string().trim().min(10, "Your message needs at least 10 characters.").max(10000),
});

const projectSchema = z.object({
  name,
  email,
  title: z.string().trim().min(1, "Add a project title.").max(300),
  description: z.string().trim().min(20, "Your description needs at least 20 characters.").max(9000),
  type: z.string().trim().min(1, "Choose a project type.").max(200),
  organization: optionalText(200),
  budget: optionalText(100),
  timeline: optionalText(100),
  reference: optionalLink,
  guidance: optionalText(5),
});

const collaborationSchema = z.object({
  name,
  email,
  opportunity: optionalText(200),
  role: z.string().trim().min(1, "Choose your role.").max(100),
  availability: optionalText(100),
  skills: z.string().trim().min(1, "Add your skills.").max(1000),
  portfolio: optionalLink,
  github: optionalLink,
  motivation: z.string().trim().min(20, "Tell me a little more, at least 20 characters.").max(9000),
});

const newsletterSchema = z.object({ email });

// Bots fill every field, including this one that people never see. They are told
// the message was sent, so they learn nothing about the check.
const isBot = (formData: FormData) => Boolean(formData.get("website"));

async function guard(formData: FormData): Promise<PublicFormState | null> {
  if (isBot(formData)) return { sent: true };
  return (await consumeRateLimit(PUBLIC_FORM_LIMIT, await clientIp())) ? null : { error: BUSY };
}

function lines(entries: [string, string | undefined][]) {
  return entries.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join("\n");
}

export async function submitContactAction(_: PublicFormState, formData: FormData): Promise<PublicFormState> {
  const blocked = await guard(formData);
  if (blocked) return blocked;
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await serverDb.insert(inquiries).values({ kind: "general", ...parsed.data });
    return { sent: true };
  } catch {
    return { error: FAILED };
  }
}

export async function submitProjectRequestAction(_: PublicFormState, formData: FormData): Promise<PublicFormState> {
  const blocked = await guard(formData);
  if (blocked) return blocked;
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { name, email, title, description, type, organization, budget, timeline, reference, guidance } = parsed.data;
  try {
    const [saved] = await serverDb.insert(inquiries).values({ kind: "project", name, email, subject: title, message: description }).returning({ id: inquiries.id });
    await serverDb.insert(projectRequestDetails).values({
      inquiryId: saved.id,
      projectType: type,
      projectScope: lines([["Organization", organization], ["Budget", budget], ["Timeline", timeline], ["Reference", reference], ["Needs help defining it", guidance ? "Yes" : undefined]]),
    });
    await recordEngagementEvent("project_request_submitted", "/request-project");
    return { sent: true };
  } catch {
    return { error: FAILED };
  }
}

export async function submitCollaborationAction(_: PublicFormState, formData: FormData): Promise<PublicFormState> {
  const blocked = await guard(formData);
  if (blocked) return blocked;
  const parsed = collaborationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { name, email, opportunity, role, availability, skills, portfolio, github, motivation } = parsed.data;
  try {
    const [saved] = await serverDb.insert(inquiries).values({ kind: "collaboration", name, email, subject: opportunity || "General collaboration", message: motivation }).returning({ id: inquiries.id });
    await serverDb.insert(collaborationRequestDetails).values({
      inquiryId: saved.id,
      collaborationType: role,
      skills: skills.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 50),
      availability,
      proposal: lines([["Portfolio", portfolio], ["GitHub", github]]),
    });
    await recordEngagementEvent("collaboration_submitted", "/build-with-me");
    return { sent: true };
  } catch {
    return { error: FAILED };
  }
}

// Answers the same for new and existing addresses, so the form can't be used to
// find out who has subscribed.
export async function subscribeAction(_: PublicFormState, formData: FormData): Promise<PublicFormState> {
  const blocked = await guard(formData);
  if (blocked) return blocked;
  const parsed = newsletterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    const inserted = await serverDb.insert(newsletterSubscribers).values({ email: parsed.data.email, source: "website" }).onConflictDoNothing().returning({ id: newsletterSubscribers.id });
    if (inserted.length > 0) await recordEngagementEvent("newsletter_subscribed", "/");
    return { sent: true };
  } catch {
    return { error: FAILED };
  }
}
