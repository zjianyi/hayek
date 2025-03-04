import axios from 'axios';

// OpenAI API endpoint
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Get API key from environment variables
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const streamGptResponse = async (text, images = [], onChunk) => {
  // Convert images to base64 if needed
  const imagePromises = images.map(image => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(image);
    });
  });

  const imageBase64 = await Promise.all(imagePromises);
  
  // Prepare messages array for OpenAI API
  const messages = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: text }
  ];

  // Add images if present
  if (images.length > 0) {
    // For OpenAI's vision model, we need to format the content as an array
    // with text and image URLs
    messages[1].content = [
      { type: "text", text },
      ...imageBase64.map(image => ({
        type: "image_url",
        image_url: {
          url: image
        }
      }))
    ];
  }

  try {
    // Check if API key is available
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is missing. Please add it to your .env file.');
    }

    // Set up fetch for streaming
    const controller = new AbortController();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: images.length > 0 ? "gpt-4-vision-preview" : "gpt-3.5-turbo",
        messages,
        stream: true,
        max_tokens: 1000
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode the chunk
      const chunk = decoder.decode(value);
      
      // Process the SSE format
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          // Check for the [DONE] message
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error in API call:', error);
    throw error;
  }
};

// For testing purposes, you can use this mock function instead
export const mockStreamGptResponse = async (text, images = [], onChunk) => {
  const mockResponse = `I received your message: "${text}"${images.length > 0 ? ' with ' + images.length + ' images.' : '.'}

Here's a sample of LaTeX rendering: $E = mc^2$ and a block equation:

$$
\\frac{d}{dx}\\left( \\int_{a}^{x} f(t) \\, dt \\right) = f(x)
$$

And here's some code:

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
  return 42;
}
\`\`\`

Hope that helps!`;

  // Simulate streaming by sending one character at a time
  for (let i = 0; i < mockResponse.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 10));
    onChunk(mockResponse[i]);
  }

  return mockResponse;
};

// Comment this line and uncomment the line below to use the real OpenAI API
export { mockStreamGptResponse as streamGptResponse };
// export { streamGptResponse }; 