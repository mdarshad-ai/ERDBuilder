const XLSX = require('xlsx');

// Telecom Analytics Data Model
const tablesData = [
  // Fact Tables
  { id: '1', name: 'Call_Fact', type: 'fact', scdType: 'none', positionX: 100, positionY: 100, groups: 'Call Analytics' },
  { id: '2', name: 'Data_Usage_Fact', type: 'fact', scdType: 'none', positionX: 400, positionY: 100, groups: 'Data Analytics' },
  { id: '3', name: 'Billing_Fact', type: 'fact', scdType: 'none', positionX: 700, positionY: 100, groups: 'Billing Analytics' },
  { id: '4', name: 'Network_Performance_Fact', type: 'fact', scdType: 'none', positionX: 1000, positionY: 100, groups: 'Network Analytics' },
  
  // Dimension Tables
  { id: '5', name: 'Customer_Dim', type: 'dimension', scdType: 'SCD2', positionX: 100, positionY: 400, groups: 'Customer Analytics' },
  { id: '6', name: 'Product_Dim', type: 'dimension', scdType: 'SCD1', positionX: 400, positionY: 400, groups: 'Product Analytics' },
  { id: '7', name: 'Location_Dim', type: 'dimension', scdType: 'SCD1', positionX: 700, positionY: 400, groups: 'Location Analytics' },
  { id: '8', name: 'Time_Dim', type: 'dimension', scdType: 'none', positionX: 1000, positionY: 400, groups: 'Time Analytics' },
  { id: '9', name: 'Device_Dim', type: 'dimension', scdType: 'SCD2', positionX: 1300, positionY: 400, groups: 'Device Analytics' },
  { id: '10', name: 'Network_Tower_Dim', type: 'dimension', scdType: 'SCD1', positionX: 1600, positionY: 400, groups: 'Network Analytics' },
  { id: '11', name: 'Service_Plan_Dim', type: 'dimension', scdType: 'SCD1', positionX: 1900, positionY: 400, groups: 'Product Analytics' },
  { id: '12', name: 'Payment_Method_Dim', type: 'dimension', scdType: 'SCD1', positionX: 2200, positionY: 400, groups: 'Billing Analytics' }
];

const columnsData = [
  // Call_Fact columns
  { tableId: '1', name: 'call_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '1', name: 'customer_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '1', name: 'device_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '1', name: 'tower_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '1', name: 'time_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '1', name: 'call_duration_seconds', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '1', name: 'call_type', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '1', name: 'call_status', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '1', name: 'roaming_indicator', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '1', name: 'call_cost', type: 'decimal', isPK: 0, isFK: 0, nullable: 0 },
  
  // Data_Usage_Fact columns
  { tableId: '2', name: 'usage_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '2', name: 'customer_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '2', name: 'device_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '2', name: 'time_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '2', name: 'data_usage_mb', type: 'bigint', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '2', name: 'usage_type', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '2', name: 'network_type', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '2', name: 'peak_hour_usage', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  
  // Billing_Fact columns
  { tableId: '3', name: 'billing_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '3', name: 'customer_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '3', name: 'service_plan_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '3', name: 'payment_method_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '3', name: 'billing_cycle_start', type: 'date', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '3', name: 'billing_cycle_end', type: 'date', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '3', name: 'base_plan_amount', type: 'decimal', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '3', name: 'overage_amount', type: 'decimal', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '3', name: 'tax_amount', type: 'decimal', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '3', name: 'total_amount', type: 'decimal', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '3', name: 'payment_status', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  
  // Network_Performance_Fact columns
  { tableId: '4', name: 'performance_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '4', name: 'tower_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '4', name: 'time_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '4', name: 'signal_strength', type: 'float', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '4', name: 'connection_speed_mbps', type: 'float', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '4', name: 'latency_ms', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '4', name: 'packet_loss_percent', type: 'float', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '4', name: 'active_connections', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  
  // Customer_Dim columns
  { tableId: '5', name: 'customer_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'customer_key', type: 'bigint', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'first_name', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'last_name', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'email', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'phone_number', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'date_of_birth', type: 'date', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'customer_segment', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'credit_score', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'location_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '5', name: 'effective_start_date', type: 'timestamp', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '5', name: 'effective_end_date', type: 'timestamp', isPK: 0, isFK: 0, nullable: 1 },
  { tableId: '5', name: 'is_current', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  
  // Product_Dim columns
  { tableId: '6', name: 'product_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '6', name: 'product_name', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '6', name: 'product_category', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '6', name: 'product_type', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '6', name: 'brand', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '6', name: 'model', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '6', name: 'manufacturer', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '6', name: 'release_date', type: 'date', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '6', name: 'is_active', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  
  // Location_Dim columns
  { tableId: '7', name: 'location_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '7', name: 'address_line1', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '7', name: 'address_line2', type: 'string', isPK: 0, isFK: 0, nullable: 1 },
  { tableId: '7', name: 'city', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '7', name: 'state', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '7', name: 'postal_code', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '7', name: 'country', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '7', name: 'latitude', type: 'float', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '7', name: 'longitude', type: 'float', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '7', name: 'timezone', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  
  // Time_Dim columns
  { tableId: '8', name: 'time_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'date', type: 'date', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'year', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'quarter', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'month', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'month_name', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'week', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'day_of_week', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'day_name', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'hour', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'is_weekend', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '8', name: 'is_holiday', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  
  // Device_Dim columns
  { tableId: '9', name: 'device_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '9', name: 'device_key', type: 'bigint', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '9', name: 'imei', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '9', name: 'product_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '9', name: 'customer_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '9', name: 'activation_date', type: 'date', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '9', name: 'deactivation_date', type: 'date', isPK: 0, isFK: 0, nullable: 1 },
  { tableId: '9', name: 'device_status', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '9', name: 'effective_start_date', type: 'timestamp', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '9', name: 'effective_end_date', type: 'timestamp', isPK: 0, isFK: 0, nullable: 1 },
  { tableId: '9', name: 'is_current', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  
  // Network_Tower_Dim columns
  { tableId: '10', name: 'tower_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '10', name: 'tower_name', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '10', name: 'tower_code', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '10', name: 'location_id', type: 'bigint', isPK: 0, isFK: 1, nullable: 0 },
  { tableId: '10', name: 'tower_type', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '10', name: 'coverage_radius_km', type: 'float', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '10', name: 'installation_date', type: 'date', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '10', name: 'is_active', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  
  // Service_Plan_Dim columns
  { tableId: '11', name: 'service_plan_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '11', name: 'plan_name', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '11', name: 'plan_type', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '11', name: 'data_limit_gb', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '11', name: 'voice_minutes', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '11', name: 'sms_limit', type: 'int', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '11', name: 'monthly_fee', type: 'decimal', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '11', name: 'overage_rate_per_gb', type: 'decimal', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '11', name: 'is_unlimited', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '11', name: 'is_active', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  
  // Payment_Method_Dim columns
  { tableId: '12', name: 'payment_method_id', type: 'bigint', isPK: 1, isFK: 0, nullable: 0 },
  { tableId: '12', name: 'payment_type', type: 'string', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '12', name: 'card_type', type: 'string', isPK: 0, isFK: 0, nullable: 1 },
  { tableId: '12', name: 'card_last_four', type: 'string', isPK: 0, isFK: 0, nullable: 1 },
  { tableId: '12', name: 'bank_name', type: 'string', isPK: 0, isFK: 0, nullable: 1 },
  { tableId: '12', name: 'account_type', type: 'string', isPK: 0, isFK: 0, nullable: 1 },
  { tableId: '12', name: 'is_default', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 },
  { tableId: '12', name: 'is_active', type: 'boolean', isPK: 0, isFK: 0, nullable: 0 }
];

const relationshipsData = [
  // Call_Fact relationships
  { id: '1', sourceTable: 'Call_Fact', targetTable: 'Customer_Dim', type: '1:N', fkColumn: 'customer_id' },
  { id: '2', sourceTable: 'Call_Fact', targetTable: 'Device_Dim', type: '1:N', fkColumn: 'device_id' },
  { id: '3', sourceTable: 'Call_Fact', targetTable: 'Network_Tower_Dim', type: '1:N', fkColumn: 'tower_id' },
  { id: '4', sourceTable: 'Call_Fact', targetTable: 'Time_Dim', type: '1:N', fkColumn: 'time_id' },
  
  // Data_Usage_Fact relationships
  { id: '5', sourceTable: 'Data_Usage_Fact', targetTable: 'Customer_Dim', type: '1:N', fkColumn: 'customer_id' },
  { id: '6', sourceTable: 'Data_Usage_Fact', targetTable: 'Device_Dim', type: '1:N', fkColumn: 'device_id' },
  { id: '7', sourceTable: 'Data_Usage_Fact', targetTable: 'Time_Dim', type: '1:N', fkColumn: 'time_id' },
  
  // Billing_Fact relationships
  { id: '8', sourceTable: 'Billing_Fact', targetTable: 'Customer_Dim', type: '1:N', fkColumn: 'customer_id' },
  { id: '9', sourceTable: 'Billing_Fact', targetTable: 'Service_Plan_Dim', type: '1:N', fkColumn: 'service_plan_id' },
  { id: '10', sourceTable: 'Billing_Fact', targetTable: 'Payment_Method_Dim', type: '1:N', fkColumn: 'payment_method_id' },
  
  // Network_Performance_Fact relationships
  { id: '11', sourceTable: 'Network_Performance_Fact', targetTable: 'Network_Tower_Dim', type: '1:N', fkColumn: 'tower_id' },
  { id: '12', sourceTable: 'Network_Performance_Fact', targetTable: 'Time_Dim', type: '1:N', fkColumn: 'time_id' },
  
  // Dimension relationships
  { id: '13', sourceTable: 'Customer_Dim', targetTable: 'Location_Dim', type: '1:N', fkColumn: 'location_id' },
  { id: '14', sourceTable: 'Device_Dim', targetTable: 'Product_Dim', type: '1:N', fkColumn: 'product_id' },
  { id: '15', sourceTable: 'Device_Dim', targetTable: 'Customer_Dim', type: '1:N', fkColumn: 'customer_id' },
  { id: '16', sourceTable: 'Network_Tower_Dim', targetTable: 'Location_Dim', type: '1:N', fkColumn: 'location_id' }
];

const globalGroupsData = [
  { id: '1', name: 'Analytics Domains', tableRefs: '1:Call_Fact, 2:Data_Usage_Fact, 3:Billing_Fact, 4:Network_Performance_Fact' },
  { id: '2', name: 'Customer 360', tableRefs: '5:Customer_Dim, 9:Device_Dim, 11:Service_Plan_Dim, 12:Payment_Method_Dim' },
  { id: '3', name: 'Network Infrastructure', tableRefs: '4:Network_Performance_Fact, 10:Network_Tower_Dim, 7:Location_Dim' }
];

// Create workbook
const workbook = XLSX.utils.book_new();

// Add sheets
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(tablesData), 'Tables');
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(columnsData), 'Columns');
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(relationshipsData), 'Relationships');
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(globalGroupsData), 'GlobalGroups');

// Write file
XLSX.writeFile(workbook, 'telecom_analytics_model.xlsx');

console.log('Telecom Analytics Data Model Excel file created successfully!');
console.log('File: telecom_analytics_model.xlsx');
console.log('\nModel Overview:');
console.log('- 4 Fact Tables: Call_Fact, Data_Usage_Fact, Billing_Fact, Network_Performance_Fact');
console.log('- 8 Dimension Tables: Customer_Dim, Product_Dim, Location_Dim, Time_Dim, Device_Dim, Network_Tower_Dim, Service_Plan_Dim, Payment_Method_Dim');
console.log('- 16 Relationships connecting all tables');
console.log('- 3 Global Groups for organizing analytics domains');
console.log('\nKey Features:');
console.log('- SCD2 implementation for Customer_Dim and Device_Dim');
console.log('- SCD1 implementation for Product_Dim, Location_Dim, Network_Tower_Dim, Service_Plan_Dim, Payment_Method_Dim');
console.log('- Comprehensive telecom analytics covering calls, data usage, billing, and network performance');
console.log('- Realistic data types and constraints for telecom industry'); 