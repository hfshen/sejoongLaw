// /admin/login은 인증이 필요 없으므로 빈 layout 사용
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

