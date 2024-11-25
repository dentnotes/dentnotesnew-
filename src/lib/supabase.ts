import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://grprykaulvurefmydujs.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdycHJ5a2F1bHZ1cmVmbXlkdWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNTQzNDksImV4cCI6MjA0NzYzMDM0OX0.sG5RoDen7BKzVjYgd5u5I4_YpG5d8UZ7ZfmyuR8fNm8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

