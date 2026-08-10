-- Pest(バックエンドのテスト)専用のDB。開発用DB(POSTGRES_DBで作られるmatch_portfolio)を
-- テストで壊さないよう分離する。/docker-entrypoint-initdb.d/以下に置くことで、
-- コンテナ初回起動時(dbボリュームが空の状態)にPostgresが自動実行する
CREATE DATABASE match_portfolio_test;
