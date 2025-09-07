# Advanced Payroll Management System - Java Desktop Application

A comprehensive Java Swing desktop application for managing employee payroll with advanced features including Excel-like navigation, automatic calculations, PDF export, and database integration.

## Features

### Core Functionality
- **Complete Payroll Management**: All 24 columns including Payment Date, Employee Details, Salary Components, Deductions, and Net Pay
- **Automatic Calculations**: Real-time calculation of bonus rates, OT rates, gross pay, total deductions, and net pay
- **Excel-like Navigation**: Arrow key navigation, immediate cell editing, Tab/Enter movement
- **Database Integration**: MySQL connectivity with full CRUD operations

### Advanced Features
- **Multi-Filter Search**: Search by general terms, specific ID, and date simultaneously
- **PDF Export**: Professional payroll reports with colored columns and employee names
- **Undo Functionality**: Revert individual cell edits with Ctrl+Z
- **Keyboard Shortcuts**: Ctrl+S for submit, Ctrl+Z for undo, F2 for edit
- **Visual Indicators**: Color-coded columns (Gross Pay: Blue, Deductions: Red, Net Pay: Green)
- **Status Tracking**: Automatic status management (Pending, Active, Failed)

### User Interface
- **Modern Design**: Navy blue color scheme with gradient effects
- **Responsive Layout**: Collapsible sidebar with statistics dashboard
- **Interactive Elements**: Hover effects, styled buttons, and smooth animations
- **Help System**: Comprehensive help dialog with usage instructions

## Installation & Setup

### Prerequisites
- Java 11 or higher
- MySQL Server 8.0+
- Maven 3.6+

### Database Setup
1. Create MySQL database:
\`\`\`sql
mysql -u root -p < database_setup.sql
\`\`\`

2. Update database connection in `PayrollDesktopApp.java`:
\`\`\`java
private static final String URL = "jdbc:mysql://localhost:3306/payroll_db";
private static final String USER = "your_username";
private static final String PASSWORD = "your_password";
\`\`\`

### Build & Run
1. Compile the application:
\`\`\`bash
mvn clean compile
\`\`\`

2. Run the application:
\`\`\`bash
mvn exec:java -Dexec.mainClass="PayrollDesktopApp"
\`\`\`

3. Create executable JAR:
\`\`\`bash
mvn clean package
java -jar target/payroll-desktop-app-1.0.0.jar
\`\`\`

## Usage Guide

### Navigation
- **Arrow Keys**: Move between cells
- **Tab/Enter**: Move to next cell
- **F2**: Start editing selected cell
- **Type directly**: Start editing immediately

### Data Entry
- **Basic Salary**: Required field that triggers automatic calculations
- **Employee Name**: Required text field
- **All calculations**: Automatically computed based on basic salary

### Operations
- **Add Row**: Creates new employee record with auto-generated ID
- **Submit (Ctrl+S)**: Saves all changes to database
- **Undo (Ctrl+Z)**: Reverts last cell edit
- **Refresh**: Reloads data from database
- **Search**: Filter by name, ID, or date
- **Export PDF**: Generate comprehensive payroll report

### Automatic Calculations
- **Bonus Rate**: 10% of Basic Salary
- **OT Rate**: Basic Salary ÷ 160 hours
- **Deduction Rate**: 5% of Basic Salary
- **Gross Pay**: Sum of all earnings
- **Net Pay**: Gross Pay minus Total Deductions

## Technical Architecture

### Components
- **Main Application**: `PayrollDesktopApp.java` - Core application logic
- **Database Layer**: `Connect` class for MySQL operations
- **UI Components**: Custom styled buttons, table renderers, and panels
- **Data Models**: Table model with automatic calculation triggers

### Dependencies
- **MySQL Connector**: Database connectivity
- **iText PDF**: PDF report generation
- **Apache POI**: Excel export capabilities (optional)

### Design Patterns
- **MVC Architecture**: Separation of data, view, and control logic
- **Observer Pattern**: Table model listeners for automatic calculations
- **Factory Pattern**: Styled component creation
- **Singleton Pattern**: Database connection management

## Customization

### Color Scheme
Modify color constants in `PayrollDesktopApp.java`:
\`\`\`java
static final Color NAVY_DARK = new Color(8, 16, 40);
static final Color NAVY = new Color(20, 34, 61);
// Add your custom colors
\`\`\`

### Database Schema
Extend the `payroll_register` table in `database_setup.sql` for additional fields.

### Calculations
Modify calculation logic in `calculatePayrollFields()` method for custom formulas.

## Troubleshooting

### Common Issues
- **Database Connection**: Verify MySQL server is running and credentials are correct
- **PDF Export**: Ensure write permissions in target directory
- **Calculation Errors**: Check that Basic Salary contains valid numeric values
- **Performance**: For large datasets, consider implementing pagination

### Support
For technical support or feature requests, refer to the comprehensive help system within the application (Help menu in sidebar).
