// controllers/projectController.js
const Project = require('../models/Project');
const apiResponse = require('../utils/apiResponse');

// @desc    Get all projects (supports search, filter, pagination)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const { status, search, location } = req.query;
  const filter = {};

  if (status) {
    filter.status = status;
  } else {
    // Default to approved projects for non-admin viewers unless filter specified
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'approved';
    }
  }

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Project.countDocuments(filter);
  const projects = await Project.find(filter)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return apiResponse.success(
    res,
    {
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    'Projects retrieved successfully'
  );
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  const project = await Project.findById(req.params.id).populate('createdBy', 'name email role');
  if (!project) {
    return apiResponse.error(res, 'Project not found', [], 404);
  }
  return apiResponse.success(res, project, 'Project retrieved successfully');
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  const { title, description, location, neededItems } = req.body;

  // Auto-approve if created by Admin, else pending
  const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

  const project = await Project.create({
    title,
    description,
    location,
    neededItems: neededItems || [],
    createdBy: req.user.id,
    status: initialStatus,
  });

  const populated = await project.populate('createdBy', 'name email role');
  return apiResponse.success(res, populated, 'Project created successfully', 201);
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Owner or Admin)
const updateProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return apiResponse.error(res, 'Project not found', [], 404);
  }

  // Check ownership unless admin
  if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return apiResponse.error(res, 'Forbidden - You do not own this project', [], 403);
  }

  const { title, description, location, neededItems, status } = req.body;

  if (title) project.title = title;
  if (description) project.description = description;
  if (location) project.location = location;
  if (neededItems) project.neededItems = neededItems;
  if (status && req.user.role === 'admin') {
    project.status = status;
  }

  await project.save();
  const populated = await project.populate('createdBy', 'name email role');

  return apiResponse.success(res, populated, 'Project updated successfully');
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Owner or Admin)
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return apiResponse.error(res, 'Project not found', [], 404);
  }

  if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return apiResponse.error(res, 'Forbidden - You do not own this project', [], 403);
  }

  await project.deleteOne();
  return apiResponse.success(res, null, 'Project deleted successfully');
};

// @desc    Admin: Update project status (approve/reject/complete)
// @route   PUT /api/admin/projects/:id/status
// @access  Private (Admin)
const adminUpdateProjectStatus = async (req, res) => {
  const { status } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) {
    return apiResponse.error(res, 'Project not found', [], 404);
  }

  project.status = status;
  await project.save();

  return apiResponse.success(res, project, `Project status changed to ${status}`);
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  adminUpdateProjectStatus,
};
