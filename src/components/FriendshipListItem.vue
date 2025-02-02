<script>
import Friendship from "@/models/Friendship.js";
import Friend from "@/models/Friend";
import FriendshipCollection from "@/firebase/FriendshipCollection.js";
import User from "@/models/User.js";

export default {
  name: "FriendshipListItem",
  props: {
    friendship: {
      type: Friendship,
      required: true,
    },
    user: {
      type: User,
      default: null,
      required: false,
    },
    authUser: {
      type: User,
      required: true,
    },
    friendships: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      avatarUser: new Friend(),
      newFriendship: this.friendship ?? new Friendship(),
      isLoaded: false,
    };
  },
  methods: {
    addFriendship() {
      const friendship = Friendship.createNewFriendship(this.authUser, this.user);
      FriendshipCollection.addFriendship(friendship);
    },

    approveFriendship(friendship) {
      friendship.approve();
      FriendshipCollection.setFriendship(friendship);
    },

    declineFriendship(friendship) {
      friendship.decline();
      FriendshipCollection.setFriendship(friendship);
    },

    deleteFriendship(friendship) {
      FriendshipCollection.deleteFriendship(friendship);
    },

    loadUser() {
      if (this.friendship) {
        this.avatarUser = this.friendship.getFriend(this.authUser);
      } else if (this.user) {
        this.avatarUser = this.user;
      } else {
        this.avatarUser = new Friend();
      }
    },

    checkLoaded() {
      if (this.authUser && this.user && this.friendships) {
        this.isLoaded = true;
        this.loadUser();
      }
    },
  },
  computed: {
    existingFriendship() {
      if (!this.user || !this.friendships) {
        return false;
      }

      if (this.newFriendship) {
        return true;
      }

      return this.friendships.some((friendship) =>
        friendship.friends.some((friend) => friend.id === this.user.id)
      );
    },
  },
  watch: {
    authUser: {
      handler() {
        this.checkLoaded();
      },
      immediate: true,
      deep: true,
    },
    friendships: {
      handler() {
        this.checkLoaded();
      },
      immediate: true,
      deep: true,
    },
    newFriendship: {
      handler() {
        this.checkLoaded();
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    this.checkLoaded();
  },
};
</script>

<template>
  <li v-if="isLoaded" class="list-group-item d-flex align-items-center friend-list-item">
    <router-link
      v-if="avatarUser?.id"
      :exact="true"
      :to="{ name: 'userProfile', params: {userId: avatarUser.id} }"
      class="d-flex align-items-center text-decoration-none"
    >
      <img :src="avatarUser?.avatarURL" class="profile-img me-3" />
      {{ avatarUser?.displayName }}
    </router-link>
    <div class="dropdown ms-auto">
      <button
        class="btn btn-link dropdown-toggle"
        type="button"
        id="dropdownMenuButton"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="bi bi-three-dots"></i>
      </button>
      <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <li>
          <router-link
            v-if="avatarUser?.id"
            :to="{ name: 'userProfile', params: { userId: avatarUser.id } }"
            v-slot="{ href, navigate }"
          >
            <button
              :href="href"
              @click="navigate"
              class="dropdown-item d-flex align-items-center text-decoration-none"
            >
              View Profile
            </button>
          </router-link>
        </li>
        <li v-if="!existingFriendship && avatarUser?.id !== authUser?.id">
          <button class="dropdown-item text-success" @click="addFriendship(friendship)">Add Friend</button>
        </li>
        <li v-if="friendship?.isWaitingOnFriend(authUser) && avatarUser?.id !== authUser?.id">
          <button class="dropdown-item text-danger" @click="deleteFriendship(newFriendship)">Cancel Request</button>
        </li>
        <li v-if="friendship?.isWaitingOnUser(authUser) && avatarUser?.id !== authUser?.id">
          <button class="dropdown-item text-danger" @click="declineFriendship(newFriendship)">Decline Request</button>
        </li>
        <li v-if="friendship?.isWaitingOnUser(authUser) && avatarUser?.id !== authUser?.id">
          <button class="dropdown-item text-success" @click="approveFriendship(newFriendship)">Approve Request</button>
        </li>
        <li v-if="friendship?.isApproved() && avatarUser?.id !== authUser?.id">
          <button class="dropdown-item text-danger" @click="deleteFriendship(newFriendship)">Unfriend</button>
        </li>
      </ul>
    </div>
  </li>
  <li v-else>
    Loading...
  </li>
</template>

<style scoped>
.me-3 {
  margin-right: 1rem;
}
.ms-auto {
  margin-left: auto;
}

.friend-list-item {
  .profile-img {
    width: 50px;
    height: 50px;
  }
}
</style>