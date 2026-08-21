import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// JSON Fallback Database Configuration
const JSON_DB_DIR = path.join(process.cwd(), 'data');
const JSON_DB_PATH = path.join(JSON_DB_DIR, 'db.json');

// MONGODB SCHEMAS & DEFINITIONS
const CategorySchema = new mongoose.Schema(
  {
    categoryName: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

const CounterTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'Kitchen Equipment', index: true },
    order: { type: Number, default: 0, index: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
  },
  { timestamps: true }
);

const MaterialSchema = new mongoose.Schema(
  {
    materialName: { type: String, required: true, trim: true, index: true },
    category: { type: String, default: 'Sheet', index: true },
    calculationType: { type: String, default: 'Sheet' },
    materialType: { type: String, default: '' },
    grade: { type: String, default: '304' },
    gauge: { type: mongoose.Schema.Types.Mixed, default: '' },
    gaugeOptions: [{ type: mongoose.Schema.Types.Mixed }],
    pipeSize: { type: String, default: '' },
    dropdownOptions: [{ type: String }],
    allowMultiple: { type: Boolean, default: false },
    defaultUnitWeight: { type: Number, default: null },
    allowCustomUnitWeight: { type: Boolean, default: false },
    counterTypes: [{ type: String, index: true }], // Multikey index for high speed counter filtering
    subTypes: [{ type: String }],
    order: { type: Number, default: 0, index: true },
    unit: { type: String, default: 'kg' },
    price: { type: Number, default: 0 },
    description: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active', index: true },
    dimensions: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// Compound index for fast category + status queries
MaterialSchema.index({ category: 1, status: 1, order: 1 });

const CustomerSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true, index: true },
    companyName: { type: String, default: '' },
    counterType: { type: String, default: '' },
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true },
    email: { type: String, default: '' },
  },
  { timestamps: true }
);

const ProjectSchema = new mongoose.Schema(
  {
    estimateNumber: { type: String, trim: true, index: true },
    projectName: { type: String, required: true, trim: true, index: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, trim: true, index: true },
    companyName: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    counterType: { type: String, required: true, trim: true, index: true },
    counterSubtype: { type: String, default: '' },
    date: { type: Date, default: Date.now, index: true },
    remarks: { type: String, default: '' },

    // Dynamic material breakdowns (sheets, pipes, angles, purchased, compressor, 3D structures)
    sheets: [{ type: mongoose.Schema.Types.Mixed }],
    pipes: [{ type: mongoose.Schema.Types.Mixed }],
    angles: [{ type: mongoose.Schema.Types.Mixed }],
    purchased: [{ type: mongoose.Schema.Types.Mixed }],
    compressor: [{ type: mongoose.Schema.Types.Mixed }],

    // Pricing & financial fields
    materialRate: { type: Number, default: 0 },
    labourCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 18 },

    // Calculated outcomes
    totalMaterialWeight: { type: Number, default: 0 },
    materialCost: { type: Number, default: 0 },
    purchasedItemCost: { type: Number, default: 0 },
    discountedMaterialCost: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: { type: String, default: 'Active', index: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ date: -1, createdAt: -1 });

// Helper to safely get registered Mongoose models
export function getModels() {
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const CounterType = mongoose.models.CounterType || mongoose.model('CounterType', CounterTypeSchema);
  const Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);
  const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
  const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

  return { Category, CounterType, Material, Customer, Project };
}

// Global cached connection across serverless invocations / Fast Refresh
let cached = global._mongoCache;
if (!cached) {
  cached = global._mongoCache = { conn: null, promise: null, isConnecting: false, lastError: null };
}

/**
 * Connect to MongoDB with connection pooling and resilient failover.
 * Returns true if connected to MongoDB, false if falling back to local JSON DB.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || !uri.trim()) {
    initJsonDb();
    return false;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return true;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    };

    cached.isConnecting = true;
    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        cached.conn = mongooseInstance;
        cached.isConnecting = false;
        cached.lastError = null;
        console.log(`[MongoDB] Connected successfully to: ${mongooseInstance.connection.name || 'database'}`);
        // Ensure models are registered on connection
        getModels();
        return true;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        cached.isConnecting = false;
        cached.lastError = err.message;
        console.warn(`[MongoDB] Connection failed (${err.message}). Using local JSON DB fallback.`);
        initJsonDb();
        return false;
      });
  }

  try {
    const success = await cached.promise;
    return Boolean(success && mongoose.connection.readyState === 1);
  } catch {
    initJsonDb();
    return false;
  }
}

/**
 * Check if MongoDB is currently active and connected.
 */
export function isMongoActive() {
  return Boolean(mongoose.connection && mongoose.connection.readyState === 1);
}

/**
 * Return detailed database health status
 */
export async function getDatabaseDiagnostics() {
  const uri = process.env.MONGODB_URI;
  const isConnected = isMongoActive();
  const { Category, CounterType, Material, Customer, Project } = getModels();

  if (isConnected) {
    try {
      const startTime = Date.now();
      await mongoose.connection.db.admin().ping();
      const latencyMs = Date.now() - startTime;

      const [categoriesCount, counterTypesCount, materialsCount, projectsCount, customersCount] = await Promise.all([
        Category.countDocuments(),
        CounterType.countDocuments(),
        Material.countDocuments(),
        Project.countDocuments(),
        Customer.countDocuments(),
      ]);

      return {
        status: 'online',
        mode: 'mongodb',
        connected: true,
        databaseName: mongoose.connection.name || 'shree_balaji_db',
        host: mongoose.connection.host || 'remote',
        port: mongoose.connection.port || 27017,
        latencyMs,
        counts: {
          categories: categoriesCount,
          counterTypes: counterTypesCount,
          materials: materialsCount,
          projects: projectsCount,
          customers: customersCount,
        },
        hasUri: true,
      };
    } catch (err) {
      return {
        status: 'degraded',
        mode: 'mongodb',
        connected: false,
        error: err.message,
        hasUri: Boolean(uri),
      };
    }
  }

  // Local JSON DB Stats
  const db = readJsonDb();
  return {
    status: 'fallback',
    mode: 'json_fallback',
    connected: false,
    databaseName: 'db.json (Local Storage)',
    hasUri: Boolean(uri),
    lastError: cached?.lastError || (uri ? 'Could not reach MongoDB server' : 'MONGODB_URI not set'),
    counts: {
      categories: (db.categories || []).length,
      counterTypes: (db.counterTypes || []).length,
      materials: (db.materials || []).length,
      projects: (db.projects || []).length,
      customers: (db.customers || []).length,
    },
  };
}

// -----------------------------------------------------------------------------
// LOCAL JSON DB HELPERS (Fallback)
// -----------------------------------------------------------------------------
function initJsonDb() {
  try {
    if (!fs.existsSync(JSON_DB_DIR)) {
      fs.mkdirSync(JSON_DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(JSON_DB_PATH)) {
      fs.writeFileSync(
        JSON_DB_PATH,
        JSON.stringify(
          {
            categories: [],
            materials: [],
            counterTypes: [],
            customers: [],
            projects: [],
          },
          null,
          2
        )
      );
    }
  } catch (e) {
    console.error('Failed to initialize JSON DB folder:', e);
  }
}

export function readJsonDb() {
  initJsonDb();
  try {
    const data = fs.readFileSync(JSON_DB_PATH, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.counterTypes) parsed.counterTypes = [];
    if (!parsed.categories) parsed.categories = [];
    if (!parsed.materials) parsed.materials = [];
    if (!parsed.projects) parsed.projects = [];
    if (!parsed.customers) parsed.customers = [];
    return parsed;
  } catch (error) {
    console.error('Error reading JSON DB, resetting:', error);
    const emptyDb = {
      categories: [],
      materials: [],
      counterTypes: [],
      customers: [],
      projects: [],
    };
    try {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(emptyDb, null, 2));
    } catch {}
    return emptyDb;
  }
}

export function writeJsonDb(data) {
  initJsonDb();
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing to JSON DB:', e);
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

// -----------------------------------------------------------------------------
// CATEGORY REPOSITORY
// -----------------------------------------------------------------------------
export async function getCategories() {
  const useMongo = await connectDB();
  const { Category } = getModels();

  if (useMongo) {
    return await Category.find({}).sort({ categoryName: 1 }).lean();
  } else {
    const db = readJsonDb();
    return db.categories || [];
  }
}

export async function createCategory(data) {
  const useMongo = await connectDB();
  const { Category } = getModels();

  if (useMongo) {
    const existing = await Category.findOne({ categoryName: data.categoryName.trim() });
    if (existing) return existing.toObject();
    const category = new Category({ categoryName: data.categoryName.trim() });
    await category.save();
    return category.toObject();
  } else {
    const db = readJsonDb();
    db.categories = db.categories || [];
    const exists = db.categories.find(c => c.categoryName.toLowerCase() === data.categoryName.toLowerCase());
    if (exists) return exists;
    const newCategory = { _id: generateId(), ...data };
    db.categories.push(newCategory);
    writeJsonDb(db);
    return newCategory;
  }
}

// -----------------------------------------------------------------------------
// COUNTER TYPES REPOSITORY
// -----------------------------------------------------------------------------
export async function getCounterTypes() {
  const useMongo = await connectDB();
  const { CounterType } = getModels();

  if (useMongo) {
    return await CounterType.find({}).sort({ order: 1, name: 1 }).lean();
  } else {
    const db = readJsonDb();
    const list = db.counterTypes || [];
    return list.sort((a, b) => (a.order || 0) - (b.order || 0) || (a.name || '').localeCompare(b.name || ''));
  }
}

export async function createCounterType(data) {
  const useMongo = await connectDB();
  const { CounterType } = getModels();

  const record = {
    name: data.name ? data.name.trim() : '',
    description: data.description ? data.description.trim() : '',
    category: data.category || 'Kitchen Equipment',
    order: Number(data.order || 0),
    status: data.status || 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMongo) {
    const existing = await CounterType.findOne({ name: record.name });
    if (existing) {
      throw new Error(`Counter Type "${record.name}" already exists.`);
    }
    const ct = new CounterType(record);
    await ct.save();
    return ct.toObject();
  } else {
    const db = readJsonDb();
    db.counterTypes = db.counterTypes || [];
    const exists = db.counterTypes.some((c) => c.name.toLowerCase() === record.name.toLowerCase());
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
  const useMongo = await connectDB();
  const { CounterType } = getModels();
  const db = readJsonDb();

  let oldName = null;
  if (useMongo) {
    const existing = await CounterType.findById(id).lean();
    if (existing) oldName = existing.name;
  } else {
    const existing = (db.counterTypes || []).find((c) => c._id === id);
    if (existing) oldName = existing.name;
  }

  const updateFields = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (data.name) updateFields.name = data.name.trim();

  let updated;
  if (useMongo) {
    updated = await CounterType.findByIdAndUpdate(id, updateFields, { new: true }).lean();
  } else {
    const index = (db.counterTypes || []).findIndex((c) => c._id === id);
    if (index === -1) return null;
    db.counterTypes[index] = { ...db.counterTypes[index], ...updateFields };
    writeJsonDb(db);
    updated = db.counterTypes[index];
  }

  if (oldName && updateFields.name && oldName !== updateFields.name) {
    await cascadeRenameCounterTypeInMaterials(oldName, updateFields.name);
  }

  return updated;
}

export async function deleteCounterType(id) {
  const useMongo = await connectDB();
  const { CounterType } = getModels();
  let deletedName = null;

  if (useMongo) {
    const existing = await CounterType.findById(id).lean();
    if (existing) {
      deletedName = existing.name;
      await CounterType.findByIdAndDelete(id);
    }
  } else {
    const db = readJsonDb();
    const index = (db.counterTypes || []).findIndex((c) => c._id === id);
    if (index !== -1) {
      deletedName = db.counterTypes[index].name;
      db.counterTypes.splice(index, 1);
      writeJsonDb(db);
    }
  }

  if (deletedName) {
    await unassignCounterTypeFromAllMaterials(deletedName);
  }

  return { success: true, deletedName };
}

async function cascadeRenameCounterTypeInMaterials(oldName, newName) {
  const useMongo = await connectDB();
  const { Material } = getModels();

  if (useMongo) {
    await Material.updateMany({ counterTypes: oldName }, { $set: { 'counterTypes.$': newName } });
  } else {
    const db = readJsonDb();
    let changed = false;
    (db.materials || []).forEach((m) => {
      if (Array.isArray(m.counterTypes) && m.counterTypes.includes(oldName)) {
        m.counterTypes = m.counterTypes.map((ct) => (ct === oldName ? newName : ct));
        changed = true;
      }
    });
    if (changed) writeJsonDb(db);
  }
}

async function unassignCounterTypeFromAllMaterials(counterTypeName) {
  const useMongo = await connectDB();
  const { Material } = getModels();

  if (useMongo) {
    await Material.updateMany({ counterTypes: counterTypeName }, { $pull: { counterTypes: counterTypeName } });
  } else {
    const db = readJsonDb();
    let changed = false;
    (db.materials || []).forEach((m) => {
      if (Array.isArray(m.counterTypes) && m.counterTypes.includes(counterTypeName)) {
        m.counterTypes = m.counterTypes.filter((ct) => ct !== counterTypeName);
        changed = true;
      }
    });
    if (changed) writeJsonDb(db);
  }
}

export async function assignMaterialsToCounterType(counterTypeName, materialIdsToAdd = [], materialIdsToRemove = []) {
  const useMongo = await connectDB();
  const { Material } = getModels();

  if (useMongo) {
    if (materialIdsToAdd.length > 0) {
      await Material.updateMany({ _id: { $in: materialIdsToAdd } }, { $addToSet: { counterTypes: counterTypeName } });
    }
    if (materialIdsToRemove.length > 0) {
      await Material.updateMany({ _id: { $in: materialIdsToRemove } }, { $pull: { counterTypes: counterTypeName } });
    }
  } else {
    const db = readJsonDb();
    (db.materials || []).forEach((m) => {
      if (!Array.isArray(m.counterTypes)) m.counterTypes = [];
      if (materialIdsToAdd.includes(m._id) && !m.counterTypes.includes(counterTypeName)) {
        m.counterTypes.push(counterTypeName);
      }
      if (materialIdsToRemove.includes(m._id) && m.counterTypes.includes(counterTypeName)) {
        m.counterTypes = m.counterTypes.filter((ct) => ct !== counterTypeName);
      }
    });
    writeJsonDb(db);
  }
  return true;
}

// -----------------------------------------------------------------------------
// MATERIAL REPOSITORY
// -----------------------------------------------------------------------------
export async function getMaterials(filter = {}) {
  const useMongo = await connectDB();
  const { Material } = getModels();

  if (useMongo) {
    const query = {};
    if (filter.counterType) {
      query.counterTypes = filter.counterType;
    }
    if (filter.category) {
      query.category = filter.category;
    }
    if (filter.status) {
      query.status = filter.status;
    }
    return await Material.find(query).sort({ order: 1, createdAt: 1 }).lean();
  } else {
    const db = readJsonDb();
    let list = db.materials || [];
    if (filter.counterType) {
      list = list.filter((m) => Array.isArray(m.counterTypes) && m.counterTypes.includes(filter.counterType));
    }
    if (filter.category) {
      list = list.filter((m) => (m.category || '').toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.status) {
      list = list.filter((m) => m.status === filter.status);
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

export async function createMaterial(data) {
  const useMongo = await connectDB();
  const { Material } = getModels();

  const rawCat = data.category ? String(data.category).trim() : 'Sheet';
  const categoryEnum =
    ['Sheet', 'Pipe', 'Angle', 'Purchased', 'Compressor', 'Special'].find(
      (c) => c.toLowerCase() === rawCat.toLowerCase()
    ) || rawCat.charAt(0).toUpperCase() + rawCat.slice(1);

  const record = {
    materialName: data.materialName,
    category: categoryEnum,
    calculationType: data.calculationType || (categoryEnum === 'Compressor' ? 'Purchased' : categoryEnum),
    materialType: data.materialType || '',
    grade: data.grade ? String(data.grade).replace(/^SS/i, '') : '304',
    gauge: data.gauge !== undefined ? data.gauge : '',
    gaugeOptions: Array.isArray(data.gaugeOptions) ? data.gaugeOptions : null,
    pipeSize: data.pipeSize || '',
    dropdownOptions: Array.isArray(data.dropdownOptions) ? data.dropdownOptions : data.options || null,
    allowMultiple: Boolean(data.allowMultiple),
    defaultUnitWeight:
      data.defaultUnitWeight !== undefined && data.defaultUnitWeight !== '' && data.defaultUnitWeight !== null
        ? Number(data.defaultUnitWeight)
        : null,
    allowCustomUnitWeight: Boolean(data.allowCustomUnitWeight),
    counterTypes: Array.isArray(data.counterTypes) ? data.counterTypes : data.counterType ? [data.counterType] : [],
    subTypes: Array.isArray(data.subTypes) ? data.subTypes : [],
    order: Number(data.order || 0),
    unit: data.unit || (categoryEnum === 'Purchased' || categoryEnum === 'Compressor' ? 'Piece' : 'kg'),
    price: Number(data.price || 0),
    description: data.description || '',
    status: data.status || 'Active',
    dimensions: data.dimensions || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMongo) {
    const material = new Material(record);
    await material.save();
    return material.toObject();
  } else {
    const db = readJsonDb();
    const newMaterial = {
      _id: generateId(),
      ...record,
    };
    db.materials = db.materials || [];
    db.materials.push(newMaterial);
    writeJsonDb(db);
    return newMaterial;
  }
}

export async function updateMaterial(id, data) {
  const useMongo = await connectDB();
  const { Material } = getModels();

  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  if (data.price !== undefined) {
    updateData.price = Number(data.price);
  }
  if (data.defaultUnitWeight !== undefined) {
    updateData.defaultUnitWeight =
      data.defaultUnitWeight !== '' && data.defaultUnitWeight !== null ? Number(data.defaultUnitWeight) : null;
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
    updateData.category =
      ['Sheet', 'Pipe', 'Angle', 'Purchased', 'Compressor', 'Special'].find(
        (c) => c.toLowerCase() === rawCat.toLowerCase()
      ) || rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
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
  const useMongo = await connectDB();
  const { Material } = getModels();

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

// -----------------------------------------------------------------------------
// CUSTOMER REPOSITORY
// -----------------------------------------------------------------------------
export async function getCustomers() {
  const useMongo = await connectDB();
  const { Customer } = getModels();

  if (useMongo) {
    return await Customer.find({}).sort({ customerName: 1 }).lean();
  } else {
    const db = readJsonDb();
    return db.customers || [];
  }
}

export async function createCustomer(data) {
  const useMongo = await connectDB();
  const { Customer } = getModels();

  if (useMongo) {
    const customer = new Customer(data);
    await customer.save();
    return customer.toObject();
  } else {
    const db = readJsonDb();
    const newCustomer = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    db.customers = db.customers || [];
    db.customers.push(newCustomer);
    writeJsonDb(db);
    return newCustomer;
  }
}

export async function updateCustomer(id, data) {
  const useMongo = await connectDB();
  const { Customer } = getModels();

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
  const useMongo = await connectDB();
  const { Customer } = getModels();

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

// -----------------------------------------------------------------------------
// PROJECTS / ESTIMATIONS REPOSITORY
// -----------------------------------------------------------------------------
export async function getNextEstimateNumber() {
  const useMongo = await connectDB();
  const { Project } = getModels();

  let projects = [];
  if (useMongo) {
    projects = await Project.find({}, { estimateNumber: 1 }).lean();
  } else {
    const db = readJsonDb();
    projects = db.projects || [];
  }

  let maxSeq = 0;
  for (const p of projects) {
    const numStr = String(p.estimateNumber || '');
    const match = numStr.match(/EST[-\s]?(\d+)/i);
    if (match) {
      const val = parseInt(match[1], 10);
      if (!isNaN(val) && val > maxSeq) {
        maxSeq = val;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  return `EST ${String(nextSeq).padStart(2, '0')}`;
}

export async function getProjects() {
  const useMongo = await connectDB();
  const { Project } = getModels();

  if (useMongo) {
    return await Project.find({}).sort({ date: -1, createdAt: -1 }).lean();
  } else {
    const db = readJsonDb();
    return (db.projects || []).sort(
      (a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
    );
  }
}

export async function getProjectById(id) {
  const useMongo = await connectDB();
  const { Project } = getModels();

  if (useMongo) {
    return await Project.findById(id).lean();
  } else {
    const db = readJsonDb();
    return (db.projects || []).find((p) => p._id === id) || null;
  }
}

export async function createProject(projectData) {
  const useMongo = await connectDB();
  const { Project } = getModels();

  let estimateNumber = projectData.estimateNumber ? String(projectData.estimateNumber).trim() : '';
  if (!estimateNumber || estimateNumber.startsWith('EST-')) {
    estimateNumber = await getNextEstimateNumber();
  }

  const sheets = projectData.sheets || [];
  const pipes = projectData.pipes || [];
  const angles = projectData.angles || [];
  const purchased = projectData.purchased || [];
  const compressor = projectData.compressor || [];

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
    counterSubtype: projectData.counterSubtype || '',
    date: projectData.date || new Date().toISOString(),
    remarks: projectData.remarks || '',
    sheets,
    pipes,
    angles,
    purchased,
    compressor,
    materialRate: Number(projectData.materialRate || 0),
    labourCost: Number(projectData.labourCost || 0),
    discount: Number(projectData.discount || 0),
    gst: Number(projectData.gst !== undefined ? projectData.gst : 18),
    totalMaterialWeight: Number(projectData.totalMaterialWeight || 0),
    materialCost: Number(projectData.materialCost || 0),
    purchasedItemCost: Number(projectData.purchasedItemCost || 0),
    discountedMaterialCost: Number(projectData.discountedMaterialCost || 0),
    subtotal: Number(projectData.subtotal || 0),
    taxableAmount: Number(projectData.taxableAmount || 0),
    gstAmount: Number(projectData.gstAmount || 0),
    totalAmount: Number(projectData.totalAmount || projectData.grandTotal || 0),
    grandTotal: Number(projectData.grandTotal || projectData.totalAmount || 0),
    status: projectData.status || 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMongo) {
    const project = new Project(record);
    await project.save();
    return project.toObject();
  } else {
    const db = readJsonDb();
    const newProject = {
      _id: generateId(),
      ...record,
    };
    db.projects = db.projects || [];
    db.projects.push(newProject);
    writeJsonDb(db);
    return newProject;
  }
}

export async function updateProject(id, projectData) {
  const useMongo = await connectDB();
  const { Project } = getModels();

  const sheets = projectData.sheets || [];
  const pipes = projectData.pipes || [];
  const angles = projectData.angles || [];
  const purchased = projectData.purchased || [];
  const compressor = projectData.compressor || [];

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
    counterSubtype: projectData.counterSubtype || '',
    date: projectData.date,
    remarks: projectData.remarks || '',
    sheets,
    pipes,
    angles,
    purchased,
    compressor,
    materialRate: Number(projectData.materialRate || 0),
    labourCost: Number(projectData.labourCost || 0),
    discount: Number(projectData.discount || 0),
    gst: Number(projectData.gst !== undefined ? projectData.gst : 18),
    totalMaterialWeight: Number(projectData.totalMaterialWeight || 0),
    materialCost: Number(projectData.materialCost || 0),
    purchasedItemCost: Number(projectData.purchasedItemCost || 0),
    discountedMaterialCost: Number(projectData.discountedMaterialCost || 0),
    subtotal: Number(projectData.subtotal || 0),
    taxableAmount: Number(projectData.taxableAmount || 0),
    gstAmount: Number(projectData.gstAmount || 0),
    totalAmount: Number(projectData.totalAmount || projectData.grandTotal || 0),
    grandTotal: Number(projectData.grandTotal || projectData.totalAmount || 0),
    status: projectData.status || 'Active',
    updatedAt: new Date().toISOString(),
  };

  if (useMongo) {
    return await Project.findByIdAndUpdate(id, updateFields, { new: true }).lean();
  } else {
    const db = readJsonDb();
    const index = (db.projects || []).findIndex((p) => p._id === id);
    if (index === -1) return null;

    db.projects[index] = {
      ...db.projects[index],
      ...updateFields,
    };
    writeJsonDb(db);
    return db.projects[index];
  }
}

export async function deleteProject(id) {
  const useMongo = await connectDB();
  const { Project } = getModels();

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
