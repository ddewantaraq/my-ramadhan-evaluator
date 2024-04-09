"use client"

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setAnswer("Thinking...")
    const response = await fetch(process.env.NEXT_PUBLIC_API_HOST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    console.log('Response from the server:', data);
    setAnswer(data.response);
  }

  // Function to update the state with the input value
  const handleChange = (e: any) => {
    setQuestion(e.target.value);
  };  
  return (
    <div>
      <h1>Ask a question</h1>
      <form onSubmit={handleSubmit}>
        <input id="question" type="text" value={question} onChange={handleChange} />
        <button type="submit">Query</button>
      </form>
      <div id="answer">{answer}</div>
    </div>
  );
}
