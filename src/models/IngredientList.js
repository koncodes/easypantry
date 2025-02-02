
import Ingredient from '@/models/Ingredient.js';

export default function IngredientList(list) {
    list = Array.isArray(list) ? list : [];

    list.addItem = function(item) {
        if (!(item instanceof Ingredient)) {
            item = new Ingredient(item);
        }
        this.push(item);
        return this;
    }

    list.removeItem = function(itemName) {
        const index = this.findIndex(ingredient => ingredient.name === itemName);
        if (index !== -1) {
            this.splice(index, 1);
        }
        return this;
    }

    list.clearItems = function() {
        // Clear all elements from the list
        this.splice(0, this.length);
        return this;
    };

    list.getItems = function() {
        return this.map(ingredient => ingredient.name);
    }

    list.isInList = function(ingredientName) {
        return this.some(ingredient => 
            ingredient.name && ingredient.name.toLowerCase() === ingredientName.toLowerCase()
        );
    }

    return list;
}