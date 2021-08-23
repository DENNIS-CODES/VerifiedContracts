"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
// Creating user schema
var UserSchema = new mongoose_1.default.Schema({
    tg_id: { type: Number },
    is_bot: { type: Boolean },
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    is_active: { type: Boolean, default: false },
    bot_name: { type: String },
}, {
    timestamps: true
});
// Statics
UserSchema.static('build', function (attrs) { return new User(attrs); });
// Creating user model
var User = mongoose_1.default.model('User', UserSchema);
exports.User = User;
