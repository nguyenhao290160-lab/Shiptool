# Template thêm tính năng mới

## Tên tính năng

Tên:

Module:

Mục tiêu:

## Phạm vi

Tính năng này sẽ làm:

- 
- 
- 

Tính năng này không làm:

- 
- 
- 

## File dự kiến sửa/thêm

- `app/...`
- `components/...`
- `lib/...`
- `docs/...`

## Dữ liệu localStorage

Có dùng localStorage không?

Key đề xuất:

```
shiproute_...
```

Cần backup/import không?

## UI/UX

* Desktop:
* Mobile:
* Empty state:
* Error state:
* Loading state:

## AI Help Registry

Cần thêm vào:

```txt
lib/appFeatureRegistry.ts
```

Object mẫu:

```ts
{
  id: "feature-id",
  name: "Tên tính năng",
  module: "Tên module",
  status: "new",
  version: "1.0.0",
  updatedAt: "YYYY-MM-DD",
  shortDescription: "Mô tả ngắn tính năng.",
  userGuide: [
    "Bước 1...",
    "Bước 2...",
    "Bước 3..."
  ],
  keywords: [
    "keyword 1",
    "keyword 2"
  ],
  relatedFeatures: [],
  commonQuestions: [
    {
      question: "Câu hỏi thường gặp?",
      answer: "Câu trả lời."
    }
  ],
  troubleshooting: [
    {
      problem: "Lỗi thường gặp",
      solution: "Cách xử lý."
    }
  ]
}
```

## Backup/import

* Có thêm vào backup JSON không?
* Import backup cũ có còn chạy không?
* Import thiếu field mới có crash không?

## Reports/Dashboard

* Có cần thống kê không?
* Có cần export không?

## Test checklist

Chạy:

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

Test thủ công:

* Tính năng hoạt động.
* Reload vẫn ổn.
* localStorage ổn.
* Backup/import ổn nếu có.
* Offline không crash.
* Mobile không tràn ngang.
* AI Help trả lời được.
