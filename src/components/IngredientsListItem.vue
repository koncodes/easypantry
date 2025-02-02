<script>
import User from '@/models/User.js';

export default {
    name: "IngredientsListItem",
    props: {
        authUser: {
            type: User, 
            required: false
        },
        item: {
            type: Object,
            required: true,
        },
        isInList: {
            type: Function
        },
        toTitleCase: {
            type: Function
        }
    },

    methods: {
        toggleFilter() {
            this.$emit('toggle-filter', this.item.name);
        },
        removeItem() {
            this.$emit('remove-item', this.item.name);
        },
    },
}
</script>

<template>
    <div class="pantry-list-item">
        <div class="pantry-list-icons">
            <button :class="[
                            'ingredients-items-btn', 
                            'add-to-pantry-icon', 
                            'ingredient', 
                            isInList(this.authUser.filterList, item.name) ? 'filtered' : '']" @click.prevent="toggleFilter"></button>
        </div>
        <div class="ingredient-name" @click.prevent="toggleFilter">{{ toTitleCase(item.name) }}</div>
        <div class="pantry-list-icons">
            <button @click.prevent="removeItem">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
    
</style>