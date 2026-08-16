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
          counterTypes: [],
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
    const parsed = JSON.parse(data);
    if (!parsed.counterTypes) parsed.counterTypes = [];
    return parsed;
  } catch (error) {
    console.error('Error reading JSON DB, resetting:', error);
    const emptyDb = {
      categories: [],
      materials: [],
      counterTypes: [],
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

const CounterTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  category: { type: String, default: 'Kitchen Equipment' },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MaterialSchema = new mongoose.Schema({
  materialName: { type: String, required: true },
  category: { type: String, default: 'Sheet' },
  calculationType: { type: String, default: 'Sheet' },
  materialType: { type: String },
  grade: { type: String, default: '304' },
  gauge: { type: mongoose.Schema.Types.Mixed },
  gaugeOptions: [{ type: mongoose.Schema.Types.Mixed }],
  pipeSize: { type: String },
  dropdownOptions: [{ type: String }],
  allowMultiple: { type: Boolean, default: false },
  defaultUnitWeight: { type: Number, default: null },
  allowCustomUnitWeight: { type: Boolean, default: false },
  counterTypes: [{ type: String }],
  subTypes: [{ type: String }],
  order: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' },
  price: { type: Number, default: 0 },
  description: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  dimensions: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
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
let Category, CounterType, Material, Customer, Project;
if (useMongo) {
  Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  CounterType = mongoose.models.CounterType || mongoose.model('CounterType', CounterTypeSchema);
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

// COUNTER TYPES REPOSITORY
export async function getCounterTypes() {
  await connectDB();
  if (useMongo) {
    return await CounterType.find({}).sort({ order: 1, name: 1 }).lean();
  } else {
    const db = readJsonDb();
    const list = db.counterTypes || [];
    return list.sort((a, b) => (a.order || 0) - (b.order || 0) || (a.name || '').localeCompare(b.name || ''));
  }
}

export async function createCounterType(data) {
  await connectDB();
  const record = {
    name: data.name ? data.name.trim() : '',
    description: data.description ? data.description.trim() : '',
    category: data.category || 'Kitchen Equipment',
    order: Number(data.order || 0),
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (useMongo) {
    const ct = new CounterType(record);
    await ct.save();
    return ct.toObject();
  } else {
    const db = readJsonDb();
    db.counterTypes = db.counterTypes || [];
    const exists = db.counterTypes.some(c => c.name.toLowerCase() === record.name.toLowerCase());
    if (exists) {
      throw new Error(`Counter Type "${record.name}" already exists.`);
    }
    const newCt = { _id: generateId(), ...record };
    db.counterTypes.push(newCt);
    writeJsonDb(db);
    return newCt;
  }
}

export async function updateCounterType(id, data) {
  await connectDB();
  const db = readJsonDb();
  
  // Fetch existing name to handle cascading rename on materials
  let oldName = null;
  if (useMongo) {
    const existing = await CounterType.findById(id).lean();
    if (existing) oldName = existing.name;
  } else {
    const existing = (db.counterTypes || []).find(c => c._id === id);
    if (existing) oldName = existing.name;
  }

  const updateFields = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  if (data.name) updateFields.name = data.name.trim();

  let updated;
  if (useMongo) {
    updated = await CounterType.findByIdAndUpdate(id, updateFields, { new: true }).lean();
  } else {
    const index = (db.counterTypes || []).findIndex(c => c._id === id);
    if (index === -1) return null;
    db.counterTypes[index] = { ...db.counterTypes[index], ...updateFields };
    writeJsonDb(db);
    updated = db.counterTypes[index];
  }

  // Cascading rename in Materials if counter type name changed
  if (oldName && updateFields.name && oldName !== updateFields.name) {
    await cascadeRenameCounterTypeInMaterials(oldName, updateFields.name);
  }

  return updated;
}

export async function deleteCounterType(id) {
  await connectDB();
  let deletedName = null;

  if (useMongo) {
    const existing = await CounterType.findById(id).lean();
    if (existing) {
      deletedName = existing.name;
      await CounterType.findByIdAndDelete(id);
    }
  } else {
    const db = readJsonDb();
    const index = (db.counterTypes || []).findIndex(c => c._id === id);
    if (index !== -1) {
      deletedName = db.counterTypes[index].name;
      db.counterTypes.splice(index, 1);
      writeJsonDb(db);
    }
  }

  // Remove counter type name from all materials
  if (deletedName) {
    await unassignCounterTypeFromAllMaterials(deletedName);
  }

  return { success: true, deletedName };
}

// Cascading helper: rename in materials
async function cascadeRenameCounterTypeInMaterials(oldName, newName) {
  if (useMongo) {
    await Material.updateMany(
      { counterTypes: oldName },
      { $set: { "counterTypes.$": newName } }
    );
  } else {
    const db = readJsonDb();
    let changed = false;
    (db.materials || []).forEach(m => {
      if (Array.isArray(m.counterTypes) && m.counterTypes.includes(oldName)) {
        m.counterTypes = m.counterTypes.map(ct => ct === oldName ? newName : ct);
        changed = true;
      }
    });
    if (changed) writeJsonDb(db);
  }
}

// Cascading helper: remove from materials
async function unassignCounterTypeFromAllMaterials(counterTypeName) {
  if (useMongo) {
    await Material.updateMany(
      { counterTypes: counterTypeName },
      { $pull: { counterTypes: counterTypeName } }
    );
  } else {
    const db = readJsonDb();
    let changed = false;
    (db.materials || []).forEach(m => {
      if (Array.isArray(m.counterTypes) && m.counterTypes.includes(counterTypeName)) {
        m.counterTypes = m.counterTypes.filter(ct => ct !== counterTypeName);
        changed = true;
      }
    });
    if (changed) writeJsonDb(db);
  }
}

// Assign or unassign materials to a specific Counter Type
export async function assignMaterialsToCounterType(counterTypeName, materialIdsToAdd = [], materialIdsToRemove = []) {
  await connectDB();
  if (useMongo) {
    if (materialIdsToAdd.length > 0) {
      await Material.updateMany(
        { _id: { $in: materialIdsToAdd } },
        { $addToSet: { counterTypes: counterTypeName } }
      );
    }
    if (materialIdsToRemove.length > 0) {
      await Material.updateMany(
        { _id: { $in: materialIdsToRemove } },
        { $pull: { counterTypes: counterTypeName } }
      );
    }
  } else {
    const db = readJsonDb();
    (db.materials || []).forEach(m => {
      if (!Array.isArray(m.counterTypes)) m.counterTypes = [];
      if (materialIdsToAdd.includes(m._id) && !m.counterTypes.includes(counterTypeName)) {
        m.counterTypes.push(counterTypeName);
      }
      if (materialIdsToRemove.includes(m._id) && m.counterTypes.includes(counterTypeName)) {
        m.counterTypes = m.counterTypes.filter(ct => ct !== counterTypeName);
      }
    });
    writeJsonDb(db);
  }
  return true;
}

// MATERIAL REPOSITORY (STAINLESS STEEL & MASTER PRODUCTS)
export async function getMaterials(filter = {}) {
  await connectDB();
  if (useMongo) {
    const query = {};
    if (filter.counterType) {
      query.counterTypes = filter.counterType;
    }
    if (filter.category) {
      query.category = filter.category;
    }
    return await Material.find(query).sort({ order: 1, createdAt: 1 }).lean();
  } else {
    const db = readJsonDb();
    let list = db.materials || [];
    if (filter.counterType) {
      list = list.filter(m => Array.isArray(m.counterTypes) && m.counterTypes.includes(filter.counterType));
    }
    if (filter.category) {
      list = list.filter(m => (m.category || '').toLowerCase() === filter.category.toLowerCase());
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export async function createMaterial(data) {
  await connectDB();
  
  const rawCat = data.category ? String(data.category).trim() : 'Sheet';
  const categoryEnum = ['Sheet', 'Pipe', 'Angle', 'Purchased', 'Compressor', 'Special'].find(
    c => c.toLowerCase() === rawCat.toLowerCase()
  ) || (rawCat.charAt(0).toUpperCase() + rawCat.slice(1));
  
  const record = {
    materialName: data.materialName,
    category: categoryEnum,
    calculationType: data.calculationType || (categoryEnum === 'Compressor' ? 'Purchased' : categoryEnum),
    materialType: data.materialType || '',
    grade: data.grade ? String(data.grade).replace(/^SS/i, '') : '304',
    gauge: data.gauge !== undefined ? data.gauge : '',
    gaugeOptions: Array.isArray(data.gaugeOptions) ? data.gaugeOptions : null,
    pipeSize: data.pipeSize || '',
    dropdownOptions: Array.isArray(data.dropdownOptions) ? data.dropdownOptions : (data.options || null),
    allowMultiple: Boolean(data.allowMultiple),
    defaultUnitWeight: data.defaultUnitWeight !== undefined && data.defaultUnitWeight !== '' && data.defaultUnitWeight !== null 
      ? Number(data.defaultUnitWeight) 
      : null,
    allowCustomUnitWeight: Boolean(data.allowCustomUnitWeight),
    counterTypes: Array.isArray(data.counterTypes) ? data.counterTypes : (data.counterType ? [data.counterType] : []),
    subTypes: Array.isArray(data.subTypes) ? data.subTypes : [],
    order: Number(data.order || 0),
    unit: data.unit || ((categoryEnum === 'Purchased' || categoryEnum === 'Compressor') ? 'Piece' : 'kg'),
    price: Number(data.price || 0),
    description: data.description || '',
    status: data.status || 'Active',
    dimensions: data.dimensions || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (useMongo) {
    const material = new Material(record);
    await material.save();
    return material.toObject();
  } else {
    const db = readJsonDb();
    const newMaterial = {
      _id: generateId(),
      ...record
    };
    db.materials = db.materials || [];
    db.materials.push(newMaterial);
    writeJsonDb(db);
    return newMaterial;
  }
}

export async function updateMaterial(id, data) {
  await connectDB();
  
  const updateData = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  if (data.price !== undefined) {
    updateData.price = Number(data.price);
  }
  if (data.defaultUnitWeight !== undefined) {
    updateData.defaultUnitWeight = data.defaultUnitWeight !== '' && data.defaultUnitWeight !== null 
      ? Number(data.defaultUnitWeight) 
      : null;
  }
  if (data.allowCustomUnitWeight !== undefined) {
    updateData.allowCustomUnitWeight = Boolean(data.allowCustomUnitWeight);
  }
  if (data.allowMultiple !== undefined) {
    updateData.allowMultiple = Boolean(data.allowMultiple);
  }
  if (data.order !== undefined) {
    updateData.order = Number(data.order);
  }
  if (data.grade !== undefined) {
    updateData.grade = String(data.grade).replace(/^SS/i, '');
  }
  if (data.category) {
    const rawCat = String(data.category).trim();
    updateData.category = ['Sheet', 'Pipe', 'Angle', 'Purchased', 'Compressor', 'Special'].find(
      c => c.toLowerCase() === rawCat.toLowerCase()
    ) || (rawCat.charAt(0).toUpperCase() + rawCat.slice(1));
  }

  if (useMongo) {
    return await Material.findByIdAndUpdate(id, updateData, { new: true }).lean();
  } else {
    const db = readJsonDb();
    const index = (db.materials || []).findIndex((m) => m._id === id);
    if (index === -1) return null;
    db.materials[index] = {
      ...db.materials[index],
      ...updateData,
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
    return await Project.find({}).sort({ date: -1, createdAt: -1 }).lean();
  } else {
    const db = readJsonDb();
    return (db.projects || []).sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
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
