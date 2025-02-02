<script>
import AppModal from "@/components/app/AppModal.vue";
import RecipeCollection from "@/firebase/RecipeCollection.js";
import Recipe from "@/models/Recipe.js";
import User from "@/models/User.js";

import {recipeStorage} from '@/firebase';
import {updateDoc, addDoc} from "firebase/firestore";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";

import { QuillEditor, Quill } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import router from "@/router";

import Toaster from "@/components/app/Toaster.vue";
import useToasterStore from "@/stores/useToasterStore";



export default {
  name: "AddRecipeModal",
  components: {AppModal, QuillEditor, Toaster},
  props: {
    authUser: {
      type: User, 
      required: true
    },
    recipe: {
      type: Recipe,
    },
    title: {
      type: String,
      default: "Add a Recipe"
    },
    modalRef: {
      type: String,
      default: "appModal",
    }
  },
  data(){
    return {
      activeTab: 0,
      newRecipe: {
        recipe: new Recipe(
          "",
          "Untitled",
          "",
          "",
          "",
          [],
          0,
          0,
          0,
          [''], 
          [''], 
          this.authUser.id,
          []
        ),
        image: null,
        description: null,
      },
      toasterStore: useToasterStore(),
    }
  },
  methods: {
    successToast(words) {
      this.toasterStore.success({ text: words });
    },
    handleFileChange(event) {
      const file = event.target.files[0]; 
      if (file) {
        this.newRecipe.image = file; 
      }
    },
    updateTotalTime() {
      this.newRecipe.recipe.totalTime =
        this.newRecipe.recipe.prepTime + this.newRecipe.recipe.cookTime;
    },
    setActiveTab(index) {
        this.activeTab = index;
        // console.log("Description before stringify:", this.newRecipe.description);
        // this.newRecipe.recipe.description = JSON.stringify(this.newRecipe.description);
        // console.log(this.newRecipe.recipe.description, this.newRecipe.recipe);
    },
    open() {

      const modal = this.$refs[this.modalRef]; 
      modal.open();

        if(this.recipe) {
            console.log('editing recipe', this.recipe)

            function deepCopyRecipe(recipe) {
              return new Recipe(
                recipe.id,
                recipe.name,
                recipe.imageURL,
                recipe.description,
                recipe.category,
                [...recipe.diet], // Deep copy array
                recipe.prepTime,
                recipe.cookTime,
                recipe.totalTime,
                [...recipe.ingredients], // Deep copy array
                [...recipe.directions], // Deep copy array
                recipe.byUser,
                recipe.savedBy
              );
            }

            this.newRecipe.recipe = deepCopyRecipe(this.recipe);

            const delta = JSON.parse(this.newRecipe.recipe.description);
            const editor = this.$refs.quillEditor.getQuill();
            editor.setContents(delta, "api"); 
        } else {
          console.log('adding new recipe', this.recipe, this.$refs.quillEditor.getQuill())
          this.newRecipe = {
                recipe: new Recipe(
                  "",
                  "Untitled",
                  "",
                  "",
                  "",
                  [],
                  0,
                  0,
                  0,
                  [''], 
                  [''], 
                  this.authUser.id,
                  []
                ), 
                image: null, 
                description: null
              };
              const editor = this.$refs.quillEditor.getQuill();
              editor.setContents('', "api"); 
        };


    },
    closeModal() {
        const modal = this.$refs[this.modalRef]; 
        modal.close();
    },
    async addRecipe() {
        const recipeCollection = RecipeCollection.getRecipesCollection();
        this.newRecipe.recipe.description = await JSON.stringify(this.newRecipe.description);
        const recipeData = this.newRecipe.recipe.toFirestore();
        console.log(recipeData);

        addDoc(recipeCollection, recipeData)
            .then( (docRef) => {
              console.log("Document written with ID: ", docRef);

              this.addImage(docRef.id);
              this.newRecipe = {
                recipe: new Recipe(
                  "",
                  "Untitled",
                  "",
                  "",
                  "",
                  [],
                  0,
                  0,
                  0,
                  [''], 
                  [''], 
                  this.authUser.id,
                  []
                ), 
                image: null, 
                description: null
              };
            })
            .catch(function (error) {
              console.error("Error adding document: ", error);
            })
            .finally(() => {
              this.successToast('Recipe added');
              this.closeModal();
              router.push('/');
            })
    },
    async updateRecipe() {
        const recipeDocRef = RecipeCollection.getRecipeDoc(this.newRecipe.recipe.id);
        this.newRecipe.recipe.description = await JSON.stringify(this.newRecipe.description);
        const recipeData = this.newRecipe.recipe.toFirestore();

        try {
          this.successToast('Recipe Updated');
          this.closeModal();
          await this.addImage(this.newRecipe.recipe.id);
          await updateDoc(recipeDocRef, recipeData);
          this.newRecipe = {
              recipe: new Recipe(
              "",
              "Untitled",
              "",
              "",
              "",
              [],
              0,
              0,
              0,
              [''], 
              [''], 
              this.authUser.id,
              []
            ), 
            image: null, 
            description: null
          };
        } catch (error) {
          console.error("Error updating document: ", error);
        } finally {
          if (this.$refs[this.modalRef]) {
            this.closeModal();
          } else {
              console.error("Modal ref not found");
          }
        }
    },
    addImage(docId) {
      if (!docId || !this.newRecipe.image) {
        return false;
      }

      let theRecipe = this.newRecipe;
      let allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      let extension = theRecipe.image.name.toLowerCase().split('.').pop()

      if (allowedTypes.indexOf(extension) < 0) {
        alert('Invalid file type.');
        return false;
      }

      if (theRecipe.image.size > (500 * 1024)) {
        alert('File too large. 500KB max');
        return false;
      }

      const imageRef = ref(recipeStorage, docId);
      uploadBytes(imageRef, this.newRecipe.image)
          .then(snapshot => {
              this.newRecipe.image = null
              return getDownloadURL(snapshot.ref);
          })
          .then(url => {
              const recipeDoc = RecipeCollection.getRecipeDoc(docId);
              updateDoc(recipeDoc, {imageURL: url});
          })
          .then(docRef => {
            console.log("recipe updated with image");
          })
          .catch(error => {
            console.error('error uploading image', error);
          })
    }
  },
  watch: {
    'newRecipe.recipe.prepTime': function (newPrepTime) {
      this.updateTotalTime();
    },
    'newRecipe.recipe.cookTime': function (newCookTime) {
      this.updateTotalTime();
    },
  },
}
</script>

<template>
  <app-modal :ref="modalRef" :title="title">
    <Toaster />
    <div class="tabs">
      <!-- Tab navigation -->
      <ul role="tablist" class="nav">
        <li role="presentation" class="nav-item">
          <a
            role="tab"
            :class="['nav-link', { active: activeTab === 0 }]"
            @click="setActiveTab(0)"
            id="bs-tabs-description__button"
            aria-controls="bs-tabs-description"
          >
            Description
          </a>
        </li>
        <li role="presentation" class="nav-item">
          <a
            role="tab"
            :class="['nav-link', { active: activeTab === 1 }]"
            @click="setActiveTab(1)"
          >
            Details
          </a>
        </li>
        <li role="presentation" class="nav-item">
          <a
            role="tab"
            :class="['nav-link', { active: activeTab === 2 }]"
            @click="setActiveTab(2)"
            id="bs-tabs-ingredients__button"
            aria-controls="bs-tabs-ingredients"
          >
            Ingredients
          </a>
        </li>
        <li role="presentation" class="nav-item">
          <a
            role="tab"
            :class="['nav-link', { active: activeTab === 3 }]"
            @click="setActiveTab(3)"
            id="bs-tabs-directions__button"
            aria-controls="bs-tabs-directions"
          >
            Directions
          </a>
        </li>
      </ul>

      <!-- Tab content -->
      <div class="tab-content mt-3">
        <!-- Description Tab -->
        <div
          role="tabpanel"
          v-show="activeTab === 0"
          :class="['tab-pane', { active: activeTab === 0 }]"
          id="bs-tabs-description"
          aria-labelledby="bs-tabs-description__button"
        >
          <div class="form-group">
            <label for="name">Name</label>
            <input
              id="name"
              v-model="newRecipe.recipe.name"
              type="text"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label for="image">Image</label>
            <input id="image" type="file" @change="handleFileChange" />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <QuillEditor
            ref="quillEditor"
              id="description"
              v-model:content="this.newRecipe.description"
              rows="5"
              class="form-control"
            ></QuillEditor>
          </div>
        </div>

        <!-- Recipe Info Tab -->
        <div
        role="tabpanel"
        v-show="activeTab === 1"
        :class="['tab-pane', { active: activeTab === 1 }]"
        id="bs-tabs-description"
        aria-labelledby="bs-tabs-description__button"
        >
          <div class="form-group">
            <label for="category">Category</label>
            <select v-model="newRecipe.recipe.category" id="category" class="form-control">
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Dessert</option>
            </select>
          </div>
          <div class="form-group">
            <label>Diet:</label>
            <div class="form-group-diet">
              <div
                v-for="option in ['Vegan', 'Vegetarian', 'Lactose Free', 'Gluten Free']"
                :key="option"
                role="group"
                aria-label="Basic checkbox toggle button group"
              >
                <input
                  :id="'btncheck-' + option"
                  autocomplete="off"
                  type="checkbox"
                  :value="option"
                  v-model="newRecipe.recipe.diet"
                  @change="console.log(newRecipe.recipe.diet.includes(option))"
                />
                <label
                  :for="'btncheck-' + option"
                  :class="['btn', 'btn-outline-primary', { active: this.newRecipe.recipe.diet.includes(option) }]"
                  >
                  {{ option }}
                </label>
            </div>
            </div>
          </div>
          <div class="form-group">
            <label for="prepTime">Prep Time (minutes)</label>
            <input
              v-model.number="newRecipe.recipe.prepTime"
              id="prepTime"
              type="number"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label for="cookTime">Cook Time (minutes)</label>
            <input
              v-model.number="newRecipe.recipe.cookTime"
              id="cookTime"
              type="number"
              class="form-control"
            />
          </div>
          <div class="form-group">
            <label for="totalTime">Total Time (minutes)</label>
            <input
              v-model.number="newRecipe.recipe.totalTime"
              id="totalTime"
              type="number"
              class="form-control"
            />
          </div>
        </div>

        <!-- Ingredients Tab -->
        <div
          role="tabpanel"
          v-show="activeTab === 2"
          :class="['tab-pane', { active: activeTab === 2 }]"
          id="bs-tabs-ingredients"
          aria-labelledby="bs-tabs-ingredients__button"
        >
          <div v-for="(ingredient, i) in newRecipe.recipe.ingredients" class="row no-gutters">
            <div class="col-10">
              <fieldset class="form-group">
                <input
                  v-model="newRecipe.recipe.ingredients[i].name"
                  type="text"
                  class="form-control"
                />
              </fieldset>
            </div>
            <div class="col-2">
              <button @click="newRecipe.recipe.ingredients.splice(i, 1)" class="btn btn-link">
                <i class="bi bi-dash"></i>
              </button>
            </div>
          </div>
          <button @click="newRecipe.recipe.ingredients.addItem('')" class="btn btn-secondary btn-sm">
            Add Ingredient
          </button>
        </div>

        <!-- Directions Tab -->
        <div
          role="tabpanel"
          v-show="activeTab === 3"
          :class="['tab-pane', { active: activeTab === 3 }]"
          id="bs-tabs-directions"
          aria-labelledby="bs-tabs-directions__button"
        >
          <div v-for="(direction, i) in newRecipe.recipe.directions" class="row no-gutters">
            <div class="col-10">
              <fieldset class="form-group">
                <input
                  v-model="newRecipe.recipe.directions[i]"
                  type="text"
                  class="form-control"
                />
              </fieldset>
            </div>
            <div class="col-2">
              <button @click="newRecipe.recipe.directions.splice(i, 1)" class="btn btn-link">
                <i class="bi bi-dash"></i>
              </button>
            </div>
          </div>
            <button @click="newRecipe.recipe.directions.addItem('')" class="btn btn-secondary btn-sm">
              Add Step
            </button>
        </div>
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
      <button v-if="this.recipe" type="button" class="btn btn-primary" @click.stop="updateRecipe">Update Recipe</button>
      <button v-else type="button" class="btn btn-primary" @click.stop="addRecipe">Add Recipe</button>
      <Toaster />
    </template>
  </app-modal>
</template>


<style scoped lang="scss">

@use '@/scss/mixins' as bp;
.form-group {
  margin: 0 0 10px;

  label {
    text-transform: uppercase;
    font-size: .7em;
    letter-spacing: .5px;
    margin: 0 10px 0 0;
    font-weight: 600;
  }
  .form-group-diet {
    display: flex;
    gap: 0;
    width: 100%;
    border: 1px solid var(--color-gray-dark);
    background: transparent;
    border-radius: 5px;
    overflow: hidden;
    gap: 1px;

    > div {
      position: relative;
      flex: 1;
    }

    input {
      opacity: 0;
      position: absolute;
      width: 100%;
      height: 100%;
    }
    label {
      margin: 0;
      flex: 1;
      background: var(--bs-body-bg);
      color: var(--color-off-black);
      border-radius: 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.3em 0;

      &.active {
        background: var(--color-main);
        border-radius: 0;
        color: var(--color-off-white);
      }
    }
  }
}

.nav {
  display: flex;
  gap: 0px;
  width: 100%;
  flex-wrap: nowrap;
  background: rgba(var(--color-off-white-rgba) / 20%);
  border-radius: 5px 5px 0 0;
  overflow: hidden;

  .nav-item {
    flex: 1;


    .nav-link{
    text-align: center;
    display: flex;
    justify-content: center;
    padding: 10px 0px;
    border-radius: 5px 5px 0 0;
    border-bottom: 2px solid var(--color-main);

    &.active {
      color: var(--color-off-black);
      background: var(--bs-body-bg);
      font-weight: 500;
      // border: 2px solid var(--color-main);
      border-bottom: 2px solid var(--color-main);
      position: relative;
      // top: -2px;
      }
    }
  }
}

.btn-secondary {
  background: rgba(var(--color-off-black-rgba) / 11%);
  color: var(--color-off-black);
}

input#image {
  border: 1px solid var(--color-gray-dark);
  display: block;
  width: 100%;
  background: var(--bs-body-bg);
  padding: 0.6em 0.6em;
  font-size: 1em;
  border-radius: 5px;
}
</style>
