<script>
export default {
    name: "SearchRecipes",
    data: function(){
        return {
            searchQuery: '',
        };
    },
    props: {
    },

    methods: {
        emitSearch() {
            this.$emit('search-recipes', this.searchQuery);
        }
    },
}</script>

<template>
    <div class="filters-search pantry-input">
        <form class="form-inline d-flex" @submit="emitSearch">
            <input class="form-control" type="search" placeholder="Search Recipes" aria-label="Search"  v-model="searchQuery">
            <button class="btn btn-outline-success" type="submit"><i class="bi bi-search"></i></button>
        </form>
    </div>
</template>

<style scoped>
    
</style>