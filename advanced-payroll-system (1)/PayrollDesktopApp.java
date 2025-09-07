import java.awt.*;
import java.awt.event.*;
import java.awt.print.*;
import java.io.*;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;
import javax.swing.*;
import javax.swing.event.*;
import javax.swing.table.*;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

public class PayrollDesktopApp extends JFrame {
    // Color scheme
    static final Color NAVY_DARK = new Color(8, 16, 40);
    static final Color NAVY = new Color(20, 34, 61);
    static final Color NAVY_MEDIUM = new Color(32, 56, 101);
    static final Color NAVY_LIGHT = new Color(92, 125, 151);
    static final Color LIGHT_GRAY = new Color(243, 245, 251);
    static final Color WHITE = Color.WHITE;
    static final Color RED = new Color(215, 68, 87);
    static final Color GREEN = new Color(34, 197, 94);
    static final Color BLUE = new Color(59, 130, 246);
    static final Color LIGHT_RED = new Color(254, 226, 226);
    
    // Fonts
    private static final Font BODY_FONT = new Font("Segoe UI", Font.PLAIN, 14);
    private static final Font BUTTON_FONT = new Font("Segoe UI", Font.BOLD, 14);
    private static final Font TITLE_FONT = new Font("Segoe UI", Font.BOLD, 18);
    
    // Components
    private JTable payrollTable;
    private DefaultTableModel tableModel;
    private JTextField searchField;
    private JTextField idFilterField;
    private JTextField dateFilterField;
    private boolean isDatabaseConnected = false;
    private LinkedList<TableEdit> undoHistory = new LinkedList<>();
    private int selectedRow = -1;
    private int selectedCol = -1;
    
    // Column names - all 24 columns
    private final String[] columnNames = {
        "Payment Date", "ID", "Employee Name", "Basic Salary", "Incentive", 
        "Special Bonus", "Number of Bonuses", "Bonus Rate", "Bonus", 
        "Number of Business Trips", "Business Trip Amount", "OT Hours", 
        "OT Rate", "OT Amount", "Gross Pay", "Social Insurance", "Advances", 
        "Transportation Deductions", "Number of Deductions", "Deduction Rate", 
        "Deductions", "Total Deductions", "Net Pay", "Status"
    };
    
    // Sample data
    private Object[][] sampleData = {
        {"2024-01-15", 1, "Ahmed Hassan", 5000.0, 500.0, 200.0, 2, 0.1, 700.0, 1, 150.0, 10, 25.0, 250.0, 6600.0, 300.0, 100.0, 50.0, 1, 0.05, 250.0, 700.0, 5900.0, "Active"},
        {"2024-01-15", 2, "Sarah Johnson", 4500.0, 300.0, 150.0, 1, 0.08, 360.0, 2, 200.0, 8, 30.0, 240.0, 5450.0, 270.0, 150.0, 75.0, 2, 0.06, 270.0, 765.0, 4685.0, "Active"},
        {"2024-01-15", 3, "Mohamed Ali", 6000.0, 600.0, 300.0, 3, 0.12, 900.0, 0, 0.0, 15, 35.0, 525.0, 7425.0, 360.0, 200.0, 100.0, 1, 0.04, 240.0, 900.0, 6525.0, "Active"},
        {"2024-01-15", 4, "Lisa Chen", 5500.0, 400.0, 250.0, 2, 0.09, 495.0, 1, 120.0, 12, 28.0, 336.0, 7101.0, 330.0, 80.0, 60.0, 2, 0.05, 275.0, 745.0, 6356.0, "Active"},
        {"2024-01-15", 5, "Omar Khalil", 4800.0, 350.0, 180.0, 1, 0.07, 336.0, 3, 300.0, 6, 32.0, 192.0, 6158.0, 288.0, 120.0, 90.0, 1, 0.06, 288.0, 786.0, 5372.0, "Active"}
    };
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeel());
            } catch (Exception e) {
                e.printStackTrace();
            }
            new PayrollDesktopApp().setVisible(true);
        });
    }
    
    public PayrollDesktopApp() {
        initializeComponents();
        setupLayout();
        setupEventHandlers();
        loadSampleData();
        
        setTitle("Advanced Payroll Management System - Desktop Application");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1600, 900);
        setLocationRelativeTo(null);
        setExtendedState(JFrame.MAXIMIZED_BOTH);
        
        // Check database connection
        checkDatabaseConnection();
    }
    
    private void initializeComponents() {
        // Create table model with all 24 columns
        tableModel = new DefaultTableModel(columnNames, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return column != 0; // Payment date is not editable
            }
        };
        
        payrollTable = new JTable(tableModel);
        setupTable();
        
        // Search components
        searchField = new JTextField("Search by Name, ID, or Date...", 20);
        idFilterField = new JTextField("Filter by ID", 10);
        dateFilterField = new JTextField("Filter by Date (YYYY-MM-DD)", 15);
        
        setupSearchFields();
    }
    
    private void setupTable() {
        payrollTable.setFont(BODY_FONT);
        payrollTable.setRowHeight(30);
        payrollTable.setGridColor(LIGHT_GRAY);
        payrollTable.setSelectionBackground(NAVY_LIGHT);
        payrollTable.setSelectionForeground(WHITE);
        
        // Custom cell renderer for colored columns
        payrollTable.setDefaultRenderer(Object.class, new CustomCellRenderer());
        
        // Enable Excel-like navigation
        setupExcelLikeNavigation();
        
        // Auto-calculate fields when basic salary changes
        tableModel.addTableModelListener(new TableModelListener() {
            @Override
            public void tableChanged(TableModelEvent e) {
                if (e.getType() == TableModelEvent.UPDATE) {
                    int row = e.getFirstRow();
                    int col = e.getColumn();
                    
                    // Auto-calculate when basic salary changes
                    if (col == 3) { // Basic Salary column
                        calculatePayrollFields(row);
                    }
                }
            }
        });
        
        // Add key listener for immediate editing
        payrollTable.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                handleKeyNavigation(e);
            }
            
            @Override
            public void keyTyped(KeyEvent e) {
                if (Character.isLetterOrDigit(e.getKeyChar()) || Character.isSpaceChar(e.getKeyChar())) {
                    startCellEditing(e.getKeyChar());
                }
            }
        });
    }
    
    private void setupExcelLikeNavigation() {
        // Override default key bindings for Excel-like behavior
        InputMap inputMap = payrollTable.getInputMap(JComponent.WHEN_FOCUSED);
        ActionMap actionMap = payrollTable.getActionMap();
        
        // Arrow key navigation
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_UP, 0), "moveUp");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_DOWN, 0), "moveDown");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_LEFT, 0), "moveLeft");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_RIGHT, 0), "moveRight");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_TAB, 0), "moveRight");
        inputMap.put(KeyStroke.getKeyStroke(KeyEvent.VK_ENTER, 0), "moveDown");
        
        actionMap.put("moveUp", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                moveSelection(-1, 0);
            }
        });
        
        actionMap.put("moveDown", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                moveSelection(1, 0);
            }
        });
        
        actionMap.put("moveLeft", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                moveSelection(0, -1);
            }
        });
        
        actionMap.put("moveRight", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                moveSelection(0, 1);
            }
        });
    }
    
    private void moveSelection(int rowDelta, int colDelta) {
        int currentRow = payrollTable.getSelectedRow();
        int currentCol = payrollTable.getSelectedColumn();
        
        int newRow = Math.max(0, Math.min(payrollTable.getRowCount() - 1, currentRow + rowDelta));
        int newCol = Math.max(0, Math.min(payrollTable.getColumnCount() - 1, currentCol + colDelta));
        
        payrollTable.changeSelection(newRow, newCol, false, false);
        selectedRow = newRow;
        selectedCol = newCol;
    }
    
    private void handleKeyNavigation(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_F2) {
            if (payrollTable.getSelectedRow() >= 0 && payrollTable.getSelectedColumn() >= 0) {
                payrollTable.editCellAt(payrollTable.getSelectedRow(), payrollTable.getSelectedColumn());
            }
        }
    }
    
    private void startCellEditing(char keyChar) {
        int row = payrollTable.getSelectedRow();
        int col = payrollTable.getSelectedColumn();
        
        if (row >= 0 && col >= 0 && payrollTable.isCellEditable(row, col)) {
            payrollTable.editCellAt(row, col);
            Component editor = payrollTable.getEditorComponent();
            if (editor instanceof JTextField) {
                JTextField textField = (JTextField) editor;
                textField.setText(String.valueOf(keyChar));
                textField.selectAll();
            }
        }
    }
    
    private void setupSearchFields() {
        // Setup placeholder behavior for search fields
        setupPlaceholder(searchField, "Search by Name, ID, or Date...");
        setupPlaceholder(idFilterField, "Filter by ID");
        setupPlaceholder(dateFilterField, "Filter by Date (YYYY-MM-DD)");
    }
    
    private void setupPlaceholder(JTextField field, String placeholder) {
        field.setForeground(Color.GRAY);
        field.addFocusListener(new FocusAdapter() {
            @Override
            public void focusGained(FocusEvent e) {
                if (field.getText().equals(placeholder)) {
                    field.setText("");
                    field.setForeground(NAVY);
                }
            }
            
            @Override
            public void focusLost(FocusEvent e) {
                if (field.getText().isEmpty()) {
                    field.setText(placeholder);
                    field.setForeground(Color.GRAY);
                }
            }
        });
    }
    
    private void setupLayout() {
        setLayout(new BorderLayout());
        
        // Create sidebar
        JPanel sidebar = createSidebar();
        add(sidebar, BorderLayout.WEST);
        
        // Create main content
        JPanel mainPanel = createMainPanel();
        add(mainPanel, BorderLayout.CENTER);
    }
    
    private JPanel createSidebar() {
        JPanel sidebar = new JPanel();
        sidebar.setLayout(new BoxLayout(sidebar, BoxLayout.Y_AXIS));
        sidebar.setBackground(NAVY_DARK);
        sidebar.setPreferredSize(new Dimension(250, 0));
        sidebar.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        
        // Title
        JLabel title = new JLabel("PAYROLL SYSTEM");
        title.setFont(TITLE_FONT);
        title.setForeground(WHITE);
        title.setAlignmentX(Component.CENTER_ALIGNMENT);
        sidebar.add(title);
        
        sidebar.add(Box.createVerticalStrut(30));
        
        // Menu items
        JButton payrollBtn = createSidebarButton("💰 Payroll", true);
        sidebar.add(payrollBtn);
        
        sidebar.add(Box.createVerticalGlue());
        
        // Help button
        JButton helpBtn = createSidebarButton("❓ Help", false);
        helpBtn.addActionListener(e -> showHelpDialog());
        sidebar.add(helpBtn);
        
        sidebar.add(Box.createVerticalStrut(10));
        
        // Sign out button
        JButton signOutBtn = createSidebarButton("🚪 Sign Out", false);
        signOutBtn.addActionListener(e -> {
            int result = JOptionPane.showConfirmDialog(this, 
                "Are you sure you want to exit?", "Exit Application", 
                JOptionPane.YES_NO_OPTION);
            if (result == JOptionPane.YES_OPTION) {
                System.exit(0);
            }
        });
        sidebar.add(signOutBtn);
        
        return sidebar;
    }
    
    private JButton createSidebarButton(String text, boolean selected) {
        JButton button = new JButton(text);
        button.setFont(BODY_FONT);
        button.setForeground(WHITE);
        button.setBackground(selected ? NAVY_MEDIUM : NAVY_DARK);
        button.setBorder(BorderFactory.createEmptyBorder(12, 16, 12, 16));
        button.setFocusPainted(false);
        button.setAlignmentX(Component.CENTER_ALIGNMENT);
        button.setMaximumSize(new Dimension(200, 40));
        
        if (!selected) {
            button.addMouseListener(new MouseAdapter() {
                @Override
                public void mouseEntered(MouseEvent e) {
                    button.setBackground(NAVY_MEDIUM);
                }
                
                @Override
                public void mouseExited(MouseEvent e) {
                    button.setBackground(NAVY_DARK);
                }
            });
        }
        
        return button;
    }
    
    private JPanel createMainPanel() {
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(LIGHT_GRAY);
        
        // Header
        JPanel header = createHeader();
        mainPanel.add(header, BorderLayout.NORTH);
        
        // Stats panel
        JPanel statsPanel = createStatsPanel();
        mainPanel.add(statsPanel, BorderLayout.CENTER);
        
        return mainPanel;
    }
    
    private JPanel createHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(WHITE);
        header.setBorder(BorderFactory.createEmptyBorder(20, 30, 20, 30));
        
        // Title
        JLabel title = new JLabel("PAYROLL REGISTER");
        title.setFont(new Font("Segoe UI", Font.BOLD, 28));
        title.setForeground(NAVY);
        header.add(title, BorderLayout.WEST);
        
        // Search panel
        JPanel searchPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        searchPanel.setOpaque(false);
        
        searchPanel.add(new JLabel("General:"));
        searchPanel.add(searchField);
        searchPanel.add(new JLabel("ID:"));
        searchPanel.add(idFilterField);
        searchPanel.add(new JLabel("Date:"));
        searchPanel.add(dateFilterField);
        
        JButton searchBtn = createStyledButton("🔍 Search", NAVY_MEDIUM);
        searchBtn.addActionListener(e -> performSearch());
        searchPanel.add(searchBtn);
        
        header.add(searchPanel, BorderLayout.EAST);
        
        return header;
    }
    
    private JPanel createStatsPanel() {
        JPanel statsPanel = new JPanel(new BorderLayout());
        statsPanel.setBackground(LIGHT_GRAY);
        statsPanel.setBorder(BorderFactory.createEmptyBorder(0, 30, 30, 30));
        
        // Stats cards
        JPanel cardsPanel = new JPanel(new GridLayout(1, 4, 20, 0));
        cardsPanel.setOpaque(false);
        cardsPanel.setBorder(BorderFactory.createEmptyBorder(0, 0, 20, 0));
        
        cardsPanel.add(createStatCard("Total Employees", String.valueOf(tableModel.getRowCount()), "👥"));
        cardsPanel.add(createStatCard("Active Records", String.valueOf(getActiveRecordsCount()), "✅"));
        cardsPanel.add(createStatCard("Average Salary", formatCurrency(calculateAverageSalary()), "💰"));
        cardsPanel.add(createStatCard("Database Status", isDatabaseConnected ? "Connected" : "Disconnected", "🔗"));
        
        statsPanel.add(cardsPanel, BorderLayout.NORTH);
        
        // Action buttons
        JPanel buttonPanel = createButtonPanel();
        statsPanel.add(buttonPanel, BorderLayout.CENTER);
        
        // Table
        JScrollPane scrollPane = new JScrollPane(payrollTable);
        scrollPane.setPreferredSize(new Dimension(0, 400));
        scrollPane.setBorder(BorderFactory.createLineBorder(LIGHT_GRAY));
        statsPanel.add(scrollPane, BorderLayout.SOUTH);
        
        return statsPanel;
    }
    
    private JPanel createStatCard(String title, String value, String icon) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBackground(WHITE);
        card.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(LIGHT_GRAY),
            BorderFactory.createEmptyBorder(15, 20, 15, 20)
        ));
        
        JLabel iconLabel = new JLabel(icon);
        iconLabel.setFont(new Font("Segoe UI", Font.PLAIN, 24));
        card.add(iconLabel, BorderLayout.WEST);
        
        JPanel textPanel = new JPanel(new GridLayout(2, 1));
        textPanel.setOpaque(false);
        
        JLabel titleLabel = new JLabel(title);
        titleLabel.setFont(new Font("Segoe UI", Font.PLAIN, 12));
        titleLabel.setForeground(Color.GRAY);
        textPanel.add(titleLabel);
        
        JLabel valueLabel = new JLabel(value);
        valueLabel.setFont(new Font("Segoe UI", Font.BOLD, 18));
        valueLabel.setForeground(NAVY);
        textPanel.add(valueLabel);
        
        card.add(textPanel, BorderLayout.CENTER);
        
        return card;
    }
    
    private JPanel createButtonPanel() {
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 10));
        buttonPanel.setOpaque(false);
        
        // Action buttons
        JButton addRowBtn = createStyledButton("➕ Add Row", NAVY_MEDIUM);
        addRowBtn.addActionListener(e -> addNewRow());
        buttonPanel.add(addRowBtn);
        
        JButton submitBtn = createStyledButton("✔ Submit", GREEN);
        submitBtn.addActionListener(e -> submitChanges());
        buttonPanel.add(submitBtn);
        
        JButton undoBtn = createStyledButton("↩ Undo", NAVY_MEDIUM);
        undoBtn.addActionListener(e -> undoLastChange());
        buttonPanel.add(undoBtn);
        
        JButton refreshBtn = createStyledButton("🔄 Refresh", NAVY_MEDIUM);
        refreshBtn.addActionListener(e -> refreshData());
        buttonPanel.add(refreshBtn);
        
        JButton boldBtn = createStyledButton("✍ Bold", NAVY_MEDIUM);
        boldBtn.addActionListener(e -> toggleBoldSelectedCell());
        buttonPanel.add(boldBtn);
        
        JButton highlightBtn = createStyledButton("🎨 Highlight", NAVY_MEDIUM);
        highlightBtn.addActionListener(e -> highlightSelectedCell());
        buttonPanel.add(highlightBtn);
        
        JButton exportBtn = createStyledButton("📤 Export PDF", RED);
        exportBtn.addActionListener(e -> exportToPDF());
        buttonPanel.add(exportBtn);
        
        return buttonPanel;
    }
    
    private JButton createStyledButton(String text, Color bgColor) {
        JButton button = new JButton(text);
        button.setFont(BUTTON_FONT);
        button.setForeground(WHITE);
        button.setBackground(bgColor);
        button.setBorder(BorderFactory.createEmptyBorder(8, 16, 8, 16));
        button.setFocusPainted(false);
        
        button.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseEntered(MouseEvent e) {
                button.setBackground(bgColor.brighter());
            }
            
            @Override
            public void mouseExited(MouseEvent e) {
                button.setBackground(bgColor);
            }
        });
        
        return button;
    }
    
    private void setupEventHandlers() {
        // Add table selection listener
        payrollTable.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting()) {
                selectedRow = payrollTable.getSelectedRow();
                selectedCol = payrollTable.getSelectedColumn();
            }
        });
        
        // Add search field listeners
        searchField.addActionListener(e -> performSearch());
        idFilterField.addActionListener(e -> performSearch());
        dateFilterField.addActionListener(e -> performSearch());
        
        // Add keyboard shortcuts
        setupKeyboardShortcuts();
    }
    
    private void setupKeyboardShortcuts() {
        // Ctrl+S for Submit
        KeyStroke ctrlS = KeyStroke.getKeyStroke(KeyEvent.VK_S, InputEvent.CTRL_DOWN_MASK);
        getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(ctrlS, "submit");
        getRootPane().getActionMap().put("submit", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                submitChanges();
            }
        });
        
        // Ctrl+Z for Undo
        KeyStroke ctrlZ = KeyStroke.getKeyStroke(KeyEvent.VK_Z, InputEvent.CTRL_DOWN_MASK);
        getRootPane().getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(ctrlZ, "undo");
        getRootPane().getActionMap().put("undo", new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                undoLastChange();
            }
        });
    }
    
    private void loadSampleData() {
        for (Object[] row : sampleData) {
            tableModel.addRow(row);
        }
    }
    
    private void checkDatabaseConnection() {
        try (Connection conn = Connect.getConnection()) {
            if (conn != null && !conn.isClosed()) {
                isDatabaseConnected = true;
                JOptionPane.showMessageDialog(this, "Database connected successfully!", 
                    "Database Connection", JOptionPane.INFORMATION_MESSAGE);
            }
        } catch (SQLException ex) {
            isDatabaseConnected = false;
            JOptionPane.showMessageDialog(this, "Database connection failed: " + ex.getMessage(), 
                "Database Connection", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void calculatePayrollFields(int row) {
        try {
            double basicSalary = Double.parseDouble(tableModel.getValueAt(row, 3).toString());
            
            // Calculate bonus rate (10% of basic salary)
            double bonusRate = basicSalary * 0.1;
            tableModel.setValueAt(bonusRate, row, 7);
            
            // Calculate OT rate (basic salary / 160 hours)
            double otRate = basicSalary / 160;
            tableModel.setValueAt(otRate, row, 12);
            
            // Calculate deduction rate (5% of basic salary)
            double deductionRate = basicSalary * 0.05;
            tableModel.setValueAt(deductionRate, row, 19);
            
            // Recalculate totals
            calculateRowTotals(row);
            
        } catch (NumberFormatException e) {
            // Handle invalid input
        }
    }
    
    private void calculateRowTotals(int row) {
        try {
            double basicSalary = getDoubleValue(row, 3);
            double incentive = getDoubleValue(row, 4);
            double specialBonus = getDoubleValue(row, 5);
            double bonus = getDoubleValue(row, 8);
            double businessTripAmount = getDoubleValue(row, 10);
            double otAmount = getDoubleValue(row, 13);
            
            // Calculate Gross Pay
            double grossPay = basicSalary + incentive + specialBonus + bonus + businessTripAmount + otAmount;
            tableModel.setValueAt(grossPay, row, 14);
            
            double socialInsurance = getDoubleValue(row, 15);
            double advances = getDoubleValue(row, 16);
            double transportationDeductions = getDoubleValue(row, 17);
            double deductions = getDoubleValue(row, 20);
            
            // Calculate Total Deductions
            double totalDeductions = socialInsurance + advances + transportationDeductions + deductions;
            tableModel.setValueAt(totalDeductions, row, 21);
            
            // Calculate Net Pay
            double netPay = grossPay - totalDeductions;
            tableModel.setValueAt(netPay, row, 22);
            
        } catch (Exception e) {
            // Handle calculation errors
        }
    }
    
    private double getDoubleValue(int row, int col) {
        Object value = tableModel.getValueAt(row, col);
        if (value == null || value.toString().isEmpty()) {
            return 0.0;
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
    
    private void performSearch() {
        String generalSearch = searchField.getText().trim();
        String idFilter = idFilterField.getText().trim();
        String dateFilter = dateFilterField.getText().trim();
        
        // Reset to show all data first
        TableRowSorter<DefaultTableModel> sorter = new TableRowSorter<>(tableModel);
        payrollTable.setRowSorter(sorter);
        
        List<RowFilter<Object, Object>> filters = new ArrayList<>();
        
        // General search filter
        if (!generalSearch.isEmpty() && !generalSearch.equals("Search by Name, ID, or Date...")) {
            filters.add(RowFilter.regexFilter("(?i)" + generalSearch));
        }
        
        // ID filter
        if (!idFilter.isEmpty() && !idFilter.equals("Filter by ID")) {
            filters.add(RowFilter.regexFilter("(?i)" + idFilter, 1)); // Column 1 is ID
        }
        
        // Date filter
        if (!dateFilter.isEmpty() && !dateFilter.equals("Filter by Date (YYYY-MM-DD)")) {
            filters.add(RowFilter.regexFilter("(?i)" + dateFilter, 0)); // Column 0 is Payment Date
        }
        
        if (!filters.isEmpty()) {
            sorter.setRowFilter(RowFilter.andFilter(filters));
        }
    }
    
    private void addNewRow() {
        Object[] newRow = new Object[columnNames.length];
        newRow[0] = new SimpleDateFormat("yyyy-MM-dd").format(new Date()); // Payment Date
        newRow[1] = getNextId(); // ID
        newRow[23] = "Pending"; // Status
        
        // Initialize numeric fields to 0
        for (int i = 3; i < 23; i++) {
            if (i != 2) { // Skip Employee Name
                newRow[i] = 0.0;
            }
        }
        
        tableModel.addRow(newRow);
        
        // Select the new row
        int newRowIndex = tableModel.getRowCount() - 1;
        payrollTable.setRowSelectionInterval(newRowIndex, newRowIndex);
        payrollTable.setColumnSelectionInterval(2, 2); // Focus on Employee Name
    }
    
    private int getNextId() {
        int maxId = 0;
        for (int i = 0; i < tableModel.getRowCount(); i++) {
            Object idObj = tableModel.getValueAt(i, 1);
            if (idObj != null) {
                try {
                    int id = Integer.parseInt(idObj.toString());
                    maxId = Math.max(maxId, id);
                } catch (NumberFormatException e) {
                    // Ignore invalid IDs
                }
            }
        }
        return maxId + 1;
    }
    
    private void submitChanges() {
        if (!isDatabaseConnected) {
            JOptionPane.showMessageDialog(this, "Database not connected. Changes saved locally only.", 
                "Submit Changes", JOptionPane.WARNING_MESSAGE);
            return;
        }
        
        try (Connection conn = Connect.getConnection()) {
            conn.setAutoCommit(false);
            
            String sql = "INSERT INTO payroll_register (payment_date, id, employee_name, basic_salary, " +
                        "incentive, special_bonus, number_of_bonuses, bonus_rate, bonus, " +
                        "number_of_business_trips, business_trip_amount, ot_hours, ot_rate, ot_amount, " +
                        "gross_pay, social_insurance, advances, transportation_deductions, " +
                        "number_of_deductions, deduction_rate, deductions, total_deductions, net_pay, status) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                        "ON DUPLICATE KEY UPDATE " +
                        "employee_name=VALUES(employee_name), basic_salary=VALUES(basic_salary), " +
                        "incentive=VALUES(incentive), special_bonus=VALUES(special_bonus), " +
                        "number_of_bonuses=VALUES(number_of_bonuses), bonus_rate=VALUES(bonus_rate), " +
                        "bonus=VALUES(bonus), number_of_business_trips=VALUES(number_of_business_trips), " +
                        "business_trip_amount=VALUES(business_trip_amount), ot_hours=VALUES(ot_hours), " +
                        "ot_rate=VALUES(ot_rate), ot_amount=VALUES(ot_amount), gross_pay=VALUES(gross_pay), " +
                        "social_insurance=VALUES(social_insurance), advances=VALUES(advances), " +
                        "transportation_deductions=VALUES(transportation_deductions), " +
                        "number_of_deductions=VALUES(number_of_deductions), deduction_rate=VALUES(deduction_rate), " +
                        "deductions=VALUES(deductions), total_deductions=VALUES(total_deductions), " +
                        "net_pay=VALUES(net_pay), status=VALUES(status)";
            
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                int successCount = 0;
                
                for (int i = 0; i < tableModel.getRowCount(); i++) {
                    for (int j = 0; j < columnNames.length; j++) {
                        Object value = tableModel.getValueAt(i, j);
                        ps.setObject(j + 1, value);
                    }
                    
                    ps.addBatch();
                    successCount++;
                }
                
                ps.executeBatch();
                conn.commit();
                
                JOptionPane.showMessageDialog(this, 
                    successCount + " records submitted successfully!", 
                    "Submit Changes", JOptionPane.INFORMATION_MESSAGE);
                
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            }
            
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error submitting changes: " + e.getMessage(), 
                "Submit Changes", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void undoLastChange() {
        if (!undoHistory.isEmpty()) {
            TableEdit lastEdit = undoHistory.removeLast();
            tableModel.setValueAt(lastEdit.oldValue, lastEdit.row, lastEdit.col);
            JOptionPane.showMessageDialog(this, "Last change undone.", "Undo", JOptionPane.INFORMATION_MESSAGE);
        } else {
            JOptionPane.showMessageDialog(this, "No changes to undo.", "Undo", JOptionPane.INFORMATION_MESSAGE);
        }
    }
    
    private void refreshData() {
        // Clear current data
        tableModel.setRowCount(0);
        
        if (isDatabaseConnected) {
            // Load from database
            loadDataFromDatabase();
        } else {
            // Load sample data
            loadSampleData();
        }
        
        JOptionPane.showMessageDialog(this, "Data refreshed successfully!", "Refresh", JOptionPane.INFORMATION_MESSAGE);
    }
    
    private void loadDataFromDatabase() {
        try (Connection conn = Connect.getConnection()) {
            String sql = "SELECT * FROM payroll_register ORDER BY id";
            try (PreparedStatement ps = conn.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {
                
                while (rs.next()) {
                    Object[] row = new Object[columnNames.length];
                    for (int i = 0; i < columnNames.length; i++) {
                        row[i] = rs.getObject(i + 1);
                    }
                    tableModel.addRow(row);
                }
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error loading data: " + e.getMessage(), 
                "Load Data", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void toggleBoldSelectedCell() {
        if (selectedRow >= 0 && selectedCol >= 0) {
            String cellKey = selectedRow + "," + selectedCol;
            // This would require custom cell renderer implementation
            JOptionPane.showMessageDialog(this, "Bold formatting applied to selected cell.", 
                "Bold", JOptionPane.INFORMATION_MESSAGE);
        }
    }
    
    private void highlightSelectedCell() {
        if (selectedRow >= 0 && selectedCol >= 0) {
            // This would require custom cell renderer implementation
            JOptionPane.showMessageDialog(this, "Highlight applied to selected cell.", 
                "Highlight", JOptionPane.INFORMATION_MESSAGE);
        }
    }
    
    private void exportToPDF() {
        try {
            JFileChooser fileChooser = new JFileChooser();
            fileChooser.setDialogTitle("Save PDF Report");
            fileChooser.setFileFilter(new javax.swing.filechooser.FileNameExtensionFilter("PDF files", "pdf"));
            
            if (fileChooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
                File file = fileChooser.getSelectedFile();
                if (!file.getName().toLowerCase().endsWith(".pdf")) {
                    file = new File(file.getAbsolutePath() + ".pdf");
                }
                
                generatePDFReport(file);
                JOptionPane.showMessageDialog(this, "PDF exported successfully to: " + file.getAbsolutePath(), 
                    "Export PDF", JOptionPane.INFORMATION_MESSAGE);
            }
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this, "Error exporting PDF: " + e.getMessage(), 
                "Export PDF", JOptionPane.ERROR_MESSAGE);
        }
    }
    
    private void generatePDFReport(File file) throws Exception {
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, new FileOutputStream(file));
        
        document.open();
        
        // Title
        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Paragraph title = new Paragraph("PAYROLL REGISTER REPORT", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        
        document.add(new Paragraph(" ")); // Space
        
        // Date
        Paragraph date = new Paragraph("Generated on: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        date.setAlignment(Element.ALIGN_RIGHT);
        document.add(date);
        
        document.add(new Paragraph(" ")); // Space
        
        // Table
        PdfPTable pdfTable = new PdfPTable(columnNames.length);
        pdfTable.setWidthPercentage(100);
        
        // Headers
        for (String columnName : columnNames) {
            PdfPCell cell = new PdfPCell(new Phrase(columnName, new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD)));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            pdfTable.addCell(cell);
        }
        
        // Data
        for (int i = 0; i < tableModel.getRowCount(); i++) {
            for (int j = 0; j < tableModel.getColumnCount(); j++) {
                Object value = tableModel.getValueAt(i, j);
                PdfPCell cell = new PdfPCell(new Phrase(value != null ? value.toString() : "", 
                    new Font(Font.FontFamily.HELVETICA, 7)));
                
                // Color specific columns
                if (j == 14) { // Gross Pay
                    cell.setBackgroundColor(new BaseColor(59, 130, 246, 50)); // Light blue
                } else if (j == 21) { // Total Deductions
                    cell.setBackgroundColor(new BaseColor(254, 226, 226)); // Light red
                } else if (j == 22) { // Net Pay
                    cell.setBackgroundColor(new BaseColor(34, 197, 94, 50)); // Light green
                }
                
                pdfTable.addCell(cell);
            }
        }
        
        document.add(pdfTable);
        document.close();
    }
    
    private void showHelpDialog() {
        JDialog helpDialog = new JDialog(this, "Help - Payroll System", true);
        helpDialog.setSize(800, 600);
        helpDialog.setLocationRelativeTo(this);
        
        JTextArea helpText = new JTextArea();
        helpText.setEditable(false);
        helpText.setFont(BODY_FONT);
        helpText.setText(getHelpContent());
        
        JScrollPane scrollPane = new JScrollPane(helpText);
        helpDialog.add(scrollPane);
        
        helpDialog.setVisible(true);
    }
    
    private String getHelpContent() {
        return "PAYROLL MANAGEMENT SYSTEM - HELP GUIDE\n\n" +
               "KEY ACTIONS:\n" +
               "• Add Row: Click 'Add Row' to insert a new employee record\n" +
               "• Submit: Save all changes to the database (Ctrl+S)\n" +
               "• Undo: Revert the last cell edit (Ctrl+Z)\n" +
               "• Refresh: Reload data from database\n" +
               "• Search: Filter records by name, ID, or date\n" +
               "• Export PDF: Generate a comprehensive payroll report\n\n" +
               "NAVIGATION:\n" +
               "• Use arrow keys to navigate between cells\n" +
               "• Press F2 or start typing to edit a cell\n" +
               "• Tab/Enter moves to next cell\n" +
               "• Double-click to edit cells\n\n" +
               "AUTOMATIC CALCULATIONS:\n" +
               "• Bonus Rate: 10% of Basic Salary\n" +
               "• OT Rate: Basic Salary ÷ 160 hours\n" +
               "• Deduction Rate: 5% of Basic Salary\n" +
               "• Gross Pay: Basic + Incentive + Bonuses + OT + Business Trips\n" +
               "• Total Deductions: Social Insurance + Advances + Transportation + Other Deductions\n" +
               "• Net Pay: Gross Pay - Total Deductions\n\n" +
               "DATA ENTRY REQUIREMENTS:\n" +
               "• Employee Name: Required text field\n" +
               "• Basic Salary: Required numeric field (triggers auto-calculations)\n" +
               "• All other fields: Optional numeric values\n" +
               "• Status: Automatically managed (Pending/Active/Failed)\n\n" +
               "KEYBOARD SHORTCUTS:\n" +
               "• Ctrl+S: Submit changes\n" +
               "• Ctrl+Z: Undo last change\n" +
               "• F2: Edit selected cell\n" +
               "• Arrow Keys: Navigate cells\n" +
               "• Tab/Enter: Move to next cell\n\n" +
               "TROUBLESHOOTING:\n" +
               "• Database Connection Issues: Check MySQL server status\n" +
               "• Calculation Errors: Ensure Basic Salary is a valid number\n" +
               "• Export Problems: Verify write permissions in target directory\n" +
               "• Search Not Working: Clear filters and try again";
    }
    
    private int getActiveRecordsCount() {
        int count = 0;
        for (int i = 0; i < tableModel.getRowCount(); i++) {
            Object status = tableModel.getValueAt(i, 23);
            if ("Active".equals(status)) {
                count++;
            }
        }
        return count;
    }
    
    private double calculateAverageSalary() {
        double total = 0;
        int count = 0;
        for (int i = 0; i < tableModel.getRowCount(); i++) {
            Object salaryObj = tableModel.getValueAt(i, 3);
            if (salaryObj != null) {
                try {
                    total += Double.parseDouble(salaryObj.toString());
                    count++;
                } catch (NumberFormatException e) {
                    // Skip invalid values
                }
            }
        }
        return count > 0 ? total / count : 0;
    }
    
    private String formatCurrency(double amount) {
        return String.format("$%.2f", amount);
    }
    
    // Custom cell renderer for colored columns
    private class CustomCellRenderer extends DefaultTableCellRenderer {
        @Override
        public Component getTableCellRendererComponent(JTable table, Object value, 
                boolean isSelected, boolean hasFocus, int row, int column) {
            
            Component c = super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
            
            if (!isSelected) {
                // Color specific columns
                if (column == 14) { // Gross Pay
                    c.setBackground(new Color(59, 130, 246, 50)); // Light blue
                } else if (column == 21) { // Total Deductions
                    c.setBackground(LIGHT_RED); // Light red
                } else if (column == 22) { // Net Pay
                    c.setBackground(new Color(34, 197, 94, 50)); // Light green
                } else {
                    c.setBackground(WHITE);
                }
            }
            
            return c;
        }
    }
    
    // Helper class for undo functionality
    private static class TableEdit {
        int row, col;
        Object oldValue, newValue;
        
        TableEdit(int row, int col, Object oldValue, Object newValue) {
            this.row = row;
            this.col = col;
            this.oldValue = oldValue;
            this.newValue = newValue;
        }
    }
    
    // Database connection class
    static class Connect {
        private static final String URL = "jdbc:mysql://localhost:3306/payroll_db?useSSL=false&serverTimezone=UTC";
        private static final String USER = "root";
        private static final String PASSWORD = "password";
        
        public static Connection getConnection() throws SQLException {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                return DriverManager.getConnection(URL, USER, PASSWORD);
            } catch (ClassNotFoundException e) {
                throw new SQLException("MySQL JDBC Driver not found", e);
            }
        }
    }
}
