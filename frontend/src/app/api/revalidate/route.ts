import { revalidateTag } from "next/cache";

// バックエンド(Laravel)側の求人/企業プロフィール更新エンドポイントから呼ばれる、
// オンデマンド再検証用のRoute Handler。/jobs/[id]・/companies/[id]のfetchにつけたタグ
// (job-posting-{id}/company-{id})をrevalidateTagし、next: {revalidate: 7200}の
// 2時間待ちを待たずに最新化する。REVALIDATE_SECRETは.env.localのみに置くサーバー専用の値
// (NEXT_PUBLIC_プレフィックスを付けずブラウザには一切露出しない)
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const secret = body?.secret;
  const tag = body?.tag;

  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ message: "Invalid secret" }, { status: 401 });
  }

  if (!tag || typeof tag !== "string") {
    return Response.json({ message: "tag is required" }, { status: 400 });
  }

  // Next.js 16のrevalidateTagは第2引数必須。Laravel(外部システム)からのwebhook的な
  // 呼び出しでは公式ドキュメントが{ expire: 0 }(即時失効)を推奨しているため、
  // "max"(stale-while-revalidate、次回アクセス時まで反映が遅れる)ではなくこちらを使う
  revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: true, tag });
}
