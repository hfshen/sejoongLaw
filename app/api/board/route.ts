import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    const { title, content, category } = await request.json()

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "제목, 내용, 카테고리가 필요합니다." },
        { status: 400 }
      )
    }

    // 프로필 확인 및 생성
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!profile) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
      })
    }

    const { data, error } = await supabase
      .from("board_posts")
      .insert({
        user_id: user.id,
        title,
        content,
        category,
        is_published: category === "qa" ? false : true, // Q/A는 관리자 승인 필요
      })
      .select()
      .single()

    if (error) {
      console.error("게시글 작성 오류:", error)
      return NextResponse.json(
        { error: "게시글 작성에 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("게시글 작성 오류:", error)
    return NextResponse.json(
      { error: "게시글 작성에 실패했습니다." },
      { status: 500 }
    )
  }
}

