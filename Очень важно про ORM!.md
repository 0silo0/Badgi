# ORM Prisma
Так как домены где располагаются файлы для подкачки заблокированы рнк (возмонжо, но все к этому велось), произошел переход с v6.6.0 на v7.2
Вслед за этим небольшой гайд на всякий случай.

Если не удается сгенерировать призму то стоит выполнить следующее:
1. Выполнить $env:PRISMA_ENGINES_MIRROR="https://prisma-builds.s3-eu-west-1.amazonaws.com"
2. Создать файл prisma.config.ts.backup в корне backend, если вдруг его там не оказалось, и вставить туда следующее:
    `
        import { defineConfig } from '@prisma/client'

        export default defineConfig({
        datasource: {
            postgresql: {
            url: process.env.DATABASE_URL,
            },
        },
        })
    `
    А в файле schema.prisma должно быть такое начало:
    `
        generator client {
        provider = "prisma-client-js"
        // output   = "../generated/prisma"
        output = "../node_modules/.prisma/client"
        binaryTargets = ["native", "debian-openssl-3.0.x"]
        }

        datasource db {
        provider = "postgresql"
        }
    `
3. Сгенерировать призму


# Прочее
Если ругаетсяся на выполнение скриптов в виндовс то выполнить в powershell от администратора - Set-ExecutionPolicy RemoteSigned