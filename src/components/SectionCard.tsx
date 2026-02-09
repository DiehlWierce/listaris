import type { ReactNode } from 'react'

type SectionCardProps = {
  title: string
  description?: string
  children?: ReactNode
  accent?: boolean
}

const SectionCard = ({ title, description, children, accent }: SectionCardProps) => (
  <div className={`section-card${accent ? ' section-card--accent' : ''}`}>
    <div className="section-card__header">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
    {children && <div className="section-card__body">{children}</div>}
  </div>
)

export default SectionCard
