import {db, userStorage} from '@/firebase';
import {collection, doc, getDoc, onSnapshot, setDoc, query, where, getDocs, updateDoc} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import User from '@/models/User.js';



export default class UserCollection {
    static COLLECTION_NAME = 'easyPantryUsers';
    /**
     * @param {string} uid
     */
    static async getUser(uid){
        const userDocRef = UserCollection.getUserDoc(uid);
        const userDocSnap = await getDoc(userDocRef.withConverter(User))
        return userDocSnap.data();
    }

    /**
     *
     * @param {string} email
     * @returns {Promise<User>}
     */
    static async findUser(email){
        const usersCollection = UserCollection.getUsersCollection();
        const userQuery = query(usersCollection, where('email', '==', email));
        const userDocsSnap = await getDocs(userQuery.withConverter(User))
        return userDocsSnap?.docs[0]?.data();
    }

    static syncUser(uid, user){
        const userDocRef = UserCollection.getUserDoc(uid);
        onSnapshot(userDocRef.withConverter(User), doc => {
            Object.assign(user, doc.data());
        });
    }

    /**
     * @param {User} user
     */
    static async setUser(user){
        const userDocRef = UserCollection.getUserDoc(user.id);
        return setDoc(userDocRef, user.toFirestore());
    }

    static async getUsers() {
        const usersCollection = UserCollection.getUsersCollection();
        const usersSnapshot = await getDocs(usersCollection);
        const usersArray = usersSnapshot.docs.map(doc => User.fromFirestore(doc));
        return usersArray;
    }

    /**
     * @param {string} uid
     */
    static getUserDoc(uid){
        return doc(UserCollection.getUsersCollection(), uid);
    }

    static getUsersCollection(){
        return collection(db, UserCollection.COLLECTION_NAME);
    }

    static async updateUserProfile(user, profileUpdates) {
        const userDocRef = this.getUserDoc(user.id);
        
        if (profileUpdates.image) {
            const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            const extension = profileUpdates.image.name.toLowerCase().split('.').pop();

            if (!allowedTypes.includes(extension)) {
                console.error("Invalid file type.");
                throw new Error("Invalid file type.");
            }

            if (profileUpdates.image.size > 500 * 1024) {
                console.error("File too large. 500KB max.");
                throw new Error("File too large. 500KB max.");
            }

            // Upload image to Firebase Storage
            const imageRef = ref(userStorage, `${user.id}`);
            const snapshot = await uploadBytes(imageRef, profileUpdates.image);
            profileUpdates.avatarURL = await getDownloadURL(snapshot.ref);

            // Remove image from profileUpdates to avoid duplicate processing
            delete profileUpdates.image;
        }

        await updateDoc(userDocRef, profileUpdates);

        console.log("User profile updated successfully.");
    }
}
