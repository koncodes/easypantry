export default function List(list) {
    list = Array.isArray(list) ? list : [];

    list.addItem = function(item) {
        this.push(item);
        return this;
    }

    list.removeItem = function(item) {
        const index = this.indexOf(item);
        if (index !== -1) {
            this.splice(index, 1);
        }
        return this;
    };

    list.clearItems = function() {
        this.splice(0, this.length);
        return this;
    };

    list.getItems = function() {
        return [...this];
    };

    list.isInList = function(item) {
        return this.includes(item);
    };

    return list;
}