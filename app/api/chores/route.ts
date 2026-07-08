import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 定義共用的 CORS 標頭
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// 處理 OPTIONS 請求
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 建立 Supabase 連線的輔助函數
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { 
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); 
          } catch {}
        },
      },
    }
  );
}

// 1. 取得使用者的所有瑣事 (GET)
export async function GET() {
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("GET 請求失敗：找不到使用者。Auth Error:", authError);
    return NextResponse.json({ error: '請先登入系統' }, { status: 401, headers: corsHeaders });
  }

  const { data, error } = await supabase
    .from('chores')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('id', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  return NextResponse.json(data, { headers: corsHeaders });
}

// 2. 新增瑣事 (POST)
export async function POST(req: Request) {
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("POST 請求失敗：找不到使用者。Auth Error:", authError);
    return NextResponse.json({ error: '請先登入系統' }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json();
  
  const { data, error } = await supabase
    .from('chores')
    .insert([{ ...body, user_id: user.id }]) 
    .select()
    .single();

  if (error) {
    console.log("資料庫寫入錯誤:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
  return NextResponse.json(data, { headers: corsHeaders });
}

// 3. 更新瑣事狀態 (PATCH)
export async function PATCH(req: Request) {
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("PATCH 請求失敗：找不到使用者。Auth Error:", authError);
    return NextResponse.json({ error: '請先登入系統' }, { status: 401, headers: corsHeaders });
  }

  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: '缺少瑣事 ID' }, { status: 400, headers: corsHeaders });

  const { data, error } = await supabase
    .from('chores')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.log("資料庫更新錯誤:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
  return NextResponse.json(data, { headers: corsHeaders });
}

// 4. 刪除瑣事 (DELETE)
export async function DELETE(req: Request) {
  const supabase = await getSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("DELETE 請求失敗：找不到使用者。Auth Error:", authError);
    return NextResponse.json({ error: '請先登入系統' }, { status: 401, headers: corsHeaders });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: '缺少瑣事 ID' }, { status: 400, headers: corsHeaders });

  const { error } = await supabase
    .from('chores')
    .update({ is_deleted: true }) 
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.log("資料庫刪除錯誤:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
  return NextResponse.json({ success: true }, { headers: corsHeaders });
}