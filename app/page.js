'use client'
import { useState } from 'react'

const formatAIResponse = (content) => {
  if (!content || typeof content !== 'object') {
    return <p>{content}</p>;
  }

  return (
    <div>
      {content.results && content.results.map((result, index) => (
        <div key={index} className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-lg text-blue-800 mb-2">Professor: {result.professor}</h3>
          <p className="mb-2"><span className="font-semibold">Subject:</span> {result.subject}</p>
          <p className="mb-2"><span className="font-semibold">Review:</span> {result.review}</p>
          <p><span className="font-semibold">Stars:</span> {result.stars}</p>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    
    setIsLoading(true)
    setMessage('')
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[updatedMessages.length - 1] = { 
          role: 'assistant', 
          content: data 
        };
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Sorry, there was an error processing your request.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-800">Mentor Metrics AI Assistant</h1>
        <div className="flex flex-col space-y-4 h-[600px] overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-4 ${
                  msg.role === 'assistant'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-green-100 text-green-900'
                }`}
              >
                {msg.role === 'assistant' ? formatAIResponse(msg.content) : msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            className={`px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}