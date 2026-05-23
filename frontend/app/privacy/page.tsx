import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0F] px-6 py-16 text-[#E5E7EB]">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-[#A0A0B0] hover:text-white">
          返回首页
        </Link>
        <h1 className="mt-8 text-4xl font-bold text-white">隐私政策</h1>
        <p className="mt-4 text-sm text-[#A0A0B0]">最后更新：2026-05-23</p>

        <div className="mt-10 space-y-6 leading-8 text-[#C7CAD1]">
          <p>
            本页面是开源项目随附的隐私政策模板，正式上线前应根据实际业务、部署地区和第三方服务配置进行法律审阅。
          </p>
          <p>
            AIMAGE 可能处理账户信息、项目配置、用户上传素材、生成任务记录、支付或积分记录以及基础日志信息。我们仅在提供服务、保障安全、排查故障和履行法律义务所需范围内使用这些信息。
          </p>
          <p>
            项目可能接入 Supabase、Vercel、阿里云 DashScope、DeepSeek、Trigger.dev 或其他第三方服务。使用这些服务时，相关数据可能按照其隐私政策和服务条款进行处理。
          </p>
          <p>
            用户应确保上传的图片、视频、音频、人物肖像、品牌元素和文本内容具有合法来源和必要授权。请勿上传敏感个人信息、违法内容或侵犯他人权利的素材。
          </p>
          <p>
            如需删除账户、导出数据或反馈隐私问题，请通过项目 README 中的联系方式与维护者联系。
          </p>
        </div>
      </div>
    </main>
  );
}
