"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const formatAIResponse = (content) => {
  if (!content || typeof content !== "object") {
    return <p>{content}</p>;
  }

  return (
    <div>
      {content.results &&
        content.results.map((result, index) => (
          <div key={index} className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg text-slate-800 mb-2">
             <span className="font-semibold text-orange-700 tracking-wider">Professor: </span> {result.professor}
            </h3>
            <p className="mb-2">
              <span className="font-semibold">Subject:</span> {result.subject}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Review:</span> {result.review}
            </p>
            <p>
              <span className="font-semibold">Stars:</span> {result.stars}
            </p>
          </div>
        ))}
    </div>
  );
};

const AdvancedSearchForm = ({ onSearch }) => {
  const [criteria, setCriteria] = useState({
    subject: "",
    teachingStyle: "",
    difficulty: "",
    gradingFairness: "",
    availability: "",
  });

  const handleChange = (e) => {
    setCriteria({ ...criteria, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = `Find professors for ${criteria.subject} with ${criteria.teachingStyle} teaching style, ${criteria.difficulty} difficulty, ${criteria.gradingFairness} grading, and ${criteria.availability} availability outside class.`;
    onSearch(query);
    setCriteria({
      subject: "",
      teachingStyle: "",
      difficulty: "",
      gradingFairness: "",
      availability: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-amber-50 border border-amber-400 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Search for Professors</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <select
          name="teachingStyle"
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Teaching Style</option>
          <option value="hands-on">Hands-on</option>
          <option value="lecture-based">Lecture-based</option>
          <option value="discussion-oriented">Discussion-oriented</option>
        </select>
        <select
          name="difficulty"
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Difficulty Level</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="challenging">Challenging</option>
        </select>
        <select
          name="gradingFairness"
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Grading Fairness</option>
          <option value="very fair">Very Fair</option>
          <option value="fair">Fair</option>
          <option value="strict">Strict</option>
        </select>
        <select
          name="availability"
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Availability Outside Class</option>
          <option value="very available">Very Available</option>
          <option value="somewhat available">Somewhat Available</option>
          <option value="limited">Limited</option>
        </select>
      </div>
      <button
        type="submit"
        className="mt-4 p-2 bg-orange-500 text-white rounded hover:bg-orange-600"
      >
        Search Professors
      </button>
    </form>
  );
};

const LinkSubmissionForm = ({ onSubmit }) => {
  const [link, setLink] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(link);
    setLink("");
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-amber-50 border border-amber-400 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Submit Professor Rating URL</h2>
      <div className="flex items-center flex-wrap">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter Rate My Professor URL"
          className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />
        <button
          type="submit"
          className="p-2 bg-orange-500 text-white rounded-r hover:bg-orange-600"
        >
          Submit Link
        </button>
      </div>
    </form>
  );
};

const ProfessorRatingForm = ({ onSubmit }) => {
  const [rating, setRating] = useState({
    professorName: "",
    subject: "",
    teachingStyle: "",
    difficulty: "",
    gradingFairness: "",
    availability: "",
    overallRating: "",
    review: "",
  });

  const handleChange = (e) => {
    setRating({ ...rating, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(rating);
    setRating({
      professorName: "",
      subject: "",
      teachingStyle: "",
      difficulty: "",
      gradingFairness: "",
      availability: "",
      overallRating: "",
      review: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add Professor Rating</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="professorName"
          value={rating.professorName}
          onChange={handleChange}
          placeholder="Professor Name"
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />
        <input
          type="text"
          name="subject"
          value={rating.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />
        <select
          name="teachingStyle"
          value={rating.teachingStyle}
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        >
          <option value="">Teaching Style</option>
          <option value="hands-on">Hands-on</option>
          <option value="lecture-based">Lecture-based</option>
          <option value="discussion-oriented">Discussion-oriented</option>
        </select>
        <select
          name="difficulty"
          value={rating.difficulty}
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        >
          <option value="">Difficulty Level</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="challenging">Challenging</option>
        </select>
        <select
          name="gradingFairness"
          value={rating.gradingFairness}
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        >
          <option value="">Grading Fairness</option>
          <option value="very fair">Very Fair</option>
          <option value="fair">Fair</option>
          <option value="strict">Strict</option>
        </select>
        <select
          name="availability"
          value={rating.availability}
          onChange={handleChange}
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        >
          <option value="">Availability Outside Class</option>
          <option value="very available">Very Available</option>
          <option value="somewhat available">Somewhat Available</option>
          <option value="limited">Limited</option>
        </select>
        <input
          type="number"
          name="overallRating"
          value={rating.overallRating}
          onChange={handleChange}
          placeholder="Overall Rating (1-5)"
          min="1"
          max="5"
          className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          required
        />
      </div>
      <textarea
        name="review"
        value={rating.review}
        onChange={handleChange}
        placeholder="Write your review here..."
        className="mt-4 p-2 border rounded w-full h-24 focus:outline-none focus:ring-2 focus:ring-amber-500"
        required
      ></textarea>
      <button
        type="submit"
        className="mt-4 p-2 bg-orange-500 text-white rounded hover:bg-orange-600"
      >
        Submit Rating
      </button>
    </form>
  );
};


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm the Mentor Metrics AI Assistant. How can I help you today? You can ask me about specific professors or use the advanced search form to find personalized recommendations.`,
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || message;
    if (!messageToSend.trim() || isLoading) return;

    setIsLoading(true);
    setMessage("");
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: messageToSend },
      { role: "assistant", content: "thinking" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ...messages,
          { role: "user", content: messageToSend },
        ]),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          role: "assistant",
          content: data,
        };
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        };
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitLink = async (link) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/submit-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: link }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error submitting link:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, there was an error processing the link.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Chat cleared. How can I assist you today?`,
      },
    ]);
  };

  const submitRating = async (rating) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/submit-rating", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rating),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error submitting rating:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, there was an error submitting the rating.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-orange-bg bg-cover bg-no-repeat">
      <div className="mainCard w-full max-w-7xl bg-white rounded-lg shadow-2xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6">
            <Link href="/">
              <Image
                src="/mentor.png"
                alt="Mentor Metrics Logo"
                width={50}
                height={50}
                className="hover:transform hover:scale-110"
              />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-slate-950">
            Mentor Metrics AI Assistant
          </h1>
          <button
            onClick={clearChat}
            className="mb-6 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Clear Chat
          </button>
        </div>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col space-y-4 w-full md:w-1/2 lg:w-1/3">
            <LinkSubmissionForm onSubmit={submitLink} />
            <AdvancedSearchForm onSearch={sendMessage} />
            <ProfessorRatingForm onSubmit={submitRating} />
          </div>
          <div className="flex flex-col space-y-4 w-full md:w-1/2 lg:w-2/3">
            <div className="h-[635px] overflow-y-auto mb-4 p-4 bg-amber-50 rounded-lg border border-amber-400">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-xs mb-4 md:max-w-md lg:max-w-lg rounded-lg p-4 ${
                      msg.role === "assistant"
                        ? "bg-amber-500 text-slate-800"
                        : "bg-orange-300 text-slate-700"
                    }`}
                  >
                    {msg.role === "assistant" && msg.content === "thinking" ? (
                      <div className="flex items-center">
                        <span className="mr-2">AI is thinking</span>
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse delay-150">.</span>
                        <span className="animate-pulse delay-300">.</span>
                      </div>
                    ) : msg.role === "assistant" ? (
                      formatAIResponse(msg.content)
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                className={`px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}