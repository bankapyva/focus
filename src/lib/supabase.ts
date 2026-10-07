import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lvvopobhjwmoebvgqpbc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T7WGYmS0-W1cFMLkuOuikg_u4UDgyik';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);