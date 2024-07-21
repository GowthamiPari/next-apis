import { title } from 'process';
import connect from "@/lib/db";
import user from "@/lib/modals/user";
import User from "@/lib/modals/user";
import { request } from "http";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import category from "@/lib/modals/category";
import Category from '@/lib/modals/category';
import Blog from '@/lib/modals/blog';


export const GET= async (request:Request) => {
    try{
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');
    
    const searchKeywords = searchParams.get('keywords') as string;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    // const sortBy = searchParams.get('sortBy');
    // const sortOrder = searchParams.get('sortOrder');
    const page = parseInt(searchParams.get('page')||"1");
    const limit = parseInt(searchParams.get('limit')||"10");

    await connect();
    if(!userId || !Types.ObjectId.isValid(userId)){
        return new NextResponse(JSON.stringify({message:"Invalid  or missing User Id "}), { status: 400 });
    }
    if(!categoryId || !Types.ObjectId.isValid(categoryId)){
        return new NextResponse(JSON.stringify({message:"Invalid  or missing Category Id "}), { status: 400 });
    }
    const user = await User.findById(userId);
    if(!user){
        return new NextResponse(JSON.stringify({message:"User not found in the database"}), { status: 404 });
    }
    if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found in the database" }), { status: 404 });
        }
    }

    const filter: any = {
        user: new Types.ObjectId(userId),

    };
    if (searchKeywords) {
        filter.$or = [
            { title: { $regex: searchKeywords, $options: "i" } },
            { description: { $regex: searchKeywords, $options: "i" } },
        ];
    }

    if (startDate && endDate) {
        filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    else if( startDate) {
        filter.createdAt = { $gte: new Date(startDate),
        }
    }
        else if( endDate) {
        filter.createdAt = { $lte: new Date(endDate),
        }
    }
    if (categoryId) {
        filter.category = new Types.ObjectId(categoryId);
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find(filter).sort({createdAt:"asc"}).skip(skip).limit(limit);

    return new NextResponse(JSON.stringify(blogs), { status: 200 });
}
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in fetching blogs'+error.message, { status: 500 });
    };
}
export const POST = async (request:Request) => {
    try{
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');
        const categoryId = searchParams.get('categoryId');

        const body = await request.json();
        const {title, description} = body;
        await connect();
    if(!userId || !Types.ObjectId.isValid(userId)){
        return new NextResponse(JSON.stringify({message:"Invalid  or missing User Id "}), { status: 400 });
    }
    if(!categoryId || !Types.ObjectId.isValid(categoryId)){        
        return new NextResponse(JSON.stringify({message:"Invalid  or missing Category Id "}), { status: 400 });
    }
    const user = await User.findById(userId);
    if(!user){
        return new NextResponse(JSON.stringify({message:"User not found in the database"}), { status: 404 });
    }
    if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found in the database" }), { status: 404 });
        }
    }

    const newBlog =await new Blog({
        title,  
        description,
        user: new Types.ObjectId(userId),
        category: new Types.ObjectId(categoryId)
    });
    await newBlog.save();
    return new NextResponse(JSON.stringify({message:"Blog is created", blog:  newBlog}), { status: 200 });

        
    }
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in fetching blogs'+error.message, { status: 500 });
    };
}