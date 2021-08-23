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
    address: string;
}

// Creating token schema
const TokenSchema = new Schema({
    name: { type: String },
    address: { type: String, unique: true }
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
const Token = mongoose.model<TokenDoc, TokenModel>('Token', TokenSchema)

export { Token, TokenDoc }