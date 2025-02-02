<script>
import { computed, watch } from 'vue';
import User from "@/models/User.js";
import UserCollection from '@/firebase/UserCollection';
import { QuillEditor, Quill } from '@vueup/vue-quill'

import Toaster from "@/components/app/Toaster.vue";
import useToasterStore from "@/stores/useToasterStore";

import AppModal from '@/components/app/AppModal.vue';
import Connect from '@/components/Connect.vue';


export default {
  name: "UserSettings",
  components: {QuillEditor, Toaster, AppModal, Connect},
  inject: ["logout"],
  props: {
      authUser: {
        type: User, 
        required: true
      },
  },
  data() {
    return {
      userForm: Object.assign(new User(), this.authUser),
      newImageFile: null,
      toasterStore: useToasterStore(),
    };
  },
  methods: {
    handleClose(resolve) {
      this.$refs.connectRef.close(); // Close the modal
      console.log("Closed connect modal.");
      if (resolve) resolve(); // Call resolve to unblock the promise in child
    },
    successToast() {
      this.toasterStore.success({ text: "Profile updated." });
    },
    loadBioIntoQuillEditor(bio) {
      if (this.$refs.quillEditor) {
        const quillEditorInstance = this.$refs.quillEditor.getQuill?.();
        if (quillEditorInstance) {
          const delta = bio ? JSON.parse(bio) : {};
          quillEditorInstance.setContents(delta, "api");
        }
      }
    },
    onImageChange(event) {
      this.newImageFile = event.target.files[0];
    },
    onDrop(event) {
      const files = event.dataTransfer.files;
      if (files && files[0]) {
        this.newImageFile = files[0];
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    async updateUserInfo() {
      try {
        const quillEditorInstance = this.$refs.quillEditor.getQuill?.();
        const bioDelta = quillEditorInstance ? quillEditorInstance.getContents() : {};

        const profileUpdates = {
          displayName: this.userForm.displayName,
          email: this.userForm.email,
          image: this.newImageFile,
          bio: JSON.stringify(bioDelta), 
        };

        await UserCollection.updateUserProfile(this.authUser, profileUpdates);

      } catch (error) {
        console.error("Failed to update user profile:", error);
      }
    }
  },
  created() {
    this.loadBioIntoQuillEditor(this.authUser.bio);
  },
  watch: {
    authUser: {
      immediate: true,
      deep: true,
      async handler(newVal) {
        this.userForm = Object.assign(new User(), newVal);
        await this.$nextTick(); 
        this.loadBioIntoQuillEditor(newVal.bio);
      },
    },
  }
};

</script>

<template>
  <div class="container-body max-con d-flex flex-md-row align-items-md-start">
    <div class="user-profile flex-grow-1 d-flex flex-row flex-md-column gap-4">
      <img :src="this.authUser?.avatarURL" alt="Profile Picture" class="profile-img flex-grow-5 w-100"/>
      <div class="user-profile-text flex-grow-1 w-100">
          <p>
            <h2>
              <span>Welcome,</span>
              {{ this.authUser?.displayName || this.authUser?.email }} 
              <i class="bi bi-patch-check-fill"></i>
          </h2>
        </p>
        <button @click="logout" class="btn me-2 mb-2">Logout</button>
        <button @click="$refs.connectRef.open()" class="btn  mb-2">Connect</button>
        <app-modal ref="connectRef" title="Enter QR Code">
          <connect @close="handleClose"/>
        </app-modal>

      </div>
    </div>
    <div class="user-settings flex-grow-1">
      <form @submit.prevent="updateUserInfo">
        
        <div class="d-flex flex-column flex-xl-row gap-2">
          <div class="mb-3 flex-grow-1">
            <label class="form-label"><h5>Display Name</h5></label>
            <input v-model="this.userForm.displayName" type="text" class="form-control"/>
          </div>
          <div class="mb-3 flex-grow-1">
            <label class="form-label"><h5>Email</h5></label>
            <input v-model="this.userForm.email" type="email" class="form-control"/>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label"><h5>Bio</h5></label>
          <QuillEditor
            ref="quillEditor"
            id="description"
            rows="5"
            class="form-control"
          />
        </div>
        <div class="mb-3">
          <label class="form-label"><h5>Image</h5></label>
          <div class="upload-container">
            <div
              class="drop-zone"
              @dragover.prevent
              @drop.prevent="onDrop"
              @click="triggerFileInput"
            >
              <span v-if="!newImageFile">Drag and drop an image here, or click to upload</span>
              <span v-else class="drop-zone-text">Selected File: {{ newImageFile.name }}</span>
            </div>
            <input
              ref="fileInput"
              type="file"
              class="file-input"
              @change="onImageChange"
              hidden
            />
          </div>
        </div>
        <button class="btn" type="submit" @click="successToast">Update Profile</button>
      </form>
      <Toaster />
    </div>
  </div>
</template>


<style scoped lang="scss">

@use '@/scss/mixins' as bp;

.max-con {
  gap: 2em;
  @include bp.min-width(xl) {
    gap: 2.5em;
  }
}

</style>
