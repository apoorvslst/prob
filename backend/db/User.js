import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

const userSchema=new mongoose.Schema({
    username: {type:String, required:true, unique:true},
    email: {type:String, required:true, unique:true},
    password: {type:String, required:true},
    refreshToken: {type:String}
},{timestamps: true});

userSchema.pre("save",async function(next){
    if (!this.isModified("password")) return next(); // imp because we dont want to double hash pass. when profile of user changes or something else ...
    this.password=await bcrypt.hash(this.password,10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const User=mongoose.model("User",userSchema);