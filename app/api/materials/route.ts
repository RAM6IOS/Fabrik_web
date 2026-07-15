import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function DELETE(request: NextRequest) {
  try {
    const { materialId } = await request.json();

    if (!materialId) {
      return NextResponse.json({ error: 'materialId مطلوب' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { error } = await supabase
      .from('raw_materials')
      .delete()
      .eq('id', materialId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ غير معروف' }, { status: 500 });
  }
}
