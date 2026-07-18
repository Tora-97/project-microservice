-- 1. CLEAN ORDERS DATABASE
USE clothing_order_db;
DELETE FROM order_items;
DELETE FROM orders;
DBCC CHECKIDENT ('order_items', RESEED, 0);
DBCC CHECKIDENT ('orders', RESEED, 0);

-- 2. CLEAN PRODUCTS DATABASE
USE clothing_product_db;
DELETE FROM product_variants;
DELETE FROM products;
DBCC CHECKIDENT ('product_variants', RESEED, 0);
DBCC CHECKIDENT ('products', RESEED, 0);

-- 3. CLEAN CATEGORIES DATABASE
USE clothing_category_db;
DELETE FROM categories;
DBCC CHECKIDENT ('categories', RESEED, 0);

-- 4. SEED CATEGORIES
SET IDENTITY_INSERT categories ON;
INSERT INTO categories (id, name, description) VALUES
(1, 'Men''s Tops', 'Collection of stylish t-shirts, shirts, and jackets for men'),
(2, 'Men''s Bottoms', 'High-quality jeans, chinos, and trousers for men'),
(3, 'Women''s Fashion', 'Elegant dresses, skirts, jackets, and blazers for women'),
(4, 'Accessories & More', 'Backpacks, belts, caps, and perfect fashion accessories');
SET IDENTITY_INSERT categories OFF;

-- 5. SEED PRODUCTS
USE clothing_product_db;
SET IDENTITY_INSERT products ON;

INSERT INTO products (id, name, description, base_price, image_url, category_id) VALUES
(1, 'Classic Oxford Shirt', 'Durable and breathable men''s Oxford shirt, perfect for both work and casual outings.', 29.99, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', 1),
(2, 'Fleece Hoodie', 'Warm and cozy fleece hoodie, comfortable unisex fit for a casual streetwear look.', 39.99, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80', 1),
(3, 'Biker Leather Jacket', 'Premium genuine leather jacket with classic biker details, asymmetrical zippers, and utility pockets.', 89.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80', 1),
(4, 'Basic Cotton Tee', 'Soft and breathable 100% natural cotton t-shirt, designed for everyday comfort.', 15.99, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop&q=80', 1),
(5, 'Slim-Fit Stretch Jeans', 'Modern slim-fit jeans with premium stretch denim that keeps its shape all day long.', 34.99, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80', 2),
(6, 'Classic Chino Pants', 'Comfortable and stylish flat-front chino trousers, ideal for office or weekend wear.', 27.99, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', 2),
(7, 'Floral Summer Dress', 'Lightweight and flowy floral dress, featuring a feminine A-line silhouette.', 45.99, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80', 3),
(8, 'Korean A-Line Skirt', 'Chic A-line skirt with a high waist, easy to pair with blouses and casual tees.', 22.99, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80', 3),
(9, 'Casual Women Blazer', 'Tailored blazer with subtle shoulder padding and a modern relaxed fit for office chic.', 49.99, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80', 3),
(10, 'Classic Baseball Cap', 'Adjustable classic canvas baseball cap, a sporty and functional accessory.', 12.50, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80', 4),
(11, 'Waterproof Backpack', 'Spacious everyday backpack made of waterproof material, featuring a padded laptop compartment.', 45.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 4),
(12, 'Genuine Leather Belt', 'Classic men''s belt made of genuine cowhide leather with a polished metal buckle.', 18.99, 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop&q=80', 4);

SET IDENTITY_INSERT products OFF;

-- 6. SEED PRODUCT VARIANTS
-- Variants for Product 1 (Classic Oxford Shirt)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('S', 'White', 15, 1),
('M', 'White', 20, 1),
('L', 'White', 18, 1),
('S', 'Light Blue', 10, 1),
('M', 'Light Blue', 25, 1),
('L', 'Light Blue', 15, 1);

-- Variants for Product 2 (Fleece Hoodie)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('M', 'Black', 12, 2),
('L', 'Black', 22, 2),
('XL', 'Black', 15, 2),
('M', 'Grey', 10, 2),
('L', 'Grey', 18, 2),
('XL', 'Grey', 8, 2),
('M', 'Yellow', 5, 2),
('L', 'Yellow', 12, 2);

-- Variants for Product 3 (Biker Leather Jacket)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('M', 'Black', 8, 3),
('L', 'Black', 12, 3),
('XL', 'Black', 5, 3),
('M', 'Brown', 4, 3),
('L', 'Brown', 6, 3);

-- Variants for Product 4 (Basic Cotton Tee)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('S', 'White', 30, 4),
('M', 'White', 45, 4),
('L', 'White', 40, 4),
('XL', 'White', 20, 4),
('S', 'Black', 25, 4),
('M', 'Black', 35, 4),
('L', 'Black', 30, 4),
('XL', 'Black', 15, 4),
('S', 'Grey', 15, 4),
('M', 'Grey', 20, 4);

-- Variants for Product 5 (Slim-Fit Stretch Jeans)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('30', 'Dark Blue', 15, 5),
('31', 'Dark Blue', 20, 5),
('32', 'Dark Blue', 18, 5),
('33', 'Dark Blue', 10, 5),
('30', 'Light Blue', 12, 5),
('31', 'Light Blue', 15, 5),
('32', 'Light Blue', 15, 5);

-- Variants for Product 6 (Classic Chino Pants)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('30', 'Khaki', 15, 6),
('31', 'Khaki', 22, 6),
('32', 'Khaki', 18, 6),
('33', 'Khaki', 12, 6),
('30', 'Black', 10, 6),
('31', 'Black', 15, 6),
('32', 'Black', 12, 6);

-- Variants for Product 7 (Floral Summer Dress)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('S', 'Pink', 10, 7),
('M', 'Pink', 15, 7),
('L', 'Pink', 8, 7),
('S', 'Floral Blue', 12, 7),
('M', 'Floral Blue', 18, 7),
('L', 'Floral Blue', 10, 7);

-- Variants for Product 8 (Korean A-Line Skirt)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('S', 'Black', 20, 8),
('M', 'Black', 25, 8),
('L', 'Black', 15, 8),
('S', 'Beige', 15, 8),
('M', 'Beige', 18, 8),
('L', 'Beige', 10, 8);

-- Variants for Product 9 (Casual Women Blazer)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('S', 'Black', 12, 9),
('M', 'Black', 18, 9),
('L', 'Black', 10, 9),
('S', 'Cream', 8, 9),
('M', 'Cream', 12, 9),
('L', 'Cream', 6, 9);

-- Variants for Product 10 (Classic Baseball Cap)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('Free size', 'Black', 30, 10),
('Free size', 'White', 25, 10);

-- Variants for Product 11 (Waterproof Backpack)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('Free size', 'Black', 20, 11),
('Free size', 'Army Green', 15, 11);

-- Variants for Product 12 (Genuine Leather Belt)
INSERT INTO product_variants (size, color, stock_quantity, product_id) VALUES
('Free size', 'Black', 25, 12),
('Free size', 'Brown', 20, 12);

-- Seed Vouchers
USE clothing_discount_db;
IF NOT EXISTS (SELECT 1 FROM discounts WHERE code = 'WELCOME10')
BEGIN
    INSERT INTO discounts (code, discount_type, discount_value, min_order_value, max_discount_value, usage_limit, used_count) VALUES
    ('WELCOME10', 'PERCENT', 10.0, 0.0, 50.0, 1000, 0),
    ('MEGA50', 'FIXED', 50.0, 100.0, 50.0, 100, 0),
    ('FREESHIP', 'FIXED', 5.0, 20.0, 5.0, 500, 0);
END

