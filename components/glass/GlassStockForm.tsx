// components/glass/GlassStockForm.tsx

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  GlassStock,
  GlassType,
  GlassMaterial,
  GlassSphere,
  GlassCylinder,
  GlassColor,
  GlassDiameter,
} from "@/types/glass";

// Define the schema
const formSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  type: z.string().min(1, "Type is required"),
  material: z.string().min(1, "Material is required"),
  sphere: z.string().min(1, "Sphere is required"),
  cylinder: z.string().min(1, "Cylinder is required"),
  axis: z.number().min(0).max(180, "Axis must be between 0 and 180"),
  diameter: z.number().min(1, "Diameter is required"),
  color: z.string().min(1, "Color is required"),
  stockQuantity: z.number().min(1, "Stock quantity must be at least 1"),
  minStockLevel: z.number().min(0, "Minimum stock level cannot be negative"),
  costPrice: z.number().min(0.01, "Cost price must be at least 0.01"),
  sellingPrice: z.number().min(0.01, "Selling price must be at least 0.01"),
  supplierId: z.string().min(1, "Supplier is required"),
});

// Define the form values type
type FormValues = z.infer<typeof formSchema>;

// Define the component props
interface GlassStockFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const glassTypes: GlassType[] = [
  "single-vision",
  "bifocal",
  "progressive",
  "photochromic",
  "anti-reflective",
  "blue-light",
  "tinted",
  "polarized",
];

const glassMaterials: GlassMaterial[] = [
  "cr-39",
  "polycarbonate",
  "high-index-1.67",
  "high-index-1.74",
  "glass",
  "trivex",
];

const glassSpheres: GlassSphere[] = [
  "-6.00",
  "-5.50",
  "-5.00",
  "-4.50",
  "-4.00",
  "-3.50",
  "-3.00",
  "-2.75",
  "-2.50",
  "-2.25",
  "-2.00",
  "-1.75",
  "-1.50",
  "-1.25",
  "-1.00",
  "-0.75",
  "-0.50",
  "-0.25",
  "0.00",
  "+0.25",
  "+0.50",
  "+0.75",
  "+1.00",
  "+1.25",
  "+1.50",
  "+1.75",
  "+2.00",
  "+2.25",
  "+2.50",
  "+2.75",
  "+3.00",
  "+3.50",
  "+4.00",
  "+4.50",
  "+5.00",
  "+5.50",
  "+6.00",
];

const glassCylinders: GlassCylinder[] = [
  "-2.00",
  "-1.75",
  "-1.50",
  "-1.25",
  "-1.00",
  "-0.75",
  "-0.50",
  "-0.25",
  "0.00",
  "+0.25",
  "+0.50",
  "+0.75",
  "+1.00",
  "+1.25",
  "+1.50",
  "+1.75",
  "+2.00",
];

const glassColors: GlassColor[] = [
  "clear",
  "white",
  "brown",
  "grey",
  "green",
  "blue",
  "pink",
  "purple",
];

const glassDiameters: GlassDiameter[] = [50, 55, 60, 65, 70, 75, 80];

export function GlassStockForm({ onSuccess, onCancel }: GlassStockFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      type: "",
      material: "",
      sphere: "0.00",
      cylinder: "0.00",
      axis: 0,
      diameter: 60,
      color: "clear",
      stockQuantity: 1,
      minStockLevel: 5,
      costPrice: 0,
      sellingPrice: 0,
      supplierId: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/glass/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Glass stock added successfully");
        onSuccess();
      } else {
        throw new Error(data.error || "Failed to add glass stock");
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not add glass stock"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Model */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter model name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {glassTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/-/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Material */}
          <FormField
            control={form.control}
            name="material"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {glassMaterials.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material.replace(/-/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sphere */}
          <FormField
            control={form.control}
            name="sphere"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sphere (SPH) *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sphere" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {glassSpheres.map((sphere) => (
                      <SelectItem key={sphere} value={sphere}>
                        {sphere}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cylinder */}
          <FormField
            control={form.control}
            name="cylinder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cylinder (CYL) *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cylinder" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {glassCylinders.map((cylinder) => (
                      <SelectItem key={cylinder} value={cylinder}>
                        {cylinder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Axis */}
          <FormField
            control={form.control}
            name="axis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Axis (°) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={180}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Diameter */}
          <FormField
            control={form.control}
            name="diameter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diameter (mm) *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diameter" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {glassDiameters.map((diameter) => (
                      <SelectItem key={diameter} value={String(diameter)}>
                        {diameter}mm
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {glassColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stock Quantity */}
          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Min Stock Level */}
          <FormField
            control={form.control}
            name="minStockLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Stock Level *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Supplier ID */}
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cost Price */}
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price (AFN) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selling Price */}
          <FormField
            control={form.control}
            name="sellingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price (AFN) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0.01}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Stock"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
