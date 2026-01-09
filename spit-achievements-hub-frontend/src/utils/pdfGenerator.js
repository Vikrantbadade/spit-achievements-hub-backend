import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/assets/LogoSPIT.png";

// Helper to load image for PDF
const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
};

// Helper to add report content to an existing doc
const addReportPage = async (doc, reportData, reportConfig) => {
    const {
        title = "ACHIEVEMENT REPORT",
        period = "",
        userInfo = {},
        stats = {}
    } = reportConfig;

    // --- HEADER ---
    // Load Logo
    try {
        const img = await loadImage(logo);
        // Add Logo (Left aligned)
        doc.addImage(img, 'PNG', 15, 10, 25, 25); // x, y, w, h
    } catch (e) {
        console.error("Failed to load logo", e);
    }

    // College Name & Address
    doc.setTextColor(30, 64, 175); // Blue-800 (#1e40af)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Sardar Patel Institute of Technology", 50, 20);

    doc.setTextColor(100); // Grey
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("(Autonomous Institute Affiliated to University of Mumbai)", 50, 26);
    doc.text("Munshi Nagar, Andheri (West), Mumbai - 400 058", 50, 31);

    // Horizontal Line
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(1);
    doc.line(15, 40, 195, 40);

    // --- REPORT INFO ---
    let yPos = 55;

    doc.setTextColor(0); // Black
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 105, yPos, { align: "center" });
    yPos += 7;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Period: ${period}`, 105, yPos, { align: "center" });
    yPos += 15;

    // Faculty/Dept Info Box
    doc.setFillColor(245, 247, 255); // Light Blue bg
    doc.rect(15, yPos - 5, 180, 25, 'F');

    doc.setFont("helvetica", "bold");
    doc.text("Name of Faculty:", 20, yPos + 2);
    doc.text("Department:", 20, yPos + 10);

    doc.setFont("helvetica", "normal");
    doc.text(userInfo.name || "N/A", 60, yPos + 2);
    doc.text(userInfo.department || "N/A", 60, yPos + 10);

    yPos += 30;

    // --- SUMMARY TABLE ---
    doc.setFont("helvetica", "bold");
    doc.text("1. Summary of Achievements", 15, yPos);
    yPos += 5;

    const summaryData = [
        ["1", "Research Publications", stats.publications || 0],
        ["2", "Patents (Published/Granted)", stats.patents || 0],
        ["3", "FDPs / Workshops (Attended)", stats.fdpsAttended || 0],
        ["4", "FDPs (Organised)", stats.fdpsOrganised || 0],
        ["5", "Workshops (Organised)", stats.workshops || 0],
        ["6", "Awards / Recognitions", stats.awards || 0],
        ["7", "Research Projects / Grants", stats.projects || 0],
    ];

    autoTable(doc, {
        startY: yPos,
        head: [["Sr. No.", "Category", "Count"]],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175] },
        columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: 15, right: 15 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // --- DETAILED TABLES ---
    doc.setFont("helvetica", "bold");
    doc.text("2. Detailed Achievements", 15, yPos);
    yPos += 5;

    const publications = reportData.filter(a => a.category === "Publication");
    const fdpsOrganised = reportData.filter(a => a.category === "FDP" && a.subCategory === "Organised");
    const fdpsAttended = reportData.filter(a => a.category === "FDP" && a.subCategory === "Attended");
    const workshops = reportData.filter(a => a.category === "Workshop");
    const others = reportData.filter(a =>
        !["Publication", "FDP", "Workshop"].includes(a.category)
    );

    const addTable = (title, cols, data) => {
        if (data.length > 0) {
            // Check space
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.text(title, 15, yPos);
            autoTable(doc, {
                startY: yPos + 2,
                head: [cols],
                body: data,
                headStyles: { fillColor: [75, 85, 99] },
                margin: { left: 15, right: 15 }
            });
            yPos = doc.lastAutoTable.finalY + 10;
        }
    }

    addTable("2.1 Research Publications", ["Title", "Type", "Date"], publications.map(p => [
        p.title,
        p.subCategory || "-",
        new Date(p.achievementDate).toLocaleDateString()
    ]));

    addTable("2.2 FDPs Organised", ["Title", "Funding Agency", "Grant (Rs)", "Duration", "Dates"], fdpsOrganised.map(item => [
        item.title,
        item.fundedBy || "-",
        item.grantAmount ? `Rs. ${item.grantAmount}` : "-",
        item.duration || "-",
        `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`
    ]));

    const training = [...fdpsAttended, ...workshops];
    addTable("2.3 Workshops / FDPs (Attended/Conducted)", ["Category", "Title", "Duration", "Dates"], training.map(item => [
        `${item.category} (${item.subCategory || 'General'})`,
        item.title,
        item.duration || "-",
        (item.startDate && item.endDate) ? `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}` : new Date(item.achievementDate).toLocaleDateString()
    ]));

    addTable("2.4 Other Achievements", ["Category", "Title", "Date", "Description"], others.map(item => [
        item.category,
        item.title,
        new Date(item.achievementDate).toLocaleDateString(),
        item.description || "-"
    ]));
};

export const generateReportPDF = async (reportData, reportConfig) => {
    const doc = new jsPDF();
    await addReportPage(doc, reportData, reportConfig);
    doc.save(`Report_${reportConfig.userInfo.name?.split(' ')[0]}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateBulkReportPDF = async (reports, filename) => {
    const doc = new jsPDF();

    for (let i = 0; i < reports.length; i++) {
        if (i > 0) doc.addPage();
        await addReportPage(doc, reports[i].reportData, reports[i].reportConfig);
    }

    doc.save(filename || `Bulk_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
