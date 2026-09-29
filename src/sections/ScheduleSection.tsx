import { useState } from 'react';
import { BookOpen, CalendarDays, Clock3, MapPin } from 'lucide-react';
import { SectionHeading } from '../components/SectionHeading';
import { classSchedule, weekDays } from '../data/siteData';

const todayIndex = new Date().getDay();
const defaultDay = todayIndex >= 1 && todayIndex <= 5 ? weekDays[todayIndex - 1].name : 'Senin';

export function ScheduleSection() {
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const classes = classSchedule[selectedDay] ?? [];

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

        <div className="schedule-toolbar">
          <div className="schedule-day-tabs" role="tablist" aria-label="Pilih hari jadwal kuliah">
            {weekDays.map((day) => (
              <button
                key={day.name}
                type="button"
                role="tab"
                aria-selected={selectedDay === day.name}
                data-hint={`Klik untuk menampilkan jadwal hari ${day.name}.`}
                className={`schedule-day-tab${selectedDay === day.name ? ' active' : ''}`}
                onClick={() => setSelectedDay(day.name)}
              >
                <span>{day.short}</span><strong>{day.name}</strong>
              </button>
            ))}
          </div>
          <span className="schedule-sample-note">KELAS REG · SEMESTER I</span>
        </div>

        <div className="schedule-board">
          <aside className="schedule-overview">
            <span className="schedule-overview-icon"><BookOpen size={19} /></span>
            <span className="schedule-overview-label">JADWAL HARI INI</span>
            <h3>{selectedDay}<span>.</span></h3>
            <p>{classes.length ? `${classes.length} mata kuliah terjadwal. Datang lebih awal, siap belajar.` : 'Belum ada mata kuliah yang dijadwalkan.'}</p>
            <div className="schedule-day-count"><strong>{String(classes.length).padStart(2, '0')}</strong><span>KELAS<br />TERJADWAL</span></div>
            <div className="schedule-overview-foot"><Clock3 size={13} /> Waktu lokal · WIB</div>
          </aside>

          <div className="schedule-list" role="tabpanel" aria-label={`Jadwal mata kuliah hari ${selectedDay}`}>
            {classes.length ? classes.map((item, index) => (
              <article className="course-row" key={`${selectedDay}-${item.start}-${item.name}`}>
                <div className="course-time"><strong>{item.start}</strong><span>{item.end}</span></div>
                <div className="course-timeline"><i className={index === 0 ? 'timeline-dot first' : 'timeline-dot'} /><span /></div>
                <div className="course-detail">
                  <div className="course-detail-top"><span className={`course-type ${item.type === 'Praktikum' ? 'practical' : ''}`}>{item.type}</span><span className="course-duration">{item.duration}</span></div>
                  <h4>{item.name}</h4>
                  <span className="course-location"><MapPin size={13} />{item.room}</span>
                </div>
              </article>
            )) : <div className="schedule-empty"><CalendarDays size={22} /><p>Hari ini belum ada kelas.<br /><span>Waktunya istirahat atau mengejar tugas.</span></p></div>}
          </div>
        </div>
        <p className="schedule-disclaimer">Perkuliahan dimulai Oktober 2026. Jumlah total 19 SKS.</p>
      </div>
    </section>
  );
}
