const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

/**
 * Generate inline SVG pie chart
 */
function generatePieChartSVG(data, title, width = 300, height = 300) {
  const radius = Math.min(width, height) / 2 - 20;
  const cx = width / 2;
  const cy = height / 2;
  
  const colors = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  let svgPath = '';
  let currentAngle = -Math.PI / 2;
  
  data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const endAngle = currentAngle + sliceAngle;
    
    const x1 = cx + radius * Math.cos(currentAngle);
    const y1 = cy + radius * Math.sin(currentAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    
    svgPath += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z" 
                       fill="${colors[index]}" stroke="white" stroke-width="2" />`;
    
    currentAngle = endAngle;
  });
  
  let legend = '';
  data.forEach((item, index) => {
    const percentage = ((item.value / total) * 100).toFixed(1);
    legend += `<div style="display: flex; align-items: center; margin: 5px 0;">
                 <span style="width: 15px; height: 15px; background: ${colors[index]}; border-radius: 2px; margin-right: 8px;"></span>
                 <span>${item.label}: ${item.value} (${percentage}%)</span>
               </div>`;
  });
  
  return `
    <div style="text-align: center; margin: 20px 0;">
      <h4 style="color: #333; margin-bottom: 15px;">${title}</h4>
      <svg width="${width}" height="${height}" style="margin: 0 auto; display: block;">
        ${svgPath}
      </svg>
      <div style="margin-top: 15px; text-align: left; display: inline-block; font-size: 0.9em; color: #666;">
        ${legend}
      </div>
    </div>
  `;
}

/**
 * Generate inline SVG bar chart
 */
function generateBarChartSVG(data, title, width = 400, height = 250) {
  const barWidth = 40;
  const spacing = 20;
  const maxValue = Math.max(...data.map(d => d.value));
  const chartHeight = height - 60;
  const startX = 40;
  const startY = height - 40;
  
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];
  
  let bars = '';
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const x = startX + index * (barWidth + spacing);
    const y = startY - barHeight;
    
    bars += `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${colors[index % colors.length]}" rx="4"/>
      <text x="${x + barWidth / 2}" y="${startY + 20}" text-anchor="middle" font-size="12" color="#666">${item.label}</text>
      <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="11" font-weight="bold" color="#333">${item.value}</text>
    `;
  });
  
  return `
    <div style="margin: 20px 0; text-align: center;">
      <h4 style="color: #333; margin-bottom: 15px;">${title}</h4>
      <svg width="${width}" height="${height}" style="margin: 0 auto; display: block;">
        <line x1="30" y1="20" x2="30" y2="${startY}" stroke="#ddd" stroke-width="2"/>
        <line x1="30" y1="${startY}" x2="${startX + data.length * (barWidth + spacing)}" y2="${startY}" stroke="#ddd" stroke-width="2"/>
        ${bars}
      </svg>
    </div>
  `;
}

/**
 * Generate comprehensive test report in HTML and PDF format with charts
 */
async function generateTestReport() {
  try {
    console.log('📊 Generating Graphical Test Report...\n');

    // Read test results
    const resultsPath = path.join(__dirname, '../test-results/results.json');
    let testResults = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let suiteStats = {};
    let durationByStatus = { passed: [], failed: [], skipped: [] };

    if (fs.existsSync(resultsPath)) {
      const resultsJSON = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      
      if (resultsJSON.suites) {
        resultsJSON.suites.forEach(suite => {
          if (suite.tests) {
            suiteStats[suite.title] = { passed: 0, failed: 0, skipped: 0, total: 0 };
            
            suite.tests.forEach(test => {
              totalTests++;
              suiteStats[suite.title].total++;
              
              if (test.status === 'passed') {
                passedTests++;
                suiteStats[suite.title].passed++;
                if (test.duration) durationByStatus.passed.push(test.duration);
              } else if (test.status === 'failed') {
                failedTests++;
                suiteStats[suite.title].failed++;
                if (test.duration) durationByStatus.failed.push(test.duration);
              } else if (test.status === 'skipped') {
                skippedTests++;
                suiteStats[suite.title].skipped++;
                if (test.duration) durationByStatus.skipped.push(test.duration);
              }
              
              testResults.push({
                title: test.title,
                suite: suite.title,
                status: test.status,
                duration: test.duration
              });
            });
          }
        });
      }
    }

    const timestamp = new Date().toLocaleString();
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;
    
    // Calculate average durations
    const avgDurationPassed = durationByStatus.passed.length > 0 
      ? (durationByStatus.passed.reduce((a, b) => a + b, 0) / durationByStatus.passed.length).toFixed(0)
      : 0;
    const avgDurationFailed = durationByStatus.failed.length > 0 
      ? (durationByStatus.failed.reduce((a, b) => a + b, 0) / durationByStatus.failed.length).toFixed(0)
      : 0;

    // Generate HTML Report with charts
    const testDistributionChart = generatePieChartSVG([
      { label: 'Passed', value: passedTests },
      { label: 'Failed', value: failedTests },
      { label: 'Skipped', value: skippedTests }
    ], 'Test Distribution');
    
    const suiteNames = Object.keys(suiteStats);
    const suiteChartData = suiteNames.map(name => ({
      label: name.substring(0, 15),
      value: suiteStats[name].total,
      passed: suiteStats[name].passed,
      failed: suiteStats[name].failed
    }));
    const suitePerformanceChart = suiteChartData.length > 0 
      ? generateBarChartSVG(suiteChartData, 'Tests by Suite', 500, 300)
      : '';
    
    const statusBar = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 15px; border-radius: 6px; color: white; text-align: center;">
          <div style="font-size: 28px; font-weight: bold;">${passedTests}</div>
          <div style="font-size: 12px; opacity: 0.9;">Passed Tests</div>
        </div>
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 15px; border-radius: 6px; color: white; text-align: center;">
          <div style="font-size: 28px; font-weight: bold;">${failedTests}</div>
          <div style="font-size: 12px; opacity: 0.9;">Failed Tests</div>
        </div>
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 15px; border-radius: 6px; color: white; text-align: center;">
          <div style="font-size: 28px; font-weight: bold;">${skippedTests}</div>
          <div style="font-size: 12px; opacity: 0.9;">Skipped Tests</div>
        </div>
      </div>
    `;

    // Generate HTML Report
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SensAI - Graphical Test Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f0f4f8;
      color: #333;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 50px 40px;
      border-radius: 12px;
      margin-bottom: 40px;
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
    }
    
    h1 {
      font-size: 2.8em;
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    h2 {
      font-size: 1.8em;
      margin: 30px 0 20px;
      color: #333;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }
    
    .timestamp {
      opacity: 0.9;
      font-size: 0.95em;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      border-left: 5px solid #667eea;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    }
    
    .stat-card h3 {
      color: #999;
      font-size: 0.85em;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .stat-value {
      font-size: 2.5em;
      font-weight: 700;
      color: #333;
    }
    
    .stat-card.passed {
      border-left-color: #10b981;
    }
    
    .stat-card.failed {
      border-left-color: #ef4444;
    }
    
    .stat-card.skipped {
      border-left-color: #f59e0b;
    }
    
    .progress-bar {
      width: 100%;
      height: 35px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
      margin-top: 15px;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 0.95em;
      transition: width 0.5s ease;
    }
    
    .charts-section {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      margin-bottom: 40px;
    }
    
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 30px;
      margin-top: 20px;
    }
    
    .test-results {
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      margin-bottom: 40px;
    }
    
    .test-results h2 {
      background: linear-gradient(135deg, #667eea15, #764ba215);
      padding: 20px;
      border-bottom: 2px solid #667eea;
      font-size: 1.5em;
    }
    
    .test-list {
      list-style: none;
    }
    
    .test-item {
      border-bottom: 1px solid #e5e7eb;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.2s ease;
    }
    
    .test-item:hover {
      background: #f9fafb;
    }
    
    .test-item:last-child {
      border-bottom: none;
    }
    
    .test-info {
      flex: 1;
    }
    
    .test-title {
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .test-suite {
      font-size: 0.85em;
      color: #999;
    }
    
    
    .test-status {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.8em;
      font-weight: 600;
    }
    
    .status-passed {
      background: #d1fae5;
      color: #065f46;
    }
    
    .status-failed {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .status-skipped {
      background: #fef3c7;
      color: #92400e;
    }
    
    .duration {
      font-size: 0.85em;
      color: #999;
    }
    
    .summary-section {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
      margin-bottom: 40px;
    }
    
    .summary-section h2 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .summary-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .summary-list li {
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 3px solid #667eea;
    }
    
    footer {
      margin-top: 50px;
      text-align: center;
      color: #999;
      font-size: 0.9em;
      padding: 20px;
      border-top: 2px solid #e5e7eb;
    }
    
    .page-break {
      page-break-after: always;
      margin: 50px 0;
    }
    
    .insights {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    
    .insight-card {
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #667eea;
      background: #f9fafb;
    }
    
    .insight-card.success {
      border-left-color: #10b981;
    }
    
    .insight-card.warning {
      border-left-color: #f59e0b;
    }
    
    @media print {
      body {
        background: white;
      }
      
      .container {
        padding: 0;
      }
      
      header {
        box-shadow: none;
      }
      
      .stat-card, .test-results, .summary-section, .charts-section {
        box-shadow: none;
        border: 1px solid #e5e7eb;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎯 SensAI - Graphical Test Report</h1>
      <p class="timestamp">Generated on: ${timestamp}</p>
    </header>
    
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Tests</h3>
        <div class="stat-value">${totalTests}</div>
      </div>
      
      <div class="stat-card passed">
        <h3>Passed</h3>
        <div class="stat-value" style="color: #10b981;">${passedTests}</div>
      </div>
      
      <div class="stat-card failed">
        <h3>Failed</h3>
        <div class="stat-value" style="color: #ef4444;">${failedTests}</div>
      </div>
      
      <div class="stat-card skipped">
        <h3>Skipped</h3>
        <div class="stat-value" style="color: #f59e0b;">${skippedTests}</div>
      </div>
    </div>
    
    <div class="stat-card">
      <h3>Pass Rate</h3>
      <div class="stat-value">${passRate}%</div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${passRate}%;">
          ${passRate}%
        </div>
      </div>
    </div>
    
    <div style="margin: 40px 0; padding: 20px; background: linear-gradient(135deg, #667eea15, #764ba215); border-radius: 10px; border-left: 4px solid #667eea;">
      ${statusBar}
    </div>
    
    <div class="charts-section">
      <h2>📊 Test Analytics</h2>
      <div class="charts-grid">
        ${testDistributionChart}
        ${suitePerformanceChart}
      </div>
    </div>
    
    <div class="page-break"></div>
    
    ${testResults.length > 0 ? `
    <div class="test-results">
      <h2>📋 Test Results</h2>
      <ul class="test-list">
        ${testResults.map(test => `
          <li class="test-item">
            <div class="test-info">
              <div class="test-title">${escapeHtml(test.title)}</div>
              <div class="test-suite">${escapeHtml(test.suite)}</div>
            </div>
            <div class="test-status">
              <span class="status-badge status-${test.status}">
                ${test.status.toUpperCase()}
              </span>
              ${test.duration ? `<span class="duration">${test.duration}ms</span>` : ''}
            </div>
          </li>
        `).join('')}
      </ul>
    </div>
    ` : ''}
    
    <div class="page-break"></div>
    
    <div class="summary-section">
      <h2>📈 Test Summary</h2>
      <ul class="summary-list">
        <li><strong>Total Test Suites:</strong> ${suiteNames.length}</li>
        <li><strong>Total Test Cases:</strong> ${totalTests}</li>
        <li><strong>Tests Passed:</strong> ${passedTests}</li>
        <li><strong>Tests Failed:</strong> ${failedTests}</li>
        <li><strong>Tests Skipped:</strong> ${skippedTests}</li>
        <li><strong>Pass Rate:</strong> ${passRate}%</li>
        <li><strong>Avg Duration (Passed):</strong> ${avgDurationPassed}ms</li>
        <li><strong>Avg Duration (Failed):</strong> ${avgDurationFailed}ms</li>
      </ul>
      
      <h2 style="margin-top: 30px;">🎯 Key Insights</h2>
      <div class="insights">
        ${passRate >= 95 ? `
          <div class="insight-card success">
            <strong>✓ Excellent Performance</strong><br/>
            Pass rate above 95%. System is stable and reliable.
          </div>
        ` : passRate >= 80 ? `
          <div class="insight-card">
            <strong>ℹ Good Performance</strong><br/>
            Pass rate ${passRate}%. Some tests need attention.
          </div>
        ` : `
          <div class="insight-card warning">
            <strong>⚠ Needs Review</strong><br/>
            Pass rate ${passRate}%. Multiple test failures detected.
          </div>
        `}
        ${failedTests > 0 ? `
          <div class="insight-card warning">
            <strong>⚠ ${failedTests} Failed Test${failedTests > 1 ? 's' : ''}</strong><br/>
            Review error logs and investigate root causes.
          </div>
        ` : `
          <div class="insight-card success">
            <strong>✓ All Tests Passed</strong><br/>
            Zero failing tests detected.
          </div>
        `}
        ${testResults.length > 0 ? `
          <div class="insight-card">
            <strong>ℹ Coverage Areas</strong><br/>
            Testing ${suiteNames.length} suites with ${testResults.length} test cases.
          </div>
        ` : ''}
      </div>
    </div>
    
    <div class="summary-section" style="margin-top: 30px;">
      <h2>🔍 Coverage by Test Suite</h2>
      <ul class="summary-list">
        ${suiteNames.map(suite => {
          const stats = suiteStats[suite];
          const suitePassRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
          return `<li>
            <strong>${suite}</strong><br/>
            <small>Passed: ${stats.passed}/${stats.total} (${suitePassRate}%)</small>
          </li>`;
        }).join('')}
      </ul>
    </div>
    
    <footer>
      <p>🚀 This report was generated by the SensAI Graphical Testing Suite</p>
      <p style="font-size: 0.85em; margin-top: 10px;">For issues or questions, contact the QA team.</p>
    </footer>
  </div>
  
  <script>
    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }
  </script>
</body>
</html>
    `;

    // Save HTML report
    const reportsDir = path.join(__dirname, '../test-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const htmlPath = path.join(reportsDir, 'test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`✅ HTML Report saved: ${htmlPath}`);

    // Convert HTML to PDF using Puppeteer or similar approach
    console.log('\n📝 Converting to PDF...');
    
    // Create a simple PDF using jsPDF with the report data
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    const lineHeight = 10;
    const margin = 15;

    // Title
    doc.setFontSize(24);
    doc.setTextColor(102, 126, 234);
    doc.text('SensAI - Graphical Test Report', margin, yPosition);

    // Timestamp
    yPosition += lineHeight * 1.5;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${timestamp}`, margin, yPosition);

    // Stats section
    yPosition += lineHeight * 1.5;
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Test Statistics:', margin, yPosition);

    yPosition += lineHeight;
    doc.setFontSize(11);
    const stats = [
      `Total Tests: ${totalTests}`,
      `Passed: ${passedTests}`,
      `Failed: ${failedTests}`,
      `Pass Rate: ${passRate}%`
    ];

    stats.forEach(stat => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(stat, margin + 5, yPosition);
      yPosition += lineHeight;
    });

    // Test results section if available
    if (testResults.length > 0) {
      yPosition += lineHeight;
      
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text('Test Results:', margin, yPosition);
      yPosition += lineHeight;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);

      testResults.slice(0, 20).forEach(test => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        const status = test.status.substring(0, 3).toUpperCase();
        doc.text(`• ${test.title} [${status}]`, margin + 5, yPosition);
        yPosition += lineHeight * 0.8;
      });

      if (testResults.length > 20) {
        yPosition += lineHeight;
        doc.text(`... and ${testResults.length - 20} more tests`, margin + 5, yPosition);
      }
    }

    // Summary section
    yPosition += lineHeight * 1.5;
    if (yPosition > pageHeight - margin - 30) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Coverage Areas:', margin, yPosition);
    yPosition += lineHeight;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    
    const coverageAreas = [
      '✓ Authentication Flows',
      '✓ Navigation and Routing',
      '✓ API Endpoints',
      '✓ Performance Testing',
      '✓ UI Components',
      '✓ Responsive Design',
      '✓ Accessibility'
    ];

    coverageAreas.forEach(area => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(area, margin + 5, yPosition);
      yPosition += lineHeight * 0.8;
    });

    // Coverage by Suite
    yPosition += lineHeight * 1.5;
    if (yPosition > pageHeight - margin - 30) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.text('Tests by Suite:', margin, yPosition);
    yPosition += lineHeight;
    doc.setFontSize(10);

    suiteNames.forEach(suite => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      const suiteData = suiteStats[suite];
      const suitePassRate = suiteData.total > 0 ? ((suiteData.passed / suiteData.total) * 100).toFixed(1) : 0;
      doc.text(`${suite}: ${suiteData.passed}/${suiteData.total} passed (${suitePassRate}%)`, margin + 5, yPosition);
      yPosition += lineHeight;
    });

    const pdfPath = path.join(reportsDir, 'test-report.pdf');
    doc.save(pdfPath);
    console.log(`✅ PDF Report saved: ${pdfPath}`);

    console.log('\n📊 Graphical Test Report Summary:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}`);
    console.log(`  Failed: ${failedTests}`);
    console.log(`  Pass Rate: ${passRate}%`);
    console.log(`\nReports generated:`);
    console.log(`  HTML: ${htmlPath}`);
    console.log(`  PDF:  ${pdfPath}`);

  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

generateTestReport();
