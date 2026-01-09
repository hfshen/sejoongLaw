import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const documentType = searchParams.get("type")
    const name = searchParams.get("name")
    const date = searchParams.get("date")
    const locale = searchParams.get("locale") || "ko"
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const search = searchParams.get("search")
    const caseLinked = searchParams.get("case_linked")

    let query = supabase
      .from("documents")
      .select("*")
      .eq("locale", locale)

    // 필터 적용
    if (documentType) {
      query = query.eq("document_type", documentType)
    }
    if (name) {
      query = query.ilike("name", `%${name}%`)
    }
    if (date) {
      query = query.eq("date", date)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,data::text.ilike.%${search}%`)
    }
    if (caseLinked !== null) {
      query = query.eq("is_case_linked", caseLinked === "true")
    }

    // 정렬
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      )
    }

    return NextResponse.json({ documents: data || [] }, { status: 200 })
  } catch (error: any) {
    console.error("Documents API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()

    const { document_type, name, date, data, locale = "ko" } = body

    if (!document_type || !name || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data: document, error } = await supabase
      .from("documents")
      .insert([
        {
          document_type,
          name,
          date,
          data: data || {},
          locale,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to create document" },
        { status: 500 }
      )
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch (error: any) {
    console.error("Documents API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

