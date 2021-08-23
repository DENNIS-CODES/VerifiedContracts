import mongoose from 'mongoose';
import { UserDoc } from './user';
const { Schema, Types } = mongoose;

// An interface that describes attributes that a config should have
interface ConfigAttrs {
    liquidity_functions: string;
    sell_functions: string;
    buy_functions: string;
    excluded_websites: string;
    is_base?: boolean;
    user?: UserDoc;
}
// An interface that describes what attributes a config model should have
interface ConfigModel extends mongoose.Model<ConfigDoc> {
    build(attrs: ConfigAttrs): ConfigDoc
}

// An interface that descibes single config properties
interface ConfigDoc extends mongoose.Document {
    liquidity_functions: string;
    sell_functions: string;
    buy_functions: string;
    excluded_websites: string;
    is_base?: boolean;
    user?: UserDoc;
}

// Creating config schema
const configSchema = new Schema({
    liquidity_functions: { type: String },
    sell_functions: { type: String },
    buy_functions: { type: String },
    excluded_websites: { type: String },
    is_base: { type: Boolean, default: false },
    user: { type: Types.ObjectId, ref: 'User' },

})
// Statics
configSchema.static('build', (attrs: ConfigAttrs) => { return new Config(attrs) })

configSchema.pre(/^find/, function (next) {
    next();
});

// Creating config model
const Config = mongoose.model<ConfigDoc, ConfigModel>('Config', configSchema)

export { Config, ConfigDoc }