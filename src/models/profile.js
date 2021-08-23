"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema, Types = mongoose_1.default.Types;
// Creating profile schema
var ProfileSchema = new Schema({
    liquidity_functions: { type: String },
    buy_functions: { type: String },
    sell_functions: { type: String },
    openzeppelin: { type: Boolean, default: false },
}, {
    timestamps: true
});
// Statics
ProfileSchema.static('build', function (attrs) { return new Profile(attrs); });
// Creating profile model
var Profile = mongoose_1.default.model('Profile', ProfileSchema);
exports.Profile = Profile;
