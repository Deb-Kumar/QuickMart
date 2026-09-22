import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { categories, products, promoCodes } from './src/data';
import { Order, OrderStatus } from './src/types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Lazy-initialized Gemini client
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Retry helper for transient Gemini API errors (503, 429)
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status || err?.httpStatusCode || err?.code;
      const isRetryable = status === 503 || status === 429 || 
        err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED') ||
        err?.message?.includes('high demand');
      
      if (isRetryable && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt) + Math.random() * 500;
        console.log(`⏳ Gemini API retry ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

// In-memory orders store (backed up by Firestore on client)
const orders: Order[] = [];

// Helper to simulate rider names and vehicles
const riders = [
  { name: "Rahul Sharma", phone: "+91 98765 43210", avatar: "🧑‍🦱", vehicle: "Electric SuperScooter ⚡ (Plate #DL-03-QM-702)", rating: 4.9 },
  { name: "Amit Kumar", phone: "+91 98123 45678", avatar: "🚴", vehicle: "Fast-Track Cargo EV 🚲 (Plate #KA-01-QM-418)", rating: 5.0 },
  { name: "Priya Patel", phone: "+91 97234 56789", avatar: "👩‍🦰", vehicle: "Eco Delivery EV 🛵 (Plate #MH-02-QM-991)", rating: 4.95 }
];

// Calculate dynamic order status based on elapsed time (for live simulation)
function computeOrderStatus(order: Order): OrderStatus {
  if (order.status === 'cancelled') return 'cancelled';
  const now = Date.now();
  const created = new Date(order.createdAt).getTime();
  const elapsedSeconds = Math.floor((now - created) / 1000);

  // 0 - 25s: Confirmed
  // 25 - 60s: Packing at Dark Store
  // 60 - 180s: Out for Delivery (Rider en route)
  // 180s+: Delivered
  if (elapsedSeconds < 25) {
    return 'confirmed';
  } else if (elapsedSeconds < 65) {
    return 'packing';
  } else if (elapsedSeconds < 160) {
    return 'out_for_delivery';
  } else {
    return 'delivered';
  }
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Categories with live count
app.get('/api/categories', (_req, res) => {
  const result = categories.map(cat => {
    const count = products.filter(p => p.category === cat.slug).length;
    return { ...cat, itemCount: count };
  });
  res.json(result);
});

// Products listing with filter, search, and sorting
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let list = [...products];

  if (category && category !== 'all') {
    list = list.filter(p => p.category === category);
  }

  if (typeof search === 'string' && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }

  if (sort === 'price_asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'time') {
    list.sort((a, b) => parseInt(a.time) - parseInt(b.time));
  }

  res.json(list);
});

// Single product
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Validate Promo Code
app.post('/api/promo/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Promo code is required' });
  }

  const promo = promoCodes.find(p => p.code.toUpperCase() === String(code).trim().toUpperCase());
  if (!promo) {
    return res.status(400).json({ valid: false, message: 'Invalid coupon code' });
  }

  if (subtotal < promo.minOrder) {
    return res.status(400).json({
      valid: false,
      message: `Minimum order amount of ₹${promo.minOrder} required for code ${promo.code}`
    });
  }

  let discountAmount = 0;
  if (promo.discountType === 'percentage') {
    discountAmount = (subtotal * promo.value) / 100;
    if (promo.code === 'SUPER50' && discountAmount > 150) {
      discountAmount = 150;
    }
  } else {
    discountAmount = promo.value;
  }

  res.json({
    valid: true,
    promo,
    discount: Math.min(discountAmount, subtotal),
    message: `Promo applied: ${promo.description}`
  });
});

// Checkout & Order Placement
app.post('/api/checkout', (req, res) => {
  const {
    items,
    address = 'Home - Flat 402, Sunshine Heights, Indiranagar, Bengaluru',
    paymentMethod = 'UPI (Google Pay / PhonePe)',
    deliveryInstructions = 'Leave at front door & ring bell',
    tip = 20,
    promoCode = ''
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const subtotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  
  let discount = 0;
  if (promoCode) {
    const promo = promoCodes.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
    if (promo && subtotal >= promo.minOrder) {
      discount = promo.discountType === 'percentage' 
        ? Math.min((subtotal * promo.value) / 100, promo.code === 'SUPER50' ? 150 : subtotal) 
        : promo.value;
    }
  }

  const deliveryFee = subtotal > 199 ? 0 : 25;
  const platformFee = 5;
  const total = Math.max(0, subtotal - discount + deliveryFee + platformFee + Number(tip));

  const randomRider = riders[Math.floor(Math.random() * riders.length)];
  const orderId = 'QM-' + Math.floor(100000 + Math.random() * 900000);

  const newOrder: Order = {
    id: orderId,
    items,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    deliveryFee,
    platformFee,
    tip: Number(tip),
    total: Number(total.toFixed(2)),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    etaMinutes: 10,
    elapsedSeconds: 0,
    address,
    paymentMethod,
    deliveryInstructions,
    promoCode: promoCode || undefined,
    rider: randomRider
  };

  orders.unshift(newOrder);

  res.json({
    success: true,
    order: newOrder,
    message: 'Order confirmed! Dark store picking initiated.'
  });
});

// Get all orders
app.get('/api/orders', (_req, res) => {
  const updatedOrders = orders.map(order => {
    const currentStatus = computeOrderStatus(order);
    const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
    return {
      ...order,
      status: currentStatus,
      elapsedSeconds: elapsed
    };
  });
  res.json(updatedOrders);
});

// Get single order status
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const currentStatus = computeOrderStatus(order);
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
  
  res.json({
    ...order,
    status: currentStatus,
    elapsedSeconds: elapsed
  });
});

// Cancel order
app.post('/api/orders/:id/cancel', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const currentStatus = computeOrderStatus(order);
  if (currentStatus === 'delivered' || currentStatus === 'out_for_delivery') {
    return res.status(400).json({ error: 'Cannot cancel order that is already out for delivery' });
  }

  order.status = 'cancelled';
  res.json({ success: true, message: 'Order cancelled successfully', order });
});

// AI Recipe & Meal Planner Endpoint
app.post('/api/ai/meal-planner', async (req, res) => {
  const { query: mealQuery, dietaryPreference = 'all' } = req.body;
  if (!mealQuery || typeof mealQuery !== 'string') {
    return res.status(400).json({ error: 'Meal query string is required' });
  }

  const catalogSummary = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    unit: p.unit
  }));

  try {
    const ai = getAIClient();
    if (!ai) {
      throw new Error('Gemini API client unavailable');
    }

    const prompt = `You are QuickMart's Master AI Chef and Grocery Planner.
A customer wants to make or buy ingredients for: "${mealQuery}".
Dietary Preference: ${dietaryPreference}.

Here is the current QuickMart grocery catalog available for 10-minute delivery:
${JSON.stringify(catalogSummary)}

Task:
1. Create a delicious, easy-to-cook recipe based on the customer request.
2. Select the EXACT matching product IDs from the provided catalog that are required for this recipe.
3. Provide quick cooking steps, prep time, serving size, and an estimated nutritional overview.
4. Keep the total ingredients practical and focused.

Return ONLY a JSON object with this structure:
{
  "recipeTitle": "string",
  "tagline": "string",
  "prepTime": "string (e.g., 15 mins)",
  "servings": 2,
  "difficulty": "Easy" | "Medium",
  "matchedProductIds": [number, number, ...],
  "pantryStaples": ["salt", "olive oil", ...],
  "instructions": ["Step 1...", "Step 2...", ...],
  "nutrition": {
    "calories": "420 kcal/serving",
    "protein": "18g",
    "carbs": "45g",
    "fat": "14g"
  },
  "chefTip": "string with a pro culinary tip"
}`;

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    
    // Enrich with actual product data
    const matchedProducts = (parsed.matchedProductIds || [])
      .map((id: number) => products.find(p => p.id === id))
      .filter(Boolean);

    const totalBundlePrice = matchedProducts.reduce((acc: number, p: any) => acc + p.price, 0);

    res.json({
      success: true,
      recipe: {
        ...parsed,
        products: matchedProducts,
        totalBundlePrice: Number(totalBundlePrice.toFixed(2))
      }
    });
  } catch (err: any) {
    console.warn('AI Meal planner error, using curated fallback:', err?.message);
    
    // Curated fallback matching query keywords
    const qLower = mealQuery.toLowerCase();
    let selectedProducts = products.filter(p => p.category === 'vegetables' || p.category === 'dairy').slice(0, 4);
    let title = "Fresh Mediterranean Bowl";
    let desc = "Crisp organic greens, ripe tomatoes, creamy Greek yogurt dressing and fresh aromatics.";

    if (qLower.includes('smoothie') || qLower.includes('fruit') || qLower.includes('breakfast')) {
      title = "Supercharged Berry & Banana Power Smoothie";
      desc = "Energy-packed blend with fresh bananas, apples, organic milk, and raw honey.";
      selectedProducts = products.filter(p => p.category === 'fruits' || p.category === 'dairy').slice(0, 4);
    } else if (qLower.includes('pasta') || qLower.includes('italian')) {
      title = "10-Minute Classic Tomato & Herb Pasta";
      desc = "Rich vine tomato sauce with garlic, herbs, and Parmesan cheese.";
      selectedProducts = products.filter(p => p.category === 'vegetables' || p.category === 'pantry').slice(0, 4);
    }

    const totalBundlePrice = selectedProducts.reduce((acc, p) => acc + p.price, 0);

    res.json({
      success: true,
      recipe: {
        recipeTitle: title,
        tagline: desc,
        prepTime: "12 mins",
        servings: 2,
        difficulty: "Easy",
        matchedProductIds: selectedProducts.map(p => p.id),
        products: selectedProducts,
        totalBundlePrice: Number(totalBundlePrice.toFixed(2)),
        pantryStaples: ["Olive oil", "Sea salt", "Black pepper"],
        instructions: [
          "Wash and slice fresh produce into bite-sized pieces.",
          "Lightly sauté aromatic vegetables on medium heat for 4-5 minutes.",
          "Combine fresh ingredients and season to taste with herbs and dressing.",
          "Serve fresh immediately with warm crusty bread."
        ],
        nutrition: {
          calories: "380 kcal/serving",
          protein: "14g",
          carbs: "42g",
          fat: "11g"
        },
        chefTip: "Toss greens right before serving to preserve optimum crispness!"
      }
    });
  }
});

// AI Smart Substitutions & Healthy Alternatives
app.post('/api/ai/substitute', async (req, res) => {
  const { productId, preference = 'healthy' } = req.body;
  const targetProduct = products.find(p => p.id === Number(productId));

  if (!targetProduct) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const catalogSummary = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    nutrition: p.nutrition
  }));

  try {
    const ai = getAIClient();
    if (!ai) throw new Error('AI client unavailable');

    const prompt = `A user is viewing the grocery item "${targetProduct.name}" (${targetProduct.category}, ₹${targetProduct.price}).
User requested replacement preference: "${preference}" (e.g. healthier, lower calorie, organic, vegan, or budget-friendly alternative).

Catalog items available:
${JSON.stringify(catalogSummary)}

Task:
Suggest 2-3 best alternative products from this catalog and explain why each is a great swap.

Return ONLY a JSON object:
{
  "explanation": "Short helpful 1-sentence intro",
  "suggestions": [
    {
      "productId": number,
      "reason": "Clear explanation of why this is a good alternative",
      "healthBenefit": "Key dietary advantage (e.g. 50% fewer calories, higher protein)"
    }
  ]
}`;

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    const enrichedSuggestions = (parsed.suggestions || []).map((s: any) => {
      const prod = products.find(p => p.id === s.productId);
      return prod ? { ...s, product: prod } : null;
    }).filter(Boolean);

    res.json({
      success: true,
      originalProduct: targetProduct,
      explanation: parsed.explanation || "Here are great alternatives tailored for you:",
      suggestions: enrichedSuggestions
    });
  } catch (err: any) {
    // Fallback: items in same or adjacent category
    const alternatives = products
      .filter(p => p.id !== targetProduct.id && (p.category === targetProduct.category || p.category === 'vegetables' || p.category === 'fruits'))
      .slice(0, 3)
      .map(p => ({
        productId: p.id,
        product: p,
        reason: `Great natural alternative with high nutritional value.`,
        healthBenefit: `Farm fresh and delivered in under 10 minutes.`
      }));

    res.json({
      success: true,
      originalProduct: targetProduct,
      explanation: "Here are popular alternatives in our catalog:",
      suggestions: alternatives
    });
  }
});

// AI QuickMart Concierge Assistant
app.post('/api/ai/assistant', async (req, res) => {
  const { message, cartItems = [] } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const catalogSummary = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    unit: p.unit
  }));

  try {
    const ai = getAIClient();
    if (!ai) throw new Error('AI client unavailable');

    const prompt = `You are "Chef Quicky", QuickMart's friendly, ultra-fast 10-minute grocery delivery concierge.
Customer message: "${message}"
Current Cart Items: ${JSON.stringify(cartItems.map((i: any) => `${i.name} (x${i.quantity})`))}

Available QuickMart Catalog:
${JSON.stringify(catalogSummary)}

Respond helpfully, warmly, concisely (under 3 sentences), and recommend 1 to 3 relevant product IDs from the catalog if applicable.

Return ONLY a JSON object:
{
  "reply": "Friendly response string",
  "suggestedProductIds": [number, ...],
  "quickActions": ["String chip 1", "String chip 2"]
}`;

    const response = await retryWithBackoff(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4
        }
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    const suggestedProducts = (parsed.suggestedProductIds || [])
      .map((id: number) => products.find(p => p.id === id))
      .filter(Boolean);

    res.json({
      success: true,
      reply: parsed.reply,
      suggestedProducts,
      quickActions: parsed.quickActions || []
    });
  } catch (err: any) {
    res.json({
      success: true,
      reply: "I'm Chef Quicky! I can help you find fresh groceries, suggest recipes, or assemble complete ingredient baskets in 10 seconds.",
      suggestedProducts: products.slice(0, 3),
      quickActions: ["Quick breakfast recipe", "Healthy snack picks", "Under ₹99 essentials"]
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, 'localhost', () => {
    console.log(`⚡ QuickMart server running at http://localhost:${PORT}`);
  });
}

startServer();
