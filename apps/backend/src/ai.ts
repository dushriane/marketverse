// Mock AI Service - In a real app, this would call OpenAI or Google Gemini
export const aiService = {
  generateDescription: async (storeName: string, keywords: string) => {
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const adjectives = ['vibrant', 'authentic', 'fresh', 'busting', 'premium', 'hand-picked'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    return `Welcome to ${storeName}, your source for ${adj} goods! We pride ourselves on offering the best quality items, selected just for you. ${keywords ? `Specializing in ${keywords}.` : ''} Come visit us and experience the difference!`;
  },

  suggestCategories: async (name: string, description: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple keyword matching simulation
    const text = (name + ' ' + description).toLowerCase();
    const suggestions = [];
    
    if (text.match(/apple|banana|fruit|orange/)) suggestions.push('Fruits');
    if (text.match(/carrot|potato|veg|onion/)) suggestions.push('Vegetables');
    if (text.match(/bread|cake|pastry/)) suggestions.push('Bakery');
    if (text.match(/shirt|dress|cloth/)) suggestions.push('Clothing');
    if (text.match(/necklace|ring|jewelry/)) suggestions.push('Accessories');
    
    if (suggestions.length === 0) suggestions.push('General', 'New Arrivals');
    
    return suggestions;
  },

  generateDailySummary: async (products: any[]) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (products.length === 0) return "Check out our stall for exciting updates coming soon!";
    
    const newItems = products.slice(0, 3).map(p => p.name).join(', ');
    return `📢 What's New Today! \n\nWe've just restocked some amazing items: ${newItems} and more! \n\n🔥 Best prices in the market. \n📍 Visit us now before they're gone! #MarketVerse #FreshStock`;
  },

  getTrendingProducts: async (category: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const trends: Record<string, string[]> = {
        'Fruits': ['Organic Honeycrisp Apples', 'Exotic Dragonfruit', 'Seasoned Berries'],
        'Vegetables': ['Kale Bundles', 'Rainbow Carrots', 'Heirloom Tomatoes'],
        'Bakery': ['Sourdough Loaves', 'Gluten-Free Muffins', 'Artisan Croissants'],
        'Clothing': ['Vintage Denim', 'Hand-knitted Scarves', 'Summer Linens'],
        'Accessories': ['Beaded Necklaces', 'Silver Rings', 'Canvas Totes']
    };
    
    return trends[category] || ['Local Favorites', 'Best Sellers', 'Seasonal Picks'];
  }
};
