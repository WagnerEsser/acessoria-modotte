SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -ExecutionPolicy Bypass -Command

.DEFAULT_GOAL := help

.PHONY: help env install frontend backend ensure-superadmin up both stop-backend verify build

help:
	@Write-Host "Comandos disponiveis:"
	@Write-Host "  make frontend           Sobe somente o frontend em modo desenvolvimento"
	@Write-Host "  make backend            Sobe o Supabase local e garante o superadmin do .env"
	@Write-Host "  make ensure-superadmin  Reaplica o bootstrap do superadmin local"
	@Write-Host "  make up                 Prepara dependencias, sobe backend e frontend"
	@Write-Host "  make both               Alias para make up"
	@Write-Host "  make stop-backend       Para o backend local com Supabase"
	@Write-Host "  make verify             Roda typecheck, lint e testes unitarios"
	@Write-Host "  make build              Gera o build de producao"

env:
	@if (!(Test-Path -LiteralPath ".env")) { Copy-Item ".env.example" ".env"; Write-Host "Arquivo .env criado a partir de .env.example. Revise os segredos antes de usar ambientes reais."; } else { Write-Host "Arquivo .env ja existe."; }

install:
	npm install

frontend: env
	npm run dev

backend: env
	.\scripts\supabase\start.ps1
	.\scripts\supabase\apply-superadmin-migration.ps1
	npm run admin:ensure-superadmin

ensure-superadmin: env
	.\scripts\supabase\apply-superadmin-migration.ps1
	npm run admin:ensure-superadmin

up: install backend
	npm run dev

both: up

stop-backend: env
	.\scripts\supabase\stop.ps1

verify:
	npm run verify

build:
	npm run build
