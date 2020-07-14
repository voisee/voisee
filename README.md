# voisee

### 커밋 컨벤션

#### 1) 기본 형식

```
[commit type]: [commit message] ([issue number?])
```

#### 2) commit type

| 구분     | 작업 유형              | 예                                            |
| -------- | ---------------------- | --------------------------------------------- |
| feat     | 새 기능 구현           | feat: add sliceRecord util (#11)              |
| fix      | 버그 수정              | fix: add handling error case in api (#13)     |
| env      | devops 설정            | env: add lint rule (#17)                      |
| docs     | 문서 및 주석 관련 작업 | docs: modify readme file (#19)                |
| refactor | 리팩토링               | refactor: refactor directory path (#23)       |
| test     | 테스트 관련 작업       | test: add form validation test function (#29) |
| chore    | 기타 작업              | chore: modify function name (#31)             |