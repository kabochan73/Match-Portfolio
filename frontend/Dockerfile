# ローカル開発用(npm run dev)。docker-compose側でソースディレクトリをvolumeマウントし、
# ホットリロードが効くようにする想定。本番用ビルド(Railwayデプロイ)は別途検討する
FROM node:22-alpine

WORKDIR /app

RUN npm install -g npm@11

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
