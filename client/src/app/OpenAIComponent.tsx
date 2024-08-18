// import React, { useState } from 'react';
// // import axios from 'axios';

// const OpenAIComponent = () => {
//   const [response, setResponse] = useState<string>('');
//   const [prompt, setPrompt] = useState<string>('');

//   const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setPrompt(event.target.value);
//   };


//   const handleSubmit = async () => {
//     const requestBody = {
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content: "Your task is to analyse some json data I give you and recommend to me 3 different Australian stock tickers based on said data. Your output must always be in the form of this array, please ensure the stocks you recommend are actual real life stock tickers on the ASX with the correct name [{\"symbol\": \"ticker1\", \"name\": \"name_of_stock\", \"reason\": \"reason_for_recommendation\", \"sector\": \"sector_of_stock1\", \"action\": \"buy\" or \"sell\"},{\"symbol\": \"ticker2\", \"name\": \"name_of_stock\", \"reason\": \"reason_for_recommendation\", \"sector\": \"sector_of_stock2\", \"action\": \"buy\" or \"sell\"},{\"symbol\": \"ticker3\", \"name\": \"name_of_stock\", \"reason\": \"reason_for_recommendation\", \"sector\": \"sector_of_stock3\", \"action\": \"buy\" or \"sell\"}] The input you will receive will come down to 3 main parts: - The first part is a json that gives you information about the article we are analysing - The second will be the article text - The third one will be a json of the sentiment over time of the main named entities in the article For the reason for each article base it mostly on the article text that I gave you, make sure you reason is under 30 words of explanation. Ensure that the stock tickers you recommend are actual stock tickers on ASX not some made up ones and that they have .AX at the end. Remember the output has to always be in this format [{\"symbol\": \"ticker1\", \"name\": \"name_of_stock\", \"reason\": \"reason_for_recommendation\", \"sector\": \"sector_of_stock1\", \"action\": \"buy\" or \"sell\"},{\"symbol\": \"ticker2\", \"name\": \"name_of_stock\", \"reason\": \"reason_for_recommendation\", \"sector\": \"sector_of_stock2\", \"action\": \"buy\" or \"sell\"},{\"symbol\": \"ticker3\", \"name\": \"name_of_stock\", \"reason\": \"reason_for_recommendation\", \"sector\": \"sector_of_stock3\", \"action\": \"buy\" or \"sell\"}]"
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ]
//     };
  
//     try {
//       const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer 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`
//         },
//         body: JSON.stringify(requestBody)
//       });
//       const data = await response.json();
//       if (response.ok) {
//         const lol = JSON.parse(data.choices[0].message.content);
//         console.log(lol);
//         setResponse(data.choices[0].message.content);
//       } else {
//         throw new Error(data.error);
//       }
//     } catch (error) {
//       console.error('Error calling OpenAI API:', error);
//       setResponse('Failed to fetch response');
//     }
//   };
  

//   return (
//     <div>
//       <h1>Ask GPT-3.5</h1>
//       <textarea
//         value={prompt}
//         onChange={handleInputChange}
//         placeholder="Enter your prompt"
//         rows={4}
//         cols={50}
//       />
//       <button onClick={handleSubmit}>Submit</button>
//       <h2>Response:</h2>
//       <p>{response}</p>
//     </div>
//   );
// };

// export default OpenAIComponent;