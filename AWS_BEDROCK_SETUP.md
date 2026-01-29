# AWS Bedrock 설정 가이드

이 프로젝트는 AWS Bedrock을 통해 Claude AI 모델을 사용합니다.

## 사전 요구사항

1. **AWS 계정** - AWS 계정이 필요합니다
2. **Bedrock 액세스** - AWS Bedrock 서비스에 액세스 권한이 필요합니다
3. **Claude 모델 액세스** - AWS Bedrock에서 Claude 모델 사용 승인이 필요합니다

## 설정 방법

### 1. AWS CLI 설정 (권장)

```bash
# AWS CLI 설치
brew install awscli  # macOS
# 또는
apt install awscli  # Ubuntu/Debian

# 자격 증명 설정
aws configure
```

`~/.aws/credentials` 파일에 다음 내용 추가:
```
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
region = us-east-1
```

### 2. 환경 변수 설정

`backend/.env` 파일에 다음 환경 변수 추가:

```bash
# AWS Region (Bedrock 사용 가능한 리전)
AWS_REGION=us-east-1

# AWS Credentials (선택사항 - IAM role 또는 ~/.aws/credentials 사용 가능)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
# AWS_SESSION_TOKEN=your-session-token  # 임시 자격 증명 사용 시만 필요

# Bedrock Model ID (선택사항 - 기본값: Claude 3.5 Sonnet)
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
```

### 3. 사용 가능한 모델

| 모델 ID | 설명 | 사용 사례 |
|---------|------|----------|
| `anthropic.claude-3-5-sonnet-20240620-v1:0` | Claude 3.5 Sonnet | 기본 대화, 제안 생성 (기본값) |
| `anthropic.claude-3-haiku-20240307-v1:0` | Claude 3 Haiku | 빠른 응답, 간단한 작업 |
| `anthropic.claude-3-opus-20240229-v1:0` | Claude 3 Opus | 복잡한 분석, 고급 기능 |

### 4. Bedrock 액세스 요청

1. [AWS Bedrock 콘솔](https://console.aws.amazon.com/bedrock) 접속
2. **Model access** 메뉴 클릭
3. **Request model access** 버튼 클릭
4. 사용할 Claude 모델 선택 (Claude 3.5 Sonnet 권장)
5. **Request access** 클릭
6. 승인될 때까지 대기 (보통 몇 분 이내)

## 권한 설정 (IAM User 사용 시)

IAM User에 다음 권한_policy_ 추가:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:ListFoundationModels"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-opus-20240229-v1:0"
      ]
    }
  ]
}
```

## 로컬 개발 환경 설정

### macOS/Linux

```bash
# backend/.env.local 파일 생성
cat > backend/.env.local << EOF
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
EOF
```

### Windows (PowerShell)

```powershell
# backend\.env.local 파일 생성
@"
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
"@ | Out-File -Encoding utf8 backend\.env.local
```

## 테스트

서버 시작 후 다음 API로 Bedrock 연동 테스트:

```bash
# AI 대화 테스트
curl -X POST http://localhost:3000/api/v1/ai/conversation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nodeId": "test-node-1",
    "message": "린스타트업 방법론에 대해 설명해주세요"
  }'

# AI 제안 테스트
curl -X POST http://localhost:3000/api/v1/ai/suggestion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nodeId": "test-node-1"
  }'
```

## 문제 해결

### 오류: "AWS Bedrock client is not initialized"

**원인:** AWS 자격 증명을 찾을 수 없음
**해결:**
- `~/.aws/credentials` 파일 확인
- 환경 변수 `AWS_ACCESS_KEY_ID`와 `AWS_SECRET_ACCESS_KEY` 확인
- IAM role 사용 시 EC2/ECS role 확인

### 오류: "Access denied"

**원인:** Bedrock 모델 사용 권한 없음
**해결:**
1. [AWS Bedrock 콘솔](https://console.aws.amazon.com/bedrock) 접속
2. **Model access**에서 Claude 모델 승인 요청

### 오류: "Region not supported"

**원인:** 해당 리전에서 Bedrock 미지원
**해결:** `us-east-1`, `us-west-2`, `ap-northeast-1` 등 지원 리전 사용

### 오류: "Rate exceeded"

**원인:** API 호출 속도 제한 초과
**해결:** 몇 초 후 다시 시도 (Rate limit은 보통 1분 내 해제)

## 비용 최적화

1. **Claude 3 Haiku 사용** - 빠르고 저렴한 작업에 적합
2. **max_tokens 조절** - 필요한 만큼만 생성
3. **캐싱 활용** - 동일 응답 재사용

## 추가 리소스

- [AWS Bedrock 공식 문서](https://docs.aws.amazon.com/bedrock/)
- [Claude 모델 가이드](https://docs.anthropic.com/claude/docs)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/)
