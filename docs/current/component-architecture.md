# CupNote 반응형 컴포넌트 아키텍처 설계서 v2.0

## 🏗️ 아키텍처 개요

### 설계 원칙
1. **Progressive Enhancement**: 모바일 → 태블릿 → 데스크탑 순차적 기능 확장
2. **Component Composition**: 작은 컴포넌트들의 조합으로 복잡한 UI 구성
3. **Single Responsibility**: 각 컴포넌트는 하나의 명확한 책임만 가짐
4. **Responsive by Design**: 반응형이 기본값, 고정 크기는 예외적 사용
5. **Accessibility First**: 모든 컴포넌트에 접근성 기본 적용

---

## 🧩 컴포넌트 계층 구조

### 전체 아키텍처 트리
```
CupNote App
├── 🏗️ Layout Layer (레이아웃 계층)
│   ├── ResponsiveLayout (최상위 레이아웃 컨테이너)
│   ├── MobileLayout (모바일 전용)
│   ├── TabletLayout (태블릿 1.5-column)
│   └── DesktopLayout (데스크탑 3-column)
├── 🧭 Navigation Layer (네비게이션 계층)
│   ├── HeaderNavigation (상단 헤더 - 공통)
│   ├── MobileNavigation (5-tab 하단 네비)
│   ├── TabletSidebar (세로 네비게이션)
│   ├── MenuTree (데스크탑 계층 메뉴)
│   └── BreadcrumbNavigation (경로 표시)
├── 📊 Data Layer (데이터 표시 계층)
│   ├── RecordsList (기록 리스트)
│   ├── RecordDetail (상세 정보)
│   ├── StatsCards (통계 카드)
│   ├── AdvancedCharts (고급 차트)
│   └── DataTable (전문가 테이블)
├── 🎛️ Interaction Layer (인터랙션 계층)
│   ├── SwipeableItem (스와이프 제스처)
│   ├── BatchSelector (다중 선택)
│   ├── QuickActions (빠른 액션)
│   ├── ContextMenu (우클릭 메뉴)
│   └── KeyboardShortcuts (단축키)
├── 🎨 UI Foundation Layer (기본 UI 계층)
│   ├── FluidText (반응형 텍스트)
│   ├── FluidContainer (반응형 컨테이너)
│   ├── UnifiedButton (통합 버튼)
│   ├── Card (카드 컴포넌트)
│   └── Modal (모달 시스템)
└── 🔧 Utility Layer (유틸리티 계층)
    ├── ResponsiveProvider (반응형 컨텍스트)
    ├── ThemeProvider (테마 시스템)
    └── ErrorBoundary (에러 경계)
```

---

## 🏗️ Layout Layer 상세 설계

### ResponsiveLayout (최상위 컨테이너)
```typescript
/**
 * 전체 앱의 반응형 레이아웃을 관리하는 최상위 컴포넌트
 * 브레이크포인트에 따라 적절한 레이아웃 컴포넌트를 선택
 */
interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  className 
}) => {
  const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive()
  
  // 브레이크포인트별 레이아웃 선택
  const LayoutComponent = useMemo(() => {
    switch (breakpoint) {
      case 'mobile': return MobileLayout
      case 'tablet': return TabletLayout
      case 'desktop': return DesktopLayout
      default: return MobileLayout
    }
  }, [breakpoint])
  
  return (
    <div className={`responsive-layout ${className}`}>
      <LayoutComponent>{children}</LayoutComponent>
    </div>
  )
}

export default ResponsiveLayout
```

### MobileLayout (모바일 레이아웃)
```typescript
/**
 * 모바일 전용 레이아웃 - 기존 시스템 유지
 * 상단 헤더 + 메인 콘텐츠 + 하단 5-tab 네비게이션
 */
interface MobileLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showNavigation?: boolean
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showHeader = true,
  showNavigation = true
}) => {
  return (
    <div className="mobile-layout min-h-screen flex flex-col">
      {/* 상단 헤더 */}
      {showHeader && (
        <HeaderNavigation className="flex-shrink-0" />
      )}
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto pb-safe-bottom">
        {children}
      </main>
      
      {/* 하단 네비게이션 */}
      {showNavigation && (
        <MobileNavigation className="flex-shrink-0" />
      )}
    </div>
  )
}

export default MobileLayout
```

### TabletLayout (태블릿 1.5-Column)
```typescript
/**
 * 태블릿 1.5-Column 레이아웃
 * 왼쪽 사이드바(30%) + 메인 콘텐츠(70%)
 */
interface TabletLayoutProps {
  children: React.ReactNode
  sidebarWidth?: number
  collapsible?: boolean
}

const TabletLayout: React.FC<TabletLayoutProps> = ({
  children,
  sidebarWidth = 320,
  collapsible = true
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const sidebarStyle = {
    width: sidebarCollapsed ? 80 : sidebarWidth,
    transition: 'width 0.3s ease'
  }
  
  return (
    <div className="tablet-layout h-screen flex">
      {/* 왼쪽 사이드바 */}
      <aside 
        className="tablet-sidebar bg-coffee-50 border-r border-coffee-200"
        style={sidebarStyle}
      >
        <TabletSidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </aside>
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default TabletLayout
```

### DesktopLayout (데스크탑 3-Column)
```typescript
/**
 * 데스크탑 3-Column 레이아웃
 * 왼쪽 사이드바(20%) + 메인 콘텐츠(60%) + 오른쪽 패널(20%)
 */
interface DesktopLayoutProps {
  children: React.ReactNode
  leftSidebarWidth?: number
  rightPanelWidth?: number
  resizable?: boolean
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
  leftSidebarWidth = 288,
  rightPanelWidth = 288,
  resizable = true
}) => {
  const [layout, setLayout] = useState({
    leftWidth: leftSidebarWidth,
    rightWidth: rightPanelWidth
  })
  
  return (
    <div className="desktop-layout h-screen flex">
      {/* 왼쪽 사이드바 */}
      <aside 
        className="desktop-sidebar bg-coffee-50 border-r border-coffee-200"
        style={{ width: layout.leftWidth }}
      >
        <MenuTree />
        <QuickFilters />
        <MiniCalendar />
      </aside>
      
      {/* 리사이저 */}
      {resizable && (
        <div className="resize-handle w-1 bg-coffee-200 hover:bg-coffee-300 cursor-col-resize" />
      )}
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 min-w-0">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </main>
      
      {/* 오른쪽 패널 */}
      <aside 
        className="desktop-right-panel bg-coffee-25 border-l border-coffee-200"
        style={{ width: layout.rightWidth }}
      >
        <AIRecommendationPanel />
        <QuickActions />
        <NotificationCenter />
      </aside>
    </div>
  )
}

export default DesktopLayout
```

---

## 🧭 Navigation Layer 상세 설계

### HeaderNavigation (공통 상단 헤더)
```typescript
/**
 * 모든 디바이스에서 공통으로 사용되는 상단 헤더
 * 로고, 검색, 프로필 등 핵심 요소 포함
 */
interface HeaderNavigationProps {
  showSearch?: boolean
  showProfile?: boolean
  className?: string
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  showSearch = true,
  showProfile = true,
  className
}) => {
  const { user } = useAuth()
  const { isMobile } = useResponsive()
  
  return (
    <header className={`header-nav bg-white border-b border-coffee-200 ${className}`}>
      <div className="flex items-center justify-between h-16 px-4">
        {/* 왼쪽: 로고 */}
        <div className="flex items-center space-x-3">
          <Coffee className="h-6 w-6 text-coffee-600" />
          <FluidText as="h1" size="lg" weight="bold" className="text-coffee-800">
            CupNote
          </FluidText>
        </div>
        
        {/* 중앙: 검색 (데스크탑에서만) */}
        {showSearch && !isMobile && (
          <div className="flex-1 max-w-md mx-8">
            <SearchInput placeholder="커피 기록 검색..." />
          </div>
        )}
        
        {/* 오른쪽: 액션 버튼들 */}
        <div className="flex items-center space-x-3">
          {/* 모바일 검색 버튼 */}
          {showSearch && isMobile && (
            <UnifiedButton variant="ghost" size="sm">
              <Search className="h-5 w-5" />
            </UnifiedButton>
          )}
          
          {/* 알림 버튼 */}
          <NotificationButton />
          
          {/* 프로필 드롭다운 */}
          {showProfile && user && (
            <ProfileDropdown user={user} />
          )}
        </div>
      </div>
    </header>
  )
}

export default HeaderNavigation
```

### TabletSidebar (태블릿 세로 네비게이션)
```typescript
/**
 * 태블릿용 세로형 사이드바 네비게이션
 * 접을 수 있는 기능과 미니 위젯 포함
 */
interface TabletSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

const TabletSidebar: React.FC<TabletSidebarProps> = ({
  collapsed = false,
  onToggle
}) => {
  const pathname = usePathname()
  
  const navItems = [
    { href: '/', icon: Home, label: '홈', active: pathname === '/' },
    { href: '/records', icon: Coffee, label: '내 기록', active: pathname.startsWith('/records') },
    { href: '/add', icon: Plus, label: '작성', active: pathname.startsWith('/add'), special: true },
    { href: '/achievements', icon: Trophy, label: '성취', active: pathname.startsWith('/achievements') },
    { href: '/settings', icon: Settings, label: '설정', active: pathname.startsWith('/settings') }
  ]
  
  return (
    <div className="tablet-sidebar-content h-full flex flex-col">
      {/* 네비게이션 토글 */}
      <div className="p-4 border-b border-coffee-200">
        <UnifiedButton
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center"
        >
          <Menu className="h-5 w-5" />
        </UnifiedButton>
      </div>
      
      {/* 세로 네비게이션 */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map(({ href, icon: Icon, label, active, special }) => (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                ${special 
                  ? 'bg-gradient-to-r from-coffee-500 to-coffee-600 text-white shadow-lg' 
                  : active
                    ? 'bg-coffee-100 text-coffee-800'
                    : 'text-coffee-600 hover:bg-coffee-50'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{label}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>
      
      {/* 미니 위젯들 */}
      {!collapsed && (
        <div className="p-4 space-y-4 border-t border-coffee-200">
          <WeeklyStatsWidget />
          <QuickActionsWidget />
        </div>
      )}
    </div>
  )
}

export default TabletSidebar
```

### MenuTree (데스크탑 계층 메뉴)
```typescript
/**
 * 데스크탑용 계층적 메뉴 트리
 * 확장/축소 가능한 메뉴 구조
 */
interface MenuTreeProps {
  className?: string
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  children?: MenuItem[]
  active?: boolean
  expanded?: boolean
}

const MenuTree: React.FC<MenuTreeProps> = ({ className }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['dashboard', 'records']))
  
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      icon: BarChart3,
      expanded: expandedItems.has('dashboard'),
      children: [
        { id: 'overview', label: '전체 현황', icon: Home, href: '/dashboard' },
        { id: 'trends', label: '트렌드 분석', icon: TrendingUp, href: '/dashboard/trends' },
        { id: 'insights', label: 'AI 인사이트', icon: Brain, href: '/dashboard/insights' }
      ]
    },
    {
      id: 'records',
      label: '커피 기록',
      icon: Coffee,
      expanded: expandedItems.has('records'),
      children: [
        { id: 'all-records', label: '전체 기록', icon: List, href: '/records' },
        { id: 'favorites', label: '즐겨찾기', icon: Star, href: '/records/favorites' },
        { id: 'recent', label: '최근 기록', icon: Clock, href: '/records/recent' }
      ]
    },
    {
      id: 'achievements',
      label: '성취 & 통계',
      icon: Trophy,
      children: [
        { id: 'badges', label: '배지 관리', icon: Award, href: '/achievements' },
        { id: 'progress', label: '진행률', icon: BarChart, href: '/achievements/progress' },
        { id: 'rankings', label: '랭킹', icon: Crown, href: '/achievements/rankings' }
      ]
    }
  ]
  
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }
  
  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    
    return (
      <div key={item.id}>
        {/* 메뉴 아이템 */}
        <div
          className={`
            flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer
            transition-all hover:bg-coffee-100
            ${level > 0 ? 'ml-6 text-sm text-coffee-600' : 'font-medium text-coffee-800'}
          `}
          onClick={() => hasChildren ? toggleExpanded(item.id) : null}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{item.label}</span>
          {hasChildren && (
            <ChevronRight 
              className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
            />
          )}
        </div>
        
        {/* 자식 메뉴들 */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className={`menu-tree ${className}`}>
      <div className="p-4">
        <FluidText as="h2" size="base" weight="semibold" className="mb-4 text-coffee-800">
          메뉴
        </FluidText>
        <div className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </div>
    </div>
  )
}

export default MenuTree
```

---

## 📊 Data Layer 상세 설계

### RecordsList (반응형 기록 리스트)
```typescript
/**
 * 반응형 커피 기록 리스트 컴포넌트
 * 디바이스별 최적화된 표시 방식
 */
interface RecordsListProps {
  records: CoffeeRecord[]
  loading?: boolean
  onRecordSelect?: (record: CoffeeRecord) => void
  showBatchSelect?: boolean
  layout?: 'list' | 'grid' | 'table'
}

const RecordsList: React.FC<RecordsListProps> = ({
  records,
  loading,
  onRecordSelect,
  showBatchSelect = false,
  layout
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive()
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set())
  
  // 디바이스별 기본 레이아웃 결정
  const defaultLayout = useMemo(() => {
    if (layout) return layout
    return isMobile ? 'list' : isTablet ? 'grid' : 'table'
  }, [layout, isMobile, isTablet])
  
  // 모바일: 리스트 뷰 (스와이프 지원)
  const renderMobileList = () => (
    <div className="space-y-3">
      {records.map(record => (
        <SwipeableRecordItem
          key={record.id}
          record={record}
          onSelect={() => onRecordSelect?.(record)}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
          onDuplicate={() => handleDuplicate(record)}
        />
      ))}
    </div>
  )
  
  // 태블릿: 그리드 뷰 (배치 선택 지원)
  const renderTabletGrid = () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {records.map(record => (
        <RecordCard
          key={record.id}
          record={record}
          showBatchSelect={showBatchSelect}
          selected={selectedRecords.has(record.id)}
          onSelect={() => onRecordSelect?.(record)}
          onBatchToggle={() => toggleBatchSelect(record.id)}
        />
      ))}
    </div>
  )
  
  // 데스크탑: 테이블 뷰 (고급 기능)
  const renderDesktopTable = () => (
    <DataTable
      data={records}
      columns={tableColumns}
      sortable
      filterable
      batchSelectable={showBatchSelect}
      selectedRows={selectedRecords}
      onRowSelect={onRecordSelect}
      onBatchSelect={setSelectedRecords}
      onSort={handleSort}
      onFilter={handleFilter}
    />
  )
  
  if (loading) {
    return <LoadingSkeleton layout={defaultLayout} />
  }
  
  return (
    <div className="records-list">
      {/* 배치 작업 툴바 */}
      {showBatchSelect && selectedRecords.size > 0 && (
        <BatchActionToolbar
          selectedCount={selectedRecords.size}
          onEdit={() => handleBatchEdit(selectedRecords)}
          onDelete={() => handleBatchDelete(selectedRecords)}
          onExport={() => handleBatchExport(selectedRecords)}
          onClear={() => setSelectedRecords(new Set())}
        />
      )}
      
      {/* 레이아웃별 렌더링 */}
      {defaultLayout === 'list' && renderMobileList()}
      {defaultLayout === 'grid' && renderTabletGrid()}
      {defaultLayout === 'table' && renderDesktopTable()}
    </div>
  )
}

export default RecordsList
```

### SwipeableRecordItem (스와이프 기록 아이템)
```typescript
/**
 * 스와이프 제스처를 지원하는 기록 아이템
 * 모바일에서 빠른 액션을 위한 컴포넌트
 */
interface SwipeableRecordItemProps {
  record: CoffeeRecord
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
}

const SwipeableRecordItem: React.FC<SwipeableRecordItemProps> = ({
  record,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [showActions, setShowActions] = useState(false)
  const itemRef = useRef<HTMLDivElement>(null)
  
  // 스와이프 제스처 핸들러
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setShowActions(true),
    onSwipedRight: () => setShowActions(false),
    onSwiping: (eventData) => {
      const offset = Math.max(-120, Math.min(0, eventData.deltaX))
      setSwipeOffset(offset)
    },
    onSwipeEnd: () => {
      setSwipeOffset(0)
      if (Math.abs(swipeOffset) > 60) {
        setShowActions(true)
      }
    },
    trackMouse: true
  })
  
  // 외부 클릭 시 액션 숨기기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setShowActions(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  return (
    <div 
      ref={itemRef}
      className="swipeable-record-item relative overflow-hidden"
      {...swipeHandlers}
    >
      {/* 메인 콘텐츠 */}
      <div
        className="record-content bg-white border border-coffee-200 rounded-xl p-4 transition-transform"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onClick={onSelect}
      >
        <div className="flex items-center justify-between mb-2">
          <FluidText as="h3" size="base" weight="semibold">
            {record.coffeeName}
          </FluidText>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-amber-400 fill-current" />
            <span className="text-sm font-medium">{record.rating}</span>
          </div>
        </div>
        
        <FluidText as="p" size="sm" color="secondary" className="mb-2">
          {record.notes}
        </FluidText>
        
        <div className="flex items-center justify-between text-xs text-coffee-500">
          <span>{record.roaster}</span>
          <span>{new Date(record.date).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* 스와이프 액션 버튼들 */}
      <div className={`
        absolute right-0 top-0 h-full flex items-center space-x-2 px-4
        transition-all duration-300
        ${showActions ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <UnifiedButton
          size="sm"
          variant="ghost"
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={(e) => { e.stopPropagation(); onDuplicate() }}
        >
          <Copy className="h-4 w-4" />
        </UnifiedButton>
        
        <UnifiedButton
          size="sm"
          variant="ghost"
          className="bg-green-500 text-white hover:bg-green-600"
          onClick={(e) => { e.stopPropagation(); onEdit() }}
        >
          <Edit className="h-4 w-4" />
        </UnifiedButton>
        
        <UnifiedButton
          size="sm"
          variant="ghost"
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
        >
          <Trash className="h-4 w-4" />
        </UnifiedButton>
      </div>
    </div>
  )
}

export default SwipeableRecordItem
```

---

## 🎨 UI Foundation Layer 상세 설계

### FluidText (개선된 반응형 텍스트)
```typescript
/**
 * 완전히 반응형인 텍스트 컴포넌트
 * 모든 디바이스에서 최적의 가독성 제공
 */
interface FluidTextProps {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'hero' | 'display'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'inherit' | 'custom'
  customColor?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose' | 'custom'
  customLineHeight?: string | number
  responsive?: boolean
  clamp?: [string, string, string]
  truncate?: boolean
  balance?: boolean
  className?: string
}

const FluidText = memo(function FluidText({
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  color = 'primary',
  customColor,
  align = 'left',
  lineHeight = 'normal',
  customLineHeight,
  responsive = true,
  clamp,
  truncate = false,
  balance = false,
  className = ''
}: FluidTextProps) {
  const { 
    isHighDensity, 
    isReducedMotion, 
    isHighContrast, 
    respectsUserFontSize, 
    isHydrated 
  } = useResponsive()
  
  // 동적 스타일 계산
  const dynamicStyles = useMemo(() => {
    const styles: CSSProperties = {}
    
    // 커스텀 색상
    if (color === 'custom' && customColor) {
      styles.color = customColor
    }
    
    // 커스텀 행간
    if (lineHeight === 'custom' && customLineHeight) {
      styles.lineHeight = typeof customLineHeight === 'number' 
        ? customLineHeight 
        : customLineHeight
    }
    
    // 커스텀 clamp
    if (clamp) {
      styles.fontSize = `clamp(${clamp[0]}, ${clamp[1]}, ${clamp[2]})`
    }
    
    // 사용자 폰트 크기 설정 반영
    if (isHydrated && respectsUserFontSize && !clamp) {
      const baseFontSize = parseInt(getComputedStyle(document.documentElement).fontSize) || 16
      const scale = baseFontSize / 16
      
      if (scale !== 1) {
        styles.fontSize = `calc(var(--fluid-text-${size}) * ${scale})`
      }
    }
    
    // 고해상도 화면 폰트 스무딩
    if (isHydrated && isHighDensity) {
      styles.WebkitFontSmoothing = 'antialiased'
      styles.MozOsxFontSmoothing = 'grayscale'
    }
    
    return styles
  }, [
    color, customColor, lineHeight, customLineHeight, clamp,
    isHydrated, respectsUserFontSize, size, isHighDensity
  ])
  
  // 클래스명 조합
  const combinedClassName = useMemo(() => [
    // 기본 크기 (responsive에 따라 fluid 또는 static)
    responsive ? `fluid-text-${size}` : `text-${size}`,
    
    // 폰트 가중치
    `font-${weight}`,
    
    // 색상 (고대비 모드 고려)
    isHydrated && isHighContrast ? 'text-[CanvasText]' : 
    color !== 'custom' ? `text-coffee-${getColorValue(color)}` : '',
    
    // 정렬
    `text-${align}`,
    
    // 행간 (responsive에 따라 fluid 또는 static)
    responsive && lineHeight !== 'custom' ? 
      `leading-[var(--fluid-leading-${lineHeight})]` : 
      lineHeight !== 'custom' ? `leading-${lineHeight}` : '',
    
    // 기타 옵션들
    truncate && 'truncate',
    balance && 'text-balance',
    
    // 애니메이션 (reduced motion 고려)
    isHydrated && !isReducedMotion && 'fluid-transition-fast',
    
    // 고대비 모드
    isHydrated && isHighContrast && 'fluid-high-contrast',
    
    // 커스텀 클래스
    className
  ].filter(Boolean).join(' '), [
    responsive, size, weight, color, align, lineHeight,
    truncate, balance, isHydrated, isHighContrast, isReducedMotion, className
  ])
  
  return (
    <Component
      className={combinedClassName}
      style={dynamicStyles}
    >
      {children}
    </Component>
  )
})

// 색상 값 매핑 헬퍼 함수
function getColorValue(color: string): string {
  const colorMap = {
    primary: '800',
    secondary: '600',
    muted: '500',
    accent: '600',
    inherit: 'inherit'
  }
  return colorMap[color] || '800'
}

export default FluidText
```

---

## 🔧 Utility Layer 상세 설계

### ResponsiveProvider (반응형 컨텍스트)
```typescript
/**
 * 전체 앱의 반응형 상태를 관리하는 Context Provider
 * 모든 하위 컴포넌트에서 반응형 정보에 접근 가능
 */
interface ResponsiveContextValue {
  // 브레이크포인트 정보
  breakpoint: 'mobile' | 'tablet' | 'desktop'
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  
  // 화면 크기 정보
  width: number
  height: number
  
  // 디바이스 정보
  isHighDensity: boolean
  isTouch: boolean
  isLandscape: boolean
  
  // 접근성 정보
  isReducedMotion: boolean
  isHighContrast: boolean
  respectsUserFontSize: boolean
  
  // 기능 지원 여부
  supportsContainerQueries: boolean
  supportsViewportUnits: boolean
  
  // 상태 관리
  isHydrated: boolean
  
  // 안전 영역 (모바일)
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

const ResponsiveContext = createContext<ResponsiveContextValue | null>(null)

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [state, setState] = useState<ResponsiveContextValue>({
    breakpoint: 'mobile',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0,
    isHighDensity: false,
    isTouch: false,
    isLandscape: false,
    isReducedMotion: false,
    isHighContrast: false,
    respectsUserFontSize: false,
    supportsContainerQueries: false,
    supportsViewportUnits: false,
    isHydrated: false,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 }
  })
  
  // 초기 상태 설정 및 이벤트 리스너 등록
  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // 브레이크포인트 계산
      const breakpoint = 
        width >= 1024 ? 'desktop' :
        width >= 768 ? 'tablet' : 'mobile'
      
      // 디바이스 특성 감지
      const isHighDensity = window.devicePixelRatio > 1
      const isTouch = 'ontouchstart' in window
      const isLandscape = width > height
      
      // 접근성 설정 감지
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches
      const respectsUserFontSize = parseInt(getComputedStyle(document.documentElement).fontSize) !== 16
      
      // 기능 지원 여부 확인
      const supportsContainerQueries = 'container' in document.documentElement.style
      const supportsViewportUnits = CSS.supports('height', '100vh')
      
      // 안전 영역 계산 (CSS env() 값)
      const safeAreaInsets = {
        top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0,
        bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)')) || 0,
        left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)')) || 0,
        right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)')) || 0
      }
      
      setState({
        breakpoint,
        isMobile: breakpoint === 'mobile',
        isTablet: breakpoint === 'tablet',
        isDesktop: breakpoint === 'desktop',
        width,
        height,
        isHighDensity,
        isTouch,
        isLandscape,
        isReducedMotion,
        isHighContrast,
        respectsUserFontSize,
        supportsContainerQueries,
        supportsViewportUnits,
        isHydrated: true,
        safeAreaInsets
      })
    }
    
    // 초기 실행
    updateResponsiveState()
    
    // 이벤트 리스너 등록
    window.addEventListener('resize', updateResponsiveState)
    window.addEventListener('orientationchange', updateResponsiveState)
    
    // 접근성 설정 변경 감지
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    reducedMotionQuery.addEventListener('change', updateResponsiveState)
    highContrastQuery.addEventListener('change', updateResponsiveState)
    
    return () => {
      window.removeEventListener('resize', updateResponsiveState)
      window.removeEventListener('orientationchange', updateResponsiveState)
      reducedMotionQuery.removeEventListener('change', updateResponsiveState)
      highContrastQuery.removeEventListener('change', updateResponsiveState)
    }
  }, [])
  
  return (
    <ResponsiveContext.Provider value={state}>
      {children}
    </ResponsiveContext.Provider>
  )
}

// 커스텀 훅
export function useResponsive(): ResponsiveContextValue {
  const context = useContext(ResponsiveContext)
  
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider')
  }
  
  return context
}

export default ResponsiveProvider
```

---

## 📋 컴포넌트 통합 가이드

### 컴포넌트 조합 예시
```typescript
// 페이지 레벨 컴포넌트에서의 조합
const DashboardPage = () => {
  return (
    <ResponsiveLayout>
      <div className="dashboard-page">
        {/* 헤더는 ResponsiveLayout 내부에서 자동 처리 */}
        
        {/* 메인 콘텐츠 */}
        <FluidContainer maxWidth="full" className="p-4">
          <FluidText as="h1" size="3xl" weight="bold" className="mb-6">
            커피 대시보드
          </FluidText>
          
          {/* 통계 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatsCard title="총 기록" value="147" trend="+12%" />
            <StatsCard title="평균 평점" value="4.2" trend="+0.3" />
            <StatsCard title="이번 달" value="23" trend="+5" />
          </div>
          
          {/* 기록 리스트 */}
          <RecordsList
            records={records}
            loading={loading}
            showBatchSelect={!isMobile}
            onRecordSelect={handleRecordSelect}
          />
        </FluidContainer>
        
        {/* 네비게이션은 ResponsiveLayout 내부에서 자동 처리 */}
      </div>
    </ResponsiveLayout>
  )
}
```

### 컴포넌트 테스트 전략
```typescript
// 반응형 컴포넌트 테스트 유틸리티
export const renderWithResponsive = (
  ui: React.ReactElement,
  breakpoint: 'mobile' | 'tablet' | 'desktop' = 'mobile'
) => {
  const mockResponsiveValue = {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    width: breakpoint === 'mobile' ? 375 : breakpoint === 'tablet' ? 768 : 1440,
    height: breakpoint === 'mobile' ? 667 : breakpoint === 'tablet' ? 1024 : 900,
    // ... 기타 필요한 값들
  }
  
  return render(
    <ResponsiveContext.Provider value={mockResponsiveValue}>
      {ui}
    </ResponsiveContext.Provider>
  )
}

// 컴포넌트별 테스트
describe('RecordsList', () => {
  test('모바일에서 리스트 뷰로 렌더링', () => {
    renderWithResponsive(<RecordsList records={mockRecords} />, 'mobile')
    expect(screen.getByTestId('mobile-list-view')).toBeInTheDocument()
  })
  
  test('태블릿에서 그리드 뷰로 렌더링', () => {
    renderWithResponsive(<RecordsList records={mockRecords} />, 'tablet')
    expect(screen.getByTestId('tablet-grid-view')).toBeInTheDocument()
  })
  
  test('데스크탑에서 테이블 뷰로 렌더링', () => {
    renderWithResponsive(<RecordsList records={mockRecords} />, 'desktop')
    expect(screen.getByTestId('desktop-table-view')).toBeInTheDocument()
  })
})
```

---

*문서 버전: v2.0 | 최종 수정: 2024-08-04 | 담당: 아키텍처팀*