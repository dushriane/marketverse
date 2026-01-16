import express from 'express';
import cors from 'cors';
import { VendorSchema, LoginSchema, Vendor } from '@marketverse/types';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Mock Database (In-Memory) ---
// In a real scenario, replace this with Supabase calls
const vendors: Vendor[] = [];

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

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
