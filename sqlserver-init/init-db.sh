#!/bin/bash
# Wait for SQL Server to be ready
until /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -C &>/dev/null; do
  echo "Waiting for SQL Server..."
  sleep 2
done

echo "SQL Server ready. Creating databases..."

/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'clothing_auth_db')
    CREATE DATABASE clothing_auth_db;
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'clothing_product_db')
    CREATE DATABASE clothing_product_db;
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'clothing_order_db')
    CREATE DATABASE clothing_order_db;
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'clothing_category_db')
    CREATE DATABASE clothing_category_db;
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'clothing_discount_db')
    CREATE DATABASE clothing_discount_db;
"

echo "Databases created successfully."
