// lib/stock-management.ts

import dbConnect from "@/lib/dbConnect";
import { GlassStock } from "@/lib/models/GlassStock";

export interface StockItem {
  id: string;
  productName: string;
  glassType: string;
  thickness: number;
  color?: string;
  width: number;
  height: number;
  batchNumber: string;
  currentQuantity: number;
  originalQuantity: number;
  unitPrice: number;
  supplier: string;
  warehouseLocation?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  remainingPercentage: number;
  totalArea: string;
  totalValue: number;
}

interface StockItemInput {
  _id: any;
  productName: string;
  glassType: string;
  thickness: number;
  color?: string;
  width: number;
  height: number;
  batchNumber: string;
  currentQuantity: number;
  originalQuantity: number;
  unitPrice: number;
  supplier: string;
  warehouseLocation?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

function toStockItem(stock: StockItemInput): StockItem {
  const id =
    typeof stock._id === "object" && stock._id !== null
      ? String(stock._id)
      : String(stock._id);

  const widthInMeters = stock.width / 100;
  const heightInMeters = stock.height / 100;
  const totalArea = (
    widthInMeters *
    heightInMeters *
    stock.currentQuantity
  ).toFixed(2);

  return {
    id,
    productName: stock.productName,
    glassType: stock.glassType,
    thickness: stock.thickness,
    color: stock.color,
    width: stock.width,
    height: stock.height,
    batchNumber: stock.batchNumber,
    currentQuantity: stock.currentQuantity,
    originalQuantity: stock.originalQuantity,
    unitPrice: stock.unitPrice,
    supplier: stock.supplier,
    warehouseLocation: stock.warehouseLocation,
    description: stock.description,
    createdAt: stock.createdAt,
    updatedAt: stock.updatedAt,
    remainingPercentage: (stock.currentQuantity / stock.originalQuantity) * 100,
    totalArea,
    totalValue: stock.currentQuantity * stock.unitPrice,
  };
}

// STOCK MANAGEMENT FUNCTIONS
export async function getAllStock(): Promise<StockItem[]> {
  await dbConnect();
  const stock = await GlassStock.find().sort({ createdAt: -1 });
  return stock.map(toStockItem);
}

export async function getStockItem(id: string): Promise<StockItem | null> {
  await dbConnect();
  const stock = await GlassStock.findById(id);
  return stock ? toStockItem(stock) : null;
}

export async function searchStock(
  query: string,
  filters?: {
    glassType?: string;
    supplier?: string;
    minQuantity?: number;
    maxQuantity?: number;
  }
): Promise<StockItem[]> {
  await dbConnect();

  const filter: any = {};

  if (query) {
    filter.$or = [
      { productName: { $regex: query, $options: "i" } },
      { batchNumber: { $regex: query, $options: "i" } },
      { glassType: { $regex: query, $options: "i" } },
      { supplier: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (filters?.glassType) {
    filter.glassType = filters.glassType;
  }

  if (filters?.supplier) {
    filter.supplier = filters.supplier;
  }

  if (filters?.minQuantity !== undefined) {
    filter.currentQuantity = {
      ...filter.currentQuantity,
      $gte: filters.minQuantity,
    };
  }

  if (filters?.maxQuantity !== undefined) {
    filter.currentQuantity = {
      ...filter.currentQuantity,
      $lte: filters.maxQuantity,
    };
  }

  const stockResults = await GlassStock.find(filter)
    .sort({ currentQuantity: 1 })
    .limit(100)
    .lean();

  const stock: StockItemInput[] = stockResults as unknown as StockItemInput[];

  return stock.map(toStockItem);
}

export async function addStockItem(data: any): Promise<StockItem> {
  await dbConnect();

  // Check if batch number already exists
  const existing = await GlassStock.findOne({ batchNumber: data.batchNumber });
  if (existing) {
    throw new Error(`Batch number ${data.batchNumber} already exists`);
  }

  const stock = new GlassStock({
    productName: data.productName,
    glassType: data.glassType,
    thickness: data.thickness,
    color: data.color,
    width: data.width,
    height: data.height,
    batchNumber: data.batchNumber,
    currentQuantity: data.currentQuantity,
    originalQuantity: data.originalQuantity,
    unitPrice: data.unitPrice,
    supplier: data.supplier,
    warehouseLocation: data.warehouseLocation,
    description: data.description,
  });

  await stock.save();
  return toStockItem(stock);
}

export async function updateStockItem(
  id: string,
  updates: any
): Promise<StockItem | null> {
  await dbConnect();

  // Don't allow updating batch number to an existing one
  if (updates.batchNumber) {
    const existing = await GlassStock.findOne({
      batchNumber: updates.batchNumber,
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error(`Batch number ${updates.batchNumber} already exists`);
    }
  }

  const stock = await GlassStock.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return stock ? toStockItem(stock) : null;
}

export async function deleteStockItem(id: string): Promise<boolean> {
  await dbConnect();

  // Check if stock is referenced in any issuances
  const GlassIssuance = (await import("@/lib/models/GlassIssuance"))
    .GlassIssuance;
  const issuances = await GlassIssuance.findOne({ stockItemId: id });

  if (issuances) {
    throw new Error(
      "Cannot delete stock item that has issuances. Delete issuances first."
    );
  }

  const result = await GlassStock.findByIdAndDelete(id);
  return !!result;
}

export async function getLowStockItems(
  threshold: number = 10
): Promise<StockItem[]> {
  await dbConnect();
  const stock = await GlassStock.find({
    currentQuantity: { $lte: threshold },
  }).sort({ currentQuantity: 1 });

  return stock.map(toStockItem);
}

export async function getStockStats(threshold: number = 10) {
  await dbConnect();
  const stock = await GlassStock.find();

  const totalStockValue = stock.reduce(
    (sum, s) => sum + s.currentQuantity * s.unitPrice,
    0
  );

  const totalStockArea = stock.reduce(
    (sum, s) => sum + (s.width / 100) * (s.height / 100) * s.currentQuantity,
    0
  );

  const totalItems = stock.reduce((sum, s) => sum + s.currentQuantity, 0);
  const uniqueSuppliers = new Set(stock.map((s) => s.supplier)).size;
  const lowStockItems = stock.filter(
    (s) => s.currentQuantity <= threshold
  ).length;

  return {
    totalProducts: stock.length,
    totalItems,
    totalStockValue: Math.round(totalStockValue),
    totalStockArea: parseFloat(totalStockArea.toFixed(2)),
    uniqueSuppliers,
    lowStockItems,
    averagePrice:
      stock.length > 0
        ? totalStockValue / stock.reduce((sum, s) => sum + s.currentQuantity, 0)
        : 0,
  };
}

export async function getStockBySupplier(
  supplier: string
): Promise<StockItem[]> {
  await dbConnect();
  const stock = await GlassStock.find({ supplier }).sort({ productName: 1 });
  return stock.map(toStockItem);
}

export async function getStockByType(glassType: string): Promise<StockItem[]> {
  await dbConnect();
  const stock = await GlassStock.find({ glassType }).sort({ productName: 1 });
  return stock.map(toStockItem);
}
