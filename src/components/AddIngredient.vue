<script>
export default {
    name: "AddIngredient",
    data: function(){
        return {
            item: '',
        };
    },
    props: {
        placeholder: {
            type: String,
            default: 'Add Item'
        },
        dataList: {
            type: Array,
            required: false
        }
    },

    methods: {
        addIt(item) {
            if (!item.trim()) {
                return;
            }
            this.$emit("add-item", String(item).trim());
            this.item = "";
        },
    },
}</script>

<template>
    <div>
        <form class="form-inline d-flex item-add"  @submit.prevent="addIt(this.item)">
            <input class="form-control" type="text" :placeholder="placeholder" aria-label="Add Ingredient" v-model="item" list="data-list">
            <datalist v-if="dataList" id="data-list">
                <option v-for="data in dataList" :key="data" :value="data">{{ data }}</option>
            </datalist>
            <button class="btn btn-outline-success" type="submit"><i class="bi bi-plus"></i></button>
        </form>
    </div>
</template>

<style scoped>
    
</style>