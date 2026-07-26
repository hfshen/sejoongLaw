import type { Metadata } from "next"
import { redirect } from "next/navigation"
import StayCareAuthRecoveryNotice from "@/components/staycare/StayCareAuthRecoveryNotice"
import StayCareDemoLogin from "@/components/staycare/StayCareDemoLogin"
import StayCareLogin from "@/components/staycare/StayCareLogin"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"
import { stayCareLoginRecoveryPath } from "@/lib/auth/redirects"
import { resolveStayCareDestination } from "@/lib/staycare/auth"
import { isStayCareProductionDemoAllowed } from "@/lib/staycare/demo-accounts"

export const metadata: Metadata = {
  title: "StayCare 로그인",
  robots: { index: false, follow: false },
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function StayCareLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const query = await searchParams
  const error = first(query.error)
  const reason = first(query.reason)
  const next = first(query.next)

  if (reason === "otp_expired" && error !== "otp_expired") {
    redirect(
      stayCareLoginRecoveryPath({
        locale,
        reason: "otp_expired",
        next,
      })
    )
  }

  const destination = await resolveStayCareDestination(locale)
  if (destination) redirect(destination)

  const showDemoLogin = isStayCareProductionDemoAllowed()

  return (
    <>
      <StayCarePurposeNote
        compact
        title="StayCare 인증 페이지"
        purpose="이메일 또는 +94·+82 휴대전화 OTP로 본인 소유 연락수단을 확인합니다. 로그인 후 공식 초대명부와 계정을 연결해야 근로자 앱이 활성화됩니다."
        boundary="로그인 성공만으로 근로자 자격이나 비자 상태가 인정되지 않습니다. 지정된 초대코드와 공식 명부정보가 추가로 일치해야 합니다."
        items={[
          { label: "1. 연락수단 인증", description: "이메일·SMS 6자리 OTP" },
          { label: "2. 명부 Claim", description: "초대코드·영문명·생년월일 대조" },
          { label: "3. 계정 승계", description: "입국 후 한국 전화번호 추가" },
          { label: "4. 복구", description: "이메일과 두 번째 연락수단 유지" },
        ]}
        links={[{ href: `/${locale}/staycare/notes`, label: "페이지별 용도 안내" }]}
      />
      <StayCareAuthRecoveryNotice locale={locale} reason={reason || error} />
      <StayCareLogin locale={locale} />
      {showDemoLogin ? <StayCareDemoLogin locale={locale} /> : null}
    </>
  )
}
