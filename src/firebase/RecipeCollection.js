import {db} from '@/firebase';
import {collection, doc, getDoc, getDocs, deleteDoc} from "firebase/firestore";
import Recipe from '@/models/Recipe.js';


export default class RecipeCollection {
    static COLLECTION_NAME = 'easyPantryRecipes';
    /**
     * @param {string} id
     */
    static async getRecipe(id){
        const recipeDocRef = RecipeCollection.getRecipeDoc(id);
        const recipeDocSnap = await getDoc(recipeDocRef.withConverter(Recipe))
        return recipeDocSnap.data();
    }

    /**
     * @param {string} id
     */
    static getRecipeDoc(id){
        return doc(RecipeCollection.getRecipesCollection(), id);
    }

    static getRecipeDocs(){
        return getDocs(RecipeCollection.getRecipesCollection());
    }

    static getRecipesCollection(){
        return collection(db, RecipeCollection.COLLECTION_NAME);
    }

    /**
     * Delete a recipe by ID.
     * @param {string} id
     * @returns {Promise<void>}
     */
    static async deleteRecipe(id) {
        try {
            await deleteDoc(doc(db, RecipeCollection.COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting recipe:", error);
        }
    }
}
