const SeatLegend = () => {
  return (
    <div
      className="d-flex flex-wrap justify-content-center align-items-center gap-4 py-3 px-4 bg-white rounded-2 border mt-4 shadow-sm"
      role="region"
      aria-label="Seat Legend"
    >
      {/* Available */}
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--bms-success)'
          }}
        />
        <span className="small text-muted fw-medium" style={{ fontSize: '12px' }}>
          Available
        </span>
      </div>

      {/* Selected */}
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            backgroundColor: 'var(--bms-selected)',
            border: '1px solid var(--bms-selected)'
          }}
        />
        <span className="small text-muted fw-medium" style={{ fontSize: '12px' }}>
          Selected
        </span>
      </div>

      {/* Sold */}
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            backgroundColor: '#E8E8E8',
            border: '1px solid #E8E8E8'
          }}
        />
        <span className="small text-muted fw-medium" style={{ fontSize: '12px' }}>
          Sold
        </span>
      </div>

      {/* Bestseller */}
      <div className="d-flex align-items-center gap-2">
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--bms-warning)'
          }}
        />
        <span className="small text-muted fw-medium" style={{ fontSize: '12px' }}>
          Bestseller
        </span>
      </div>
    </div>
  );
};

export default SeatLegend;
