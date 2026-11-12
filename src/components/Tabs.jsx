export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === active}
          className="tab"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count !== '' && <span className="tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
