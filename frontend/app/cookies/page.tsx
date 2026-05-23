import Link from 'next/link';

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] px-6 py-16 text-[#E5E7EB]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#A0A0B0] hover:text-white">
          返回首页
        </Link>
        <h1 className="mt-8 text-4xl font-bold text-white">Cookie 政策</h1>
        <p className="mt-4 text-sm text-[#A0A0B0]">最后更新：2026-05-23</p>

        <div className="mt-10 space-y-6 leading-8 text-[#C7CAD1]">
          <p>
            本页面是开源项目随附的 Cookie 政策模板，正式上线前应根据实际使用的分析、广告、认证和安全工具进行更新。
          </p>
          <p>
            AIMAGE 可能使用必要 Cookie 或本地存储来维持登录状态、保存偏好设置、保障安全和改善服务体验。
          </p>
          <p>
            如果部署方接入分析、广告、支付、客服或第三方登录服务，相关服务可能设置自己的 Cookie 或类似技术。部署方应在正式服务中披露这些工具的用途、提供方和管理方式。
          </p>
          <p>
            用户可以通过浏览器设置删除或阻止 Cookie，但某些账户、认证和安全功能可能因此无法正常工作。
          </p>
        </div>
      </div>
    </main>
  );
}
