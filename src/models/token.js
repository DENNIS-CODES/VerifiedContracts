"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var Schema = mongoose_1.default.Schema, Types = mongoose_1.default.Types;
// Creating token schema
var TokenSchema = new Schema({
    name: { type: String },
    address: { type: String, unique: true }
}, {
    timestamps: true
});
// Statics
TokenSchema.static('build', function (attrs) { return new Token(attrs); });
// prefetches
TokenSchema.pre(/^find/, function (next) {
    this.populate({ path: "profile" });
    next();
});
// Creating token model
var Token = mongoose_1.default.model('Token', TokenSchema);
exports.Token = Token;
