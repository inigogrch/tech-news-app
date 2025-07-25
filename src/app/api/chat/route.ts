// stolen from Hai's repo!
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { VectorizeService } from "@/lib/vectorize";
import type { ChatSource } from "@/app/types/chat";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userMessage = messages[messages.length - 1];
    let contextDocuments = "";
    let sources: ChatSource[] = [];

    if (userMessage?.role === "user" && userMessage?.content) {
      try {
        const vectorizeService = new VectorizeService();
        const documents = await vectorizeService.retrieveDocuments(
          userMessage.content
        );
        contextDocuments =
          vectorizeService.formatDocumentsForContext(documents);
        sources = vectorizeService.convertDocumentsToChatSources(documents);
      } catch (vectorizeError) {
        console.error("Vectorize retrieval failed:", vectorizeError);
        contextDocuments =
          "Unable to retrieve relevant documents at this time.";
        sources = [];
      }
    }

    const systemPrompt = `You are a sharp, articulate tech news reporter that specializes in answering questions user have based on sources.
    You deliver concise, up-to-date summaries of the latest developments in technology, startups, AI, and innovation. 
    Your tone is informative yet engaging, like a journalist reporting for a smart, curious audience. 
    When relevant, add context, trends, and implications to help readers understand the bigger picture.

When answering questions, use the following context documents to provide accurate and relevant information:

=== CONTEXT DOCUMENTS ===
${contextDocuments}
=== END CONTEXT DOCUMENTS ===

Please base your responses on the context provided above when relevant. If the context doesn't contain information to answer the question, acknowledge this and provide general knowledge while being clear about what information comes from the context vs. your general knowledge.
.`;

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
    });

    // Return both the text response and sources
    return Response.json({
      role: "assistant",
      content: result.text,
      sources: sources,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    return Response.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
