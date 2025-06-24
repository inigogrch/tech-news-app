import { ToolInvocation, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

// Mock function to simulate tech news search
function searchTechNews({ query, category }: { query: string; category?: string }) {
  const mockNews = [
    {
      title: "AI Revolution Continues: New Breakthrough in Machine Learning",
      summary: "Researchers announce significant advances in neural network efficiency",
      category: "AI",
      date: "2024-01-15"
    },
    {
      title: "Apple Announces New Product Line",
      summary: "Company reveals latest innovations in consumer technology",
      category: "Apple",
      date: "2024-01-14"
    },
    {
      title: "Startup Funding Reaches New Heights",
      summary: "Tech startups secure record-breaking investment rounds",
      category: "Startups",
      date: "2024-01-13"
    }
  ];
  
  return mockNews.filter(news => 
    news.title.toLowerCase().includes(query.toLowerCase()) ||
    news.summary.toLowerCase().includes(query.toLowerCase()) ||
    (category && news.category.toLowerCase() === category.toLowerCase())
  );
}

// Mock function to get trending topics
function getTrendingTopics() {
  return [
    "Artificial Intelligence",
    "Machine Learning",
    "Blockchain Technology",
    "Quantum Computing",
    "5G Networks",
    "Cybersecurity"
  ];
}

// Mock function to analyze sentiment
function analyzeSentiment({ text }: { text: string }) {
  const positiveWords = ['breakthrough', 'innovation', 'success', 'growth', 'advance'];
  const negativeWords = ['failure', 'decline', 'problem', 'issue', 'concern'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are a helpful AI assistant specialized in technology news and analysis. You can search for tech news, get trending topics, and analyze sentiment. Use the available tools to provide comprehensive and up-to-date information.',
    messages,
    maxSteps: 5,
    tools: {
      searchTechNews: {
        description: 'Search for technology news articles based on a query and optional category',
        parameters: z.object({
          query: z.string().describe('The search query for tech news'),
          category: z.string().optional().describe('Optional category filter (e.g., AI, Apple, Startups)')
        }),
        execute: async ({ query, category }) => {
          const news = searchTechNews({ query, category });
          return `Found ${news.length} tech news articles:\n\n${news.map(article => 
            `**${article.title}**\n${article.summary}\nCategory: ${article.category} | Date: ${article.date}`
          ).join('\n\n')}`;
        },
      },
      getTrendingTopics: {
        description: 'Get current trending topics in technology',
        parameters: z.object({}),
        execute: async () => {
          const topics = getTrendingTopics();
          return `Current trending tech topics:\n${topics.map((topic, index) => `${index + 1}. ${topic}`).join('\n')}`;
        },
      },
      analyzeSentiment: {
        description: 'Analyze the sentiment of a given text',
        parameters: z.object({
          text: z.string().describe('The text to analyze for sentiment')
        }),
        execute: async ({ text }) => {
          const sentiment = analyzeSentiment({ text });
          return `Sentiment analysis result: **${sentiment}**\n\nThe text appears to have a ${sentiment} tone based on the language used.`;
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
