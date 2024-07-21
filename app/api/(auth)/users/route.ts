import connect from "@/lib/db";
import user from "@/lib/modals/user";
import User from "@/lib/modals/user";
import { request } from "http";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
 
const ObjectId = require('mongoose').Types.ObjectId;
export const GET= async () => {
    try{
        await connect();
        const users =await User.find();
        return new NextResponse(JSON.stringify(users), { status: 200 });
    }
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in fetching users'+error.message, { status: 500 });
    }
}

export const POST= async (request:Request) => {
    try{
        const body = await request.json();
        await connect();
        const newUser =await new User(body);
        await newUser.save();
        return new NextResponse(JSON.stringify({message:"User is created", user:  newUser}), { status: 200 });
    }
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in creating user'+error.message, { status: 500 });
    }
};

export const PATCH= async (request:Request) => {
    try{
        const body = await request.json();
        await connect();
        const {userId, newUsername} =body;
        if(!userId || !newUsername){
            return new NextResponse(JSON.stringify({message:"User Id or new username is missing"}), { status: 400 });
        }
        if(!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message:"User Id is invalid"}), { status: 400 });
        }

        const updatedUser =await User.findOneAndUpdate({_id:new ObjectId(userId)}, {username:newUsername}, {new:true});
        if(!updatedUser){
        return new NextResponse(JSON.stringify({message:"User not found in the database"}), { status: 404 });
        }
        return new NextResponse(JSON.stringify({message:"User is updated", user:  updatedUser}), { status: 200 });
    }
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in updating user'+error.message, { status: 500 });
    }

}
export const PUT = async (request: Request) => {
    try {
        const body = await request.json();
        await connect();
        
        const { userId, email, username, password } = body;
        
        if (!userId || !email || !username || !password) {
            return new NextResponse(JSON.stringify({ message: "User Id, email, username, and password are required" }), { status: 400 });
        }

        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "User Id is invalid" }), { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            new ObjectId(userId), 
            { email, username, password }, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return new NextResponse(JSON.stringify({ message: "User not found in the database" }), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ message: "User is updated", user: updatedUser }), { status: 200 });
    } catch (error: any) {
        console.log(error);
        return new NextResponse('Error in updating user: ' + error.message, { status: 500 });
    }
};

export const DELETE= async (request:Request) => {
    try{
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');
        await connect();
        if(!userId){
            return new NextResponse(JSON.stringify({message:"User Id is missing"}), { status: 400 });
        }
        if(!Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message:"User Id is invalid"}), { status: 400 });
        }

        const deletedUser =await User.findOneAndDelete({_id:new ObjectId(userId)});
        if(!deletedUser){
        return new NextResponse(JSON.stringify({message:"User not found in the database"}), { status: 404 });
        }
        return new NextResponse(JSON.stringify({message:"User is deleted", user:  deletedUser}), { status: 200 });

    }
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in deleting user'+error.message, { status: 500 });
    }
}