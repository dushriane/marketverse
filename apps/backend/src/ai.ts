import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

// Initialize Gemini
// Using 'gemini-1.5-flash' for high availability. 
// Can be swapped to 'gemini-2.0-flash-exp' if available for Gemini 3 capabilities.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aiService = {
  checkAvailability: () => {
    if (!process.env.GEMINI_API_KEY) {
        // console.warn("GEMINI_API_KEY is not set."); 
        return false;
    }
    return true;
  },

  generateDescription: async (storeName: string, keywords: string) => {
    if (!aiService.checkAvailability()) {
        // Fallback Mock
        return `Welcome to ${storeName}! We offer great products related to ${keywords}.`;
    }

    try {
        const prompt = `Write a short description for a store named "${storeName}". Keywords: ${keywords}. Under 50 words.`;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI Error:", error);
        return `Welcome to ${storeName}!`;
    }
  },

  suggestCategories: async (name: string, description: string) => {
    if (!aiService.checkAvailability()) return ['New Arrivals', 'General'];

    try {
        const prompt = `Suggest 5 categories for store "${name}" (${description}). 
        Return ONLY comma-separated list.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text.split(',').map(s => s.trim().replace(/\.$/, ''));
    } catch (error) {
        return ['General'];
    }
  },

  generateDailySummary: async (products: any[]) => {
    if (!aiService.checkAvailability()) return "Come check out our fresh stock!";

    try {
        const names = products.slice(0, 5).map(p => p.name).join(', ');
        const prompt = `Write a daily update for a store with new items: ${names}. Max 200 chars. Use emojis.`;
        
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return "New items in stock! Visit us today.";
    }
  },

  getTrendingProducts: async (category: string) => {
    if (!aiService.checkAvailability()) return [`Trending ${category}`, `Top ${category}`];

    try {
        const prompt = `List 5 trending products for category "${category}". Return JSON array of strings only.`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (error) {
        return [`${category} Special`];
    }
  },

  generateMarketData: async (marketName: string, location: string) => {
    if (!aiService.checkAvailability()) {
        console.warn("AI unavailable, returning mock market data.");
        // Fallback or Empty
        return [];
    }
    
    try {
        const prompt = `
        Generate a realistic list of 6 distinct vendors for ${marketName} in ${location}.
        Return a strictly valid JSON array (no markdown code blocks, just the raw array).
        Each object in the array should have fields:
        - "storeName" (string)
        - "description" (string, max 20 words)
        - "ownerName" (string, local name)
        - "category" (one of: Vegetables, Fruits, Crafts, Clothing, Electronics, Services, Other)
        - "products" (array of 3 objects with "name", "description", "price" (number in RWF))
        `;
        
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        return JSON.parse(text);
    } catch (error) {
        console.error("Failed to generate market data:", error);
        return [];
    }
  }
};
