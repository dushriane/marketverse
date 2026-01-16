import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { VendorSchema, LoginSchema, ProductSchema, Vendor, Product, GenerateDescriptionSchema } from '@marketverse/types';

const app = express();
const port = process.env.PORT || 3000;

// Setup Multer (InMemory for simplicity, real app would use DiskStorage or Stream to storage)
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images

// --- Mock Database (In-Memory) ---
const vendors: Vendor[] = [];
const products: Product[] = [];

// --- Routes ---

// 1. Login/Check Vendor existence
// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  
  const { phoneNumber } = result.data;
  const vendor = vendors.find(v => v.phoneNumber === phoneNumber);
  
  if (vendor) {
    return res.json({ exists: true, vendor });
  } else {
    return res.json({ exists: false });
  }
});

// 2. Register / Onboarding
// POST /api/vendors
app.post('/api/vendors', (req, res) => {
  const result = VendorSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const newVendor = { ...result.data, id: Date.now().toString() };
  
  // Check duplicates
  if (vendors.find(v => v.phoneNumber === newVendor.phoneNumber)) {
    return res.status(409).json({ error: "Vendor with this phone number already exists" });
  }

  vendors.push(newVendor);
  return res.status(201).json(newVendor);
});

// 3. Get Vendor Profile
// GET /api/vendors/:id
app.get('/api/vendors/:id', (req, res) => {
  const vendor = vendors.find(v => v.id === req.params.id);
  if (!vendor) return res.status(404).json({ error: "Vendor not found" });
  res.json(vendor);
});

// 4. Update Vendor Profile
// PUT /api/vendors/:id
app.put('/api/vendors/:id', (req, res) => {
  const index = vendors.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Vendor not found" });

  // Merge updates
  const updatedVendor = { ...vendors[index], ...req.body };
  
  // Validate
  const result = VendorSchema.safeParse(updatedVendor);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  vendors[index] = result.data;
  res.json(vendors[index]);
});

// --- Product Routes ---

// 5. Create Product
app.post('/api/products', (req, res) => {
  const result = ProductSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const newProduct = { ...result.data, id: Date.now().toString() };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// 6. List Products (by Vendor)
app.get('/api/vendors/:vendorId/products', (req, res) => {
  const vendorProducts = products.filter(p => p.vendorId === req.params.vendorId);
  res.json(vendorProducts);
});

// 7. Update Product
app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });

  const updatedProduct = { ...products[index], ...req.body };
  
  const result = ProductSchema.safeParse(updatedProduct);
  if (!result.success) return res.status(400).json({ error: result.error });

  products[index] = result.data;
  res.json(products[index]);
});

// 8. Delete Product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Product not found" });
  products.splice(index, 1);
  res.json({ success: true });
});

// 9. Bulk Update Availability
app.post('/api/products/bulk-availability', (req, res) => {
  const { vendorId, status } = req.body;
  if (!vendorId || !status) return res.status(400).json({ error: "Missing vendorId or status" });

  let count = 0;
  products.forEach(p => {
    if (p.vendorId === vendorId) {
      p.status = status;
      count++;
    }
  });

  res.json({ message: `Updated ${count} products to ${status}` });
});

// 10. Image Upload (Mock to memory/base64 echo or placeholder)
// In production: Upload to Supabase Storage -> Get URL -> Return URL
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  // For this demo, we'll return a Base64 data URL so it works without cloud storage
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const mime = req.file.mimetype;
  const url = `data:${mime};base64,${b64}`;

  // In real app: const { data } = await supabase.storage.from('products').upload(...)
  
  res.json({ url });
});

// 11. AI Description Generation (Mock)
app.post('/api/ai/generate-description', (req, res) => {
  // In real app: Call Gemini API with req.body.imageBase64
  // const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  // ...
  
  const { category } = req.body;
  
  // Simulating AI delay
  setTimeout(() => {
    res.json({ 
      description: `[AI Generated] Fresh and high-quality ${category || 'product'} sourced directly from local producers. Perfect for your daily needs.` 
    });
  }, 1000); 
});


app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
