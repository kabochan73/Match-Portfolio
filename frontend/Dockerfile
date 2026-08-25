# ローカル開発用(npm run dev)。docker-compose側でソースディレクトリをvolumeマウントし、
# ホットリロードが効くようにする想定
FROM node:22-alpine AS dev

WORKDIR /app

RUN npm install -g npm@11

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# --- ここから本番ビルド(Railwayデプロイ用) ---

# 依存関係インストール専用ステージ。ソースの変更だけではキャッシュを再利用できるよう分離する
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Next.jsのビルドステージ。NEXT_PUBLIC_API_URLはNext.jsがビルド時にクライアントバンドルへ
# 焼き込む(ブラウザから直接Laravel APIを叩くため)。Railwayのbuild argとして
# backendサービスの公開URLを渡す必要がある
FROM node:22-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Railwayへそのままデプロイする本番イメージ。next.config.tsのoutput: "standalone"により、
# 実行に必要な最小限のファイル(node_modulesの一部+サーバーコード)だけが.next/standaloneに出力される
FROM node:22-alpine AS final

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# RailwayはPORT環境変数を動的に渡してくる。standaloneサーバー(server.js)はPORTを
# そのまま見て起動するため、追加設定なしで反映される
CMD ["node", "server.js"]
