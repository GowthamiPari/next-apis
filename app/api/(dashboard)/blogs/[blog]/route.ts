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

//GET single blog
export const GET= async (request:Request, context :{params:any}) => {
    const blogId = context.params.blog;
    try{
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');

    if(!userId || !Types.ObjectId.isValid(userId)){
        return new NextResponse(JSON.stringify({message:"Invalid  or missing User Id "}), { status: 400 });
    }
    if(!categoryId || !Types.ObjectId.isValid(categoryId)){
        return new NextResponse(JSON.stringify({message:"Invalid  or missing Category Id "}), { status: 400 });
    }
    if(!blogId || !Types.ObjectId.isValid(blogId)){
        return new NextResponse(JSON.stringify({message:"Invalid  or missing Blog Id "}), { status: 400 });
    }
    await connect();

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
    const blog = await Blog.findOne({

        user: userId,
         _id: blogId,
         category:categoryId,
        });
        if(!blog){
            return new NextResponse(JSON.stringify({message:"Blog not found in the database"}), { status: 404 });   
        }

    return new NextResponse(JSON.stringify({blog}), { status: 200 });
    }
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in fetching blogs'+error.message, { status: 500 });
    };
}
 export const PATCH = async (request:Request, context :{params:any}) => {
    const blogId = context.params.blog;
    try{
        const body = await request.json();
        const {title, description} = body;
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');

        if(!userId || !Types.ObjectId.isValid(userId)){
            return new NextResponse(JSON.stringify({message:"Invalid  or missing User Id "}), { status: 400 });
        }
        if(!blogId || !Types.ObjectId.isValid(blogId)){        
            return new NextResponse(JSON.stringify({message:"Invalid  or missing Blog Id "}), { status: 400 });
        }
        await connect();
        const user = await User.findById(userId);
        if(!user){
            return new NextResponse(JSON.stringify({message:"User not found in the database"}), { status: 404 });
        }
        const blog = await Blog.findOne({
            user: userId,       
            _id: blogId,    
            });
            if(!blog){
                return new NextResponse(JSON.stringify({message:"Blog not found in the database"}), { status: 404 });
            }
            const updatedBlog =await Blog.findByIdAndUpdate({_id:new Types.ObjectId(blogId)}, {title, description}, {new:true});
            await blog.save();
            return new NextResponse(JSON.stringify({message:"Blog is updated", blog:  blog}), { status: 200 }); 


        
    }
    catch(error:any){
        console.log(error);
        return new NextResponse('Error in fetching blogs'+error.message, { status: 500 });
    };
}

export const PUT = async (request: Request, context: { params: any }) => {
    const blogId = context.params.blog;
    try {
        const body = await request.json();
        const { title, description, category } = body; // Include category if it's part of the full replacement
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const categoryId = searchParams.get('categoryId');

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing User Id" }), { status: 400 });
        }
        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing Blog Id" }), { status: 400 });
        }
        // if(!category || !Types.ObjectId.isValid(category)){
        //     return new NextResponse(JSON.stringify({message:"Invalid  or missing Category Id "}), { status: 400 });
        // }

        await connect();
        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found in the database" }), { status: 404 });
        }
        const existingBlog = await Blog.findOne({
            user: userId,
            _id: blogId,
            category:categoryId,
        });
        if (!existingBlog) {
            return new NextResponse(JSON.stringify({ message: "Blog not found in the database" }), { status: 404 });
        }
        const updatedBlog = await Blog.findByIdAndUpdate(blogId, { title, description, category }, { new: true });
        return new NextResponse(JSON.stringify({ message: "Blog is updated", blog: updatedBlog }), { status: 200 });

    } catch (error: any) {
        console.log(error);
        return new NextResponse('Error in updating blog: ' + error.message, { status: 500 });
    }
}
export const DELETE = async (request: Request, context: { params: any }) => {
    const blogId = context.params.blog;
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing User Id" }), { status: 400 });
        }
        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing Blog Id" }), { status: 400 });
        }
        await connect();
        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found in the database" }), { status: 404 });
        }
        const blog = await Blog.findOne({
            user: userId,
            _id: blogId,
        });
        if (!blog) {
            return new NextResponse(JSON.stringify({ message: "Blog not found in the database" }), { status: 404 });
        }
        await Blog.findByIdAndDelete(blogId);
        return new NextResponse(JSON.stringify({ message: "Blog is deleted" }), { status: 200 });
    }

    catch (error: any) {    
        console.log(error);
        return new NextResponse('Error in deleting blog: ' + error.message, { status: 500 });       
    }
}