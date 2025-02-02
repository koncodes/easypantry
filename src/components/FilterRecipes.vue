<script>
export default {
    name: "FilterRecipes",
    props: {
      title: {
        type: String,
        required: true,
      },
      filterName: {
        type: String,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      emitFilter() {
        this.$emit('filter', this.filterName);
      },
      emitClear() {
        this.$emit('clear', this.filterName);
      },
    },
}</script>

<template>
    <button class="filter-item" :class="{ 'active-filter': isActive }">
        <span class="filter-option" @click="emitFilter">{{ title }}</span>
        <i class="bi bi-x" v-if="isActive" @click.prevent="emitClear"></i>
    </button>
</template>

<style scoped>
    
</style>