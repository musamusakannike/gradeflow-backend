import PDFTable from "pdfkit-table"
import moment from "moment"

/**
 * Generate a student result report PDF
 * @param {Object} data - The data needed for the report
 * @param {Object} data.student - Student information
 * @param {Object} data.school - School information
 * @param {Object} data.result - Result information
 * @param {Array} data.scores - Array of subject scores
 * @param {Object} data.term - Term information
 * @param {Object} data.class - Class information
 * @param {Object} data.attendance - Attendance statistics (optional)
 * @returns {Promise<Buffer>} - PDF document as buffer
 */
export const generateResultPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFTable({ margin: 30, size: "A4" })
      const buffers = []

      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      // Add school header
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(data.school.name.toUpperCase(), { align: "center" })
        .fontSize(12)
        .text(data.school.address, { align: "center" })
        .text(`${data.school.city}, ${data.school.state}, ${data.school.country}`, { align: "center" })
        .moveDown()

      // Add report title
      doc.font("Helvetica-Bold").fontSize(14).text("STUDENT RESULT REPORT", { align: "center" }).moveDown()

      // Add student information
      doc.font("Helvetica-Bold").fontSize(12).text("STUDENT INFORMATION")
      doc.font("Helvetica").fontSize(10)

      const studentInfo = {
        headers: [
          { label: "Field", property: "field", width: 150 },
          { label: "Value", property: "value", width: 350 },
        ],
        datas: [
          { field: "Student ID", value: data.student.studentId },
          { field: "Name", value: `${data.student.user.firstName} ${data.student.user.lastName}` },
          { field: "Class", value: data.class.name },
          { field: "Term", value: data.term.name },
          { field: "Academic Session", value: data.term.academicSession?.name || "N/A" },
        ],
      }

      await doc.table(studentInfo, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      })

      doc.moveDown()

      // Add result summary
      doc.font("Helvetica-Bold").fontSize(12).text("RESULT SUMMARY")
      doc.font("Helvetica").fontSize(10)

      const resultSummary = {
        headers: [
          { label: "Field", property: "field", width: 150 },
          { label: "Value", property: "value", width: 350 },
        ],
        datas: [
          { field: "Number of Subjects", value: data.result.numberOfSubjects },
          { field: "Average Score", value: `${data.result.averageScore.toFixed(2)}%` },
          { field: "Position in Class", value: `${data.result.position}${getPositionSuffix(data.result.position)}` },
        ],
      }

      await doc.table(resultSummary, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      })

      doc.moveDown()

      // Add subject scores
      doc.font("Helvetica-Bold").fontSize(12).text("SUBJECT SCORES")
      doc.font("Helvetica").fontSize(10)

      const subjectScores = {
        headers: [
          { label: "Subject", property: "subject", width: 150 },
          { label: "Test 1", property: "test1", width: 70 },
          { label: "Test 2", property: "test2", width: 70 },
          { label: "Exam", property: "exam", width: 70 },
          { label: "Total (%)", property: "total", width: 70 },
          { label: "Grade", property: "grade", width: 70 },
        ],
        datas: data.scores.map((score) => ({
          subject: score.subject.name,
          test1: score.test1,
          test2: score.test2,
          exam: score.exam,
          total: `${score.percentageScore.toFixed(2)}%`,
          grade: score.grade,
        })),
      }

      await doc.table(subjectScores, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
          doc.font("Helvetica").fontSize(10)
          const { grade } = data.scores[indexRow]
          if (grade === "F") {
            doc.fillColor("red")
          } else if (grade === "A") {
            doc.fillColor("green")
          } else {
            doc.fillColor("black")
          }
        },
      })

      doc.fillColor("black").moveDown()

      // Add attendance information if available
      if (data.attendance) {
        doc.font("Helvetica-Bold").fontSize(12).text("ATTENDANCE SUMMARY")
        doc.font("Helvetica").fontSize(10)

        const attendanceSummary = {
          headers: [
            { label: "Field", property: "field", width: 150 },
            { label: "Value", property: "value", width: 350 },
          ],
          datas: [
            { field: "School Days", value: data.attendance.totalDays },
            { field: "Present", value: data.attendance.presentDays },
            { field: "Absent", value: data.attendance.absentDays },
            { field: "Late", value: data.attendance.lateDays || 0 },
            { field: "Excused", value: data.attendance.excusedDays || 0 },
            { field: "Attendance Rate", value: `${data.attendance.attendancePercentage}%` },
          ],
        }

        await doc.table(attendanceSummary, { 
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
          prepareRow: () => doc.font("Helvetica").fontSize(10),
        })

        doc.moveDown()
      }

      // Add remarks
      doc.font("Helvetica-Bold").fontSize(12).text("REMARKS")
      doc.font("Helvetica").fontSize(10)

      const remarks = {
        headers: [
          { label: "Person", property: "person", width: 150 },
          { label: "Remark", property: "remark", width: 350 },
        ],
        datas: [
          { person: "Class Teacher", value: data.result.classTeacherRemark || "No remarks" },
          { person: "Principal", value: data.result.principalRemark || "No remarks" },
        ],
      }

      await doc.table(remarks, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      })

      doc.moveDown()

      // Add signature section
      doc.fontSize(10).text("_______________________", 100, doc.y + 50)
      doc.text("Class Teacher's Signature", 100, doc.y + 5)

      doc.text("_______________________", 350, doc.y - 20)
      doc.text("Principal's Signature", 350, doc.y + 5)

      doc.text(`Generated on: ${moment().format("MMMM Do YYYY, h:mm:ss a")}`, { align: "center" })

      // Finalize the PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Generate a student attendance report PDF
 * @param {Object} data - The data needed for the report
 * @param {Object} data.student - Student information
 * @param {Object} data.school - School information
 * @param {Object} data.term - Term information
 * @param {Object} data.class - Class information
 * @param {Object} data.statistics - Attendance statistics
 * @param {Array} data.records - Array of attendance records
 * @returns {Promise<Buffer>} - PDF document as buffer
 */
export const generateAttendancePDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFTable({ margin: 30, size: "A4" })
      const buffers = []

      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      // Add school header
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(data.school.name.toUpperCase(), { align: "center" })
        .fontSize(12)
        .text(data.school.address, { align: "center" })
        .text(`${data.school.city}, ${data.school.state}, ${data.school.country}`, { align: "center" })
        .moveDown()

      // Add report title
      doc.font("Helvetica-Bold").fontSize(14).text("STUDENT ATTENDANCE REPORT", { align: "center" }).moveDown()

      // Add student information
      doc.font("Helvetica-Bold").fontSize(12).text("STUDENT INFORMATION")
      doc.font("Helvetica").fontSize(10)

      const studentInfo = {
        headers: [
          { label: "Field", property: "field", width: 150 },
          { label: "Value", property: "value", width: 350 },
        ],
        datas: [
          { field: "Student ID", value: data.student.studentId },
          { field: "Name", value: `${data.student.user.firstName} ${data.student.user.lastName}` },
          { field: "Class", value: data.class.name },
          { field: "Term", value: data.term.name },
          { field: "Academic Session", value: data.term.academicSession?.name || "N/A" },
        ],
      }

      await doc.table(studentInfo, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      })

      doc.moveDown()

      // Add attendance statistics
      doc.font("Helvetica-Bold").fontSize(12).text("ATTENDANCE STATISTICS")
      doc.font("Helvetica").fontSize(10)

      const attendanceStats = {
        headers: [
          { label: "Field", property: "field", width: 150 },
          { label: "Value", property: "value", width: 350 },
        ],
        datas: [
          { field: "Total School Days", value: data.statistics.totalDays },
          { field: "Days Present", value: data.statistics.presentDays },
          { field: "Days Absent", value: data.statistics.absentDays },
          { field: "Days Late", value: data.statistics.lateDays },
          { field: "Days Excused", value: data.statistics.excusedDays },
          { field: "Attendance Rate", value: `${data.statistics.attendancePercentage}%` },
        ],
      }

      await doc.table(attendanceStats, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      })

      doc.moveDown()

      // Add attendance records
      doc.font("Helvetica-Bold").fontSize(12).text("ATTENDANCE RECORDS")
      doc.font("Helvetica").fontSize(10)

      const attendanceRecords = {
        headers: [
          { label: "Date", property: "date", width: 100 },
          { label: "Status", property: "status", width: 100 },
          { label: "Marked By", property: "markedBy", width: 150 },
          { label: "Remark", property: "remark", width: 150 },
        ],
        datas: data.records.map((record) => ({
          date: moment(record.date).format("DD/MM/YYYY"),
          status: record.status,
          markedBy: record.markedBy ? `${record.markedBy.firstName} ${record.markedBy.lastName}` : "N/A",
          remark: record.remark || "N/A",
        })),
      }

      await doc.table(attendanceRecords, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
          doc.font("Helvetica").fontSize(10)
          const { status } = data.records[indexRow]
          if (status === "Absent") {
            doc.fillColor("red")
          } else if (status === "Present") {
            doc.fillColor("green")
          } else if (status === "Late") {
            doc.fillColor("orange")
          } else {
            doc.fillColor("blue")
          }
        },
      })

      doc.fillColor("black").moveDown()

      // Add monthly attendance chart (text-based)
      doc.font("Helvetica-Bold").fontSize(12).text("MONTHLY ATTENDANCE SUMMARY")
      doc.font("Helvetica").fontSize(10)

      // Group records by month
      const monthlyData = {}
      data.records.forEach((record) => {
        const month = moment(record.date).format("MMMM YYYY")
        if (!monthlyData[month]) {
          monthlyData[month] = {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
          }
        }

        monthlyData[month].total++

        if (record.status === "Present") monthlyData[month].present++
        else if (record.status === "Absent") monthlyData[month].absent++
        else if (record.status === "Late") monthlyData[month].late++
        else if (record.status === "Excused") monthlyData[month].excused++
      })

      const monthlyStats = {
        headers: [
          { label: "Month", property: "month", width: 100 },
          { label: "Total Days", property: "total", width: 80 },
          { label: "Present", property: "present", width: 80 },
          { label: "Absent", property: "absent", width: 80 },
          { label: "Late", property: "late", width: 80 },
          { label: "Attendance %", property: "percentage", width: 80 },
        ],
        datas: Object.entries(monthlyData).map(([month, stats]) => ({
          month,
          total: stats.total,
          present: stats.present,
          absent: stats.absent,
          late: stats.late,
          percentage: `${((stats.present / stats.total) * 100).toFixed(2)}%`,
        })),
      }

      await doc.table(monthlyStats, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      })

      doc.moveDown()

      // Add signature section
      doc.fontSize(10).text("_______________________", 100, doc.y + 30)
      doc.text("Class Teacher's Signature", 100, doc.y + 5)

      doc.text("_______________________", 350, doc.y - 20)
      doc.text("Principal's Signature", 350, doc.y + 5)

      doc.text(`Generated on: ${moment().format("MMMM Do YYYY, h:mm:ss a")}`, { align: "center" })

      // Finalize the PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Generate a class result report PDF
 * @param {Object} data - The data needed for the report
 * @param {Object} data.school - School information
 * @param {Object} data.class - Class information
 * @param {Object} data.term - Term information
 * @param {Array} data.results - Array of student results
 * @returns {Promise<Buffer>} - PDF document as buffer
 */
export const generateClassResultPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFTable({ margin: 30, size: "A4", layout: "landscape" })
      const buffers = []

      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      // Add school header
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(data.school.name.toUpperCase(), { align: "center" })
        .fontSize(12)
        .text(data.school.address, { align: "center" })
        .text(`${data.school.city}, ${data.school.state}, ${data.school.country}`, { align: "center" })
        .moveDown()

      // Add report title
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(`CLASS RESULT REPORT - ${data.class.name.toUpperCase()}`, { align: "center" })
        .fontSize(12)
        .text(`${data.term.name} - ${data.term.academicSession?.name || ""}`, { align: "center" })
        .moveDown()

      // Add class results
      doc.font("Helvetica-Bold").fontSize(12).text("CLASS RESULTS")
      doc.font("Helvetica").fontSize(10)

      const classResults = {
        headers: [
          { label: "Position", property: "position", width: 60 },
          { label: "Student ID", property: "studentId", width: 100 },
          { label: "Student Name", property: "studentName", width: 150 },
          { label: "No. of Subjects", property: "subjects", width: 100 },
          { label: "Average Score", property: "average", width: 100 },
          { label: "Total Score", property: "total", width: 100 },
          { label: "Remark", property: "remark", width: 150 },
        ],
        datas: data.results.map((result) => ({
          position: result.position,
          studentId: result.student.studentId,
          studentName: `${result.student.user.firstName} ${result.student.user.lastName}`,
          subjects: result.numberOfSubjects,
          average: `${result.averageScore.toFixed(2)}%`,
          total: result.totalScore.toFixed(2),
          remark: getRemarkFromAverage(result.averageScore),
        })),
      }

      await doc.table(classResults, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
          doc.font("Helvetica").fontSize(10)
          const { position } = data.results[indexRow]
          if (position <= 3) {
            doc.fillColor("green")
          } else {
            doc.fillColor("black")
          }
        },
      })

      doc.fillColor("black").moveDown()

      // Add class statistics
      doc.font("Helvetica-Bold").fontSize(12).text("CLASS STATISTICS")
      doc.font("Helvetica").fontSize(10)

      // Calculate class statistics
      const totalStudents = data.results.length
      const passCount = data.results.filter((result) => result.averageScore >= 40).length
      const failCount = totalStudents - passCount
      const highestAverage = Math.max(...data.results.map((result) => result.averageScore))
      const lowestAverage = Math.min(...data.results.map((result) => result.averageScore))
      const classAverage = data.results.reduce((sum, result) => sum + result.averageScore, 0) / totalStudents

      const classStats = {
        headers: [
          { label: "Statistic", property: "statistic", width: 200 },
          { label: "Value", property: "value", width: 200 },
        ],
        datas: [
          { statistic: "Total Number of Students", value: totalStudents },
          { statistic: "Number of Students Passed", value: passCount },
          { statistic: "Number of Students Failed", value: failCount },
          { statistic: "Pass Rate", value: `${((passCount / totalStudents) * 100).toFixed(2)}%` },
          { statistic: "Highest Average Score", value: `${highestAverage.toFixed(2)}%` },
          { statistic: "Lowest Average Score", value: `${lowestAverage.toFixed(2)}%` },
          { statistic: "Class Average Score", value: `${classAverage.toFixed(2)}%` },
        ],
      }

      await doc.table(classStats, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      })

      doc.moveDown()

      // Add signature section
      doc.fontSize(10).text("_______________________", 150, doc.y + 30)
      doc.text("Class Teacher's Signature", 150, doc.y + 5)

      doc.text("_______________________", 400, doc.y - 20)
      doc.text("Principal's Signature", 400, doc.y + 5)

      doc.text(`Generated on: ${moment().format("MMMM Do YYYY, h:mm:ss a")}`, { align: "center" })

      // Finalize the PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Generate a class attendance report PDF
 * @param {Object} data - The data needed for the report
 * @param {Object} data.school - School information
 * @param {Object} data.class - Class information
 * @param {Object} data.term - Term information
 * @param {Number} data.totalSchoolDays - Total number of school days
 * @param {Array} data.studentReports - Array of student attendance reports
 * @returns {Promise<Buffer>} - PDF document as buffer
 */
export const generateClassAttendancePDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFTable({ margin: 30, size: "A4" })
      const buffers = []

      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers)
        resolve(pdfData)
      })

      // Add school header
      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(data.school.name.toUpperCase(), { align: "center" })
        .fontSize(12)
        .text(data.school.address, { align: "center" })
        .text(`${data.school.city}, ${data.school.state}, ${data.school.country}`, { align: "center" })
        .moveDown()

      // Add report title
      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text(`CLASS ATTENDANCE REPORT - ${data.class.name.toUpperCase()}`, { align: "center" })
        .fontSize(12)
        .text(`${data.term.name} - ${data.term.academicSession?.name || ""}`, { align: "center" })
        .moveDown()

      // Add class information
      doc.font("Helvetica-Bold").fontSize(12).text("CLASS INFORMATION")
      doc.font("Helvetica").fontSize(10)

      const classInfo = {
        headers: [
          { label: "Field", property: "field", width: 200 },
          { label: "Value", property: "value", width: 300 },
        ],
        datas: [
          { field: "Class Name", value: data.class.name },
          { field: "Term", value: data.term.name },
          { field: "Academic Session", value: data.term.academicSession?.name || "N/A" },
          { field: "Total School Days", value: data.totalSchoolDays },
          { field: "Total Students", value: data.studentReports.length },
        ],
      }

      await doc.table(classInfo, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      })

      doc.moveDown()

      // Add student attendance reports
      doc.font("Helvetica-Bold").fontSize(12).text("STUDENT ATTENDANCE SUMMARY")
      doc.font("Helvetica").fontSize(10)

      const attendanceReports = {
        headers: [
          { label: "Student ID", property: "studentId", width: 100 },
          { label: "Student Name", property: "studentName", width: 150 },
          { label: "Present", property: "present", width: 70 },
          { label: "Absent", property: "absent", width: 70 },
          { label: "Late", property: "late", width: 70 },
          { label: "Attendance %", property: "percentage", width: 100 },
        ],
        datas: data.studentReports.map((report) => ({
          studentId: report.student.studentId,
          studentName: report.student.name,
          present: report.statistics.presentDays,
          absent: report.statistics.absentDays,
          late: report.statistics.lateDays || 0,
          percentage: report.statistics.attendancePercentage,
        })),
      }

      await doc.table(attendanceReports, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: (row, indexColumn, indexRow, rectRow) => {
          doc.font("Helvetica").fontSize(10)
          const percentage = Number.parseFloat(data.studentReports[indexRow].statistics.attendancePercentage)
          if (percentage < 75) {
            doc.fillColor("red")
          } else if (percentage >= 90) {
            doc.fillColor("green")
          } else {
            doc.fillColor("black")
          }
        },
      })

      doc.fillColor("black").moveDown()

      // Add class attendance statistics
      doc.font("Helvetica-Bold").fontSize(12).text("CLASS ATTENDANCE STATISTICS")
      doc.font("Helvetica").fontSize(10)

      // Calculate class statistics
      const totalStudents = data.studentReports.length
      const goodAttendance = data.studentReports.filter(
        (report) => Number.parseFloat(report.statistics.attendancePercentage) >= 90,
      ).length
      const averageAttendance = data.studentReports.filter(
        (report) =>
          Number.parseFloat(report.statistics.attendancePercentage) >= 75 &&
          Number.parseFloat(report.statistics.attendancePercentage) < 90,
      ).length
      const poorAttendance = data.studentReports.filter(
        (report) => Number.parseFloat(report.statistics.attendancePercentage) < 75,
      ).length

      const averageAttendanceRate =
        data.studentReports.reduce(
          (sum, report) => sum + Number.parseFloat(report.statistics.attendancePercentage),
          0,
        ) / totalStudents

      const classStats = {
        headers: [
          { label: "Statistic", property: "statistic", width: 200 },
          { label: "Value", property: "value", width: 300 },
        ],
        datas: [
          { statistic: "Total Number of Students", value: totalStudents },
          { statistic: "Students with Good Attendance (≥90%)", value: goodAttendance },
          { statistic: "Students with Average Attendance (75-89%)", value: averageAttendance },
          { statistic: "Students with Poor Attendance (<75%)", value: poorAttendance },
          { statistic: "Class Average Attendance Rate", value: `${averageAttendanceRate.toFixed(2)}%` },
        ],
      }

      await doc.table(classStats, { 
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
        prepareRow: () => doc.font("Helvetica").fontSize(10),
      })

      doc.moveDown()

      // Add signature section
      doc.fontSize(10).text("_______________________", 100, doc.y + 30)
      doc.text("Class Teacher's Signature", 100, doc.y + 5)

      doc.text("_______________________", 350, doc.y - 20)
      doc.text("Principal's Signature", 350, doc.y + 5)

      doc.text(`Generated on: ${moment().format("MMMM Do YYYY, h:mm:ss a")}`, { align: "center" })

      // Finalize the PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// Helper functions
function getPositionSuffix(position) {
  if (position >= 11 && position <= 13) {
    return "th"
  }

  switch (position % 10) {
    case 1:
      return "st"
    case 2:
      return "nd"
    case 3:
      return "rd"
    default:
      return "th"
  }
}

function getRemarkFromAverage(average) {
  if (average >= 70) {
    return "Excellent"
  } else if (average >= 60) {
    return "Very Good"
  } else if (average >= 50) {
    return "Good"
  } else if (average >= 45) {
    return "Fair"
  } else if (average >= 40) {
    return "Pass"
  } else {
    return "Fail"
  }
}
