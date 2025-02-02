import {collection, doc, getDoc, getDocs, addDoc, deleteDoc, onSnapshot, setDoc, query, where, orderBy} from "firebase/firestore";

import Friendship from "@/models/Friendship.js";
import User from "@/models/User.js";
import {db} from "@/firebase/index.js";

export default class FriendshipCollection {
    static COLLECTION_NAME = 'easyPantryFriendships';

    /**
     * One time call to get an array of friendships
     * @param {User} user
     * @returns {Promise<*>}
     */
    static async getFriendships(user) {
        const friendshipsCollection = FriendshipCollection.getFriendshipsCollection();
        const friendshipsQuery = query(friendshipsCollection, where('friendIds', 'array-contains', user.id));
        const docsSnap = await getDocs(friendshipsQuery.withConverter(Friendship));
        return docsSnap.docs.map(docRef => docRef.data());
    }

    /**
     * Sync an array of friendships
     * @param {User} user
     * @param {Friendship[]} friendships
     */
    static syncFriendships(user, friendships) {
        const friendshipsCollection = FriendshipCollection.getFriendshipsCollection();
        const friendshipsQuery = query(
            friendshipsCollection,
            where('friendIds', 'array-contains', user.id),
            // where('status', '!=', Friendship.STATUSES.DECLINED), // requires an index
        ).withConverter(Friendship);
        onSnapshot(friendshipsQuery, snapshot => {
            friendships.splice(0, friendships.length);
            snapshot.forEach(doc => {
                friendships.push(doc.data());
            })
        });
    }

    static approvedFriendships(user, friendships) {
        const friendshipsCollection = FriendshipCollection.getFriendshipsCollection();
        const friendshipsQuery = query(
            friendshipsCollection,
            where('friendIds', 'array-contains', user.id),
            where('status', '!=', Friendship.STATUSES.APPROVED), 
        ).withConverter(Friendship);
        onSnapshot(friendshipsQuery, snapshot => {
            friendships.splice(0, friendships.length);
            snapshot.forEach(doc => {
                friendships.push(doc.data());
            })
        });
    }


    static getFriendshipsCollection() {
        return collection(db, FriendshipCollection.COLLECTION_NAME);
    }

    /**
     * @param {Friendship} friendship
     */
    static async addFriendship(friendship) {
        const friendshipsCollection = FriendshipCollection.getFriendshipsCollection();
        return addDoc(friendshipsCollection, friendship.toFirestore())
    }

    /**
     * @param {Friendship} friendship
     */
    static getFriendshipDoc(friendship) {
        const friendshipsCollection = FriendshipCollection.getFriendshipsCollection();
        return doc(friendshipsCollection, friendship.id);
    }

    /**
     * @param {Friendship} friendship
     */
    static async setFriendship(friendship) {
        const friendshipDoc = FriendshipCollection.getFriendshipDoc(friendship);
        return setDoc(friendshipDoc, friendship.toFirestore());
    }

    /**
     * @param {Friendship} friendship
     */
    static async deleteFriendship(friendship) {
        const friendshipDoc = FriendshipCollection.getFriendshipDoc(friendship);
        return deleteDoc(friendshipDoc);
    }
}

