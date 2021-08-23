import mongoose from 'mongoose';
import { Profile } from '../types/profile';
const { Schema, Types } = mongoose;

// An interface that describes what attributes a profile model should have
interface ProfileModel extends mongoose.Model<ProfileDoc> {
    build(attrs: Profile): ProfileDoc
}

// An interface that descibes single profile properties
interface ProfileDoc extends mongoose.Document {
    liquidity_functions?: string;
    sell_functions?: string;
    openzeppelin?: boolean;
}

// Creating profile schema
const ProfileSchema = new Schema({
    liquidity_functions: { type: String },
    buy_functions: { type: String },
    sell_functions: { type: String },
    openzeppelin: { type: Boolean, default: false },
},
    {
        timestamps: true
    }
)

// Statics
ProfileSchema.static('build', (attrs: Profile) => { return new Profile(attrs) })

// Creating profile model
const Profile = mongoose.model<ProfileDoc, ProfileModel>('Profile', ProfileSchema)

export { Profile, ProfileDoc }