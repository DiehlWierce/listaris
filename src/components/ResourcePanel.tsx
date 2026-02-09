import './ResourcePanel.css'

export type ResourceItem = {
  id: string
  label: string
  value: string
  hint?: string
}

type ResourcePanelProps = {
  items: ResourceItem[]
}

const ResourcePanel = ({ items }: ResourcePanelProps) => (
  <div className="resources-panel">
    {items.map((item) => (
      <div className="resource-item" key={item.id}>
        <div className="resource-label">{item.label}</div>
        <div className="resource-value">{item.value}</div>
        {item.hint && <div className="resource-hint">{item.hint}</div>}
      </div>
    ))}
  </div>
)

export default ResourcePanel
