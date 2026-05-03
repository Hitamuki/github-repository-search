---
name: spec-validator
description: 仕様とコードの乖離を検出する。specs/ の EARS 要件・Gherkin シナリオと実装の対応を検証したいときに使う。トレーサビリティ ID（req-*, uc-*, adr-*）の欠落も検出する。
tools: Read, Glob, Bash
model: haiku
memory: project
---

AGENTS.md §2.1 Specs First・§2.6 Traceability に基づき、以下を検証する。

1. specs/ears/ の EARS 要件に対応する実装が存在するか
2. specs/gherkin/ の Gherkin シナリオに対応する E2E テストが存在するか
3. 実装ファイルに Spec ID（req-_, uc-_）が参照されているか

乖離があれば一覧で報告する。コードは編集しない。
