import IngredientList from "@/models/IngredientList.js";
import Ingredient from "@/models/Ingredient.js";
import List from "@/models/List.js";

export default class Recipe {
    static nextId = 1;

    constructor(id, name, imageURL, description, category, diet, prepTime, cookTime, totalTime, ingredients, directions, byUser, savedBy) {
        this.id = id ?? Recipe.nextId++;
        this.name = name ?? "Untitled";
        this.imageURL = imageURL ?? "";
        this.description = description ?? "";
        this.category = category ?? "";
        this.diet = Array.isArray(diet) ? new List(diet) : new List([]);
        this.prepTime = prepTime ?? 0;
        this.cookTime = cookTime ?? 0;
        this.totalTime = totalTime ?? 0;
        this.ingredients = ingredients instanceof IngredientList ? ingredients
            : new IngredientList((ingredients || []).map(item => item instanceof Ingredient ? item : new Ingredient(item)));
        this.directions = Array.isArray(directions) ? new List(directions) : new List([]);
        this.byUser = byUser ?? '';
        this.savedBy = Array.isArray(savedBy) ? new List(savedBy) : new List([]);
    }


    /**
     * Convert the recipe into a plain object for Firestore storage.
     * @returns {object} The plain object representation of the recipe.
     */
    toFirestore() {
        let name = this.name.toLowerCase();
        let imageURL = this.imageURL;
        let description = this.description;
        let category = this.category;
        let diet = Array.isArray(this.diet) 
            ? this.diet.map(item => item) 
            : [];
        let prepTime = this.prepTime;
        let cookTime = this.cookTime;
        let totalTime = this.totalTime;
        let ingredients = Array.isArray(this.ingredients) 
            ? this.ingredients.map(ingredient => ingredient.name.toLowerCase()) 
            : [];
        let directions = Array.isArray(this.directions) 
            ? this.directions.map(item => item) 
            : [];
        let byUser = this.byUser;
        let savedBy = Array.isArray(this.savedBy) 
            ? this.savedBy.map(item => item) 
            : [];
        let tags = [this.name.toLowerCase(), ...this.name.toLowerCase().split(' ').filter(tag => tag.trim() !== '')];

        return {name, imageURL, description, category, diet, prepTime, cookTime, totalTime, ingredients, directions, byUser, savedBy, tags};
    }
    /**
     * Create a `Recipe` instance from Firestore data.
     * @param {object} snapshot - Firestore document snapshot.
     * @param {object} options - Firestore options.
     * @returns {Recipe} The `Recipe` instance.
     */
    static fromFirestore(snapshot, options) {
        const data = snapshot.data(options);

        const diet = new List(data.diet || []);
        const ingredients = new IngredientList(
            (data.ingredients || []).map(name => name instanceof Ingredient ? name : new Ingredient(name))
        );
        const directions = new List(data.directions || []);
        const savedBy = new List(data.savedBy || []);

        return new Recipe(
            snapshot.id,
            data.name,
            data.imageURL,
            data.description,
            data.category,
            diet,
            data.prepTime,
            data.cookTime,
            data.totalTime,
            ingredients,
            directions,
            data.byUser,
            savedBy,
        );
    }
}
