import CaseStudiesSection from "@/components/sections/CaseStudiesSection"

export default function CasesPage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="section-padding-sm bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container-max text-center">
            <h1 className="section-title">성공 사례</h1>
            <p className="body-text max-w-2xl mx-auto">
              법무법인 세중의 전문성과 노하우로 만들어낸 다양한 성공 사례를 확인해보세요.
            </p>
          </div>
        </div>
        <CaseStudiesSection />
      </main>
    </>
  )
}

