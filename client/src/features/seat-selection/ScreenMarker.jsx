const ScreenMarker = () => {
  return (
    <div className="w-100 d-flex flex-column align-items-center my-4" aria-hidden="true">
      {/* BMS Curved Screen Arch (Screenshot 23: All eyes this way please) */}
      <div
        style={{
          width: '70%',
          maxWidth: '420px',
          height: '4px',
          backgroundColor: '#009688',
          borderRadius: '2px',
          boxShadow: '0 2px 8px rgba(0, 150, 136, 0.4)'
        }}
      />
      <span
        className="mt-2 text-uppercase fw-semibold"
        style={{
          fontSize: '10px',
          color: '#888888',
          letterSpacing: '2px'
        }}
      >
        All eyes this way please!
      </span>
    </div>
  );
};

export default ScreenMarker;
