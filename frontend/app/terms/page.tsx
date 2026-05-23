import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] px-6 py-16 text-[#E5E7EB]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#A0A0B0] hover:text-white">
          返回首页
        </Link>
        <h1 className="mt-8 text-4xl font-bold text-white">服务条款</h1>
        <p className="mt-4 text-sm text-[#A0A0B0]">最后更新：2026-05-23</p>

        <div className="mt-10 space-y-6 leading-8 text-[#C7CAD1]">
          <p>
            本页面是开源项目随附的服务条款模板，正式上线前应根据实际产品、计费方式、服务地区和第三方模型条款进行法律审阅。
          </p>
          <p>
            AIMAGE 提供 AI 视频生成相关的软件功能。用户使用本项目或基于本项目部署的服务时，应遵守适用法律、第三方平台规则和所接入模型服务的使用政策。
          </p>
          <p>
            用户保留其上传素材和通过平台生成内容中的合法权益。AIMAGE 不会对用户生成内容主张所有权，但生成内容的可用性取决于输入素材授权、第三方模型服务条款和适用法律。
          </p>
          <p>
            禁止上传或生成违法、侵权、误导性、仿冒他人身份、未经授权使用肖像或商标、侵犯隐私或违反平台规则的内容。
          </p>
          <p>
            TikTok、Instagram、YouTube、Shopify、Amazon、AliExpress、Sora、Veo、Kling、Runway、Luma、DeepSeek、DashScope 等名称和商标归各自权利人所有。本项目与上述品牌或平台不存在隶属、赞助、背书或官方合作关系，除非另有明确说明。
          </p>
        </div>
      </div>
    </main>
  );
}
