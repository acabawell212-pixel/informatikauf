import { CalendarDays } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { scheduleCourses, scheduleInfo } from '../data/siteData';

const totalSks = scheduleCourses.reduce((sum, item) => sum + item.sks, 0);

export function ScheduleSection() {
  return (
    <section className="section schedule-section" id="schedule">
      <div className="wrap">
        <div className="section-row schedule-heading-row">
          <SectionHeading
            eyebrow="JADWAL PERKULIAHAN"
            title={<>Atur minggu,<br /><span>fokuskan belajar.</span></>}
            description="Cek jadwal mata kuliah dan siapkan kelas berikutnya tanpa buru-buru."
          />
          <div className="semester-card">
            <CalendarDays size={17} />
            <span><small>PERIODE AKADEMIK</small><strong>Ganjil · 2026/2027</strong></span>
          </div>
        </div>

        <div className="jt-card">
          <div className="jt-head">
            <h3>{scheduleInfo.title}</h3>
            <p>{scheduleInfo.className} · {scheduleInfo.semester}</p>
            <span>{scheduleInfo.start}</span>
          </div>
          <div className="jt-scroll">
            <table className="jt-table">
              <thead>
                <tr>
                  <th>No</th><th>Kode MK</th><th>Mata Kuliah</th><th>SKS</th>
                  <th>Koordinator</th><th>Pengajar</th><th>Waktu</th><th>Ruangan</th>
                </tr>
              </thead>
              <tbody>
                {scheduleCourses.map((c) => (
                  <tr key={c.code}>
                    <td data-label="No">{c.no}</td>
                    <td data-label="Kode MK" className="jt-code">{c.code}</td>
                    <td data-label="Mata Kuliah" className="jt-course">{c.course}</td>
                    <td data-label="SKS">{c.sks}</td>
                    <td data-label="Koordinator">{c.coordinator}</td>
                    <td data-label="Pengajar">{c.lecturers.map((l) => <div key={l}>{l}</div>)}</td>
                    <td data-label="Waktu" className="jt-time">{c.time}</td>
                    <td data-label="Ruangan"><span className={`jt-room${c.room === 'Daring' ? ' online' : ''}`}>{c.room}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3}>Jumlah SKS</td><td>{totalSks}</td><td colSpan={4} /></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
