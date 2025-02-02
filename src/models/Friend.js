
export default class Friend {
    id;
    displayName;
    avatarURL;
    approved;

    constructor(id, name, avatarURL, approved) {
        this.id = id ?? '';
        this.displayName = name ?? '';
        this.avatarURL = avatarURL ?? '';
        this.approved = approved ?? false;

        return this;
    }

    toFirestore() {
        let id = this.id;
        let displayName = this.displayName;
        let avatarURL = this.avatarURL;
        let approved = this.approved;

        return {id, displayName, avatarURL, approved};
    }

    static fromObject(object) {
        let {id, displayName, avatarURL, approved} = object;
        return new Friend(id, displayName, avatarURL, approved);
    }
}
