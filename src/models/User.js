import Ingredient from "@/models/Ingredient.js";
import IngredientList from "@/models/IngredientList.js";
import List from "@/models/List.js";

export default class User {
    
    constructor(id, name, email, avatarURL, isAnonymous, pantryList, filterList, favoritesList, bio) {
        this.id = id ?? '';
        this.displayName = name ?? 'Anonymous';
        this.email = email ?? '';
        this.avatarURL = avatarURL ?? '';
        this.isAnonymous = isAnonymous ?? false;
        
        this.pantryList = pantryList instanceof IngredientList ? pantryList
            : new IngredientList((pantryList || []).map(item => item instanceof Ingredient ? item : new Ingredient(item)));
        
        this.filterList = filterList instanceof IngredientList ? filterList
            : new IngredientList((filterList || []).map(item => item instanceof Ingredient ? item : new Ingredient(item)));

        this.favoritesList = Array.isArray(favoritesList) ? new List(favoritesList) : new List([]);
        this.bio = bio ?? "";

        return this;
    }

    exists() {
        return !!this.id;
    }

    toFirestore() {
        let displayName = this.displayName;
        let email = this.email;
        let avatarURL = this.avatarURL;
        let isAnonymous = this.isAnonymous;

        let pantryList = Array.isArray(this.pantryList) 
            ? this.pantryList.map(ingredient => ingredient.name) 
            : [];
        let filterList = Array.isArray(this.filterList) 
            ? this.filterList.map(ingredient => ingredient.name) 
            : [];
        let favoritesList = Array.isArray(this.favoritesList) 
            ? this.favoritesList.map(item => item) 
            : [];
        let bio = this.bio;


        return {displayName, email, avatarURL, isAnonymous, pantryList, filterList, favoritesList, bio};
    }

    static fromFirestore(snapshot, options) {
        const data = snapshot.data(options);

        const pantryList = new IngredientList(
            (data.pantryList || []).map(name => name instanceof Ingredient ? name : new Ingredient(name))
        );
        const filterList = new IngredientList(
            (data.filterList || []).map(name => name instanceof Ingredient ? name : new Ingredient(name))
        );        
        const favoritesList = new List(data.favoritesList || []);

        return new User(snapshot.id, data.displayName, data.email, data.avatarURL, data.isAnonymous, pantryList, filterList, favoritesList, data.bio);
    }
}
