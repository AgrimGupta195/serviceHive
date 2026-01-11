const User = require("../models/userSchema");

const signup =async(req,res)=>{
    const{fullName,email,password}=req.body;
    try {
        if(!password || !fullName || !email){
            return res.status(400).json({message:"All fields are required"})
        }
        if(password<6){
            return res.status(400).json({message:"PAssword must be atleast of 6 characters"})
        }
        const user =await User.findOne({email});
        if(user){
            return res.status(400).json({message:"User Already Exist"})
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        const newUser = new User({
            fullName,
            password:hashedPassword,
            email,
        })
        if(newUser){
            generateToken(newUser._id,res);
            await newUser.save();
            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
            })
        }else{
            res.status(400).json({message:"Invalid User Data"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server error"}) 
    }
}


const login =async(req,res)=>{
    try {
        const {email,password} =req.body;
    const user = await User.findOne({email});
    if(user){
       const isPassword = await bcrypt.compare(password,user.password);
        if(!isPassword){
           return res.status(400).json({message:"Invalid Credentials"});
        }
        generateToken(user._id,res);
        res.status(201).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        })
    }else{
        return res.status(400).json({message:"Invalid Credentials"});
    }
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server error"}) 
    }
}
const logout =(req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"logout Successfully"})
    } catch (error) {
        console.log("error in logout controller");
        res.status(500).json({message:"Internal Server error"})        
    }
}
const checkAuth = (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server error"})   
    }
}
module.exports = {signup,login,logout,checkAuth};