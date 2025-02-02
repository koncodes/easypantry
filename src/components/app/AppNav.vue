<script>
import AddRecipeModal from '@/components/AddRecipeModal.vue';
import User from '@/models/User.js';

export default {
    name: "AppNav",
    components: {AddRecipeModal},
    inject: ['logout', 'login'],
    props: {
      authUser: {
        type: User, 
        required: false
      }
    },
    methods: {
      openCreateRecipeModal() {
        this.$refs.createRecipeModal.open(); // Open the modal
      },
    },
}
</script>

<template>
    <div>
      <div class="mobile-border" aria-hidden="true">
        <div class="mobile-border-top"></div>
        <div class="mobile-border-bottom"></div>
        <div class="mobile-border-left"></div>
        <div class="mobile-border-right"></div>
      </div>
      <div class="nav-con">
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
          <a id="sidebar-collapse" class="nav-link" ref="sidebar-collapse" @click="$emit('toggleSidebar')">
            <i class="bi bi-arrow-left"></i> <span></span>
          </a>
          <h1>EasyPantry</h1>
          
          <router-link v-if="!authUser.exists() || authUser?.isAnonymous" to="/login" class="nav-link">
            <i class="bi bi-person-plus"></i>
            <span>Login</span>
          </router-link>
          <template v-else>
            <router-link to="/settings" class="nav-link">
              <i class="bi bi-gear"></i>
              <span>Settings</span>
            </router-link>
            <router-link to="/userlist" class="nav-link">
              <i class="bi bi-people"></i>
              <span>Users</span>
            </router-link>
            <a class="nav-link" @click="openCreateRecipeModal">
              <i class="bi bi-plus-lg"></i>
            </a>

            <AddRecipeModal 
              ref="createRecipeModal" 
              :auth-user="authUser"/>
            <a v-if="authUser?.exists()" class="nav-user nav-link">
              <img v-if="authUser.avatarURL" :src="authUser.avatarURL" :alt="'Avatar of ' + authUser.displayName" :title="authUser.displayName" class="profile-img">
              <router-link :to="{name: 'userProfile', params: {userId: authUser.id}}">{{ authUser.displayName }}</router-link>
            </a>
            <router-link to="/" class="nav-home nav-link">
              <i class="bi bi-house"></i>
              <span>Home</span>
            </router-link>
          </template>
          
        </div>
      </div>
    </div>
</template>

<style scoped>
    
</style>