import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemPrompt = `
You are an advanced rate my professor agent to help students find classes and professors. Analyze the user's query to understand their preferences and requirements. Provide personalized professor recommendations based on the following criteria:
1. Subject area
2. Teaching style (e.g., hands-on, lecture-based, discussion-oriented)
3. Difficulty level
4. Grading fairness
5. Availability outside of class
For every user question, analyze the top 5 professors that match the user's criteria. Explain why each professor is recommended and how they match the user's preferences. Include any additional information from Rate My Professor submissions if available.
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
    professor: match.metadata.professor || match.id,
    review: match.metadata.review || match.metadata.summary,
    subject: match.metadata.subject || match.metadata.department,
    stars: match.metadata.stars || match.metadata.overallRating
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
    stream: false,
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