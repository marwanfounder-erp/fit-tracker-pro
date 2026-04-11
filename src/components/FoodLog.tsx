import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, X, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { foodLibrary, calcNutrition, CATEGORIES, type CategoryKey, type FoodItem } from "@/data/foodLibrary";

interface FoodLogEntry {
  id: string;
  session_date: string;
  food_name: string;
  emoji: string;
  quantity: number;
  unit: string;
  total_protein: number;
  total_calories: number;
}

export default function FoodLog() {
  const today = new Date().toISOString().split("T")[0];
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [selectedFood, setSelectedFood] = useState<FoodItem>(foodLibrary[0]);
  const [qty, setQty] = useState<number>(foodLibrary[0].defaultQty);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: foodLogs = [] } = useQuery<FoodLogEntry[]>({
    queryKey: ["food-logs", today],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("food_logs")
        .select("*")
        .eq("session_date", today)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const totalProtein = foodLogs.reduce((acc, f) => acc + f.total_protein, 0);
  const totalCalories = foodLogs.reduce((acc, f) => acc + f.total_calories, 0);

  const filteredFoods = useMemo(() => {
    if (activeCategory === "all") return foodLibrary;
    return foodLibrary.filter((f) => f.category === activeCategory);
  }, [activeCategory]);

  const nutrition = calcNutrition(selectedFood, qty);
  const step = selectedFood.unit === "g" ? 25 : 1;

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setQty(food.defaultQty);
  };

  const handleQtyChange = (delta: number) => {
    setQty((prev) => Math.max(step, prev + delta * step));
  };

  const handleQtyInput = (val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) setQty(n);
  };

  const handleSave = async () => {
    setSaving(true);
    const n = calcNutrition(selectedFood, qty);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("food_logs").insert({
      session_date: today,
      food_name: selectedFood.name,
      emoji: selectedFood.emoji,
      quantity: qty,
      unit: selectedFood.unit,
      grams_total: n.gramsTotal,
      protein_per_100g: selectedFood.proteinPer100g,
      calories_per_100g: selectedFood.caloriesPer100g,
      total_protein: n.protein,
      total_calories: n.calories,
    });
    if (error) {
      toast.error("Failed to log food");
    } else {
      toast.success(`${selectedFood.emoji} ${selectedFood.name} logged!`);
      queryClient.invalidateQueries({ queryKey: ["food-logs", today] });
      setIsAdding(false);
      setSelectedFood(foodLibrary[0]);
      setQty(foodLibrary[0].defaultQty);
      setActiveCategory("all");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("food_logs").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["food-logs", today] });
    toast.success("Removed");
  };

  const unitLabel = (unit: string) =>
    ({ g: "g", piece: "pcs", scoop: "scoops", slice: "slices" }[unit] ?? unit);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-baseline justify-between border-l-4 border-primary pl-4">
        <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">Fuel Log</h2>
        <span className="font-mono text-xs text-muted-foreground">{foodLogs.length} items</span>
      </div>

      {/* Macro Totals */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card border-2 border-border p-3 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Protein</p>
          <p className="text-2xl font-bold tracking-tighter text-primary">
            {totalProtein.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground">g</span>
          </p>
        </div>
        <div className="bg-card border-2 border-border p-3 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Calories</p>
          <p className="text-2xl font-bold tracking-tighter text-foreground">
            {Math.round(totalCalories)}
            <span className="text-sm font-normal text-muted-foreground">kcal</span>
          </p>
        </div>
      </div>

      {/* Logged Foods */}
      {foodLogs.length > 0 && (
        <div className="space-y-1.5">
          {foodLogs.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-iron-medium border border-border px-3 py-2.5"
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-xs uppercase tracking-tight text-foreground truncate">
                  {item.food_name}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {item.quantity}
                  {unitLabel(item.unit)} &middot;{" "}
                  <span className="text-primary">{item.total_protein.toFixed(1)}g</span> protein &middot;{" "}
                  {Math.round(item.total_calories)}kcal
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Food Panel */}
      {isAdding ? (
        <div className="border-2 border-primary bg-card">
          {/* Category Filter */}
          <div className="flex gap-1 overflow-x-auto p-3 pb-2 scrollbar-none">
            {CATEGORIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`shrink-0 px-3 py-1 font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                  activeCategory === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Food List */}
          <div className="max-h-52 overflow-y-auto border-t border-border">
            {filteredFoods.map((food) => (
              <button
                key={food.name}
                onClick={() => handleSelectFood(food)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-border/50 transition-colors ${
                  selectedFood.name === food.name
                    ? "bg-iron-medium border-l-2 border-l-primary"
                    : "hover:bg-iron-medium/50"
                }`}
              >
                <span className="text-base leading-none w-5 text-center">{food.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs uppercase tracking-tight text-foreground truncate">
                    {food.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    <span className="text-primary">{food.proteinPer100g}g</span> prot ·{" "}
                    {food.caloriesPer100g}kcal
                    {food.unit === "g" ? " /100g" : ` /${food.unit}`}
                  </p>
                </div>
                {selectedFood.name === food.name && (
                  <span className="w-1.5 h-1.5 bg-primary shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Qty + Preview */}
          <div className="p-3 space-y-3 border-t border-border">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                Quantity
              </p>
              <div className="flex items-center border-2 border-border">
                <button
                  onClick={() => handleQtyChange(-1)}
                  className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-iron-medium transition-colors"
                >
                  <Minus size={13} />
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => handleQtyInput(e.target.value)}
                  className="w-14 bg-background border-x border-border py-2 text-center font-mono text-sm text-foreground outline-none"
                />
                <span className="px-2 font-mono text-[10px] text-muted-foreground uppercase">
                  {unitLabel(selectedFood.unit)}
                </span>
                <button
                  onClick={() => handleQtyChange(1)}
                  className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-iron-medium transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-iron-medium border border-border px-4 py-2.5 flex justify-between items-center">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                {selectedFood.emoji} {qty} {unitLabel(selectedFood.unit)}
              </span>
              <span className="font-mono text-xs">
                <span className="text-primary font-bold">{nutrition.protein.toFixed(1)}g</span>
                <span className="text-muted-foreground"> prot · </span>
                <span className="text-foreground font-bold">{nutrition.calories}</span>
                <span className="text-muted-foreground"> kcal</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex border-t-2 border-border">
            <button
              onClick={() => setIsAdding(false)}
              className="px-5 py-3.5 border-r-2 border-border font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || qty <= 0}
              className="flex-1 py-3.5 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-tight flex items-center justify-between px-5 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span>{saving ? "Saving..." : "Log It"}</span>
              <span className="font-mono">→</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-3.5 border-2 border-dashed border-border font-mono text-xs uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={13} />
          Add Food
        </button>
      )}
    </div>
  );
}
