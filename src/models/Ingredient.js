export default class Ingredient {
    static nextId = 1;
    constructor(name, quantity = 0, unit = 'unit') {
        this.id = Ingredient.nextId++;
        this.name = name.toLowerCase();
        this.quantity = quantity; 
        this.unit = unit;
    }
}