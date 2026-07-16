import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('clinic_types').select('code, name_ar, name_en, is_active').then(res => console.log(JSON.stringify(res.data, null, 2)));
