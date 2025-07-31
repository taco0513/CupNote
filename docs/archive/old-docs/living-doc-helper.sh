#!/bin/bash
# Living Documentation Helper Scripts for CupNote

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 새 기능 시작할 때
start_feature() {
  local feature_name=$1
  local description=$2
  
  if [ -z "$feature_name" ]; then
    echo -e "${RED}Usage: start_feature <feature-name> <description>${NC}"
    return 1
  fi
  
  cat > .claude/current-focus.md << EOF
# Current Focus: $feature_name

## Goal
$description

## Files Involved
- [ ] 

## Key Decisions
- 

## Blockers
- 

## Progress
- [ ] Planning
- [ ] Implementation  
- [ ] Testing
- [ ] Documentation

## Notes
- Created: $(date)
EOF
  
  echo -e "${GREEN}✅ Started feature: $feature_name${NC}"
  echo -e "${GREEN}📝 Edit .claude/current-focus.md to add details${NC}"
}

# 2. 에러 기록
log_error() {
  local error_msg="$1"
  local file_path="$2"
  
  if [ -z "$error_msg" ]; then
    echo -e "${RED}Usage: log_error <error-message> <file-path>${NC}"
    return 1
  fi
  
  cat >> docs/errors/$(date +%Y-%m).md << EOF

## $(date '+%Y-%m-%d %H:%M'): $error_msg
- File: $file_path
- Context: $(head -5 .claude/current-focus.md | grep "Goal" | sed 's/## Goal//')
- Error: $error_msg
- Tried: 
- Solution: 
- Lesson: 
- Related: 

EOF
  
  echo -e "${YELLOW}📝 Error logged in docs/errors/$(date +%Y-%m).md${NC}"
  echo -e "${YELLOW}⚡ Add details while they're fresh!${NC}"
}

# 3. 해결책 기록
solved_error() {
  local solution="$1"
  local lesson="$2"
  
  if [ -z "$solution" ]; then
    echo -e "${RED}Usage: solved_error <solution> <lesson-learned>${NC}"
    return 1
  fi
  
  # 최근 에러 파일 찾기
  local error_file="docs/errors/$(date +%Y-%m).md"
  
  # 임시 파일 생성
  local temp_file=$(mktemp)
  
  # 마지막 Solution: 라인 찾아서 업데이트
  awk -v sol="$solution" -v les="$lesson" '
    /^- Solution: $/ && !found {
      print "- Solution: " sol
      found=1
      next
    }
    /^- Lesson: $/ && found && !lesson_found {
      print "- Lesson: " les
      lesson_found=1
      next
    }
    {print}
  ' "$error_file" > "$temp_file"
  
  mv "$temp_file" "$error_file"
  
  # 학습 내용 추가
  echo "LEARNED: $lesson" >> .claude/learned-patterns.md
  
  echo -e "${GREEN}✅ Solution recorded!${NC}"
  echo -e "${GREEN}💡 Lesson added to learned patterns${NC}"
}

# 4. 결정사항 기록
record_decision() {
  local title="$1"
  local decision="$2"
  
  if [ -z "$title" ]; then
    echo -e "${RED}Usage: record_decision <title> <decision>${NC}"
    return 1
  fi
  
  # 다음 번호 찾기
  local next_num=$(printf "%03d" $(($(ls docs/decisions/*.md 2>/dev/null | wc -l) + 1)))
  local filename="docs/decisions/${next_num}-$(echo $title | tr ' ' '-' | tr '[:upper:]' '[:lower:]').md"
  
  cat > "$filename" << EOF
# Decision: $title

## DATE
$(date +%Y-%m-%d)

## CONTEXT
$decision

## OPTIONS_CONSIDERED
1. **Option 1**
   - Pros: 
   - Cons: 

2. **Option 2**
   - Pros: 
   - Cons: 

## DECISION
[선택한 옵션]

## REASONING
[선택 이유]

## CONSEQUENCES
- ✅ [긍정적 결과]
- ❌ [부정적 결과나 트레이드오프]

## RELATED_FILES
- 

## REVIEW_DATE
$(date -d "+3 months" +%Y-%m-%d) (3개월 후 재검토)
EOF

  echo -e "${GREEN}✅ Decision recorded: $filename${NC}"
  echo -e "${GREEN}📝 Edit the file to add details${NC}"
}

# 5. Claude 세션 시작
claude_start() {
  echo -e "${GREEN}🤖 Loading CupNote context for Claude...${NC}"
  echo ""
  
  if [ -f ".claude/project-context.md" ]; then
    echo "📖 Project Context: @.claude/project-context.md"
  fi
  
  if [ -f ".claude/current-focus.md" ]; then
    echo "🎯 Current Focus: @.claude/current-focus.md"  
  fi
  
  if [ -f "docs/errors/$(date +%Y-%m).md" ]; then
    echo "🐛 Recent Errors: @docs/errors/$(date +%Y-%m).md"
  fi
  
  if [ -f ".claude/learned-patterns.md" ]; then
    echo "💡 Learned Patterns: @.claude/learned-patterns.md"
  fi
  
  echo ""
  echo -e "${GREEN}✨ Claude now has full project context!${NC}"
  echo -e "${YELLOW}💡 Tip: Include file paths with @ when asking questions${NC}"
}

# 6. 문서화 품질 체크
check_docs() {
  local score=0
  local total=0
  
  echo -e "${GREEN}📊 CupNote Documentation Quality Report${NC}"
  echo "======================================"
  
  # 프로젝트 컨텍스트
  total=$((total + 20))
  if [ -f ".claude/project-context.md" ]; then
    score=$((score + 20))
    echo -e "${GREEN}✅ Project context exists (+20)${NC}"
  else
    echo -e "${RED}❌ Missing project context (-20)${NC}"
  fi
  
  # 현재 포커스
  total=$((total + 15))
  if [ -f ".claude/current-focus.md" ]; then
    score=$((score + 15))
    echo -e "${GREEN}✅ Current focus documented (+15)${NC}"
  else
    echo -e "${YELLOW}⚠️  No current focus (-15)${NC}"
  fi
  
  # 에러 문서
  total=$((total + 15))
  if [ -f "docs/errors/$(date +%Y-%m).md" ]; then
    score=$((score + 15))
    echo -e "${GREEN}✅ Error log exists (+15)${NC}"
  else
    echo -e "${YELLOW}⚠️  No error documentation (-15)${NC}"
  fi
  
  # 결정사항
  total=$((total + 20))
  if [ -d "docs/decisions" ] && [ $(ls docs/decisions/*.md 2>/dev/null | wc -l) -gt 0 ]; then
    score=$((score + 20))
    local decision_count=$(ls docs/decisions/*.md | wc -l)
    echo -e "${GREEN}✅ $decision_count decision(s) recorded (+20)${NC}"
  else
    echo -e "${RED}❌ No decisions recorded (-20)${NC}"
  fi
  
  # 패턴 문서
  total=$((total + 15))
  if [ -d "docs/patterns" ] && [ $(ls docs/patterns/*.md 2>/dev/null | wc -l) -gt 0 ]; then
    score=$((score + 15))
    echo -e "${GREEN}✅ Pattern documentation exists (+15)${NC}"
  else
    echo -e "${YELLOW}⚠️  No patterns documented (-15)${NC}"
  fi
  
  # 학습 기록
  total=$((total + 15))
  if [ -f ".claude/learned-patterns.md" ]; then
    score=$((score + 15))
    echo -e "${GREEN}✅ Learning log exists (+15)${NC}"
  else
    echo -e "${YELLOW}⚠️  No learned patterns (-15)${NC}"
  fi
  
  echo "======================================"
  local percentage=$(( score * 100 / total ))
  echo -e "📊 Documentation Score: ${GREEN}$score/$total ($percentage%)${NC}"
  
  if [ $percentage -lt 70 ]; then
    echo -e "${RED}🚨 Documentation needs improvement!${NC}"
    echo -e "${YELLOW}💡 Start with: claude_start${NC}"
  else
    echo -e "${GREEN}✅ Good documentation quality!${NC}"
  fi
}

# 7. 빠른 컨텍스트 업데이트
quick_context() {
  local update="$1"
  
  if [ -z "$update" ]; then
    echo -e "${RED}Usage: quick_context <update-message>${NC}"
    return 1
  fi
  
  echo "" >> .claude/current-focus.md
  echo "## Update $(date '+%Y-%m-%d %H:%M')" >> .claude/current-focus.md
  echo "$update" >> .claude/current-focus.md
  
  echo -e "${GREEN}✅ Context updated${NC}"
}

# 사용법 출력
if [ "$1" == "help" ] || [ "$1" == "--help" ] || [ -z "$1" ]; then
  echo "🚀 CupNote Living Documentation Helper"
  echo "====================================="
  echo ""
  echo "Available commands:"
  echo "  start_feature <name> <description>  - Start new feature documentation"
  echo "  log_error <error> <file>           - Log an error occurrence"
  echo "  solved_error <solution> <lesson>   - Record error solution"
  echo "  record_decision <title> <context>  - Document a decision"
  echo "  claude_start                       - Load context for Claude"
  echo "  check_docs                         - Check documentation quality"
  echo "  quick_context <update>             - Quick context update"
  echo ""
  echo "Usage: source docs/living-doc-helper.sh"
  echo "Then call any function directly"
fi

echo -e "${GREEN}✅ Living Documentation helpers loaded!${NC}"
echo -e "${YELLOW}💡 Type 'help' to see available commands${NC}"