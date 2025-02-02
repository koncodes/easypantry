<script>
import AddIngredient from './AddIngredient.vue';
import IngredientsListItem from './IngredientsListItem.vue';
import AppLoader from "@/components/app/AppLoader.vue";
import 'animate.css'
import User from '@/models/User.js';

export default {
    name: "IngredientsList",
    components: {
        AddIngredient, IngredientsListItem, AppLoader
    },
    props: {
        authUser: {
            type: User, 
            required: false
        }
    },
    data() {
        return {
            loaded: false,
        }
    },
    props: {
        authUser: {
            type: User, 
            required: false},
        pantryList: {
            type: Array,
            required: true,
        },
        allIngredientsList: {
            type: Array,
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
    },
    computed: {
        sortedPantryList() {
            const sortedList = [...this.pantryList].sort((a, b) => a.name.localeCompare(b.name));
            // console.log('Sorted Pantry List Keys:', sortedList.map(item => item.name));
            return sortedList;
        }
    },
    async created() {
        if (this.authUser && this.authUser.id) {
            this.loaded = true;
        } else {
            this.$watch(
                () => this.authUser?.id,
                (newVal) => {
                    if (newVal) {
                        this.loaded = true;
                    }
                }
            );
        }
    },
}
</script>

<template>
    <div class="sidebar-container"> 
        <div v-if="loaded && authUser?.exists()">
            <h2>
                <svg class="sidebar-svg" viewBox="0 0 54.21 54.21" xmlns="http://www.w3.org/2000/svg">
                    <path id="sidebar-path" fill="none" stroke-width="0" stroke="transparent" d="M 27.11,0 A 27.11,27.11 0 1,1 27.11,54.22 A 27.11,27.11 0 1,1 27.11,0" />
                    <text id="sidebar-text">
                    <textPath id="sidebar-textpath" href="#sidebar-path">so easy pantry</textPath>
                    </text>
                </svg>
                <span>Your Pantry</span>
            </h2>
            <add-ingredient
                placeholder="Add Ingredient"
                :data-list="allIngredientsList" 
                @add-item="name => $emit('add-item', name)">
            </add-ingredient>

            <div class="wrapper-pantry all-ingredients">
                <TransitionGroup name="list" tag="div" class="section-block" >
                        <ingredients-list-item 
                            v-for="(item, i) in sortedPantryList" 
                            :key="item.name"
                            :item="item"
                            :is-in-list="isInList"
                            :to-title-case="toTitleCase"
                            :auth-user="authUser"
                            @toggle-filter="item => $emit('toggle-filter', item)"
                            @remove-item="item => $emit('remove-item', item)"
                        ></ingredients-list-item>
                </TransitionGroup>
            </div>
        </div>
        <div v-else>
            <p>
                <div class="d-flex align-items-center gap-3">
                    <app-loader shape="circle" size=".7em"/>  
                    <span class="d-flex justify-content-center flex-column gap-2 w-100 h-100">
                        <app-loader shape="line" height=".3em" border-radius="20px" />
                        <app-loader shape="line" height=".3em" border-radius="20px" size="70%"/>
                    </span>
                </div>
            </p>
            <p>
                <app-loader shape="line">
                    <app-loader shape="line" size="100%" height=".3em" border-radius="20px"/>
                </app-loader>
            </p>
            <p>
                <app-loader shape="line">
                    <app-loader shape="line" height=".3em" border-radius="20px" size="70%"/>
                </app-loader>
            </p>
        </div>
    </div>
</template>

<style scoped>
    p {
        margin-bottom: 15px;
        font-size: 3em;
        line-height: 100%;
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
}

/* Ensure proper positioning for leaving elements */
.list-leave-active {
  position: absolute;
}



</style>