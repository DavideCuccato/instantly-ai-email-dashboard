import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

export const runtime = "edge";

const emailResponseSchema = z.object({
  assistantType: z
    .enum(["sales", "followup"])
    .describe(
      "Type of email: sales for pitches/promotions, followup for check-ins/reminders"
    ),
  subject: z
    .string()
    .describe(
      "Email subject line - compelling for sales, professional for follow-ups"
    ),
  body: z
    .string()
    .describe(
      "Email body - for sales: under 40 words with clear CTA; for follow-up: professional with next steps"
    ),
  wordCount: z
    .number()
    .describe(
      "Exact word count of the body - MUST be 40 or less for sales emails"
    ),
});

const SYSTEM_PROMPT = `You are an intelligent email assistant that analyzes requests and generates appropriate emails.

First, determine the assistantType:
- "sales": For sales pitches, product promotions, business development outreach
- "followup": For follow-up emails, check-ins, reminders, status updates

Then generate the email following these rules:

FOR SALES EMAILS (assistantType: "sales"):
- CRITICAL: Body MUST be under 40 words total (count every word!)
- 7-10 words per sentence maximum
- Be direct and compelling
- Focus on value proposition
- Include clear call to action
- Set wordCount to the exact number of words in the body

FOR FOLLOW-UP EMAILS (assistantType: "followup"):
- Be professional and courteous
- Reference previous interaction if mentioned
- Keep it concise and clear
- Include next steps or questions
- Set wordCount to the exact number of words in the body

IMPORTANT: Always count words accurately and include the count in wordCount field.`;

export default async function handler(req) {
  try {
    const { prompt, to } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await streamObject({
      model: openai("gpt-4o"),
      schema: emailResponseSchema,
      system: SYSTEM_PROMPT,
      prompt: `Generate an email for: ${prompt}${
        to ? ` (Recipient: ${to})` : ""
      }`,
      temperature: 0.7,
      maxTokens: 500,
    });

    const encoder = new TextEncoder();

    const customStream = new ReadableStream({
      async start(controller) {
        try {
          let lastAssistantType = null;
          let lastSubject = null;
          let lastBody = null;
          let lastWordCount = null;

          for await (const partialObject of result.partialObjectStream) {
            if (
              partialObject.assistantType &&
              partialObject.assistantType !== lastAssistantType
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    assistant_type: partialObject.assistantType,
                  })}\n\n`
                )
              );
              lastAssistantType = partialObject.assistantType;
            }

            if (
              partialObject.subject &&
              partialObject.subject !== lastSubject
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    subject: partialObject.subject,
                    type: "subject",
                  })}\n\n`
                )
              );
              lastSubject = partialObject.subject;
            }

            if (partialObject.body && partialObject.body !== lastBody) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    body: partialObject.body,
                    type: "body",
                    wordCount: partialObject.wordCount,
                  })}\n\n`
                )
              );
              lastBody = partialObject.body;
              lastWordCount = partialObject.wordCount;
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: error.message || "Generation failed",
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Email generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate email" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
