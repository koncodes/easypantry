<script>
import FilterRecipes from './FilterRecipes.vue';
import SearchRecipes from './SearchRecipes.vue';
import MultifilterRecipes from './MultifilterRecipes.vue';
import RecipeListItem from './RecipeListItem.vue';
import AppOffcanvas from './app/AppOffcanvas.vue';
import AppLoader from "@/components/app/AppLoader.vue";

import {onSnapshot, query, where, documentId} from "firebase/firestore";

import User from '@/models/User';
import Recipe from '@/models/Recipe';
import RecipeCollection from '@/firebase/RecipeCollection';

export default {
    name: "RecipeList",
    components: {
        SearchRecipes, FilterRecipes, MultifilterRecipes, RecipeListItem, AppOffcanvas, AppLoader
    },
    data: function(){
        return {
            loaded: false,
            recipeArray: [],
            searchQuery: null,
            filters: {
                favoriteFilter: false,
                veganFilter: false,
            },
            multifilters: {
                diet: null,
                category: null,
            },
            filterOptions: {
                diet: [
                    { id: 'vegan', value: 'Vegan' },
                    { id: 'vegetarian', value: 'Vegetarian' },
                    { id: 'lactoseFree', value: 'Lactose Free' },
                    { id: 'glutenFree', value: 'Gluten Free' }
                ],
                category: [
                    { id: 'breakfast', value: 'Breakfast' },
                    { id: 'lunch', value: 'Lunch' },
                    { id: 'dinner', value: 'Dinner' },
                    { id: 'dessert', value: 'Dessert' },
                ]
            },
        };
        
    },
    props: {
        isInList: {
            type: Function
        },
        authUser: {
            type: User, 
            required: true
        },
        toTitleCase: {
            type: Function
        }
    },

    methods: {
        removeFilterItem(item) {
            this.$emit('toggle-filter', item.name);
            this.loadRecipes();
        },
        searchRecipes(search) {
            this.searchQuery = search.toLowerCase();
            this.loadRecipes();
        },
        clearFilters() {
            for (let filter in this.filters) {
                this.filters[filter] = false;
            }
            for (let filter in this.multifilters) {
                this.multifilters[filter] = null;
            }
            this.$emit('clear-filters');
            this.loadRecipes();
        },
        handleFilter(filterName) {
            this.filters[filterName + 'Filter'] = true; 
            this.loadRecipes();
        },
        clearFilter(filterName) {
            this.filters[filterName + 'Filter'] = false;
            this.loadRecipes();
        },
        handleMultifilter(filterName, value) {
            this.multifilters[filterName] = value;
            this.loadRecipes();
        },
        clearMultifilter(filterName) {
            this.multifilters[filterName] = null;
            this.loadRecipes();
        },
        
        loadRecipes() {
            const recipesCollection = RecipeCollection.getRecipesCollection();

            let queryRef = recipesCollection;

            if (this.searchQuery) {
                queryRef = query(queryRef, where("tags", "array-contains", this.searchQuery));
            }
            
            if (this.filters.favoriteFilter) {
                queryRef = query(queryRef, where(documentId(), "in", this.authUser.favoritesList));
            }

            if (this.multifilters.diet) {
                queryRef = query(queryRef, where("diet", "array-contains", this.multifilters.diet));
            }

            if (this.multifilters.category) {
                queryRef = query(queryRef, where("category", "==", this.multifilters.category));
            }

            if (this.authUser.filterList && this.authUser.filterList.length > 0) {
                const filterNames = this.authUser.filterList.map(filter => filter.name);
                queryRef = query(queryRef, where("ingredients", "array-contains-any", filterNames));

                console.log(filterNames);
            }

            onSnapshot(queryRef, (querySnapshot) => {
                this.recipeArray = [];
                this.recipeArray = querySnapshot.docs.map((doc) => 
                    Recipe.fromFirestore(doc, {}) // Leverage the static fromFirestore method
                );
                this.loaded = true;
            })
        },
    },
    mounted() {
        this.loadRecipes();
    },
    computed: {
        
    },
    watch: {
        "authUser.filterList": {
            handler() {
                this.loadRecipes();
            },
            deep: true,
        },
    },
}
</script>

<template>
    <div class="container-body max-con"> 
        <div v-if="loaded">
            <div class="filters">
                <search-recipes @search-recipes="searchRecipes"></search-recipes>
                
                <button class="filter-item active-filter" v-for="(item, i) in authUser.filterList"  :key="item.id">
                    <span class="filter-option">{{item.name}}</span>
                    <i class="bi bi-x" @click.prevent="removeFilterItem(item)"></i>
                </button>

                <filter-recipes v-if="authUser?.exists()"
                    title="Favorites" 
                    filter-name="favorite" 
                    @filter="handleFilter"
                    @clear="clearFilter"
                    :is-active="filters.favoriteFilter"
                ></filter-recipes>

                <multifilter-recipes
                    v-for="(filterValue, filterName) in multifilters"
                    :key="filterName"
                    :filter-name="filterName"
                    :filter-options="filterOptions[filterName]"
                    :selected-filter="filterValue"
                    @select-filter="handleMultifilter"
                    @clear-filter="clearMultifilter">
                </multifilter-recipes>

                <button class="filter-item"><span class="filter-option" @click="clearFilters">Clear</span></button>
            </div><!-- /filters -->
            <h3>You can make  {{recipeArray.length}} recipes</h3>
            <TransitionGroup name="list" class="recipes" tag="div">
                <recipe-list-item 
                    :auth-user="authUser"
                    :item="item" 
                    v-for="(item, i) in recipeArray" 
                    :key="item.id + i"
                    :is-in-list="isInList"
                    :to-title-case="toTitleCase"
                    @toggle-favorite="id => $emit('toggle-favorite', id)"
                    @add-it="ingredient => $emit('add-it', ingredient)"
                ></recipe-list-item>
            </TransitionGroup>
        </div>
        <div v-else>
            <div class="filters justify-content-start">
                <app-loader shape="line" size="200px" border-radius="100px" height="43px" class="p-2 ps-3 d-flex g-2 skeleton-light">
                    <app-loader shape="line" height="13.5px" border-radius="20px" class="me-5"/>
                    <app-loader shape="circle" size="27px"/>  
                </app-loader> 
                
                <!-- <app-loader shape="line" size="120px" border-radius="100px" height="43px" class="p-2 px-3 d-flex g-2 skeleton-light">
                    <app-loader shape="line" height="13.5px" border-radius="20px" class="me-2" size="70px"/>
                </app-loader> -->
            </div>
            <h3>
                <app-loader shape="line" size="200px" border-radius="20px" height="13.5px" class="mb-2"/>
                <app-loader shape="line" size="300px" border-radius="20px" height="13.5px"/>
            </h3>
            <div class="recipes">
                <div v-for="n in 8" :key="n" class="recipe-item skeleton-recipe-item">
                    <p class="recipe-item-image">
                        <app-loader shape="square" height="3em">
                            <span class="recipe-item-options">
                                <app-loader shape="circle" size=".6em"/>  
                                <app-loader shape="circle" size=".6em"/>  
                            </span>
                        </app-loader>
                    </p>
                    <p>
                        <div class="d-flex align-items-center gap-3  p-3 pt-0">
                            <span class="d-flex justify-content-center flex-column gap-2 w-100 h-100">
                                <app-loader shape="line" height=".3em" border-radius="20px" />
                                <app-loader shape="line" height=".3em" border-radius="20px" size="70%"/>
                            </span>
                        </div>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    p {
        margin-bottom: 0;
        font-size: 3em;
        line-height: 100%;
    }

    .skeleton-recipe-item {
        box-shadow: none;
    }

    .skeleton-recipe-item:hover {
        box-shadow: none;
    }
    .skeleton-recipe-item .recipe-item-image .recipe-item-options::before {
        left: -40px;
    }
    .skeleton-recipe-item .recipe-item-image .recipe-item-options::before {
        bottom: -43px;
    }
    /* Apply transitions only to entering and leaving items */
.list-enter-active,
.list-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
  z-index: -1;
}

/* Ensure proper positioning for leaving elements */
.list-leave-active {
    opacity: 0;
    position: absolute;
    transition: opacity .3 ease, transform .3s ease, position 0s ease;
    z-index: -1;
}
</style> 