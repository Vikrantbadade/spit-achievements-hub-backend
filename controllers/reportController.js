const Achievement = require('../models/Achievement');
const ExcelJS = require('exceljs');
const User = require('../models/User');

// Helper: Get Faculty IDs for a specific department
const getFacultyIdsByDepartment = async (departmentId) => {
  const faculty = await User.find({ 
    role: 'Faculty', 
    department: departmentId 
  }).select('_id');
  return faculty.map(u => u._id);
};

// @desc    Download Excel Report
// @route   GET /api/v1/reports/export/excel
// @access  Protected (HOD, Principal)
exports.downloadExcelReport = async (req, res) => {
  try {
    const { startDate, endDate, departmentId, category } = req.query;
    
    // --- 1. Build Query Filters ---
    let query = {};

    // Date Range Filter
    if (startDate || endDate) {
      query.achievementDate = {};
      if (startDate) query.achievementDate.$gte = new Date(startDate);
      if (endDate) query.achievementDate.$lte = new Date(endDate);
    }

    // Category Filter
    if (category && category !== 'all') {
      query.category = category; // Ensure case matches (e.g., "Publication")
    }

    // Role-Based Access Control & Department Filtering
    if (req.user.role === 'HOD') {
      // HOD sees ONLY their department
      const facultyIds = await getFacultyIdsByDepartment(req.user.department);
      query.faculty = { $in: facultyIds };
    } else if (req.user.role === 'Principal') {
      // Principal sees ALL, unless specific department requested
      if (departmentId && departmentId !== 'all') {
        const facultyIds = await getFacultyIdsByDepartment(departmentId);
        query.faculty = { $in: facultyIds };
      }
    }

    // --- 2. Fetch Data ---
    const achievements = await Achievement.find(query)
      .populate('faculty', 'name email department designation')
      .populate({
        path: 'faculty',
        populate: { path: 'department', select: 'name' } // Nested populate for Dept Name
      })
      .sort({ achievementDate: -1 });

    // --- 3. Create Excel Workbook ---
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Achievements');

    // Define Columns
    worksheet.columns = [
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Faculty Name', key: 'facultyName', width: 20 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    // Style Header Row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add Rows
    achievements.forEach(ach => {
      // Handle populated data safely
      const facultyName = ach.faculty?.name || 'Unknown';
      // Handle department: could be populated object or ID depending on schema state
      const deptName = ach.faculty?.department?.name || 'Unknown';

      worksheet.addRow({
        title: ach.title,
        category: ach.category,
        facultyName: facultyName,
        department: deptName,
        date: new Date(ach.achievementDate).toLocaleDateString(),
        status: ach.status || 'Pending'
      });
    });

    // --- 4. Send Response ---
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + `Report-${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Excel Export Error:", error);
    res.status(500).json({ message: "Error generating report" });
  }
};
// Generic Report Generator (JSON data for Frontend to convert to CSV/PDF)
exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;
    
    let query = {};
    
    // Date Filter
    if (startDate && endDate) {
      query.achievementDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Role Logic
    if (req.user.role === 'Faculty') {
      query.faculty = req.user._id; // Only own data
    } else if (req.user.role === 'HOD') {
      query.department = req.user.department; // Only own dept data
    } else if (req.user.role === 'Principal') {
      if (departmentId) query.department = departmentId; // Optional filter
    }

    const data = await Achievement.find(query)
      .populate('faculty', 'name')
      .populate('department', 'name');
      
    res.json({ count: data.length, reportData: data });
  } catch (error) { res.status(500).json({ message: error.message }); }
};