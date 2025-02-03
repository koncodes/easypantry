<script>
import Friendship from "@/models/Friendship.js";
import { query, where, getDocs, onSnapshot, documentId } from "firebase/firestore";
import FriendshipCollection from "@/firebase/FriendshipCollection.js";
import UserCollection from "@/firebase/UserCollection.js";
import User from "@/models/User.js";
import FriendshipListItem from "@/components/FriendshipListItem.vue";

import QRCode from 'qrcode';
import Friends from '@/components/Friends.vue';
import RecipeCollection from '@/firebase/RecipeCollection';
import Recipe from '@/models/Recipe';


export default {
  name: "UserProfile",
  components: {FriendshipListItem},
  props: {
    userId: {
      type: String, 
      required: true
    },
    authUser: {
      type: User, 
      required: true
    }
  },
  data() {
    return {
      user: new User(),
      userFriendships: [],
      users: [],
      friendships: [],
      approvedFriends: [],
      loaded: false,
      qrCodeUrl: '', // to hold the QR code image URL
      recipeArray: [],
    }
  },
  methods: {
    addFriend() {
      const friendship = Friendship.createNewFriendship(this.authUser, this.user);
      FriendshipCollection.addFriendship(friendship);
    },
    approveFriendship() {
      this.mutualFriendship.approve();
      FriendshipCollection.setFriendship(this.mutualFriendship);
    },
    async fetchUsers() {
      try {
        // Fetch users
        const userCollection = await UserCollection.getUsersCollection();
        const queryRef = query(
          userCollection,
          where("isAnonymous", "==", false),
          where(documentId(), "!=", this.userId) 
        );
        const querySnapshot = await getDocs(queryRef); 
        this.users = querySnapshot.docs.map((doc) =>
          User.fromFirestore(doc, {})
        );
      } catch (error) {
        console.error("Error fetching users:", error);
        this.users = []; 
      }
      try {
        if (this.user && this.friendships) {
          await FriendshipCollection.syncFriendships(this.user, this.friendships);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
        this.friendships = []; 
      }
    },
    loadRecipes() {
        const recipesCollection = RecipeCollection.getRecipesCollection();

        let queryRef = recipesCollection;

        if (this.searchQuery) {
            queryRef = query(queryRef, where("byUser", "==", this.userId));
        }
        onSnapshot(queryRef, (querySnapshot) => {
            this.recipeArray = [];
            this.recipeArray = querySnapshot.docs.map((doc) => 
                Recipe.fromFirestore(doc, {}) // Leverage the static fromFirestore method
            );
            this.loaded = true;
        })
    },
  },
  computed: {
    mutualFriendship() {
      return this.userFriendships.filter(friendship => !!friendship.getFriend(this.authUser))[0] ?? false;
    },
    friendCount(){
      return this.userFriendships.reduce((total, friendship) => total += friendship.isApproved() ? 1 : 0, 0);
    }
  },
  async created() {
    if (this.userId) {
      this.user = await UserCollection.getUser(this.userId);

      await FriendshipCollection.syncFriendships(this.user, this.userFriendships);
      console.log('userfriendships', this.userFriendships)


      // Generate QR code for the user's profile link
      const currentHost = `${window.location.protocol}//${window.location.host}`;
      this.qrCodeUrl = await QRCode.toDataURL(`${currentHost}/js2/easypantry/dist/#/user/${this.userId}`);

      // simulate wait to demonstrate skeleton loader
      // DON'T LEAVE THIS IN PRODUCTION CODE!!!
      // await new Promise(resolve => setTimeout(resolve, 1000));
      this.loaded = true;

    }
  },
  mounted() {
    this.fetchUsers();
    this.loadRecipes();
    console.log('userId on init', this.userId);
  },
  watch: {
    userId(newVal) {
      console.log('userId changed:', newVal);
    },
    authUser: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.fetchUsers();
        }
      },
      immediate: true,
      deep: true,
    },
  },
}
</script>

<template>
  <div class="container-body max-con d-flex flex-md-row align-items-md-start"
  v-if="loaded && user?.exists()">
    <div class="user-profile flex-grow-1 d-flex flex-row flex-md-column gap-4">
      <img :src="user.avatarURL" class="profile-img flex-grow-5 w-100" :alt="'Photo of ' + user.displayName"/>
      <div class="user-profile-text flex-grow-1 w-100">
          <p>
            <h2>{{ user.displayName }} <i class="bi bi-patch-check-fill"></i></h2>
          </p>
          <div class="card-friendship">
            <span v-if="authUser?.id === userId">
              You have {{friendCount}} friends.
            </span>
            <span v-else-if="mutualFriendship && mutualFriendship.isApproved()">Friends since
              {{ mutualFriendship.getFormattedFriendshipDate() }}
            </span>
            <span v-else-if="mutualFriendship && mutualFriendship.isWaitingOnFriend(authUser)">
              Friendship approval pending
            </span>
            <span v-else-if="mutualFriendship && mutualFriendship.isWaitingOnUser(authUser)">
              <div btn color="primary" @click="approveFriendship()">Approve Friend Request</div btn>
            </span>
            <p v-else>
              <div btn color="primary" @click="addFriend">Add Friend</div btn>
            </p>
          </div>
        </div>
    </div>
    <div class="user-profile-body flex-grow-1">
        <!-- <ul v-if="loaded && user?.exists()">
          <friendship-list-item 
            v-for="(friendship, i) in friendships" 
            :key="user.id + i" 
            :authUser="authUser"
            :friendship="friendship"
            :friendships="friendships" 
            :user="user"
            class="list-group-item"
            />
        </ul> -->
      <div v-if="qrCodeUrl">
        <img :src="qrCodeUrl" alt="QR Code for Profile" />
      </div>
      <div v-for="(item, i) in recipeArray">
        {{item.name}}
      </div>
    </div>
  </div>
  <!-- <div card v-else>
  </div> -->

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
