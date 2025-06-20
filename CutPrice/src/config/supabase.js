import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrjjkbtkbzzklxhsduj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhscmpqa2J0a2J6emtseGhzZHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDY0MTUsImV4cCI6MjA2NTkyMjQxNX0.h5bwXllaU241WFQFIm6RDtRFzFMs9yB-U78E7LkGAb8';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 