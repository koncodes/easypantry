<script>
import UserCollection from "@/firebase/UserCollection.js"; 
import { query, where, onSnapshot, documentId } from "firebase/firestore";
import User from "@/models/User.js"; 
import UserListItem from "@/components/UserListItem.vue";
import FriendshipCollection from "@/firebase/FriendshipCollection";

export default {
  name: "UserList",
  components: {UserListItem},
  props: {
    authUser: {
      type: User, 
      required: true
    }
  },
  data() {
    return {
      users: [],
      friendships: [],
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const userCollection = UserCollection.getUsersCollection();
        const queryRef = query(userCollection, where("isAnonymous", "==", false));
        onSnapshot(queryRef, (querySnapshot) => {
          this.users = querySnapshot.docs.map((doc) =>
            User.fromFirestore(doc, {})
          );
        });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
      try {
        // console.log('authUser', this.authUser)
        FriendshipCollection.syncFriendships(this.authUser, this.friendships);
        // console.log('friendships', this.friendships)
      }  catch (error) {
        this.friendships = [];
        console.error("Error fetching friends:", error);
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
  watch: {
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
};
</script>

<template>
  <div class="container-body max-con">
    <h2>User List</h2>
    <div v-if="users.length > 0 && friendships">
      <ul>
          <user-list-item 
            v-for="(user, i) in users" 
            :key="user.id + i" 
            :authUser="authUser"
            :friendships="friendships" 
            :user="user" 
            class="list-group-item"
          />
      </ul>
    </div>
    <div v-else>
      <p>No users found.</p>
    </div>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-top: 10px;
}
</style>
