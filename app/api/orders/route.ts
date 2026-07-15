import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

const frozenStatuses = ['processing', 'completed'];

export async function DELETE(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId مطلوب' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'الطلبية غير موجودة' }, { status: 404 });
    }

    if (frozenStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: 'لا يمكن حذف الطلبية قيد المعالجة أو المكتملة' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'خطأ غير معروف' }, { status: 500 });
  }
}
