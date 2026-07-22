const userModel = require('../models/UsersModel');
const VaultTransaction = require('../models/VaultTransactionModel');
// Controller to add or update profile data
const addUserProfile = async (req, res) => {
    try {
        // Check if the user already exists by email
        let user = await userModel.findOne({ email: req.body.email });

        if (user) {
            // User exists, update missing profile fields
            let profileUpdated = false;

            // Update profile details if not present
            const fieldsToUpdate = [
                'name', 'country', 'state', 'city',
                'postalCode', 'profilePicture',
                'username', 'phoneNumber', 'userType'
            ];

            fieldsToUpdate.forEach(field => {
                if (!user[field]) {
                    user[field] = req.body[field];
                    profileUpdated = true;
                }
            });

            if (!user.profileComplete) {
                user.user_level = 1;
                user.profileComplete = true;
                profileUpdated = true;

                // ✅ Award welcome bonus when profile is first completed
                try {
                    const alreadyGiven = await VaultTransaction.findOne({
                        email: user.email,
                        "metadata.type": "welcome_bonus",
                    });
                    if (!alreadyGiven) {
                        await VaultTransaction.create({
                            email: user.email,
                            type: "credit",
                            amount: 50,
                            metadata: {
                                type: "welcome_bonus",
                                description: "Welcome Bonus",
                                source: "signup",
                            },
                        });
                        console.log("Welcome bonus applied for:", user.email);
                    }
                } catch (bonusErr) {
                    console.error("Welcome bonus failed:", bonusErr.message);
                }
            }

            // Save updated user details if any field was modified
            if (profileUpdated) {
                await user.save();
                console.log('User profile updated:', user);  // Debugging line
                return res.json({
                    status: true,
                    message: 'Profile details added successfully',
                    data: user,
                });
            } else {
                return res.json({
                    status: true,
                    message: 'Profile is already complete',
                    data: user,
                });
            }
        } else {
            // Create a new user if not found
            const newUser = new userModel({
                email: req.body.email,
                name: req.body.name,
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                postalCode: req.body.postalCode,
                profilePicture: req.body.profilePicture,
                username: req.body.username,
                phoneNumber: req.body.phoneNumber,
                userType: req.body.userType || "student",
                user_level: 1, // Set user level to 1
                profileComplete: true, // Mark profile as complete
            });

            await newUser.save();
            console.log('New user created:', newUser);

            // ✅ Award welcome bonus to brand new users
            try {
                const alreadyGiven = await VaultTransaction.findOne({
                    email: newUser.email,
                    "metadata.type": "welcome_bonus",
                });
                if (!alreadyGiven) {
                    await VaultTransaction.create({
                        email: newUser.email,
                        type: "credit",
                        amount: 50,
                        metadata: {
                            type: "welcome_bonus",
                            description: "Welcome Bonus",
                            source: "signup",
                        },
                    });
                    console.log("Welcome bonus applied for:", newUser.email);
                }
            } catch (bonusErr) {
                console.error("Welcome bonus failed:", bonusErr.message);
                // Never block signup if bonus fails
            }

            return res.json({
                status: true,
                message: 'User created successfully',
                data: newUser,
            });
        }
    } catch (err) {
        console.error('Error in addUserProfile:', err);
        return res.json({
            status: false,
            message: 'Error in adding user profile',
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { profileDataId } = req.params;

        const allowedFields = [
            'name', 'country', 'state', 'city',
            'postalCode', 'profilePicture', 'username',
            'phoneNumber', 'userType',
            'financialSituation', 'school', 'performance',
            'curriculum', 'stream', 'grade', 'linkedin',
            'personality'
        ];

        const mongoose = require('mongoose');
        let user = null;

        if (profileDataId && mongoose.Types.ObjectId.isValid(profileDataId)) {
            user = await userModel.findById(profileDataId);
        }

        if (!user && req.body.email) {
            const rawEmail = (req.body.email || "").trim();
            user = await userModel.findOne({
                email: { $regex: new RegExp(`^${rawEmail}$`, "i") }
            });
        }

        if (!user) return res.json({ status: false, message: "User not found" });

        // ✅ Check for username conflict BEFORE saving
        if (req.body.username && req.body.username !== user.username) {
            const newUsernameLower = req.body.username.trim().toLowerCase();
            const conflict = await userModel.findOne({
                usernameLower: newUsernameLower,
                _id: { $ne: user._id },
            });
            if (conflict) {
                return res.json({ status: false, message: "Username already taken" });
            }
        }

        // ✅ Assign fields directly so Mongoose tracks changes
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        if (user.username) {
            user.username = user.username.trim();
            user.usernameLower = user.username.toLowerCase();
        }

        if (req.body.school || req.body.grade || req.body.financialSituation) {
            if ((user.user_level || 0) < 2) user.user_level = 2;
        }

        await user.save(); // ✅ Triggers pre("save") → usernameLower synced

        // ✅ Sync approval record if present so Admin dashboard stays updated
        try {
            const ApprovalModel = require('../models/ApprovalsModel');
            if (user.email) {
                await ApprovalModel.findOneAndUpdate(
                    { email: { $regex: new RegExp(`^${user.email.trim()}$`, "i") }, role: "User" },
                    {
                        $set: {
                            businessName: user.name || "",
                            firstName: user.name || "",
                            country: user.country || "",
                            type: user.userType || "Student"
                        }
                    }
                );
            }
        } catch (e) {
            console.warn("Could not sync approval record:", e.message);
        }

        return res.json({ status: true, message: "Profile updated successfully", data: user });
    } catch (err) {
        console.error("Error in updateUserProfile:", err);
        if (err.code === 11000 && err.keyPattern?.usernameLower) {
            return res.json({ status: false, message: "Username already taken" });
        }
        return res.status(500).json({ status: false, message: "Update failed" });
    }
};

// Controller to fetch user profile details
const getUserProfile = async (req, res) => {
    try {
        const rawEmail = (req.params.email || "").trim();
        const user = await userModel.findOne({
            email: { $regex: new RegExp(`^${rawEmail}$`, "i") }
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        // Define required fields for profile completeness
        const requiredFields = [
            user.name,
            user.country,
            user.state,
            user.city,
            user.postalCode,
            user.profilePicture,
            user.phoneNumber,
        ];

        // Check if all required fields are filled
        const isProfileComplete = requiredFields.every((field) => field && field.trim() !== '');

        return res.json({
            status: true,
            data: {
                ...user._doc, // Spread other user fields
                user_level: user.user_level || 0, // Include user_level in response
            },
            profileComplete: isProfileComplete,
        });
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        return res.status(500).json({
            status: false,
            message: 'Error in fetching user details',
        });
    }
};

const updateLevelTwoProfile = async (req, res) => {
    return updateUserProfile(req, res);
};

const addPersonality = async (req, res) => {
    const { userId, personality } = req.body; // Get userId and personality from the request body

    // Ensure personality is valid
    const validPersonalities = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'];
    if (!validPersonalities.includes(personality)) {
        return res.status(400).json({ status: false, message: 'Invalid personality type' });
    }

    try {
        // Find the user by userId
        const user = await userModel.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // Update the user's personality field
        user.personality = personality;
        user.user_level = 3;
        await user.save(); // Save the updated user data

        // Respond with success
        return res.status(200).json({ status: true, message: 'Personality data added successfully' });
    } catch (error) {
        console.error('Error in addPersonality:', error);
        return res.status(500).json({ status: false, message: 'Server error' });
    }
};



module.exports = {
    addUserProfile,
    getUserProfile,
    updateUserProfile,
    updateLevelTwoProfile,
    addPersonality,
};