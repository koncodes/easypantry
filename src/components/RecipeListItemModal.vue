<script>
import AppOffcanvas from './app/AppOffcanvas.vue';
import Recipe from '@/models/Recipe.js';
import { QuillEditor, Quill } from '@vueup/vue-quill'
import User from '@/models/User';

export default {
    name: "RecipeListItemModal",
    components: {
        AppOffcanvas
    },
    props: {
        authUser: {
            type: User, 
            required: true
        },
        item: {
            type: Recipe,
            required: true,
        },
        isInList: {
            type: Function
        },
        formatTime: {
            type: Function
        },
        toTitleCase: {
            type: Function
        }
    },
    emits: ['toggleFavorite', 'addIt'],
    computed: {
        safeDescription() {
            try {
                // console.log('Description:', this.item.description);
                const delta = JSON.parse(this.item.description);
                const editor = new Quill(document.createElement('div'));
                editor.setContents(delta);
                return editor.root.innerHTML;
            } catch (error) {
                return this.item.description; 
            }
        }
    },
    methods: {
        open() {
            this.$refs.recipeOffcanvas.open();         
        },
        closeModal() {
            this.$refs.recipeOffcanvas.close();
        },
        
    }

}
</script>

<template>
    <app-offcanvas ref="recipeOffcanvas">
        <div class="recipe-container">
        <div class="recipe-header-right">
            <h3>{{toTitleCase(item.name)}}</h3>
            <div class="recipe-span">
                <span class="recipe-span-button"><i class="bi bi-box-arrow-up-right"></i></span>
                <span class="recipe-span-button" @click="$emit('toggle-favorite', item.id)"><i :class="['bi', isInList(this.authUser.favoritesList, item.id) ? 'bi-heart-fill' : 'bi-heart']"></i></span>
                <span><i class="bi bi-clock"></i> {{ formatTime(item.totalTime) }}</span>
                <span><i class="bi bi-bell"></i> {{item.category}}</span>
            </div>
        </div>
        <img alt="Recipe Image" :src="item.imageURL" loading="lazy">
        <div v-if="safeDescription.trim() !== '<p><br></p>'" class="recipe-description"><h4>Description</h4>
            <div v-html="safeDescription"></div>
        </div>
        <div class="recipe-ingredients"><h4>Ingredients</h4>
            <ul>
                <li v-for="ingredient in item.ingredients" :key="ingredient.name">
                    <span>{{ toTitleCase(ingredient.name) }}</span>
                    
                    <i v-if="isInList(this.authUser.pantryList, ingredient.name)" class="bi bi-check2"></i>
                    <i v-else class="bi bi-plus-lg" @click="$emit('add-it', ingredient.name)"></i>
                </li>
            </ul>
        </div>
        <div v-if="item.directions && item.directions.length > 0" class="recipe-ingredients"><h4>Directions</h4>
            <ul>
                <li v-for="(direction, i) in item.directions" :key="i">
                    <span>{{ i + 1 }}. {{ direction }}</span>
                </li>
            </ul>
        </div>

        </div>
    </app-offcanvas>
</template>

<style scoped>
    
</style>