<script>
import AppOffcanvas from './app/AppOffcanvas.vue';
import Recipe from '@/models/Recipe.js';
import { QuillEditor, Quill } from '@vueup/vue-quill'
import RecipeListItemModal from '@/components/RecipeListItemModal.vue';
import User from '@/models/User';

import AddRecipeModal from '@/components/AddRecipeModal.vue';
import RecipeCollection from '@/firebase/RecipeCollection.js';

import Toaster from "@/components/app/Toaster.vue";
import useToasterStore from "@/stores/useToasterStore";

export default {
    name: "RecipeListItem",
    components: {
        AppOffcanvas, RecipeListItemModal, AddRecipeModal, Toaster
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
        toTitleCase: {
            type: Function
        }
    },
    emits: ['toggleFavorite', 'addIt'],
    data() {
        return {
            description: this.item.description, 
            toasterStore: useToasterStore(),
        };
    },
    computed: {
        safeDescription() {
            try {
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
        successToast(words) {
            this.toasterStore.success({ text: words });
        },
        formatTime(time) {
            if (typeof time === 'string') {
                time = parseInt(time);
            }

            if (time >= 60) {
                const hours = Math.floor(time / 60);
                const minutes = time % 60;
                return `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` and ${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
            } else {
                return `${time} minute${time > 1 ? 's' : ''}`;
            };
        },
        openRecipeListItemModal() {
            this.$refs.recipeListItemModal.open();
        },
        openEditRecipeModal() {
            this.$refs.editRecipeModal.open(); // Open the modal
        },
        deleteRecipe(id) {
            this.successToast('Recipe deleted');
            RecipeCollection.deleteRecipe(id);
        }
    },

}
</script>

<template>
    <div class="recipe-item">
        <div class="recipe-item-image">
        <img v-if="item.imageURL" alt="Recipe Image" class="recipe-item-img" :src="item.imageURL" loading="lazy">
        <img v-else alt="Recipe Image" class="recipe-item-img" src="@/images/lemons.png" loading="lazy">

        <div class="recipe-item-options">
            <i :class="['bi', isInList(this.authUser.favoritesList, item.id) ? 'bi-heart-fill' : 'bi-heart']" @click="$emit('toggle-favorite', item.id)"></i>
            <i class="bi bi-box-arrow-up-right" @click="openRecipeListItemModal"></i>
            <i v-if="item.byUser === this.authUser.id" class="bi bi-pencil"  @click.prevent="openEditRecipeModal"></i>
            <i v-if="item.byUser === this.authUser.id" class="bi bi-trash3"  @click.prevent="deleteRecipe(item.id)"></i>
        </div>
        </div>
        <div class="recipe-item-text">
        <div class="recipe-item-text-head">
            <a href="#" data-bs-toggle="offcanvas" aria-controls="offcanvasRight"
            @click="openRecipeListItemModal"
            ><h6 class="recipe-item-title item-title-nowrap">{{toTitleCase(item.name)}}</h6></a>
        </div>
        <div class="recipe-item-sub-text">
            <div class="recipe-detail"><i class="bi bi-clock"></i> {{ formatTime(item.totalTime) }}
            </div>
        </div>
        </div>
        <recipe-list-item-modal 
            ref="recipeListItemModal"
            :item="item" 
            :is-in-list="isInList" 
            :auth-user="authUser" 
            :format-time="formatTime" 
            :to-title-case="toTitleCase"
            @toggle-favorite="id => $emit('toggle-favorite', id)"
            @add-it="ingredient => $emit('add-it', ingredient)" 
        /> 
        <AddRecipeModal :title="'Edit Recipe: ' + toTitleCase(item.name)" modal-ref="editRecipe" :recipe="item" ref="editRecipeModal" :auth-user="authUser"/>
        <Toaster />
    </div>
</template>

<style scoped>
    
</style>