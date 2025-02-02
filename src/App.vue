<script>
import router from "@/router/index.js";
import {RouterView} from 'vue-router'
import AppSplash from '@/components/app/AppSplash.vue';
import AppNav from '@/components/app/AppNav.vue';
import AppHeader from '@/components/app/AppHeader.vue';
import AppFooter from '@/components/app/AppFooter.vue';
import IngredientsList from '@/components/IngredientsList.vue';
import RecipeList from '@/components/RecipeList.vue';
import Recipe from '@/models/Recipe.js';

import {onAuthStateChanged, signInWithPopup, signOut} from "firebase/auth";
import {auth} from "@/firebase/index.js";
import {computed} from "vue";
import UserCollection from "@/firebase/UserCollection.js";
import User from '@/models/User.js';
import RecipeCollection from "@/firebase/RecipeCollection";

import Toaster from "@/components/app/Toaster.vue";
import useToasterStore from "@/stores/useToasterStore";



export default {
  components: {
    AppSplash, AppNav, AppHeader, AppFooter, IngredientsList, RecipeList, Toaster
  },
  data() {
        return {
            authUser: new User(false),
            showSplash: true,
            allIngredientsList: [],
            toasterStore: useToasterStore(),
        };
    },
    mounted() {
        setTimeout(() => {
          this.showSplash = false;
        }, 10000);
        if(localStorage.getItem('showSplash')){
            this.showSplash = JSON.parse(localStorage.getItem('showSplash'));
        }
    },
    watch: {
        showSplash: {
            handler(newValue) {
                localStorage.setItem('showSplash', JSON.stringify(newValue));
            },
            deep: false, // Not needed for primitive values
        },
    },
    // methods: usually "events" triggered by v-on:
    methods: {
        hideIntro() {
          this.showSplash = false;
        },
        successToast(words) {
          this.toasterStore.success({ text: words });
        },
        errorToast(words) {
          this.toasterStore.error({ text: words });
        },
        toggleSidebar() {
            this.$refs.main.classList.toggle('hidesidebar');
        },
        itemExists(item, name) {
            if (typeof item === 'string') {
                return item === name;
            }
            if (item && typeof item === 'object' && item.hasOwnProperty('name')) {
                return item.name === name;
            }
            return false;
        },
        toggleItem(list, name) {
            const exists = list.some(item => this.itemExists(item, name));

            if (exists) {
                this.removeItem(list, name);
                console.log("Added");

            } else {
                this.addItem(list, name);
                console.log("Deleted");
            }
        },
        async addItem(list, name) {
            const exists = list.some(item => this.itemExists(item, name));
            if (exists) {
                console.log(`${name} is already in the pantry.`);
                return;
            }
            list.addItem(name);

            try {
                await UserCollection.setUser(this.authUser);
                console.log("List updated successfully");
            } catch (error) {
                console.error("Error updating list:", error);
            }
        },
        async removeItem(list, name) {
            list.removeItem(name);

            if (list === this.authUser.pantryList) {
              this.authUser.filterList.removeItem(name);
            };

            try {
                await UserCollection.setUser(this.authUser);
                console.log("List updated successfully");
            } catch (error) {
                console.error("Error updating list:", error);
            }
        },
        isInList(list, value) {
            return list.isInList(value);
        },
        async clearFilters() {
          if (this.authUser?.id) {
            this.authUser.filterList.clearItems();
            await UserCollection.setUser(this.authUser);
          }
        },
        login() {
            signInWithPopup(auth, authProvider)
              .then(result => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                // const credential = GoogleAuthProvider.credentialFromResult(result);
                // const token = credential.accessToken;
                // The signed-in user info.
                // const user = result.user;
              })
              .then(() => router.push('/'))
              .catch(error => console.error('login failed', error));
        },
        logout() {
          signOut(auth)
              .then(() => router.push('/'))
              .catch(error => console.error('logout failed', error));
          this.successToast('Logged out.');

        },
        async allIngredients() {
          try {
            const querySnapshot = await RecipeCollection.getRecipeDocs();
            const recipes = querySnapshot.docs.map(doc => Recipe.fromFirestore(doc));

            const recipesSet = new Set(
                recipes.flatMap(recipe => recipe.ingredients.getItems().map(item => item.toLowerCase()))
            );
            const uniqueItems = Array.from(new Set([...recipesSet]));
            return uniqueItems;
          } catch (error) {
              console.error("Error fetching ingredients:", error);
              return [];
          }
      },
      toTitleCase(str) {
            return str
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
      }
    },
    async created() {
      try {
          this.allIngredientsList = await this.allIngredients();
          // console.log(this.allIngredientsList)
      } catch (error) {
          console.error("Failed to fetch ingredients:", error);
      };
      onAuthStateChanged(auth, firebaseUser => {
        if (firebaseUser) {
          // logged in
          console.log('logged in' + firebaseUser);
          UserCollection.getUser(firebaseUser.uid)
              .then(dbUser => {
                if (dbUser && dbUser.exists()) {
                  // we have an existing user
                  return dbUser;
                } else {
                  // create new user
                  const newUser = new User(firebaseUser.uid, firebaseUser.displayName, firebaseUser.email, firebaseUser.photoURL);

                  console.log('Creating new user.', newUser);
                  return UserCollection.setUser(newUser);
                }
              })
              .then(() => {
                UserCollection.syncUser(firebaseUser.uid, this.authUser);
                // console.log('user' + this.authUser);
              })
              .catch(error => console.error('Error with login.', {firebaseUser, error}));

        } else {
          // logged out
          console.log('logged out');
          this.authUser = new User();
        }
      });
    },
    // https://vuejs.org/guide/components/provide-inject#working-with-reactivity
    provide() {
      return {
        authUser: computed(() => this.authUser),
        handleAuth: this.handleAuth,
        login: this.login,
        logout: this.logout,
      }
    },
}
</script>

<template>
  <a href="#main-content" class="visually-hidden">Skip to main content</a>
  <div class="wrapper" id="app">
    <AppSplash v-if="showSplash && !authUser?.exists()" />
    <main ref="main">

      <app-nav 
        @toggle-sidebar="toggleSidebar" 
        :auth-user="authUser"
      ></app-nav>

      <div class="sidebar tab-pane fade show showsidebar" id="sidebar" role="tabpanel" aria-labelledby="sidebar-tab" tabindex="0">
        <Toaster />

        <ingredients-list 
          :pantry-list="authUser.pantryList" 
          :all-ingredients-list="allIngredientsList"
          :is-in-list="isInList"
          :to-title-case="toTitleCase"
          :auth-user="authUser"
          @add-item="ingredient => addItem(this.authUser.pantryList, ingredient)"
          @toggle-filter="item => toggleItem(this.authUser.filterList, item)"
          @remove-item="ingredient => removeItem(this.authUser.pantryList, ingredient)"
        ></ingredients-list>

          
        </div>
      <div class="main-con fade show active" id="nav-home">
        <app-header></app-header>
        <div class="container-main w-100 d-flex flex-column">
          <router-view
            :key="$route.params.userId"
            :is-in-list="isInList"
            :to-title-case="toTitleCase"
            @toggle-favorite="id => toggleItem(this.authUser.favoritesList, id)"
            @add-it="ingredient => addItem(this.authUser.pantryList, ingredient)"
            @clear-filters="clearFilters"
            @toggle-filter="item => removeItem(this.authUser.filterList, item)"
            :auth-user="authUser"
            />
        </div>
        <app-footer></app-footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
</style>
