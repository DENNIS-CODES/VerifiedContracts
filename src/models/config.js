"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema, Types = mongoose_1.default.Types;
// Creating config schema
var configSchema = new Schema({
    liquidity_functions: { type: String },
    sell_functions: { type: String },
    buy_functions: { type: String },
    excluded_websites: { type: String },
    is_base: { type: Boolean, default: false },
    user: { type: Types.ObjectId, ref: 'User' },
});
// Statics
configSchema.static('build', function (attrs) { return new Config(attrs); });
configSchema.pre(/^find/, function (next) {
    next();
});
// Creating config model
var Config = mongoose_1.default.model('Config', configSchema);
exports.Config = Config;
