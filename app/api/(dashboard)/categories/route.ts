import { title } from 'process';
import connect from "@/lib/db";
import user from "@/lib/modals/user";
import User from "@/lib/modals/user";
import { request } from "http";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import category from "@/lib/modals/category";
import Category from '@/lib/modals/category';
export const GET= async (request:Request) => {
    try{
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');
        await connect();
        if(!userId || !Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message:"Invalid  or missing User Id "}), { status: 400 });
        }
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify({message:"User not found in the database"}), { status: 404 });
        }
        const categories = await category.find({user: new Types.ObjectId(userId)});
        return new NextResponse(JSON.stringify(categories), { status: 200 });

    }
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in fetching categories'+error.message, { status: 500 });
    }
}
export const POST= async (request:Request) => {
    try{
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');
        const {title} = await request.json();
        if(!userId || !Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message:"Invalid  or missing User Id "}), { status: 400 });
        }
        await connect();
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify({message:"User not found in the database"}), { status: 404 });
        }
        const newCategory =await new Category({
            title,
            user: new Types.ObjectId(userId)});
        await newCategory.save();
        return new NextResponse(JSON.stringify({message:"Category is created", category:  newCategory}), { status: 200 });
    }
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in creating category'+error.message, { status: 500 });
    }
}