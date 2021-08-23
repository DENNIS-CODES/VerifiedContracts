import mongoose from 'mongoose';

// An interface that describes attributes that a user should have
interface UserAttrs {
    tg_id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    is_bot: boolean;
    is_active?: boolean;
    bot_name?: string;
}

// An interface that describes what attributes a user model should have
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc
}

// An interface that descibes single user properties
interface UserDoc extends mongoose.Document {
    tg_id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    is_bot: boolean;
    is_active?: boolean;
    bot_name?: string;
}

// Creating user schema
const UserSchema = new mongoose.Schema({
    tg_id: { type: Number },
    is_bot: { type: Boolean },
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    is_active: { type: Boolean, default: false },
    bot_name: { type: String },
},
    {
        timestamps: true
    })

// Statics
UserSchema.static('build', (attrs: UserAttrs) => { return new User(attrs) })

// Creating user model
const User = mongoose.model<UserDoc, UserModel>('User', UserSchema)

export { User, UserDoc }