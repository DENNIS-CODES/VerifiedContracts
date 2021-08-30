import mongoose from 'mongoose';
import { Token } from '../types/token';
const { Schema, Types } = mongoose;


// An interface that describes what attributes a token model should have
interface TokenModel extends mongoose.Model<TokenDoc> {
    build(attrs: Token): TokenDoc
}

// An interface that descibes single token properties
interface TokenDoc extends mongoose.Document {
    name: string;
    token: string;
    ethAmount: String;
    gasLimit: String;
    tokenAmount: String;
    noOfBuys: Number;
    wallet: String;
}

// Creating token schema
const TokenSchema = new Schema({
    name: { type: String },
    token: { type: String, unique: true },
    ethAmount: { type: String, default: "0.00001" },
    gasLimit: { type: String, default: "300000" },
    tokenAmount: { type: String, default: "0" },
    noOfBuys: { type: Number, default: 2 },
    wallet: { type: String, default: "jay" },
},
    {
        timestamps: true
    }
)

// Statics
TokenSchema.static('build', (attrs: Token) => { return new Token(attrs) })

// prefetches
TokenSchema.pre<TokenDoc>(/^find/, function (next) {
    this.populate({ path: "profile" });
    next();
});

// Creating token model
const Token = mongoose.model<TokenDoc, TokenModel>('Orders', TokenSchema, "Orders")

export { Token, TokenDoc }