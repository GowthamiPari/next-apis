import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI;
const connect = async () => {
    const connectionState = await mongoose.connection.readyState;
    if (connectionState === 1) {
        console.log("Already connected to database");
        return;
    }
    if(connectionState === 2){
        console.log("Connecting...");
        return;
    }
       try{
        mongoose.connect(MONGODB_URI!,{
            dbName:"next-api",
            bufferCommands:true
        });
        console.log("Connected to database");
       }catch(error){
        console.log("Error connecting to database",error);
        throw new Error("Error connecting to database" + error);
       }
   
};

export default connect