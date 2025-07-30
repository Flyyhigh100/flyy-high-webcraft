-- Add foreign key constraints to enable automatic joins in admin-service

-- Add foreign key constraint for payments.user_id → profiles.id
ALTER TABLE payments 
ADD CONSTRAINT fk_payments_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for websites.user_id → profiles.id  
ALTER TABLE websites
ADD CONSTRAINT fk_websites_user_id
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;