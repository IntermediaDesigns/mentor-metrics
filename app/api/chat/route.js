import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemPrompt = `
You are an advanced rate my professor agent to help students find classes and professors. Analyze the user's query to understand their preferences and requirements. If the user asks about a specific professor by name, provide information only about that professor. For general queries, provide personalized professor recommendations based on the following criteria:
1. Subject area
2. Teaching style (e.g., hands-on, lecture-based, discussion-oriented)
3. Difficulty level
4. Grading fairness
5. Availability outside of class
Explain why each professor is recommended and how they match the user's preferences. Include any additional information from Rate My Professor submissions if available.
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
    "blended",
    "flipped",
    "lecture-based",
    "project-based",
    "problem-based",
    "case-based",
    "team-based",
    "discussion-oriented",
    "group work",

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
    "history",
    "literature",
    "philosophy",
    "sociology",
    "political science",
    "communication",
    "education",
    "nursing",
    "medicine",
    "law",
    "design",
    "architecture",
    "music",
    "theater",
    "film",
    "media",
    "journalism",
    "public health",
    "urban planning",
    "environmental studies",
    "geography",
    "anthropology",
    "linguistics",
    "religious studies",

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
    "office hours",
    "advice",
    "opinion",
    "experience",
    "thoughts",
    "recommendation",
    "review professor",
    "find professor",
    "search professor",
    "information about professor",
    "instructor details",
    "faculty ratings",
    "class recommendations",
    "course suggestions",
    "course feedback",
    "class reviews",
    "professor ratings",
    "professor reviews",
    "professor recommendations",
    "professor feedback",
    "professor suggestions",
    "professor information",
    "professor details",
    "professor opinions",
    "professor experiences",
    "professor thoughts",
    "professor advice",
    "professor help",
    "professor guidance",
    "professor insights",
    "professor tips",
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
    "what's the rating for",
    "best professor for",
    "who teaches",
    "who is teaching",
    "who has taken",
    "who has experience with",
    "who has thoughts on",
    "who has opinions on",
    "who can recommend",
    "who can help with",
    "who can provide information on",
  ];

  if (academicPhrases.some((phrase) => lowerQuery.includes(phrase))) {
    return true;
  }

  // Additional checks, e.g., analyzing the structure of the query
  if (
    lowerQuery.includes("professor") &&
    (lowerQuery.includes("good") || lowerQuery.includes("best"))
  ) {
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

  // Check if the query is for a specific professor
  const professorNameMatch = userQuery.match(
    /(?:about|for|who is|tell me about)\s+([^?.,]+)/i
  );
  const specificProfessorQuery = professorNameMatch
    ? professorNameMatch[1].trim().toLowerCase()
    : null;

  // Filter for specific professor if available
  const subjectMatch = userQuery.match(/for\s+(\w+)/i);
  const teachingStyleMatch = userQuery.match(
    /(hands-on|lecture-based|discussion-oriented)/i
  );
  const difficultyMatch = userQuery.match(/(easy|moderate|challenging)/i);
  const gradingMatch = userQuery.match(/(very fair|fair|strict)/i);
  const availabilityMatch = userQuery.match(
    /(very available|somewhat available|limited)/i
  );

  let filter = {};
  if (subjectMatch) filter["metadata.subject"] = { $eq: subjectMatch[1] };
  if (teachingStyleMatch)
    filter["metadata.teachingStyle"] = {
      $eq: teachingStyleMatch[1].toLowerCase(),
    };
  if (difficultyMatch)
    filter["metadata.difficulty"] = { $eq: difficultyMatch[1].toLowerCase() };
  if (gradingMatch)
    filter["metadata.gradingFairness"] = { $eq: gradingMatch[1].toLowerCase() };
  if (availabilityMatch)
    filter["metadata.availability"] = {
      $eq: availabilityMatch[1].toLowerCase(),
    };

  let results;
  if (specificProfessorQuery) {
    // Query for the specific professor using a case-insensitive approach
    results = await index.query({
      topK: 20, // Increase this to improve chances of finding the right professor
      includeMetadata: true,
      vector: embedding.data[0].embedding,
    });

    // Filter results client-side for case-insensitive match
    results.matches = results.matches.filter(
      (match) =>
        (match.metadata.professor || match.id).toLowerCase() ===
        specificProfessorQuery
    );

    // Limit to top 1 result
    results.matches = results.matches.slice(0, 1);
  } else {
    // General query
    results = await index.query({
      topK: 5,
      filter: filter,
      includeMetadata: true,
      vector: embedding.data[0].embedding,
    });
  }

  // Structure the results
  const structuredResults = results.matches.map((match) => ({
    professor: match.metadata.professor,
    review: match.metadata.review,
    subject: match.metadata.subject,
    stars: match.metadata.stars,
    teachingStyle: match.metadata.teachingStyle,
    difficulty: match.metadata.difficulty,
    gradingFairness: match.metadata.gradingFairness,
    availability: match.metadata.availability,
  }));

  const lastMessageContent = userQuery + JSON.stringify(structuredResults);

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: lastMessageContent },
    ],
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    max_tokens: 1000,
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
