-- RBAC: Role sütunu ekleme
-- profiles tablosuna role kolonu ekle

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Mevcut kullanıcıları 'user' yap
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- Olası değerler için constraint (opsiyonel ama önerilen)
-- ALTER TABLE profiles ADD CONSTRAINT valid_role CHECK (role IN ('user', 'premium', 'admin', 'moderator'));

-- Kendinizi admin yapmak için:
-- UPDATE profiles SET role = 'admin' WHERE email = 'e.ensarkucuk53@gmail.com';

-- RLS Policy: Admin her şeyi görebilir (opsiyonel)
-- CREATE POLICY "Admins can view all profiles"
--     ON profiles FOR SELECT
--     USING (auth.jwt() ->> 'role' = 'admin' OR auth.uid() = id);
