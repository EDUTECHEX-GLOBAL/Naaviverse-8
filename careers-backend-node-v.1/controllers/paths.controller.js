const pathModel = require('../models/path.model');
const stepModel = require('../models/steps.model');
const userModel = require('../models/users.model');
const axios = require('axios');
const mongoose = require('mongoose')

const addPath = async (req, res) => {
  try {
    const body = req.body;

    // 🔹 1. Duplicate path check (unchanged)
const existing = await pathModel.findOne({
  email: body.email,
  nameOfPath: { $regex: `^${body.nameOfPath}$`, $options: "i" },
  status: { $in: ["draft", "waitingforapproval"] }
});


    if (existing) {
      return res.status(400).json({
        status: false,
        message: "A path with this name already exists and is pending approval"
      });
    }

    // 🔹 2. STEP VALIDATION — START
    const stepIds = body.the_ids?.map(s => s.step_id) || [];

    // 2a. Prevent duplicate steps in same path
    const uniqueStepIds = new Set(stepIds.map(id => id.toString()));
    if (uniqueStepIds.size !== stepIds.length) {
      return res.status(400).json({
        status: false,
        message: "Duplicate steps are not allowed in a path"
      });
    }

    // 2b. Validate step existence & status
    if (stepIds.length > 0) {
      const steps = await stepModel.find({
        _id: { $in: stepIds },
        status: { $ne: "delete" }
      });

      if (steps.length !== stepIds.length) {
        return res.status(400).json({
          status: false,
          message: "One or more steps are invalid or deleted"
        });
      }
    }
    // 🔹 STEP VALIDATION — END

    // 🔹 3. Create path object (unchanged)
    const newPath = {
      email: body.email,

      nameOfPath: body.nameOfPath,
      name: body.nameOfPath,

      description: body.description || "",

      current_coordinates: body.current_coordinates,
      feature_coordinates: body.feature_coordinates,

      path_type: body.path_type,
      path_cat: body.path_cat,

      destination_institution: body.destination_institution,
      destination_degree: body.destination_degree,

      length: body.length,
       total_steps: body.total_steps || 5, 
      city: body.city,
      country: body.country,

      program: body.program,

      grade: body.grade || [],
      grade_avg: body.grade_avg || [],
      curriculum: body.curriculum || [],
      stream: body.stream || [],
      financialSituation: body.financialSituation || [],
      personality: body.personality || "",

      the_ids: body.the_ids?.map(step => ({
        step_id: step.step_id,
        stepName: step.stepName,
        stepDescription: step.stepDescription,
        backup_pathId: step.backup_pathId || null,
        backupPathName: step.backupPathName || "",
        backupPathDescription: step.backupPathDescription || ""
      })) || [],
       status: "draft"
    };

    const saved = await pathModel.create(newPath);

    return res.status(200).json({
      status: true,
      message: "Path created successfully",
      data: saved
    });

  } catch (error) {
    console.error("Add Path Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};


const updatePath = async (req, res) => {
  try {
    const pathId = req.params.id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(pathId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid pathId",
      });
    }

    const existingPath = await pathModel.findById(pathId);

    if (!existingPath) {
      return res.status(404).json({
        status: false,
        message: "Path not found",
      });
    }

    if (!["draft", "rejected"].includes(existingPath.status)) {
      return res.status(400).json({
        status: false,
        message: "Editing not allowed. Path is locked.",
      });
    }

    delete updateData.status;

    const updatedPath = await pathModel.findByIdAndUpdate(
      pathId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: true,
      message: "Path updated successfully",
      data: updatedPath,
    });

  } catch (error) {
    console.error("Error updating path:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const reactivatePath = async (req, res) => {
  try {
    const { id } = req.params;

    const path = await pathModel.findById(id);

    if (!path) {
      return res.status(404).json({
        status: false,
        message: "Path not found"
      });
    }

    if (path.status !== "inactive") {
      return res.status(400).json({
        status: false,
        message: "Only inactive paths can be reactivated"
      });
    }

    path.status = "active";
    await path.save();

    return res.status(200).json({
      status: true,
      message: "Path reactivated successfully",
      data: path
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};

const reactivateInactivePath = async (req, res) => {
  try {
    const { id } = req.params;

    const path = await pathModel.findById(id);

    if (!path) {
      return res.status(404).json({ status: false, message: "Path not found" });
    }

    if (path.status !== "inactive") {
      return res.status(400).json({
        status: false,
        message: "Only inactive paths can be reactivated"
      });
    }

    path.status = "active";
    await path.save();

    return res.json({
      status: true,
      message: "Path reactivated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};


const updatePathStatus = async (req, res) => {
  const pathId = req.params.id;
  const { status } = req.body;

  if (!status || !['active', 'draft'].includes(status)) {
    return res.status(400).json({
      status: false,
      message: 'Invalid status'
    });
  }

  try {
    const path = await pathModel.findById(pathId);

    if (!path) {
      return res.status(404).json({
        status: false,
        message: 'Path not found'
      });
    }

    if (path.status !== "waitingforapproval") {
      return res.status(400).json({
        status: false,
        message: "Only paths under review can be approved or rejected"
      });
    }

    path.status = status;
    await path.save();

    return res.status(200).json({
      status: true,
      message: `Path status updated to ${status}`,
      data: path
    });

  } catch (error) {
    console.error("Error updating path status:", error);
    return res.status(500).json({
      status: false,
      message: 'Internal server error'
    });
  }
};


const submitForApproval = async (req, res) => {
  try {
    const { pathId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(pathId)) {
      return res.status(400).json({ 
        status: false, 
        message: "Invalid pathId" 
      });
    }

    const path = await pathModel.findById(pathId);

    if (!path) {
      return res.status(404).json({ 
        status: false, 
        message: "Path not found" 
      });
    }

    // 🔥 NOW check steps
    if (!path.the_ids || path.the_ids.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Cannot submit empty path. Add at least one step."
      });
    }

    if (!["draft", "rejected"].includes(path.status)) {
      return res.status(400).json({
        status: false,
        message: "Only draft or rejected paths can be submitted"
      });
    }

    path.status = "waitingforapproval";
    await path.save();

    return res.json({
      status: true,
      message: "Path submitted for approval",
      data: path
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};



const getPath = async (req, res) => {
  try {
    let filter = {};

    // ✅ STATUS FIX
if (req.query.status) {
  if (req.query.status !== "all") {
    filter.status = req.query.status;
  }
} else {
  filter.status = { $ne: "delete" }; // safer default
}


    // ✅ SAFE ObjectId validation
    if (req.query.path_id) {
      if (!mongoose.Types.ObjectId.isValid(req.query.path_id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid path_id"
        });
      }
      filter._id = new mongoose.Types.ObjectId(req.query.path_id);
    }

    if (req.query.email) filter.email = req.query.email;
    if (req.query.nameOfPath) filter.nameOfPath = req.query.nameOfPath;
    if (req.query.program) filter.program = req.query.program;

    const paths = await pathModel.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "career_steps",
          let: { stepIds: "$the_ids.step_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$stepIds"] },
                    { $ne: ["$status", "delete"] }
                  ]
                }
              }
            },
            { $sort: { createdAt: 1 } }
          ],
          as: "StepDetails"
        }
      }
    ]);

    return res.status(200).json({
      status: true,
      total: paths.length,
      message: paths.length ? "Paths data found" : "No data found",
      data: paths
    });

  } catch (error) {
    console.error("Error in getPath:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};

const getPathSpecific = async (req, res) => {
  try {
    let filter = {};

    // ✅ STATUS FILTER
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    } else {
      filter.status = "active";
    }

    // ✅ PATH ID VALIDATION
    if (req.query.path_id) {
      if (!mongoose.Types.ObjectId.isValid(req.query.path_id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid path_id"
        });
      }
      filter._id = new mongoose.Types.ObjectId(req.query.path_id);
    }

    // ✅ USER FETCH
    if (!req.query.email) {
      return res.status(400).json({
        status: false,
        message: "Email is required"
      });
    }

    const user = await userModel.findOne({ email: req.query.email }).lean();

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    // ✅ DYNAMIC FILTERS BASED ON USER PROFILE
    const filterFields = [
      "curriculum",
      "grade",
      "stream",
      "grade_avg",
      "financialSituation",
      "personality"
    ];

    filterFields.forEach(field => {
      if (req.query[field] === "true" && user[field]) {
        if (Array.isArray(user[field])) {
          filter[field] = { $in: user[field] };
        } else {
          filter[field] = user[field];
        }
      }
    });

    const paths = await pathModel.find(filter).lean();

    return res.status(200).json({
      status: true,
      total: paths.length,
      message: paths.length ? "Paths data found" : "No data found",
      data: paths
    });

  } catch (error) {
    console.error("Error in getPathSpecific:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};


const getPathNormal = async (req, res) => {
    try {
        const { status, financialSituation, performance, curriculum, grade, stream, personality } = req.body;

        let filter = {};

        // Set default status if not provided
       if (status && status !== "all") {
  filter.status = status;
} else {
  filter.status = "active";
}


        // Add _id filter if financialSituation is provided
        if (financialSituation) {
            filter.financialSituation = { $in: financialSituation };
        }
        // Add performance filter if provided
if (performance) {
  filter.grade_avg = { $in: performance };
}

        // Add curriculum filter if provided
        if (curriculum) {
            filter.curriculum = { $in: curriculum };
        }
        // Add grade filter if provided
        if (grade) {
            filter.grade = { $in: grade };
        }
        // Add stream filter if provided
        if (stream) {
            filter.stream = { $in: stream };
        }
        // Add personality filter if provided
        if (personality) {
            filter.personality = { $in: personality };
        }


        const paths = await pathModel.find(filter).lean();

      if (paths.length === 0) {
    return res.json({
        status: true,
        data: [],
        message: 'No data found'
    })
}


        return res.status(200).json({
            status: true,
            total: paths.length,
            message: 'Paths data found',
            data: paths,
        });
    } catch (err) {
        console.log('err=========>', err);
        res.status(500).json({ 
            status: false,
            message: err.message,
        });
    }
};



const deletePath = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid path ID"
      });
    }

    const path = await pathModel.findById(id);

    if (!path) {
      return res.status(404).json({
        status: false,
        message: "Path not found"
      });
    }

    let newStatus;

    switch (path.status) {
      case "draft":
      case "rejected":
      case "waitingforapproval":
        newStatus = "delete";
        break;

      case "active":
        newStatus = "inactive";
        break;

      case "inactive":
        newStatus = "delete";
        break;

      case "delete":
        return res.status(400).json({
          status: false,
          message: "Path is already deleted"
        });

      default:
        return res.status(400).json({
          status: false,
          message: "Invalid path status"
        });
    }

    const updatedPath = await pathModel.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: `Path moved to ${newStatus}`,
      data: updatedPath
    });

  } catch (error) {
    console.error("Error in deletePath:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};


const restorePath = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid path ID"
      });
    }

    const restored = await pathModel.findOneAndUpdate(
      { _id: id, status: "delete" },
      { status: "inactive" },
      { new: true }
    );

    if (!restored) {
      return res.status(404).json({
        status: false,
        message: "Path not found or not deleted"
      });
    }

    return res.status(200).json({
      status: true,
      message: "Path restored to inactive",
      data: restored
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};



// YourModel.updateMany({}, { $set: { city: 'Hyderabad' } }, (err, result) => {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log(`Updated ${result.nModified} documents`);
//     }


const updateFields = async (req, res) => {
    let updateAll = await pathModel.updateMany({}, { $set: { personality: "realistic" } }, { new: true });
    if (!updateAll) {
        return res.json({
            status: false,
            message: 'Data not found',
        })
    }
    return res.json({
        status: true,
        message: 'Details updated',
        data: updateAll
    })
}


const getActivePaths = async (req, res) => {
  try {
    const query = { status: "active" };

    // 🔑 ARRAY FIELDS — MUST USE $in
    if (req.query.grade) {
      query.grade = { $in: [req.query.grade] };
    }

    if (req.query.curriculum) {
      query.curriculum = { $in: [req.query.curriculum] };
    }

    if (req.query.stream) {
      query.stream = { $in: [req.query.stream] };
    }

    if (req.query.financial) {
      query.financialSituation = { $in: [req.query.financial] };
    }

    if (req.query.performance) {
      query.grade_avg = { $in: [req.query.performance] };
    }

    if (req.query.personality) {
      query.personality = req.query.personality;
    }

    console.log("ACTIVE PATH FILTER 👉", query);

    const activePaths = await pathModel.find(query);

    return res.status(200).json({
      success: true,
      total: activePaths.length,
      data: activePaths
    });
  } catch (error) {
    console.error("Error fetching active paths:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getPathById = async (req, res) => {
  try {
    const pathId = req.params.path_id;

    if (!mongoose.Types.ObjectId.isValid(pathId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid path ID provided",
      });
    }

    const objId = new mongoose.Types.ObjectId(pathId);

    const result = await pathModel.aggregate([
      { $match: { _id: objId } },
      {
        $lookup: {
          from: "career_steps",
          let: { stepIds: "$the_ids.step_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$stepIds"] },
                    { $ne: ["$status", "delete"] }
                  ]
                }
              }
            },
            { $sort: { createdAt: 1 } }
          ],
          as: "StepDetails",
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Path not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Path data found",
      data: result[0],
    });

  } catch (err) {
    console.error("Error fetching path:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const uploadBulkPaths = async (req, res) => {
    try {
        const { email, records } = req.body;

        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required"
            });
        }

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Records array is required"
            });
        }

        const formatted = records.map(r => ({
            ...r,
            email,
            status: "active"
        }));

        const inserted = await pathModel.insertMany(formatted);

        return res.status(200).json({
            status: true,
            message: "Bulk paths inserted successfully",
            count: inserted.length
        });

    } catch (error) {
        console.error("Bulk upload error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    addPath,
    submitForApproval,
    getPath,
    deletePath,
    restorePath,
    getPathSpecific,
    getPathNormal,
    updateFields,
    updatePath,
    getActivePaths,
    updatePathStatus,
    reactivatePath,
    reactivateInactivePath,
    getPathById,
    uploadBulkPaths,
}







