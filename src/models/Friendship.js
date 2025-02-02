import Friend from "@/models/Friend.js";
import FriendshipCollection from "@/firebase/FriendshipCollection.js";

export default class Friendship {
    static STATUSES = {
        PENDING: 'pending', APPROVED: 'approved', DECLINED: 'denied'
    }

    id;
    added;
    status;

    /**
     * An array of friend objects
     * @type {Friend[]}
     */
    friends = [];

    /**
     * @param {Date} added
     * @param {string} status
     * @param {Friend[]} friends
     * @returns {Friendship}
     */
    constructor(added, status, friends) {
        this.added = added ?? new Date();
        this.status = status ?? Friendship.STATUSES.PENDING;
        this.friends = friends ?? [];

        return this;
    }

    toFirestore() {
        let added = this.added;
        let status = this.status;
        let friends = this.friends.map(friend => friend.toFirestore());
        let friendIds = this.friends.map(friend => friend.id);
        return {added, status, friends, friendIds};
    }

    static fromFirestore(snapshot, options) {
        const data = snapshot.data(options);

        const friends = data.friends.map(friend => Friend.fromObject(friend));
        const friendship = new Friendship(data.added.toDate(), data.status, friends);
        friendship.id = snapshot.id || 0;

        return friendship;
    }

    /**
     * @param {User} currentUser
     * @returns {Friend}
     */
    getFriend(currentUser){
        return this.friends.find(friend => currentUser.id !== friend.id);
    }

    /**
     *
     * @param {User} currentUser
     * @returns {Friend}
     */
    getUser(currentUser){
        return this.friends.find(friend => currentUser.id === friend.id);
    }

    isPending(){
        return this.status === Friendship.STATUSES.PENDING;
    }

    isApproved(){
        return this.status === Friendship.STATUSES.APPROVED;
    }

    isDeclined(){
        return this.status === Friendship.STATUSES.DECLINED;
    }

    /**
     * @param {User} currentUser
     * @returns {boolean}
     */
    isWaitingOnFriend(currentUser){
        // console.log('user', currentUser);
        // console.log('pending?', this.isPending());
        // console.log('approved?', !this.getFriend(currentUser).approved);
        return this.isPending() && !this.getFriend(currentUser).approved;
    }

    /**
     * @param {User} currentUser
     * @returns {boolean}
     */
    isWaitingOnUser(currentUser){
        return this.isPending() && !this.getUser(currentUser).approved;
    }

    approve(){
        this.friends.forEach(friend => friend.approved = true);
        this.status = Friendship.STATUSES.APPROVED;
    }

    decline(){
        this.status = Friendship.STATUSES.DECLINED;
    }

    /**
     * @param {Friend} friend
     */
    addFriend(friend){
        this.friends.push(friend);
    }

    getFormattedFriendshipDate(){
        return this.added.toLocaleDateString([], {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }


    /**
     * @param {User} user
     * @param {User} friend
     * @returns {Friendship}
     */
    static createNewFriendship(user, friend) {
        const friendship = new Friendship();
        friendship.addFriend(new Friend(user.id, user.displayName, user.avatarURL, true));
        friendship.addFriend(new Friend(friend.id, friend.displayName, friend.avatarURL, false));
        return friendship;
    }
}
