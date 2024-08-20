import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import fetch from 'node-fetch';
import { load } from 'cheerio';

export async function POST(req) {
  const { url } = await req.json();

  try {
    // Fetch the webpage
    const response = await fetch(url);
    const html = await response.text();

    // Parse the HTML
    const $ = load(html);

    // Extract relevant information (adjust selectors based on actual Rate My Professor HTML structure)
    const professorName = $('.NameTitle__Name-sc-19mkhx9-0').text().trim() || 'Unknown Professor';
    const department = $('.NameTitle__Title-sc-19mkhx9-1').text().trim() || 'Unknown Department';
    const overallRating = $('.RatingValue__Numerator-qw8sqy-2').text().trim() || 'N/A';
    const reviews = $('.Comments__StyledComments-dzzyvm-0').map((_, el) => $(el).text().trim()).get();

    // Create a summary of the professor
    const summary = `Professor ${professorName} from the ${department} department has an overall rating of ${overallRating}. Sample reviews: ${reviews.slice(0, 3).join(' ')}`;

    // Create embedding
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index("rag").namespace("ns1");
    const openai = new OpenAI();

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: summary,
      encoding_format: "float",
    });

    // Ensure we have a valid embedding
    if (!embedding.data || !embedding.data[0] || !embedding.data[0].embedding) {
      throw new Error("Failed to generate embedding");
    }

    // Insert into Pinecone
    const upsertResponse = await index.upsert([{
      id: professorName.replace(/\s+/g, '_').toLowerCase(),
      values: embedding.data[0].embedding,
      metadata: {
        professor: professorName,
        department,
        overallRating,
        summary
      }
    }]);

    console.log("Upsert response:", upsertResponse);

    return NextResponse.json({ message: "Professor data added successfully" });
  } catch (error) {
    console.error('Error processing link:', error);
    return NextResponse.json({ error: "Failed to process the link: " + error.message }, { status: 500 });
  }
}