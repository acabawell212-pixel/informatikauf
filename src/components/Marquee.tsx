const rowOne = ['BUILD', 'CREATE', 'INNOVATE', 'ALGORITMA', 'REACT', 'PYTHON', 'DATA', 'AI', 'WEB', 'CLOUD', 'UI/UX', 'OPEN SOURCE'];
const rowTwo = ['FALETEHAN', 'KOMUNITAS', 'BELAJAR', 'BERKARYA', 'BERTUMBUH', 'CODING NIGHT', 'HACKATHON', 'SHARING', 'PROJECT', 'KOLABORASI'];

function Row({ words, reverse }: { words: string[]; reverse?: boolean }) {
  const track = [...words, ...words];
  return (
    <div className={`marquee-row${reverse ? ' is-reverse' : ''}`}>
      <div className="marquee-track">
        {track.map((word, index) => (
          <span className="marquee-item" key={`${word}-${index}`}>{word}<i aria-hidden="true">✦</i></span>
        ))}
      </div>
    </div>
  );
}

/** Pita teks berjalan di antara hero dan section berikutnya. */
export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-band">
        <Row words={rowOne} />
        <Row words={rowTwo} reverse />
      </div>
    </div>
  );
}
