const Gig = require("../models/gigSchema");
const getOpenGigs = async (req, res) => {
  try {
    const { search } = req.query;

    const query = { status: "open" };
    if (search) {
      query.title = new RegExp(search, "i");
    }

    const gigs = await Gig.find(query)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      gigs,
      total: gigs.length,
    });
  } catch (err) {
    console.error("Error fetching open gigs:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching gigs",
    });
  }
};

const createGig = async (req, res) => {
    try {
        const {title,description,budget} = req.body;
        if(!title || !description || !budget){
            return res.status(400).json({message:"All fields are required"})
        }
        if(budget<0){
            return res.status(400).json({message:"Budget cannot be negative"})
        }
        const newGig = new Gig({
            title,
            description,
            budget,
            status:"open",
            ownerId:req.user._id,
        })
        await newGig.save();
        res.status(201).json({message:"Gig Created Successfully",gig:newGig})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

module.exports = {getOpenGigs,createGig};