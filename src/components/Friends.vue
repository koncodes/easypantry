<script>
import User from "@/models/User.js";
import FriendshipCollection from "@/firebase/FriendshipCollection.js";
import Friendship from "@/models/Friendship.js";
import FriendshipListItem from "@/components/FriendshipListItem.vue";
import FriendshipList from "@/components/FriendshipList.vue";

export default {
  name: "FriendsView",
  components: {
    FriendshipList,
    FriendshipListItem
  },
  props: {
    authUser: { 
      type: User, 
      required: true 
    },
    user: { 
      type: User, 
      required: true 
    },
  },
  data() {
    return {
      friendships: [],
      friendsTab: "friends",
    };
  },
  methods: {
    loadFriendships() {
      if (this.user?.exists()) {
        FriendshipCollection.syncFriendships(this.user, this.friendships);
        console.log(this.friendships)
      } else {
        this.friendships = [];
      }
    },
  },
  computed: {
    approvedFriendships() {
      return this.friendships.filter(
        (friendship) => friendship.status === Friendship.STATUSES.APPROVED
      );
    },
    pendingFriendships() {
      const friends = this.friendships.filter(
        (friendship) => friendship.status === Friendship.STATUSES.PENDING
      );
      return this.friendships.filter(
        (friendship) => friendship.status === Friendship.STATUSES.PENDING
      );
    },
  },
  mounted() {
    this.loadFriendships();
  },
  watch: {
    authUser: {
      handler() {
        this.loadFriendships();
      },
      deep: true,
    },
  },
};
</script>

<template>
  <div class="mb-4">
        <div class="">
          <friendship-list :friendships="friendships" :auth-user="authUser" />
      </div>
    </div>
</template>

<style scoped>
</style>
