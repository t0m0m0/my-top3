import SearchIcon from '@mui/icons-material/Search'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ShareIcon from '@mui/icons-material/Share'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const steps = [
  { number: '1', label: '検索する', icon: SearchIcon },
  { number: '2', label: '3つ選ぶ', icon: CheckCircleOutlineIcon },
  { number: '3', label: 'シェアする', icon: ShareIcon },
] as const

export default function StepGuide() {
  return (
    <ol
      aria-label="使い方ステップ"
      className="flex items-center justify-center gap-2 sm:gap-4"
    >
      {steps.map((step, i) => {
        const Icon = step.icon
        return (
          <li key={step.number} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full sm:h-12 sm:w-12"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}
              >
                <Icon
                  sx={{ color: '#fff', fontSize: { xs: 20, sm: 24 } }}
                  aria-hidden
                />
              </div>
              <span
                className="text-xs font-bold sm:text-sm"
                style={{ color: '#fff' }}
              >
                {step.number}
              </span>
              <span
                className="text-xs sm:text-sm"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <ArrowForwardIcon
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: { xs: 16, sm: 20 },
                }}
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
