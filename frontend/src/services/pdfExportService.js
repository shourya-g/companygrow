// frontend/src/services/pdfExportService.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

class PDFExportService {
  constructor() {
    this.doc = null;
    this.pageHeight = 297; // A4 page height in mm
    this.margin = 20;
    this.currentY = this.margin;
  }

  initDocument() {
    // Initialize jsPDF
    this.doc = new jsPDF();
    this.currentY = this.margin;
    
    console.log('PDF Document initialized. AutoTable available:', !!this.doc.autoTable);
    return this.doc;
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  }

  formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPercentage(value) {
    return `${parseFloat(value || 0).toFixed(1)}%`;
  }

  addHeader(title, subtitle = '') {
    const doc = this.doc;
    
    // Company header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('CompanyGrow Analytics Report', this.margin, this.currentY);
    
    this.currentY += 12;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(title, this.margin, this.currentY);
    
    if (subtitle) {
      this.currentY += 8;
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, this.margin, this.currentY);
      doc.setTextColor(0, 0, 0);
    }
    
    this.currentY += 15;
    
    // Add date and time
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, this.margin, this.currentY);
    doc.setTextColor(0, 0, 0);
    this.currentY += 15;
    
    // Add separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(this.margin, this.currentY, 210 - this.margin, this.currentY);
    this.currentY += 10;
    
    return this;
  }

  addSection(title, data = null) {
    this.checkPageBreak(20);
    
    const doc = this.doc;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text(title, this.margin, this.currentY);
    doc.setTextColor(0, 0, 0);
    this.currentY += 10;
    
    if (data) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      if (typeof data === 'string') {
        const lines = doc.splitTextToSize(data, 170);
        doc.text(lines, this.margin, this.currentY);
        this.currentY += lines.length * 5;
      }
    }
    
    return this;
  }

  addTable(headers, rows, title = '') {
    this.checkPageBreak(40);
    
    if (title) {
      this.doc.setFontSize(12);
      this.doc.setFont(undefined, 'bold');
      this.doc.text(title, this.margin, this.currentY);
      this.currentY += 8;
    }
    
    // Ensure rows is an array and handle empty data
    const tableRows = Array.isArray(rows) ? rows : [];
    if (tableRows.length === 0) {
      this.doc.setFontSize(10);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('No data available', this.margin, this.currentY);
      this.doc.setTextColor(0, 0, 0);
      this.currentY += 15;
      return this;
    }
    
    // Use autoTable with proper error handling
    if (this.doc.autoTable && typeof this.doc.autoTable === 'function') {
      try {
        console.log('Using autoTable for:', title);
        
        // Use autoTable with minimal configuration to avoid compatibility issues
        this.doc.autoTable({
          startY: this.currentY,
          head: [headers],
          body: tableRows,
          theme: 'striped',
          styles: {
            fontSize: 9,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          margin: { left: this.margin, right: this.margin },
          tableLineColor: [200, 200, 200],
          tableLineWidth: 0.1,
          didDrawPage: (data) => {
            // This callback is called after each page
            console.log('AutoTable page drawn, finalY:', data.cursor.y);
          }
        });
        
        // Update currentY after table
        this.currentY = this.doc.lastAutoTable.finalY + 15;
        console.log('AutoTable completed successfully, new currentY:', this.currentY);
        
      } catch (error) {
        console.error('Error creating autoTable:', error);
        console.log('Falling back to simple table');
        this.createSimpleTable(headers, tableRows);
      }
    } else {
      console.log('autoTable not available, creating simple table');
      this.createSimpleTable(headers, tableRows);
    }
    
    return this;
  }

  createSimpleTable(headers, rows) {
    const doc = this.doc;
    const pageWidth = 210; // A4 width
    const availableWidth = pageWidth - 2 * this.margin;
    const colWidth = availableWidth / headers.length;
    const rowHeight = 8;
    
    console.log('Creating simple table with', headers.length, 'columns and', rows.length, 'rows');
    
    // Draw headers
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setFillColor(41, 128, 185);
    doc.setTextColor(255, 255, 255);
    
    // Header background
    doc.rect(this.margin, this.currentY, availableWidth, rowHeight, 'F');
    
    // Header text
    headers.forEach((header, index) => {
      const x = this.margin + index * colWidth + 2;
      const headerText = String(header || '').substring(0, 15); // Limit header length
      doc.text(headerText, x, this.currentY + 6);
    });
    
    this.currentY += rowHeight;
    
    // Draw rows
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    rows.forEach((row, rowIndex) => {
      // Check for page break
      if (this.currentY + rowHeight > this.pageHeight - this.margin) {
        doc.addPage();
        this.currentY = this.margin;
      }
      
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(this.margin, this.currentY, availableWidth, rowHeight, 'F');
      }
      
      // Row data
      row.forEach((cell, colIndex) => {
        const x = this.margin + colIndex * colWidth + 2;
        const cellText = String(cell || '');
        // Truncate long text to fit in cell
        const maxChars = Math.floor(colWidth / 2); // Rough estimate
        const truncatedText = cellText.length > maxChars 
          ? cellText.substring(0, maxChars - 3) + '...' 
          : cellText;
        doc.text(truncatedText, x, this.currentY + 6);
      });
      
      this.currentY += rowHeight;
    });
    
    this.currentY += 10; // Add space after table
    console.log('Simple table completed, new currentY:', this.currentY);
  }

  addKeyMetrics(metrics) {
    this.checkPageBreak(60);
    
    const doc = this.doc;
    const startX = this.margin;
    const boxWidth = 40;
    const boxHeight = 25;
    const spacing = 5;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Key Metrics', startX, this.currentY);
    this.currentY += 15;
    
    let currentX = startX;
    let rowY = this.currentY;
    
    metrics.forEach((metric, index) => {
      // New row every 4 metrics
      if (index > 0 && index % 4 === 0) {
        rowY += boxHeight + spacing;
        currentX = startX;
      }
      
      // Draw box background
      doc.setFillColor(240, 240, 240);
      doc.rect(currentX, rowY, boxWidth, boxHeight, 'F');
      
      // Draw box border
      doc.setDrawColor(200, 200, 200);
      doc.rect(currentX, rowY, boxWidth, boxHeight);
      
      // Add metric value
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      const valueText = String(metric.value || 0);
      const valueWidth = doc.getTextWidth(valueText);
      doc.text(valueText, currentX + (boxWidth - valueWidth) / 2, rowY + 12);
      
      // Add metric label
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      const labelText = String(metric.label || '');
      const labelLines = doc.splitTextToSize(labelText, boxWidth - 4);
      doc.text(labelLines, currentX + 2, rowY + 18);
      
      currentX += boxWidth + spacing;
    });
    
    this.currentY = rowY + boxHeight + 15;
    return this;
  }

  checkPageBreak(requiredSpace) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  addFooter() {
    const doc = this.doc;
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        'CompanyGrow - Smart Workforce Development Platform',
        this.margin,
        doc.internal.pageSize.height - 10
      );
    }
    doc.setTextColor(0, 0, 0);
    
    return this;
  }

  save(filename) {
    try {
      this.addFooter();
      this.doc.save(filename);
      console.log(`PDF saved successfully: ${filename}`);
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new Error('Failed to save PDF file: ' + error.message);
    }
  }

  // Specific report generators
  generateUserAnalyticsReport(userData) {
    try {
      console.log('Generating user analytics report');
      
      this.initDocument();
      this.addHeader('User Analytics Report', 'Comprehensive user statistics and insights');
      
      // Key metrics
      const userMetrics = [
        { label: 'Total Users', value: userData?.totalUsers || 0 },
        { label: 'Active Users', value: userData?.activeUsers || 0 },
        { label: 'Activation Rate', value: userData?.totalUsers ? this.formatPercentage((userData.activeUsers / userData.totalUsers) * 100) : '0%' },
        { label: 'Departments', value: userData?.usersByDepartment?.length || 0 }
      ];
      
      this.addKeyMetrics(userMetrics);
      
      // Users by department
      if (userData?.usersByDepartment && Array.isArray(userData.usersByDepartment) && userData.usersByDepartment.length > 0) {
        const departmentRows = userData.usersByDepartment.map(dept => [
          dept.department || 'Unknown',
          String(dept.count || 0)
        ]);
        this.addTable(['Department', 'User Count'], departmentRows, 'Users by Department');
      }
      
      // Users by role
      if (userData?.usersByRole && Array.isArray(userData.usersByRole) && userData.usersByRole.length > 0) {
        const roleRows = userData.usersByRole.map(role => [
          (role.role || 'unknown').charAt(0).toUpperCase() + (role.role || 'unknown').slice(1),
          String(role.count || 0)
        ]);
        this.addTable(['Role', 'User Count'], roleRows, 'Users by Role');
      }
      
      return this;
    } catch (error) {
      console.error('Error generating user analytics report:', error);
      throw new Error('Failed to generate user analytics report: ' + error.message);
    }
  }

  generateProjectAnalyticsReport(projectData) {
    try {
      this.initDocument();
      this.addHeader('Project Analytics Report', 'Project performance and status overview');
      
      // Key metrics
      const projectMetrics = [
        { label: 'Total Projects', value: projectData?.totalProjects || 0 },
        { label: 'Active Projects', value: projectData?.activeProjects || 0 },
        { label: 'Completed Projects', value: projectData?.completedProjects || 0 },
        { label: 'Completion Rate', value: projectData?.totalProjects ? this.formatPercentage((projectData.completedProjects / projectData.totalProjects) * 100) : '0%' }
      ];
      
      this.addKeyMetrics(projectMetrics);
      
      // Projects by status
      if (projectData?.projectsByStatus && Array.isArray(projectData.projectsByStatus) && projectData.projectsByStatus.length > 0) {
        const statusRows = projectData.projectsByStatus.map(status => [
          (status.status || 'unknown').charAt(0).toUpperCase() + (status.status || 'unknown').slice(1),
          String(status.count || 0)
        ]);
        this.addTable(['Status', 'Project Count'], statusRows, 'Projects by Status');
      }
      
      return this;
    } catch (error) {
      console.error('Error generating project analytics report:', error);
      throw new Error('Failed to generate project analytics report: ' + error.message);
    }
  }

  generateCourseAnalyticsReport(courseData) {
    try {
      this.initDocument();
      this.addHeader('Course Analytics Report', 'Training and course enrollment insights');
      
      // Key metrics
      const courseMetrics = [
        { label: 'Total Courses', value: courseData?.totalCourses || 0 },
        { label: 'Active Courses', value: courseData?.activeCourses || 0 },
        { label: 'Total Enrollments', value: courseData?.totalEnrollments || 0 },
        { label: 'Completion Rate', value: `${courseData?.completionRate || 0}%` }
      ];
      
      this.addKeyMetrics(courseMetrics);
      
      // Courses by category
      if (courseData?.coursesByCategory && Array.isArray(courseData.coursesByCategory) && courseData.coursesByCategory.length > 0) {
        const categoryRows = courseData.coursesByCategory.map(category => [
          category.category || 'Unknown',
          String(category.count || 0)
        ]);
        this.addTable(['Category', 'Course Count'], categoryRows, 'Courses by Category');
      }
      
      return this;
    } catch (error) {
      console.error('Error generating course analytics report:', error);
      throw new Error('Failed to generate course analytics report: ' + error.message);
    }
  }

  generateSkillAnalyticsReport(skillData) {
    try {
      this.initDocument();
      this.addHeader('Skill Analytics Report', 'Skills distribution and proficiency analysis');
      
      if (skillData?.skillsByCategory && Array.isArray(skillData.skillsByCategory) && skillData.skillsByCategory.length > 0) {
        const categoryRows = skillData.skillsByCategory.map(category => [
          category.category || 'Unknown',
          String(category.count || 0)
        ]);
        this.addTable(['Skill Category', 'Skill Count'], categoryRows, 'Skills by Category');
      }
      
      return this;
    } catch (error) {
      console.error('Error generating skill analytics report:', error);
      throw new Error('Failed to generate skill analytics report: ' + error.message);
    }
  }

  generatePaymentAnalyticsReport(paymentData) {
    try {
      this.initDocument();
      this.addHeader('Payment Analytics Report', 'Financial transactions and payment insights');
      
      // Key metrics
      const paymentMetrics = [
        { label: 'Total Payments', value: paymentData?.totalPayments || 0 },
        { label: 'Successful Payments', value: paymentData?.successfulPayments || 0 },
        { label: 'Total Amount', value: this.formatCurrency(paymentData?.totalAmount || 0) },
        { label: 'Success Rate', value: `${paymentData?.successRate || 0}%` }
      ];
      
      this.addKeyMetrics(paymentMetrics);
      
      return this;
    } catch (error) {
      console.error('Error generating payment analytics report:', error);
      throw new Error('Failed to generate payment analytics report: ' + error.message);
    }
  }

  generateTokenAnalyticsReport(tokenData) {
    try {
      this.initDocument();
      this.addHeader('Token Analytics Report', 'Token economy and reward system insights');
      
      // Key metrics
      const tokenMetrics = [
        { label: 'Total Transactions', value: tokenData?.totalTransactions || 0 },
        { label: 'Tokens Earned', value: tokenData?.totalTokensEarned || 0 },
        { label: 'Tokens Spent', value: Math.abs(tokenData?.totalTokensSpent || 0) },
        { label: 'Net Tokens', value: tokenData?.netTokens || 0 }
      ];
      
      this.addKeyMetrics(tokenMetrics);
      
      return this;
    } catch (error) {
      console.error('Error generating token analytics report:', error);
      throw new Error('Failed to generate token analytics report: ' + error.message);
    }
  }

  generateBadgeAnalyticsReport(badgeData) {
    try {
      this.initDocument();
      this.addHeader('Badge Analytics Report', 'Achievement and recognition system insights');
      
      // Key metrics
      const badgeMetrics = [
        { label: 'Total Badges', value: badgeData?.totalBadges || 0 },
        { label: 'Total Awarded', value: badgeData?.totalAwarded || 0 },
        { label: 'Award Rate', value: badgeData?.totalBadges ? this.formatPercentage((badgeData.totalAwarded / badgeData.totalBadges) * 100) : '0%' }
      ];
      
      this.addKeyMetrics(badgeMetrics);
      
      return this;
    } catch (error) {
      console.error('Error generating badge analytics report:', error);
      throw new Error('Failed to generate badge analytics report: ' + error.message);
    }
  }

  generateComprehensiveReport(reportData) {
    try {
      console.log('Generating comprehensive report');
      
      this.initDocument();
      this.addHeader('Comprehensive Analytics Report', 
        `Complete platform insights${reportData?.dateRange?.startDate ? ` (${this.formatDate(reportData.dateRange.startDate)} - ${this.formatDate(reportData.dateRange.endDate)})` : ''}`);
      
      // Executive Summary
      this.addSection('Executive Summary', 'This comprehensive report provides insights into user engagement, course completions, project progress, and overall platform performance.');
      
      // Only add tables if data exists
      if (reportData?.userGrowth && Array.isArray(reportData.userGrowth) && reportData.userGrowth.length > 0) {
        this.addSection('User Growth Trends');
        const growthRows = reportData.userGrowth.map(growth => [
          new Date(growth.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          String(growth.count || 0)
        ]);
        this.addTable(['Month', 'New Users'], growthRows, 'Monthly User Growth');
      }
      
      if (reportData?.courseCompletions && Array.isArray(reportData.courseCompletions) && reportData.courseCompletions.length > 0) {
        this.addSection('Course Completion Trends');
        const completionRows = reportData.courseCompletions.map(completion => [
          new Date(completion.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          String(completion.count || 0)
        ]);
        this.addTable(['Month', 'Completed Courses'], completionRows, 'Monthly Course Completions');
      }
      
      if (reportData?.departmentPerformance && Array.isArray(reportData.departmentPerformance) && reportData.departmentPerformance.length > 0) {
        this.addSection('Department Performance');
        const deptRows = reportData.departmentPerformance.map(dept => [
          dept.department || 'Unknown',
          String(dept.user_count || 0)
        ]);
        this.addTable(['Department', 'Active Users'], deptRows, 'Department Activity');
      }
      
      // Add recommendations
      this.addSection('Recommendations & Insights');
      this.checkPageBreak(40);
      this.doc.setFontSize(10);
      const recommendations = [
        '• Focus on departments with lower engagement rates',
        '• Implement targeted training programs for skill gaps',
        '• Increase project completion incentives',
        '• Expand successful course categories',
        '• Review token reward mechanisms for optimal engagement'
      ];
      
      recommendations.forEach(rec => {
        this.doc.text(rec, this.margin, this.currentY);
        this.currentY += 6;
      });
      
      return this;
    } catch (error) {
      console.error('Error generating comprehensive report:', error);
      throw new Error('Failed to generate comprehensive report: ' + error.message);
    }
  }
}

export default new PDFExportService();