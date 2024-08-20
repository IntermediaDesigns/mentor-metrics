import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

export async function POST(req) {
  const ratingData = await req.json();

  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index("rag").namespace("ns1");
    const openai = new OpenAI();

    // Create a summary of the professor rating
    const summary = `Professor ${ratingData.professorName} teaches ${ratingData.subject}. Teaching style: ${ratingData.teachingStyle}. Difficulty: ${ratingData.difficulty}. Grading fairness: ${ratingData.gradingFairness}. Availability: ${ratingData.availability}. Overall rating: ${ratingData.overallRating}/5. Review: ${ratingData.review}`;

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: summary,
      encoding_format: "float",
    });

    // Insert into Pinecone
    const upsertResponse = await index.upsert([{
      id: `${ratingData.professorName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
      values: embedding.data[0].embedding,
      metadata: {
        ...ratingData,
        type: 'professor_rating'
      }
    }]);

    console.log("Upsert response:", upsertResponse);

    return NextResponse.json({ message: `Rating for ${ratingData.professorName} added successfully` });
  } catch (error) {
    console.error('Error processing rating:', error);
    return NextResponse.json({ error: "Failed to process the rating: " + error.message }, { status: 500 });
  }
}