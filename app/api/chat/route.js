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

const isProfessorRelatedQuery = (query) => {
  const professorKeywords = [
    // Core terms
    "professor",
    "prof",
    "teacher",
    "instructor",
    "faculty",
    "lecturer",
    "class",
    "course",
    "subject",
    "department",
    "major",
    "minor",
    "teach",
    "lecture",
    "grade",
    "grading",
    "rating",
    "review",
    "difficulty",
    "style",
    "availability",
    "office hours",

    // Academic terms
    "syllabus",
    "curriculum",
    "semester",
    "quarter",
    "term",
    "exam",
    "test",
    "quiz",
    "assignment",
    "homework",
    "project",
    "midterm",
    "final",
    "paper",
    "essay",
    "thesis",

    // Academic levels
    "undergraduate",
    "graduate",
    "phd",
    "doctoral",
    "masters",
    "freshman",
    "sophomore",
    "junior",
    "senior",

    // Course types
    "seminar",
    "lecture",
    "lab",
    "workshop",
    "tutorial",

    // Teaching styles
    "hands-on",
    "theoretical",
    "practical",
    "discussion-based",
    "interactive",
    "online",
    "in-person",
    "hybrid",

    // Evaluation terms
    "workload",
    "tough",
    "easy",
    "fair",
    "strict",
    "lenient",
    "helpful",
    "knowledgeable",
    "engaging",
    "boring",

    // Academic fields (add more as needed)
    "math",
    "science",
    "engineering",
    "humanities",
    "arts",
    "social sciences",
    "business",
    "economics",
    "psychology",
    "computer science",
    "biology",
    "chemistry",
    "physics",

    // Miscellaneous
    "gpa",
    "credits",
    "prerequisites",
    "textbook",
    "materials",
    "attendance",
    "participation",
    "curve",
    "extra credit",
    "research",
    "internship",
    "ta",
    "teaching assistant",
  ];

  // Convert query to lowercase for case-insensitive matching
  const lowerQuery = query.toLowerCase();

  // Check for exact matches first
  if (professorKeywords.some((keyword) => lowerQuery.includes(keyword))) {
    return true;
  }

  // Check for partial matches (e.g., "prof" in "professor")
  if (
    professorKeywords.some((keyword) =>
      lowerQuery
        .split(" ")
        .some((word) => word.startsWith(keyword) || keyword.startsWith(word))
    )
  ) {
    return true;
  }

  // Check for common academic phrases
  const academicPhrases = [
    "how is",
    "who is the best",
    "recommend a",
    "looking for",
    "need help with",
    "advice on",
    "opinions about",
    "experiences with",
    "thoughts on",
    "anyone taken",
    "has anyone",
    "tell me about",
  ];

  if (academicPhrases.some((phrase) => lowerQuery.includes(phrase))) {
    return true;
  }

  return false;
};

const openai = new OpenAI();
export async function POST(req) {
  const data = await req.json();

  const userQuery = data[data.length - 1].content;

  if (!isProfessorRelatedQuery(userQuery)) {
    return NextResponse.json({
      message:
        "I'm sorry, but I can only assist with queries related to professors and their courses. Could you please ask a question about a professor, their teaching style, or a specific course?",
    });
  }

  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pc.index("rag").namespace("ns1");

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: userQuery,
    encoding_format: "float",
  });

  const results = await index.query({
    topK: 5,
    includeMetadata: true,
    vector: embedding.data[0].embedding,
  });

  // Structure the results
  const structuredResults = results.matches.map((match) => ({
    professor: match.metadata.professor || match.id,
    review: match.metadata.review || match.metadata.summary,
    subject: match.metadata.subject || match.metadata.department,
    stars: match.metadata.stars || match.metadata.overallRating,
  }));

  const lastMessage = data[data.length - 1];
  const lastMessageContent = userQuery + JSON.stringify(structuredResults);
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
    results: structuredResults,
  };

  // Return the structured response
  return new NextResponse(JSON.stringify(structuredResponse), {
    headers: { "Content-Type": "application/json" },
  });
}
