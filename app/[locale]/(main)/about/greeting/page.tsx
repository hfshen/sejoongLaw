export default function GreetingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">인사말</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-text-secondary leading-relaxed">
          법무법인 세중을 방문해주셔서 감사합니다.
        </p>
        <p className="text-lg text-text-secondary leading-relaxed mt-6">
          법무법인 세중은 고객의 권익 보호와 법률 서비스의 질 향상을 위해 최선을 다하고 있습니다.
        </p>
        <p className="text-lg text-text-secondary leading-relaxed mt-6">
          우리는 다양한 법률 분야에서 전문적인 서비스를 제공하며, 고객 여러분의 신뢰를 바탕으로
          최고의 법률 서비스를 제공하겠습니다.
        </p>
      </div>
    </div>
  )
}

