-- Create database and table for the payroll system
CREATE DATABASE IF NOT EXISTS payroll_db;
USE payroll_db;

CREATE TABLE IF NOT EXISTS payroll_register (
    payment_date DATE NOT NULL,
    id INT PRIMARY KEY,
    employee_name VARCHAR(100) NOT NULL,
    basic_salary DECIMAL(10,2) DEFAULT 0,
    incentive DECIMAL(10,2) DEFAULT 0,
    special_bonus DECIMAL(10,2) DEFAULT 0,
    number_of_bonuses INT DEFAULT 0,
    bonus_rate DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    number_of_business_trips INT DEFAULT 0,
    business_trip_amount DECIMAL(10,2) DEFAULT 0,
    ot_hours DECIMAL(5,2) DEFAULT 0,
    ot_rate DECIMAL(10,2) DEFAULT 0,
    ot_amount DECIMAL(10,2) DEFAULT 0,
    gross_pay DECIMAL(10,2) DEFAULT 0,
    social_insurance DECIMAL(10,2) DEFAULT 0,
    advances DECIMAL(10,2) DEFAULT 0,
    transportation_deductions DECIMAL(10,2) DEFAULT 0,
    number_of_deductions INT DEFAULT 0,
    deduction_rate DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    net_pay DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active'
);

-- Insert sample data
INSERT INTO payroll_register VALUES
('2024-01-15', 1, 'Ahmed Hassan', 5000.00, 500.00, 200.00, 2, 500.00, 700.00, 1, 150.00, 10, 31.25, 312.50, 6862.50, 300.00, 100.00, 50.00, 1, 250.00, 250.00, 700.00, 6162.50, 'Active'),
('2024-01-15', 2, 'Sarah Johnson', 4500.00, 300.00, 150.00, 1, 450.00, 360.00, 2, 200.00, 8, 28.13, 225.00, 5735.00, 270.00, 150.00, 75.00, 2, 225.00, 270.00, 765.00, 4970.00, 'Active'),
('2024-01-15', 3, 'Mohamed Ali', 6000.00, 600.00, 300.00, 3, 600.00, 900.00, 0, 0.00, 15, 37.50, 562.50, 8362.50, 360.00, 200.00, 100.00, 1, 300.00, 240.00, 900.00, 7462.50, 'Active'),
('2024-01-15', 4, 'Lisa Chen', 5500.00, 400.00, 250.00, 2, 550.00, 495.00, 1, 120.00, 12, 34.38, 412.50, 7177.50, 330.00, 80.00, 60.00, 2, 275.00, 275.00, 745.00, 6432.50, 'Active'),
('2024-01-15', 5, 'Omar Khalil', 4800.00, 350.00, 180.00, 1, 480.00, 336.00, 3, 300.00, 6, 30.00, 180.00, 6146.00, 288.00, 120.00, 90.00, 1, 240.00, 288.00, 786.00, 5360.00, 'Active');
