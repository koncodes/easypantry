<script>
import AppOffcanvas from './app/AppOffcanvas.vue';

export default {
    name: "MultifilterRecipes",
    components: {
      AppOffcanvas
    },
    props: {
      filterName: {
        type: String,
        required: true,
      },
      filterOptions: {
        type: Array,
        required: true,
      },
      selectedFilter: {
        type: String,
        default: null,
      }
    },
    methods: {
      clearFilter() {
        this.$emit('clearFilter', this.filterName);
      },
      selectFilter(option) {
        this.$emit('selectFilter', this.filterName, option);
      },
    },
}</script>

<template>
    <button class="filter-item" :class="{ 'active-filter': selectedFilter !== null }">
      <span class="filter-option" data-bs-toggle="offcanvas"
            :aria-controls="filterName + 'Offcanvas'"
            @click="$refs.multifilterOffcanvas.open()">
        {{ filterName }}: {{ selectedFilter || 'None' }}
      </span>
      <i class="bi bi-x" v-if="selectedFilter !== null" @click="clearFilter"></i>

      <app-offcanvas :title="'Filters: ' + filterName" 
                    placement="bottom"
                    ref="multifilterOffcanvas">
        <div class="tags">
          <span class="form-check" v-for="option in filterOptions" :key="option.id">
            <input 
              class="form-check-input" 
              type="radio" 
              :name="filterName" 
              :id="option.id" 
              :value="option.value" 
              :checked="selectedFilter === option.value"
              @change="selectFilter(option.value)"
              @click="$refs.multifilterOffcanvas.close()"
            />
            <label class="form-check-label" :for="option.id">{{ option.value }}</label>
          </span>
        </div>
      </app-offcanvas>
    </button>
</template>

<style scoped>
    
</style>