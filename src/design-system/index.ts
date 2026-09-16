// ==============================================================================
// FASE 29.14.1.3.1 — COMPONENTES BASE UNIVERSAIS KOMPOSO / DISK
// Ponto Central de Exportação do Design System Disk
// ==============================================================================

// Tokens & Estilos
import './tokens/tokens.css'

// Tipos & Constantes de Tema
export * from './themes/theme.types'
export * from './themes/theme.constants'
export * from './themes/chart-theme'
export * from './utils/formatters'

// Provedores & Hooks
export { ThemeProvider, ThemeContext } from './providers/ThemeProvider'
export { useTheme } from './hooks/useTheme'

// Alternadores de Tema
export { ThemeSwitcher } from './components/ThemeSwitcher'
export { ThemeToggleCompact } from './components/ThemeToggleCompact'

// Biblioteca Universal de Componentes Disk
export {
  DiskCard,
  DiskCardHeader,
  DiskCardContent,
  DiskCardFooter,
  DiskCardTitle,
  DiskCardDescription,
  type DiskCardProps,
  type CardVariant,
  type CardPadding,
} from './components/Card/DiskCard'

export {
  DiskKpiCard,
  type DiskKpiCardProps,
  type KpiTrendDirection,
  type KpiTrendStatus,
  type KpiAccent,
} from './components/Card/DiskKpiCard'

export {
  DiskDataTable,
  type DiskDataTableProps,
  type ColumnDef,
  type TableDensity,
  type ResponsiveStrategy,
} from './components/DataTable/DiskDataTable'

export {
  DiskInput,
  type DiskInputProps,
} from './components/Form/DiskInput'

export {
  DiskSelect,
  type DiskSelectProps,
  type SelectOption,
} from './components/Form/DiskSelect'

export {
  DiskSegmentedControl,
  type DiskSegmentedControlProps,
  type SegmentOption,
} from './components/Form/DiskSegmentedControl'

export {
  DiskFormField,
  type DiskFormFieldProps,
} from './components/Form/DiskFormField'

export {
  DiskFilterBar,
  type DiskFilterBarProps,
  type ActiveFilterChip,
} from './components/FilterBar/DiskFilterBar'

export {
  DiskTabs,
  type DiskTabsProps,
  type TabItem,
  type TabsVariant,
} from './components/Tabs/DiskTabs'

export {
  DiskBadge,
  type DiskBadgeProps,
  type BadgeVariant,
  type BadgeSize,
  DiskStatus,
  type DiskStatusProps,
} from './components/Badge/DiskBadge'

export {
  DiskModal,
  type DiskModalProps,
  type ModalSize,
  DiskDrawer,
  type DiskDrawerProps,
} from './components/Overlay/DiskModal'

export {
  DiskEmptyState,
  type DiskEmptyStateProps,
  DiskSkeleton,
  type DiskSkeletonProps,
  type SkeletonVariant,
} from './components/Feedback/DiskEmptyState'

export {
  DiskToolbar,
  type DiskToolbarProps,
} from './components/Toolbar/DiskToolbar'

export {
  DiskChartContainer,
  type DiskChartContainerProps,
  type ChartLegendItem,
} from './components/Chart/DiskChartContainer'

export {
  DiskPageHeader,
  type DiskPageHeaderProps,
  DiskSectionHeader,
  type DiskSectionHeaderProps,
} from './components/Page/DiskPageHeader'

export {
  DiskButton,
  type DiskButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from './components/Button/DiskButton'
