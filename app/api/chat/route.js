import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed.
`;

export async function POST(req) {
  const data = await req.json();

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index("rag").namespace("ns1");
  const openai = new OpenAI();

  const text = data[data.length - 1].content;
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  const results = await index.query({
    topK: 5,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  // Structure the results
  const structuredResults = results.matches.map(match => ({
    professor: match.id,
    review: match.metadata.review,
    subject: match.metadata.subject,
    stars: match.metadata.stars
  }));

  const lastMessage = data[data.length - 1];
  const lastMessageContent = lastMessage.content + JSON.stringify(structuredResults);
  const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      ...lastDataWithoutLastMessage,
      { role: "user", content: lastMessageContent },
    ],
    model: "gpt-3.5-turbo",
    stream: false,  // Change this to false
  });

  // Structure the final response
  const structuredResponse = {
    message: completion.choices[0].message.content,
    results: structuredResults
  };

  // Return the structured response
  return new NextResponse(JSON.stringify(structuredResponse), {
    headers: { 'Content-Type': 'application/json' }
  });
}