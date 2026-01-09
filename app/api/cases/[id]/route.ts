import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { updateDocumentFromCase } from "@/lib/documents/case-mapper"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { data: caseRecord, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      )
    }

    // 연결된 서류들도 함께 조회
    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: false })

    return NextResponse.json(
      { case: caseRecord, documents: documents || [] },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Cases API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { case_number, case_name, case_data, update_linked_documents = true } = body

    // 케이스 업데이트
    const updateData: any = {}
    if (case_number !== undefined) updateData.case_number = case_number
    if (case_name !== undefined) updateData.case_name = case_name
    if (case_data !== undefined) updateData.case_data = case_data

    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Supabase error:", updateError)
      return NextResponse.json(
        { error: "Failed to update case" },
        { status: 500 }
      )
    }

    // 연결된 서류들도 업데이트 (옵션)
    if (update_linked_documents && case_data) {
      console.log("[Case Update] Updating linked documents for case:", id)
      console.log("[Case Update] Case data:", JSON.stringify(case_data, null, 2))
      
      const { data: linkedDocuments } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", id)
        .eq("is_case_linked", true)

      if (linkedDocuments && linkedDocuments.length > 0) {
        console.log(`[Case Update] Found ${linkedDocuments.length} linked documents to update`)
        
        const updatePromises = linkedDocuments.map(async (doc) => {
          const updatedData = updateDocumentFromCase(
            doc.data,
            case_data,
            doc.document_type as any
          )
          
          console.log(`[Case Update] Updating document ${doc.id} (${doc.document_type}):`, 
            JSON.stringify({ 
              old_keys: Object.keys(doc.data), 
              new_keys: Object.keys(updatedData) 
            }, null, 2))

          return supabase
            .from("documents")
            .update({ data: updatedData })
            .eq("id", doc.id)
        })

        const results = await Promise.all(updatePromises)
        const errors = results.filter(r => r.error)
        
        if (errors.length > 0) {
          console.error("[Case Update] Some document updates failed:", errors)
        } else {
          console.log("[Case Update] All linked documents updated successfully")
        }
      }
    }

    return NextResponse.json({ case: updatedCase }, { status: 200 })
  } catch (error: any) {
    console.error("Cases API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    // 케이스 삭제 (연결된 서류들의 case_id는 NULL로 설정됨 - ON DELETE SET NULL)
    const { error } = await supabase.from("cases").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to delete case" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Cases API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

