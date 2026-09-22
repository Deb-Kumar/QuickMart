import React, { useState } from 'react';
import { Sparkles, Clock, ChefHat, Plus, Check, ShoppingBag, Flame, X, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface MealPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMultipleToCart: (products: Product[]) => void;
}

interface RecipeResult {
  recipeTitle: string;
  tagline: string;
  prepTime: string;
  servings: number;
  difficulty: string;
  matchedProductIds: number[];
  products: Product[];
  totalBundlePrice: number;
  pantryStaples: string[];
  instructions: string[];
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  chefTip: string;
}

const PRESET_IDEAS = [
  { id: '1', title: '🍝 15-Min Fresh Pasta & Herb Sauce', query: 'Quick fresh tomato garlic herb pasta with parmesan' },
  { id: '2', title: '🥑 High-Protein Avocado Breakfast', query: 'Avocado toast with fresh eggs and baby spinach' },
  { id: '3', title: '🥤 Post-Workout Power Smoothie', query: 'High protein berry banana smoothie with milk' },
  { id: '4', title: '🥗 Mediterranean Crunch Salad', query: 'Fresh cucumber tomato onion salad with olive dressing' },
  { id: '5', title: '🍿 Late Night Movie Munchies', query: 'Popcorn chips chocolate and cold soda combo' },
  { id: '6', title: '🍲 Comforting Veggie Stir-Fry', query: 'Broccoli baby carrots mushrooms stir fry with garlic' }
];

export const MealPlannerModal: React.FC<MealPlannerModalProps> = ({
  isOpen,
  onClose,
  onAddMultipleToCart
}) => {
  const [query, setQuery] = useState('');
  const [dietary] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    setAddedSuccess(false);

    try {
      const res = await fetch('/api/ai/meal-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, dietaryPreference: dietary })
      });
      const data = await res.json();
      if (data.success && data.recipe) {
        setRecipe(data.recipe);
      }
    } catch (err) {
      console.error('Meal planner error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAll = () => {
    if (!recipe || !recipe.products.length) return;
    onAddMultipleToCart(recipe.products);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 flex flex-col max-h-[92vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg">AI Recipe-to-Cart Planner</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-300 text-rose-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Gemini 3.6
                </span>
              </div>
              <p className="text-xs text-rose-100">Describe what you want to eat — we bundle all ingredients in 10-min delivery!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Query Bar */}
          <div>
            <label className="text-xs font-bold text-zinc-900 block mb-1.5">
              What are you in the mood to make or eat?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Italian pasta with parmesan & fresh basil for 2, or high protein smoothie"
                className="flex-1 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs sm:text-sm font-semibold text-zinc-900 focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 placeholder:text-zinc-400"
              />
              <button
                disabled={isLoading || !query.trim()}
                onClick={() => handleGenerate()}
                className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Badges */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 block mb-2">Or pick a popular 10-minute recipe idea:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_IDEAS.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => {
                    setQuery(idea.query);
                    handleGenerate(idea.query);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 border border-zinc-200/80 hover:border-rose-200 text-xs font-semibold text-zinc-700 transition-colors text-left"
                >
                  {idea.title}
                </button>
              ))}
            </div>
          </div>

          {/* Recipe Generated View */}
          {recipe && (
            <div className="mt-4 p-4 sm:p-5 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-black text-zinc-900">{recipe.recipeTitle}</h4>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-extrabold">
                      {recipe.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">{recipe.tagline}</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-zinc-700 shrink-0">
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-zinc-200">
                    <Clock className="w-3.5 h-3.5 text-rose-500" /> {recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-zinc-200">
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> {recipe.nutrition?.calories || '350 kcal'}
                  </span>
                </div>
              </div>

              {/* Matched Grocery Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h5 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
                    <span>QuickMart Ingredients ({recipe.products.length} items ready to deliver)</span>
                  </h5>
                  <span className="text-xs font-black text-rose-600">₹{recipe.totalBundlePrice.toFixed(0)} total</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recipe.products.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.image}</span>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 leading-tight">{item.name}</p>
                          <span className="text-[10px] text-zinc-500 font-medium">{item.unit}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-zinc-900">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking Steps & Chef Pro Tip */}
              <div className="space-y-2 pt-2 border-t border-zinc-200">
                <h5 className="text-xs font-bold text-zinc-900">Step-by-Step Instructions:</h5>
                <ol className="space-y-1 text-xs text-zinc-600 list-decimal pl-4">
                  {recipe.instructions.map((step, idx) => (
                    <li key={idx} className="pl-1 leading-relaxed">{step}</li>
                  ))}
                </ol>
                {recipe.chefTip && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-medium flex items-center gap-2 mt-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Chef's Pro Tip:</strong> {recipe.chefTip}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                id="add-recipe-bundle-button"
                onClick={handleAddAll}
                disabled={addedSuccess || recipe.products.length === 0}
                className={`w-full py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  addedSuccess
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 active:scale-[0.98]'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added {recipe.products.length} items to basket!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add All {recipe.products.length} Ingredients to Basket • ₹{recipe.totalBundlePrice.toFixed(0)}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
