-- Update monthly subscription price from 50,000 to 25,000 CLP
UPDATE products
SET price = 25000,
    updated_at = NOW()
WHERE id = 'suscripcion-calculadoras-mensual';
