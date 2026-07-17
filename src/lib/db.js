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
  categoryId: { type: String, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

const CustomerSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String },
});

const ProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  customerId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  remarks: { type: String },
  labourCost: { type: Number, default: 0 },
  transportCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 0 }, // percentage
  totalAmount: { type: Number, default: 0 },
});

const ProjectMaterialSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  materialId: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

// Cache mongoose models
let Category, Material, Customer, Project, ProjectMaterial;
if (useMongo) {
  Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  Material = mongoose.models.Material || mongoose.model('Material', MaterialSchema);
  Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
  Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
  ProjectMaterial = mongoose.models.ProjectMaterial || mongoose.model('ProjectMaterial', ProjectMaterialSchema);
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
    return db.categories;
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

// MATERIAL REPOSITORY
export async function getMaterials() {
  await connectDB();
  if (useMongo) {
    return await Material.find({}).lean();
  } else {
    const db = readJsonDb();
    return db.materials;
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
      ...data,
      price: Number(data.price || 0),
    };
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
    const index = db.materials.findIndex((m) => m._id === id);
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
    const index = db.materials.findIndex((m) => m._id === id);
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
    return db.customers;
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
    const newCustomer = { _id: generateId(), ...data };
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
    const index = db.customers.findIndex((c) => c._id === id);
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
    const index = db.customers.findIndex((c) => c._id === id);
    if (index === -1) return null;
    const deleted = db.customers.splice(index, 1)[0];
    writeJsonDb(db);
    return deleted;
  }
}

// PROJECTS & PROJECT MATERIALS REPOSITORY
export async function getProjects() {
  await connectDB();
  if (useMongo) {
    return await Project.find({}).lean();
  } else {
    const db = readJsonDb();
    return db.projects;
  }
}

export async function getProjectById(id) {
  await connectDB();
  if (useMongo) {
    const project = await Project.findById(id).lean();
    if (!project) return null;
    const materials = await ProjectMaterial.find({ projectId: id }).lean();
    return { ...project, materials };
  } else {
    const db = readJsonDb();
    const project = db.projects.find((p) => p._id === id);
    if (!project) return null;
    const materials = db.projectMaterials.filter((pm) => pm.projectId === id);
    return { ...project, materials };
  }
}

export async function createProject(projectData, materialsList) {
  await connectDB();
  if (useMongo) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const project = new Project(projectData);
      await project.save({ session });

      const pMaterials = materialsList.map((m) => new ProjectMaterial({
        projectId: project._id.toString(),
        materialId: m.materialId,
        quantity: Number(m.quantity),
        unitPrice: Number(m.unitPrice),
        total: Number(m.total),
      }));

      if (pMaterials.length > 0) {
        await ProjectMaterial.insertMany(pMaterials, { session });
      }

      await session.commitTransaction();
      session.endSession();

      return { ...project.toObject(), materials: pMaterials.map(pm => pm.toObject()) };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } else {
    const db = readJsonDb();
    const projectId = generateId();
    const newProject = {
      _id: projectId,
      date: projectData.date || new Date().toISOString(),
      projectName: projectData.projectName,
      customerId: projectData.customerId,
      remarks: projectData.remarks || '',
      labourCost: Number(projectData.labourCost || 0),
      transportCost: Number(projectData.transportCost || 0),
      discount: Number(projectData.discount || 0),
      gst: Number(projectData.gst || 0),
      totalAmount: Number(projectData.totalAmount || 0),
    };

    const newProjectMaterials = materialsList.map((m) => ({
      _id: generateId(),
      projectId,
      materialId: m.materialId,
      quantity: Number(m.quantity),
      unitPrice: Number(m.unitPrice),
      total: Number(m.total),
    }));

    db.projects.push(newProject);
    db.projectMaterials.push(...newProjectMaterials);
    writeJsonDb(db);

    return { ...newProject, materials: newProjectMaterials };
  }
}

export async function updateProject(id, projectData, materialsList) {
  await connectDB();
  if (useMongo) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const updatedProject = await Project.findByIdAndUpdate(id, projectData, { new: true, session }).lean();
      if (!updatedProject) {
        await session.abortTransaction();
        session.endSession();
        return null;
      }

      // Delete existing project materials
      await ProjectMaterial.deleteMany({ projectId: id }, { session });

      // Insert new project materials
      const pMaterials = materialsList.map((m) => new ProjectMaterial({
        projectId: id,
        materialId: m.materialId,
        quantity: Number(m.quantity),
        unitPrice: Number(m.unitPrice),
        total: Number(m.total),
      }));

      if (pMaterials.length > 0) {
        await ProjectMaterial.insertMany(pMaterials, { session });
      }

      await session.commitTransaction();
      session.endSession();

      return { ...updatedProject, materials: pMaterials.map(pm => pm.toObject()) };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } else {
    const db = readJsonDb();
    const index = db.projects.findIndex((p) => p._id === id);
    if (index === -1) return null;

    db.projects[index] = {
      ...db.projects[index],
      projectName: projectData.projectName,
      customerId: projectData.customerId,
      remarks: projectData.remarks || '',
      labourCost: Number(projectData.labourCost || 0),
      transportCost: Number(projectData.transportCost || 0),
      discount: Number(projectData.discount || 0),
      gst: Number(projectData.gst || 0),
      totalAmount: Number(projectData.totalAmount || 0),
      date: projectData.date || db.projects[index].date,
    };

    // Filter out old materials
    db.projectMaterials = db.projectMaterials.filter((pm) => pm.projectId !== id);

    // Insert new materials
    const newProjectMaterials = materialsList.map((m) => ({
      _id: generateId(),
      projectId: id,
      materialId: m.materialId,
      quantity: Number(m.quantity),
      unitPrice: Number(m.unitPrice),
      total: Number(m.total),
    }));

    db.projectMaterials.push(...newProjectMaterials);
    writeJsonDb(db);

    return { ...db.projects[index], materials: newProjectMaterials };
  }
}

export async function deleteProject(id) {
  await connectDB();
  if (useMongo) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const deleted = await Project.findByIdAndDelete(id, { session }).lean();
      if (!deleted) {
        await session.abortTransaction();
        session.endSession();
        return null;
      }
      await ProjectMaterial.deleteMany({ projectId: id }, { session });
      await session.commitTransaction();
      session.endSession();
      return deleted;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } else {
    const db = readJsonDb();
    const index = db.projects.findIndex((p) => p._id === id);
    if (index === -1) return null;

    const deleted = db.projects.splice(index, 1)[0];
    db.projectMaterials = db.projectMaterials.filter((pm) => pm.projectId !== id);
    writeJsonDb(db);
    return deleted;
  }
}

export async function getProjectMaterials() {
  await connectDB();
  if (useMongo) {
    return await ProjectMaterial.find({}).lean();
  } else {
    const db = readJsonDb();
    return db.projectMaterials || [];
  }
}
