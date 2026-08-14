import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || '';
let useMongo = !!MONGODB_URI;

// JSON File Database Configuration
const JSON_DB_DIR = path.join(process.cwd(), 'data');
const JSON_DB_PATH = path.join(JSON_DB_DIR, 'db.json');

// Initialize local JSON DB if not present
function initJsonDb() {
  if (!useMongo) {
    if (!fs.existsSync(JSON_DB_DIR)) {
      fs.mkdirSync(JSON_DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(JSON_DB_PATH)) {
      fs.writeFileSync(
        JSON_DB_PATH,
        JSON.stringify({
          categories: [],
          materials: [],
          customers: [],
          projects: [],
          projectMaterials: [],
        }, null, 2)
      );
    }
  }
}

// Read local JSON DB
function readJsonDb() {
  initJsonDb();
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON DB, resetting:', error);
    const emptyDb = {
      categories: [],
      materials: [],
      customers: [],
      projects: [],
      projectMaterials: [],
    };
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(emptyDb, null, 2));
    return emptyDb;
  }
}

// Write local JSON DB
function writeJsonDb(data) {
  initJsonDb();
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
}

// Generate Simple ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// MONGODB SCHEMAS & MODELS
const CategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true },
});

const MaterialSchema = new mongoose.Schema({
  materialName: { type: String, required: true },
  category: { type: String, enum: ['Sheet', 'Pipe', 'Purchased'], default: 'Sheet' },
  grade: { type: String, default: 'SS304' },
  unit: { type: String, default: 'kg' },
  price: { type: Number, default: 0 },
  description: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  dimensions: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

const CustomerSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  companyName: { type: String },
  counterType: { type: String },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ProjectSchema = new mongoose.Schema({
  estimateNumber: { type: String },
  projectName: { type: String, required: true },
  customerId: { type: String },
  customerName: { type: String },
  companyName: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  counterType: { type: String, required: true },
  date: { type: Date, default: Date.now },
  remarks: { type: String },
  
  // Material breakdown
  sheets: [{ type: mongoose.Schema.Types.Mixed }],
  pipes: [{ type: mongoose.Schema.Types.Mixed }],
  purchased: [{ type: mongoose.Schema.Types.Mixed }],
  
  // Pricing inputs
  materialRate: { type: Number, default: 0 },
  labourCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 18 },
  
  // Calculated outcomes
  totalMaterialWeight: { type: Number, default: 0 },
  materialCost: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  taxableAmount: { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
});

// Cache mongoose models
let Category, Material, Customer, Project;
if (useMongo) {
  Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);
  Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
  Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
}

// Cache MongoDB connection state
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectMongo() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const opts = { bufferCommands: false, serverSelectionTimeoutMS: 5000 };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB, falling back to JSON DB:', e.message);
    useMongo = false;
    initJsonDb();
  }
}

export async function connectDB() {
  if (useMongo) {
    await connectMongo();
  } else {
    initJsonDb();
  }
}

// CATEGORY REPOSITORY
export async function getCategories() {
  await connectDB();
  if (useMongo) {
    return await Category.find({}).lean();
  } else {
    const db = readJsonDb();
    return db.categories || [];
  }
}

export async function createCategory(data) {
  await connectDB();
  if (useMongo) {
    const category = new Category(data);
    await category.save();
    return category.toObject();
  } else {
    const db = readJsonDb();
    const newCategory = { _id: generateId(), ...data };
    db.categories.push(newCategory);
    writeJsonDb(db);
    return newCategory;
  }
}

// MATERIAL REPOSITORY (STAINLESS STEEL ONLY)
export async function getMaterials() {
  await connectDB();
  if (useMongo) {
    return await Material.find({}).lean();
  } else {
    const db = readJsonDb();
    return db.materials || [];
  }
}

export async function createMaterial(data) {
  await connectDB();
  if (useMongo) {
    const material = new Material(data);
    await material.save();
    return material.toObject();
  } else {
    const db = readJsonDb();
    const newMaterial = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'Active',
      grade: data.grade || 'SS304',
      ...data,
      price: Number(data.price || 0),
    };
    db.materials = db.materials || [];
    db.materials.push(newMaterial);
    writeJsonDb(db);
    return newMaterial;
  }
}

export async function updateMaterial(id, data) {
  await connectDB();
  if (useMongo) {
    return await Material.findByIdAndUpdate(id, data, { new: true }).lean();
  } else {
    const db = readJsonDb();
    const index = (db.materials || []).findIndex((m) => m._id === id);
    if (index === -1) return null;
    db.materials[index] = {
      ...db.materials[index],
      ...data,
      price: data.price !== undefined ? Number(data.price) : db.materials[index].price,
    };
    writeJsonDb(db);
    return db.materials[index];
  }
}

export async function deleteMaterial(id) {
  await connectDB();
  if (useMongo) {
    return await Material.findByIdAndDelete(id).lean();
  } else {
    const db = readJsonDb();
    const index = (db.materials || []).findIndex((m) => m._id === id);
    if (index === -1) return null;
    const deleted = db.materials.splice(index, 1)[0];
    writeJsonDb(db);
    return deleted;
  }
}

// CUSTOMER REPOSITORY
export async function getCustomers() {
  await connectDB();
  if (useMongo) {
    return await Customer.find({}).lean();
  } else {
    const db = readJsonDb();
    return db.customers || [];
  }
}

export async function createCustomer(data) {
  await connectDB();
  if (useMongo) {
    const customer = new Customer(data);
    await customer.save();
    return customer.toObject();
  } else {
    const db = readJsonDb();
    const newCustomer = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      ...data
    };
    db.customers = db.customers || [];
    db.customers.push(newCustomer);
    writeJsonDb(db);
    return newCustomer;
  }
}

export async function updateCustomer(id, data) {
  await connectDB();
  if (useMongo) {
    return await Customer.findByIdAndUpdate(id, data, { new: true }).lean();
  } else {
    const db = readJsonDb();
    const index = (db.customers || []).findIndex((c) => c._id === id);
    if (index === -1) return null;
    db.customers[index] = { ...db.customers[index], ...data };
    writeJsonDb(db);
    return db.customers[index];
  }
}

export async function deleteCustomer(id) {
  await connectDB();
  if (useMongo) {
    return await Customer.findByIdAndDelete(id).lean();
  } else {
    const db = readJsonDb();
    const index = (db.customers || []).findIndex((c) => c._id === id);
    if (index === -1) return null;
    const deleted = db.customers.splice(index, 1)[0];
    writeJsonDb(db);
    return deleted;
  }
}

// PROJECTS / ESTIMATIONS REPOSITORY
export async function getProjects() {
  await connectDB();
  if (useMongo) {
    return await Project.find({}).lean();
  } else {
    const db = readJsonDb();
    return db.projects || [];
  }
}

export async function getProjectById(id) {
  await connectDB();
  if (useMongo) {
    return await Project.findById(id).lean();
  } else {
    const db = readJsonDb();
    const project = (db.projects || []).find((p) => p._id === id);
    return project || null;
  }
}

export async function createProject(projectData, materialsList = []) {
  await connectDB();
  
  // Format estimate number if not provided
  const estimateNumber = projectData.estimateNumber || `EST-${Date.now().toString().slice(-6)}`;
  
  // Ensure structured materials are stored
  const sheets = projectData.sheets || [];
  const pipes = projectData.pipes || [];
  const purchased = projectData.purchased || [];

  const record = {
    estimateNumber,
    projectName: projectData.projectName,
    customerId: projectData.customerId || '',
    customerName: projectData.customerName || '',
    companyName: projectData.companyName || '',
    phone: projectData.phone || '',
    email: projectData.email || '',
    address: projectData.address || '',
    counterType: projectData.counterType,
    date: projectData.date || new Date().toISOString(),
    remarks: projectData.remarks || '',
    sheets,
    pipes,
    purchased,
    materialRate: Number(projectData.materialRate || 0),
    labourCost: Number(projectData.labourCost || 0),
    discount: Number(projectData.discount || 0),
    gst: Number(projectData.gst !== undefined ? projectData.gst : 18),
    totalMaterialWeight: Number(projectData.totalMaterialWeight || 0),
    materialCost: Number(projectData.materialCost || 0),
    subtotal: Number(projectData.subtotal || 0),
    taxableAmount: Number(projectData.taxableAmount || 0),
    gstAmount: Number(projectData.gstAmount || 0),
    totalAmount: Number(projectData.totalAmount || projectData.grandTotal || 0),
    status: projectData.status || 'Active'
  };

  if (useMongo) {
    const project = new Project(record);
    await project.save();
    return project.toObject();
  } else {
    const db = readJsonDb();
    const newProject = {
      _id: generateId(),
      ...record
    };
    db.projects = db.projects || [];
    db.projects.push(newProject);
    writeJsonDb(db);
    return newProject;
  }
}

export async function updateProject(id, projectData, materialsList = []) {
  await connectDB();
  
  const sheets = projectData.sheets || [];
  const pipes = projectData.pipes || [];
  const purchased = projectData.purchased || [];

  const updateFields = {
    estimateNumber: projectData.estimateNumber,
    projectName: projectData.projectName,
    customerId: projectData.customerId,
    customerName: projectData.customerName,
    companyName: projectData.companyName,
    phone: projectData.phone,
    email: projectData.email,
    address: projectData.address,
    counterType: projectData.counterType,
    date: projectData.date,
    remarks: projectData.remarks || '',
    sheets,
    pipes,
    purchased,
    materialRate: Number(projectData.materialRate || 0),
    labourCost: Number(projectData.labourCost || 0),
    discount: Number(projectData.discount || 0),
    gst: Number(projectData.gst !== undefined ? projectData.gst : 18),
    totalMaterialWeight: Number(projectData.totalMaterialWeight || 0),
    materialCost: Number(projectData.materialCost || 0),
    subtotal: Number(projectData.subtotal || 0),
    taxableAmount: Number(projectData.taxableAmount || 0),
    gstAmount: Number(projectData.gstAmount || 0),
    totalAmount: Number(projectData.totalAmount || projectData.grandTotal || 0),
    status: projectData.status || 'Active'
  };

  if (useMongo) {
    const updated = await Project.findByIdAndUpdate(id, updateFields, { new: true }).lean();
    return updated;
  } else {
    const db = readJsonDb();
    const index = (db.projects || []).findIndex((p) => p._id === id);
    if (index === -1) return null;

    db.projects[index] = {
      ...db.projects[index],
      ...updateFields
    };
    writeJsonDb(db);
    return db.projects[index];
  }
}

export async function deleteProject(id) {
  await connectDB();
  if (useMongo) {
    return await Project.findByIdAndDelete(id).lean();
  } else {
    const db = readJsonDb();
    const index = (db.projects || []).findIndex((p) => p._id === id);
    if (index === -1) return null;

    const deleted = db.projects.splice(index, 1)[0];
    writeJsonDb(db);
    return deleted;
  }
}
