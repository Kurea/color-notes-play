// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dthdynfusjttkwveodbg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGR5bmZ1c2p0dGt3dmVvZGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMzE1OTYsImV4cCI6MjA1NzcwNzU5Nn0.cPMH7ii8oa6-nboScUV3qmIdmTOTE8IMsf6dMAIT3q0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);