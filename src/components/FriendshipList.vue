<script>
import User from "@/models/User.js";
import FriendshipListItem from "@/components/FriendshipListItem.vue";

export default {
  name: "FriendshipList",
  components: { FriendshipListItem },
  props: {
    friendships: { type: Array, required: true },
    authUser: { type: User },
  },
};
</script>

<template>
  <ul>
    <friendship-list-item 
      v-for="(friendship, index) in friendships" 
      :key="index" 
      :friendship="friendship" 
      :auth-user="authUser" 
      class="list-group-item"
    />
  </ul>
</template>

<style scoped>
</style>