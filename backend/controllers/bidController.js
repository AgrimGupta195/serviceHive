const Bid = require("../models/bidSchema");
const Gig = require("../models/gigSchema");
const { emitToUser } = require('../lib/socket');

const submitGig = async (req, res) => {
    try {
        const{price, message, gigId} = req.body;
        if(!price || !message){
            return res.status(400).json({message:"All fields are required"})
        }
        if(price<0){
            return res.status(400).json({message:"Price cannot be negative"})
        }
        const newBid = new Bid({
            gigId,
            freelancerId:req.user._id,
            price,
            message,
        })
        await newBid.save();
        res.status(201).json({message:"Bid Placed Successfully",bid:newBid})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

const getBidsForGig = async (req, res) => {
    try {
        const {gigId} = req.params;
        const bids = await Bid.find({gigId})
        .populate("freelancerId","fullName email profilePic")
        .sort({createdAt:-1});
        res.status(200).json({bids});
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}

const hireBid = async (req, res) => {
    const { bidId } = req.params;
    const userId = req.user && req.user._id;

    if (!bidId) return res.status(400).json({ message: 'bidId is required' });

    const session = await Bid.startSession();
    try {
        session.startTransaction();

        const bid = await Bid.findById(bidId).session(session);
        if (!bid) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Bid not found' });
        }

        const gig = await Gig.findById(bid.gigId).session(session);
        if (!gig) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Gig not found' });
        }

        if (!userId || gig.ownerId.toString() !== userId.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'Only gig owner can hire a bid' });
        }

            if (bid.status && bid.status !== 'pending') {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: 'Bid is not in pending state' });
            }

            const updatedGig = await Gig.findOneAndUpdate(
                { _id: gig._id, status: 'open' },
                { $set: { status: 'assigned', assignedBid: bidId } },
                { session, new: true }
            );

            if (!updatedGig) {
                await session.abortTransaction();
                session.endSession();
                return res.status(409).json({ message: 'Gig already assigned' });
            }

        await Bid.updateOne({ _id: bidId }, { $set: { status: 'hired' } }).session(session);

        await Bid.updateMany({ gigId: gig._id, _id: { $ne: bidId } }, { $set: { status: 'rejected' } }).session(session);
        
        gig.status = 'assigned';
        gig.assignedBid = bidId;
        await gig.save({ session });

        await session.commitTransaction();
        session.endSession();

        const updatedBid = await Bid.findById(bidId).populate('freelancerId', 'fullName email profilePic');
        try {
            const freelancer = updatedBid.freelancerId;
            const freelancerId = freelancer && (freelancer._id ? freelancer._id.toString() : freelancer.toString());
            if (freelancerId) {
                emitToUser(freelancerId, 'hired', { bid: updatedBid, gig: updatedGig || gig });
            }
        } catch (e) {
            console.warn('Real-time notify failed', e);
        }

        res.status(200).json({ message: 'Bid hired successfully', bid: updatedBid, gig });
    } catch (error) {
        try { await session.abortTransaction(); } catch (e) {}
        session.endSession();
        console.error('hireBid error', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {submitGig,getBidsForGig, hireBid};