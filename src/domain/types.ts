export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pcs';
export type Category = 'iranian' | 'light' | 'snack' | 'fastfood';
export type StoragePlace = 'fridge' | 'freezer' | 'cabinet';
export type Quantity = {amount: number; unit: Unit};
export type Ingredient = {
  id: string;
  fa: string;
  aliases: readonly string[];
  group: string;
  allergens: readonly string[];
  /** Reliable mean unit weight, only for entries explicitly reviewed. */
  gramsPerPiece?: number;
  /** Compound commercial food: composition and cross-contact are product-specific. */
  compositionUnverified?: boolean;
};
export type PantryItem = {id: string; ingredientId: string; quantity: Quantity | null;
  expiresOn?: string; place?: StoragePlace; createdAt: string};
export type RecipeIngredient = {ingredientId: string; quantity: Quantity; essential: boolean;
  note?: string; scaling?: 'linear' | 'fixed'};
export type RecipeStep = {title: string; body: string; minutes?: number; safetyNote?: string};
export type Recipe = {id:string; title: string; description: string; categories: Category[];
  servings: number; prepMinutes: number; cookMinutes: number; difficulty: 'easy' | 'medium';
  ingredients: RecipeIngredient[]; steps: RecipeStep[];
  /** Editorial drafts are deliberately NOT marked reviewed. */
  contentStatus: 'draft' | 'reviewed'; provenance: {kind:'editorial' | 'source'; url?:string; sourceScope?:'recipe'|'collection'|'adaptation'; sourceTitle?:string};
};
export type Substitution = {recipeId: string; from: string; to: string; ratio: number; verified: boolean};
export type DietaryRule = {excludedIngredientIds: readonly string[]; excludedAllergens: readonly string[]};
export type Missing = {ingredientId:string; needed:Quantity; have: Quantity | null;
  shortfall: Quantity | null; kind:'absent' | 'insufficient' | 'unknown'};
export type Eligibility = {recipeId: string; status:'ready'|'uncertain'|'substituted'|'missing'|'incompatible';
  missing:Missing[]; substitutions:{from:string;to:string}[]; explanation:string; score:number};
export type CookingIntent = {includedIds:string[]; excludedIds:string[]; maxTimeMinutes?:number;
  servings?:number; categories:Category[]; unresolvedTerms:string[]};
